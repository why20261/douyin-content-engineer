const { extractDouyinUrl } = require("./url");

function parseDouyinAweme(url) {
  const extracted = extractDouyinUrl(url);
  if (extracted) {
    if (
      /\/(video|note)\//i.test(extracted) ||
      /v\.douyin\.com\//i.test(extracted)
    ) {
      return extracted;
    }
    return null;
  }

  const s = String(url ?? "")
    .trim()
    .replace(/[^0-9a-zA-Z_-]/g, "");
  if (!s || !/^\d+$/.test(s)) {
    return null;
  }
  return s;
}

function assertCommentLimit(limit) {
  const n = Number(limit);
  if (!Number.isInteger(n) || n < 1 || n > 10000) {
    throw new Error(`评论数量 limit ${limit} 无效, 允许 1-10000 的整数`);
  }
  return n;
}

module.exports = {
  parseDouyinAweme,
  assertCommentLimit,
};
