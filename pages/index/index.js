const { questions } = require('../../data/questions')

Page({
  startQuiz() {
    // 打乱题目顺序
    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    // 存到全局，quiz页读取
    getApp().globalData.shuffledQuestions = shuffled
    wx.navigateTo({ url: '/pages/quiz/quiz' })
  },
})
