const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const axios = require('axios')
const session = require('express-session')
const fs = require('fs');
const mysql = require('mysql2/promise')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const mysql2 = require('mysql2')
const { display } = require('./src/js/display')
const multer = require('multer')


const {
    CONFIG_ADMIN_USER,
    CONFIG_ADMIN_PASSWOED,
    CONFIG_LEVEL,
    CONFIG_FNAME,
    CONFIG_PROFILE,
    MYSQL_HOST,
    MYSQL_USERNAME,
    MYSQL_PASSWORD,
    MYSQL_PORT,
    PORT,
    MYSQL_DB
} = process.env


const configAdmin = {
    'username': CONFIG_ADMIN_USER,
    'password': CONFIG_ADMIN_PASSWOED,
    'private_level': CONFIG_LEVEL,
    'fname': CONFIG_FNAME,
    'profile': CONFIG_PROFILE
}
const condb = mysql2.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_USERNAME,
    database: MYSQL_DB,
    port: MYSQL_PORT,
    password: MYSQL_PASSWORD
})

const notfoundPage = 'errNotfound'
const {
    profile_storage,
    aboutRoom_storage,
    storage,
    logo_storage,
    slide_storage,
    facility_storage,
    qrcode_storage
} = require('./src/js/multer.js')

const upload = multer({ storage: storage })
const upload_logo = multer({ storage: logo_storage })
const upload_profile = multer({ storage: profile_storage })
const upload_aboutRoom_img = multer({ storage: aboutRoom_storage })
const upload_siide = multer({ storage: slide_storage })
const upload_qrcode = multer({ storage: qrcode_storage })
const upload_facility = multer({ storage: facility_storage })

const threeMinutes = 1000 * 30 * 30

app.use(
    session({
        resave: true,
        secret: '123456',
        saveUninitialized: true,
        cookie: { maxAge: threeMinutes }
    }));

const {
    totalList,
    db,
    countTask,
    resDate,
    getCountFullDate,
    createRandom,
    setTemplate,
    whereCheck,
    fetchDataWeb,
} = require('./src/js/function')



app.set('view engine', 'ejs')
app.use('/js', express.static(path.join(__dirname, 'src/js')))
app.use('/css', express.static(path.join(__dirname, 'src/css')))
app.use('/src', express.static(path.join(__dirname, 'src')))
app.use('/admin', express.static(path.join(__dirname, 'views/admin')))
app.use('/axios', express.static(path.join(__dirname, 'node_modules/axios/dist/axios.min.js')))
app.use('/font', express.static(path.join(__dirname, 'src/fonts')))
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/')))
app.use('/sweetalert2', express.static(path.join(__dirname, 'node_modules/sweetalert2/dist/')))
app.use('/bootstrap-icons', express.static(path.join(__dirname, 'node_modules/bootstrap-icons/font/')))


app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

condb.connect((err) => {
    if (err) {
        console.log(err)
    }
})



app.post('/api/togglebar', async (req, res) => {
    const result = await addToggleBarSession(req)
    if (result) {
        res.send({ 'result': true })
    }
    if (!result) {
        res.send({ 'result': false })
    }
})


app.get('/', async (req, res) => {
    try {
        let entries = await fetchDataWeb()
        const room = entries.room
        let roomFilter = []
        room.forEach((r) => {
            if (r.data_price != '') {
                roomFilter.push(r)
            }
        })
        roomFilter.map((r, index) => {
            const data_price = JSON.parse(r.data_price).map((p, i) => {
                return Number.parseFloat(p.price)
            })

            let minPrice = Math.min(...data_price)
            let maxPrice = Math.max(...data_price)

            Object.assign(r,
                {
                    'min_price': minPrice,
                    'min_price_format': display.setNumberFormat(minPrice),
                    'max_price': maxPrice,
                    'max_price_format': display.setNumberFormat(maxPrice),
                })
            return r
        })
        entries.room = roomFilter
        res.render('web/index',
            {
                'template': 'home',
                'result': true,
                'data': entries
            })

    } catch (err) {
        res.render(notfoundPage, {
            'msg': err,
            'err_no': err.errno
        })
    }

})
app.get('/room', async (req, res) => {
    try {
        const { min, max, rt, b, view, times, unit } = req.query
        let sql = "SELECT * FROM rooms"

        const data = await fetchDataWeb()
        let listTimes = []
        let unique_times = []

        data.room.forEach((r) => {
            if (r.data_price != '') {
                const dp = JSON.parse(r.data_price)
                dp.forEach((p) => {
                    const d = `${p.times}-${p.unit}`
                    listTimes.push(d)
                })
            }

        })

        listTimes.forEach((u) => {
            if (!unique_times.includes(u)) {
                unique_times.push(u)
            }
        })
        const map_list_times = unique_times.map((u) => {
            const [times, unit] = u.split('-')
            return {
                'label': `${times} ${display.unitTimes(unit)}`,
                'value': `${times}-${unit}`
            }
        })

        const urlParams = req.query
        const url_params_count = Object.keys(urlParams).length
        let queryParams = {
            'min': '',
            'max': '',
            'rt': '',
            'b': '',
            'view': '',
            'times': '',
            'unit': ''
        }
        let query_include_count = 0
        let queryCount = Object.keys(req.query).length

        if (url_params_count >= 1) {
            let queryIsset = {
                'rt': false,
                'b': false,
                'view': false,
            }

            sql = `SELECT * FROM rooms WHERE `

            if (min != undefined && max != undefined) {
                queryCount -= 2
                queryParams = Object.assign(queryParams, {
                    'min': min, 'max': max,
                    'min_text': display.setNumberFormat(min),
                    'max_text': display.setNumberFormat(max)
                })
                query_include_count++
            }


            if (times != undefined && unit != undefined) {
                queryCount -= 2
                Object.assign(queryParams, {
                    'times': times,
                    'unit': unit,
                    'unit_text': display.unitTimes(unit)
                })
                query_include_count++
            }

            if (rt != undefined) {
                queryIsset.rt = true
                sql += `room_type='${rt}'`
                queryCount--
                queryParams = Object.assign(queryParams, {
                    'rt': rt,
                    'room_type_text': display.getRoomtype(rt)
                })
                if (queryCount >= 1) {
                    sql += ` AND `
                }
                query_include_count++
            }

            if (b != undefined) {
                queryIsset.b = true
                sql += `bed_type='${b}'`
                queryCount--
                if (queryCount >= 1) {
                    sql += ` AND `
                }
                queryParams = Object.assign(queryParams, {
                    'b': b,
                    'bed_type_text': display.resBed(b)
                })
                query_include_count++
            }

            if (view != undefined) {
                queryIsset.view = true
                queryCount--
                sql += `roomview='${view}'`
                if (queryCount >= 1) {
                    sql += ` AND `
                }
                queryParams = Object.assign(queryParams, {
                    'view': view,
                    'view_text': display.getRoomview(view)
                })
                query_include_count++
            }

            const objIsset = Object.values(queryIsset)
            const queryFilter = objIsset.filter((e, i) => e == true).length
            if (queryFilter == 0) {
                sql = `SELECT * FROM rooms`
            }
        }
        let room_entries = []
        let filter_room = []


        condb.query(sql, (err, result, fields) => {
            if (err) {
                res.render(notfoundPage, {
                    'msg': err,
                    'err_no': err.errno
                })
            }
            if (!err) {
                result.forEach((r) => {
                    if (r.data_price != '') {
                        const {
                            room_id,
                            room_type,
                            bed_type,
                            roomview,
                            special_options,
                            detail,
                            max_people,
                            toilet_count,
                        } = r

                        const room_type_display = display.getRoomtype(r.room_type)
                        const bed_type_display = display.resBed(r.bed_type)
                        const display_roomview = display.getRoomview(r.roomview)

                        const data_price = JSON.parse(r.data_price).map((p) => {
                            return Number.parseFloat(p.price)
                        })

                        let minPrice = Math.min(...data_price)
                        let maxPrice = Math.max(...data_price)
                        const example_room = r.example_room.split(',')
                        const room_sub = JSON.parse(r.room_sub)

                        room_sub.forEach((r_sub, index) => {
                            Object.assign(r_sub, {
                                room_id,
                                room_type,
                                bed_type,
                                roomview,
                                room_type_display,
                                bed_type_display,
                                display_roomview,
                                'data_price': r.data_price,
                                special_options,
                                example_room,
                                max_people,
                                toilet_count,
                                detail,
                                'status': r_sub.status,
                                'min': minPrice,
                                'min_price_format': display.setNumberFormat(minPrice),
                                'max': maxPrice,
                                'max_price_format': display.setNumberFormat(maxPrice),
                            })
                            room_entries.push(r_sub)
                        })
                    }

                })

                if (times != undefined && unit != undefined) {
                    room_entries.forEach((r) => {
                        const data_price = JSON.parse(r.data_price)
                        data_price.forEach((p) => {
                            if (p.unit == unit && p.times == times) {
                                filter_room.push(r)
                            }
                        })
                    })
                    room_entries = filter_room
                }

                if (min != undefined && max != undefined) {
                    room_entries.forEach((r) => {
                        const data_price = JSON.parse(r.data_price)
                        data_price.forEach((p) => {
                            const price = Number.parseFloat(p.price)
                            if (price >= Number.parseFloat(min) &&
                                price <= Number.parseFloat(max)) {
                                filter_room.push(r)
                            }
                        })
                    })
                    room_entries = filter_room
                }
                room_entries = room_entries.filter((r) => r.status == 'empty')
                res.render('web/index',
                    {
                        'template': `room`,
                        'result': true,
                        'entries': room_entries,
                        'query_params': queryParams,
                        'list_times': map_list_times,
                        'query_include_count': query_include_count,
                        data
                    })
            }
        })
    } catch (err) {
        res.render(notfoundPage, {
            'msg': err,
            'err_no': err.errno
        })
    }

})
app.get('/room/:room_id/:room_number', async (req, res) => {
    try {
        let data = await fetchDataWeb()
        const room_number_id = atob(req.params.room_number)
        const room_id = atob(req.params.room_id)
        let entries = {}
        condb.query("SELECT * FROM rooms WHERE room_id=? ", room_id, async (err, result, fields) => {
            if (err) {
                res.render(notfoundPage, {
                    'msg': err,
                    'err_no': err.errno
                })
            }

            if (!err) {
                const fetch_room_db = await db(`SELECT * FROM room_about WHERE room='${result[0].room_type}'`)
                const fetch_bed_db = await db(`SELECT * FROM room_about WHERE room='${result[0].bed_type}'`)
                const fetch_view_db = await db(`SELECT * FROM room_about WHERE room='${result[0].roomview}'`)


                const room_descript = fetch_room_db[0] != undefined ? fetch_room_db[0].descript : ''
                const bed_descript = fetch_bed_db[0] != undefined ? fetch_bed_db[0].descript : ''
                const view_descript = fetch_view_db[0] != undefined ? fetch_view_db[0].descript : ''


                result.forEach((r) => {
                    const room_sub = JSON.parse(r.room_sub)
                    const {
                        room_id,
                        detail,
                        example_room,
                    } = r


                    const room = display.getRoomtype(r.room_type)
                    const bed = display.resBed(r.bed_type)
                    const view = display.getRoomview(r.roomview)
                    const special_options = r.special_options.split(',').map((opt) => {
                        return display.resSpecialOptions(opt)
                    })


                    const data_price = JSON.parse(r.data_price).map((dp) => {
                        return {
                            'price': display.setNumberFormat(dp.price),
                            'count': dp.times,
                            'unit': dp.unit
                        }

                    })

                    room_sub.forEach((n) => {
                        const {
                            building,
                            building_floor,
                            status } = n
                        const number = n.room_number
                        if (n.room_number_id == room_number_id) {
                            Object.assign(r, {
                                room,
                                'room_descript': room_descript,
                                bed,
                                'bed_descript': bed_descript,
                                view,
                                'view_descript': view_descript,
                                special_options_display: special_options,
                                data_price,
                                'number': n.room_number,
                                'room_number_id': room_number_id,
                                building,
                                building_floor,
                                status
                            })
                            Object.assign(entries, r)
                        }
                    })
                })
                res.render('web/index', {
                    'template': 'room_detail',
                    'result': true,
                    'data': data,
                    'entries': entries,
                })
            }
        })
    } catch (err) {
        res.render(notfoundPage, {
            'msg': err,
            'err_no': err.errno
        })
    }
})

