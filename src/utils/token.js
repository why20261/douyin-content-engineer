/**
 * TOKEN管理模块
 */
const utils = require("./utils");

/**
 * 验证 TOKEN 格式
 * @param {string} token - 待验证的 TOKEN
 * @returns {boolean} 是否有效
 */
function isValidToken(token) {
  if (!token || typeof token !== "string") return false;
  if (token.length < 16 || token.length > 256) return false;
  if (!/^[0-9a-zA-Z\_-]+$/.test(token)) return false;
  return true;
}

/**
 * 获取有效的技能令牌
 * @param {string|undefined} token - 环境变量中的技能令牌
 * @returns {string} 有效令牌
 */
function skillToken(token) {
  if (!token || typeof token !== "string" || !token.trim()) {
    utils.printError(
      "GUAIKEI_API_TOKEN 未配置。可通过 https://www.guaikei.com 自助开通后配置环境变量。",
    );
    return "";
  }
  if (!isValidToken(token)) {
    utils.printError(
      "GUAIKEI_API_TOKEN 格式无效。须为 16-256 位字母、数字、下划线或连字符。",
    );
    return "";
  }

  utils.printInfo("已使用配置的私有TOKEN");
  return token;
}

module.exports = {
  skillToken,
};
