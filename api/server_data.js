const { getConfig } = require("./_store");

module.exports = async function handler(req, res) {
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
      `type|1`,
      `type2|1`,
      `RTENDMARKERBS1001`
    ].join("\n") + "\n";

    return res.status(200).send(maintBody);
  }

  // Server response for GTPS client
  const lines = [
    `server|${cfg.server || "104.64.205.247"}`,
    `port|${cfg.port || "55000"}`,
    `type|1`,
    `loginurl|${cfg.loginurl || "nopy-gtps-nine.vercel.app"}`,
    `type2|${cfg.type2 || "1"}`,
    `meta|${cfg.meta || "supergt2"}`,
    `RTENDMARKERBS1001`
  ];

  const body = lines.join("\n") + "\n";
  return res.status(200).send(body);
};
