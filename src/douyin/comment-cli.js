#!/usr/bin/env node

const constants = require("../config/constants");
const comment = require("../api/comment");
const log = require("../utils/log");
const token = require("../utils/token");
const utils = require("../utils/utils");
const validator = require("../validate/comment");
const { parseArgs, buildHelp } = require("../utils/args");

const SCHEMA = {
  flags: {
    "--url": {
      alias: "-u",
      key: "url",
      type: "string",
      required: true,
      desc: "抖音视频(或图文)URL或aweme_id",
    },
    "--limit": {
      alias: "-l",
      key: "limit",
      type: "number",
      default: 10,
      transform: (v) => Number(v),
      desc: "评论数量, 1-10000",
    },
  },
  positionalKey: "url",
};

function printHelp() {
  process.stderr.write(
    buildHelp(SCHEMA, "node src/douyin/comment-cli.js <url> [选项]", [
      "node src/douyin/comment-cli.js https://www.douyin.com/video/xxx",
      "node src/douyin/comment-cli.js --url https://www.douyin.com/note/xxx --limit 20",
      "node src/douyin/comment-cli.js -u xxx -l 100",
    ]) +
      "\n\n注意:\n" +
      "  - 支持视频/图文链接 / v.douyin.com 短链 / aweme_id(纯数字), 自动剥离 query 参数\n" +
      "  - Windows cmd.exe 下请使用双引号\n",
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
 * 主函数 - 获取抖音作品的评论列表
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
      "comment",
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
  url = validator.douyinPostUrl(url);
  if (!url) {
    utils.printError("无法识别抖音视频/图文链接或 aweme_id");
    emitError(
      "comment",
      "INVALID_URL",
      "无法识别视频/图文链接或 aweme_id。支持: https://www.douyin.com/video/xxx、https://www.douyin.com/note/xxx、https://v.douyin.com/xxx, 或直接输入 aweme_id (纯数字)",
      1,
      startTime,
      { command: "comment", url_raw: urlRaw },
    );
    return;
  }
  utils.printInfo(`规范后的URL: ${url}`);
  limit = validator.optionFormat(limit);
  const tokenValue = token.skillToken(process.env.GUAIKEI_API_TOKEN);
  if (tokenValue === "") {
    emitError(
      "comment",
      "AUTH_REQUIRED",
      "GUAIKEI_API_TOKEN 未配置或无效, 请配置环境变量后重试; 可通过 https://www.guaikei.com 自助开通",
      3,
      startTime,
      { command: "comment", url: url },
    );
    return;
  }
  let commentTask = null;
  try {
    await comment.createCommentTask(tokenValue, url, limit);
    utils.printSuccess(`获取评论任务创建成功, 正在获取评论中...`);

    commentTask = await comment.getCommentTask(tokenValue, url, limit);
  } catch (error) {
    utils.printError(`获取评论失败: ${error.message}`);
    emitError(
      "comment",
      error.code || "UNKNOWN",
      error.message,
      error.name === "AuthError" ? 3 : 1,
      startTime,
      { command: "comment", url: url, limit: limit },
    );
    return;
  }

  if (!commentTask || !Array.isArray(commentTask) || commentTask.length === 0) {
    utils.printError(`获取评论任务没有返回结果, 请稍后重试或联系开发者`);
    const emptyOutput = {
      status: "empty",
      error_code: "NO_MATCH",
      message: "没有找到匹配的评论",
      timestamp: new Date().toLocaleString(),
      request: {
        command: "comment",
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

  // 输出评论结果
  const finalOutput = {
    status: "success",
    error_code: "OK",
    message: "获取评论任务完成",
    timestamp: new Date().toLocaleString(),
    request: {
      command: "comment",
      url: url,
      limit: limit,
    },
    metadata: {
      skill_version: constants.VERSION,
      runtime_version: process.versions.node,
      execution_time: Date.now() - startTime,
    },
    results: commentTask,
  };
  console.log(JSON.stringify(finalOutput, null, 2));
  utils.printSuccess(
    `获取评论任务完成, 共返回 ${finalOutput.results.length} 条结果`,
  );

  url = url.replace(/[^a-zA-Z0-9_-]/g, "");
  url = url.replace("httpswwwdouyincomvideo", "");
  url = url.replace("httpswwwdouyincomnote", "");
  url = url.replace("httpsvdouyincom", "");
  await log.taskWrite(
    `${startTime}_${url}_comment.json`,
    JSON.stringify(finalOutput, null, 2),
  );
}

main().catch((error) => {
  utils.printError(error.message);
  process.exitCode = 1;
});
