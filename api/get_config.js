const { getConfig } = require("./_store");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const cfg = await getConfig();
  return res.status(200).json(cfg);
};
