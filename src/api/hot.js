/**
 * 抖音热门搜索模块
 */

const constants = require("../config/constants");
const { SkillError } = require("../utils/errors");
const { requestApi } = require("../utils/request");

/**
 * 获取抖音热门榜结果
 * @param {string} token - 技能令牌
 * @returns {Promise<Array>} 热门榜结果数组
 * @throws {Error} API调用失败时抛出错误
 */
async function getHotSearch(token) {
  const response = await requestApi(
    "GET",
    "/api/douyin/hot-search",
    {},
    null,
    token,
    constants.CREATE_MAX_ATTEMPTS,
    "获取抖音热榜",
  );
  if (response.data == null) {
    return [];
  }
  if (!Array.isArray(response.data)) {
    throw new SkillError("API_SCHEMA_CHANGED", "热榜结果格式异常", true);
  }
  return response.data;
}

module.exports = {
  getHotSearch,
};
