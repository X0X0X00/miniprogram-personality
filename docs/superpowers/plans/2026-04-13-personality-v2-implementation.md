# 恋爱人格测试 v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add fast/slow dual-speed modes and couple compatibility mode to the existing WeChat miniprogram.

**Architecture:** Data layer (questions + compat algorithm) → utils layer (score.js threshold param + new compat.js) → page layer (index rework, quiz multi-mode, result update, two new pages) → cloud layer (3 cloud functions for room management).

**Tech Stack:** WeChat Native Miniprogram (WXML/WXSS/JS), WeChat CloudBase (cloud functions + real-time DB), Canvas 2D API, Node.js (logic verification only).

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Rename | `data/questions.js` → `data/questions-fast.js` | 18-question fast bank |
| Create | `data/questions-slow.js` | 30-question slow bank |
| Create | `utils/compat.js` | `calcCompatibility()` + `compatLabel()` |
| Modify | `utils/score.js` | Add `threshold` param to `scoresToKey()` and `buildDimensionTags()` |
| Modify | `app.js` | Cloud init + new globalData fields |
| Modify | `app.json` | Register new pages + cloud config |
| Modify | `pages/index/index.js` | Mode selection logic |
| Modify | `pages/index/index.wxml` | Mode selection UI |
| Modify | `pages/index/index.wxss` | Mode selection styles |
| Modify | `pages/quiz/quiz.js` | Load questions by mode, use threshold |
| Modify | `pages/result/result.js` | Couple mode CTA + submitResult |
| Modify | `pages/result/result.wxml` | Couple mode button |
| Create | `pages/couple-room/couple-room.js` | Room create/join/waiting logic |
| Create | `pages/couple-room/couple-room.wxml` | Room UI |
| Create | `pages/couple-room/couple-room.wxss` | Room styles |
| Create | `pages/couple-room/couple-room.json` | Page config |
| Create | `pages/couple-result/couple-result.js` | Compatibility display + canvas share |
| Create | `pages/couple-result/couple-result.wxml` | Compatibility UI |
| Create | `pages/couple-result/couple-result.wxss` | Compatibility styles |
| Create | `pages/couple-result/couple-result.json` | Page config |
| Create | `cloudfunctions/createRoom/index.js` | Generate room code, create DB doc |
| Create | `cloudfunctions/createRoom/package.json` | Cloud function deps |
| Create | `cloudfunctions/joinRoom/index.js` | Validate code, register player B |
| Create | `cloudfunctions/joinRoom/package.json` | Cloud function deps |
| Create | `cloudfunctions/submitResult/index.js` | Write result, set both_ready if done |
| Create | `cloudfunctions/submitResult/package.json` | Cloud function deps |

---

## Task 1: Rename questions.js and create questions-slow.js

**Files:**
- Rename: `data/questions.js` → `data/questions-fast.js`
- Create: `data/questions-slow.js`

- [ ] **Step 1: Rename the existing questions file**

```bash
cd /home/zhangzhenhao/miniprogram-personality
mv data/questions.js data/questions-fast.js
```

- [ ] **Step 2: Verify rename**

```bash
ls data/
```
Expected output includes `questions-fast.js` (no `questions.js`).

- [ ] **Step 3: Create questions-slow.js**

Create `data/questions-slow.js` with this exact content:

```js
// 慢速模式题库 — 30题，5题/维度
// 维度顺序: intimacy, emotion, boundary, security, expression, goal
// 每题4选项，A/B = score 0，C/D = score 1
// 阈值: score >= 3 → H（由 quiz.js 传给 scoresToKey）

const questions = [
  // === intimacy（亲密主动性）===
  {
    id: 's1',
    text: '认识一个很喜欢的人，你会？',
    dimension: 'intimacy',
    options: [
      { text: '等他/她先表白，我不擅长主动', score: 0 },
      { text: '找各种理由接近，但不说破', score: 0 },
      { text: '暗示一下，观察对方的反应', score: 1 },
      { text: '直接表达，不想浪费时间', score: 1 },
    ],
  },
  {
    id: 's2',
    text: '在你们的关系里，约会计划通常是谁发起？',
    dimension: 'intimacy',
    options: [
      { text: '几乎都是对方', score: 0 },
      { text: '对方多一点，偶尔我会', score: 0 },
      { text: '我多一点', score: 1 },
      { text: '几乎都是我', score: 1 },
    ],
  },
  {
    id: 's3',
    text: '对方几天没有主动联系你，你会？',
    dimension: 'intimacy',
    options: [
      { text: '等他/她联系，不想打扰', score: 0 },
      { text: '发一条无关紧要的消息试探', score: 0 },
      { text: '直接问："最近怎么了？"', score: 1 },
      { text: '直接打电话，我不喜欢猜', score: 1 },
    ],
  },
  {
    id: 's4',
    text: '节假日，你倾向于？',
    dimension: 'intimacy',
    options: [
      { text: '等对方安排，我负责配合', score: 0 },
      { text: '发"有什么想法吗？"等对方回应', score: 0 },
      { text: '列一张选项清单，让对方挑', score: 1 },
      { text: '直接订好，给对方一个惊喜', score: 1 },
    ],
  },
  {
    id: 's5',
    text: '面对想要的关系进展（如同居、旅行），你会？',
    dimension: 'intimacy',
    options: [
      { text: '等对方先提，我不敢开口', score: 0 },
      { text: '多说几次"感觉不错"来暗示', score: 0 },
      { text: '趁着好时机开口讨论', score: 1 },
      { text: '直接提议，并给出我的理由', score: 1 },
    ],
  },

  // === emotion（情感深度）===
  {
    id: 's6',
    text: '电影里出现感人场景，你会？',
    dimension: 'emotion',
    options: [
      { text: '冷静看完，思考剧情逻辑', score: 0 },
      { text: '有点触动，但会压住', score: 0 },
      { text: '悄悄湿了眼眶', score: 1 },
      { text: '直接哭出来，不觉得尴尬', score: 1 },
    ],
  },
  {
    id: 's7',
    text: '分手之后，你主要靠什么走出来？',
    dimension: 'emotion',
    options: [
      { text: '分析这段关系为什么失败', score: 0 },
      { text: '专注工作或其他事情转移注意力', score: 0 },
      { text: '和朋友倾诉，慢慢释放情绪', score: 1 },
      { text: '写日记，充分经历这段悲伤', score: 1 },
    ],
  },
  {
    id: 's8',
    text: '你认为爱情最重要的是？',
    dimension: 'emotion',
    options: [
      { text: '互相尊重，长期稳定', score: 0 },
      { text: '价值观一致，彼此合适', score: 0 },
      { text: '心动与激情，有情绪流动', score: 1 },
      { text: '灵魂上的契合与深度共鸣', score: 1 },
    ],
  },
  {
    id: 's9',
    text: '看到对方突然低落，你的第一反应？',
    dimension: 'emotion',
    options: [
      { text: '问问发生了什么，看能否解决', score: 0 },
      { text: '陪着，不主动问，给空间', score: 0 },
      { text: '轻轻抱着，说"我在"', score: 1 },
      { text: '想方设法逗他/她开心，心里很揪', score: 1 },
    ],
  },
  {
    id: 's10',
    text: '对于"两人世界"，你更看重？',
    dimension: 'emotion',
    options: [
      { text: '共同完成一件有意义的事', score: 0 },
      { text: '一起讨论有趣的话题', score: 0 },
      { text: '单纯地待在一起，感受彼此', score: 1 },
      { text: '分享最深处的感受和秘密', score: 1 },
    ],
  },

  // === boundary（边界感）===
  {
    id: 's11',
    text: '恋爱后，对于个人时间你会？',
    dimension: 'boundary',
    options: [
      { text: '基本都想和对方在一起', score: 0 },
      { text: '偶尔需要一个人的时间', score: 0 },
      { text: '每周要保留几个固定的"自己时间"', score: 1 },
      { text: '无论多爱，我的私人空间不能少', score: 1 },
    ],
  },
  {
    id: 's12',
    text: '对方提出看你的手机，你的感受？',
    dimension: 'boundary',
    options: [
      { text: '完全没问题，我没什么可藏的', score: 0 },
      { text: '有点奇怪，但可以接受', score: 0 },
      { text: '会婉拒，但会解释为什么', score: 1 },
      { text: '不行，这是我的底线', score: 1 },
    ],
  },
  {
    id: 's13',
    text: '发展到什么程度，你愿意共享账户密码？',
    dimension: 'boundary',
    options: [
      { text: '在一起就可以，互相透明最好', score: 0 },
      { text: '稳定了之后，会主动分享', score: 0 },
      { text: '对方真的需要时才给，不主动', score: 1 },
      { text: '不会，无论关系多好', score: 1 },
    ],
  },
  {
    id: 's14',
    text: '伴侣想参加你和老朋友的聚会，你会？',
    dimension: 'boundary',
    options: [
      { text: '当然欢迎！越热闹越好', score: 0 },
      { text: '可以，稍微打个招呼就行', score: 0 },
      { text: '希望提前说一声，我来安排', score: 1 },
      { text: '婉拒，老友局想单独维护', score: 1 },
    ],
  },
  {
    id: 's15',
    text: '你希望伴侣了解你的程度是？',
    dimension: 'boundary',
    options: [
      { text: '完全透明，无秘密', score: 0 },
      { text: '大部分都知道，小事不用说', score: 0 },
      { text: '知道我的主要面貌，有些事保留', score: 1 },
      { text: '我有一些不分享给任何人的部分', score: 1 },
    ],
  },

  // === security（安全感）===
  {
    id: 's16',
    text: '伴侣去外地出差一周，你会？',
    dimension: 'security',
    options: [
      { text: '每天固定打电话报平安', score: 0 },
      { text: '希望他/她有空多联系我', score: 0 },
      { text: '自己也过得充实，想了就联系', score: 1 },
      { text: '这段时间正好做自己想做的事', score: 1 },
    ],
  },
  {
    id: 's17',
    text: '伴侣和异性好友外出，你的感受？',
    dimension: 'security',
    options: [
      { text: '会反复想，有点不安', score: 0 },
      { text: '希望他/她多汇报一点', score: 0 },
      { text: '信任他/她，偶尔会想一下', score: 1 },
      { text: '完全没影响，各有各的朋友很好', score: 1 },
    ],
  },
  {
    id: 's18',
    text: '你理想中两人关系的状态是？',
    dimension: 'security',
    options: [
      { text: '每天都黏在一起，不分开', score: 0 },
      { text: '主要时间在一起，偶尔分开', score: 0 },
      { text: '有各自生活，也有共同时间', score: 1 },
      { text: '独立生活为主，约好了才聚', score: 1 },
    ],
  },
  {
    id: 's19',
    text: '对于婚姻/长期承诺，你的态度？',
    dimension: 'security',
    options: [
      { text: '越早确定越好，给我安全感', score: 0 },
      { text: '到一定阶段自然水到渠成', score: 0 },
      { text: '不急，看缘分和时机', score: 1 },
      { text: '不一定需要形式，感情才重要', score: 1 },
    ],
  },
  {
    id: 's20',
    text: '如果对方突然需要"冷静期"，你的反应？',
    dimension: 'security',
    options: [
      { text: '非常担心，需要知道原因', score: 0 },
      { text: '焦虑，但会尽力等', score: 0 },
      { text: '理解，给对方空间', score: 1 },
      { text: 'OK，我也正好好好想想', score: 1 },
    ],
  },

  // === expression（表达方式）===
  {
    id: 's21',
    text: '喜欢一个人的时候，你更愿意？',
    dimension: 'expression',
    options: [
      { text: '默默做好每一件小事', score: 0 },
      { text: '偶尔准备一个小惊喜', score: 0 },
      { text: '用语言经常告诉他/她', score: 1 },
      { text: '在社交平台公开表达', score: 1 },
    ],
  },
  {
    id: 's22',
    text: '朋友问你最近感情怎样，你会？',
    dimension: 'expression',
    options: [
      { text: '"还好啦"，一笔带过', score: 0 },
      { text: '说些基本情况，不深入', score: 0 },
      { text: '聊一聊，分享些趣事', score: 1 },
      { text: '详细倾诉，有烦恼也说', score: 1 },
    ],
  },
  {
    id: 's23',
    text: '对于情侣之间的争吵，你通常？',
    dimension: 'expression',
    options: [
      { text: '安静下来，等情绪平稳再说', score: 0 },
      { text: '把想说的写出来再沟通', score: 0 },
      { text: '当面说清楚，不喜欢拖', score: 1 },
      { text: '情绪上来就直接表达，包括发火', score: 1 },
    ],
  },
  {
    id: 's24',
    text: '你希望伴侣如何表达爱？',
    dimension: 'expression',
    options: [
      { text: '默默关照我的生活细节', score: 0 },
      { text: '在我需要时出现', score: 0 },
      { text: '经常说出来，我需要被告知', score: 1 },
      { text: '对外也让人知道我们很好', score: 1 },
    ],
  },
  {
    id: 's25',
    text: '对于情侣纪念日，你会？',
    dimension: 'expression',
    options: [
      { text: '默默记着，低调庆祝', score: 0 },
      { text: '做一件他/她喜欢的事', score: 0 },
      { text: '精心策划，认真庆祝', score: 1 },
      { text: '公开晒出来，大家见证', score: 1 },
    ],
  },

  // === goal（关系目标）===
  {
    id: 's26',
    text: '理想的伴侣关系中，你更希望？',
    dimension: 'goal',
    options: [
      { text: '有人每天陪伴，不孤单', score: 0 },
      { text: '共同建立稳定的家庭生活', score: 0 },
      { text: '互相激励，一起变得更好', score: 1 },
      { text: '各自追求目标，彼此支持', score: 1 },
    ],
  },
  {
    id: 's27',
    text: '如果伴侣有重要机会但需要异地，你会？',
    dimension: 'goal',
    options: [
      { text: '希望他/她留下，陪伴更重要', score: 0 },
      { text: '不情愿，但会支持短期分离', score: 0 },
      { text: '支持，分开不影响感情', score: 1 },
      { text: '非常鼓励，各自发展才健康', score: 1 },
    ],
  },
  {
    id: 's28',
    text: '你希望这段关系带给你的最大价值是？',
    dimension: 'goal',
    options: [
      { text: '有人懂我，不再孤单', score: 0 },
      { text: '家庭的温暖与稳定', score: 0 },
      { text: '相互成长，突破自我', score: 1 },
      { text: '自由地探索世界，有伴同行', score: 1 },
    ],
  },
  {
    id: 's29',
    text: '对于伴侣的职业发展，你更希望？',
    dimension: 'goal',
    options: [
      { text: '稳定工作，多陪伴家庭', score: 0 },
      { text: '适当发展，兼顾家庭', score: 0 },
      { text: '全力追求梦想，我全力支持', score: 1 },
      { text: '各自拼搏，不因彼此妥协', score: 1 },
    ],
  },
  {
    id: 's30',
    text: '五年后，你希望你们的关系是？',
    dimension: 'goal',
    options: [
      { text: '默契的老夫老妻，平静舒适', score: 0 },
      { text: '有了孩子，构建完整的家', score: 0 },
      { text: '各自有成就，相互引以为傲', score: 1 },
      { text: '还在不断探索和挑战的路上', score: 1 },
    ],
  },
]

module.exports = { questions }
```

- [ ] **Step 4: Verify question count**

```bash
node -e "
const { questions } = require('./data/questions-slow')
const dims = {}
questions.forEach(q => { dims[q.dimension] = (dims[q.dimension] || 0) + 1 })
console.log('Total:', questions.length)
console.log('Per dim:', dims)
"
```