app.get('/about', async (req, res) => {
    try {
        const data = await fetchDataWeb()
        res.render('web/index',
            {
                'template': 'about',
                data
            })
    } catch (err) {
        res.render(notfoundPage, {
            'msg': err,
            'err_no': err.errno
        })
    }
})

app.get('/howto-payment', async (req, res) => {
    try {
        const data = await fetchDataWeb()
        let payment = await db('SELECT * FROM payment')
        payment = payment.map((p) => {
            Object.assign(p, { 'bank_display': display.getBank(p.bank_name) })
            return p
        })
        res.render('web/index',
            {
                'template': 'howto_payment',
                'payment': payment,
                data
            })
    } catch (err) {
        res.render(notfoundPage, {
            'msg': err,
            'err_no': err.errno
        })
    }

})

async function addToggleBarSession(req) {
    req.session.toggle_bar = await req.body.toggle_bar
    const session = await fetchSession(req)
    return session.toggle_bar != undefined ? true : false
}
async function fetchSession(req) {
    return await req.session
}

async function clearSessionAndSignOut(req) {
    const session = await fetchSession(req)
    session.admin = undefined
    session.admin_level = undefined
    session.admin_fname = undefined
    session.admin_profile = undefined
    await req.session.destroy
    const {
        admin,
        admin_level,
        admin_fname,
        admin_profile
    } = await fetchSession(req)

    return (admin && admin_level && admin_fname && admin_profile) == undefined ? true : false
}

