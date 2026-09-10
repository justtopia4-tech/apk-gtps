// Shared in-memory store & GitHub persistence helper
let memConfig = {
  server: "127.0.0.1",
  port: "17091",
  loginurl: "supergt.vercel.app",
  meta: "supergt",
  type2: "1",
  maint: ""
};

async function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // e.g. "username/supergt-panel"
  const branch = process.env.GITHUB_BRANCH || "main";

  if (token && repo) {
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/contents/config.json?ref=${branch}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "supergt-app"
        }
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

async function saveConfig(newConfig) {
  memConfig = { ...memConfig, ...newConfig };

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (token && repo) {
    try {
      // Get existing file sha first
      let sha = null;
      const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/config.json?ref=${branch}`, {
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
      const contentBase64 = Buffer.from(JSON.stringify(memConfig, null, 2)).toString("base64");
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
        const errJson = await putRes.json();
        return { success: true, warning: "Saved in memory, GitHub commit failed: " + (errJson.message || "") };
      }
    } catch (err) {
      return { success: true, warning: "Saved in memory, GitHub error: " + err.message };
    }
  }

  return { success: true };
}

module.exports = {
  getConfig,
  saveConfig
};
