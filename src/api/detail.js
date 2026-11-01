/**
 * 抖音作品详情模块
 */
const constants = require("../config/constants");
const { requestApi, pollTaskResult } = require("../utils/request");

function isEmptyValue(value) {
  if (value == null) return true;
  if (typeof value === "string") return value === "";
  if (typeof value === "number") return value === 0;
  if (typeof value === "boolean") return !value;
  if (Array.isArray(value)) return value.every(isEmptyValue);
  if (typeof value === "object") {
    return Object.keys(value).every((key) => isEmptyValue(value[key]));
  }
  return false;
}

function isEmptyDetail(result) {
  if (!result || typeof result !== "object") return true;
  if (result.aweme_id) return false;
  return Object.keys(result).every((key) => {
    if (key === "aweme_id" || key === "error") return true;
    return isEmptyValue(result[key]);
  });
}

function processDetailResult(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const result = { ...data };
  if (result.author_sec_uid && !result.author_url) {
    result.author_url = `https://www.douyin.com/user/${result.author_sec_uid}`;
  }
  if (isEmptyDetail(result)) return null;
  return result;
}

/**
 * 创建抖音作品详情任务
 * @param {string} token - 技能令牌
 * @param {string} url - 视频或图文 URL，或 aweme_id
 * @returns {Promise<Object>} 任务状态
 */
async function createDetailTask(token, url) {
  return await requestApi(
    "POST",
    "/api/douyin/detail/url",
    { _: Date.now() },
    { url },
    token,
    constants.CREATE_MAX_ATTEMPTS,
    "创建任务",
  );
}

/**
 * 获取抖音作品详情
 * @param {string} token - 技能令牌
 * @param {string} url - 与创建时相同的 url
 * @returns {Promise<Object|null>} 作品详情对象
 */
async function getDetailTask(token, url) {
  const response = await pollTaskResult(
    "/api/douyin/detail/info",
    { url },
    token,
    "查询任务",
  );

  if (response.data) {
    return processDetailResult(response.data);
  }

  return null;
}

module.exports = {
  createDetailTask,
  getDetailTask,
};
