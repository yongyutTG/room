function dateTimesStamp(dt, times) {
  const date = new Date(`${dt} ${times}`)
  const _d = countDate(date.getDate())
  const _m = countDate(date.getMonth() + 1)
  const _y = date.getFullYear()
  const _h = countDate(date.getHours())
  const _minutes = countDate(date.getMinutes())
  return `${_y}-${_m}-${_d} ${_h}:${_minutes}`
}

function countDate(d) {
  return d.toString().length == 1 ? `0${d}` : d
}

function bookingPrice(e) {
  const id = $(e.target).attr('id')
  const [price, times, unit] = $(e.target).val().split(',')
  const bookingPrice = $.map($('[name="booking-price"]'), (e, i) => $(e).attr('id'))
  $('#booking-total').val(price)
  bookingPrice.forEach((e) => {
    if (e != id) {
      $(`#${e}`).prop('checked', false)
    }
  })

  $('#booking-price').val(price)
  $('#booking-times-count').val(times)
  $('#booking-unit-times').val(unit)
}
function checkPrice(e) {
  $('#checkin-date').val('')
  $('#checkin-times').val('')

  $('#checkout-date').val('')
  $('#checkout-times').val('')
  const id = $(e.target).attr('id')
  const [price, times, unit] = $(e.target).val().split(',')
  const selectPrice = $.map($('[name="select-price"]'), (e, i) => $(e).attr('id'))

  selectPrice.forEach((e) => {
    if (e != id) {
      $(`#${e}`).prop('checked', false)
    }
  })

  $('#price').val(price)
  $('#times-count').val(times)
  $('#unit-times').val(unit)
}
function bookingCheckout() {
  const now = new Date().valueOf()
  const count = Number.parseInt($('#booking-times-count').val())
  const un = $('#booking-unit-times').val()

  const checkInDate = $('#booking-checkin-date').val()
  const checkInTimes = $('#booking-checkin-times').val()

  if (isNaN(count)) {
    validateformEmpty(true, $('#validate-booking-timescount'), 'กรุณาเลือกจำนวน')
  } else {
    validateformEmpty(false, $('#validate-booking-timescount'), '')
  }

  if (un == '') {
    validateformEmpty(true, $('#validate-booking-unittimes'), 'กรุณาเลือกหน่วย')
  } else {
    validateformEmpty(true, $('#validate-booking-unittimes'), '')
  }
  if (isNaN(count) || un == '') {
    $('#booking-checkin-date').val('')
    $('#booking-checkin-times').val('')
  }

  if (checkInDate != '' && checkInTimes != '' && !isNaN(count) && un != '') {
    const timestamp = new Date(`${checkInDate} ${checkInTimes}`).valueOf()
    let appendDt = 0
    if (un == 'minutes') {
      appendDt = timestamp + (1000 * 60 * count)
    } else if (un == 'hours') {
      appendDt = timestamp + (1000 * 60 * 60 * count)
    } else if (un == 'days') {
      appendDt = timestamp + (1000 * 60 * 60 * 24 * count)
    } else if (un == 'months') {
      appendDt = timestamp + (1000 * 60 * 60 * 60 * 24 * count)
    } else if (un == 'year') {
      appendDt = timestamp + (1000 * 60 * 60 * 60 * 24 * 30 * 12)
    }

    if (appendDt < now) {
      $('#booking-checkin-date').val('')
      $('#booking-checkin-times').val('')
      queryFail('เพิ่มวัน และเวลาเข้าพัก', 'กรุณาใส่ข้อมูลที่ถูกต้อง', '')
    } else {
      const out = new Date(appendDt)
      const dt = Display.countDate(out.getDate())
      const m = Display.countDate(out.getMonth() + 1)
      const year = out.getFullYear()
      const hour = Display.countDate(out.getHours())
      const minutes = Display.countDate(out.getMinutes())

      const appendDateOut = `${year}-${m}-${dt}`
      const appendTimesOut = `${hour}:${minutes}`

      $('#booking-checkout-date').val(appendDateOut)
      $('#booking-checkout-times').val(appendTimesOut)
    }

  }
}

function restingCheckout() {
  const now = new Date().valueOf()
  const count = Number.parseInt($('#times-count').val())
  const un = $('#unit-times').val()

  const checkInDate = $('#checkin-date').val()
  const checkInTimes = $('#checkin-times').val()

  if (isNaN(count)) {
    validateformEmpty(true, $('#validate-timescount'), 'กรุณาเลือกจำนวน')
  } else {
    validateformEmpty(false, $('#validate-timescount'), '')
  }

  if (un == '') {
    validateformEmpty(true, $('#validate-unit-times'), 'กรุณาเลือกหน่วย')
  } else {
    validateformEmpty(true, $('#validate-unit-times'), '')
  }
  if (isNaN(count) || un == '') {
    $('#checkin-date').val('')
    $('#checkin-times').val('')
  }

  if (checkInDate != '' && checkInTimes != '' && !isNaN(count) && un != '') {
    const timestamp = new Date(`${checkInDate} ${checkInTimes}`).valueOf()
    let appendDt = 0
    if (un == 'minutes') {
      appendDt = timestamp + (1000 * 60 * count)
    } else if (un == 'hours') {
      appendDt = timestamp + (1000 * 60 * 60 * count)
    } else if (un == 'days') {
      appendDt = timestamp + (1000 * 60 * 60 * 24 * count)
    } else if (un == 'months') {
      appendDt = timestamp + (1000 * 60 * 60 * 60 * 24 * count)
    } else if (un == 'year') {
      appendDt = timestamp + (1000 * 60 * 60 * 60 * 24 * 30 * 12)
    }
    if (appendDt < now) {
      $('#checkin-date').val('')
      $('#checkin-times').val('')
      queryFail('เพิ่มวัน และเวลาเข้าพัก', 'กรุณาใส่ข้อมูลที่ถูกต้อง', '')
    } else {
      const out = new Date(appendDt)
      const dt = Display.countDate(out.getDate())
      const m = Display.countDate(out.getMonth() + 1)
      const year = out.getFullYear()
      const hour = Display.countDate(out.getHours())
      const minutes = Display.countDate(out.getMinutes())

      const appendDateOut = `${year}-${m}-${dt}`
      const appendTimesOut = `${hour}:${minutes}`
      $('#checkout-date').val(appendDateOut)
      $('#checkout-times').val(appendTimesOut)
    }
  }
}