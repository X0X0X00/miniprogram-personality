const { calcDimensionScores, scoresToKey, matchResult, buildDimensionTags } = require('../../utils/score')

Page({
  data: {
    questions: [],
    current: 0,
    total: 18,
    selectedIndex: -1,
    progressPercent: 0,
    currentQuestion: {},
    answers: [], // [{dimension, score, optionIndex}]
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

    // 延迟300ms后跳下一题，给用户看到选中效果
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
      // 答完，计算结果
      const scores = calcDimensionScores(newAnswers)
      const key = scoresToKey(scores)
      const result = matchResult(key)
      const tags = buildDimensionTags(scores)
      getApp().globalData.quizResult = { result, tags, key }
      wx.redirectTo({ url: '/pages/result/result' })
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
