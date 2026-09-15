/**
 * 抖音评论模块
 */
const constants = require("../config/constants");
const { requestApi } = require("../utils/request");

function processCommentResults(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => {
    const processedItem = { ...item };

    if (item.user_sec_uid) {
      processedItem.user_url = `https://www.douyin.com/user/${item.user_sec_uid}`;
    }

    if (typeof item?.create_time === "number" && item.create_time) {
      processedItem.create_time_str = new Date(
        item.create_time * 1000,
      ).toLocaleString();
    }

    return processedItem;
  });
}

/**
 * 创建抖音评论任务
 * @param {string} token - 技能令牌
 * @param {string} url - 视频URL
 * @param {number} limit - 评论数量, 1-10000
 * @returns {Promise<Object>} 评论任务状态
 * @throws {Error} API调用失败时抛出错误
 */
async function createCommentTask(token, url, limit) {
  const params = { _: Date.now() };

  const data = {
    url,
    limit,
  };

  return await requestApi(
    "POST",
    "/api/douyin/comment/url",
    params,
    data,
    token,
    constants.CREATE_MAX_ATTEMPTS,
    "创建任务",
  );
}

/**
 * 获取抖音评论任务结果
 * @param {string} token - 技能令牌
 * @param {string} url - 视频URL
 * @param {number} limit - 评论数量, 1-10000
 * @returns {Promise<Array>} 评论列表数组
 * @throws {Error} API调用失败时抛出错误
 */
async function getCommentTask(token, url, limit) {
  const params = {
    _: Date.now(),
    url: url,
    limit: limit,
  };

  const response = await requestApi(
    "GET",
    "/api/douyin/comment/info",
    params,
    null,
    token,
    constants.QUERY_MAX_ATTEMPTS,
    "查询任务",
  );

  if (response.data) {
    return processCommentResults(response.data);
  }

  return [];
}

module.exports = {
  createCommentTask,
  getCommentTask,
};
