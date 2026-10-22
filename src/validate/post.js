const { extractDouyinUrl } = require("./url");

function parseDouyinUser(url) {
  const extracted = extractDouyinUrl(url);
  if (extracted) {
    if (/\/user\//i.test(extracted) || /v\.douyin\.com\//i.test(extracted)) {
      return extracted;
    }
    return null;
  }

  const s = String(url ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "");
  if (!s) return null;
  if (!/^MS4wLjA/.test(s)) {
    return null;
  }
  return s;
}

function assertPostLimit(limit) {
  const n = Number(limit);
  if (!Number.isInteger(n) || n < 0 || n > 10000) {
    throw new Error(`作品数量 limit ${limit} 无效, 允许 0-10000 的整数`);
  }
  return n;
}

module.exports = {
  parseDouyinUser,
  assertPostLimit,
};
