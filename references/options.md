# 抖音内容引擎 完整选项参数说明

## 🔎 抖音关键词搜索

| 参数         | 缩写 | 作用         | 可选值                                                 | 必填 | 默认值 |
| :----------- | :--: | :----------- | :----------------------------------------------------- | :--- | :----: |
| `--keyword`  | `-k` | 搜索关键词   | 2-50 位长度的字符或单词                                | 是   |        |
| `--sort`     | `-s` | 排序方式     | 0 = 综合排序 / 1 = 最多点赞 / 2 = 最新发布             | 否   |   0    |
| `--time`     | `-t` | 时间范围     | 0 = 全部 / 1 = 一天内 / 7 = 七天内 / 180 = 半年内      | 否   |   0    |
| `--duration` | `-d` | 视频时长     | 0 = 不限 / 1 = 1分钟以下 / 2 = 1-5分钟 / 3 = 5分钟以上 | 否   |   0    |
| `--content`  | `-c` | 内容类型     | 0 = 不限 / 1 = 视频 / 2 = 图文                         | 否   |   0    |
| `--limit`    | `-l` | 获取数量     | 1-10000 条                                             | 否   |   10   |
| `--help`     | `-h` | 显示帮助信息 |                                                        | 否   |        |

```bash
# **基础语法**
node src/douyin/search-cli.js --keyword <关键词> --sort <排序方式> --time <时间范围> --duration <视频时长> --content <内容类型> --limit <获取数量>

# **使用示例**

# 搜索"AI 教程"的抖音内容
node src/douyin/search-cli.js --keyword "AI 教程"

# 搜索 AI 获取最多点赞的抖音内容
node src/douyin/search-cli.js --keyword "AI" --sort 1

# 搜索近7天"AI 模型"的抖音内容
node src/douyin/search-cli.js --keyword "AI 模型" --time 7

# 搜索"AI 教程"视频时长在5分钟以上的抖音内容
node src/douyin/search-cli.js --keyword "AI 教程" --duration 3

# 搜索半年内最新20条"AI 教程"的抖音内容
node src/douyin/search-cli.js --keyword "AI 教程" --sort 2 --time 180 --limit 20
```

## 🦸 抖音博主作品获取

| 参数      | 缩写 | 作用                     | 可选值     | 必填 | 默认值 |
| :-------- | :--: | :----------------------- | :--------- | :--- | :----: |
| `--url`   | `-u` | 抖音博主主页URL或sec_uid |            | 是   |        |
| `--limit` | `-l` | 获取作品数量             | 0-10000 条 | 否   |   10   |
| `--help`  | `-h` | 显示帮助信息             |            | 否   |        |

> **💡"抖音博主主页URL"说明**
>
> - PC端 ( 格式：<https://www.douyin.com/user/MS4wLjABxxx> )
> - 移动端 ( 格式：<https://v.douyin.com/xxx> )
> - 技能关键词搜索返回的author_sec_uid字段

```bash
# **基础语法**
node src/douyin/post-cli.js --url "https://www.douyin.com/user/MS4wLjABxxx"

# **使用示例**

# 获取抖音博主 MS4wLjABxxx 已发布的20条作品
node src/douyin/post-cli.js --url "https://www.douyin.com/user/MS4wLjABxxx" --limit 20

# 获取抖音博主 MS4wLjABxxx 的互动数据（关注数、粉丝数、总获赞数）等信息。
node src/douyin/post-cli.js -u "https://www.douyin.com/user/MS4wLjABxxx" -l 0
```

## 💬 抖音作品评论数据

| 参数      | 缩写 | 作用                          | 可选值     | 必填 | 默认值 |
| :-------- | :--: | :---------------------------- | :--------- | :--- | :----: |
| `--url`   | `-u` | 抖音视频(或图文)URL或aweme_id |            | 是   |        |
| `--limit` | `-l` | 获取评论数量                  | 1-10000 条 | 否   |   10   |
| `--help`  | `-h` | 显示帮助信息                  |            | 否   |        |

```bash
# **基础语法**
node src/douyin/comment-cli.js --url "https://www.douyin.com/video/xxx"

# **使用示例**

# 获取视频 xxx 的100条评论
node src/douyin/comment-cli.js --url "https://www.douyin.com/video/xxx" --limit 100
```

## 📡 抖音热搜榜单

- 无需参数

```bash
# **基础语法**
node src/douyin/hot-cli.js
```