app.get('/admin', async (req, res, next) => {

    let responseObject = {}
    const session = await fetchSession(req)
    const adminSession = session.admin
    const statusbar = session.toggle_bar != undefined ? session.toggle_bar : 'on'

    if (!adminSession) {
        res.render('admin/signin')
    } else {
        Object.assign(responseObject, { 'togglebar': statusbar })
        const page = req.query.p != undefined ? req.query.p : '/'
        const template = setTemplate(page)
        const pageRender = 'admin/index'

        try {
            Object.assign(responseObject, { 'admin': session.admin })
            Object.assign(responseObject, { 'admin_level': session.admin_level })
            Object.assign(responseObject, { 'admin_fname': session.admin_fname })
            Object.assign(responseObject, { 'admin_profile': session.admin_profile })
            Object.assign(responseObject, { 'template': template })

            if (page == '/' || page == 'dashboard') {
                const d = new Date()
                const _dt = display.countDate(d.getDate())
                const _m = display.countDate(d.getMonth() + 1)
                const _y = d.getFullYear()
                const day_week = d.getDay()
                const d_stamp = d.valueOf()

                let start_stamp_week = 0
                let end_stamp_week = 0


                if (day_week == 0) {
                    start_stamp_week = d_stamp - (1000 * 60 * 60 * 24 * 6)
                    end_stamp_week = d_stamp
                }
                if (day_week == 1) {
                    start_stamp_week = d_stamp
                    end_stamp_week = d_stamp + (1000 * 60 * 60 * 24 * 6)
                }
                if (day_week == 2) {
                    start_stamp_week = d_stamp - (1000 * 60 * 60 * 24 * 1)
                    end_stamp_week = d_stamp + (1000 * 60 * 60 * 24 * 5)
                }
                if (day_week == 3) {
                    start_stamp_week = d_stamp - (1000 * 60 * 60 * 24 * 2)
                    end_stamp_week = d_stamp + (1000 * 60 * 60 * 24 * 4)
                }
                if (day_week == 4) {
                    start_stamp_week = d_stamp - (1000 * 60 * 60 * 24 * 3)
                    end_stamp_week = d_stamp + (1000 * 60 * 60 * 24 * 3)
                }
                if (day_week == 5) {
                    start_stamp_week = d_stamp - (1000 * 60 * 60 * 24 * 4)
                    end_stamp_week = d_stamp + (1000 * 60 * 60 * 24 * 2)
                }
                if (day_week == 6) {
                    start_stamp_week = d_stamp - (1000 * 60 * 60 * 24 * 5)
                    end_stamp_week = d_stamp + (1000 * 60 * 60 * 24 * 1)
                }

                const startWeek = resDate(start_stamp_week)
                const endWeek = resDate(end_stamp_week)

                const today = `${_y}-${_m}-${_dt}`
                const count_this_month = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
                const this_m = `'${_y}-${_m}-01' AND '${_y}-${_m}-${count_this_month}'`
                const this_week = `'${startWeek}' AND '${endWeek}'`
                const this_year = `'${_y}-01-01' AND '${_y}-12-31'`
                const today_sql = `SELECT * FROM room_booking WHERE pay_status='paid' AND created LIKE '%${today}%'`

                let this_week_sql = `SELECT * FROM room_booking WHERE pay_status='paid' AND `
                this_week_sql += `created BETWEEN ${this_week}`

                let this_month_sql = `SELECT * FROM room_booking WHERE pay_status='paid' AND `
                this_month_sql += `created BETWEEN ${this_m}`

                let this_year_sql = `SELECT * FROM room_booking WHERE pay_status='paid' AND `
                this_year_sql += `created BETWEEN ${this_year}`

                const today_total = await totalList(today_sql)
                const week_total = await totalList(this_week_sql)
                const month_total = await totalList(this_month_sql)
                const year_total = await totalList(this_year_sql)


                const sumTotalYear = year_total
                    .map((r) => Number.parseFloat(r.total))
                    .reduce((prev, curr) => prev + curr, 0)

                const sumTotalMonth = month_total
                    .map((r) => Number.parseFloat(r.total))
                    .reduce((prev, curr) => prev + curr, 0)

                const sumTotalToday = today_total
                    .map((r) => Number.parseFloat(r.total))
                    .reduce((prev, curr) => prev + curr, 0)

                const sumTotalWeek = week_total
                    .map((r) => Number.parseFloat(r.total))
                    .reduce((prev, curr) => prev + curr, 0)


                const booking_count = await countTask("SELECT * FROM room_booking WHERE status='progress' ")
                const checkin_today_count = await countTask(`SELECT * FROM room_booking WHERE status='confirm' AND checkin LIKE '%${today}%'`)
                const checkout_today_count = await countTask(`SELECT * FROM room_booking WHERE status='resting' AND checkout LIKE '%${today}%'`)
                const list_rooms = await db("SELECT * FROM rooms")
                const list_rooms_count = list_rooms
                    .map((r) => JSON.parse(r.room_sub).length)
                    .reduce((prev, curr) => Number.parseInt(prev) + Number.parseInt(curr), 0)

                const empty_rooms_count = list_rooms
                    .map((r) => {
                        return JSON.parse(r.room_sub).filter((sub) => sub.status == 'empty').length
                    })
                    .reduce((prev, curr) => Number.parseInt(prev) + Number.parseInt(curr), 0)

                const non_empty_count = list_rooms
                    .map((r) => {
                        return JSON.parse(r.room_sub).filter((sub) => sub.status != 'empty').length
                    })
                    .reduce((prev, curr) => Number.parseInt(prev) + Number.parseInt(curr), 0)

                Object.assign(responseObject, { 'week_total': week_total })
                Object.assign(responseObject, { 'month_total': month_total })
                Object.assign(responseObject, { 'year_total': year_total })
                Object.assign(responseObject, { 'today_total': today_total })

                Object.assign(responseObject, { 'sum_total_today': display.setNumberFormat(sumTotalToday) })
                Object.assign(responseObject, { 'sum_total_week': display.setNumberFormat(sumTotalWeek) })
                Object.assign(responseObject, { 'sum_total_month': display.setNumberFormat(sumTotalMonth) })
                Object.assign(responseObject, { 'sum_total_year': display.setNumberFormat(sumTotalYear) })

                Object.assign(responseObject, { 'booking_count': booking_count })
                Object.assign(responseObject, { 'list_rooms': list_rooms_count })

                Object.assign(responseObject, { 'checkin': checkin_today_count })
                Object.assign(responseObject, { 'checkout': checkout_today_count })
                Object.assign(responseObject, { 'list_rooms_empty': empty_rooms_count })
                Object.assign(responseObject, { 'non_empty': non_empty_count })
                res.render(pageRender, responseObject)
            }
        } catch (err) {
            res.render(notfoundPage, {
                'msg': err,
                'err_no': err.errno
            })
        }


        if (page == 'booking-report') {
            const { dt, ds, de, count, now, unit } = req.query


            let sql = "SELECT * FROM room_booking"

            Object.assign(responseObject, {
                'reverse_dt_start': '',
                'reverse_dt_end': '',
                'reverse_dt': '',
                'reverse_count': '',
                'reverse_unit': '',
                'reverse_p': ''
            })

            if (Object.values(req.query).length > 1) {

                sql = "SELECT * FROM room_booking WHERE "

                if (count != undefined) {
                    responseObject.reverse_count = count
                }

                if (unit != undefined) {
                    responseObject.reverse_unit = unit
                }

                if (now != undefined) {
                    responseObject.reverse_p = now
                    if (now != 'today') {
                        Object.assign(responseObject, {
                            'reverse_p_display': display.unitTimes('this_' + now)
                        })
                    } else {
                        Object.assign(responseObject, {
                            'reverse_p_display': display.unitTimes(now)
                        })
                    }

                }
                if (dt != undefined) {
                    sql += ` created LIKE '%${dt}%'`
                    responseObject.reverse_dt = dt
                }

                if (ds != undefined && de != undefined) {
                    sql += ` created BETWEEN '${ds}' AND '${de}'`
                    responseObject.reverse_dt_start = ds
                    responseObject.reverse_dt_end = de
                }
            }

            const r_number_report = await totalList(sql)
            condb.query(sql, (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    result.map((b) => {
                        Object.assign(b, {
                            'total_display': display.setNumberFormat(b.total)
                        })
                    })
                    Object.assign(responseObject, { 'entries': result })
                    Object.assign(responseObject, { 'r_number_report': r_number_report })
                    res.render(pageRender, responseObject)
                }
            })
        }

        if (page == 'cancel-booking') {
            const { n, id } = req.query
            Object.assign(responseObject, {
                'name': n,
                'id': id,
            })
            Object.assign(responseObject, { 'q': 0 })
            if (Object.keys(req.query).length == 1) {
                Object.assign(responseObject, {
                    'name': n,
                    'id': id,
                    'entries': []
                })
                res.render(pageRender, responseObject)
            }

            if (Object.keys(req.query).length > 1) {
                responseObject.q = 1
                let sql = 'SELECT * FROM room_booking WHERE '
                if (req.query.n != undefined) {
                    responseObject.name = req.query.n.replaceAll('-', ' ')
                    const n = req.query.n.split('-')
                    const word = n.map((w, i) => {
                        let text_sql = `fname LIKE '%${w}%' OR lname LIKE '%${w}%' `
                        return (i != n.length - 1) ? text_sql += `OR ` : text_sql += ''
                    }).join(' ')
                    sql += `${word}`
                }

                if (req.query.id != undefined) {
                    responseObject.id = id
                    sql += `booking_id='${req.query.id}'`
                }
                condb.query(sql, (err, result, fields) => {
                    if (err) {
                        res.render(notfoundPage, {
                            'msg': err,
                            'err_no': err.errno
                        })
                    }

                    if (!err) {
                        result.map((r) => Object.assign(r,
                            {
                                'total_display': display.setNumberFormat(r.total)
                            }))
                        Object.assign(responseObject, { 'entries': result })
                        res.render(pageRender, responseObject)
                    }
                })
            }


        }
        if (page == 'add-facility') {
            res.render(pageRender, responseObject)
        }

        if (page == 'facility') {
            condb.query("SELECT * FROM facility", (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }

                if (!err) {
                    Object.assign(responseObject, { 'entries': result })
                    res.render(pageRender, responseObject)
                }
            })

        }
        if (page == 'facility-edit') {
            const id = req.query.id
            condb.query("SELECT * FROM facility WHERE facility_id=?", id, (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }

                if (!err) {
                    Object.assign(responseObject, { 'entries': result })
                    res.render(pageRender, responseObject)
                }
            })

        }

        if (page == 'config-building') {
            condb.query("SELECT * FROM building", (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    Object.assign(responseObject, { 'entries': result })
                    res.render(pageRender, responseObject)
                }

            })
        }

        if (page == 'building-edit') {
            const buiding_id = req.query.id
            condb.query("SELECT * FROM building WHERE building_id=?", buiding_id, (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    Object.assign(responseObject, { 'entries': result })
                    res.render(pageRender, responseObject)
                }

            })
        }
        if (page == 'social-contact') {
            condb.query("SELECT * FROM social", (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    Object.assign(responseObject,
                        {
                            'fb': [],
                            'twitter': [],
                            'ig': [],
                            'line': []
                        })
                    const fb = result.filter((r) => r.id == 'fb')
                    const twitter = result.filter((r) => r.id == 'twitter')
                    const ig = result.filter((r) => r.id == 'ig')
                    const line = result.filter((r) => r.id == 'line')

                    if (fb.length > 0) {
                        responseObject.fb = fb
                    }
                    if (twitter.length > 0) {
                        responseObject.twitter = twitter
                    }
                    if (ig.length > 0) {
                        responseObject.ig = ig
                    }
                    if (line.length > 0) {
                        responseObject.line = line
                    }

                    Object.assign(responseObject, { 'entries': result })
                    res.render(pageRender, responseObject)
                }
            })
        }



        if (page == 'admin-insert') {
            res.render(pageRender, responseObject)
        }

        if (page == 'user-admin') {
            condb.query("SELECT * FROM admin ", (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {

                    let adminUser = []
                    result.forEach((r) => {
                        Object.assign(r, { 'private_level_display': display.privateLevelDisplay(r.private_level) })
                        adminUser.push(r)
                    })
                    Object.assign(responseObject, { 'entries': adminUser })
                    res.render(pageRender, responseObject)
                }
            })
        }

        if (page == 'admin-edit') {
            const admin_id = req.query.id
            condb.query("SELECT * FROM admin WHERE admin_id=? ", admin_id, (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    Object.assign(responseObject, { 'entries': result })
                    res.render(pageRender, responseObject)
                }
            })
        }

        if (page == 'manage-slide') {
            condb.query("SELECT * FROM slide ", (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    Object.assign(responseObject, { 'entries': result })
                    res.render(pageRender, responseObject)
                }
            })
        }

        if (page == 'room-insert') {
            condb.query("SELECT * FROM building ", (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    Object.assign(responseObject, { 'entries': result })
                    res.render(pageRender, responseObject)
                }
            })
        }

        if (page == 'room-manage') {

            try {
                const query = Object.values(req.query)
                const { n, rt, bed, view, dt, list } = req.query

                Object.assign(responseObject, { 'q_number': '' })
                Object.assign(responseObject, { 'q_roomtype': '' })
                Object.assign(responseObject, { 'q_bed': '' })
                Object.assign(responseObject, { 'q_view': '' })
                Object.assign(responseObject, { 'q_date': '' })
                Object.assign(responseObject, { 'q_list': '' })

                const rooms = await db("SELECT * FROM rooms")
                let _date = await db("SELECT DISTINCT  * FROM rooms")
                let uniqueDate = []
                const dateFilterRow = _date.map((r) => {
                    const _date = new Date(r.created)
                    const dt = display.countDate(_date.getDate())
                    const m = display.countDate(_date.getMonth() + 1)
                    const year = _date.getFullYear()
                    return `${year}-${m}-${dt}`
                })

                for (let i = 0; i < dateFilterRow.length; i++) {
                    if (!uniqueDate.includes(dateFilterRow[i])) {
                        uniqueDate.push(dateFilterRow[i])
                    }
                }

                Object.assign(responseObject, { 'room_number': rooms })
                Object.assign(responseObject, { '_dt': uniqueDate })

                if (query.length == 1) {
                    condb.query("SELECT * FROM rooms", (err, result, fields) => {
                        if (err) {
                            res.render(notfoundPage, {
                                'msg': err,
                                'err_no': err.errno
                            })
                        }

                        if (!err) {
                            Object.assign(responseObject, { 'entries': result })
                            res.render(pageRender, responseObject)
                        }
                    })
                }
                if (query.length > 1) {
                    let sql = "SELECT * FROM rooms "
                    let search = query.length - 1
                    if (list != undefined) {
                        search--
                        responseObject.q_list = list
                    }

                    if (n != undefined) {
                        sql += `${whereCheck(sql)}room_id='${n}'`

                        if (search > 1) {
                            sql += ' AND '
                        }
                        search--
                        responseObject.q_number = n
                    }

                    if (rt != undefined) {
                        sql += `${whereCheck(sql)}room_type='${rt}'`
                        if (search > 1) {
                            sql += ' AND '
                        }
                        search--
                        responseObject.q_roomtype = rt
                    }



                    if (bed != undefined) {
                        sql += `${whereCheck(sql)}bed_type='${bed}' `

                        if (search > 1) {
                            sql += ' AND '
                        }
                        search--
                        responseObject.q_bed = bed
                    }

                    if (view != undefined) {
                        sql += `${whereCheck(sql)}roomview='${view}' `

                        if (search > 1) {
                            sql += ' AND '
                        }
                        search--
                        responseObject.q_view = view
                    }
                    if (dt != undefined) {
                        sql += `${whereCheck(sql)}created LIKE '%${dt}%' `

                        if (search > 1) {
                            sql += ' AND '
                        }
                        search--
                        responseObject.q_date = dt
                    }

                    condb.query(sql, (err, result, fields) => {
                        if (err) {
                            res.render(notfoundPage, {
                                'msg': err,
                                'err_no': err.errno
                            })
                        }

                        if (!err) {
                            if (list != undefined) {
                                result = result.filter((v, index) => index < list)
                            }
                            Object.assign(responseObject, { 'entries': result })
                            res.render(pageRender, responseObject)
                        }
                    })
                }
            } catch (err) {
                res.render(notfoundPage, {
                    'msg': err,
                    'err_no': err.errno
                })
            }
        }

        if (page == 'room-edit') {

            try {
                const building = await db(`SELECT * FROM building`)

                condb.query("SELECT * FROM rooms WHERE room_id=? ", req.query.id, (err, result, fields) => {
                    if (err) {
                        res.render(notfoundPage, {
                            'msg': err,
                            'err_no': err.errno
                        })
                    }
                    if (!err) {
                        const rooms = []
                        result.forEach((r) => {
                            const sub = JSON.parse(r.room_sub)
                            sub.forEach((s) => {
                                const filterB = building.filter((b) => b.building_id == s.building)
                                const floor_count = filterB.length > 0 ? filterB[0].floor_count : undefined

                                Object.assign(s, { 'floor_count': floor_count })
                            })
                            r.room_sub = JSON.stringify(sub)
                            rooms.push(r)
                        })

                        Object.assign(responseObject,
                            {
                                'building': building,
                                'entries': rooms
                            })
                        res.render(pageRender, responseObject)
                    }

                })
            } catch (err) {
                res.render(notfoundPage, {
                    'msg': err,
                    'err_no': err.errno
                })
            }

        }

        if (page == 'price-insert') {
            condb.query("SELECT * FROM rooms  ", (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    Object.assign(responseObject, { 'entries': result })
                    res.render(pageRender, responseObject)
                }
            })

        }

        if (page == 'price-manage') {
            try {
                const query = Object.values(req.query)
                const { n, rt, bed, view, price, min, max, list } = req.query

                Object.assign(responseObject, { 'q_number': '' })
                Object.assign(responseObject, { 'q_roomtype': '' })
                Object.assign(responseObject, { 'q_bed': '' })
                Object.assign(responseObject, { 'q_view': '' })
                Object.assign(responseObject, { 'q_list': '' })
                Object.assign(responseObject, { 'q_price': '' })
                Object.assign(responseObject, { 'q_min': '' })
                Object.assign(responseObject, { 'q_max': '' })

                const rooms = await db("SELECT * FROM rooms")
                const priceList = []

                rooms.forEach((r) => {
                    if (r.data_price != '') {

                        const p = JSON.parse(r.data_price)
                        p.forEach((dp) => {
                            priceList.push(dp.price)
                        })
                    }

                })

                let uniquePrice = []
                priceList.forEach((v) => {
                    if (!uniquePrice.includes(Number.parseFloat(v))) {
                        uniquePrice.push(Number.parseFloat(v))
                    }
                })

                const mapPrice = uniquePrice.sort().map((p) => {
                    return { 'opt': display.setNumberFormat(p), 'value': p }
                })

                Object.assign(responseObject, { 'room_number': rooms })
                Object.assign(responseObject, { 'list_price': mapPrice })

                let sql = "SELECT * FROM rooms"

                if (query.length > 1) {
                    sql = "SELECT * FROM rooms "
                    let search = query.length - 1

                    if (list != undefined) {
                        search--
                        responseObject.q_list = list
                    }

                    if (price != undefined) {
                        responseObject.q_price = price
                        search--
                    }
                    if (min != undefined && max != undefined) {
                        search -= 2
                        responseObject.q_min = min
                        responseObject.q_max = max
                    }
                    if (n != undefined) {
                        sql += `${whereCheck(sql)}room_id='${n}'`

                        if (search > 1) {
                            sql += ' AND '
                        }
                        search--
                        responseObject.q_number = n
                    }

                    if (rt != undefined) {
                        sql += `${whereCheck(sql)}room_type='${rt}'`
                        if (search > 1) {
                            sql += ' AND '
                        }
                        search--
                        responseObject.q_roomtype = rt
                    }



                    if (bed != undefined) {
                        sql += `${whereCheck(sql)}bed_type='${bed}' `

                        if (search > 1) {
                            sql += ' AND '
                        }
                        search--
                        responseObject.q_bed = bed
                    }

                    if (view != undefined) {
                        sql += `${whereCheck(sql)}roomview='${view}' `

                        if (search > 1) {
                            sql += ' AND '
                        }
                        search--
                        responseObject.q_view = view
                    }


                }
                condb.query(sql, (err, result, fields) => {
                    if (err) {
                        res.render(notfoundPage, {
                            'msg': err,
                            'err_no': err.errno
                        })
                    }

                    if (!err) {
                        let rows = result.filter((r) => r.data_price != '')
                        let objectPrice = []
                        rows.forEach((r, i) => {
                            const dataPrice = JSON.parse(r.data_price)
                            dataPrice.forEach((p, i) => {
                                const formatPrice = display.setNumberFormat(p.price)
                                const formatFullPrice = display.setNumberFormat(p.full_price)
                                const unit_title = display.unitTimes(p.unit)
                                const obj = {
                                    'room_id': r.room_id,
                                    'room_sub': r.room_sub,
                                    'price_id': p.id,
                                    'price': p.price,
                                    'full_price': p.full_price,
                                    'format_fullprice': formatFullPrice,
                                    'format_price': formatPrice,
                                    'times': p.times,
                                    'unit_title': unit_title,
                                    'unit': p.unit
                                }

                                if (min != undefined && max != undefined) {
                                    if (p.price >= Number.parseFloat(min) && p.price <= Number.parseFloat(max)) {
                                        objectPrice.push(obj)
                                    }
                                }
                                if (price != undefined) {
                                    if (Number.parseFloat(p.price) == Number.parseFloat(price)) {
                                        objectPrice.push(obj)
                                    }
                                }

                                if (min == undefined && max == undefined && price == undefined) {
                                    objectPrice.push(obj)
                                }


                            })
                        })

                        if (list != undefined) {
                            objectPrice = objectPrice.filter((r, index) => index < list)

                        }

                        Object.assign(responseObject, { 'entries': objectPrice })
                        res.render(pageRender, responseObject)
                    }
                })
            } catch (err) {
                res.render(notfoundPage, {
                    'msg': err,
                    'err_no': err.errno
                })
            }

        }

        if (page == 'price-edit') {

            condb.query("SELECT * FROM  rooms  WHERE room_id=? ", req.query.room, (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    const jsonPrice = JSON.parse(result[0].data_price)
                    const roomSub = JSON.parse(result[0].room_sub).map((n) => n.room_number).join(' ')
                    const room_id = result[0].room_id
                    const price_id = req.query.id

                    const objPrice = jsonPrice.filter((p) => {
                        if (p.id == price_id) {
                            return p
                        }
                    })[0]

                    const objEntries = Object.assign(
                        { 'room_id': room_id },
                        { 'room_number': roomSub },
                        objPrice
                    )

                    Object.assign(responseObject, { 'entries': objEntries })
                    res.render(pageRender, responseObject)
                }
            })
        }

        if (page == 'resting') {
            try {
                const rooms = await db("SELECT * FROM rooms")
                let roomNumber = []
                rooms.forEach((r) => roomNumber.push(...JSON.parse(r.room_sub)))

                const _date = new Date()
                const _y = _date.getFullYear()
                const _m = display.countDate(_date.getMonth() + 1)
                const _dt = display.countDate(_date.getDate())
                const this_dt = `${_y}-${_m}-${_dt}`
                let sql = `SELECT * FROM room_booking WHERE status='confirm'`
                const query = Object.keys(req.query)
                const { ds, de, dt, name } = req.query
                responseObject.template = 'reservation/room_resting'

                if (query.length > 1) {
                    sql = "SELECT * FROM room_booking "
                    if (name != undefined) {
                        const listName = name.split('-')
                        let sqlString = ''
                        listName.forEach((n, i) => {
                            let q = `fname LIKE '%${n}%' OR lname LIKE '%${n}%'`
                            if (i < listName.length - 1) {
                                q += ` OR `
                            }
                            sqlString += q
                        })
                        sql += `${whereCheck(sql)} ${sqlString}`
                    }
                    if (dt != undefined) {
                        sql += `${whereCheck(sql)} checkout LIKE '%${dt}%'`
                    }

                    if (ds != undefined && de != undefined) {
                        sql += `${whereCheck(sql)} (checkout BETWEEN '${ds} 00:00:00' AND '${de} 23:59:59')  `
                    }
                    sql += " AND status='confirm'"
                }
                condb.query(sql, (err, result, fields) => {
                    if (err) {
                        res.render(notfoundPage, {
                            'msg': err,
                            'err_no': err.errno
                        })
                    }
                    if (!err) {
                        let ObjectR = []
                        result = result.forEach((r) => {

                            const number = roomNumber.filter((sub) => sub.room_number_id == r.room_number)
                            const room_number = number.length == 1 ? number[0].room_number : 'ไม่พบหมายเลขนี้'

                            Object.assign(r, { 'room_number_id': r.room_number })
                            Object.assign(r, { 'room_number': room_number })

                            Object.assign(r, {
                                'total_display': display.setNumberFormat(r.total),
                                'remain_display': display.setNumberFormat(r.remain)
                            })

                            ObjectR.push(r)
                        })

                        Object.assign(responseObject, { 'entries': ObjectR })
                        res.render(pageRender, responseObject)
                    }
                })

            } catch (err) {
                res.render(notfoundPage, {
                    'msg': err,
                    'err_no': err.errno
                })
            }

        }
        if (page == 'checkout') {
            try {
                const rooms = await db("SELECT * FROM rooms")
                let roomNumber = []
                rooms.forEach((r) => roomNumber.push(...JSON.parse(r.room_sub)))
                let sql = "SELECT * FROM room_booking WHERE status='resting'"
                const query = Object.keys(req.query)
                const { ds, de, dt, name, now, count, q } = req.query
                Object.assign(responseObject,
                    {
                        'q_name': '',
                        'q_now': '',
                        'q_count': '',
                        'q': ''
                    })
                responseObject.template = 'reservation/room_checkout'

                if (query.length > 1) {

                    if (now != undefined) {
                        responseObject.q_now = now
                    }
                    if (count != undefined) {
                        responseObject.q_count = count
                    }

                    if (q != undefined) {
                        responseObject.q = q
                    }

                    sql = "SELECT * FROM room_booking "
                    if (name != undefined) {
                        responseObject.q_name = name.replaceAll('-', ' ')
                        const listName = name.split('-')
                        let sqlString = ''
                        listName.forEach((n, i) => {
                            let q = `fname LIKE '%${n}%' OR lname LIKE '%${n}%'`
                            if (i < listName.length - 1) {
                                q += ` OR `
                            }
                            sqlString += q
                        })
                        sql += `${whereCheck(sql)} ${sqlString}`
                    }
                    if (dt != undefined) {
                        sql += `${whereCheck(sql)} checkout LIKE '%${dt}%'`
                    }

                    if (ds != undefined && de != undefined) {
                        sql += `${whereCheck(sql)} (checkout BETWEEN '${ds}' AND '${de}')  `
                    }

                    sql += " AND status='resting'"
                }
                condb.query(sql, (err, result, fields) => {
                    if (err) {
                        res.render(notfoundPage, {
                            'msg': err,
                            'err_no': err.errno
                        })
                    }
                    if (!err) {
                        let ObjectR = []
                        result = result.forEach((r) => {
                            const number = roomNumber.filter((sub) => sub.room_number_id == r.room_number)
                            const room_number = number.length == 1 ? number[0].room_number : 'ไม่พบหมายเลขนี้'


                            Object.assign(r,
                                { 'room_number_id': r.room_number },
                                { 'room_number': room_number },
                                { 'display_total': display.setNumberFormat(r.total) },
                                { 'display_paid': display.setNumberFormat(r.paid) },
                                { 'display_remain': display.setNumberFormat(r.remain) }
                            )
                            ObjectR.push(r)
                        })

                        Object.assign(responseObject, { 'entries': ObjectR })
                        res.render(pageRender, responseObject)
                    }
                })
            } catch (err) {
                res.render(notfoundPage, {
                    'msg': err,
                    'err_no': err.errno
                })
            }
        }

        if (page == 'list-room') {
            let sql = "SELECT * FROM rooms"
            const { min, max, rt, b, view, build, floor, times, unit } = req.query
            Object.assign(responseObject, { 'query_params': '' })
            const buildingList = await db("SELECT * FROM building")
            let floorList = buildingList.length > 0
                ? Math.max(...buildingList.map((f) => f.floor_count))
                : 0
            if (build != undefined) {
                buildingList.filter((b) => b.building_id == build)[0].floor_count
            }

            Object.assign(responseObject, { 'building_list': buildingList })
            Object.assign(responseObject, { 'floor_list': floorList })

            let queryParams = {}
            let queryCount = Object.keys(req.query).length - 1
            let queryCountAll = Object.keys(req.query).length

            responseObject.template = 'reservation/list_room'

            if (queryCountAll >= 2) {

                sql = `SELECT * FROM rooms WHERE `
                let queryIsset = {
                    'rt': false,
                    'b': false,
                    'view': false,
                }


                if (build != undefined && floor != undefined) {
                    queryCount -= 2
                    queryParams = Object.assign({ 'build': build })
                    queryParams = Object.assign(queryParams, { 'floor': floor })
                } else if (build != undefined) {
                    queryCount--
                    queryParams = Object.assign(queryParams, { 'build': build })
                } else if (floor != undefined) {
                    queryCount--
                    queryParams = Object.assign(queryParams, { 'floor': floor })
                }

                if (min != undefined && max != undefined) {
                    queryCount -= 2
                    queryParams = Object.assign(queryParams, { 'min': min })
                    queryParams = Object.assign(queryParams, { 'max': max })
                } else if (min != undefined) {
                    queryCount--
                    queryParams = Object.assign(queryParams, { 'min': min })
                }

                if (times != undefined && unit != undefined) {
                    queryCount -= 2
                    queryParams = Object.assign(queryParams, { 'times': times })
                    queryParams = Object.assign(queryParams, { 'unit': unit })
                }

                if (rt != undefined) {
                    queryIsset.rt = true
                    sql += `room_type='${rt}'`
                    queryCount--
                    queryParams = Object.assign(queryParams, { 'rt': rt })
                    if (queryCount >= 1) {
                        sql += ` AND `
                    }
                }


                if (b != undefined) {
                    queryIsset.b = true
                    sql += `bed_type='${b}'`
                    queryCount--
                    if (queryCount >= 1) {
                        sql += ` AND `
                    }
                    queryParams = Object.assign(queryParams, { 'b': b })
                }

                if (view != undefined) {
                    queryIsset.view = true
                    queryCount--
                    sql += `roomview='${view}'`
                    if (queryCount >= 1) {
                        sql += ` AND `
                    }
                    queryParams = Object.assign(queryParams, { 'view': view })
                }

                const objIsset = Object.values(queryIsset)
                const queryFilter = objIsset.filter((e, i) => e == true).length
                if (queryFilter == 0) {
                    sql = `SELECT * FROM rooms`
                }
            }
            condb.query(sql, (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    let rooms = []
                    result.forEach((r) => {
                        const sub = JSON.parse(r.room_sub)
                        sub.forEach((n) => {
                            Object.assign(n, {
                                'room_id': r.room_id,
                                'room_type': r.room_type,
                                'bed_type': r.bed_type,
                                'roomview': r.roomview,
                                'special_options': r.special_options,
                                'detail': r.detail,
                                'data_price': r.data_price,
                                'example_room': r.example_room,
                                'max_people': r.max_people,
                                'toilet_count': r.toilet_count,
                                'damage': r.damage,
                                'price_over_people': r.price_over_people,
                                'price_over_minutes': r.price_over_minutes,
                                'price_over_hour': r.price_over_hour,
                                'price_over_day': r.price_over_day,
                                'price_over_week': r.price_over_week,
                                'price_over_month': r.price_over_month,
                                'price_over_year': r.price_over_year,
                                'created': r.created,
                                'modified': r.modified
                            })
                            if (n.status == 'empty' && n.data_price != '') {
                                rooms.push(n)
                            }
                        })
                    })
                    let roomAppend = rooms
                    let roomFilter = rooms

                    if (build != undefined && floor != undefined) {
                        roomFilter = roomAppend.filter((e) => {
                            if (e.building == build && e.building_floor == floor) {
                                return e
                            }
                        })
                        roomAppend = roomFilter
                    } else if (build != undefined) {
                        roomFilter = roomAppend.filter((e) => {
                            if (e.building == build) {
                                return e
                            }
                        })
                        roomAppend = roomFilter
                    } else if (floor != undefined) {
                        roomFilter = roomAppend.filter((e) => {
                            if (e.building_floor == floor) {
                                return e
                            }
                        })
                        roomAppend = roomFilter
                    }

                    if (times != undefined && unit != undefined) {
                        roomFilter = []
                        roomAppend.forEach((r) => {
                            const r_data_price = JSON.parse(r.data_price)
                            r_data_price.forEach((p) => {
                                if (p.unit == unit && p.times == times) {
                                    roomFilter.push(r)
                                }
                            })
                        })
                        roomAppend = roomFilter
                    }

                    if (min != undefined && max != undefined) {
                        roomFilter = []
                        roomAppend.forEach((r) => {
                            const r_data_price = JSON.parse(r.data_price)
                            r_data_price.forEach((p) => {
                                const price = Number.parseFloat(p.price)
                                if (price >= Number.parseFloat(min) &&
                                    price <= Number.parseFloat(max)) {
                                    objRoom.push(r)
                                }
                            })
                        })
                        roomAppend = roomFilter
                    }
                    responseObject.query_params = queryParams
                    Object.assign(responseObject, { 'entries': roomFilter })
                    res.render(pageRender, responseObject)
                }
            })
        }

        if (page == 'booking-room') {
            try {
                const rooms = await db(`SELECT * FROM rooms`)
                let room_number = []
                rooms.forEach((r) => room_number.push(...JSON.parse(r.room_sub)))
                responseObject.template = 'reservation/booking_room'
                condb.query("SELECT * FROM room_booking WHERE status='progress'", (err, result, fields) => {

                    if (err) {
                        res.render(notfoundPage, {
                            'msg': err,
                            'err_no': err.errno
                        })
                    }

                    if (!err) {
                        result.map((r) => {
                            const number = room_number.filter((n) => n.room_number_id == r.room_number)
                            const n = number.length > 0 ? number[0].room_number : 'ไม่พบห้องนี้'
                            Object.assign(r, {
                                'room_number_id': r.room_number,
                                'room_number': n
                            })
                        })

                        Object.assign(responseObject, { 'entries': result })
                        res.render(pageRender, responseObject)
                    }
                })
            } catch (err) {
                res.render(notfoundPage, {
                    'msg': err,
                    'err_no': err.errno
                })
            }

        }

        if (page == 'payment') {
            condb.query("SELECT * FROM payment ", (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }

                if (!err) {
                    let dataObj = []
                    result.forEach((r) => {
                        const {
                            payment_id,
                            bank_name,
                            bank_branch,
                            bank_number,
                            account_name,
                            created,
                            modified
                        } = r
                        const display_bank = display.getBank(bank_name)
                        const toggle = r.status
                        const data = {
                            payment_id,
                            bank_name,
                            bank_branch,
                            bank_number,
                            account_name,
                            created,
                            toggle,
                            modified,
                            display_bank
                        }
                        dataObj.push(data)
                    })

                    Object.assign(responseObject, { 'entries': dataObj })
                    res.render(pageRender, responseObject)
                }
            })

        }

        if (page == 'qrcode') {
            condb.query("SELECT * FROM qrcode", (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    Object.assign(responseObject, { 'entries': result })
                    res.render(pageRender, responseObject)
                }
            })

        }

        if (page == 'web-about') {
            condb.query("SELECT * FROM about", (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    Object.assign(responseObject, { 'entries': result })
                    res.render(pageRender, responseObject)
                }
            })
        }

        if (page == 'mlogo') {
            condb.query("SELECT * FROM logo", (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    Object.assign(responseObject, { 'entries': result })
                    res.render(pageRender, responseObject)
                }
            })
        }

        if (page == 'kword') {
            condb.query("SELECT * FROM meta", (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    Object.assign(responseObject, { 'entries': result })
                    res.render(pageRender, responseObject)
                }
            })
        }
        if (page == 'room-about') {
            condb.query("SELECT * FROM room_about", (err, result, fields) => {
                if (err) {
                    res.render(notfoundPage, {
                        'msg': err,
                        'err_no': err.errno
                    })
                }
                if (!err) {
                    Object.assign(responseObject, { 'entries': result })
                    res.render(pageRender, responseObject)
                }
            })

        }
    }
})




