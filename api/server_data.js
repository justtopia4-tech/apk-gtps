const { getConfig } = require("./_store");

module.exports = async function handler(req, res) {
  // Allow cross-origin if needed
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const cfg = await getConfig();

  // If maintenance message exists, send maintenance response
  if (cfg.maint && cfg.maint.trim().length > 0) {
    const maintBody = [
      `maint|${cfg.maint.trim()}`,
      `server|127.0.0.1`,
      `port|17091`,
      `type2|1`
    ].join("\n") + "\n";

    return res.status(200).send(maintBody);
  }

  // Normal server response for Growtopia client
  const lines = [
    `server|${cfg.server || "127.0.0.1"}`,
    `port|${cfg.port || "17091"}`,
    `type2|${cfg.type2 || "1"}`,
    `meta|${cfg.meta || "supergt"}`,
    `loginurl|${cfg.loginurl || "supergt.vercel.app"}`
  ];

  const body = lines.join("\n") + "\n";
  return res.status(200).send(body);
};
