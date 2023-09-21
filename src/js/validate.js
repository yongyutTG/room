function validateformEmpty(empty, validate, msg) {
  if (empty == true) {
    validate.text(msg);
    validate.css("display", "block");
  } else {
    validate.text("");
    validate.css("display", "none");
  }
}