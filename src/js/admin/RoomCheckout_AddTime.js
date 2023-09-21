$('.room-add-time').click(function () {
  $('#checkout-addtime-form')[0].reset()
  const booking = JSON.parse($(this).attr('data-booking'))
  const {
    booking_id, room_id, remain,
    fname, lname
  } = booking

  axios.post('/api/price-over-time', {
    'room_id': room_id
  })
    .then((res) => {
      const result = res.data.result

      if (!result) {
        queryFail('เพิ่มเวลาพัก', 'ไม่สามารถโหลดข้อมูลได้ !', '')
      }
      if (result) {
        const entries = res.data.entries[0]
        const {
          price_over_day, price_over_hour,
          price_over_minutes, price_over_month,
          price_over_week, price_over_year
        } = entries

        $('#add-price-over').attr('data-remain', remain)
        $('#add-price-over').attr('data-bookingId', booking_id)
        $('#checkout-fname').val(fname)
        $('#checkout-lname').val(lname)
        $('#checkout-bookingId').val(booking_id)
        $('#checkout-price-over-minutes').val(price_over_minutes)
        $('#checkout-price-over-hour').val(price_over_hour)
        $('#checkout-price-over-day').val(price_over_day)
        $('#checkout-price-over-week').val(price_over_week)
        $('#checkout-price-over-month').val(price_over_month)
        $('#checkout-price-over-year').val(price_over_year)

        new bootstrap.Modal($('#checkout-addtime')).show()
      }
    })

})
$('#add-price-over').click(function () {
  const priceOverTotal = Number.parseFloat($('#price-over-total').val())
  if (priceOverTotal <= 0) {
    queryFail('เพิ่มเวลาพัก', 'โปรดกรอกยอดก่อน', '')
  }
  if (priceOverTotal > 0) {
    axios.post('/api/add-priceover', {
      'booking_id': $(this).attr('data-bookingId'),
      'total': priceOverTotal,
      'remain': $(this).attr('data-remain')
    })
      .then((res) => {
        const result = res.data.result

        if (result) {
          querySuccess('เพิ่มสำเร็จ', 1000)
        }
        if (!result) {
          queryFail('เพิ่มเวลาพัก', 'เกิดข้อผิดพลาด ไม่สามารถเพิ่มได้', res.data.err)
        }
      })
      .catch((err) => {
        statusErr()
      })
  }
})