Expected:
```
Total: 30
Per dim: { intimacy: 5, emotion: 5, boundary: 5, security: 5, expression: 5, goal: 5 }
```

- [ ] **Step 5: Commit**

```bash
git add data/questions-fast.js data/questions-slow.js
git commit -m "feat: add slow-mode question bank (30 questions, 5 per dimension)"
```

---

## Task 2: Update score.js to support configurable threshold

**Files:**
- Modify: `utils/score.js`

The current `scoresToKey()` and `buildDimensionTags()` hardcode threshold `>= 2`. Slow mode needs `>= 3`. Add an optional `threshold` parameter (default 2).

- [ ] **Step 1: Verify current behavior**

```bash
node -e "
const { scoresToKey, buildDimensionTags } = require('./utils/score')
const scores = { intimacy: 2, emotion: 1, boundary: 3, security: 2, expression: 1, goal: 3 }
console.log('key:', scoresToKey(scores))
"
```

Expected: `key: HLHHLH`

- [ ] **Step 2: Edit utils/score.js — add threshold param**

In `utils/score.js`, change lines 26-28 (`scoresToKey`) from:

```js
function scoresToKey(scores) {
  return dimensions.map(d => scores[d.id] >= 2 ? 'H' : 'L').join('')
}
```

To:

```js
function scoresToKey(scores, threshold = 2) {
  return dimensions.map(d => scores[d.id] >= threshold ? 'H' : 'L').join('')
}
```

And change lines 72-78 (`buildDimensionTags`) from:

```js
function buildDimensionTags(scores) {
  return dimensions.map(d => ({
    label: d.label,
    level: scores[d.id] >= 2 ? 'H' : 'L',
    tag: scores[d.id] >= 2 ? d.high : d.low,
  }))
}
```

To:

```js
function buildDimensionTags(scores, threshold = 2) {
  return dimensions.map(d => ({
    label: d.label,
    level: scores[d.id] >= threshold ? 'H' : 'L',
    tag: scores[d.id] >= threshold ? d.high : d.low,
  }))
}
```

- [ ] **Step 3: Verify backward compatibility and new behavior**

```bash
node -e "
const { calcDimensionScores, scoresToKey, buildDimensionTags } = require('./utils/score')

// Fast mode answers (18 questions, threshold 2)
const fastAnswers = Array(18).fill(null).map((_, i) => ({
  dimension: ['intimacy','emotion','boundary','security','expression','goal'][Math.floor(i/3)],
  score: i % 2
}))
const fastScores = calcDimensionScores(fastAnswers)
console.log('fast key (threshold 2):', scoresToKey(fastScores))
console.log('fast key (default):', scoresToKey(fastScores))

// Slow mode: score 3 → H, score 2 → L
const slowScores = { intimacy: 3, emotion: 2, boundary: 4, security: 1, expression: 3, goal: 2 }
console.log('slow key (threshold 3):', scoresToKey(slowScores, 3))
// Expected: HLHLLH → intimacy=3>=3=H, emotion=2<3=L, boundary=4>=3=H, security=1<3=L, expression=3>=3=H, goal=2<3=L
"
```

Expected last line: `slow key (threshold 3): HLHLHL`

- [ ] **Step 4: Commit**

```bash
git add utils/score.js
git commit -m "feat: add threshold param to scoresToKey and buildDimensionTags"
```

---

## Task 3: Create utils/compat.js

**Files:**
- Create: `utils/compat.js`

- [ ] **Step 1: Create the file**

Create `utils/compat.js`:

```js
// 契合度算法
// keyA, keyB: 6位 H/L 字符串，顺序: intimacy/emotion/boundary/security/expression/goal

const WEIGHTS = {
  intimacy:   0.10,
  emotion:    0.15,
  boundary:   0.20,
  security:   0.20,
  expression: 0.10,
  goal:       0.25,
}

const DIM_SCORES = {
  intimacy: {
    'H+L': 95, 'L+H': 95,
    'H+H': 60,
    'L+L': 25,
  },
  emotion: {
    'H+H': 95,
    'L+L': 90,
    'H+L': 45, 'L+H': 45,
  },
  boundary: {
    'H+H': 92,
    'L+L': 88,
    'H+L': 25, 'L+H': 25,
  },
  security: {
    'H+H': 90,
    'L+L': 90,
    'H+L': 30, 'L+H': 30,
  },
  expression: {
    'H+H': 88,
    'L+L': 85,
    'H+L': 58, 'L+H': 58,
  },
  goal: {
    'H+H': 98,
    'L+L': 95,
    'H+L': 20, 'L+H': 20,
  },
}

const DIM_ORDER = ['intimacy', 'emotion', 'boundary', 'security', 'expression', 'goal']

function calcCompatibility(keyA, keyB) {
  let total = 0
  DIM_ORDER.forEach((dim, i) => {
    const pair = `${keyA[i]}+${keyB[i]}`
    total += DIM_SCORES[dim][pair] * WEIGHTS[dim]
  })
  return Math.round(total)
}

function compatLabel(score) {
  if (score >= 85) return { label: '天作之合', desc: '核心价值高度一致，默契天成' }
  if (score >= 70) return { label: '默契伴侣', desc: '整体适配，小差异反而有趣' }
  if (score >= 55) return { label: '互补组合', desc: '有分歧但可互补，需要沟通' }
  if (score >= 40) return { label: '需要磨合', desc: '某些维度差距明显，需主动努力' }
  return { label: '差异显著', desc: '核心需求有冲突，挑战不小' }
}

// 返回最强和最弱的维度信息
function dimInsights(keyA, keyB) {
  const dimLabels = {
    intimacy: '亲密主动性',
    emotion: '情感深度',
    boundary: '边界感',
    security: '安全感',
    expression: '表达方式',
    goal: '关系目标',
  }
  const scored = DIM_ORDER.map((dim, i) => {
    const pair = `${keyA[i]}+${keyB[i]}`
    return { dim, label: dimLabels[dim], score: DIM_SCORES[dim][pair] }
  })
  scored.sort((a, b) => b.score - a.score)
  return {
    strongest: scored[0],
    weakest: scored[scored.length - 1],
    all: scored,
  }
}

module.exports = { calcCompatibility, compatLabel, dimInsights }
```

- [ ] **Step 2: Verify calculations**

```bash
node -e "
const { calcCompatibility, compatLabel, dimInsights } = require('./utils/compat')

// Perfect match: same values everywhere
const a = 'HHHHLL'
const b = 'HHHHLL'
const s1 = calcCompatibility(a, b)
console.log('Same keys:', s1, compatLabel(s1).label)

// Ideal intimacy complement, goal clash
const c = 'HLLLLH'
const d = 'LLLLLH'
const s2 = calcCompatibility(c, d)
console.log('Mixed:', s2, compatLabel(s2).label)

// Goal clash worst case
const e = 'LLLLLH'
const f = 'LLLLLH'  // both H on goal — same, should be high
const s3 = calcCompatibility(e, f)
console.log('Both H goal:', s3)

const ins = dimInsights('HLHLHL', 'LHLHLH')
console.log('Strongest:', ins.strongest.label, ins.strongest.score)
console.log('Weakest:', ins.weakest.label, ins.weakest.score)
"
```

Expected (approximately):
```
Same keys: 91 天作之合
Mixed: <some number>
Both H goal: 90
Strongest: 亲密主动性 95
Weakest: 关系目标 20
```

- [ ] **Step 3: Commit**

```bash
git add utils/compat.js
git commit -m "feat: add compatibility algorithm (calcCompatibility, compatLabel, dimInsights)"
```

---

## Task 4: Update app.js and app.json

**Files:**
- Modify: `app.js`
- Modify: `app.json`

- [ ] **Step 1: Update app.js**

Replace the entire `app.js` content:

