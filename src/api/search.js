/**
 * 抖音搜索模块
 */
const constants = require("../config/constants");
const { requestApi } = require("../utils/request");

/**
 * 处理搜索结果数据
 * @param {Array} data - 原始搜索结果数组
 * @returns {Array} 处理后的结果数组
 */
function processSearchResults(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => {
    const processedItem = { ...item };

    if (item.author_sec_uid) {
      processedItem.author_url = `https://www.douyin.com/user/${item.author_sec_uid}`;
    }

    if (
      typeof item?.create_time === "number" &&
      item.create_time &&
      !item.create_time_str
    ) {
      processedItem.create_time_str = new Date(
        item.create_time * 1000,
      ).toLocaleString();
    }

    return processedItem;
  });
}

/**
 * 创建抖音搜索任务
 * @param {string} token - 技能令牌
 * @param {string} keyword - 搜索关键词
 * @param {number} sort - 排序依据, 0: 综合排序, 1: 最多点赞, 2: 最新发布
 * @param {number} time - 发布时间, 0: 全部, 1: 一天内, 7: 七天内, 180: 半年内
 * @param {number} duration - 视频时长, 0: 不限, 1: 1分钟以下, 2: 1-5分钟, 3: 5分钟以上
 * @param {number} content - 内容类型, 0: 不限, 1: 视频, 2: 图文
 * @param {number} limit - 搜索数量, 1-10000
 * @returns {Promise<Object>} 搜索任务状态
 * @throws {Error} API调用失败时抛出错误
 */
async function createSearchTask(
  token,
  keyword,
  sort,
  time,
  duration,
  content,
  limit,
) {
  const params = { _: Date.now() };

  const data = {
    keyword,
    sort_type: sort,
    publish_time: time,
    filter_duration: duration,
    content_type: content,
    limit: limit,
  };

  return await requestApi(
    "POST",
    "/api/douyin/general-search/keyword",
    params,
    data,
    token,
    constants.CREATE_MAX_ATTEMPTS,
    "创建任务",
  );
}

/**
 * 获取抖音搜索任务结果
 * @param {string} token - 技能令牌
 * @param {string} keyword - 搜索关键词
 * @param {number} sort - 排序依据, 0: 综合排序, 1: 最多点赞, 2: 最新发布
 * @param {number} time - 发布时间, 0: 全部, 1: 一天内, 7: 七天内, 180: 半年内
 * @param {number} duration - 视频时长, 0: 不限, 1: 1分钟以下, 2: 1-5分钟, 3: 5分钟以上
 * @param {number} content - 内容类型, 0: 不限, 1: 视频, 2: 图文
 * @param {number} limit - 搜索数量, 1-10000
 * @returns {Promise<Array>} 搜索结果数组
 * @throws {Error} API调用失败时抛出错误
 */
async function getSearchTask(
  token,
  keyword,
  sort,
  time,
  duration,
  content,
  limit,
) {
  const params = {
    _: Date.now(),
    keyword: keyword,
    sort_type: sort,
    publish_time: time,
    filter_duration: duration,
    content_type: content,
    limit: limit,
  };

  const response = await requestApi(
    "GET",
    "/api/douyin/general-search/info",
    params,
    null,
    token,
    constants.QUERY_MAX_ATTEMPTS,
    "查询任务",
  );

  if (response.data) {
    return processSearchResults(response.data);
  }

  return [];
}

module.exports = {
  createSearchTask,
  getSearchTask,
};
