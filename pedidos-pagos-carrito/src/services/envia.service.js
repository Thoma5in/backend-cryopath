import axios from "axios";
import { ENVIA_API_KEY, ENVIA_SANDBOX_BASE_URL } from "../config/envia.config.js";

const client = axios.create({
  baseURL: ENVIA_SANDBOX_BASE_URL,
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${ENVIA_API_KEY}`,
    "Content-Type": "application/json",
  },
});

async function getRates(payload) {
  try {
    const res = await client.post("/rates", payload);
    return res.data;
  } catch (err) {
    throw formatError(err);
  }
}

async function createShipment(payload, idempotencyKey) {
  try {
    const headers = {};
    if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
    const res = await client.post("/shipments", payload, { headers });
    return res.data;
  } catch (err) {
    throw formatError(err);
  }
}

async function trackShipment(shipmentId) {
  try {
    const res = await client.get(`/shipments/${shipmentId}`);
    return res.data;
  } catch (err) {
    throw formatError(err);
  }
}

async function getLabel(shipmentId, format = "pdf") {
  try {
    const res = await client.get(`/shipments/${shipmentId}/label`, {
      params: { format },
    });
    return res.data;
  } catch (err) {
    throw formatError(err);
  }
}

function formatError(err) {
  if (err.response) {
    const { status, data } = err.response;
    return { status, data, message: data?.message || "Envia API error" };
  }
  return { message: err.message || "Network error" };
}

export { getRates, createShipment, trackShipment, getLabel };
