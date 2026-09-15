#!/usr/bin/env node

const constants = require("../config/constants");
const token = require("../utils/token");
const hot = require("../api/hot");
const utils = require("../utils/utils");

function emitError(command, code, message, exitCode, startTime) {
  const payload = {
    status: "error",
    error_code: code,
    message: message,
    timestamp: new Date().toLocaleString(),
    request: { command },
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
 * 主函数 - 获取抖音热榜入口
 */
async function main() {
  const startTime = Date.now();
  utils.printBanner();

  const tokenValue = token.skillToken(process.env.GUAIKEI_API_TOKEN);
  if (tokenValue === "") {
    emitError(
      "hot",
      "AUTH_REQUIRED",
      "GUAIKEI_API_TOKEN 未配置或无效, 请配置环境变量后重试; 可通过 https://www.guaikei.com 自助开通",
      3,
      startTime,
    );
    return;
  }
  let hotTask = null;
  try {
    hotTask = await hot.getHotTask(tokenValue);
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
    utils.printError(`抖音热榜没有返回结果, 请稍后重试或联系开发者`);
    const emptyOutput = {
      status: "empty",
      error_code: "NO_MATCH",
      message: "没有找到最新的抖音热榜",
      timestamp: new Date().toLocaleString(),
      request: {
        command: "hot",
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

  // 输出热榜结果
  const finalOutput = {
    status: "success",
    error_code: "OK",
    message: "获取抖音热榜任务完成",
    total: hotTask.length,
    timestamp: new Date().toLocaleString(),
    metadata: {
      skill_version: constants.VERSION,
      runtime_version: process.versions.node,
      execution_time: Date.now() - startTime,
    },
    results: hotTask,
  };
  console.log(JSON.stringify(finalOutput, null, 2));
  utils.printSuccess(`抖音热榜任务完成, 共 ${hotTask.length} 条记录`);
}

main().catch((error) => {
  utils.printError(error.message);
  process.exitCode = 1;
});
