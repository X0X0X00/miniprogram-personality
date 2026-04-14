const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { code } = event
  const { OPENID } = cloud.getWXContext()
  const now = Date.now()

  // 查找未过期、状态为 waiting 的房间
  const res = await db.collection('rooms')
    .where({
      code,
      expiresAt: _.gt(now),
      status: 'waiting',
    })
    .limit(1)
    .get()

  if (res.data.length === 0) {
    return { error: 'not_found' }
  }

  const room = res.data[0]

  // 检查是否已有 playerB
  if (room.playerB.openid !== null) {
    return { error: 'full' }
  }

  // 检查是否是 playerA 自己扫码
  if (room.playerA.openid === OPENID) {
    return { error: 'same_user' }
  }

  // 写入 playerB openid
  await db.collection('rooms').doc(room._id).update({
    data: { 'playerB.openid': OPENID },
  })

  return { roomId: room._id, code }
}
