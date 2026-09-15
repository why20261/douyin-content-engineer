# 🚀 抖音内容引擎｜关键词搜索 · 博主作品 · 视频评论 · 实时热榜（无需登录 / 不封号）

> **💡一句话价值**：一条命令拿到抖音公开的视频/作者/评论/热榜数据，直接输出结构化 JSON——做爆款选题、对标账号监控、评论舆情分析、热点追踪，不用再手动刷抖音。

**维护状态**：持续更新中，当前版本 `1.3.0`，[更新日志](references/changelog.md)。

> **🔥核心优势**
>
> - 安全: 无需登录你的抖音账号，不担心风控风险 / 封号问题
> - 强大: 一次可获取最多1W条数据，使用简单方便
> - 全面: 各功能出参数据全面，可见及有价值数据都会返回
> - 灵活: 支持多维度筛选
> - 轻量: 无需部署服务，Node.js 一键运行
> - 低耗: 日志自动归档，适配营销报告 / 内容策划场景 ，便于数据二次分析

## ✅ 我能帮你解决什么（10 秒判断）

| 你是谁     | 你要做的事                       | 用哪个功能                  |
| ---------- | -------------------------------- | --------------------------- |
| 短视频运营 | 找爆款选题、分析高赞视频规律     | 关键词搜索（点赞/最新排序） |
| 品牌/投放  | 监控对标账号的内容策略和发文节奏 | 博主作品抓取                |
| 舆情/客服  | 看一条视频评论区在骂还是在夸     | 评论抓取                    |
| 所有人     | 今天抖音在火什么，追热点         | 实时热榜                    |

**产出物**：结构化 JSON（含标题、作者、点赞/评论/收藏/分享、标签、视频链接），可直接导入 Excel/BI，或交给 AI 生成选题库、竞品对比表、舆情周报。

## 🚀 3 步接入

