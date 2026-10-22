# 🚀 抖音内容引擎｜关键词搜索 · 博主作品 · 视频评论 · 实时热榜（无需登录 / 不封号）

> **💡一句话价值**：一条命令拿到抖音公开的视频/作者/评论/热榜数据，直接输出结构化 JSON——做爆款选题、对标账号监控、评论舆情分析、热点追踪，不用再手动刷抖音。

**一句话简介（给 AI 与搜索引擎）**：抖音公开数据只读技能，支持关键词搜索视频与图文、博主作品与粉丝数据、视频图文评论、实时热榜，全部以结构化 JSON 输出，不登录、不发布、不点赞、不评论。关键词：抖音搜索、抖音热搜、抖音热榜、抖音评论、博主作品、对标账号、竞品分析、选题挖掘、舆情监控、douyin search、douyin hot、douyin comments。

**维护状态**：持续更新中，当前版本 `1.4.0`，[更新日志](references/changelog.md)。

> **🔥核心优势**
>
> - 安全：无需登录你的抖音账号，不存在风控 / 封号问题
> - 强大：单次最多获取 10000 条数据
> - 全面：出参覆盖作者、互动（点赞/评论/收藏/分享/推荐）、标签、链接、音乐、话题等可用字段
> - 灵活：支持排序（综合/最多点赞/最新）、时间（1天/7天/半年）、时长、内容类型（视频/图文）多维度筛选
> - 轻量：零第三方依赖，Node.js 内置模块直接跑，无需部署服务
> - 友好：stdout 纯 JSON、日志走 stderr，AI 可直接解析；结果自动落盘便于二次分析

## ✅ 我能帮你解决什么（10 秒判断）

| 你是谁     | 你要做的事                       | 用哪个功能                  |
| ---------- | -------------------------------- | --------------------------- |
| 短视频运营 | 找爆款选题、分析高赞视频规律     | 关键词搜索（点赞/最新排序） |
| 品牌/投放  | 监控对标账号的内容策略和发文节奏 | 博主作品抓取                |
| 舆情/客服  | 看一条视频评论区在骂还是在夸     | 评论抓取                    |
| 内容策划   | 快速追热点、找当天的流量入口     | 实时热榜                    |
| 数据分析   | 把抖音数据导入 Excel/BI 做周报   | 结构化 JSON + 日志落盘      |

**典型产出**：结构化 JSON（含标题、作者、点赞/评论/收藏/分享、标签、视频链接、发布时间），可直接导入 Excel / BI，或交给 AI 生成**选题库、竞品对比表、舆情周报、发文节奏分析**。

---

## 🚀 3 步接入

