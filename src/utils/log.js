const fs = require("fs");
const path = require("path");
const utils = require("./utils");

async function writeResultLog(filename, content) {
  if (!filename || typeof filename !== "string") {
    utils.printError("日志文件名必须是非空字符串");
    return;
  }
  if (!content || typeof content !== "string") {
    utils.printError("日志内容必须是非空字符串");
    return;
  }
  let safeFilename = filename
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\.\.+/g, "_")
    .replace(/^\.+|\.+$/g, "");

  if (safeFilename.length > 200) {
    safeFilename = safeFilename.slice(0, 200);
  }
  if (!safeFilename) {
    safeFilename = `log_${Date.now()}`;
  }
  const outputFilename = path.join(
    path.dirname(__filename),
    "..",
    "..",
    "logs",
    safeFilename,
  );

  try {
    await fs.promises.mkdir(path.dirname(outputFilename), { recursive: true });
    await fs.promises.writeFile(outputFilename, content);
    utils.printSuccess(`  → 已保存到 ${outputFilename}`);
  } catch (error) {
    utils.printError(`日志写入失败: ${error.message}`);
  }
}

function resourceId(url) {
  const s = String(url || "");
  const user = s.match(/\/user\/([^/?#]+)/i);
  if (user) return user[1];
  const media = s.match(/\/(?:video|note)\/([^/?#]+)/i);
  if (media) return media[1];
  const share = s.match(/\/share\/(?:video|note)\/([^/?#]+)/i);
  if (share) return share[1];
  const short = s.match(/v\.douyin\.com\/([^/?#]+)/i);
  if (short) return short[1];
  const plain = s.replace(/[^a-zA-Z0-9_-]/g, "");
  return plain.slice(0, 80) || "unknown";
}

module.exports = {
  writeResultLog,
  resourceId,
};
