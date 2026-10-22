#!/usr/bin/env node

const token = require("../utils/token");
const hot = require("../api/hot");
const utils = require("../utils/utils");
const {
  emitError,
  emitEmpty,
  printSuccessEnvelope,
  emitUncaught,
} = require("../utils/output");

function printHelp() {
  process.stderr.write(
    "用法: node src/douyin/hot-cli.js\n\n获取抖音实时热榜，无需参数。\n",
  );
}

/**
 * 主函数 - 获取抖音热榜入口
 */
async function main() {
  const startTime = Date.now();
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }
  if (args.length > 0) {
    printHelp();
    emitError(
      "hot",
      "INVALID_ARGS",
      `热榜不接受参数, 收到: ${args.join(" ")}`,
      2,
      startTime,
    );
    return;
  }
  utils.printBanner();

  const tokenValue = token.skillToken(process.env.GUAIKEI_API_TOKEN);
  if (tokenValue === "") {
    emitError(
      "hot",
      "AUTH_REQUIRED",
      "GUAIKEI_API_TOKEN 未配置或格式无效。须为 16-256 位字母、数字、下划线或连字符; 可通过 https://www.guaikei.com 自助开通",
      3,
      startTime,
    );
    return;
  }
  let hotTask = null;
  try {
    hotTask = await hot.getHotSearch(tokenValue);
  } catch (error) {
    utils.printError(`获取抖音热榜失败: ${error.message}`);
    emitError(
      "hot",
      error.code || "UNKNOWN",
      error.message,
      error.name === "AuthError" ? 3 : 1,
      startTime,
    );
    return;
  }

  if (!hotTask || !Array.isArray(hotTask) || hotTask.length === 0) {
    utils.printInfo("没有找到最新的抖音热榜");
    emitEmpty("没有找到最新的抖音热榜", startTime, { command: "hot" });
    return;
  }

  printSuccessEnvelope(
    "获取抖音热榜任务完成",
    startTime,
    { command: "hot" },
    hotTask,
    hotTask.length,
  );
  utils.printSuccess(`抖音热榜任务完成, 共 ${hotTask.length} 条记录`);
}

main().catch((error) => {
  utils.printError(error.message || String(error));
  emitUncaught("hot", error);
});