app.post('/api/insert-room', upload.fields([
    { name: 'example', maxCount: 20 }
]), async (req, res,) => {
    console.log(req.body)
    const {
        room_type, bed_type, room_view,
        detail, max_people, toilet_count,
        damage, price_over_people, price_over_minutes,
        price_over_hour, price_over_day, price_over_week,
        price_over_month, price_over_year
    } = req.body
    const special_options = typeof (req.body.special_options) == 'string'
        ? req.body.special_options :
        req.body.special_options.join(',')


    const exampleInsert = req.files.example.map((e) => e.filename).join(',')
    const created = getCountFullDate().timestamp
    const modified = getCountFullDate().timestamp
    const roomId = `R-${getCountFullDate().r}-${createRandom()}`
    const roomNumber = JSON.parse(req.body.room_number)
    const building = JSON.parse(req.body.building)
    const buildingFloor = JSON.parse(req.body.building_floor)


    const sql = 'INSERT INTO rooms VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    let roomSubJson = []
    for (let i = 0; i < roomNumber.length; i++) {
        const rNumberId = `rnb-${createRandom()}-${i}`
        const dataItem = {
            'room_number_id': rNumberId,
            'room_number': roomNumber[i],
            'building': building[i],
            'building_floor': buildingFloor[i],
            'status': 'empty'
        }
        roomSubJson.push(dataItem)
    }
    const data = [
        roomId, room_type, bed_type, room_view, special_options,
        detail, '', exampleInsert, max_people, toilet_count,
        damage, price_over_people, price_over_minutes,
        price_over_hour, price_over_day, price_over_week,
        price_over_month, price_over_year, JSON.stringify(roomSubJson),
        created, modified
    ]

    condb.query(sql, data, (error, results, fields) => {
        if (error) {
            console.log(error)
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })
})

app.post('/api/update-room', upload.fields([
    { name: 'example', maxCount: 20 }
]), async (req, res) => {
    const oldExampleDelete = req.body.old_example_delete
    const special_options = typeof (req.body.special_options) == 'string'
        ? req.body.special_options :
        req.body.special_options.join(',')

    const {
        room_type, bed_type, room_view,
        room_id, detail, max_people, toilet_count,
        damage, price_over_people, price_over_minutes,
        price_over_hour, price_over_day, price_over_week,
        price_over_month, price_over_year
    } = req.body

    let room_sub_list = []
    let rooms = await db(`SELECT * FROM rooms WHERE room_id='${room_id}'`)


    let old_roomSub = rooms.forEach((r) => {
        room_sub_list.push(...JSON.parse(r.room_sub))
    })


    const modified = getCountFullDate().timestamp
    const roomNumberId = JSON.parse(req.body.room_number_id)
    const roomNumber = JSON.parse(req.body.room_number)
    const building = JSON.parse(req.body.building)
    const buildingFloor = JSON.parse(req.body.building_floor)

    let roomNewData = []
    for (let i = 0; i < roomNumber.length; i++) {
        const id = roomNumberId[i]
        const dataItem = {
            'room_number_id': `${id}`,
            'room_number': roomNumber[i],
            'building': building[i],
            'building_floor': buildingFloor[i],
            'status': 'empty'
        }
        roomNewData.push(dataItem)
    }
    let append_room = []
    room_sub_list.forEach((r) => {
        const nId = (r.room_number_id)
        const indexR = roomNewData.findIndex((n) => n.room_number_id == nId)

        if (indexR >= 0) {
            const d = roomNewData.filter((nr) => nr.room_number_id == nId)[0]
            append_room.push({
                'room_number_id': nId,
                'room_number': d.room_number,
                'building': d.building,
                'building_floor': d.building_floor,
                'status': r.status
            })
        }
    })

    const map_room = roomNewData.filter((r, i) => {
        if (r.room_number_id == '') {
            r.room_number_id = `rnb-${createRandom()}-${i}`
            return r
        }
    })

    append_room.push(...map_room)


    let oldExample = req.body.old_example
    const example = req.files.example != undefined ?
        req.files.example.map(img => img.filename) : undefined


    let sql = `UPDATE rooms  SET room_type='${room_type}',bed_type='${bed_type}',`
    sql += `roomview='${room_view}',special_options='${special_options}',`
    sql += `detail='${detail}',room_sub='${JSON.stringify(append_room)}',`
    sql += `max_people=${max_people},toilet_count=${toilet_count},`
    sql += `damage=${damage},price_over_people=${price_over_people},`
    sql += `price_over_minutes=${price_over_minutes},price_over_hour=${price_over_hour},`
    sql += `price_over_day=${price_over_day}, price_over_week=${price_over_week},`
    sql += `price_over_month=${price_over_month},price_over_year=${price_over_year},`

    if (example != undefined) {
        if (oldExample != '') {
            oldExample += `,${example}`
        } else {
            oldExample += `${example}`
        }
        sql += `example_room='${oldExample}',`
    } else {
        sql += `example_room='${oldExample}',`
    }

    sql += `modified='${modified}' WHERE room_id='${room_id}'`

    condb.query(sql, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }

        if (!error) {
            const fileExample = fs.readdirSync(path.join(__dirname, 'src/img/example_room/'))

            if (oldExampleDelete != '') {
                const fileDelete = oldExampleDelete.split(',')
                for (let i = 0; i < fileDelete.length; i++) {
                    const fileDeleteItem = fileDelete[i]
                    const files = path.join(__dirname, 'src/img/example_room/') + fileDeleteItem
                    const include = fileExample.includes(fileDeleteItem)
                    if (include == true) {
                        fs.unlinkSync(files)
                    }
                }
            }
            res.send({ 'result': true })
        }
    })
})


