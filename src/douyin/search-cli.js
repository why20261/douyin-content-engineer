#!/usr/bin/env node

const constants = require("../config/constants");
const search = require("../api/search");
const log = require("../utils/log");
const token = require("../utils/token");
const utils = require("../utils/utils");
const validator = require("../validate/keyword");
const { parseArgs, buildHelp } = require("../utils/args");

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
      transform: (v) => Number(v),
      desc: "排序依据, 0: 综合排序(默认), 1: 最多点赞, 2: 最新发布",
    },
    "--time": {
      alias: "-t",
      key: "time",
      type: "number",
      default: 0,
      transform: (v) => Number(v),
      desc: "发布时间, 0: 全部(默认), 1: 一天内, 7: 七天内, 180: 半年内",
    },
    "--duration": {
      alias: "-d",
      key: "duration",
      type: "number",
      default: 0,
      transform: (v) => Number(v),
      desc: "视频时长, 0: 不限(默认), 1: 1分钟以下, 2: 1-5分钟, 3: 5分钟以上",
    },
    "--content": {
      alias: "-c",
      key: "content",
      type: "number",
      default: 0,
      transform: (v) => Number(v),
      desc: "内容类型, 0: 不限(默认), 1: 视频, 2: 图文",
    },
    "--limit": {
      alias: "-l",
      key: "limit",
      type: "number",
      default: 10,
      transform: (v) => Number(v),
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
      "  - 所有参数都会自动清洗和验证",
  );
}

function emitError(command, code, message, exitCode, startTime, request) {
  const payload = {
    status: "error",
    error_code: code,
    message: message,
    timestamp: new Date().toLocaleString(),
    request: request || { command },
    metadata: {
      skill_version: constants.VERSION,
      runtime_version: process.versions.node,
      execution_time: Date.now() - startTime,
    },
    results: null,
  };
  process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  process.exitCode = exitCode;
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
    process.exitCode = 2;
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
  keyword = validator.cleanKeyword(keyword);
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
  [sort, time, duration, content, limit] = validator.optionFormat(
    sort,
    time,
    duration,
    content,
    limit,
  );
  utils.printInfo(
    `排序: ${sort}, 时间: ${time}, 时长: ${duration}, 类型: ${content}, 数量: ${limit}`,
  );

  const tokenValue = token.skillToken(process.env.GUAIKEI_API_TOKEN);
  if (tokenValue === "") {
    emitError(
      "search",
      "AUTH_REQUIRED",
      "GUAIKEI_API_TOKEN 未配置或无效, 请配置环境变量后重试; 可通过 https://www.guaikei.com 自助开通",
      3,
      startTime,
      { command: "search", keyword: keyword, limit: limit },
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

  if (!searchTask || !Array.isArray(searchTask) || searchTask.length === 0) {
    utils.printError(`搜索任务没有返回结果, 请稍后重试或联系开发者`);
    const emptyOutput = {
      status: "empty",
      error_code: "NO_MATCH",
      message: "没有找到匹配的视频或图文内容",
      timestamp: new Date().toLocaleString(),
      request: {
        command: "search",
        keyword_raw: keywordRaw,
        keyword: keyword,
        sort: sort,
        time: time,
        duration: duration,
        content: content,
        limit: limit,
      },
      metadata: {
        skill_version: constants.VERSION,
        runtime_version: process.versions.node,
        execution_time: Date.now() - startTime,
      },
      results: null,
    };
    process.stdout.write(JSON.stringify(emptyOutput, null, 2) + "\n", () =>
      process.exit(0),
    );
    return;
  }

  // 输出搜索结果
  const finalOutput = {
    status: "success",
    error_code: "OK",
    message: "搜索任务完成",
    timestamp: new Date().toLocaleString(),
    request: {
      command: "search",
      keyword_raw: keywordRaw,
      keyword: keyword,
      sort: sort,
      time: time,
      duration: duration,
      content: content,
      limit: limit,
    },
    metadata: {
      skill_version: constants.VERSION,
      runtime_version: process.versions.node,
      execution_time: Date.now() - startTime,
    },
    results: searchTask,
  };
  console.log(JSON.stringify(finalOutput, null, 2));
  utils.printSuccess(
    `搜索任务完成, 共返回 ${finalOutput.results.length} 条结果`,
  );

  await log.taskWrite(
    `${startTime}_${keyword}_${sort}_${time}_${duration}_${content}_search.json`,
    JSON.stringify(finalOutput, null, 2),
  );
}

main().catch((error) => {
  utils.printError(error.message);
  process.exitCode = 1;
});
