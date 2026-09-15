/**
 * 通用工具函数模块
 */

/**
 * 打印横幅信息
 * @description 在控制台显示抖音搜索关键词的ASCII艺术横幅
 */
function printBanner() {
  process.stderr.write("╔════════════════════════════════════════════╗\n");
  process.stderr.write("║                                            ║\n");
  process.stderr.write("║          🎬 抖音数据智能分析助手            ║\n");
  process.stderr.write("║                                            ║\n");
  process.stderr.write("╚════════════════════════════════════════════╝\n");
  process.stderr.write("\n");
}

/**
 * 打印带颜色的日志信息
 * @param {string} level - 日志级别 (INFO|SUCCESS|WARN|ERROR)
 * @param {string} message - 日志消息内容
 */
function printLog(level, message) {
  message = String(message ?? "");
  const colorMap = {
    INFO: "\x1b[34m",
    SUCCESS: "\x1b[32m",
    WARN: "\x1b[33m",
    ERROR: "\x1b[31m",
  };
  console.error(
    `${colorMap[level] || ""}[${new Date().toLocaleString()}] [${level}] ${message}\x1b[0m`,
  );
}

module.exports = {
  printBanner,
  /**
   * 打印信息日志(蓝色)
   */
  printInfo: (msg) => printLog("INFO", msg),
  /**
   * 打印成功日志(绿色)
   */
  printSuccess: (msg) => printLog("SUCCESS", msg),
  /**
   * 打印错误日志(红色)
   */
  printError: (msg) => printLog("ERROR", msg),
  /**
   * 打印警告日志(黄色)
   */
  printWarn: (msg) => printLog("WARN", msg),
};
