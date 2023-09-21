const multer = require('multer')
const path = require('path')
const {getCountFullDate} = require('../js/function')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let pathRename = ''
    if (file.fieldname == 'example') {
      pathRename = path.join(__dirname, '../img/example_room')
    } 
    cb(null, pathRename)
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname
    const fileType = originalname.substring(originalname.lastIndexOf('.'))
    let pathRename = ''
    if (file.fieldname == 'example') {
      pathRename = 'example_'
    }

    const uniqueSuffix = Math.round(Math.random() * 100000000)
    const getDt = getCountFullDate()
    const { r } = getCountFullDate()
    const n = `${pathRename}${r}_${uniqueSuffix}${fileType}`
    cb(null, n)
  }
})


const logo_storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const pathRename = path.join(__dirname, '../logo/')
      cb(null, pathRename)
  },
  filename: function (req, file, cb) {
      const originalname = file.originalname
      const fileType = originalname.substring(originalname.lastIndexOf('.'))
      let pathRename = ''
      if (file.fieldname == 'logo') {
          pathRename = 'logo'
      } else if (file.fieldname == 'icon') {
          pathRename = 'icon'
      }

      const uniqueSuffix = Math.round(Math.random() * 100000000)
      const getDt = getCountFullDate()
      const { r } = getCountFullDate()
      const n = `${pathRename}${fileType}`
      cb(null, n)
  }
})

const profile_storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const pathRename = path.join(__dirname, '../profile')
      cb(null, pathRename)
  },
  filename: function (req, file, cb) {
      const originalname = file.originalname
      const fileType = originalname.substring(originalname.lastIndexOf('.'))
      let pathRename = 'p_'


      const uniqueSuffix = Math.round(Math.random() * 100000000)
      const getDt = getCountFullDate()
      const { r } = getCountFullDate()
      const n = `${pathRename}${r}_${uniqueSuffix}${fileType}`
      cb(null, n)
  }
})


const aboutRoom_storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const pathRename = path.join(__dirname, '../about_room')
      cb(null, pathRename)
  },
  filename: function (req, file, cb) {
      const originalname = file.originalname
      const fileType = originalname.substring(originalname.lastIndexOf('.'))

      const uniqueSuffix = Math.round(Math.random() * 100000000)
      const getDt = getCountFullDate()
      const { r } = getCountFullDate()
      const n = `r${r}_${uniqueSuffix}${fileType}`
      cb(null, n)
  }
})

const slide_storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const pathRename = path.join(__dirname, '../slide')
      cb(null, pathRename)
  },
  filename: function (req, file, cb) {
      const originalname = file.originalname
      const fileType = originalname.substring(originalname.lastIndexOf('.'))

      const uniqueSuffix = Math.round(Math.random() * 100000000)
      const getDt = getCountFullDate()
      const { r } = getCountFullDate()
      const n = `${r}_${uniqueSuffix}${fileType}`
      cb(null, n)
  }
})

const qrcode_storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const pathRename = path.join(__dirname, '../qrcode/')
      cb(null, pathRename)
  },
  filename: function (req, file, cb) {
      const originalname = file.originalname
      const fileType = originalname.substring(originalname.lastIndexOf('.'))

      const uniqueSuffix = Math.round(Math.random() * 100000000)
      const { r } = getCountFullDate()
      const n = `qr_${r}_${uniqueSuffix}${fileType}`
      cb(null, n)
  }
})


const facility_storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const pathRename = path.join(__dirname, '../facility/')
      cb(null, pathRename)
  },
  filename: function (req, file, cb) {
      const originalname = file.originalname
      const fileType = originalname.substring(originalname.lastIndexOf('.'))

      const uniqueSuffix = Math.round(Math.random() * 100000000)
      const { r } = getCountFullDate()
      const n = `f_${r}_${uniqueSuffix}${fileType}`
      cb(null, n)
  }
})

module.exports.facility_storage = facility_storage
module.exports.qrcode_storage = qrcode_storage
module.exports.slide_storage = slide_storage
module.exports.aboutRoom_storage = aboutRoom_storage
module.exports.profile_storage = profile_storage
module.exports.storage =  storage
module.exports.logo_storage = logo_storage
