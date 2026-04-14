const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { roomId, role, result } = event
  // role: 'A' | 'B', result: { key, name }

  const field = role === 'A' ? 'playerA.result' : 'playerB.result'
  await db.collection('rooms').doc(roomId).update({
    data: { [field]: result },
  })

  // 检查双方是否都已提交
  const roomRes = await db.collection('rooms').doc(roomId).get()
  const room = roomRes.data
  if (room.playerA.result !== null && room.playerB.result !== null) {
    await db.collection('rooms').doc(roomId).update({
      data: { status: 'both_ready' },
    })
    return { status: 'both_ready', room }
  }

  return { status: 'waiting' }
}
