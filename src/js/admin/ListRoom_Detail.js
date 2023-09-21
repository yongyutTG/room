$('.room-detail').click(function () {
  const data_price = JSON.parse($(this).attr('data-price'))
  const detail = JSON.parse($(this).attr('data-detail'))

  let roomRowEl = ``
  data_price.forEach((p, i) => {
    const unit = Display.unitTimes(p.unit)
    const price = Display.setNumberFormat(p.price)
    const idxCol = `<td class="text-center">${i + 1}</td>`
    const timesCol = `<td>${p.times} ${unit}</td>`
    const priceCol = `<td class="text-end">${price}</td>`

    const row = `<tr>
                    ${idxCol}
                    ${timesCol}
                    ${priceCol}
                  </tr>
                `
    roomRowEl += row
  })

  const {
    room_id,
    building,
    building_floor,
    room_number,
    smoking,
  } = detail
  const status = detail.status == 'empty' == 'ว่าง'
  const bed_type = Display.resBed(detail.bed_type)
  const room_type = Display.getRoomtype(detail.room_type)
  const roomview = Display.getRoomview(detail.roomview)

  const special_options = detail.special_options.split(',').map((sp) => {
    return Display.resSpecialOptions(sp)
  }).join(' ')

  const example_room = detail.example_room.split(',')
  const d = [room_number, room_type, bed_type, roomview, special_options]
  const text_detail = $('.text-detail')


  let imgExampleEl = ``
  example_room.forEach((e) => {
    const img = `<img src="/src/img/example_room/${e}" class="m-2" style="width:200px;height:250px;object-fit:contain;">`
    imgExampleEl += img
  })

  for (let i = 0; i < d.length; i++) {
    const td = d[i]
    $(text_detail[i]).text(td)
  }

  $('#img-example-detail').html(imgExampleEl)
  $('#room-title').text(room_number)
  $('#table-price').html(roomRowEl)
  new bootstrap.Modal($('#room-detail-modal')).show()
})