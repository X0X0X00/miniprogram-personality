// 维度顺序固定: intimacy, emotion, boundary, security, expression, goal
// 内部键(key)按此顺序拼 H/L 6位字符串
const dimensions = [
  { id: 'intimacy',   label: '亲密主动性', low: '等待型', high: '主动型' },
  { id: 'emotion',    label: '情感深度',   low: '理性型', high: '感性型' },
  { id: 'boundary',   label: '边界感',     low: '融合型', high: '独立型' },
  { id: 'security',   label: '安全感',     low: '稳定型', high: '自由型' },
  { id: 'expression', label: '表达方式',   low: '内敛型', high: '外放型' },
  { id: 'goal',       label: '关系目标',   low: '陪伴型', high: '成长型' },
]

module.exports = { dimensions }
