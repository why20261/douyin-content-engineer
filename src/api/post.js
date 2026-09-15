/**
 * 抖音博主已发布作品模块
 */
const constants = require("../config/constants");
const { requestApi } = require("../utils/request");

function processPostResults(data) {
  if (!data || !Array.isArray(data.post) || data.post.length === 0) {
    return data;
  }
  return data.post;
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
 * @returns {Promise<Array>} 已发布作品数组
 * @throws {Error} API调用失败时抛出错误
 */
async function getPostTask(token, url, limit) {
  const params = {
    _: Date.now(),
    url: url,
    limit: limit,
  };
  const response = await requestApi(
    "GET",
    "/api/douyin/post/info",
    params,
    null,
    token,
    constants.QUERY_MAX_ATTEMPTS,
    "查询任务",
  );
  if (response.data) {
    return processPostResults(response.data);
  }
  return [];
}

module.exports = {
  createPostTask,
  getPostTask,
};
