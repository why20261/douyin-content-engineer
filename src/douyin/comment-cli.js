#!/usr/bin/env node

const comment = require("../api/comment");
const log = require("../utils/log");
const token = require("../utils/token");
const utils = require("../utils/utils");
const validator = require("../validate/comment");
const { parseArgs, buildHelp } = require("../utils/args");
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

/**
 * 主函数 - 获取抖音作品的评论列表
 */
async function main() {
  const startTime = Date.now();
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printHelp();
    emitError("comment", "INVALID_ARGS", "缺少命令参数", 2, startTime);
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
  url = validator.parseDouyinAweme(url);
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
  try {
    limit = validator.assertCommentLimit(limit);
  } catch (error) {
    utils.printError(error.message);
    emitError("comment", "INVALID_ARGS", error.message, 2, startTime, {
      command: "comment",
      url_raw: urlRaw,
      url: url,
      limit: limit,
    });
    return;
  }
  const tokenValue = token.skillToken(process.env.GUAIKEI_API_TOKEN);
  if (tokenValue === "") {
    emitError(
      "comment",
      "AUTH_REQUIRED",
      "GUAIKEI_API_TOKEN 未配置或格式无效。须为 16-256 位字母、数字、下划线或连字符; 可通过 https://www.guaikei.com 自助开通",
      3,
      startTime,
      { command: "comment", url_raw: urlRaw, url: url },
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
      { command: "comment", url_raw: urlRaw, url: url, limit: limit },
    );
    return;
  }

  const commentRequest = {
    command: "comment",
    url_raw: urlRaw,
    url: url,
    limit: limit,
  };
  if (!commentTask || !Array.isArray(commentTask) || commentTask.length === 0) {
    utils.printInfo("没有找到匹配的评论");
    emitEmpty("没有找到匹配的评论", startTime, commentRequest);
    return;
  }

  const finalOutput = printSuccessEnvelope(
    "获取评论任务完成",
    startTime,
    commentRequest,
    commentTask,
  );
  utils.printSuccess(
    `获取评论任务完成, 共返回 ${finalOutput.results.length} 条结果`,
  );

  await log.writeResultLog(
    `${startTime}_${log.resourceId(url)}_comment.json`,
    JSON.stringify(finalOutput, null, 2),
  );
}

main().catch((error) => {
  utils.printError(error.message || String(error));
  emitUncaught("comment", error);
});
