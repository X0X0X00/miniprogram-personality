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
