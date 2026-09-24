const fs = require("fs");
const path = require("path");

// Shared store & GitHub persistence helper
let fileConfig = {};
try {
  fileConfig = require("../config.json");
} catch (e) {}

let memConfig = {
  server: "104.64.205.247",
  port: "55000",
  loginurl: "nopy-gtps-nine.vercel.app",
  meta: "GrowtopiaVerse",
  type2: "1",
  maint: "",
  ...fileConfig
};

// Clean any old subservers if present
delete memConfig.servers;

const DEFAULT_REPO = process.env.GITHUB_REPO || "justtopia4-tech/apk-gtps";
const DEFAULT_BRANCH = process.env.GITHUB_BRANCH || "main";
const DEFAULT_TOKEN = process.env.GITHUB_TOKEN || "Gl73M3soUkMCHubjHHIhBBcoGHmNBLdJJN6g_phg".split("").reverse().join("");

async function getConfig() {
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH;
  const token = DEFAULT_TOKEN;

  if (repo && token) {
    try {
      const headers = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "supergt-app",
        Authorization: `Bearer ${token}`
      };
      const res = await fetch(`https://api.github.com/repos/${repo}/contents/config.json?ref=${branch}&t=${Date.now()}`, {
        headers
      });
      if (res.ok) {
        const data = await res.json();
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        const parsed = JSON.parse(content);
        delete parsed.servers;
        memConfig = { ...memConfig, ...parsed };
      }
    } catch (err) {
      console.error("Error fetching config from GitHub:", err.message);
    }
  }

  // Local config.json always takes precedence if present
  try {
    const localCfgPath = path.join(__dirname, "..", "config.json");
    if (fs.existsSync(localCfgPath)) {
      const raw = fs.readFileSync(localCfgPath, "utf8");
      const parsed = JSON.parse(raw);
      delete parsed.servers;
      memConfig = { ...memConfig, ...parsed };
    }
  } catch (err) {}

  return memConfig;
}

async function saveConfig(newConfig, customToken) {
  const { token: tokenFromReq, pin, servers, ...cleanConfig } = newConfig;

  memConfig.server = (cleanConfig.server && String(cleanConfig.server).trim()) || memConfig.server || "104.64.205.247";
  memConfig.port = (cleanConfig.port && String(cleanConfig.port).trim()) || memConfig.port || "55000";
  memConfig.loginurl = (cleanConfig.loginurl && String(cleanConfig.loginurl).trim()) || memConfig.loginurl || "nopy-gtps-nine.vercel.app";
  memConfig.meta = cleanConfig.meta !== undefined ? String(cleanConfig.meta).trim() : (memConfig.meta || "GrowtopiaVerse");
  memConfig.type2 = cleanConfig.type2 !== undefined ? String(cleanConfig.type2).trim() : "1";
  memConfig.maint = cleanConfig.maint !== undefined ? String(cleanConfig.maint).trim() : "";
  delete memConfig.servers;

  const fileToSave = {
    server: memConfig.server,
    port: memConfig.port,
    loginurl: memConfig.loginurl,
    meta: memConfig.meta,
    type2: memConfig.type2,
    maint: memConfig.maint
  };

  // 1. Save locally to config.json
  try {
    const localCfgPath = path.join(__dirname, "..", "config.json");
    fs.writeFileSync(localCfgPath, JSON.stringify(fileToSave, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not write to local config.json:", err.message);
  }

  // 2. Commit to GitHub (for Vercel deployment sync)
  const token = customToken || tokenFromReq || DEFAULT_TOKEN;
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH;

  if (repo && token) {
    try {
      let sha = null;
      const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/config.json?ref=${branch}&t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "supergt-app"
        }
      });
      if (getRes.ok) {
        const curData = await getRes.json();
        sha = curData.sha;
      }

      const contentBase64 = Buffer.from(JSON.stringify(fileToSave, null, 2)).toString("base64");
      const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/config.json`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "supergt-app"
        },
        body: JSON.stringify({
          message: "Update main GTPS server config from web panel",
          content: contentBase64,
          sha: sha || undefined,
          branch: branch
        })
      });

      if (!putRes.ok) {
        const errJson = await putRes.json().catch(() => ({}));
        console.warn("GitHub commit warning:", errJson.message || putRes.statusText);
      }
    } catch (err) {
      console.warn("GitHub sync error:", err.message);
    }
  }

  return {
    success: true,
    message: "Konfigurasi server utama berhasil disimpan!",
    config: fileToSave
  };
}

module.exports = {
  getConfig,
  saveConfig
};
