const { saveConfig } = require("./_store");

const REQUIRED_PIN = "NOPYSOURCE#1000";

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
    const pin = req.headers["x-panel-pin"] || data.pin;
    if (!pin || String(pin).trim() !== REQUIRED_PIN) {
      return res.status(401).json({
        success: false,
        message: "Akses Ditolak: PIN Keamanan salah atau belum dimasukkan!"
      });
    }

    // Support both multi-server payload { servers: {...} } and single server { server, port }
    if (data.servers && typeof data.servers === "object" && Object.keys(data.servers).length > 0) {
      const keys = Object.keys(data.servers);
      const primary = data.servers["default"] || data.servers[keys[0]] || {};
      data.server = data.server || primary.server || "34.232.222.5";
      data.port = data.port || primary.port || "55000";
      data.loginurl = data.loginurl || primary.loginurl || "nopy-gtps.vercel.app";
      data.meta = data.meta || primary.meta || "supergt2";
    }

    // Default fallbacks so it never rejects valid requests
    data.server = (data.server && String(data.server).trim()) || "34.232.222.5";
    data.port = (data.port && String(data.port).trim()) || "55000";

    const token = req.headers["x-github-token"] || data.token;
    const result = await saveConfig(data, token);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