app.post('/api/room-delete', (req, res) => {

    const room_id = req.body.room_id
    const img = JSON.parse(req.body.img)

    const sql = `DELETE FROM rooms WHERE room_id=?`

    condb.query(sql, room_id, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            for (let i = 0; i < img.length; i++) {
                const fileDeleteItem = img[i]
                const files = path.join(__dirname, 'src/img/example_room/') + fileDeleteItem
                fs.unlinkSync(files)
            }
            res.send({ 'result': true })
        }
    })

})

app.post('/api/duplicate-room', (req, res) => {
    const { number_room, building_id } = req.body
    condb.query("SELECT * FROM rooms", (err, result, fields) => {
        if (err) {
            res.send({ 'result': false, 'err': err.message })
        }
        if (!err) {
            let duplicate = 0
            let list_room = []
            result.forEach((r) => {
                list_room.push(...JSON.parse(r.room_sub))
            })

            list_room.forEach((rs) => {
                if (rs.room_number == number_room && rs.building == building_id) {
                    duplicate++
                }

            })
            if (duplicate > 0) {
                res.send({ 'result': false })
            } else {
                res.send({ 'result': true })
            }
        }
    })
})
app.post('/api/delete-roomnumber', (req, res) => {
    console.log(req.body)
    const { room_id, room_number_id } = req.body
    const sql = "SELECT * FROM rooms WHERE room_id=?"
    condb.query(sql, room_id, (err, result, fields) => {
        if (err) {
            res.send(
                {
                    'result': false,
                    'err': err.message
                })
        }

        if (!err) {

            const sub = JSON.parse(result[0].room_sub)
            const isEmpty = sub.filter((r) =>
                r.room_number_id == room_number_id)[0]
                .status == 'empty'

            res.send({ 'result': isEmpty })

        }
    })
})

app.post('/api/insert-building', (req, res) => {
    const buildingId = `Build_${createRandom()}`
    const building_name = req.body.building_name
    const building_number = req.body.building_number
    const number_floor = req.body.number_floor
    const dt = getCountFullDate().timestamp
    const created = dt
    const modified = dt

    const sql = 'INSERT INTO building VALUES(?,?,?,?,?,?)'
    const dataInsert = [
        buildingId,
        building_name,
        building_number,
        number_floor,
        created,
        modified,
    ]
    condb.query(sql, dataInsert, (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
            console.log(error)
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })

})

app.post('/api/update-building', (req, res) => {
    const building_id = req.body.building_id
    const building_name = req.body.building_name
    const building_number = req.body.building_number
    const number_floor = req.body.number_floor
    const modified = getCountFullDate().timestamp

    let sql = `UPDATE building SET building_name='${building_name}',`
    sql += `building_number='${building_number}',`
    sql += `floor_count=${number_floor},modified='${modified}'`
    sql += ` WHERE building_id='${building_id}'`
    console.log(sql)
    condb.query(sql, (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })

})

app.post('/api/delete-building', (req, res) => {
    const building_id = req.body.building_id
    const sql = "DELETE FROM building WHERE building_id=?"
    condb.query(sql, building_id, (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })

})

app.post('/api/insert-resting', (req, res) => {
    const { room_id, room_number_id } = req.body
    const booking_id = `B${getCountFullDate().r}-${createRandom()}`
    const created = getCountFullDate().timestamp
    const modified = getCountFullDate().timestamp
    const paid = Number.parseFloat(req.body.paid)
    const total = Number.parseFloat(req.body.total)
    const remain = total - paid
    const sql = "INSERT INTO room_booking VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    const data = [
        booking_id,
        req.body.room_id,
        req.body.room_number_id,
        req.body.price,
        req.body.price,
        req.body.times_count,
        req.body.unit_times,
        req.body.fname,
        req.body.lname,
        req.body.person_count,
        req.body.phone,
        req.body.checkin,
        req.body.checkout,
        created,
        modified,
        'paid',
        req.body.payment,
        paid,
        remain,
        total,
        'resting'
    ]

    condb.query(sql, data, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            let rooms = await db(`SELECT * FROM rooms WHERE room_id='${room_id}'`)
            rooms = JSON.parse(rooms[0].room_sub)

            rooms.map((e) => {
                if (e.room_number_id == room_number_id) {
                    e.status = 'non-empty'
                }
            })
            rooms = JSON.stringify(rooms)

            let up = `UPDATE rooms SET room_sub='${rooms}',`
            up += `modified='${modified}' WHERE room_id='${room_id}'`

            condb.query(up, (error, results, fields) => {
                if (error) {
                    res.send({ 'result': false, 'err': error.message })
                }
                if (!error) {
                    res.send({ 'result': true })
                }
            })
        }
    })
})
app.post('/api/insert-booking', (req, res) => {
    const { room_id, room_number_id } = req.body
    const booking_id = `B${getCountFullDate().r}-${createRandom()}`
    const created = getCountFullDate().timestamp
    const modified = getCountFullDate().timestamp
    const paid = Number.parseFloat(req.body.paid)
    const total = Number.parseFloat(req.body.total)
    const remain = total - paid
    const sql = "INSERT INTO room_booking VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    const data = [
        booking_id,
        req.body.room_id,
        req.body.room_number_id,
        req.body.price,
        req.body.full_price,
        req.body.times_count,
        req.body.unit_times,
        req.body.fname,
        req.body.lname,
        req.body.person_count,
        req.body.phone,
        req.body.checkin,
        req.body.checkout,
        created,
        modified,
        'paid',
        req.body.payment,
        paid,
        remain,
        req.body.total,
        'confirm'
    ]

    condb.query(sql, data, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            let rooms = await db(`SELECT * FROM rooms WHERE room_id='${room_id}'`)
            rooms = JSON.parse(rooms[0].room_sub)

            rooms.map((e) => {
                if (e.room_number_id == room_number_id) {
                    e.status = 'non-empty'
                }
            })
            rooms = JSON.stringify(rooms)

            let up = `UPDATE rooms SET room_sub='${rooms}',`
            up += `modified='${modified}' WHERE room_id='${room_id}'`

            condb.query(up, (error, results, fields) => {
                if (error) {
                    res.send({ 'result': false, 'err': error.message })
                }
                if (!error) {
                    res.send({ 'result': true })
                }
            })
        }
    })
})

