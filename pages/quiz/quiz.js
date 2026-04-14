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
