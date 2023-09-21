$('#resting-insert').click(function () {
  const stayFormData = [{
    'name': 'payment',
    'input': $('[name="payment"]'),
    'validate': $('#validate-payment'),
    'form_type': 'radio',
    'msg': 'กรุณาเลือกวิธีการชำระเงิน'
  }, {
    'name': 'price',
    'input': $('#price'),
    'validate': $('#validate-stayprice'),
    'form_type': 'number',
    'msg': 'กรุณาป้อนราคา'
  }, {
    'name': 'resting_paid',
    'input': $('#resting-paid'),
    'validate': $('#validate-resting-paid'),
    'form_type': 'number',
    'msg': 'กรุณาป้อนยอดชำระ'
  }, {
    'name': 'person-count',
    'input': $('#person-count'),
    'validate': $('#validate-person-count'),
    'form_type': 'select',
    'msg': 'กรุณาป้อนจำนวนคนเข้าพัก'
  }, {
    'name': 'phone',
    'input': $('#phone'),
    'validate': $('#validate-phone'),
    'form_type': 'text',
    'msg': 'กรุณาป้อนเบอร์ติดต่อ'
  }, {
    'name': 'unit-times',
    'input': $('#unit-times'),
    'validate': $('#validate-unit-times'),
    'form_type': 'select',
    'msg': 'กรุณาป้อนเลือกหน่วย'
  }, {
    'name': 'fname',
    'input': $('#fname'),
    'validate': $('#validate-fname'),
    'form_type': 'text',
    'msg': 'กรุณาป้อนชื่อ'
  }, {
    'name': 'lname',
    'input': $('#lname'),
    'validate': $('#validate-lname'),
    'form_type': 'text',
    'msg': 'กรุณาป้อนนามสกุล'
  }, {
    'name': 'checkin',
    'input': [$('#checkin-date'), $('#checkin-times')],
    'validate': $('#validate-checkin'),
    'form_type': 'date',
    'msg': 'กรุณาป้อนเวลาเข้าพัก'
  }, {
    'name': 'checkout',
    'input': [$('#checkout-date'), $('#checkout-times')],
    'validate': $('#validate-checkout'),
    'form_type': 'date',
    'msg': 'กรุณาป้อนเวลาออก'
  }]

  let emptyCount = 0
  stayFormData.forEach((fd) => {
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
      if (c_empty == undefined) {
        emptyCount++
      } else {
        if (c_empty == 0) {
          validateformEmpty(true, validate, msg)
          emptyCount++
        } else if (c_empty == 1) {
          validateformEmpty(false, validate, msg)
        }
      }


    } else {
      const val = $(input).val()
      if (val == '') {
        validateformEmpty(true, validate, msg)
        emptyCount++
      } else {
        validateformEmpty(false, validate, msg)
      }
    }
  })

  const checkin = dateTimesStamp($('#checkin-date').val(), $('#checkin-times').val())
  const checkout = dateTimesStamp($('#checkout-date').val(), $('#checkout-times').val())


  if (emptyCount == 0) {
    const fd = {
      'room_id': $('#room-id').val(),
      'room_number_id': $('#room-number').attr('data-numberId'),
      'price': $('#price').val(),
      'payment': $('[name="payment"]').filter(':checked').val(),
      'times_count': $('#times-count').val(),
      'unit_times': $('#unit-times').val(),
      'person_count': $('#person-count').val(),
      'phone': $('#phone').val(),
      'fname': $('#fname').val(),
      'lname': $('#lname').val(),
      'checkin': checkin,
      'checkout': checkout,
      'paid': $('#resting-paid').val(),
      'total':$('#resting-total').val(),
    }
    axios.post('/api/insert-resting', fd)
      .then((res) => {
        const result = res.data.result
        if (result) {
          querySuccess('ลงทะเบียนการเข้าพัก', 1200)
        } else {
          const err = res.data.err
          queryFail('ลงทะเบียนการเข้าพัก', 'เกิดข้อผิดพลาดในการลงทะเบียน โปรดลองใหม่อีกครั้งภายหลัง', err)
        }
      })
      .catch((err) => {
        statusErr()
      })
  }


})