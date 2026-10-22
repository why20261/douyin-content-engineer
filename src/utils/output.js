/**
 * stdout 信封。错误和空结果刷出后再退出；成功只打印，方便随后写日志。
 */
const constants = require("../config/constants");
const { formatBeijingTime } = require("./time");

/**
 * 把 JSON 写到 stdout，刷出后再按退出码结束。
 * 避免管道场景下进程先退出、调用方读到空输出。
 * @param {object} payload
 * @param {number} exitCode
 */
function writeJsonAndExit(payload, exitCode) {
  const text = JSON.stringify(payload, null, 2) + "\n";
  process.stdout.write(text, () => {
    process.exit(exitCode);
  });
}

function buildEnvelope({
  status,
  errorCode,
  message,
  request,
  startTime,
  results = null,
  total,
}) {
  const metadata = {
    skill_version: constants.VERSION,
    runtime_version: process.versions.node,
    execution_time: startTime == null ? 0 : Date.now() - startTime,
  };
  if (total !== undefined) {
    metadata.total = total;
  }
  return {
    status,
    error_code: errorCode,
    message,
    timestamp: formatBeijingTime(new Date()),
    request,
    metadata,
    results,
  };
}

function emitError(command, code, message, exitCode, startTime, request) {
  writeJsonAndExit(
    buildEnvelope({
      status: "error",
      errorCode: code,
      message,
      request: request || { command },
      startTime,
    }),
    exitCode,
  );
}

function emitEmpty(message, startTime, request) {
  writeJsonAndExit(
    buildEnvelope({
      status: "empty",
      errorCode: "NO_MATCH",
      message,
      request,
      startTime,
    }),
    0,
  );
}

function printSuccessEnvelope(message, startTime, request, results, total) {
  const payload = buildEnvelope({
    status: "success",
    errorCode: "OK",
    message,
    request,
    startTime,
    results,
    total,
  });
  console.log(JSON.stringify(payload, null, 2));
  return payload;
}

function emitUncaught(command, error) {
  writeJsonAndExit(
    buildEnvelope({
      status: "error",
      errorCode: error.code || "UNKNOWN",
      message: error.message || "未知错误",
      request: { command },
    }),
    error.name === "AuthError" ? 3 : 1,
  );
}

module.exports = {
  writeJsonAndExit,
  emitError,
  emitEmpty,
  printSuccessEnvelope,
  emitUncaught,
};
