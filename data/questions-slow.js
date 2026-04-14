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
