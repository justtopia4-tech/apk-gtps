const { saveConfig } = require("./_store");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!data.server || !data.port) {
      return res.status(400).json({ success: false, message: "Server IP and Port are required." });
    }

    const result = await saveConfig(data);
    return res.status(200).json({
      success: true,
      message: result.warning || "Konfigurasi server berhasil disimpan!",
      warning: result.warning
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
