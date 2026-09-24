const { saveConfig } = require("./_store");

const REQUIRED_PIN = "yamaha1_2";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-github-token, x-panel-pin");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const data = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

    // Verify PIN authorization
    const pin = (req.headers && req.headers["x-panel-pin"]) || data.pin;
    if (!pin || String(pin).trim() !== REQUIRED_PIN) {
      return res.status(401).json({
        success: false,
        message: "Akses Ditolak: PIN Keamanan salah atau belum dimasukkan!"
      });
    }

    const payload = {
      server: (data.server && String(data.server).trim()) || "104.64.205.247",
      port: (data.port && String(data.port).trim()) || "55000",
      loginurl: (data.loginurl && String(data.loginurl).trim()) || "nopy-gtps-nine.vercel.app",
      meta: data.meta !== undefined ? String(data.meta).trim() : "supergt2",
      type2: data.type2 !== undefined ? String(data.type2).trim() : "1",
      maint: data.maint !== undefined ? String(data.maint).trim() : ""
    };

    const token = req.headers["x-github-token"] || data.token;
    const result = await saveConfig(payload, token);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
