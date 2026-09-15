#!/usr/bin/env node

const constants = require("../config/constants");
const log = require("../utils/log");
const post = require("../api/post");
const token = require("../utils/token");
const utils = require("../utils/utils");
const validator = require("../validate/post");
const { parseArgs, buildHelp } = require("../utils/args");

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
      transform: (v) => Number(v),
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
  url = validator.douyinUserUrl(url);
  if (!url) {
    utils.printError("无法识别抖音博主主页链接或 sec_uid");
    emitError(
      "post",
      "INVALID_URL",
      "无法识别博主主页链接或 sec_uid。支持: https://www.douyin.com/user/xxx、https://v.douyin.com/xxx, 或直接输入 sec_uid (MS4wLjAB 开头)",
      1,
      startTime,
      { command: "post", url_raw: urlRaw },
    );
    return;
  }
  utils.printInfo(`规范后的URL: ${url}`);
  limit = validator.optionFormat(limit);

  const tokenValue = token.skillToken(process.env.GUAIKEI_API_TOKEN);
  if (tokenValue === "") {
    emitError(
      "post",
      "AUTH_REQUIRED",
      "GUAIKEI_API_TOKEN 未配置或无效, 请配置环境变量后重试; 可通过 https://www.guaikei.com 自助开通",
      3,
      startTime,
      { command: "post", url: url },
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
      { command: "post", url: url, limit: limit },
    );
    return;
  }

  if (isEmptyResult(postTask)) {
    utils.printError(`获取作品任务没有返回结果, 请稍后重试或联系开发者`);
    const emptyOutput = {
      status: "empty",
      error_code: "NO_MATCH",
      message: "没有找到匹配的作品",
      timestamp: new Date().toLocaleString(),
      request: {
        command: "post",
        url: url,
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

  // 输出作品结果
  const finalOutput = {
    status: "success",
    error_code: "OK",
    message: "获取作品任务完成",
    timestamp: new Date().toLocaleString(),
    request: {
      command: "post",
      url: url,
      limit: limit,
    },
    metadata: {
      skill_version: constants.VERSION,
      runtime_version: process.versions.node,
      execution_time: Date.now() - startTime,
    },
    results: postTask,
  };
  console.log(JSON.stringify(finalOutput, null, 2));
  const resultCount = Array.isArray(postTask)
    ? postTask.length
    : Array.isArray(postTask.post)
      ? postTask.post.length
      : 0;
  utils.printSuccess(`获取作品任务完成, 共 ${resultCount} 条结果`);

  url = url.replace(/[^a-zA-Z0-9_-]/g, "");
  url = url.replace("httpswwwdouyincomuser", "");
  url = url.replace("httpsvdouyincom", "");
  await log.taskWrite(
    `${startTime}_${url}_post.json`,
    JSON.stringify(finalOutput, null, 2),
  );
}

main().catch((error) => {
  utils.printError(error.message);
  process.exit(1);
});
