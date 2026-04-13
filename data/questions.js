// dimensions: intimacy, emotion, boundary, security, expression, goal
// score 1 = H 端特质，score 0 = L 端特质
const questions = [
  // === intimacy（亲密主动性）===
  {
    id: 1,
    text: '喜欢一个人时，你更倾向于？',
    dimension: 'intimacy',
    options: [
      { text: '等对方先开口', score: 0 },
      { text: '主动约对方出去玩', score: 1 },
      { text: '暗示但不说明', score: 0 },
      { text: '直接说"我喜欢你"', score: 1 },
    ],
  },
  {
    id: 2,
    text: '好久没联系了，你会？',
    dimension: 'intimacy',
    options: [
      { text: '等对方先发消息', score: 0 },
      { text: '找个借口主动联系', score: 1 },
      { text: '在心里想但忍住不发', score: 0 },
      { text: '直接说"想你了"', score: 1 },
    ],
  },
  {
    id: 3,
    text: '在感情里，你认为推进关系应该？',
    dimension: 'intimacy',
    options: [
      { text: '顺其自然，水到渠成', score: 0 },
      { text: '喜欢就争取，不想留遗憾', score: 1 },
      { text: '等对方给出信号', score: 0 },
      { text: '主动创造更多相处机会', score: 1 },
    ],
  },

  // === emotion（情感深度）===
  {
    id: 4,
    text: '对方说了一句让你难受的话，你会？',
    dimension: 'emotion',
    options: [
      { text: '理性分析对方为什么这么说', score: 0 },
      { text: '当场情绪就上来了', score: 1 },
      { text: '暗自消化，不表现出来', score: 0 },
      { text: '忍不住红眼睛', score: 1 },
    ],
  },
  {
    id: 5,
    text: '看到特别感人的爱情故事，你的反应是？',
    dimension: 'emotion',
    options: [
      { text: '觉得有点夸张，但故事不错', score: 0 },
      { text: '眼眶发酸甚至哭出来', score: 1 },
      { text: '平静地看完', score: 0 },
      { text: '代入感超强，久久不能平复', score: 1 },
    ],
  },
  {
    id: 6,
    text: '分手后你通常？',
    dimension: 'emotion',
    options: [
      { text: '很快调整好状态', score: 0 },
      { text: '需要很长时间走出来', score: 1 },
      { text: '理性复盘哪里出了问题', score: 0 },
      { text: '会反复回忆在一起的时光', score: 1 },
    ],
  },

  // === boundary（边界感）===
  {
    id: 7,
    text: '在亲密关系里，你对个人空间的态度是？',
    dimension: 'boundary',
    options: [
      { text: '喜欢和对方随时分享生活', score: 0 },
      { text: '需要保留一些只属于自己的时间', score: 1 },
      { text: '越黏在一起越有安全感', score: 0 },
      { text: '即使在恋爱也需要独处充电', score: 1 },
    ],
  },
  {
    id: 8,
    text: '伴侣翻看你的手机，你会？',
    dimension: 'boundary',
    options: [
      { text: '无所谓，我没什么秘密', score: 0 },
      { text: '感到被冒犯，这是我的私人空间', score: 1 },
      { text: '主动把手机递给他/她', score: 0 },
      { text: '礼貌但坚定地拒绝', score: 1 },
    ],
  },
  {
    id: 9,
    text: '你理想中的相处状态是？',
    dimension: 'boundary',
    options: [
      { text: '形影不离，无话不说', score: 0 },
      { text: '各自有生活，相聚时更珍贵', score: 1 },
      { text: '每天互报平安，知道彼此动态', score: 0 },
      { text: '保持适当距离，彼此尊重空间', score: 1 },
    ],
  },

  // === security（安全感需求）===
  {
    id: 10,
    text: '对方两小时没回消息，你会？',
    dimension: 'security',
    options: [
      { text: '有点不安，反复看手机', score: 0 },
      { text: '没在意，可能在忙吧', score: 1 },
      { text: '开始担心是不是出什么事了', score: 0 },
      { text: '继续做自己的事，等回复就好', score: 1 },
    ],
  },
  {
    id: 11,
    text: '伴侣和异性朋友出去玩，你的感受是？',
    dimension: 'security',
    options: [
      { text: '会有些在意，想多了解情况', score: 0 },
      { text: '很平静，信任对方', score: 1 },
      { text: '忍不住多问几句', score: 0 },
      { text: '完全不担心，正常社交而已', score: 1 },
    ],
  },
  {
    id: 12,
    text: '在感情里你更害怕？',
    dimension: 'security',
    options: [
      { text: '被对方抛弃或冷落', score: 0 },
      { text: '失去自我或被束缚', score: 1 },
      { text: '关系走向不确定', score: 0 },
      { text: '感情变成一种负担', score: 1 },
    ],
  },

  // === expression（表达方式）===
  {
    id: 13,
    text: '开心的事情你会怎么处理？',
    dimension: 'expression',
    options: [
      { text: '记在心里，自己消化', score: 0 },
      { text: '马上分享给身边人', score: 1 },
      { text: '写下来或者发朋友圈', score: 1 },
      { text: '只告诉特别亲近的人', score: 0 },
    ],
  },
  {
    id: 14,
    text: '和对方吵架后，你更倾向于？',
    dimension: 'expression',
    options: [
      { text: '沉默等对方来找你', score: 0 },
      { text: '主动说出心里的感受', score: 1 },
      { text: '冷静下来再谈', score: 0 },
      { text: '当场把话说清楚', score: 1 },
    ],
  },
  {
    id: 15,
    text: '你表达爱意的方式更多是？',
    dimension: 'expression',
    options: [
      { text: '默默为对方做事，行动大于言语', score: 0 },
      { text: '直接说"我爱你"，言语表达很重要', score: 1 },
      { text: '用小惊喜或礼物传递心意', score: 1 },
      { text: '陪在对方身边就是最好的表达', score: 0 },
    ],
  },

  // === goal（关系目标）===
  {
    id: 16,
    text: '你进入一段感情最看重的是？',
    dimension: 'goal',
    options: [
      { text: '有人陪着，不孤单', score: 0 },
      { text: '彼此促进成长，变成更好的人', score: 1 },
      { text: '稳定的归属感', score: 0 },
      { text: '在关系中探索自我', score: 1 },
    ],
  },
  {
    id: 17,
    text: '理想中的伴侣关系更像？',
    dimension: 'goal',
    options: [
      { text: '港湾，回到家就放松了', score: 0 },
      { text: '战友，一起去探索和挑战', score: 1 },
      { text: '家人，相互依靠很踏实', score: 0 },
      { text: '旅伴，一起看更大的世界', score: 1 },
    ],
  },
  {
    id: 18,
    text: '五年后，你希望一段感情带给你的是？',
    dimension: 'goal',
    options: [
      { text: '稳定幸福的生活状态', score: 0 },
      { text: '成为了更好的自己', score: 1 },
      { text: '彼此深深了解的默契', score: 0 },
      { text: '拓展了人生的边界和可能性', score: 1 },
    ],
  },
]

module.exports = { questions }
