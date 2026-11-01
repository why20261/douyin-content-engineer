/**
 * 抖音评论模块
 */
const constants = require("../config/constants");
const { SkillError } = require("../utils/errors");
const { requestApi, pollTaskResult } = require("../utils/request");
const { formatUnixSeconds } = require("../utils/time");

function processCommentResults(data) {
  if (!Array.isArray(data)) {
    throw new SkillError("API_SCHEMA_CHANGED", "评论结果格式异常", true);
  }

  return data.map((item) => {
    const processedItem = { ...item };

    if (item.user_sec_uid) {
      processedItem.user_url = `https://www.douyin.com/user/${item.user_sec_uid}`;
    }

    if (
      typeof item?.create_time === "number" &&
      item.create_time &&
      !item.create_time_str
    ) {
      processedItem.create_time_str = formatUnixSeconds(item.create_time);
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
    url: url,
    limit: limit,
  };

  const response = await pollTaskResult(
    "/api/douyin/comment/info",
    params,
    token,
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
