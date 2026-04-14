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