```js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      // 替换为你的云开发环境 ID（微信开发者工具 → 云开发控制台 → 环境ID）
      env: 'your-env-id',
      traceUser: true,
    })
  },

  globalData: {
    shuffledQuestions: null,  // 当前答题题目（打乱后）
    quizResult: null,         // 单人结果 { result, tags, key }

    // 情侣模式专用
    mode: 'fast',             // 'fast' | 'slow'
    coupleMode: false,        // 是否情侣模式
    roomCode: '',             // 4位房间码
    roomId: '',               // 云DB文档ID
    myRole: '',               // 'A' | 'B'
  },
})
```

- [ ] **Step 2: Update app.json**

Replace the entire `app.json` content:

```json
{
  "pages": [
    "pages/index/index",
    "pages/quiz/quiz",
    "pages/result/result",
    "pages/couple-room/couple-room",
    "pages/couple-result/couple-result"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTitleText": "恋爱人格测试",
    "navigationBarTextStyle": "black"
  },
  "cloud": true,
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

- [ ] **Step 3: Commit**

```bash
git add app.js app.json
git commit -m "feat: init cloud in app.js, register new pages in app.json"
```

---

## Task 5: Rework index page (mode selection UI)

**Files:**
- Modify: `pages/index/index.js`
- Modify: `pages/index/index.wxml`
- Modify: `pages/index/index.wxss`

- [ ] **Step 1: Replace index.js**

```js
const { questions: fastQuestions } = require('../../data/questions-fast')
const { questions: slowQuestions } = require('../../data/questions-slow')

Page({
  data: {
    coupleExpanded: false,
    joiningCode: '',
  },

  // 快速模式：18题
  startFast() {
    const app = getApp()
    app.globalData.mode = 'fast'
    app.globalData.coupleMode = false
    const shuffled = [...fastQuestions].sort(() => Math.random() - 0.5)
    app.globalData.shuffledQuestions = shuffled
    wx.navigateTo({ url: '/pages/quiz/quiz' })
  },

  // 慢速模式：30题
  startSlow() {
    const app = getApp()
    app.globalData.mode = 'slow'
    app.globalData.coupleMode = false
    const shuffled = [...slowQuestions].sort(() => Math.random() - 0.5)
    app.globalData.shuffledQuestions = shuffled
    wx.navigateTo({ url: '/pages/quiz/quiz' })
  },

  // 展开/收起情侣模式面板
  toggleCouple() {
    this.setData({ coupleExpanded: !this.data.coupleExpanded })
  },

  // 情侣模式：创建房间
  createRoom() {
    wx.navigateTo({ url: '/pages/couple-room/couple-room?action=create' })
  },

  // 情侣模式：加入房间
  joinRoom() {
    wx.navigateTo({ url: '/pages/couple-room/couple-room?action=join' })
  },
})
```

- [ ] **Step 2: Replace index.wxml**

```xml
<view class="container">
  <view class="hero">
    <view class="title">恋爱人格测试</view>
    <view class="subtitle">测出你独特的恋爱人格类型</view>
  </view>

  <view class="desc-card">
    <text class="desc-text">每个人在感情里都有独特的方式。\n这份测试没有好坏之分，\n只有更了解自己。</text>
  </view>

  <!-- 单人模式 -->
  <view class="mode-section">
    <button class="mode-btn primary" bindtap="startFast">
      <view class="mode-btn-title">快速测试</view>
      <view class="mode-btn-sub">18题 · 约3分钟</view>
    </button>
    <button class="mode-btn secondary" bindtap="startSlow">
      <view class="mode-btn-title">深度测试</view>
      <view class="mode-btn-sub">30题 · 约8分钟</view>
    </button>
  </view>

  <!-- 情侣模式入口 -->
  <view class="couple-section">
    <view class="couple-header" bindtap="toggleCouple">
      <text class="couple-title">情侣模式</text>
      <text class="couple-arrow {{coupleExpanded ? 'open' : ''}}">▾</text>
    </view>
    <view class="couple-panel {{coupleExpanded ? 'expanded' : ''}}">
      <view class="couple-desc">两人各自答题，查看你们的契合度分析</view>
      <view class="couple-btns">
        <button class="couple-btn" bindtap="createRoom">创建房间</button>
        <button class="couple-btn outline" bindtap="joinRoom">加入房间</button>
      </view>
    </view>
  </view>

  <view class="footer-note">结果仅供参考，祝你遇见对的人</view>
</view>
```

- [ ] **Step 3: Replace index.wxss**

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 60rpx 48rpx 80rpx;
}

.hero {
  text-align: center;
  margin-bottom: 48rpx;
  margin-top: 60rpx;
}

.title {
  font-size: 56rpx;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 4rpx;
  margin-bottom: 20rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #888;
}

.desc-card {
  background: #f7f7f7;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 64rpx;
  width: 100%;
}

.desc-text {
  font-size: 30rpx;
  color: #555;
  line-height: 1.8;
}

.mode-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.mode-btn {
  width: 100%;
  height: 120rpx;
  border-radius: 20rpx;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.mode-btn.primary {
  background: #1a1a1a;
  color: #fff;
}

.mode-btn.secondary {
  background: #f0f0f0;
  color: #1a1a1a;
}

.mode-btn-title {
  font-size: 34rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.mode-btn-sub {
  font-size: 24rpx;
  opacity: 0.6;
}

.couple-section {
  width: 100%;
  border: 2rpx solid #e0e0e0;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 48rpx;
}

.couple-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 40rpx;
}

.couple-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.couple-arrow {
  font-size: 28rpx;
  color: #888;
  transition: transform 0.2s;
}

.couple-arrow.open {
  transform: rotate(180deg);
}

.couple-panel {
  display: none;
  padding: 0 40rpx 40rpx;
}

.couple-panel.expanded {
  display: block;
}

.couple-desc {
  font-size: 26rpx;
  color: #888;
  margin-bottom: 32rpx;
  line-height: 1.6;
}

.couple-btns {
  display: flex;
  gap: 24rpx;
}

.couple-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 500;
  background: #1a1a1a;
  color: #fff;
  border: none;
}

.couple-btn.outline {
  background: transparent;
  color: #1a1a1a;
  border: 2rpx solid #1a1a1a;
}

.footer-note {
  font-size: 24rpx;
  color: #bbb;
  margin-top: auto;
}
```

- [ ] **Step 4: Commit**

```bash
git add pages/index/index.js pages/index/index.wxml pages/index/index.wxss
git commit -m "feat: rework index page with mode selection UI and couple mode entry"
```

---

## Task 6: Update quiz page for multi-mode support

**Files:**
- Modify: `pages/quiz/quiz.js`

The quiz page already reads `globalData.shuffledQuestions` (set by index.js), so the question loading doesn't change. We only need to:
1. Use the correct scoring threshold based on `globalData.mode`
2. After scoring, if `coupleMode`, call cloud `submitResult` and go to couple-room waiting screen instead of result

- [ ] **Step 1: Replace quiz.js**

