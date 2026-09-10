const http = require("http");
const fs = require("fs");
const path = require("path");

const serverDataHandler = require("./api/server_data");
const getConfigHandler = require("./api/get_config");
const saveConfigHandler = require("./api/save_config");

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Emulate Vercel req/res helper methods
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };
  res.json = function (data) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  res.send = function (data) {
    res.end(data);
  };

  // Route: /growtopia/server_data.php and /server_data.php
  if (pathname === "/growtopia/server_data.php" || pathname === "/server_data.php") {
    return serverDataHandler(req, res);
  }

  // Route: /api/get_config
  if (pathname === "/api/get_config") {
    return getConfigHandler(req, res);
  }

  // Route: /api/save_config
  if (pathname === "/api/save_config") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      req.body = body;
      return saveConfigHandler(req, res);
    });
    return;
  }

  // Static: /panel or /panel/
  if (pathname === "/panel" || pathname === "/panel/") {
    const filePath = path.join(__dirname, "public", "panel", "index.html");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return fs.createReadStream(filePath).pipe(res);
  }

  // Static: Root
  if (pathname === "/") {
    const filePath = path.join(__dirname, "public", "index.html");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return fs.createReadStream(filePath).pipe(res);
  }

  // 404
  res.status(404).json({ error: "Not Found" });
});

server.listen(PORT, () => {
  console.log(`[SuperGT] Local development server running at http://localhost:${PORT}`);
  console.log(`[SuperGT] Panel URL: http://localhost:${PORT}/panel`);
  console.log(`[SuperGT] GTPS Endpoint: http://localhost:${PORT}/growtopia/server_data.php`);
});