app.post('/api/confirm-checkin', (req, res) => {
    const { booking_id, price } = req.body
    const modified = getCountFullDate().timestamp

    let sql = `UPDATE room_booking SET status='resting',`
    sql += `modified='${modified}' WHERE booking_id='${booking_id}'`

    condb.query(sql, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })
})
app.post('/api/cancel-checkin', (req, res) => {
    const { booking_id, room_id, room_number_id } = req.body
    const modified = getCountFullDate().timestamp


    let sql = `UPDATE room_booking SET status='cancel',`
    sql += `modified='${modified}' WHERE booking_id='${booking_id}'`

    condb.query(sql, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {

            let rooms = await db(`SELECT * FROM rooms WHERE room_id='${room_id}'`)
            rooms = JSON.parse(rooms[0].room_sub)

            rooms.map((e) => {
                if (e.room_number_id == room_number_id) {
                    e.status = 'empty'
                }
            })
            rooms = JSON.stringify(rooms)


            let up = `UPDATE rooms SET room_sub='${rooms}',`
            up += `modified='${modified}' WHERE room_id='${room_id}'`


            condb.query(up, (error, results, fields) => {
                if (error) {
                    res.send({ 'result': false, 'err': error.message })
                }
                if (!error) {
                    res.send({ 'result': true })
                }
            })
        }
    })
})
app.post('/api/checkout-room', (req, res) => {
    const { booking_id, room_id, room_number_id } = req.body
    const sql = "UPDATE room_booking SET status='success' WHERE booking_id=? "
    condb.query(sql, booking_id, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            condb.query("SELECT * FROM rooms WHERE room_id=?", room_id, async (error, results, fields) => {
                if (error) {
                    res.send({ 'result': false, 'err': error.message })
                }
                if (!error) {

                    let roomsub = JSON.parse(results[0].room_sub)
                    roomsub.map((r) => {
                        if (r.room_number_id == room_number_id) {
                            r.status = 'empty'
                        }
                    })


                    const modified = getCountFullDate().timestamp
                    let up = `UPDATE rooms SET room_sub='${JSON.stringify(roomsub)}',`
                    up += `modified='${modified}' WHERE room_id='${room_id}'`

                    condb.query(up, async (error, results, fields) => {
                        if (error) {
                            res.send({ 'result': false, 'err': error.message })
                        }
                        if (!error) {
                            res.send({ 'result': true })
                        }
                    })
                }
            })
        }
    })
})
app.post('/api/booking-paid', (req, res) => {
    const { booking_id, paid, remain } = req.body
    let sql = `UPDATE room_booking SET paid=paid+${paid},`
    sql += `remain=${remain}-${paid} WHERE booking_id='${booking_id}'`
    condb.query(sql, (err, result, fields) => {
        if (err) {
            res.send({ 'result': false, 'err': err.message })
        }

        if (!err) {
            res.send({ 'result': true })
        }
    })
})
app.post('/api/building-floor', (req, res) => {
    const building = req.body.building
    condb.query("SELECT * FROM building WHERE building_id=? ", building, (err, result, fields) => {
        if (err) {
            res.send({ 'result': false, 'err': err.message })
        }

        if (!err) {
            res.send({ 'result': true, 'entries': result[0].floor_count })
        }
    })
})
app.post('/api/query-room', (req, res) => {
    const roomId = req.body.room_id

    condb.query("SELECT * FROM rooms WHERE room_id=? ", roomId, (err, result, fields) => {
        if (err) {
            res.send({ 'result': false, 'err': err.message })
        }

        if (!err) {
            res.send({ 'result': true, 'entries': result })
        }
    })


})

app.post('/api/fetch-building', (req, res) => {

    condb.query("SELECT * FROM building ", (err, result, fields) => {
        if (err) {
            res.send({ 'result': false, 'err': err.message })
        }

        if (!err) {
            res.send({ 'result': true, 'entries': result })
        }
    })
})


app.post('/api/insert-price', (req, res) => {
    const id = 'np' + getCountFullDate().r
    const priceid = 'p' + createRandom()
    const { room_id, price, full_price, unit, times } = req.body

    const obj_price = Object.assign(
        { 'id': priceid },
        { 'full_price': full_price },
        { 'price': price },
        { 'unit': unit },
        { 'times': times }
    )
    const data_price = JSON.stringify([obj_price])


    condb.query("SELECT * FROM rooms WHERE room_id=?", room_id, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            let sql = ``
            const rowCount = results.length
            const data_price_count = (results[0].data_price) == '' ? 0 : JSON.parse(results[0].data_price).length

            if (data_price_count == 0) {
                sql = `UPDATE rooms SET data_price='${data_price}',`
                sql += `modified='${getCountFullDate().timestamp}' WHERE room_id='${room_id}'`

            } else if (data_price_count >= 1) {

                let priceJson = []
                const obj_price_old = JSON.parse(results[0].data_price)

                priceJson.push(...obj_price_old)
                priceJson.push(obj_price)

                const priceJsonNew = JSON.stringify(priceJson)
                sql = `UPDATE rooms SET modified='${getCountFullDate().timestamp}',`
                sql += `data_price='${priceJsonNew}' WHERE room_id='${room_id}'`
            }



            condb.query(sql, async (error, results, fields) => {
                if (error) {
                    res.send({ 'result': false, 'err': error.message })
                }
                if (!error) {
                    res.send({ 'result': true })
                }
            })
        }
    })




})

app.post('/api/update-price', (req, res) => {

    const priceid = 'p' + createRandom()
    const { room_id, price, full_price, unit, times, price_id } = req.body

    const obj_price = Object.assign(
        { 'id': priceid },
        { 'full_price': full_price },
        { 'price': price },
        { 'unit': unit },
        { 'times': times }
    )
    const modified = getCountFullDate().timestamp

    const sql = "SELECT * FROM rooms WHERE room_id=?"

    condb.query(sql, room_id, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })

        }
        if (!error) {
            let priceObj = []
            const json_price = JSON.parse(results[0].data_price)
            const filterPrice = json_price.filter((p) => p.id != price_id)
            const newPrice = {
                'id': price_id,
                'full_price': full_price,
                'price': price,
                'times': times,
                'unit': unit,
            }

            priceObj.push(...filterPrice)
            priceObj.push(newPrice)

            const priceJson = JSON.stringify(priceObj)

            let up = `UPDATE rooms SET modified='${modified}',`
            up += `data_price='${priceJson}' WHERE room_id='${room_id}'`
            console.log(up)
            condb.query(up, async (error, results, fields) => {
                if (error) {
                    res.send({ 'result': false, 'err': error.message })
                }
                if (!error) {
                    res.send({ 'result': true })
                }
            })
        }
    })

})

app.post('/api/delete-price', (req, res) => {

    const { price_id, room_id } = req.body
    const modified = getCountFullDate().timestamp
    condb.query("SELECT * FROM rooms WHERE room_id=?", room_id, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            const dataPrice = JSON.parse(results[0].data_price).filter((p) => p.id != price_id)
            const objPrice = JSON.stringify(dataPrice)

            let sql = `UPDATE rooms SET data_price = '${objPrice}', `
            sql += `modified='${modified}' `
            sql += `WHERE room_id='${room_id}'`

            condb.query(sql, async (error, results, fields) => {
                if (error) {
                    res.send({ 'result': false, 'err': error.message })
                }
                if (!error) {
                    res.send({ 'result': true })
                }
            })
        }
    })

})


app.post('/api/unique-price', (req, res) => {
    const { unit, times, room_id, price_id, price } = req.body
    condb.query("SELECT * FROM rooms WHERE room_id=?", room_id, (err, result, fields) => {
        if (result[0].data_price != '') {
            let data_price = JSON.parse(result[0].data_price)
            data_price = data_price.filter((p) => p.id != price_id)
            const unique = data_price.find((dp, index) => dp.full_price == price || (dp.unit == unit && dp.times == times))
            if (unique == undefined) {
                console.log('ไม่มีราคานี้')
                res.send({ 'result': true })
            } else {
                res.send({ 'result': false })
            }
        } else {
            res.send({ 'result': true })
        }
    })
})

app.get('/api/preview-room', (req, res) => {
    condb.query("SELECT * FROM rooms ", (err, result, fields) => {
        if (err) {
            res.send({ 'result': false, 'err': err.message })
        }
        if (!err) {
            res.send({ 'result': true, 'entries': result })
            console.log(result)
        }
    })
})



app.post('/api/stay-room', (req, res) => {
    console.log(req.body)
})


app.post('/api/add-admin', upload_profile.single('profile'), (req, res) => {
    console.log(req.body)
    const { fname, lname, username, password, private_level } = req.body
    const profile = req.file.filename
    const id = `A${createRandom()}`
    const created = getCountFullDate().timestamp
    const modified = getCountFullDate().timestamp
    console.log(profile)
    const data = [
        id,
        fname,
        lname,
        username, password, private_level,
        profile, created, modified
    ]

    const sql = "INSERT INTO admin VALUES(?,?,?,?,?,?,?,?,?)"

    condb.query(sql, data, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })
})

app.post('/api/update-admin', upload_profile.single('profile'), (req, res) => {
    const { fname, lname, username, password, private_level, admin_id, old_profile } = req.body
    const modified = getCountFullDate().timestamp

    let sql = `UPDATE admin SET username='${username}',`
    sql += `password='${password}',fname='${fname}',`
    sql += `lname='${lname}',private_level='${private_level}',`


    if (req.file != undefined) {
        sql += `profile='${req.file.filename}',`
    }

    sql += `modified='${modified}' WHERE admin_id='${admin_id}'`

    condb.query(sql, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            if (req.file != undefined) {
                const adminProfile = fs.readdirSync(path.join(__dirname, 'src/profile/'))
                const fileDelete = path.join(__dirname, 'src/profile/') + old_profile

                for (let i = 0; i < adminProfile.length; i++) {
                    const fileItem = adminProfile[i]
                    if (fileItem == old_profile) {
                        fs.unlinkSync(fileDelete)
                    }
                }

            }
            res.send({ 'result': true })
        }
    })
})



app.post('/api/delete-admin', (req, res) => {
    const { admin_id, profile } = req.body
    const sql = "DELETE FROM admin WHERE admin_id=?"
    condb.query(sql, admin_id, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {

            const adminProfile = fs.readdirSync(path.join(__dirname, 'src/profile/'))
            const fileDelete = path.join(__dirname, 'src/profile/') + profile

            for (let i = 0; i < adminProfile.length; i++) {
                const fileItem = adminProfile[i]
                if (fileItem == profile) {
                    fs.unlinkSync(fileDelete)
                }
            }

            res.send({ 'result': true })
        }
    })
})

app.post('/api/about-img-upload', upload_aboutRoom_img.single('img'), (req, res) => {
    const img = req.file.filename
    const { old_img, id } = req.body
    const modified = getCountFullDate().timestamp

    let sql = `UPDATE room_about SET img='${img}',modified='${modified}' `
    sql += `WHERE id='${id}'`

    condb.query(sql, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            const aboutRoom = fs.readdirSync(path.join(__dirname, 'src/about_room/'))

            if (old_img != '') {
                const old_img_delete = path.join(__dirname, 'src/about_room/') + old_img
                const include = aboutRoom.includes(old_img)

                if (include == true) {
                    fs.unlinkSync(old_img_delete)
                }
            }
            res.send({ 'result': true })
        }
    })
})