```js
const { calcDimensionScores, scoresToKey, matchResult, buildDimensionTags } = require('../../utils/score')

Page({
  data: {
    questions: [],
    current: 0,
    total: 0,
    selectedIndex: -1,
    progressPercent: 0,
    currentQuestion: {},
    answers: [],
  },

  onLoad() {
    const questions = getApp().globalData.shuffledQuestions || []
    this.setData({
      questions,
      total: questions.length,
      currentQuestion: questions[0],
      progressPercent: (1 / questions.length) * 100,
    })
  },

  selectOption(e) {
    const { index, score } = e.currentTarget.dataset
    const optionIndex = parseInt(index)
    this.setData({ selectedIndex: optionIndex })
    setTimeout(() => {
      this._recordAndNext(score, optionIndex)
    }, 300)
  },

  _recordAndNext(score, optionIndex) {
    const { questions, current, answers } = this.data
    const q = questions[current]
    const newAnswers = [...answers]
    newAnswers[current] = { dimension: q.dimension, score, optionIndex }

    const next = current + 1
    if (next >= questions.length) {
      this._finishQuiz(newAnswers)
      return
    }

    this.setData({
      answers: newAnswers,
      current: next,
      currentQuestion: questions[next],
      selectedIndex: -1,
      progressPercent: ((next + 1) / questions.length) * 100,
    })
  },

  _finishQuiz(answers) {
    const app = getApp()
    // slow mode uses threshold 3, fast uses 2
    const threshold = app.globalData.mode === 'slow' ? 3 : 2
    const scores = calcDimensionScores(answers)
    const key = scoresToKey(scores, threshold)
    const result = matchResult(key)
    const tags = buildDimensionTags(scores, threshold)
    app.globalData.quizResult = { result, tags, key }

    if (app.globalData.coupleMode) {
      // 情侣模式：提交结果到云DB，然后去等待页
      wx.showLoading({ title: '提交中...' })
      wx.cloud.callFunction({
        name: 'submitResult',
        data: {
          roomId: app.globalData.roomId,
          role: app.globalData.myRole,
          result: { key, name: result.name },
        },
        success() {
          wx.hideLoading()
          // 跳转回 couple-room 的等待态
          wx.redirectTo({ url: '/pages/couple-room/couple-room?action=waiting' })
        },
        fail(err) {
          wx.hideLoading()
          console.error('submitResult failed', err)
          wx.showToast({ title: '提交失败，请重试', icon: 'none' })
        },
      })
    } else {
      wx.redirectTo({ url: '/pages/result/result' })
    }
  },

  prevQuestion() {
    const { current, answers, questions } = this.data
    if (current === 0) return
    const prev = current - 1
    const prevAnswer = answers[prev]
    const prevSelectedIndex = prevAnswer !== undefined ? prevAnswer.optionIndex : -1
    this.setData({
      current: prev,
      currentQuestion: questions[prev],
      selectedIndex: prevSelectedIndex,
      progressPercent: ((prev + 1) / questions.length) * 100,
    })
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add pages/quiz/quiz.js
git commit -m "feat: update quiz page to support slow-mode threshold and couple-mode result submit"
```

---

## Task 7: Update result page for couple mode

**Files:**
- Modify: `pages/result/result.js`
- Modify: `pages/result/result.wxml`

The result page is used in single-player mode only (couple mode goes to couple-result). We just need to add a "重新测试" that resets globalData correctly, and ensure it works unchanged.

No behavioral changes needed — the result page is only reached when `coupleMode === false`. Verify the existing page works:

- [ ] **Step 1: Verify result.js reads key correctly**

Check that `quizResult` from globalData has the `key` field (it does — quiz.js sets `{ result, tags, key }`). No changes needed.

- [ ] **Step 2: Commit (no-op if no changes)**

```bash
git status
```

If no changes: this task is complete. The result page works correctly for single-player mode.

---

## Task 8: Create cloud functions

**Files:**
- Create: `cloudfunctions/createRoom/index.js`
- Create: `cloudfunctions/createRoom/package.json`
- Create: `cloudfunctions/joinRoom/index.js`
- Create: `cloudfunctions/joinRoom/package.json`
- Create: `cloudfunctions/submitResult/index.js`
- Create: `cloudfunctions/submitResult/package.json`

**Note:** Cloud functions must be uploaded via WeChat Developer Tools (right-click the function folder → "上传并部署：云端安装依赖"). This task creates the code files; deployment is done through the IDE.

- [ ] **Step 1: Create cloudfunctions directory**

```bash
mkdir -p cloudfunctions/createRoom cloudfunctions/joinRoom cloudfunctions/submitResult
```

- [ ] **Step 2: Create cloudfunctions/createRoom/package.json**

```json
{
  "name": "createRoom",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 3: Create cloudfunctions/createRoom/index.js**

```js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 生成不重复的4位房间码
async function generateCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = String(Math.floor(1000 + Math.random() * 9000))
    const now = Date.now()
    // 检查是否有未过期的同码房间
    const existing = await db.collection('rooms')
      .where({ code, expiresAt: db.command.gt(now) })
      .count()
    if (existing.total === 0) return code
  }
  throw new Error('无法生成唯一房间码，请重试')
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const now = Date.now()
  const expiresAt = now + 24 * 60 * 60 * 1000 // 24小时后过期

  const code = await generateCode()

  const res = await db.collection('rooms').add({
    data: {
      code,
      createdAt: now,
      expiresAt,
      status: 'waiting',
      playerA: { openid: OPENID, result: null },
      playerB: { openid: null, result: null },
    },
  })

  return { code, roomId: res._id }
}
```

- [ ] **Step 4: Create cloudfunctions/joinRoom/package.json**

```json
{
  "name": "joinRoom",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 5: Create cloudfunctions/joinRoom/index.js**

```js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { code } = event
  const { OPENID } = cloud.getWXContext()
  const now = Date.now()

  // 查找未过期、状态为 waiting 的房间
  const res = await db.collection('rooms')
    .where({
      code,
      expiresAt: _.gt(now),
      status: 'waiting',
    })
    .limit(1)
    .get()

  if (res.data.length === 0) {
    return { error: 'not_found' }
  }

  const room = res.data[0]

  // 检查是否已有 playerB
  if (room.playerB.openid !== null) {
    return { error: 'full' }
  }

  // 检查是否是 playerA 自己扫码
  if (room.playerA.openid === OPENID) {
    return { error: 'same_user' }
  }

  // 写入 playerB openid
  await db.collection('rooms').doc(room._id).update({
    data: { 'playerB.openid': OPENID },
  })

  return { roomId: room._id, code }
}
```

- [ ] **Step 6: Create cloudfunctions/submitResult/package.json**

```json
{
  "name": "submitResult",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 7: Create cloudfunctions/submitResult/index.js**

```js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { roomId, role, result } = event
  // role: 'A' | 'B', result: { key, name }

  const field = role === 'A' ? 'playerA.result' : 'playerB.result'
  await db.collection('rooms').doc(roomId).update({
    data: { [field]: result },
  })

  // 检查双方是否都已提交
  const roomRes = await db.collection('rooms').doc(roomId).get()
  const room = roomRes.data
  if (room.playerA.result !== null && room.playerB.result !== null) {
    await db.collection('rooms').doc(roomId).update({
      data: { status: 'both_ready' },
    })
    return { status: 'both_ready', room }
  }

  return { status: 'waiting' }
}
```

- [ ] **Step 8: Commit**

```bash
git add cloudfunctions/
git commit -m "feat: add createRoom, joinRoom, submitResult cloud functions"
```

- [ ] **Step 9: Deploy cloud functions (manual step)**

In WeChat Developer Tools:
1. 右键点击 `cloudfunctions/createRoom` → "上传并部署：云端安装依赖"
2. 右键点击 `cloudfunctions/joinRoom` → "上传并部署：云端安装依赖"
3. 右键点击 `cloudfunctions/submitResult` → "上传并部署：云端安装依赖"
4. 在云开发控制台 → 数据库，创建集合 `rooms`，权限设为"所有用户可读，仅创建者可写"

---

## Task 9: Create couple-room page

**Files:**
- Create: `pages/couple-room/couple-room.json`
- Create: `pages/couple-room/couple-room.wxml`
- Create: `pages/couple-room/couple-room.wxss`
- Create: `pages/couple-room/couple-room.js`

This page handles three states driven by the URL `action` param:
- `create`: call createRoom, show 4-digit code, poll until B joins then start quiz
- `join`: show input for code, call joinRoom on confirm, then start quiz
- `waiting`: both answered, poll until `both_ready`, then go to couple-result

- [ ] **Step 1: Create couple-room.json**

```json
{
  "navigationBarTitleText": "情侣模式"
}
```

- [ ] **Step 2: Create couple-room.wxml**

```xml
<view class="container">

  <!-- 创建房间：显示房间码 + 等待对方加入 -->
  <view wx:if="{{state === 'create_waiting'}}">
    <view class="state-icon">🔗</view>
    <view class="state-title">把房间码发给 TA</view>
    <view class="room-code">{{roomCode}}</view>
    <view class="state-hint">等待对方加入中…</view>
    <view class="loading-dots">
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
    </view>
  </view>

  <!-- 加入房间：输入房间码 -->
  <view wx:if="{{state === 'join_input'}}">
    <view class="state-icon">💌</view>
    <view class="state-title">输入对方的房间码</view>
    <input
      class="code-input"
      type="number"
      maxlength="4"
      placeholder="4位数字"
      bindinput="onCodeInput"
      value="{{inputCode}}"
    />
    <button
      class="confirm-btn {{inputCode.length === 4 ? '' : 'disabled'}}"
      bindtap="confirmJoin"
      disabled="{{inputCode.length !== 4}}"
    >确认加入</button>
    <view wx:if="{{joinError}}" class="error-text">{{joinError}}</view>
  </view>

  <!-- 等待对方完成答题 -->
  <view wx:if="{{state === 'waiting_partner'}}">
    <view class="state-icon">⏳</view>
    <view class="state-title">你已完成！</view>
    <view class="state-hint">等待对方答完…</view>
    <view class="loading-dots">
      <view class="dot"></view>
      <view class="dot"></view>
      <view class="dot"></view>
    </view>
    <view wx:if="{{waitSeconds >= 300}}" class="timeout-hint">
      对方可能已离开，
      <text class="link" bindtap="goHome">返回首页重新开始</text>
    </view>
  </view>

  <!-- 加载中 -->
  <view wx:if="{{state === 'loading'}}">
    <view class="state-hint">处理中…</view>
  </view>

