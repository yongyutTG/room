$('.room-paid').click(function () {
  $('#checkout-paid-total').val('')
  $('#checkout-paid').attr('data-bookingId', $(this).attr('data-bookingId'))
  $('#checkout-paid').attr('data-remain', $(this).attr('data-remain'))
  new bootstrap.Modal($('#checkout-paid-modal')).show()
})

$('#checkout-paid').click(function () {
  const paidTotal = Number.parseFloat($('#checkout-paid-total').val())

  if (!isNaN(paidTotal)) {
    const msg = `คุณต้องการชำระเงินที่ค้างใช่ หรือไม่`
    confirm('ชำระเงิน', msg)
      .then((result) => {
        if (result.isConfirmed) {
          axios.post('/api/booking-paid', {
            'booking_id': $(this).attr('data-bookingId'),
            'paid': paidTotal,
            'remain': $(this).attr('data-remain')
          })
            .then((res) => {
              const result = res.data.result

              if (result) {
                querySuccess('ชำระสำเร็จ', 1000)
              }

              if (!result) {
                queryFail('จ่ายเงินค้างชำระ', 'ไม่สามารถจ่ายเงินได้', res.data.err)
              }
            })
        }
      })
  }
})