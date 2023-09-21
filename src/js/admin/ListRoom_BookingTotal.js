function bookingTotal() {
  const maxPeople = Number.parseInt($('#booking-max-people').val())
  const bookingPersonCount = $('#booking-person-count')
  const person_count = Number.parseInt(bookingPersonCount.val())
  const price = Number.parseFloat($('#booking-price').val())
  const price_over_people = Number.parseFloat($('#booking-price-over-people').val())

  if (isNaN(price)) {
    queryFail('ลงทะเบียนจองห้องพัก', 'คุณต้องไม่เลือกราคา โปรดเลือกราคาก่อน', '')
    bookingPersonCount.val('')
  }
  if (!isNaN(price) && !isNaN(price_over_people) && !isNaN(person_count)) {
    let total = 0
    if (person_count > maxPeople) {
      total = (person_count - maxPeople) * price_over_people + price
    } else {
      total = price
    }

    $('#booking-total').val(total)
  }
}