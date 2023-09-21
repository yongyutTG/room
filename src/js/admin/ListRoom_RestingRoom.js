$('.resting-room').click(function () {

  $('#resting-form')[0].reset()
  $('.empty-validate').css('display', 'none')

  const resting = JSON.parse($(this).attr('data-resting'))
  const {
    room_id, room_number, room_number_id,
    max_people, price_over_people
  } = resting
  const id = $(this).attr('data-id')
  const number = $(this).attr('data-number')
  const numberId = $(this).attr('data-numberId')
  const data_price = JSON.parse(resting.data_price)

  let tableEl = ``
  data_price.forEach((p, i) => {
    const unit = Display.unitTimes(p.unit)
    const price = Display.setNumberFormat(p.price)
    const cid = `s-${p.times}-${p.unit}`
    const timesCol = `<td>${p.times} ${unit}</td>`
    const priceCol = `<td class="text-end">${price}</td>`
    const checkCol = `<td class="text-center">
                          <input class="check-input" type="checkbox" name="select-price"  onchange="checkPrice(event)" value="${p.price},${p.times},${p.unit}" id="${cid}">
                      </td>`
    const row = `<tr class="align-middle">
                    ${timesCol}
                    ${priceCol}
                    ${checkCol}
                  </tr>
                `
    tableEl += row
  })

console.log(resting.price_over_people)
  $('#resting-title').text(room_number)
  $('#room-id').val(room_id)
  $('#room-number').val(room_number)
  $('#room-number').attr('data-numberId', room_number_id)
  $('#max-people').val(max_people)
  $('#price-over-people').val(price_over_people)
  $('#table-resting').html(tableEl)
  const stayRoomModal = new bootstrap.Modal($('#resting-room-modal'))
  stayRoomModal.show()
})
