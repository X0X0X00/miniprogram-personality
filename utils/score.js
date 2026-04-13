const { dimensions } = require('../data/dimensions')
const { results } = require('../data/results')

/**
 * 计算各维度得分
 * @param {Array} answers - [{dimension, score}]
 * @returns {Object} 如 { intimacy: 2, emotion: 1, boundary: 3, ... }
 */
function calcDimensionScores(answers) {
  const scores = {}
  dimensions.forEach(d => { scores[d.id] = 0 })
  answers.forEach(a => {
    if (scores[a.dimension] !== undefined) {
      scores[a.dimension] += a.score
    }
  })
  return scores
}

/**
 * 将维度得分转换为 H/L 字符串
 * 维度顺序: intimacy, emotion, boundary, security, expression, goal
 * @param {Object} scores
 * @returns {string} 如 "HHLHLL"
 */
function scoresToKey(scores) {
  return dimensions.map(d => scores[d.id] >= 2 ? 'H' : 'L').join('')
}

/**
 * 计算两个等长字符串的汉明距离
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function hammingDistance(a, b) {
  let dist = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++
  }
  return dist
}

/**
 * 根据6位键匹配最近人格类型
 * @param {string} key - 如 "HHLHLL"
 * @returns {Object} 匹配的 result 对象
 */
function matchResult(key) {
  // 精确匹配
  const exact = results.find(r => r.key === key)
  if (exact) return exact

  // 汉明距离最近匹配
  let best = results[0]
  let bestDist = hammingDistance(key, results[0].key)
  for (let i = 1; i < results.length; i++) {
    const dist = hammingDistance(key, results[i].key)
    if (dist < bestDist) {
      bestDist = dist
      best = results[i]
    }
  }
  return best
}

/**
 * 将维度得分和 H/L 转换为展示用的标签数组
 * @param {Object} scores
 * @returns {Array} [{label, level, tag}]
 */
function buildDimensionTags(scores) {
  return dimensions.map(d => ({
    label: d.label,
    level: scores[d.id] >= 2 ? 'H' : 'L',
    tag: scores[d.id] >= 2 ? d.high : d.low,
  }))
}

module.exports = { calcDimensionScores, scoresToKey, matchResult, buildDimensionTags }
