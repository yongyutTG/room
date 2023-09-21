$('.room-checkout').click(function () {
  const id = $(this).attr('data-id')
  const roomId = $(this).attr('data-roomid')
  const numberId = $(this).attr('data-numberId')
  const remain = $(this).attr('data-remain')

  if (remain != 0) {
    queryFail('ยืนยันการออกห้องพัก', 'ยังชำระเงินไม่ครบ กรุณาชำระเงินให้ครบ แล้วกดยืนยันอีกครั้ง', '')
  }
  if (remain == 0) {
    confirm('ยืนยันการออกห้องพัก', 'คุณต้องยืนยันการออกห้องพัก ใช่หรือ ไม่ ?')
      .then((result) => {
        if (result.isConfirmed) {
          axios.post('/api/checkout-room', {
            'booking_id': id,
            'room_id': roomId,
            'room_number_id': numberId
          })
            .then((res) => {
              const result = res.data.result
              if (result) {
                querySuccess('ลงทะเบียนออกสำเร็จ', 1000)
              }
              if (!result) {
                queryFail('ลงทะเบียนออกห้องพัก', 'การลงทะเบียนล้มเหลว', res.data.err)
              }
            })
            .catch((err) => {
              statusErr()
            })
        }
      })
  }

})