app.post('/api/about-status', (req, res) => {
    const { id, status } = req.body
    const modified = getCountFullDate().timestamp

    let sql = `UPDATE room_about  SET status='${status}',`
    sql += `modified='${modified}' WHERE id='${id}'`

    condb.query(sql, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })
})

app.post('/api/add-slide', upload_siide.single('slide'), (req, res) => {
    const silde = req.file.filename
    const { title, descript } = req.body
    const id = `slide_${createRandom()}`
    const created = getCountFullDate().timestamp
    const modified = getCountFullDate().timestamp

    const data = [
        id,
        title,
        descript,
        silde,
        'off',
        'off',
        'off',
        created,
        modified
    ]


    const sql = "INSERT INTO slide VALUES(?,?,?,?,?,?,?,?,?)"
    condb.query(sql, data, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })

})

app.post('/api/delete-slide', upload_siide.single('slide'), (req, res) => {
    const { slide_id, src } = req.body
    const sql = "DELETE FROM slide WHERE slide_id=?"
    condb.query(sql, slide_id, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            const slideDir = fs.readdirSync(path.join(__dirname, 'src/slide/'))
            if (slideDir.includes(src)) {
                const fileDelete = slideDir + src
            }
            res.send({ 'result': true })
        }
    })

})
app.post('/api/switch-title-slide', (req, res) => {
    const { slide_id, status } = req.body
    const modified = getCountFullDate().timestamp
    let sql = `UPDATE slide SET title_status='${status}',`
    sql += `modified='${modified}' WHERE slide_id='${slide_id}'`
    condb.query(sql, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })
})

app.post('/api/switch-title-descript', (req, res) => {
    const { slide_id, status } = req.body
    const modified = getCountFullDate().timestamp
    let sql = `UPDATE slide SET descript_status='${status}',`
    sql += `modified='${modified}' WHERE slide_id='${slide_id}'`
    condb.query(sql, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })
})

app.post('/api/switch-slide-status', (req, res) => {
    const { slide_id, status } = req.body
    const modified = getCountFullDate().timestamp
    let sql = `UPDATE slide SET status='${status}',`
    sql += `modified='${modified}' WHERE slide_id='${slide_id}'`
    condb.query(sql, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })
})

app.post('/api/insert-facility', upload_facility.single('img'), (req, res) => {
    const { subject, descript } = req.body
    const img = req.file.filename
    const id = `f${createRandom()}`
    const created = getCountFullDate().timestamp
    const modified = getCountFullDate().timestamp
    const sql = "INSERT INTO facility VALUES(?,?,?,?,?,?)"
    const data = [
        id,
        subject,
        descript,
        img,
        created,
        modified
    ]

    condb.query(sql, data, (err, result, fields) => {
        if (err) {
            res.send({ 'result': false })
        }

        if (!err) {
            res.send({ 'result': true })
        }
    })
})

app.post('/api/delete-facility', (req, res) => {
    const { facility_id, img } = req.body
    const sql = "DELETE FROM facility WHERE facility_id=?"
    condb.query(sql, facility_id, (err, result, fields) => {
        if (err) {
            res.send({ 'result': false })
        }

        if (!err) {
            const facilityDir = fs.readdirSync(path.join(__dirname, '/src/facility'))
            const facilityDelete = path.join(__dirname, '/src/facility/') + img
            if (facilityDir.includes(img)) {
                fs.unlinkSync(facilityDelete)
            }
            res.send({ 'result': true })
        }
    })
})

app.post('/api/update-facility', upload_facility.single('img'), (req, res) => {
    const { facility_id, old_img, descript, subject } = req.body
    const img = req.file.filename
    const modified = getCountFullDate().timestamp

    let sql = `UPDATE facility SET subject='${subject}',`
    sql += `description='${descript}',img='${img}',`
    sql += `modified='${modified}' WHERE facility_id='${facility_id}'`

    console.log(sql)
    condb.query(sql, (err, result, fields) => {
        if (err) {
            res.send({ 'result': false })
        }

        if (!err) {
            const facilityDir = fs.readdirSync(path.join(__dirname, '/src/facility'))
            const facilityDelete = path.join(__dirname, '/src/facility/') + old_img
            if (facilityDir.includes(old_img)) {
                fs.unlinkSync(facilityDelete)
            }
            res.send({ 'result': true })
        }
    })
})

app.post('/api/slide', (req, res) => {
    const sql = "SELECT * FROM slide WHERE status='on'"
    condb.query(sql, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true, 'entries': results })
        }
    })
})

app.post('/api/room', async (req, res) => {
    condb.query("SELECT  * FROM rooms ORDER BY modified DESC", async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            let rooms = []
            results.forEach((r) => {
                const room_sub = JSON.parse(r.room_sub)
                const { room_id,
                    room_type,
                    bed_type,
                    roomview,
                    special_options,
                    bathtup,
                    bathroom,
                    smoking,
                    detail,
                    data_price,
                    example_room,
                    created,
                    modified } = r
                room_sub.forEach((e) => {

                    const { room_number, building, building_floor, status } = e
                    console.log(status)
                    const data = {
                        room_number, building, building_floor, status,
                        room_id,
                        room_type,
                        bed_type,
                        roomview,
                        special_options,
                        bathtup,
                        bathroom,
                        smoking,
                        detail,
                        data_price,
                        example_room,
                        created,
                        modified
                    }

                    if (status == 'empty') {
                        rooms.push(data)
                    }
                })
                rooms = rooms.filter((v, i) => i < 5)
            })
            res.send(
                { 'result': true, 'entries': rooms }

            )
        }
    })
})
app.post('/api/add-payment', (req, res) => {
    const {
        bankname,
        bank_branch,
        bank_number,
        account_name
    } = req.body
    const paymentId = `PAY_${createRandom()}`
    const created = getCountFullDate().timestamp
    const modified = getCountFullDate().timestamp
    const dataInsert = [
        paymentId,
        bankname,
        bank_branch,
        bank_number,
        account_name,
        'on',
        created,
        modified
    ]
    const sql = "INSERT INTO payment VALUES(?,?,?,?,?,?,?,?)"
    condb.query(sql, dataInsert, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })

})

app.post('/api/edit-payment', (req, res) => {
    console.log(req.body)
    const {
        bankname,
        bank_branch,
        bank_number,
        account_name, id } = req.body
    const modified = getCountFullDate().timestamp

    let sql = `UPDATE payment SET bank_name='${bankname}',`
    sql += `bank_branch='${bank_branch}',`
    sql += `bank_number='${bank_number}',`
    sql += `account_name='${account_name}',`
    sql += `modified='${modified}' WHERE payment_id='${id}' `

    condb.query(sql, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })

})




app.post('/api/delete-payment', (req, res) => {
    const id = req.body.id
    const sql = "DELETE FROM payment WHERE payment_id=?"
    condb.query(sql, id, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })

})


app.post('/api/bank-switch', (req, res) => {
    console.log(req.body)
    const { id, status } = req.body
    const modified = getCountFullDate().timestamp
    const sql = `UPDATE payment SET status='${status}',modified='${modified}' WHERE payment_id='${id}'`
    condb.query(sql, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true })
        }
    })

})


app.post('/api/bank-transfer', (req, res) => {
    condb.query("SELECT * FROM payment", (err, result, fields) => {
        if (err) {
            res.send(
                {
                    'result': false,
                    'err': err.message
                })
        }
        if (!err) {
            const payment = result.filter((r) => {
                if (r.status == 'on') {
                    return r
                }
            })
            if (payment.length > 0) {
                res.send(
                    {
                        'result': true,
                        'entries': payment
                    })
            }
            if (payment.length == 0) {
                res.send(
                    {
                        'result': true,
                        'entries': result
                    })
            }

        }
    })
})


app.post('/api/add-qrcode', upload_qrcode.single('qrcode'), (req, res) => {
    const { bank, old_qrcode } = req.body
    const qrcode = req.file.filename
    const created = getCountFullDate().timestamp
    const modified = getCountFullDate().timestamp

    condb.query("SELECT * FROM qrcode", (err, result, fields) => {
        if (err) {
            res.send({ 'result': false, 'err': err.message })
        }
        if (!err) {
            if (result.length == 0) {
                const data = [
                    'qrcode',
                    bank,
                    qrcode,
                    created,
                    modified
                ]
                condb.query("INSERT INTO qrcode VALUES (?,?,?,?,?)", data, (err, result, fields) => {
                    if (err) {
                        res.send({ 'result': false, 'err': err.message })
                    }
                    if (!err) {
                        res.send({ 'result': true })
                    }
                })
            }

            if (result.length == 1) {
                let sql = `UPDATE qrcode SET bank='${bank}',img='${qrcode}',`
                sql += `modified='${modified}'`
                condb.query(sql, (err, result, fields) => {
                    if (err) {
                        res.send({ 'result': false, 'err': err.message })
                    }
                    if (!err) {
                        console.log(old_qrcode)
                        if (old_qrcode != '') {
                            const qrCodeDir = fs.readdirSync(path.join(__dirname, 'src/qrcode'))
                            const fileDelete = path.join(__dirname, 'src/qrcode/') + old_qrcode

                            if (qrCodeDir.includes(old_qrcode)) {
                                console.log(fileDelete)
                                fs.unlinkSync(fileDelete)
                            }
                        }
                        res.send({ 'result': true })
                    }
                })
            }
        }
    })
})
app.post('/api/add-social', (req, res) => {

    const { id, social, link } = req.body
    const created = getCountFullDate().timestamp
    const modified = getCountFullDate().timestamp


    condb.query("SELECT * FROM social WHERE id=?", id, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            if (results.length == 0) {
                const insert = "INSERT INTO social VALUES(?,?,?,?,?,?)"
                const dataInsert = [
                    id,
                    social,
                    link,
                    created,
                    modified,
                    'on'
                ]
                condb.query(insert, dataInsert, async (error, results, fields) => {
                    if (error) {
                        res.send({ 'result': false, 'err': error.message })
                    }
                    if (!error) {
                        res.send({ 'result': true })
                    }
                })
            }

            if (results.length == 1) {
                let up = `UPDATE social SET social='${social}',link='${link}',`
                up += `modified='${modified}' WHERE id='${id}'`

                condb.query(up, async (error, results, fields) => {
                    if (error) {
                        res.send({ 'result': false, 'err': error.message })
                    }
                    if (!error) {
                        res.send({ 'result': true })
                    }
                })
            }

        }
    })

})


app.post('/api/social', (req, res) => {
    condb.query("SELECT * FROM social", (err, result, fields) => {
        if (err) {
            res.send(
                {
                    'result': false,
                    'err': err.message
                })
        }
        if (!err) {
            res.send(
                {
                    'result': true,
                    'entries': result
                })
        }
    })
})



app.post('/api/switch-social', async (req, res) => {
    try {
        const { id, status } = req.body
        const count = await db(`SELECT * FROM social WHERE id='${id}'`)
        if (count.length == 0) {
            res.send({ 'result': true, 'is_check': false })
        } else {
            const sql = `UPDATE social SET status='${status}' WHERE id='${id}'`
            condb.query(sql, async (error, results, fields) => {
                if (error) {
                    res.send({ 'result': false, 'err': error.message })
                }
                if (!error) {
                    const is_check = status == 'on' ? true : false
                    res.send({ 'result': true, 'is_check': is_check })
                }
            })
        }
    } catch (error) {
        res.send({ 'result': false, 'err': error.message })
    }


})





app.post('/api/contact-about', (req, res) => {
    console.log(req.body)
    const { company,
        location,
        road_alley,
        sub_district,
        district,
        province,
        postcode,
        contact_number,
        email } = req.body
    const id = 'about_contact001'
    const created = getCountFullDate().timestamp
    const modified = getCountFullDate().timestamp

    const select = `SELECT * FROM about WHERE id=?`
    condb.query(select, id, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            if (results.length == 0) {
                const data = [
                    id,
                    company,
                    location,
                    road_alley,
                    sub_district,
                    district,
                    province,
                    postcode,
                    contact_number,
                    email,
                    created,
                    modified
                ]
                const insert = "INSERT INTO about VALUES(?,?,?,?,?,?,?,?,?,?,?,?)"
                condb.query(insert, data, async (error, results, fields) => {
                    if (error) {
                        res.send({ 'result': false, 'err': error.message })
                    }
                    if (!error) {
                        res.send({ 'result': true })
                    }
                })
            }

            if (results.length == 1) {
                let update = `UPDATE about SET company='${company}',`
                update += `location='${location}',road_alley='${road_alley}',`
                update += `sub_district='${sub_district}',district='${district}',`
                update += `province='${province}',postcode='${postcode}',`
                update += `contact_number='${contact_number}',email='${email}',`
                update += `modified='${modified}' WHERE id='${id}'`

                condb.query(update, async (error, results, fields) => {
                    if (error) {
                        res.send({ 'result': false, 'err': error.message })
                    }
                    if (!error) {
                        res.send({ 'result': true })
                    }
                })
            }
        }
    })

    // condb.query(select, id, async (error, results, fields) => {
    //     if (error) {
    //         res.send({ 'result': false, 'err': error.message })
    //     }
    //     if (!error) {
    //         res.send({ 'result': true })
    //     }
    // })
})



