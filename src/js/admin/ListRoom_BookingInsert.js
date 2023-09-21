$('#booking-insert').click(function() {
  const bookingFormData = [{
    'name': 'payment',
    'input': $('[name="booking-payment"]'),
    'validate': $('#validate-booking-payment'),
    'form_type': 'radio',
    'msg': 'กรุณาเลือกวิธีการชำระเงิน'
  }, {
    'name': 'price',
    'input': $('#booking-price'),
    'validate': $('#validate-booking-price'),
    'form_type': 'number',
    'msg': 'กรุณาป้อนราคา'
  }, {
    'name': 'times-stay',
    'input': $('#booking-times-count'),
    'validate': $('#validate-booking-timescount'),
    'form_type': 'number',
    'msg': 'กรุณาป้อนจำนวนเวลาพัก'
  }, {
    'name': 'person-count',
    'input': $('#booking-person-count'),
    'validate': $('#validate-booking-personcount'),
    'form_type': 'select',
    'msg': 'กรุณาป้อนจำนวนคนเข้าพัก'
  }, {
    'name': 'phone',
    'input': $('#booking-phone'),
    'validate': $('#validate-booking-phone'),
    'form_type': 'select',
    'msg': 'กรุณาป้อนเบอร์ติดต่อ'
  }, {
    'name': 'unit-times',
    'input': $('#booking-unit-times'),
    'validate': $('#validate-booking-unittimes'),
    'form_type': 'select',
    'msg': 'กรุณาป้อนเลือกหน่วย'
  }, {
    'name': 'paid',
    'input': $('#booking-paid'),
    'validate': $('#validate-booking-paid'),
    'form_type': 'select',
    'msg': 'กรุณาป้อนยอดชำระ'
  }, {
    'name': 'fname',
    'input': $('#booking-fname'),
    'validate': $('#validate-booking-fname'),
    'form_type': 'text',
    'msg': 'กรุณาป้อนชื่อ'
  }, {
    'name': 'lname',
    'input': $('#booking-lname'),
    'validate': $('#validate-booking-lname'),
    'form_type': 'text',
    'msg': 'กรุณาป้อนนามสกุล'
  }, {
    'name': 'checkin',
    'input': [$('#booking-checkin-date'), $('#booking-checkin-times')],
    'validate': $('#validate-booking-checkin'),
    'form_type': 'date',
    'msg': 'กรุณาป้อนเวลาเข้าพัก'
  }, {
    'name': 'checkout',
    'input': [$('#booking-checkout-date'), $('#booking-checkout-times')],
    'validate': $('#validate-booking-checkout'),
    'form_type': 'date',
    'msg': 'กรุณาป้อนเวลาออก'
  }]

  let emptyCount = 0
  bookingFormData.forEach((fd) => {
    const {
      input,
      validate,
      msg,
      form_type
    } = fd

    if (form_type == 'date') {
      const filterEmpty = $(input).filter((i, e) => $(e).val() == '').length
      if (filterEmpty != 0) {
        validateformEmpty(true, validate, msg)
        emptyCount++
      } else {
        validateformEmpty(false, validate, msg)
      }

    } else if (form_type == 'radio') {
      const c_empty = $(input).filter(':checked').length
      if (c_empty == 0) {
        validateformEmpty(true, validate, msg)
        emptyCount++
      } else if (c_empty == 1) {
        validateformEmpty(false, validate, msg)
      }
    } else {
      const val = $(input).val().trim()
      if (val == '') {
        validateformEmpty(true, validate, msg)
        emptyCount++
      } else {
        validateformEmpty(false, validate, msg)
      }
    }
  })


  const checkin = dateTimesStamp($('#booking-checkin-date').val(), $('#booking-checkin-times').val())
  const checkout = dateTimesStamp($('#booking-checkout-date').val(), $('#booking-checkout-times').val())

  if (emptyCount == 0) {
    const fd = {
      'room_id': $('#booking-room-id').val(),
      'room_number_id': $('#booking-room-number').attr('data-numberId'),
      'price': $('#booking-price').val(),
      'full_price': $('[name="booking-price"]').filter(':checked').attr('data-fullprice'),
      'payment': $('[name="booking-payment"]').filter(':checked').val(),
      'times_count': $('#booking-times-count').val(),
      'unit_times': $('#booking-unit-times').val(),
      'person_count': $('#booking-person-count').val(),
      'phone': $('#booking-phone').val(),
      'fname': $('#booking-fname').val(),
      'lname': $('#booking-lname').val(),
      'checkin': checkin,
      'checkout': checkout,
      'paid': $('#booking-paid').val(),
      'total': $('#booking-total').val()

    }
    axios.post('/api/insert-booking', fd)
      .then((res) => {
        const result = res.data.result
        if (result == true) {
          querySuccess('ลงทะเบียนจองพัก', 1200)
        } else {
          const err = res.data.err
          queryFail('ลงทะเบียนการเข้าพัก', 'เกิดข้อผิดพลาดในการจองห้องพัก โปรดลองใหม่อีกครั้งภายหลัง', err)
        }
      })
      .catch((err) => {
        statusErr()
      })
  }
})