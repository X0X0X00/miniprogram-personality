App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      // 替换为你的云开发环境 ID（微信开发者工具 → 云开发控制台 → 环境ID）
      env: 'your-env-id',
      traceUser: true,
    })
  },

  globalData: {
    shuffledQuestions: null,  // 当前答题题目（打乱后）
    quizResult: null,         // 单人结果 { result, tags, key }

    // 情侣模式专用
    mode: 'fast',             // 'fast' | 'slow'
    coupleMode: false,        // 是否情侣模式
    roomCode: '',             // 4位房间码
    roomId: '',               // 云DB文档ID
    myRole: '',               // 'A' | 'B'
  },
})
