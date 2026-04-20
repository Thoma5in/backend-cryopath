import {
  getRates,
  createShipment,
  trackShipment,
  getLabel,
} from "../services/envia.service.js";

const rates = async (req, res) => {
  try {
    const payload = req.body;
    const data = await getRates(payload);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(err.status || 502).json({ ok: false, error: err });
  }
};

const create = async (req, res) => {
  try {
    const payload = req.body;
    const idempotencyKey = req.headers["idempotency-key"] || null;
    const data = await createShipment(payload, idempotencyKey);
    res.status(201).json({ ok: true, data });
  } catch (err) {
    res.status(err.status || 502).json({ ok: false, error: err });
  }
};

const track = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await trackShipment(id);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(err.status || 502).json({ ok: false, error: err });
  }
};

const label = async (req, res) => {
  try {
    const { id } = req.params;
    const format = req.query.format || "pdf";
    const data = await getLabel(id, format);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(err.status || 502).json({ ok: false, error: err });
  }
};

export { rates, create, track, label };
