#!/usr/bin/env node

const search = require("../api/search");
const log = require("../utils/log");
const token = require("../utils/token");
const utils = require("../utils/utils");
const validator = require("../validate/keyword");
const { parseArgs, buildHelp, parseDecimalInteger } = require("../utils/args");
const {
  emitError,
  emitEmpty,
  printSuccessEnvelope,
  emitUncaught,
} = require("../utils/output");

const SCHEMA = {
  flags: {
    "--keyword": {
      alias: "-k",
      key: "keyword",
      type: "string",
      required: true,
      desc: "搜索关键词",
    },
    "--sort": {
      alias: "-s",
      key: "sort",
      type: "number",
      default: 0,
      transform: parseDecimalInteger,
      desc: "排序依据, 0: 综合排序(默认), 1: 最多点赞, 2: 最新发布",
    },
    "--time": {
      alias: "-t",
      key: "time",
      type: "number",
      default: 0,
      transform: parseDecimalInteger,
      desc: "发布时间, 0: 全部(默认), 1: 一天内, 7: 七天内, 180: 半年内",
    },
    "--duration": {
      alias: "-d",
      key: "duration",
      type: "number",
      default: 0,
      transform: parseDecimalInteger,
      desc: "视频时长, 0: 不限(默认), 1: 1分钟以下, 2: 1-5分钟, 3: 5分钟以上",
    },
    "--content": {
      alias: "-c",
      key: "content",
      type: "number",
      default: 0,
      transform: parseDecimalInteger,
      desc: "内容类型, 0: 不限(默认), 1: 视频, 2: 图文",
    },
    "--limit": {
      alias: "-l",
      key: "limit",
      type: "number",
      default: 10,
      transform: parseDecimalInteger,
      desc: "搜索数量, 1-10000",
    },
  },
  positionalKey: "keyword",
};

function printHelp() {
  process.stderr.write(
    buildHelp(SCHEMA, "node src/douyin/search-cli.js <关键词> [选项]", [
      'node src/douyin/search-cli.js --keyword "AI"',
      'node src/douyin/search-cli.js --keyword "AI 模型"',
      "node src/douyin/search-cli.js --keyword AI --sort 0 --time 0 --duration 0 --limit 10",
      'node src/douyin/search-cli.js -k "AI 模型" -s 1 -t 180 -d 2 -l 100',
    ]) +
      "\n\n注意:\n" +
      "  - 关键词建议 2-50 个字符，不能是链接, 不含 < > \" ' &\n" +
      "  - 排序、时间、时长、类型和数量若不在允许范围内，命令会直接失败，不会改成默认值后继续搜索\n" +
      "  - 关键词以 - 开头时写成 --keyword=-AI，或在 -- 后面写位置参数",
  );
}

/**
 * 主函数 - 搜索任务入口
 * @description 解析命令行参数，执行搜索任务，输出结果并保存日志
 */
async function main() {
  const startTime = Date.now();
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printHelp();
    emitError("search", "INVALID_ARGS", "缺少命令参数", 2, startTime);
    return;
  }

  let parsed;
  try {
    parsed = parseArgs(args, SCHEMA);
  } catch (error) {
    utils.printError(`参数解析错误: ${error.message}`);
    printHelp();
    emitError(
      "search",
      "INVALID_ARGS",
      `参数解析错误: ${error.message}`,
      2,
      startTime,
    );
    return;
  }
  if (parsed._help) {
    printHelp();
    return;
  }
  let { keyword, sort, time, duration, content, limit } = parsed;

  utils.printBanner();
  const keywordRaw = keyword;
  utils.printInfo(`原始关键词: ${keywordRaw}`);
  keyword = validator.normalizeKeyword(keyword);
  if (!validator.isKeywordValid(keyword)) {
    emitError(
      "search",
      "INVALID_KEYWORD",
      "关键词不合法: 需 2-50 个字符, 不能是链接, 不含 < > \" ' & 等特殊符号",
      1,
      startTime,
      {
        command: "search",
        keyword_raw: keywordRaw,
        keyword: keyword,
        sort: sort,
        time: time,
        duration: duration,
        content: content,
        limit: limit,
      },
    );
    return;
  }
  utils.printInfo(`清洗后关键词: ${keyword}`);
  try {
    [sort, time, duration, content, limit] = validator.assertSearchOptions(
      sort,
      time,
      duration,
      content,
      limit,
    );
  } catch (error) {
    utils.printError(error.message);
    emitError("search", "INVALID_ARGS", error.message, 2, startTime, {
      command: "search",
      keyword_raw: keywordRaw,
      keyword: keyword,
      sort: sort,
      time: time,
      duration: duration,
      content: content,
      limit: limit,
    });
    return;
  }
  utils.printInfo(
    `排序: ${sort}, 时间: ${time}, 时长: ${duration}, 类型: ${content}, 数量: ${limit}`,
  );

  const tokenValue = token.skillToken(process.env.GUAIKEI_API_TOKEN);
  if (tokenValue === "") {
    emitError(
      "search",
      "AUTH_REQUIRED",
      "GUAIKEI_API_TOKEN 未配置或格式无效。须为 16-256 位字母、数字、下划线或连字符",
      3,
      startTime,
      {
        command: "search",
        keyword_raw: keywordRaw,
        keyword: keyword,
        sort: sort,
        time: time,
        duration: duration,
        content: content,
        limit: limit,
      },
    );
    return;
  }
  let searchTask = null;
  try {
    await search.createSearchTask(
      tokenValue,
      keyword,
      sort,
      time,
      duration,
      content,
      limit,
    );
    utils.printSuccess(`搜索任务创建成功, 正在搜索中...`);

    searchTask = await search.getSearchTask(
      tokenValue,
      keyword,
      sort,
      time,
      duration,
      content,
      limit,
    );
  } catch (error) {
    utils.printError(`搜索失败: ${error.message}`);
    emitError(
      "search",
      error.code || "UNKNOWN",
      error.message,
      error.name === "AuthError" ? 3 : 1,
      startTime,
      {
        command: "search",
        keyword_raw: keywordRaw,
        keyword: keyword,
        sort: sort,
        time: time,
        duration: duration,
        content: content,
        limit: limit,
      },
    );
    return;
  }

  const searchRequest = {
    command: "search",
    keyword_raw: keywordRaw,
    keyword: keyword,
    sort: sort,
    time: time,
    duration: duration,
    content: content,
    limit: limit,
  };
  if (!searchTask || !Array.isArray(searchTask) || searchTask.length === 0) {
    utils.printInfo("没有找到匹配的视频或图文内容");
    emitEmpty("没有找到匹配的视频或图文内容", startTime, searchRequest);
    return;
  }

  const finalOutput = printSuccessEnvelope(
    "搜索任务完成",
    startTime,
    searchRequest,
    searchTask,
  );
  utils.printSuccess(
    `搜索任务完成, 共返回 ${finalOutput.results.length} 条结果`,
  );

  await log.writeResultLog(
    `${startTime}_${keyword}_${sort}_${time}_${duration}_${content}_search.json`,
    JSON.stringify(finalOutput, null, 2),
  );
}

main().catch((error) => {
  utils.printError(error.message || String(error));
  emitUncaught("search", error);
});
