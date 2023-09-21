function inputNumber(event) {
  const target = $(event.target)
  const n = Number.parseFloat(target.val())
  if (isNaN(n)) {
    target.val('')
  }
}