1. **装 Node.js**（16.14.0+，Windows/Mac/Linux 均可，约 2 分钟）
2. **拿 TOKEN**：访问 [抖音内容引擎技能官网](https://www.guaikei.com) 自助开通，配置环境变量 `GUAIKEI_API_TOKEN`
   - Windows：`set GUAIKEI_API_TOKEN=你的TOKEN`
   - Linux/MacOS：`export GUAIKEI_API_TOKEN=你的TOKEN`
3. **复制一条命令跑**（10-60 秒出结果）👇

### 最快上手（复制就能跑）

```bash
# 🔎 搜"AI"相关的抖音视频
node src/douyin/search-cli.js --keyword "AI"

# 🔎 按点赞排序找爆款（最常用）
node src/douyin/search-cli.js --keyword "AI" --sort 1

# 🦸 抓某个博主的作品（直接粘贴 App 分享链接也行）
node src/douyin/post-cli.js --url "https://www.douyin.com/user/MS4wLjABxxx" --limit 20

# 💬 看这条视频的评论
node src/douyin/comment-cli.js --url "https://www.douyin.com/video/xxx" --limit 100

# 📡 抖音实时热榜
node src/douyin/hot-cli.js
```

> 💡 Windows cmd.exe 下请使用双引号；PowerShell / bash 可直接执行。
> 💡 技能支持直接粘贴 App 分享文案（含"复制到剪贴板…"字样和短链），链接会自动抽取、参数自动清理。

### 你会得到什么（真实输出结构示例）

```json
{
  "status": "success",
  "error_code": "OK",
  "request": {
    "command": "search",
    "keyword": "AI 教程",
    "sort": 1,
    "limit": 20
  },
  "metadata": { "skill_version": "1.3.0", "execution_time": 34210 },
  "results": [
    {
      "desc": "3 分钟讲透 RAG…",
      "author_nickname": "某某说AI",
      "author_sec_uid": "MS4wLjABAAAA…",
      "author_url": "https://www.douyin.com/user/MS4wLjABAAAA…",
      "digg_count": 123456,
      "comment_count": 8901,
      "share_count": 1200,
      "collect_count": 3400,
      "url": "https://www.douyin.com/video/7xxxxxxxxxxxxxxxxxx",
      "create_time_str": "2026/9/4 20:13:20",
      "tags": ["#AI", "#教程"]
    }
  ]
}
```

---

## 📌 适用场景（我该不该用？）

- 需要短视频选题 → 关键词搜索 + 点赞排序
- 需要研究对标账号 → 按主页链接抓取其公开作品（**一次抓一个账号**，多个账号逐条执行即可）
- 需要分析内容舆情 → 获取视频/图文评论
- 需要快速追热点 → 实时获取抖音热榜
- 需要做营销报告 → 输出结构化 JSON，自动落盘留存

## 🔍 和其他方式比，凭什么用它？

| 对比项         | 本技能                     | 手动刷抖音            | 自己写爬虫                   |
| -------------- | -------------------------- | --------------------- | ---------------------------- |
| 上手成本       | 一条命令，5 分钟接入       | 0，但整理数据极费时间 | 需要逆向/维护，门槛高        |
| 登录与封号风险 | **无需登录，只读公开数据** | 无                    | 高（需带登录态，易触发风控） |
| 数据结构       | 标准 JSON，字段齐全        | 手抄                  | 自己定义                     |
| 维护成本       | 平台负责更新               | 无                    | 接口一变就失效               |
| 配合 AI 分析   | 天然适配（stdout 纯 JSON） | 不适配                | 需额外处理                   |

## 🔧 参数详解表

> 详细选项参数说明， 可参阅 [完整选项说明](references/options.md)
>
> LLM理解技能的详细选项，可参阅技能 `assets` 目录中文件，其遵循 JSON Schema draft-07 版本规范。
>
> - 抖音关键词搜索，[入参规范](assets/search_cli_req.schema.json)
> - 抖音关键词搜索，[出参规范](assets/search_cli_resp.schema.json)
> - 抖音博主作品获取，[入参规范](assets/post_cli_req.schema.json)
> - 抖音博主作品获取，[出参规范](assets/post_cli_resp.schema.json)
> - 抖音评论获取，[入参规范](assets/comment_cli_req.schema.json)
> - 抖音评论获取，[出参规范](assets/comment_cli_resp.schema.json)
> - 抖音热榜获取，[出参规范](assets/hot_cli_resp.schema.json)

## ⚠️ 重要限制（不踩坑）

- 仅抓取抖音**公开**数据，不支持私密/隐藏内容
- 需要配置 `GUAIKEI_API_TOKEN` 才能运行；调用会把关键词/链接发送至第三方 API（www.guaikei.com）
- 数据仅限个人/团队内部使用，禁止违规分发
- 单次调用通常 10-60 秒出结果（任务创建 + 轮询），limit 越大越慢

## ❓ 常见问题（秒解决）

> **Q：运行报错，提示无权限 / 退出码 3？**
>
> A：TOKEN 未配置或无效。配置环境变量：
>
> - Windows: `set GUAIKEI_API_TOKEN=你的TOKEN`
> - Linux/MacOS: `export GUAIKEI_API_TOKEN=你的TOKEN`
> - 请注意 TOKEN 保密，避免泄露给他人

> **Q：搜索结果为空？**
>
> A：换常用关键词，或把 `--time` 改为 0（全部时间）。空结果退出码为 0，属正常情况。

> **Q：输出文件在哪里？**
>
> A：搜索/作品/评论任务的结果会自动保存在技能目录的 `logs` 文件夹下：
>
> - 搜索任务：`时间戳_关键词_排序_时间_时长_类型_search.json`
> - 博主作品：`时间戳_(博主sec_uid)_post.json`
> - 评论获取：`时间戳_(视频aweme_id)_comment.json`
> - （热榜为实时直读，不落盘）

> **Q：支持哪些链接形式？**
>
> A：PC 链接（`douyin.com/user/xxx`、`douyin.com/video/xxx`、`douyin.com/note/xxx`）、App 短链（`v.douyin.com/xxx`）、`iesdouyin.com` 分享链接、sec_uid、aweme_id。链接里的 `?from_tab_name=` 等参数会自动剥离，直接粘贴整段分享文案也可以。

> **Q：单次最多多少条？调用失败扣不扣量？**
>
> A：搜索/作品/评论单次上限 10000 条；具体计费口径以官网说明为准。

> **Q：支持 Windows/Mac/Linux 吗？**
>
> A：全平台支持，仅需安装 Node.js（16.14.0+）。

> **Q：支持批量抓多个账号吗？**
>
> A：当前版本一次抓取一个账号，多个账号请逐条执行。

## 📞 帮助与支持

- 🌐 **自助开通 TOKEN / 查阅使用帮助**：[抖音爆款挖掘技能官网](https://www.guaikei.com)（推荐，最快）
- 💬 联系微信 `13395823479`（备注"抖音技能"）开通 TOKEN 或获得使用支持

> 🆕 [更新日志](references/changelog.md) | 参数详情见 [references/options.md](references/options.md)

## 🛑 错误处理与重试策略（AI 使用者必读）

### 遇到以下错误，立即停止操作并向用户报告

- **权限错误**（退出码 3，`AUTH_REQUIRED`/`AUTH_ERROR`）：TOKEN 未配置、无效或过期，提示用户重新配置，**不要重试**
- **API 次数超限**：提示用户联系客服开通更高额度
- **网络错误连续 3 次失败**：提示用户检查网络连接

### 禁止行为

- ❌ 不要在收到权限错误后继续重试
- ❌ 不要在 API 返回明确错误码后擅自修改参数重试
- ❌ 不要在用户未明确要求的情况下自动调整搜索条件
- ❌ 不要编造数据，不要把空结果当成功

### 正确做法

- ✅ 遇到错误，向用户展示错误信息（`error_code` + `message`）
- ✅ 询问用户是否需要调整参数或重新尝试
- ✅ 网络超时可重试，最多 3 次后停止
