Page({
  data: {
    result: {},
    tags: [],
  },

  onLoad() {
    const { result, tags } = getApp().globalData.quizResult || {}
    if (!result) {
      wx.redirectTo({ url: '/pages/index/index' })
      return
    }
    this.setData({ result, tags })
  },

  retry() {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  saveShareImage() {
    const { result, tags } = this.data
    const query = wx.createSelectorQuery()
    query.select('#shareCanvas').fields({ node: true, size: true }).exec((res) => {
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio
      canvas.width = 375 * dpr
      canvas.height = 500 * dpr
      ctx.scale(dpr, dpr)

      // 背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 375, 500)

      // 顶部色块
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, 375, 220)

      // 代号
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '500 18px PingFangSC-Regular, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(result.code, 187, 80)

      // 称号
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 48px PingFangSC-Semibold, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(result.name, 187, 150)

      // 标签（最多4个）
      const displayTags = tags.slice(0, 4)
      displayTags.forEach((tag, i) => {
        const x = 30 + i * 82
        ctx.fillStyle = tag.level === 'H' ? '#e85d75' : '#f0f0f0'
        ctx.beginPath()
        ctx.rect(x, 185, 72, 30)
        ctx.fill()
        ctx.fillStyle = tag.level === 'H' ? '#fff' : '#555'
        ctx.font = '500 13px PingFangSC-Regular, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(tag.tag, x + 36, 205)
      })

      // 描述（截取前60字）
      const descShort = result.desc.slice(0, 60) + '…'
      ctx.fillStyle = '#555'
      ctx.font = '400 16px PingFangSC-Regular, sans-serif'
      ctx.textAlign = 'left'
      // 手动换行，每行约22字
      const lines = []
      for (let i = 0; i < descShort.length; i += 22) {
        lines.push(descShort.slice(i, i + 22))
      }
      lines.forEach((line, i) => {
        ctx.fillText(line, 30, 270 + i * 28)
      })

      // 底部小字
      ctx.fillStyle = '#ccc'
      ctx.font = '400 13px PingFangSC-Regular, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('恋爱人格测试 · 扫码测测你是哪种', 187, 470)

      // 导出图片
      wx.canvasToTempFilePath({
        canvas,
        success(res) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success() {
              wx.showToast({ title: '已保存到相册', icon: 'success' })
            },
            fail() {
              wx.showToast({ title: '保存失败，请授权相册权限', icon: 'none' })
            },
          })
        },
        fail() {
          wx.showToast({ title: '图片生成失败', icon: 'none' })
        },
      })
    })
  },
})
