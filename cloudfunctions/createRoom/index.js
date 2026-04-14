const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 生成不重复的4位房间码
async function generateCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = String(Math.floor(1000 + Math.random() * 9000))
    const now = Date.now()
    // 检查是否有未过期的同码房间
    const existing = await db.collection('rooms')
      .where({ code, expiresAt: db.command.gt(now) })
      .count()
    if (existing.total === 0) return code
  }
  throw new Error('无法生成唯一房间码，请重试')
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const now = Date.now()
  const expiresAt = now + 24 * 60 * 60 * 1000 // 24小时后过期

  const code = await generateCode()

  const res = await db.collection('rooms').add({
    data: {
      code,
      createdAt: now,
      expiresAt,
      status: 'waiting',
      playerA: { openid: OPENID, result: null },
      playerB: { openid: null, result: null },
    },
  })

  return { code, roomId: res._id }
}
