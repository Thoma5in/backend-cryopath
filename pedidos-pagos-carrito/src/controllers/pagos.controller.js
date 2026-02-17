import {supabase}  from "../config/supabase.js";
import axios from "axios"
import { getAccessToken } from "../config/paypal.js";
import app from "../app.js";
import { application } from "express";


const base = process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

//Crear orden en Paypal
export const crearOrdenPaypal = async (req, res) => {
    try {
        const {idOrden} = req.params

        //Obtener orden interna
        const {data: orden, error} = await supabase
        .from("orden")
        .select("*")
        .eq("id_orden", idOrden )
        .single()
        
        if (error || !orden) {
            return res.status(404).json({error: "Orden no encontrada"});
        }

        if (orden.estado !== "PENDIENTE") {
            return res.status(400).json({error: "Orden no está en estado pendiente. No válida para pago."});
        }

        

        //Obtener token de acceso
        const accessToken = await getAccessToken();

        //Crear orden en Paypal
        const response = await axios.post(`${base}/v2/checkout/orders`,{
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: Number(orden.total).toFixed(2)
                    },
                },
            ],
              application_context: {
                return_url: `${process.env.FRONT_URL}/pago-exitoso`,
                cancel_url: `${process.env.FRONT_URL}/pago-cancelado`,
                user_action: "PAY_NOW",
            },
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    )

    await supabase
        .from("orden")
        .update({paypal_order_id: response.data.id})
        .eq("id_orden", idOrden)

    const approveLink = response.data.links.find(
        (link) => link.rel === "approve"
    )?.href

    return res.json({
        paypalOrderId: response.data.id,
        approveUrl: approveLink,
    })

    } catch (error) {
        console.error("Error al crear orden en Paypal:", error.response?.data || error.message);
        res.status(500).json({error: error.response?.data || error.message});
    }
    
}

//Capturar pago en Paypal y actualizar BD
export const capturarPagoPaypal = async (req, res) => {
    try {
        const {paypalOrderId} = req.params
        const accessToken = await getAccessToken(); 

        //Capturar pago
        const response = await axios.post(
             `${base}/v2/checkout/orders/${paypalOrderId}/capture`,
             {},
             {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
             }
        )

        if (response.data.status !== "COMPLETED") {
            return res.status(400).json({error: "Pago no completado"});
        }

        const amount = response.data.purchase_units[0].payments.captures[0].amount.value;

        //Relacionar paypalOrderId con id_orden en orden
        const {data: orden, error} = await supabase
        .from("orden")
        .select("*")
        .eq("paypal_order_id", paypalOrderId)
        .single()

        //Insertar Pago
        await supabase
        .from("pago")
        .insert({
            id_orden: orden.id_orden,
            metodo: "paypal",
            monto: amount,
            estado: "aprobado",
        })

        //Actualizar estado de orden
        await supabase
        .from("orden")
        .update({estado: "PAGADA"})
        .eq("id_orden", orden.id_orden)

        //Descontar Inventario
        const {data: detalles} = await supabase
        .from("orden_detalle")
        .select("*")
        .eq("id_orden", orden.id_orden)

        for (const item of detalles) {
            await supabase.rpc("descontar_stock", {
                producto_id: item.id_producto,
                cantidad: item.cantidad,
            })
        }

        console.log("PaypalOrderId recibido:", paypalOrderId);
        console.log("Orden encontrada:", orden);

        res.json({message: "Pago capturado y orden actualizada exitosamente"});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Error al capturar pago en Paypal"});
    }
}
