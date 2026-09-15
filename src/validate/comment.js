const utils = require("../utils/utils");

const DOUYIN_URL_RE =
  /(?:https?:\/\/)?(?:www\.|v\.)?(?:douyin\.com|iesdouyin\.com)\/[^\s"'<>`\u4e00-\u9fff，。！？、；：（）【】]+/i;

function extractDouyinUrl(raw) {
  if (typeof raw !== "string") return null;
  const m = raw.match(DOUYIN_URL_RE);
  if (!m) return null;

  let url = m[0];
  url = url.split("?")[0].split("#")[0];
  url = url.replace(/[\/.,;:!?"'，。！？；：、）】》]+$/g, "");
  return url || null;
}

function douyinPostUrl(url) {
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

function optionFormat(limit) {
  limit = Number(limit);
  if (!Number.isFinite(limit)) limit = 10;
  if (limit < 1 || limit > 10000) {
    utils.printError("获取的评论数量必须在1-10000之间");
    limit = 10;
  }
  return limit;
}

module.exports = {
  douyinPostUrl,
  optionFormat,
};
