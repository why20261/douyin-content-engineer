const utils = require("../utils/utils");

function isKeywordValid(keyword) {
  keyword = String(keyword ?? "").trim();
  if (keyword.length < 2) {
    utils.printError(`搜索关键词长度不能小于 2 个字符`);
    return false;
  }
  if (keyword.length > 50) {
    utils.printError(`搜索关键词长度不能超过 50 个字符`);
    return false;
  }
  if (/https?:\/\//i.test(keyword) || /www\./i.test(keyword)) {
    utils.printError(`搜索关键词不能是链接, 请输入普通关键词, 例如: 新媒体`);
    return false;
  }
  if (/[<>"'&]/.test(keyword)) {
    utils.printError(
      `搜索关键词包含特殊字符 < > " ' &, 请输入普通关键词, 例如: 新媒体`,
    );
    return false;
  }
  return true;
}

/**
 * 清洗搜索关键词，移除非法字符
 * @param {string} keyword - 原始关键词
 * @returns {string} - 清洗后的搜索关键词
 */
function cleanKeyword(keyword) {
  keyword = String(keyword ?? "").trim();
  keyword = keyword.replace(/\s+/g, " "); // 合并连续空格
  return keyword;
}

/**
 * 格式化并验证搜索选项
 * @param {number} sort - 排序依据 (0:综合, 1:最多点赞, 2:最新发布)
 * @param {number} time - 时间范围 (0:全部, 1:一天内, 7:七天内, 180:半年内)
 * @param {number} duration - 视频时长 (0:不限, 1:1分钟以下, 2:1-5分钟, 3:5分钟以上)
 * @param {number} content - 内容类型 (0:不限, 1:视频, 2:图文)
 * @param {number} limit - 搜索数量 (1-10000)
 * @returns {[number, number, number, number]} 格式化后的选项数组
 */
function optionFormat(sort, time, duration, content, limit) {
  const num = (v, def) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };
  sort = num(sort, 0);
  time = num(time, 0);
  duration = num(duration, 0);
  content = num(content, 0);
  limit = num(limit, 10);
  if (sort !== 0 && sort !== 1 && sort !== 2) {
    utils.printError(`排序依据 ${sort} 无效, 请使用 0, 1, 2。 默认值为 0`);
    sort = 0;
  }
  if (time !== 0 && time !== 1 && time !== 7 && time !== 180) {
    utils.printError(`发布时间 ${time} 无效, 请使用 0, 1, 7, 180。 默认值为 0`);
    time = 0;
  }
  if (duration !== 0 && duration !== 1 && duration !== 2 && duration !== 3) {
    utils.printError(
      `视频时长 ${duration} 无效, 请使用 0, 1, 2, 3。 默认值为 0`,
    );
    duration = 0;
  }
  if (content !== 0 && content !== 1 && content !== 2) {
    utils.printError(`内容类型 ${content} 无效, 请使用 0, 1, 2。 默认值为 0`);
    content = 0;
  }
  if (limit < 1 || limit > 10000) {
    utils.printError(`搜索数量 ${limit} 无效, 请使用 1-10000 默认值为 10`);
    limit = 10;
  }
  return [sort, time, duration, content, limit];
}

module.exports = {
  isKeywordValid,
  cleanKeyword,
  optionFormat,
};
