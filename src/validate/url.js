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

module.exports = {
  extractDouyinUrl,
};
