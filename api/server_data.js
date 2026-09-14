const { getConfig } = require("./_store");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const cfg = await getConfig();

  // Determine endpoint from query param or URL path
  let endpoint = "";
  if (req.query && req.query.endpoint) {
    endpoint = req.query.endpoint.toLowerCase().trim().replace(/^\/+/, "");
  } else if (req.url) {
    const parsed = new URL(req.url, "http://localhost");
    const p = parsed.pathname.replace(/^\/+/, "");
    if (p && p !== "growtopia/server_data.php" && p !== "server_data.php" && !p.startsWith("api/") && !p.startsWith("panel") && !p.startsWith("login")) {
      endpoint = p.toLowerCase().trim();
    }
  }

  let serverData = null;
  if (endpoint && cfg.servers && cfg.servers[endpoint]) {
    serverData = cfg.servers[endpoint];
  } else if (cfg.servers && cfg.servers["default"]) {
    serverData = cfg.servers["default"];
  } else {
    serverData = cfg;
  }

  // If maintenance message exists, send maintenance response
  if (serverData.maint && serverData.maint.trim().length > 0) {
    const maintBody = [
      `maint|${serverData.maint.trim()}`,
      `server|127.0.0.1`,
      `port|17091`,
      `type|1`,
      `type2|1`,
      `RTENDMARKERBS1001`
    ].join("\n") + "\n";

    return res.status(200).send(maintBody);
  }

  // Normal server response matching official/VPS format
  const lines = [
    `server|${serverData.server || "127.0.0.1"}`,
    `port|${serverData.port || "17091"}`,
    `type|1`,
    `loginurl|${serverData.loginurl || "supergt.vercel.app"}`,
    `type2|${serverData.type2 || "1"}`,
    `meta|${serverData.meta || endpoint || "supergt"}`,
    `RTENDMARKERBS1001`
  ];

  const body = lines.join("\n") + "\n";
  return res.status(200).send(body);
};
