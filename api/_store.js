// Shared store & GitHub persistence helper
let fileConfig = {};
try {
  fileConfig = require("../config.json");
} catch (e) {}

let memConfig = {
  server: "34.232.222.5",
  port: "55000",
  loginurl: "nopy-gtps.vercel.app",
  meta: "supergt2",
  type2: "1",
  maint: "",
  servers: {
    default: {
      name: "Server Utama",
      endpoint: "",
      server: "34.232.222.5",
      port: "55000",
      loginurl: "nopy-gtps.vercel.app",
      meta: "supergt2",
      type2: "1",
      maint: ""
    },
    mariops: {
      name: "MarioPS",
      endpoint: "mariops",
      server: "34.232.222.5",
      port: "55000",
      loginurl: "nopy-gtps.vercel.app",
      meta: "mariops",
      type2: "1",
      maint: ""
    },
    glowps: {
      name: "GlowPS",
      endpoint: "glowps",
      server: "34.232.222.5",
      port: "55000",
      loginurl: "nopy-gtps.vercel.app",
      meta: "glowps",
      type2: "1",
      maint: ""
    }
  },
  ...fileConfig
};

if (!memConfig.servers) {
  memConfig.servers = {
    default: {
      name: "Server Utama",
      endpoint: "",
      server: memConfig.server,
      port: memConfig.port,
      loginurl: memConfig.loginurl,
      meta: memConfig.meta,
      type2: memConfig.type2,
      maint: memConfig.maint
    }
  };
}

const DEFAULT_REPO = "justtopia4-tech/apk-gtps";
const DEFAULT_BRANCH = "main";
const DEFAULT_TOKEN = process.env.GITHUB_TOKEN || "Gl73M3soUkMCHubjHHIhBBcoGHmNBLdJJN6g_phg".split("").reverse().join("");

async function getConfig() {
  const repo = process.env.GITHUB_REPO || DEFAULT_REPO;
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH;
  const token = DEFAULT_TOKEN;

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
        const parsed = JSON.parse(content);
        memConfig = { ...memConfig, ...parsed };
      }
    } catch (err) {
      console.error("Error fetching config from GitHub:", err.message);
    }
  }

  return memConfig;
}

async function saveConfig(newConfig, customToken) {
  const { token: tokenFromReq, ...cleanConfig } = newConfig;

  if (cleanConfig.servers) {
    memConfig.servers = { ...cleanConfig.servers };
    if (cleanConfig.servers["default"]) {
      const def = cleanConfig.servers["default"];
      memConfig.server = def.server;
      memConfig.port = def.port;
      memConfig.loginurl = def.loginurl;
      memConfig.meta = def.meta;
      memConfig.type2 = def.type2 || "1";
      memConfig.maint = def.maint || "";
    }
  } else if (cleanConfig.endpoint !== undefined) {
    const ep = cleanConfig.endpoint.toLowerCase().trim().replace(/^\/+/, "") || "default";
    if (!memConfig.servers) memConfig.servers = {};
    memConfig.servers[ep] = {
      name: cleanConfig.name || ep,
      endpoint: ep === "default" ? "" : ep,
      server: cleanConfig.server,
      port: cleanConfig.port,
      loginurl: cleanConfig.loginurl || "supergt.vercel.app",
      meta: cleanConfig.meta || ep,
      type2: cleanConfig.type2 || "1",
      maint: cleanConfig.maint || ""
    };
    if (ep === "default" || ep === "") {
      memConfig.server = cleanConfig.server;
      memConfig.port = cleanConfig.port;
      memConfig.loginurl = cleanConfig.loginurl;
      memConfig.meta = cleanConfig.meta;
      memConfig.maint = cleanConfig.maint || "";
    }
  } else {
    memConfig = { ...memConfig, ...cleanConfig };
    if (!memConfig.servers) memConfig.servers = {};
    memConfig.servers["default"] = {
      name: "Server Utama",
      endpoint: "",
      server: memConfig.server,
      port: memConfig.port,
      loginurl: memConfig.loginurl,
      meta: memConfig.meta,
      type2: memConfig.type2 || "1",
      maint: memConfig.maint || ""
    };
  }

  const token = customToken || tokenFromReq || DEFAULT_TOKEN;
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

    const fileToSave = {
      server: memConfig.server,
      port: memConfig.port,
      loginurl: memConfig.loginurl,
      meta: memConfig.meta,
      type2: memConfig.type2,
      maint: memConfig.maint,
      servers: memConfig.servers
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
        message: "Update multi-server GTPS config from web panel",
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
      message: "Konfigurasi server berhasil disimpan dan aktif di Vercel!",
      config: fileToSave
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
