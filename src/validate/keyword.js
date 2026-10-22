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
 * 整理关键词的空白：去掉首尾空白，连续空白合并为一个空格。
 * @param {string} keyword - 原始关键词
 * @returns {string} - 整理后的关键词
 */
function normalizeKeyword(keyword) {
  keyword = String(keyword ?? "").trim();
  keyword = keyword.replace(/\s+/g, " "); // 合并连续空格
  return keyword;
}

function assertChoice(value, allowed, label) {
  const n = Number(value);
  if (!allowed.includes(n)) {
    throw new Error(`${label} ${value} 无效, 允许值: ${allowed.join(", ")}`);
  }
  return n;
}

function assertIntegerRange(value, min, max, label) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new Error(`${label} ${value} 无效, 允许 ${min}-${max} 的整数`);
  }
  return n;
}

/**
 * 校验搜索选项。未传入的参数由命令行解析器填入默认值。
 * 显式给出的非法值直接失败，不改写成默认值。
 * @param {number} sort - 排序依据 (0:综合, 1:最多点赞, 2:最新发布)
 * @param {number} time - 时间范围 (0:全部, 1:一天内, 7:七天内, 180:半年内)
 * @param {number} duration - 视频时长 (0:不限, 1:1分钟以下, 2:1-5分钟, 3:5分钟以上)
 * @param {number} content - 内容类型 (0:不限, 1:视频, 2:图文)
 * @param {number} limit - 搜索数量 (1-10000)
 * @returns {[number, number, number, number, number]} 校验后的选项
 */
function assertSearchOptions(sort, time, duration, content, limit) {
  sort = assertChoice(sort, [0, 1, 2], "排序依据 sort");
  time = assertChoice(time, [0, 1, 7, 180], "发布时间 time");
  duration = assertChoice(duration, [0, 1, 2, 3], "视频时长 duration");
  content = assertChoice(content, [0, 1, 2], "内容类型 content");
  limit = assertIntegerRange(limit, 1, 10000, "搜索数量 limit");
  return [sort, time, duration, content, limit];
}

module.exports = {
  isKeywordValid,
  normalizeKeyword,
  assertSearchOptions,
};