1. **装 Node.js**（16.14.0+，Windows/Mac/Linux 均可，约 2 分钟）
2. **拿 TOKEN**：访问 [抖音内容引擎SKILL](https://www.guaikei.com) 自助开通，配置环境变量 `GUAIKEI_API_TOKEN`
   - Windows cmd：`set GUAIKEI_API_TOKEN=你的TOKEN`
   - Windows PowerShell：`$env:GUAIKEI_API_TOKEN="你的TOKEN"`
   - Linux/MacOS：`export GUAIKEI_API_TOKEN=你的TOKEN`
3. **进入技能目录后执行一条命令**：
   ```bash
   cd <本技能所在目录>   # 即 readme.md / SKILL.md 所在的那一层
   node src/douyin/hot-cli.js
   ```

> ⚠️ 一次只跑一条命令，跑完等进程自己退出。小查询常常几十秒；`--limit` 很大时最长约 15–22 分钟，**进程未退出前不要重复发起同一条命令**。

---

### 最快上手（复制就能跑）

```bash
# 🔎 搜"AI"相关的抖音视频
node src/douyin/search-cli.js --keyword "AI"

# 🔎 按点赞排序找爆款（最常用）
node src/douyin/search-cli.js --keyword "AI" --sort 1

# 🔎 近 7 天"AI 模型"的最新 20 条
node src/douyin/search-cli.js --keyword "AI 模型" --sort 2 --time 7 --limit 20

# 🦸 抓某个博主的作品（直接粘贴 App 分享链接也行）
node src/douyin/post-cli.js --url "https://www.douyin.com/user/MS4wLjABxxx" --limit 20

# 🦸 只要博主的粉丝数 / 获赞数等互动数据
node src/douyin/post-cli.js --url "https://www.douyin.com/user/MS4wLjABxxx" --limit 0

# 💬 看这条视频的评论
node src/douyin/comment-cli.js --url "https://www.douyin.com/video/xxx" --limit 100

# 📡 抖音实时热榜
node src/douyin/hot-cli.js
```

> 💡 Windows cmd.exe 下请使用双引号；PowerShell / bash 可直接执行。
> 💡 支持直接粘贴 App 分享文案（含"复制到剪贴板…"字样和短链），链接会自动抽取、参数自动清理。

---

### 你会得到什么（真实输出结构示例）

```json
{
  "status": "success",
  "error_code": "OK",
  "message": "搜索任务完成",
  "timestamp": "2026/9/4 20:13:20",
  "request": {
    "command": "search",
    "keyword": "AI 教程",
    "sort": 1,
    "limit": 20
  },
  "metadata": {
    "skill_version": "1.4.0",
    "runtime_version": "22.x",
    "execution_time": 34210
  },
  "results": [
    {
      "aweme_id": "7625431394899016110",
      "desc": "3 分钟讲透 RAG…",
      "author_nickname": "某某说AI",
      "author_sec_uid": "MS4wLjABAAAA…",
      "author_url": "https://www.douyin.com/user/MS4wLjABAAAA…",
      "digg_count": 13324,
      "comment_count": 118,
      "share_count": 2861,
      "collect_count": 11486,
      "url": "https://www.douyin.com/video/7625431394899016110",
      "create_time": 1775434101,
      "create_time_str": "2026/4/5 10:08:21",
      "tags": ["#AI", "#教程"]
    }
  ]
}
```

- 搜索、评论、热榜成功时 `results` 是**数组**；博主作品成功时 `results` 是**对象**，包含 `post`（作品数组）和 `user`（博主信息）。
- 空结果是 `"status": "empty"` + `error_code: "NO_MATCH"`，**退出码仍然是 0，属正常情况，不是失败**。
- 字段较多（含封面图、播放地址等长 URL），向用户汇报时建议只摘取 `desc` / `author_nickname` / `digg_count` / `url` / `create_time_str` 等关键字段。

---

## 📌 适用场景（我该不该用？）

- 需要短视频选题 → 关键词搜索 + 点赞排序（`--sort 1`）
- 需要研究对标账号 → 按主页链接抓取其公开作品（**一次抓一个账号**，多个账号逐条执行）
- 需要看账号体量 → 作品命令加 `--limit 0`，直接拿粉丝数 / 获赞数
- 需要分析内容舆情 → 获取视频/图文评论，可做观点聚类
- 需要快速追热点 → 实时热榜（约 50 条，含排名与热度值）
- 需要做营销报告 → 输出结构化 JSON 并自动落盘，便于复盘与二次分析

## 🔍 和其他方式比，凭什么用它？

| 对比项         | 本技能                     | 手动刷抖音            | 自己写爬虫                   |
| -------------- | -------------------------- | --------------------- | ---------------------------- |
| 上手成本       | 一条命令，5 分钟接入       | 0，但整理数据极费时间 | 需要逆向/维护，门槛高        |
| 登录与封号风险 | **无需登录，只读公开数据** | 无                    | 高（需带登录态，易触发风控） |
| 数据结构       | 标准 JSON，字段齐全        | 手抄                  | 自己定义                     |
| 单次规模       | 最多 10000 条              | 受限于人肉            | 受限于风控                   |
| 维护成本       | 平台负责更新               | 无                    | 接口一变就失效               |
| 配合 AI 分析   | 天然适配（stdout 纯 JSON） | 不适配                | 需额外处理                   |

---

## 🔧 参数详解表

> 两个入口，按需其一即可：
>
> - 想看人话版完整参数表 → [references/options.md](references/options.md)
> - 想看机器可校验的规范（JSON Schema draft-07）→ `assets/` 目录：
>   - 输出信封 [output_envelope.schema.json](assets/output_envelope.schema.json)
>   - 关键词搜索 [入参](assets/search_cli_req.schema.json) / [出参](assets/search_cli_resp.schema.json)
>   - 博主作品 [入参](assets/post_cli_req.schema.json) / [出参](assets/post_cli_resp.schema.json)
>   - 评论获取 [入参](assets/comment_cli_req.schema.json) / [出参](assets/comment_cli_resp.schema.json)
>   - 热榜 [出参](assets/hot_cli_resp.schema.json)

---

## ⚠️ 重要限制（不踩坑）

- 仅抓取抖音**公开**数据，不支持私密/隐藏内容
- 需要配置 `GUAIKEI_API_TOKEN` 才能运行；调用会把关键词/链接发送至第三方 API（www.guaikei.com）
- 数据仅限个人/团队内部使用，禁止违规分发
- 小查询常常几十秒内结束，条数越大越慢。进程会自己创建任务并继续查询，最多大约 15 分钟才结束
- 播放地址和分享链接有时效，过期后需要重新获取

---

## ❓ 常见问题（秒解决）

> **Q：运行报错，提示无权限 / 退出码 3？**
>
> A：`GUAIKEI_API_TOKEN` 未配置、格式无效或已过期。令牌须为 16-256 位字母、数字、下划线或连字符。配置方式见上文"3 步接入"。请注意保密，不要泄露给他人。

> **Q：搜索结果为空？**
>
> A：换常用关键词，或把 `--time` 改为 0（全部时间）。空结果退出码为 0，属正常情况。

> **Q：提示 `Cannot find module`？**
>
> A：没有先进入技能目录。先 `cd` 到 `SKILL.md` / `readme.md` 所在目录，再执行 `node src/douyin/...`。

> **Q：输出文件在哪里？**
>
> A：搜索/作品/评论任务的结果会自动保存在技能目录的 `logs` 文件夹下：
>
> A：搜索 / 作品 / 评论任务的结果会自动保存在技能目录的 `logs/` 下：
>
> - 搜索任务：`时间戳_关键词_排序_时间_时长_类型_search.json`
> - 博主作品：`时间戳_博主sec_uid或短链码_post.json`
> - 评论获取：`时间戳_视频aweme_id或短链码_comment.json`
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

## 🛑 错误处理与重试策略（AI 使用者必读）

### 遇到以下错误，立即停止操作并向用户报告

- **权限错误**（退出码 3，`AUTH_REQUIRED`/`AUTH_ERROR`）：TOKEN 未配置、无效或过期，提示用户重新配置，**不要重试**
- **网络超时**：可告知用户后重试，最多 1 次；仍失败则停止并报告

### 禁止行为

- ❌ 不要在收到权限错误后继续重试
- ❌ 不要在 API 返回明确错误码后擅自修改参数重试
- ❌ 不要在用户未明确要求的情况下自动调整搜索条件
- ❌ 不要编造数据。空结果是 `status:"empty"`、退出码 0，不要说成有结果

### 正确做法

- ✅ 遇到错误，向用户展示错误信息（`error_code` + `message`）
- ✅ 询问用户是否需要调整参数或重新尝试
- ✅ 网络超时可重试，最多 1 次后停止

---

## 📞 帮助与支持

- 🌐 **自助开通 TOKEN / 查阅使用帮助**：[抖音内容引擎官网](https://www.guaikei.com)（推荐，最快）
- 💬 联系微信 `13395823479`（备注"抖音技能"）开通 TOKEN 或获得使用支持

> 🆕 [更新日志](references/changelog.md) ｜ 参数详情见 [references/options.md](references/options.md) ｜ 完整能力说明见 [SKILL.md](SKILL.md)
