function setPriceOver() {
  const priceOverTotal = $('#price-over-total')
  const count = Number.parseFloat($('#time-over-checkout').val())
  const timeOverUnit = $('#time-over-unit').val()
  let overPrice = 0
  if (timeOverUnit == '') {
    priceOverTotal.val(0)
    queryFail('เพิ่มเวลาพัก', 'โปรดเลือดหน่วยเวลาก่อน', '')
  } else {
    if (!isNaN(count)) {
      const elementId = `checkout-price-over-${timeOverUnit}`
      $.each($('.checkout-price-over'), (index, element) => {
        const id = $(element).attr('id')
        if (elementId == id) {
          overPrice = (Number.parseFloat($(element).val()) * count)
        }
      })
    }
  }
  if (overPrice > 0) {
    priceOverTotal.val(overPrice)
  }
  $('#cancel-price-over-total').attr('data-old-value', overPrice)
}
$('#time-over-checkout').keyup(function () {
  const n = Number.parseFloat($(this).val())
  if (isNaN(n)) {
    $(this).val('')
  }
  setPriceOver()
})

$('#edit-price-over-total').click(function () {
  $(this).css('display', 'none')
  const priceOverTotal = $('#price-over-total')
  priceOverTotal.prop('disabled', false)
  $('#ac-control').css('display', 'block')
  $('#cancel-price-over-total').attr('data-old-value', priceOverTotal.val())
})

$('#cancel-price-over-total').click(function () {
  $('#edit-price-over-total').css('display', 'inline')
  $('#price-over-total')
    .prop('disabled', true)
    .val($(this).attr('data-old-value'))
  $('#ac-control').css('display', 'none')
})

$('#confirm-price-over-total').click(function () {
  $('#edit-price-over-total').css('display', 'inline')
  $('#price-over-total').prop('disabled', true)
  $('#ac-control').css('display', 'none')
})