</view>
```

- [ ] **Step 3: Create couple-room.wxss**

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 60rpx 48rpx;
  text-align: center;
}

.state-icon {
  font-size: 100rpx;
  margin-bottom: 40rpx;
}

.state-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 24rpx;
}

.room-code {
  font-size: 120rpx;
  font-weight: 900;
  color: #1a1a1a;
  letter-spacing: 16rpx;
  margin: 32rpx 0;
}

.state-hint {
  font-size: 28rpx;
  color: #888;
  margin-bottom: 40rpx;
}

.loading-dots {
  display: flex;
  gap: 16rpx;
  justify-content: center;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #ccc;
}

.code-input {
  width: 100%;
  height: 120rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 20rpx;
  text-align: center;
  font-size: 64rpx;
  letter-spacing: 16rpx;
  margin: 40rpx 0;
  color: #1a1a1a;
}

.confirm-btn {
  width: 100%;
  height: 96rpx;
  background: #1a1a1a;
  color: #fff;
  font-size: 34rpx;
  font-weight: 600;
  border-radius: 48rpx;
  border: none;
}

.confirm-btn.disabled {
  background: #ccc;
}

.error-text {
  margin-top: 24rpx;
  color: #e85d75;
  font-size: 26rpx;
}

.timeout-hint {
  margin-top: 60rpx;
  font-size: 26rpx;
  color: #888;
}

.link {
  color: #e85d75;
  text-decoration: underline;
}
```

- [ ] **Step 4: Create couple-room.js**

```js
const { questions: fastQuestions } = require('../../data/questions-fast')
const { questions: slowQuestions } = require('../../data/questions-slow')

const POLL_INTERVAL = 3000   // 3秒轮询
const TIMEOUT_MS   = 5 * 60 * 1000  // 5分钟超时

Page({
  data: {
    state: 'loading',   // 'create_waiting' | 'join_input' | 'waiting_partner' | 'loading'
    roomCode: '',
    inputCode: '',
    joinError: '',
    waitSeconds: 0,
  },

  _pollTimer: null,
  _waitTimer: null,

  onLoad(options) {
    const action = options.action || 'create'
    if (action === 'create') {
      this._createRoom()
    } else if (action === 'join') {
      this.setData({ state: 'join_input' })
    } else if (action === 'waiting') {
      this.setData({ state: 'waiting_partner' })
      this._startWaitPoll()
    }
  },

  onUnload() {
    this._clearTimers()
  },

  onHide() {
    this._clearTimers()
  },

  _clearTimers() {
    if (this._pollTimer) clearInterval(this._pollTimer)
    if (this._waitTimer) clearInterval(this._waitTimer)
    this._pollTimer = null
    this._waitTimer = null
  },

  // ——— 创建房间 ———
  _createRoom() {
    const app = getApp()
    wx.showLoading({ title: '创建中...' })
    wx.cloud.callFunction({
      name: 'createRoom',
      success: (res) => {
        wx.hideLoading()
        const { code, roomId } = res.result
        app.globalData.roomCode = code
        app.globalData.roomId = roomId
        app.globalData.myRole = 'A'
        app.globalData.coupleMode = true
        this.setData({ state: 'create_waiting', roomCode: code })
        this._startJoinPoll()
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('createRoom failed', err)
        wx.showToast({ title: '创建失败，请重试', icon: 'none' })
      },
    })
  },

  // 轮询等待 B 加入（B加入后 playerB.openid !== null）
  _startJoinPoll() {
    const db = wx.cloud.database()
    const app = getApp()
    this._pollTimer = setInterval(async () => {
      try {
        const res = await db.collection('rooms').doc(app.globalData.roomId).get()
        const room = res.data
        if (room.playerB && room.playerB.openid !== null) {
          this._clearTimers()
          this._startQuiz(app)
        }
      } catch (e) {
        console.error('poll join error', e)
      }
    }, POLL_INTERVAL)
  },

  // ——— 加入房间 ———
  onCodeInput(e) {
    this.setData({ inputCode: e.detail.value, joinError: '' })
  },

  confirmJoin() {
    const { inputCode } = this.data
    if (inputCode.length !== 4) return
    this.setData({ state: 'loading' })
    wx.cloud.callFunction({
      name: 'joinRoom',
      data: { code: inputCode },
      success: (res) => {
        const { error, roomId } = res.result
        if (error === 'not_found') {
          this.setData({ state: 'join_input', joinError: '房间不存在或已过期' })
          return
        }
        if (error === 'full') {
          this.setData({ state: 'join_input', joinError: '房间已被加入' })
          return
        }
        if (error === 'same_user') {
          this.setData({ state: 'join_input', joinError: '不能加入自己创建的房间' })
          return
        }
        const app = getApp()
        app.globalData.roomId = roomId
        app.globalData.roomCode = inputCode
        app.globalData.myRole = 'B'
        app.globalData.coupleMode = true
        this._startQuiz(app)
      },
      fail: () => {
        this.setData({ state: 'join_input', joinError: '网络错误，请重试' })
      },
    })
  },

  // ——— 开始答题 ———
  _startQuiz(app) {
    const mode = app.globalData.mode || 'fast'
    const bank = mode === 'slow' ? slowQuestions : fastQuestions
    app.globalData.shuffledQuestions = [...bank].sort(() => Math.random() - 0.5)
    wx.redirectTo({ url: '/pages/quiz/quiz' })
  },

  // ——— 等待对方完成（由 quiz.js 跳转过来） ———
  _startWaitPoll() {
    const db = wx.cloud.database()
    const app = getApp()
    let elapsed = 0

    this._waitTimer = setInterval(() => {
      elapsed += POLL_INTERVAL
      this.setData({ waitSeconds: Math.floor(elapsed / 1000) })
      if (elapsed >= TIMEOUT_MS) {
        this._clearTimers()
        return
      }
    }, POLL_INTERVAL)

    this._pollTimer = setInterval(async () => {
      try {
        const res = await db.collection('rooms').doc(app.globalData.roomId).get()
        const room = res.data
        if (room.status === 'both_ready') {
          this._clearTimers()
          // 写入对方结果到 globalData 供 couple-result 使用
          const myRole = app.globalData.myRole
          const partnerResult = myRole === 'A' ? room.playerB.result : room.playerA.result
          const myResult = myRole === 'A' ? room.playerA.result : room.playerB.result
          app.globalData.coupleData = {
            myKey: myResult.key,
            myName: myResult.name,
            partnerKey: partnerResult.key,
            partnerName: partnerResult.name,
          }
          wx.redirectTo({ url: '/pages/couple-result/couple-result' })
        }
      } catch (e) {
        console.error('poll wait error', e)
      }
    }, POLL_INTERVAL)
  },

  goHome() {
    this._clearTimers()
    wx.reLaunch({ url: '/pages/index/index' })
  },
})
```

