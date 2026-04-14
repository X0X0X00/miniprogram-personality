const { calcCompatibility, compatLabel, dimInsights } = require('../../utils/compat')
const { matchResult } = require('../../utils/score')
const { dimensions } = require('../../data/dimensions')

Page({
  data: {
    myResult: {},
    partnerResult: {},
    score: 0,
    labelInfo: {},
    insights: {},
    dimRows: [],
  },

  onLoad() {
    const app = getApp()
    const coupleData = app.globalData.coupleData
    if (!coupleData) {
      wx.redirectTo({ url: '/pages/index/index' })
      return
    }

    const { myKey, myName, partnerKey, partnerName } = coupleData
    const myResult = matchResult(myKey)
    const partnerResult = matchResult(partnerKey)
    const score = calcCompatibility(myKey, partnerKey)
    const labelInfo = compatLabel(score)
    const insights = dimInsights(myKey, partnerKey)

    // Build dim rows using dimension-specific H/L tag labels
    const dimRows = dimensions.map((d, i) => ({
      label: d.label,
      myHL:       myKey[i],
      partnerHL:  partnerKey[i],
      myTag:      myKey[i] === 'H' ? d.high : d.low,
      partnerTag: partnerKey[i] === 'H' ? d.high : d.low,
      score:      insights.all.find(x => x.dim === d.id).score,
    }))

    this.setData({ myResult, partnerResult, score, labelInfo, insights, dimRows })
  },

  retry() {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  saveShareImage() {
    const { myResult, partnerResult, score, labelInfo } = this.data
    const query = wx.createSelectorQuery()
    query.select('#shareCanvas').fields({ node: true, size: true }).exec((res) => {
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio
      canvas.width = 375 * dpr
      canvas.height = 500 * dpr
      ctx.scale(dpr, dpr)

      // 背景
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, 375, 500)

      // 顶部色块
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, 375, 200)

      // 标题
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 36px PingFangSC-Semibold, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('我们的契合度', 187, 70)

      // 大分数
      ctx.font = 'bold 80px PingFangSC-Semibold, sans-serif'
      ctx.fillText(String(score), 187, 160)

      // 标签
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '500 22px PingFangSC-Regular, sans-serif'
      ctx.fillText(labelInfo.label, 187, 195)

      // 两人人格名
      ctx.fillStyle = '#1a1a1a'
      ctx.font = '500 28px PingFangSC-Regular, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('我：' + myResult.name, 30, 255)
      ctx.fillText('TA：' + partnerResult.name, 30, 300)

      // 描述
      ctx.fillStyle = '#888'
      ctx.font = '400 22px PingFangSC-Regular, sans-serif'
      const descLines = labelInfo.desc.match(/.{1,18}/g) || []
      descLines.forEach((line, i) => {
        ctx.fillText(line, 30, 350 + i * 32)
      })

      // 底部小字
      ctx.fillStyle = '#ccc'
      ctx.font = '400 18px PingFangSC-Regular, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('恋爱人格测试 · 情侣契合度', 187, 470)

      wx.canvasToTempFilePath({
        canvas,
        success(r) {
          wx.saveImageToPhotosAlbum({
            filePath: r.tempFilePath,
            success() { wx.showToast({ title: '已保存到相册', icon: 'success' }) },
            fail()    { wx.showToast({ title: '保存失败，请授权相册权限', icon: 'none' }) },
          })
        },
        fail() { wx.showToast({ title: '图片生成失败', icon: 'none' }) },
      })
    })
  },
})
