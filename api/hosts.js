const { getConfig } = require("./_store");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const cfg = await getConfig();
  const ip = (cfg.server || "104.64.205.247").trim();

  const lines = [
    `# GTPS Hosts Redirection`,
    `${ip} www.growtopia1.com`,
    `${ip} www.growtopia2.com`
  ];

  return res.status(200).send(lines.join("\n") + "\n");
};
