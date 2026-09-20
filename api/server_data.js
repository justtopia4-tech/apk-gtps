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

  // Strip trailing subpaths (e.g. "mariops/server_data.php" -> "mariops")
  if (endpoint.includes("/")) {
    endpoint = endpoint.split("/")[0].trim();
  }

  let serverData = null;
  if (endpoint && cfg.servers && cfg.servers[endpoint]) {
    serverData = cfg.servers[endpoint];
  } else if (cfg.servers && cfg.servers["default"]) {
    serverData = cfg.servers["default"];
  } else if (cfg.servers && cfg.servers["glowps"]) {
    serverData = cfg.servers["glowps"];
  } else if (cfg.servers && Object.values(cfg.servers).length > 0) {
    serverData = Object.values(cfg.servers)[0];
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
  // Note: meta is set to "-" (standard for NopySource / private servers to avoid crash/redirection)
  const lines = [
    `server|${serverData.server || "172.236.131.10"}`,
    `port|${serverData.port || "55000"}`,
    `type|1`,
    `#maint|Server active`,
    `loginurl|${serverData.loginurl || "nopy-gtps-nine.vercel.app"}`,
    `type2|1`,
    `meta|-`,
    `RTENDMARKERBS1001`
  ];

  const body = lines.join("\n") + "\n";
  return res.status(200).send(body);
};
