/**
 * 抖音博主已发布作品模块
 */
const constants = require("../config/constants");
const { requestApi, pollTaskResult } = require("../utils/request");

function processPostResults(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }
  const result = {};
  if (Array.isArray(data.post)) {
    result.post = data.post;
  }
  if (data.user && typeof data.user === "object" && !Array.isArray(data.user)) {
    result.user = data.user;
  }
  return result;
}

/**
 * 创建抖音已发布作品任务
 * @param {string} token 技能令牌
 * @param {string} url 抖音博主主页URL
 * @param {number} limit 作品数量
 * @returns {Promise<Object>} 任务状态
 * @throws {Error} API调用失败时抛出错误
 */
async function createPostTask(token, url, limit) {
  const params = { _: Date.now() };
  const data = {
    url: url,
    limit: limit,
  };
  return await requestApi(
    "POST",
    "/api/douyin/post/url",
    params,
    data,
    token,
    constants.CREATE_MAX_ATTEMPTS,
    "创建任务",
  );
}

/**
 * 获取抖音已发布作品任务结果
 * @param {string} token 技能令牌
 * @param {string} url 抖音博主主页URL
 * @param {number} limit 作品数量
 * @returns {Promise<{post?: Array, user?: Object}|null>} 作品列表与博主信息
 * @throws {Error} API调用失败时抛出错误
 */
async function getPostTask(token, url, limit) {
  const params = {
    url: url,
    limit: limit,
  };
  const response = await pollTaskResult(
    "/api/douyin/post/info",
    params,
    token,
    "查询任务",
  );
  if (response.data) {
    return processPostResults(response.data);
  }
  return null;
}

module.exports = {
  createPostTask,
  getPostTask,
};
