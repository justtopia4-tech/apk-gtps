// Shared store & GitHub persistence helper
let fileConfig = {};
try {
  fileConfig = require("../config.json");
} catch (e) {
  // fallback if file not found
}

let memConfig = {
  server: "127.0.0.1",
  port: "17091",
  loginurl: "supergt.vercel.app",
  meta: "supergt",
  type2: "1",
  maint: "",
  ...fileConfig
};

const DEFAULT_REPO = "justtopia4-tech/apk-gtps";
const DEFAULT_BRANCH = "main";

async function getConfig() {
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH;
  const token = process.env.GITHUB_TOKEN;

  if (repo) {
    try {
      const headers = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "supergt-app"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`https://api.github.com/repos/${repo}/contents/config.json?ref=${branch}&t=${Date.now()}`, {
        headers
      });
      if (res.ok) {
        const data = await res.json();
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        memConfig = { ...memConfig, ...JSON.parse(content) };
      }
    } catch (err) {
      console.error("Error fetching config from GitHub:", err.message);
    }
  }

  return memConfig;
}

async function saveConfig(newConfig, customToken) {
  const { token: tokenFromReq, ...cleanConfig } = newConfig;
  memConfig = { ...memConfig, ...cleanConfig };

  const token = customToken || tokenFromReq || process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH;

  if (!token) {
    return {
      success: false,
      needsToken: true,
      message: "GitHub Token belum diisi atau belum terdaftar."
    };
  }

  try {
    // Get existing file sha first
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

    // Commit update
    const fileToSave = {
      server: memConfig.server,
      port: memConfig.port,
      loginurl: memConfig.loginurl,
      meta: memConfig.meta,
      type2: memConfig.type2,
      maint: memConfig.maint
    };

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
        message: "Update GTPS config from web panel",
        content: contentBase64,
        sha: sha || undefined,
        branch: branch
      })
    });

    if (!putRes.ok) {
      const errJson = await putRes.json().catch(() => ({}));
      return {
        success: false,
        message: "Gagal commit ke GitHub: " + (errJson.message || putRes.statusText)
      };
    }

    return {
      success: true,
      message: "Konfigurasi server berhasil disimpan secara permanen ke GitHub!"
    };
  } catch (err) {
    return {
      success: false,
      message: "GitHub error: " + err.message
    };
  }
}

module.exports = {
  getConfig,
  saveConfig
};
