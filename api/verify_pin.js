const REQUIRED_PIN = "yamaha1_2";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-panel-pin");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    let pin = req.headers ? req.headers["x-panel-pin"] : undefined;
    if (!pin && req.method === "POST") {
      const data = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      pin = data.pin;
    } else if (!pin && req.query && req.query.pin) {
      pin = req.query.pin;
    }

    if (pin && String(pin).trim() === REQUIRED_PIN) {
      return res.status(200).json({ success: true, message: "PIN Valid" });
    }

    return res.status(401).json({ success: false, message: "PIN Salah! Akses ditolak." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
