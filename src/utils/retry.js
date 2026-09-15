const constants = require("../config/constants");

/**
 * 重试执行函数, 并处理错误
 * @param {function} fn - 待执行的异步函数
 * @param {number} maxAttempts - 最大重试次数
 * @param {function} [errorHandler] - 错误处理函数, 用于在每次重试时调用
 * @returns {Promise<object>} - 包含函数执行结果的 Promise
 * @throws {Error} - 重试次数用尽后抛出最后一次错误
 */
async function withRetry(fn, maxAttempts, errorHandler) {
  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (error && error.noRetry) {
        throw error;
      }
      if (errorHandler) errorHandler(attempt, error);
      if (attempt < maxAttempts - 1) {
        const delay = Math.min(
          Math.pow(2, attempt) * constants.RETRY_INTERVAL,
          60000,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError || new Error(`重试${maxAttempts}次后失败`);
}

module.exports = { withRetry };
