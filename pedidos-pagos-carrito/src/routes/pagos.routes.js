import {Router} from 'express';
import { crearOrdenPaypal, capturarPagoPaypal} from '../controllers/pagos.controller.js';

const router = Router();

//Rutas para Paypal
router.post("/crear-paypal/:idOrden", crearOrdenPaypal);
router.post("/capturar/:paypalOrderId", capturarPagoPaypal);  


export default router;