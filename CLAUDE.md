# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

微信原生小程序「恋爱人格测试」。用户完成18道单选题，客户端计算6维度得分，匹配16种人格类型之一，结果页支持 Canvas 2D 生成分享图保存到相册。**纯本地计算，无后端，无构建工具。**

## Development

无构建步骤。在**微信开发者工具**中导入项目根目录即可运行。

```bash
# 逻辑验证（不依赖微信运行时）
node -e "
  const { calcDimensionScores, scoresToKey, matchResult } = require('./utils/score')
  const answers = Array(18).fill(null).map((_, i) => ({
    dimension: ['intimacy','emotion','boundary','security','expression','goal'][Math.floor(i/3)],
    score: i % 2
  }))
  const scores = calcDimensionScores(answers)
  console.log(scoresToKey(scores), matchResult(scoresToKey(scores)).name)
"

# 静态预览（三页 UI 效果）
open preview.html
```

## Architecture

### 数据流

```
首页(index) → [打乱题目顺序，写入 globalData.shuffledQuestions]
  → 答题页(quiz) → [逐题记录 answers[], 计算分数，写入 globalData.quizResult]
    → 结果页(result) → [读取 quizResult，渲染，Canvas 生成分享图]
```

页面间通信**全部通过 `getApp().globalData`**，不使用 URL 参数。result 页 `onLoad` 检测 globalData 为空时自动跳回首页。

### 计分逻辑（`utils/score.js`）

每道题4个选项各有 `score: 0|1`。每个维度3道题，最高得分3分。  
**阈值**：`score >= 2` → H（高端），`score <= 1` → L（低端）。  
6个维度按固定顺序 `intimacy / emotion / boundary / security / expression / goal` 拼成6位字符串（如 `"HHLHLL"`），精确匹配 `results.js` 中的 `key` 字段；无精确匹配则用**汉明距离**找最近的人格类型。

### 数据文件

- `data/dimensions.js` — 维度顺序**不能改变**，`scoresToKey()` 和 `buildDimensionTags()` 依赖此顺序
- `data/results.js` — 每条记录的 `key` 必须是合法的6位 H/L 字符串；现有16种未覆盖所有64种组合，靠汉明距离兜底
- `data/questions.js` — 每个维度恰好3题；`score` 字段只能是 `0` 或 `1`

### Canvas 分享图（`pages/result/result.js`）

使用 Canvas 2D API（`type="2d"`），canvas 节点通过 `wx.createSelectorQuery` 获取。  
画布实际像素 = `375 × dpr` × `500 × dpr`，绘制坐标使用逻辑像素（已 `ctx.scale(dpr, dpr)`）。  
导出链路：`canvasToTempFilePath` → `saveImageToPhotosAlbum`（需 `scope.writePhotosAlbum` 权限，微信会在调用 `saveImageToPhotosAlbum` 时自动弹出授权弹窗，无需在 `app.json` 预声明）。

## 已知 WXSS 限制

微信小程序 WXSS 不支持通配符 `*` 选择器，`app.wxss` 中不要使用。
