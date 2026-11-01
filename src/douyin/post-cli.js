#!/usr/bin/env node

const log = require("../utils/log");
const post = require("../api/post");
const token = require("../utils/token");
const utils = require("../utils/utils");
const validator = require("../validate/post");
const { parseArgs, buildHelp, parseDecimalInteger } = require("../utils/args");
const {
  emitError,
  emitEmpty,
  printSuccessEnvelope,
  emitUncaught,
} = require("../utils/output");

const SCHEMA = {
  flags: {
    "--url": {
      alias: "-u",
      key: "url",
      type: "string",
      required: true,
      desc: "抖音博主主页URL或sec_uid",
    },
    "--limit": {
      alias: "-l",
      key: "limit",
      type: "number",
      default: 10,
      transform: parseDecimalInteger,
      desc: "获取的作品数量, 0-10000",
    },
  },
  positionalKey: "url",
};

function printHelp() {
  process.stderr.write(
    buildHelp(SCHEMA, "node src/douyin/post-cli.js <url> [选项]", [
      "node src/douyin/post-cli.js https://www.douyin.com/user/MS4wLjABxxx",
      'node src/douyin/post-cli.js --url "https://v.douyin.com/xxx" --limit 20',
      "node src/douyin/post-cli.js -u MS4wLjABxxx -l 100",
    ]),
  );
}

function isEmptyResult(t) {
  if (!t) return true;
  if (Array.isArray(t)) return t.length === 0;
  if (typeof t === "object") {
    const hasUser = t.user && Object.keys(t.user).length > 0;
    const hasPosts = Array.isArray(t.post) && t.post.length > 0;
    return !hasUser && !hasPosts;
  }
  return true;
}

/**
 * 主函数 - 获取抖音博主作品列表
 */
async function main() {
  const startTime = Date.now();
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printHelp();
    emitError("post", "INVALID_ARGS", "缺少命令参数", 2, startTime);
    return;
  }

  let parsed;
  try {
    parsed = parseArgs(args, SCHEMA);
  } catch (error) {
    utils.printError(`参数解析错误: ${error.message}`);
    printHelp();
    emitError(
      "post",
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

  let { url, limit } = parsed;
  const urlRaw = url;

  utils.printBanner();
  utils.printInfo(`原始URL: ${urlRaw}`);
  url = validator.parseDouyinUser(url);
  if (!url) {
    utils.printError("无法识别抖音博主主页链接或 sec_uid");
    emitError(
      "post",
      "INVALID_URL",
      "无法识别博主主页链接或 sec_uid。支持: https://www.douyin.com/user/xxx、https://v.douyin.com/xxx, 或直接输入 sec_uid (MS4wLjA 开头)",
      1,
      startTime,
      { command: "post", url_raw: urlRaw },
    );
    return;
  }
  utils.printInfo(`规范后的URL: ${url}`);
  try {
    limit = validator.assertPostLimit(limit);
  } catch (error) {
    utils.printError(error.message);
    emitError("post", "INVALID_ARGS", error.message, 2, startTime, {
      command: "post",
      url_raw: urlRaw,
      url: url,
      limit: limit,
    });
    return;
  }

  const tokenValue = token.skillToken(process.env.GUAIKEI_API_TOKEN);
  if (tokenValue === "") {
    emitError(
      "post",
      "AUTH_REQUIRED",
      "GUAIKEI_API_TOKEN 未配置或格式无效。须为 16-256 位字母、数字、下划线或连字符",
      3,
      startTime,
      { command: "post", url_raw: urlRaw, url: url },
    );
    return;
  }
  let postTask = null;
  try {
    await post.createPostTask(tokenValue, url, limit);
    utils.printSuccess(`获取作品任务创建成功, 正在获取作品中...`);

    postTask = await post.getPostTask(tokenValue, url, limit);
  } catch (error) {
    utils.printError(`获取作品失败: ${error.message}`);
    emitError(
      "post",
      error.code || "UNKNOWN",
      error.message,
      error.name === "AuthError" ? 3 : 1,
      startTime,
      { command: "post", url_raw: urlRaw, url: url, limit: limit },
    );
    return;
  }

  const postRequest = {
    command: "post",
    url_raw: urlRaw,
    url: url,
    limit: limit,
  };
  if (isEmptyResult(postTask)) {
    utils.printInfo("没有找到匹配的博主或作品");
    emitEmpty("没有找到匹配的博主或作品", startTime, postRequest);
    return;
  }

  const finalOutput = printSuccessEnvelope(
    "获取作品任务完成",
    startTime,
    postRequest,
    postTask,
  );
  const postCount = Array.isArray(postTask.post) ? postTask.post.length : 0;
  const hasUser = Boolean(
    postTask.user && Object.keys(postTask.user).length > 0,
  );
  utils.printSuccess(
    `获取作品任务完成, 作品 ${postCount} 条${hasUser ? ", 含博主信息" : ""}`,
  );

  await log.writeResultLog(
    `${startTime}_${log.resourceId(url)}_post.json`,
    JSON.stringify(finalOutput, null, 2),
  );
}

main().catch((error) => {
  utils.printError(error.message || String(error));
  emitUncaught("post", error);
});