app.post('/api/about', (req, res) => {
    condb.query("SELECT * FROM about ", "on", async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true, 'entries': results })
        }
    })
})


app.post('/api/add-logo', upload_logo.fields([{
    'name': 'logo', maxCount: 1
}, {
    'name': 'icon', maxCount: 1
}]), (req, res) => {

    let logo = ''
    let type = ''

    if (req.files.logo) {
        type = 'file'
        logo = req.files.logo[0].filename
    }
    if (req.body.logo) {
        type = 'text'
        logo = req.body.logo
    }

    const created = getCountFullDate().timestamp
    const modified = getCountFullDate().timestamp

    const data = [
        'logo',
        type,
        '',
        logo,
        '',
        created,
        modified
    ]
    condb.query("SELECT * FROM logo WHERE id=? ", "logo", async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            if (results.length == 0) {
                condb.query("INSERT INTO logo VALUES(?,?,?,?,?,?,?) ", data, async (error, results, fields) => {
                    if (error) {
                        res.send({ 'result': false, 'err': error.message })
                    }
                    if (!error) {
                        res.send({ 'result': true, 'entries': results })
                    }
                })
            }


            if (results.length == 1) {


                let up = `UPDATE logo SET type ='${type}',logo='${logo}',`
                up += `modified='${modified}' WHERE id='logo' `


                condb.query(up, async (error, results, fields) => {
                    if (error) {
                        res.send({ 'result': false, 'err': error.message })
                    }
                    if (!error) {
                        res.send({ 'result': true, 'entries': results })
                    }
                })
            }
        }
    })
})

app.post('/api/add-icon', upload_logo.fields([{
    'name': 'logo', maxCount: 1
}, {
    'name': 'icon', maxCount: 1
}]), (req, res) => {

    let icon = ''

    if (req.files.icon) {
        icon = req.files.icon[0].filename
    }

    const created = getCountFullDate().timestamp
    const modified = getCountFullDate().timestamp

    const data = [
        'logo',
        '',
        '',
        '',
        icon,
        created,
        modified
    ]
    condb.query("SELECT * FROM logo WHERE id=? ", "logo", async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            if (results.length == 0) {
                condb.query("INSERT INTO logo VALUES(?,?,?,?,?,?,?) ", data, async (error, results, fields) => {
                    if (error) {
                        res.send({ 'result': false, 'err': error.message })
                    }
                    if (!error) {
                        res.send({ 'result': true, 'entries': results })
                    }
                })
            }


            if (results.length == 1) {

                let up = `UPDATE logo SET icon='${icon}',`
                up += `modified='${modified}' WHERE id='logo'`


                condb.query(up, async (error, results, fields) => {
                    if (error) {
                        res.send({ 'result': false, 'err': error.message })
                    }
                    if (!error) {
                        res.send({ 'result': true, 'entries': results })
                    }
                })
            }
        }
    })
})

app.post('/api/add-title', (req, res) => {

    const title = req.body.title
    const created = getCountFullDate().timestamp
    const modified = getCountFullDate().timestamp
    console.log(title)
    const data = [
        'logo',
        '',
        title,
        '',
        '',
        created,
        modified
    ]
    condb.query("SELECT * FROM logo WHERE id=? ", "logo", async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            if (results.length == 0) {
                condb.query("INSERT INTO logo VALUES(?,?,?,?,?,?,?) ", data, async (error, results, fields) => {
                    if (error) {
                        res.send({ 'result': false, 'err': error.message })
                    }
                    if (!error) {
                        res.send({ 'result': true, 'entries': results })
                    }
                })
            }


            if (results.length == 1) {

                let up = `UPDATE logo SET title ='${title}',`
                up += `modified='${modified}' WHERE id='logo' `



                condb.query(up, async (error, results, fields) => {
                    if (error) {
                        res.send({ 'result': false, 'err': error.message })
                    }
                    if (!error) {
                        res.send({ 'result': true, 'entries': results })
                    }
                })
            }
        }
    })
})

app.post('/api/icon', (req, res) => {
    condb.query("SELECT * FROM logo", async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true, 'entries': results })
        }
    })
})

app.post('/api/add-meta', (req, res) => {
    const { content, name } = req.body
    const id = `meta_${createRandom()}`
    const created = getCountFullDate().timestamp
    const modified = getCountFullDate().timestamp

    const data = [
        id,
        name,
        content,
        created,
        modified
    ]

    condb.query("INSERT INTO meta VALUES(?,?,?,?,?)", data, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true, })
        }
    })
})



app.post('/api/meta', (req, res) => {
    condb.query("SELECT * FROM meta", async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true, 'entries': results })
        }
    })
})

app.post('/api/meta-edit', (req, res) => {
    const id = req.body.id
    condb.query("SELECT * FROM meta WHERE meta_id=?", id, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true, 'entries': results })
        }
    })
})

app.post('/api/meta-update', (req, res) => {
    const { id, content, name } = req.body
    const modified = getCountFullDate().timestamp

    let sql = `UPDATE meta SET meta_name='${name}',content='${content}',`
    sql += `modified='${modified}' WHERE meta_id='${id}'`
    condb.query(sql, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true, })
        }
    })
})

app.post('/api/meta-delete', (req, res) => {
    const id = req.body.id
    const sql = `DELETE FROM meta WHERE meta_id=?`

    condb.query(sql, id, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            res.send({ 'result': true, })
        }
    })
})
async function signinAdmin(data) {
    const { username, password } = data
    return await db(`SELECT * FROM admin WHERE username='${username}' AND password='${password}'`)

}

async function adminSession(req) {
    return await req.session.admin
}
async function addAdminSession(req, data) {
    const {
        username,
        password,
        fname,
        private_level,
        profile
    } = data

    req.session.admin = await username
    req.session.admin_level = await private_level
    req.session.admin_fname = await fname
    req.session.admin_profile = await profile

    const {
        admin,
        admin_level,
        admin_fname,
        admin_profile
    } = await req.session

    return admin && admin_level && admin_fname && admin_profile ? { 'result': true } : { 'result': false }
}
app.post('/api/sign-in', async (req, res) => {
    const admin_session = await adminSession(req)
    if (!admin_session) {
        const { username, password } = req.body
        if (configAdmin.username == username && configAdmin.password == password) {
            const signInResult = await addAdminSession(req, configAdmin)
            if (signInResult) {
                res.send({ 'result': true })
            } else {
                res.send({ 'result': false })
            }
        } else {
            const data = await signinAdmin(req.body)

            if (data.length == 0) {
                res.send({ 'result': false, 'msg': 'ไม่ผู้ใช้งานนี้ หรือ กรอกข้อมูล ผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง' })
            }

            if (data.length == 1) {
                const signInResult = await addAdminSession(req, data[0])
                if (signInResult) {
                    res.send({ 'result': true })
                } else {
                    res.send({ 'result': false })
                }
            }

        }
    }
})


app.post('/api/sign-out', async (req, res) => {

    const signOutResult = await clearSessionAndSignOut(req)
    if (signOutResult) {
        res.send({ 'result': true })
    }
    if (!signOutResult) {
        res.send({ 'result': false })
    }
})


app.post('/api/confirm-booking', (req, res) => {
    const id = req.body.id
    const sql = "UPDATE room_booking SET status='confirm',pay_status='paid' WHERE booking_id=? "

    condb.query(sql, id, async (err, results, fields) => {
        if (err) {
            res.send({ 'result': false, 'err': err.message })
        }
        if (!err) {
            res.send({ 'result': true })
        }
    })

})
app.post('/api/cancel-booking', (req, res) => {
    const { room_id, booking_id, room_number_id } = req.body
    let sql = "UPDATE room_booking SET status='cancel',pay_status='unpaid',"
    sql += `modified='${getCountFullDate().timestamp}' WHERE booking_id='${booking_id}'`

    condb.query(sql, async (error, results, fields) => {
        if (error) {
            res.send({ 'result': false, 'err': error.message })
        }
        if (!error) {
            condb.query("SELECT * FROM rooms WHERE room_id=?", room_id, async (error, results, fields) => {
                if (error) {
                    res.send({ 'result': false, 'err': error.message })
                }
                if (!error) {
                    let roomsub = JSON.parse(results[0].room_sub)
                    roomsub.map((r) => {
                        if (r.room_number_id == room_number_id) {
                            r.status = 'empty'
                        }
                    })

                    const modified = getCountFullDate().timestamp
                    let up = `UPDATE rooms SET room_sub='${JSON.stringify(roomsub)}',`
                    up += `modified='${modified}' WHERE room_id='${room_id}'`
                    condb.query(up, async (error, results, fields) => {
                        if (error) {
                            res.send({ 'result': false, 'err': error.message })
                        }
                        if (!error) {
                            res.send({ 'result': true })
                        }
                    })
                }
            })
        }
    })

})


app.post('/api/cancel-booking-list', (req, res) => {
    const { booking_id, money } = req.body
    let sql = `UPDATE room_booking SET total=total-${money},`
    sql += `paid=paid-${money} WHERE booking_id='${booking_id}'`
    condb.query(sql, (err, result, fields) => {
        if (err) {
            res.send({ 'result': false, 'err': err.message })
        }

        if (!err) {
            res.send({ 'result': true, 'entries': result })
        }
    })
})
app.put('/api/payment-edit', (req, res) => {
    const id = req.body.id
    condb.query("SELECT * FROM payment WHERE payment_id=?", id, (err, result, fields) => {
        if (err) {
            res.send({ 'result': false, 'err': err.message })
        }

        if (!err) {
            res.send({ 'result': true, 'entries': result })
        }
    })
})

app.post('/api/report-booking', async (req, res) => {
    try {
        const rooms = await db(`SELECT * FROM rooms`)
        let room_number = []
        rooms.forEach((r) => room_number.push(...JSON.parse(r.room_sub)))

        const booking_id = req.body.booking_id
        const sql = "SELECT * FROM room_booking WHERE booking_id=?"
        condb.query(sql, booking_id, (err, result, fields) => {
            if (err) {
                res.send({ 'result': false, 'err': err.message })
            }

            if (!err) {
                result.map((b) => {
                    const number = room_number.filter((n) => n.room_number_id == b.room_number)
                    const n = number.length > 0
                        ? number[0].room_number
                        : 'ไม่พบห้องนี้'

                    Object.assign(b, {
                        'room_number_id': b.room_number,
                        'room_number': n
                    })
                })
                res.send({ 'result': true, 'entries': result })
            }
        })
    } catch (err) {
        res.send({ 'result': false, 'err': err.message })
    }

})

app.post('/api/price-over-time', (req, res) => {
    const roomId = req.body.room_id

    const sql = "SELECT * FROM rooms WHERE room_id=?"
    condb.query(sql, roomId, (err, result, fields) => {
        if (err) {
            res.send({ 'result': false, 'err': err.message })
        }
        if (!err) {
            res.send({ 'result': true, 'entries': result })
        }
    })
})
app.post('/api/add-priceover', (req, res) => {
    const { booking_id } = req.body
    const total = Number.parseFloat(req.body.total)
    const remain = Number.parseFloat(req.body.remain) + total
    const modified = getCountFullDate().timestamp
    let sql = `UPDATE room_booking SET total=total+${total},`
    sql += `remain=${remain},`
    sql += `modified='${modified}' WHERE booking_id='${booking_id}'`
    console.log(sql)
    condb.query(sql, (err, result, fields) => {
        if (err) {
            res.send({ 'result': false, 'err': err.message })
        }
        if (!err) {
            res.send({ 'result': true })
        }
    })
})
app.listen(PORT, (err) => {
    if (err) {
        console.log(err)
    }
})