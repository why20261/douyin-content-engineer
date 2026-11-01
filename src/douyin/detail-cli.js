#!/usr/bin/env node

const detail = require("../api/detail");
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
      desc: "抖音视频/图文URL、v.douyin.com 短链或 aweme_id",
    },
  },
  positionalKey: "url",
};

function printHelp() {
  process.stderr.write(
    buildHelp(SCHEMA, "node src/douyin/detail-cli.js <url>", [
      "node src/douyin/detail-cli.js https://www.douyin.com/video/xxx",
      "node src/douyin/detail-cli.js --url https://www.douyin.com/note/xxx",
      "node src/douyin/detail-cli.js --url https://v.douyin.com/xxx",
      "node src/douyin/detail-cli.js -u 7123456789012345678",
    ]) +
      "\n\n注意:\n" +
      "  - 支持视频/图文链接 / iesdouyin 分享链 / v.douyin.com 短链 / aweme_id(纯数字), 自动剥离 query 参数\n" +
      "  - 只取这一条作品的详情, 不取评论, 也不取博主作品列表\n" +
      "  - Windows cmd.exe 下请使用双引号\n",
  );
}

/**
 * 主函数 - 获取一条抖音作品的详情
 */
async function main() {
  const startTime = Date.now();
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printHelp();
    emitError("detail", "INVALID_ARGS", "缺少命令参数", 2, startTime);
    return;
  }

  let parsed;
  try {
    parsed = parseArgs(args, SCHEMA);
  } catch (error) {
    utils.printError(`参数解析错误: ${error.message}`);
    printHelp();
    emitError(
      "detail",
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

  let { url } = parsed;
  const urlRaw = url;

  utils.printBanner();
  utils.printInfo(`原始URL: ${urlRaw}`);
  url = validator.parseDouyinAweme(url);
  if (!url) {
    utils.printError("无法识别抖音视频/图文链接或 aweme_id");
    emitError(
      "detail",
      "INVALID_URL",
      "无法识别视频/图文链接或 aweme_id。支持: https://www.douyin.com/video/xxx、https://www.douyin.com/note/xxx、https://v.douyin.com/xxx, 或直接输入 aweme_id (纯数字)",
      1,
      startTime,
      { command: "detail", url_raw: urlRaw },
    );
    return;
  }
  utils.printInfo(`规范后的URL: ${url}`);

  const tokenValue = token.skillToken(process.env.GUAIKEI_API_TOKEN);
  if (tokenValue === "") {
    emitError(
      "detail",
      "AUTH_REQUIRED",
      "GUAIKEI_API_TOKEN 未配置或格式无效。须为 16-256 位字母、数字、下划线或连字符",
      3,
      startTime,
      { command: "detail", url_raw: urlRaw, url: url },
    );
    return;
  }

  let detailResult = null;
  try {
    await detail.createDetailTask(tokenValue, url);
    utils.printSuccess("获取作品详情任务创建成功, 正在获取详情中...");
    detailResult = await detail.getDetailTask(tokenValue, url);
  } catch (error) {
    utils.printError(`获取作品详情失败: ${error.message}`);
    emitError(
      "detail",
      error.code || "UNKNOWN",
      error.message,
      error.name === "AuthError" ? 3 : 1,
      startTime,
      { command: "detail", url_raw: urlRaw, url: url },
    );
    return;
  }

  const detailRequest = {
    command: "detail",
    url_raw: urlRaw,
    url: url,
  };
  if (!detailResult) {
    utils.printInfo("没有找到匹配的作品");
    emitEmpty("没有找到匹配的作品", startTime, detailRequest);
    return;
  }

  const finalOutput = printSuccessEnvelope(
    "获取作品详情任务完成",
    startTime,
    detailRequest,
    detailResult,
  );
  utils.printSuccess("获取作品详情任务完成");

  await log.writeResultLog(
    `${startTime}_${log.resourceId(url)}_detail.json`,
    JSON.stringify(finalOutput, null, 2),
  );
}

main().catch((error) => {
  utils.printError(error.message || String(error));
  emitUncaught("detail", error);
});
