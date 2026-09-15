function formatMessage(result) {
  let message = `**抖音最新热榜**\n`;
  message += "### 🏆 榜单前五名\n";
  result.slice(0, 5).forEach((item, index) => {
    message += `${index + 1}. **${item.word}** `;
    message += `🔥 ${item.hot_value}热度 `;
    message += `🔍 ${item.view_count}搜索\n`;
  });
  message += "\n---\n\n";
  message += "### 📝 详细列表\n";
  message += "-".repeat(35) + "\n\n";
  result.forEach((item) => {
    message += `${item.word} 🔥 ${item.hot_value} 热度 🔍 ${item.view_count} 搜索 ⏰ ${item.event_time_format} 上榜 \n`;
  });
  message += "-".repeat(35) + "\n";
  return message;
}
module.exports = { formatMessage };