- [ ] **Step 5: Commit**

```bash
git add pages/couple-room/
git commit -m "feat: add couple-room page (create/join/waiting states)"
```

---

## Task 10: Create couple-result page

**Files:**
- Create: `pages/couple-result/couple-result.json`
- Create: `pages/couple-result/couple-result.wxml`
- Create: `pages/couple-result/couple-result.wxss`
- Create: `pages/couple-result/couple-result.js`

- [ ] **Step 1: Create couple-result.json**

```json
{
  "navigationBarTitleText": "契合度分析"
}
```

- [ ] **Step 2: Create couple-result.js**

```js
const { calcCompatibility, compatLabel, dimInsights } = require('../../utils/compat')
const { matchResult } = require('../../utils/score')

const DIM_LABELS = {
  intimacy:   '亲密主动性',
  emotion:    '情感深度',
  boundary:   '边界感',
  security:   '安全感',
  expression: '表达方式',
  goal:       '关系目标',
}

Page({
  data: {
    myResult: {},
    partnerResult: {},
    score: 0,
    labelInfo: {},
    insights: {},
    dimRows: [],
  },

  onLoad() {
    const app = getApp()
    const coupleData = app.globalData.coupleData
    if (!coupleData) {
      wx.redirectTo({ url: '/pages/index/index' })
      return
    }

    const { myKey, myName, partnerKey, partnerName } = coupleData
    const myResult = matchResult(myKey)
    const partnerResult = matchResult(partnerKey)
    const score = calcCompatibility(myKey, partnerKey)
    const labelInfo = compatLabel(score)
    const insights = dimInsights(myKey, partnerKey)

    // 构建每个维度的展示行
    const dimOrder = ['intimacy', 'emotion', 'boundary', 'security', 'expression', 'goal']
    const dimRows = dimOrder.map((dim, i) => ({
      label: DIM_LABELS[dim],
      myHL:  myKey[i],
      partnerHL: partnerKey[i],
      score: insights.all.find(d => d.dim === dim).score,
    }))

    this.setData({ myResult, partnerResult, score, labelInfo, insights, dimRows })
  },

  retry() {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  saveShareImage() {
    const { myResult, partnerResult, score, labelInfo } = this.data
    const query = wx.createSelectorQuery()
    query.select('#shareCanvas').fields({ node: true, size: true }).exec((res) => {
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio
      canvas.width = 375 * dpr
      canvas.height = 500 * dpr
      ctx.scale(dpr, dpr)

      // 背景
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, 375, 500)

      // 顶部色块
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, 375, 200)

      // 标题
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 36px PingFangSC-Semibold, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('我们的契合度', 187, 70)

      // 大分数
      ctx.font = 'bold 80px PingFangSC-Semibold, sans-serif'
      ctx.fillText(String(score), 187, 160)

      // 标签
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '500 22px PingFangSC-Regular, sans-serif'
      ctx.fillText(labelInfo.label, 187, 195)

      // 两人人格名
      ctx.fillStyle = '#1a1a1a'
      ctx.font = '500 28px PingFangSC-Regular, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('我：' + myResult.name, 30, 255)
      ctx.fillText('TA：' + partnerResult.name, 30, 300)

      // 描述
      ctx.fillStyle = '#888'
      ctx.font = '400 22px PingFangSC-Regular, sans-serif'
      const descLines = labelInfo.desc.match(/.{1,18}/g) || []
      descLines.forEach((line, i) => {
        ctx.fillText(line, 30, 350 + i * 32)
      })

      // 底部小字
      ctx.fillStyle = '#ccc'
      ctx.font = '400 18px PingFangSC-Regular, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('恋爱人格测试 · 情侣契合度', 187, 470)

      wx.canvasToTempFilePath({
        canvas,
        success(r) {
          wx.saveImageToPhotosAlbum({
            filePath: r.tempFilePath,
            success() { wx.showToast({ title: '已保存到相册', icon: 'success' }) },
            fail()    { wx.showToast({ title: '保存失败，请授权相册权限', icon: 'none' }) },
          })
        },
        fail() { wx.showToast({ title: '图片生成失败', icon: 'none' }) },
      })
    })
  },
})
```

- [ ] **Step 3: Create couple-result.wxml**

```xml
<view class="container">

  <!-- 契合度大圆圈 -->
  <view class="score-ring-wrap">
    <view class="score-ring">
      <view class="score-num">{{score}}</view>
      <view class="score-label">{{labelInfo.label}}</view>
    </view>
  </view>

  <!-- 两人人格 -->
  <view class="person-row">
    <view class="person-card">
      <view class="person-role">我</view>
      <view class="person-name">{{myResult.name}}</view>
      <view class="person-code">{{myResult.code}}</view>
    </view>
    <view class="heart">♡</view>
    <view class="person-card">
      <view class="person-role">TA</view>
      <view class="person-name">{{partnerResult.name}}</view>
      <view class="person-code">{{partnerResult.code}}</view>
    </view>
  </view>

  <!-- 契合描述 -->
  <view class="compat-desc">{{labelInfo.desc}}</view>

  <!-- 维度对比 -->
  <view class="section-title">维度对比</view>
  <view class="dim-rows">
    <view class="dim-row" wx:for="{{dimRows}}" wx:key="label">
      <view class="dim-label">{{item.label}}</view>
      <view class="dim-bars">
        <view class="dim-bar {{item.myHL === 'H' ? 'h-bar' : 'l-bar'}}">
          <text>{{item.myHL === 'H' ? '主动' : '被动'}}</text>
        </view>
        <view class="dim-score-badge">{{item.score}}</view>
        <view class="dim-bar {{item.partnerHL === 'H' ? 'h-bar' : 'l-bar'}} right-bar">
          <text>{{item.partnerHL === 'H' ? '主动' : '被动'}}</text>
        </view>
      </view>
    </view>
  </view>

  <!-- 最强/最弱维度 -->
  <view class="insight-cards">
    <view class="insight-card best">
      <view class="insight-icon">✨</view>
      <view class="insight-dim">最强契合：{{insights.strongest.label}}</view>
      <view class="insight-score">{{insights.strongest.score}}分</view>
    </view>
    <view class="insight-card concern">
      <view class="insight-icon">⚡</view>
      <view class="insight-dim">最需关注：{{insights.weakest.label}}</view>
      <view class="insight-score">{{insights.weakest.score}}分</view>
    </view>
  </view>

  <!-- 操作按钮 -->
  <button class="save-btn" bindtap="saveShareImage">保存分享图</button>
  <canvas type="2d" id="shareCanvas" style="width:375px;height:500px;position:fixed;left:-9999px;top:-9999px;"></canvas>
  <button class="retry-btn" bindtap="retry">重新开始</button>

</view>
```

- [ ] **Step 4: Create couple-result.wxss**

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 40rpx 80rpx;
}

.score-ring-wrap {
  margin: 40rpx 0 48rpx;
}

.score-ring {
  width: 240rpx;
  height: 240rpx;
  border-radius: 50%;
  border: 12rpx solid #1a1a1a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-num {
  font-size: 88rpx;
  font-weight: 900;
  color: #1a1a1a;
  line-height: 1;
}

