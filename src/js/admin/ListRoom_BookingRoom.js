$('.booking-room').click(function () {
  $('#booking-form')[0].reset()
  $('.empty-validate').css('display', 'none')
  const dataBooking = JSON.parse($(this).attr('data-booking'))
  console.log(dataBooking)
  const { room_id, room_number, room_number_id,
    max_people, price_over_people
  } = dataBooking
  const data_price = JSON.parse(dataBooking.data_price)


  let tableEl = ``
  data_price.forEach((p, i) => {
    const unit = Display.unitTimes(p.unit)
    const price = Display.setNumberFormat(p.price)
    const proiceDeposit = Math.round((Number.parseFloat(p.price) * 70) / 100)
    const proiceDeposit_format = Display.setNumberFormat(proiceDeposit)


    const cid = `b-${p.times}-${p.unit}`
    const timesCol = `<td>${p.times} ${unit}</td>`
    const priceCol = `<td class="text-end">
                      <div class="d-flex align-items-center justify-content-end">
                        ${price}
                        <input class="check-input ms-2" data-fullprice="${p.price}" type="checkbox" name="booking-price"  onchange="bookingPrice(event)" value="${p.price},${p.times},${p.unit}" id="${cid}">
                      </td>`
    const checkCol = `<td class="text-end">
                        <div class="d-flex align-items-center justify-content-end">
                          ${proiceDeposit_format}
                          <input class="check-input ms-2" data-fullprice="${p.price}" type="checkbox" name="booking-price"  onchange="bookingPrice(event)" value="${proiceDeposit},${p.times},${p.unit}" id="${cid}-deposit">
                        </div>
                      </td>`
    const row = `<tr class="align-middle">
                    ${timesCol}
                    ${priceCol}
                    ${checkCol}
                  </tr>
                `
    tableEl += row
  })
  $('#booking-title').text(room_number)
  $('#booking-room-id').val(room_id)
  $('#booking-room-number').val(room_number)
  $('#booking-room-number').attr('data-numberId', room_number_id)
  $('#booking-max-people').val(max_people)
  $('#booking-price-over-people').val(price_over_people)
  $('#table-booking').html(tableEl)
  new bootstrap.Modal($('#booking-room-modal')).show()
})

