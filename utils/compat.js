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