.score-label {
  font-size: 26rpx;
  color: #888;
  margin-top: 8rpx;
}

.person-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 32rpx;
  width: 100%;
}

.person-card {
  flex: 1;
  background: #f7f7f7;
  border-radius: 20rpx;
  padding: 28rpx;
  text-align: center;
}

.person-role {
  font-size: 24rpx;
  color: #888;
  margin-bottom: 8rpx;
}

.person-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.person-code {
  font-size: 22rpx;
  color: #aaa;
  margin-top: 6rpx;
}

.heart {
  font-size: 48rpx;
  color: #e85d75;
}

.compat-desc {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  line-height: 1.7;
  margin-bottom: 48rpx;
  padding: 0 8rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
  align-self: flex-start;
  margin-bottom: 24rpx;
}

.dim-rows {
  width: 100%;
  margin-bottom: 40rpx;
}

.dim-row {
  margin-bottom: 20rpx;
}

.dim-label {
  font-size: 24rpx;
  color: #888;
  margin-bottom: 8rpx;
}

.dim-bars {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.dim-bar {
  flex: 1;
  height: 52rpx;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
}

.h-bar {
  background: #1a1a1a;
  color: #fff;
}

.l-bar {
  background: #f0f0f0;
  color: #555;
}

.dim-score-badge {
  width: 64rpx;
  text-align: center;
  font-size: 26rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.insight-cards {
  display: flex;
  gap: 24rpx;
  width: 100%;
  margin-bottom: 48rpx;
}

.insight-card {
  flex: 1;
  border-radius: 20rpx;
  padding: 28rpx 20rpx;
  text-align: center;
}

.insight-card.best {
  background: #f0fff4;
  border: 2rpx solid #b2f0c6;
}

.insight-card.concern {
  background: #fff5f5;
  border: 2rpx solid #f0b2b2;
}

.insight-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.insight-dim {
  font-size: 24rpx;
  color: #555;
  margin-bottom: 8rpx;
}

.insight-score {
  font-size: 32rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.save-btn {
  width: 100%;
  height: 96rpx;
  background: #1a1a1a;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 48rpx;
  border: none;
  margin-bottom: 24rpx;
}

.retry-btn {
  width: 100%;
  height: 88rpx;
  background: transparent;
  color: #888;
  font-size: 30rpx;
  border-radius: 44rpx;
  border: 2rpx solid #e0e0e0;
}
```

- [ ] **Step 5: Commit**

```bash
git add pages/couple-result/
git commit -m "feat: add couple-result page with compatibility score, dim comparison, and share canvas"
```

---

## Task 11: Fix dimension label display in couple-result

The `couple-result.wxml` currently shows generic "主动/被动" for all dimensions. Each dimension's H/L has a different label. Read from dimensions data.

**Files:**
- Modify: `pages/couple-result/couple-result.js`

- [ ] **Step 1: Import dimensions and compute proper H/L labels per row**

In `couple-result.js`, add the dimensions import and update the `dimRows` construction:

Replace the import at top with:

```js
const { calcCompatibility, compatLabel, dimInsights } = require('../../utils/compat')
const { matchResult } = require('../../utils/score')
const { dimensions } = require('../../data/dimensions')
```

Replace the `dimRows` construction block in `onLoad`:

```js
const dimRows = dimensions.map((d, i) => ({
  label: d.label,
  myHL:       myKey[i],
  partnerHL:  partnerKey[i],
  myTag:      myKey[i] === 'H' ? d.high : d.low,
  partnerTag: partnerKey[i] === 'H' ? d.high : d.low,
  score:      insights.all.find(x => x.dim === d.id).score,
}))
```

- [ ] **Step 2: Update couple-result.wxml to use myTag/partnerTag**

Replace the `.dim-bar` content lines in `couple-result.wxml`:

Old:
```xml
<view class="dim-bar {{item.myHL === 'H' ? 'h-bar' : 'l-bar'}}">
  <text>{{item.myHL === 'H' ? '主动' : '被动'}}</text>
</view>
<view class="dim-score-badge">{{item.score}}</view>
<view class="dim-bar {{item.partnerHL === 'H' ? 'h-bar' : 'l-bar'}} right-bar">
  <text>{{item.partnerHL === 'H' ? '主动' : '被动'}}</text>
</view>
```

New:
```xml
<view class="dim-bar {{item.myHL === 'H' ? 'h-bar' : 'l-bar'}}">
  <text>{{item.myTag}}</text>
</view>
<view class="dim-score-badge">{{item.score}}</view>
<view class="dim-bar {{item.partnerHL === 'H' ? 'h-bar' : 'l-bar'}}">
  <text>{{item.partnerTag}}</text>
</view>
```

- [ ] **Step 3: Verify dimensions data has the needed fields**

```bash
node -e "
const { dimensions } = require('./data/dimensions')
dimensions.forEach(d => console.log(d.id, d.label, '| H:', d.high, '| L:', d.low))
"
```

Expected: 6 lines each with id, label, high, low values.

- [ ] **Step 4: Commit**

```bash
git add pages/couple-result/couple-result.js pages/couple-result/couple-result.wxml
git commit -m "fix: use dimension-specific H/L labels in couple-result dim comparison"
```

---

## Task 12: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md to document new structure**

Add to the Architecture section after "### 数据流":

```markdown
### 模式系统

- `globalData.mode = 'fast' | 'slow'` 控制加载哪个题库和使用哪个阈值
- 快速模式：18题，threshold=2；慢速模式：30题，threshold=3
- `globalData.coupleMode = true` 时，quiz 结束后调用云函数 `submitResult` 并跳转等待页

### 情侣模式云函数

三个云函数在 `cloudfunctions/` 目录，需通过微信开发者工具上传部署：
- `createRoom`：生成4位房间码，创建 rooms 集合文档
- `joinRoom`：验证码，注册 playerB
- `submitResult`：写入结果，双方均完成时将 status 置为 `both_ready`

云DB集合 `rooms` 权限：所有用户可读，仅创建者可写。

### 验证逻辑（不依赖微信运行时）

```bash
# 验证 compat.js
node -e "
  const { calcCompatibility, compatLabel } = require('./utils/compat')
  const s = calcCompatibility('HHHHHL', 'HHHHHL')
  console.log(s, compatLabel(s).label)
"
```
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with v2 architecture (modes, cloud functions)"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] 快速/慢速双速模式 → Tasks 1, 2, 5, 6
- [x] 30题慢速题库 → Task 1
- [x] threshold参数 → Task 2
- [x] 契合度算法 → Task 3
- [x] 云开发初始化 → Task 4
- [x] index页模式选择UI → Task 5
- [x] quiz页多模式支持 → Task 6
- [x] 云函数(createRoom/joinRoom/submitResult) → Task 8
- [x] couple-room页(3状态) → Task 9
- [x] couple-result页(分数+维度+canvas) → Task 10
- [x] 维度标签修正 → Task 11
- [x] 边界情况(不存在码/满/超时) → Task 9 couple-room.js

**Placeholder scan:** No TBD or TODO found in code blocks. `your-env-id` is a required user substitution documented in comments.

**Type consistency:**
- `calcCompatibility(keyA, keyB)` defined in Task 3, used in Task 10 ✓
- `compatLabel(score)` defined in Task 3, used in Task 10 ✓
- `dimInsights(keyA, keyB)` defined in Task 3, used in Task 10 ✓ (returns `{ strongest, weakest, all }`)
- `insights.all.find(x => x.dim === d.id).score` → `all` is array of `{ dim, label, score }` ✓
- `scoresToKey(scores, threshold)` defined in Task 2, used in Task 6 ✓
- `buildDimensionTags(scores, threshold)` defined in Task 2, used in Task 6 ✓
- `globalData.coupleData = { myKey, myName, partnerKey, partnerName }` set in Task 9, read in Task 10 ✓
