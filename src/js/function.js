require('dotenv').config()
const { display } = require('./display');
const adminMenu = require('../../admin_menu').admin_menu
const {
  MYSQL_HOST,
  MYSQL_USERNAME,
  MYSQL_PASSWORD,
  MYSQL_PORT,
  MYSQL_DB } = process.env
async function db(sql, res) {
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USERNAME,
    database: MYSQL_DB,
    port: MYSQL_PORT,
    password: MYSQL_PASSWORD
  });

  const [rows, fields, err] = await conn.execute(sql)

  await conn.end();
  return rows


}

async function totalList(sql) {
  const rooms = await db("SELECT * FROM rooms")
  const booking_total_list = await db(sql)
  let r_number_booking = []
  const rooms_number_list = []
  let r_number_all = []
  const booking_list = booking_total_list.map((r) => `${r.room_id},${r.room_number}`)

  rooms.forEach((r) => {
    const sub = JSON.parse(r.room_sub).map((sub) => {
      return `${r.room_id},${sub.room_number_id}`
    })

    rooms_number_list.push(...sub)
  })
  booking_list.forEach((n) => {
    if (!r_number_booking.includes(n)) {
      r_number_booking.push(n)
    }
  })

  rooms_number_list.forEach((r) => {
    if (!r_number_all.includes(r)) {
      r_number_all.push(r)
    }
  })
  booking_list.forEach((r) => {
    if (!r_number_all.includes((r))) {
      r_number_all.push(r)
    }
  })

  let room = await db(`SELECT * FROM rooms`)
  let n = []
  room.forEach((r) => {
    n.push(...JSON.parse(r.room_sub))
  })

  r_number_all = r_number_all.map((r) => {
    const [room_id, room_number] = r.split(',')
    const filter = n.filter((e) => e.room_number_id == room_number)
    const label = filter.length > 0 ? filter[0].room_number : 'ไม่มีห้องนี้'
    return {
      'room_id': room_id,
      'room_number': room_number,
      'room_number_label': label,
      'total': []
    }
  })


  const total_list = await db(sql)
  total_list.forEach((b) => {

    const index = r_number_all.findIndex((r) => {
      return b.room_id == r.room_id && b.room_number == r.room_number
    })

    if (index >= 0) {
      r_number_all[index].total.push(b.paid)
    }

  })

  const total_list_data = r_number_all.map((r) => {
    const total = r.total.map((d) => Number.parseFloat(d)).reduce((prev, curr) => {
      return prev + curr;
    }, 0);
    return {
      'room_number_label': r.room_number_label,
      'room_number': r.room_number,
      'total': total,
      'count': r.total.length
    }
  })

  const sum_total = total_list_data
    .map((r) => Number.parseFloat(r.total))
    .reduce((prev, curr) => prev + curr, 0)

  const map_total_list = total_list_data
    .map((r, no) => {
      const avg = Number.parseFloat(r.total) * 100 / sum_total
      const avg_fixed = isNaN(avg) ? 0 : avg
      return {
        'room_number': r.room_number_label,
        'total': r.total,
        'total_format': display.setNumberFormat(r.total),
        'no': no + 1,
        'count': r.count,
        'avg': avg_fixed.toFixed(2)
      }
    })
  return map_total_list
}

async function countTask(sql) {
  const d = await db(sql)
  return d.length
}
function endCheckOp(q) {
  return q.includes('AND') ? 'AND' : ''
}

function resDate(stamp) {
  const d = new Date(stamp)
  const dt = display.countDate(d.getDate())
  const m = display.countDate(d.getMonth() + 1)
  const y = d.getFullYear()
  return `${y}-${m}-${dt}`
}

function getCountFullDate() {
  const _date = new Date
  const y = _date.getFullYear()

  const _m = (Number.parseInt(_date.getMonth()) + 1).toString()
  const m = _m.length == 2 ? _m : `0${_m}`
  const dt = _date.getDate().toString().length == 2 ? _date.getDate() : `0${_date.getDate()}`

  const hour = _date.getHours().toString().length == 2 ? _date.getHours() : `0${_date.getHours()}`
  const minutes = _date.getMinutes().toString().length == 2 ? _date.getMinutes() : `0${_date.getMinutes()}`
  const seconds = _date.getSeconds().toString().length == 2 ? _date.getSeconds() : `0${_date.getSeconds()}`
  const day = _date.getDay.toString().length == 2 ? _date.getDay() : `0${_date.getDay()}`

  const randomn = `${y}${m + 1}${dt}${day}${hour}${minutes}${seconds}`
  const timestamp = `${y}-${m}-${dt} ${hour}:${minutes}:${seconds}`
  return { 'timestamp': timestamp, 'r': randomn }
}

function createRandom() {
  return uniqueSuffix = Math.round(Math.random() * 100000)
}

function setTemplate(p) {
  const menuIndex = adminMenu.map((m) => m.p)
  const template = adminMenu[menuIndex.indexOf(p)].template
  return template
}

function whereCheck(sql) {
  return sql.includes('WHERE') ? '' : ' WHERE '
}

async function fetchDataWeb(res) {
  let entries = {}
  let rooms = await db("SELECT * FROM rooms ORDER BY modified DESC")
  let roomPreview = []
  rooms.map((r) => {
    const room_sub = JSON.parse(r.room_sub)
    const displayRoom = display.getRoomtype(r.room_type)
    const displayBed = display.resBed(r.bed_type)
    const displayView = display.getRoomview(r.roomview)
    let countPush = 0

    const data = {
      'room': displayRoom,
      'bed': displayBed,
      'view': displayView,
    }

    room_sub.forEach((e, index) => {
      if (countPush < 1) {
        if (e.status == 'empty') {
          Object.assign(r, e)
          Object.assign(r, data)
          countPush = 1
          roomPreview.push(r)
        }
      }
    })
  })

  let social = await db("SELECT * FROM social")
  social = social.filter((r) => {
    if (r.status == 'on') {
      return r
    }
  })


  let room_about = await db("SELECT * FROM room_about WHERE status='on'")
  room_about.map((r) => {
    let title = ''
    if (r.desc_type == 'room') {
      title = display.getRoomtype(r.room)
    } else if (r.desc_type == 'bed') {
      title = display.resBed(r.room)
    } else if (r.desc_type == 'view') {
      title = display.getRoomview(r.room)
    }
    Object.assign(r, { 'title': title })
    return r
  })

  const about = await db("SELECT * FROM about ")
  const slide = await db("SELECT * FROM slide WHERE status='on'")
  const meta = await db("SELECT * FROM meta")
  const logo = await db("SELECT * FROM logo")
  const facility = await db("SELECT * FROM facility")
  const qrcode = await db("SELECT * FROm qrcode")
  Object.assign(entries, { 'room_about': room_about })
  Object.assign(entries, { 'social': social })
  Object.assign(entries, { 'about': about })
  Object.assign(entries, { 'slide': slide })
  Object.assign(entries, { 'room': roomPreview })
  Object.assign(entries, { 'meta': meta })
  Object.assign(entries, { 'logo': logo })
  Object.assign(entries, { 'facility': facility })
  Object.assign(entries, { 'qrcode': qrcode })
  return entries
}



module.exports.fetchDataWeb = fetchDataWeb
module.exports.whereCheck = whereCheck
module.exports.setTemplate = setTemplate
module.exports.createRandom = createRandom
module.exports.getCountFullDate = getCountFullDate
module.exports.endCheckOp = endCheckOp
module.exports.totalList = totalList
module.exports.db = db
module.exports.countTask = countTask
module.exports.resDate = resDate