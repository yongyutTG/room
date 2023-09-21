$('#room-update').click(() => {
  const formAndValidateData = [{
    name: "number",
    formtype: "text",
    input: [$('[name="room-number"]'), $('[name="building-items"]'), $('[name="building-floor-items"]')],
    validate: $("#validate-roomnumber"),
    isValidate: false,
    msg: "กรุณากรอกหมายเลขห้อง",
  },
    ,
  {
    name: "price_over_minutes",
    formtype: "number",
    input: $('#priceOverMinutes'),
    validate: $("#validate-over-minutes"),
    msg: "กรุณาป้อนราคา นาที",
  },
  {
    name: "price_over_hour",
    formtype: "number",
    input: $('#priceOverHour'),
    validate: $("#validate-over-hour"),
    msg: "กรุณาป้อนราคา ชั่วโมง",
  },
  {
    name: "price_over_day",
    formtype: "number",
    input: $('#priceOverDay'),
    validate: $("#validate-over-day"),
    msg: "กรุณาป้อนราคา วัน",
  },
  {
    name: "price_over_week",
    formtype: "number",
    input: $('#priceOverWeek'),
    validate: $("#validate-over-week"),
    msg: "กรุณาป้อนราคา สัปดาห์",
  },
  {
    name: "price_over_month",
    formtype: "number",
    input: $('#priceOverMonth'),
    validate: $("#validate-over-month"),
    msg: "กรุณาป้อนราคา เดิือน",
  },
  {
    name: "price_over_year",
    formtype: "number",
    input: $('#priceOverYear'),
    validate: $("#validate-over-year"),
    msg: "กรุณาป้อนราคา ปี",
  },
  {
    name: "max_people",
    formtype: "number",
    input: $('#maxPeople'),
    validate: $("#validate-maxpeople"),
    msg: "กรุณาป้อนจำนวนเข้าพักมากสุด",
  },
  {
    name: "toilet",
    formtype: "number",
    input: $('#toiletCount'),
    validate: $("#validate-toilet-count"),
    msg: "กรุณาป้อนจำนวนห้องน้ำ",
  },
  {
    name: "damage",
    formtype: "number",
    input: $('#damage'),
    validate: $("#validate-damage"),
    msg: "กรุณาป้อนค่าทรัพย์สินเสียหาย",
  },
  {
    name: "price_over_people",
    formtype: "number",
    input: $('#priceOverPeople'),
    validate: $("#validate-over-people"),
    msg: "กรุณาป้อนราคาจำนวนคนเกิน",
  },
  {
    name: "type",
    formtype: "radio",
    input: $('[name="room-type"]'),
    validate: $("#validate-roomtype"),
    msg: "กรุณาเลือกประเภทห้อง",
  },
  {
    name: "bed",
    formtype: "radio",
    input: $('[name="bed-type"]'),
    validate: $("#validate-bedtype"),
    msg: "กรุณาเลือกประเภทเตียง",
  },
  {
    name: "view",
    formtype: "radio",
    input: $('[name="roomview"]'),
    validate: $("#validate-roomview"),
    msg: "กรุณาเลือกประเภทวิวห้อง",
  },
  {
    name: "special-options",
    formtype: "checkbox",
    input: $('[name="special-options"]'),
    validate: $("#validate-options"),
    msg: "กรุณาเลือกอย่างน้อย 1 ตัวเลือก",
  },
  {
    name: "detail",
    formtype: "text-area",
    input: $('#desc-room'),
    validate: $("#validate-descript"),
    msg: "กรุณาป้อนรายละเอียด และคำอธิบาย",
  },
  {
    name: "exampleroom",
    formtype: "file",
    input: [$('#example-old-value'), $("#room-upload"), $('#example-old-delete')],
    validate: $("#validate-roomupload"),
    msg: "กรุณาอัพโหลดรูปภาพตัวอย่างห้อง",
  },
  ];

  let emptyCount = 0;
  formAndValidateData.forEach((fd) => {
    const {
      formtype,
      validate,
      msg,
      name
    } = fd;

    if (name == "number") {
      const [numberroom, building, buildingFloor] = fd.input

      let emptyItem = []
      const mapnumber = $.map(numberroom, (e, i) => $(e).val().trim())
      const mapbuilding = $.map(building, (e, i) => $(e).val().trim())
      const mapbuildingFloor = $.map(buildingFloor, (e, i) => $(e).val().trim())
      for (let i = 0; i < mapnumber.length; i++) {

        const n = mapnumber[i]
        const b = mapbuilding[i]
        const bf = mapbuildingFloor[i]

        if (i == 0) {
          if (n == '' || b == '' || bf == '') {
            emptyItem.push(false)
          } else if (n != '' && b != '' && bf != '') {
            emptyItem.push(true)
          }
        } else {
          if (n == '' && b == '' && bf == '') {
            emptyItem.push(true)
          } else if (n != '' && b != '' && bf != '') {
            emptyItem.push(true)
          } else {
            emptyItem.push(false)
          }
        }
      }
      const issetItemsCount = emptyItem.filter((v, i) => v == true).length
      if (issetItemsCount == 0) {
        fd.isValidate = false
        emptyCount++
        validateformEmpty(true, validate, 'กรุณากรอกข้อมูลอย่างน้อย 1 รายการ');
      }

      if (issetItemsCount >= 1) {
        if (emptyItem.includes(false) == true) {
          fd.isValidate = false
          emptyCount++
          validateformEmpty(true, validate, 'กรุณากรอกข้อมูลให้ครบ');
        } else {
          fd.isValidate = true
          validateformEmpty(false, validate, '');
        }
      }
    }
    if (formtype == 'number') {
      const n = fd.input.val()
      if (n == '') {
        emptyCount++
        validateformEmpty(true, validate, msg);
      } else {
        if (Number.parseFloat(n) <= 0) {

          emptyCount++
          validateformEmpty(true, validate, 'ป้อนค่าที่มากกว่า 0');
        } else {
          validateformEmpty(false, validate, '');
        }

      }
    }
    // ตรวจสอบการเลือกอย่างน้อย 1 ค่า ถ้าเลือกอื่น ต้องกรอกข้อมูลเข้าไปเพิ่มก่อน
    if (formtype == "text-area") {
      const v = fd.input.val().trim()
      if (v == '') {
        emptyCount++;
        validateformEmpty(true, validate, msg);
      } else {
        validateformEmpty(false, validate, "");
      }
    }
    // ตรวจสอบข้อมูลที่มีการเลือกอย่างน้อย 1 ค่า
    if (formtype == "radio" || formtype == "checkbox") {
      const ckedCount = fd.input.filter(":checked").length;
      if (ckedCount == 0) {
        emptyCount++;
        validateformEmpty(true, validate, msg);
      } else if (ckedCount == 1) {
        validateformEmpty(false, validate, "");
      }
    }

    // ตรวจสอบข้อมูลที่เป็นไฟล์
    if (formtype == "file") {
      const fileOldValue = fd.input[0].val().trim();
      const fileCount = fd.input[1][0].files.length;

      if (fileOldValue == '' && fileCount == 0) {
        emptyCount++;
        validateformEmpty(true, validate, msg);
      } else {
        validateformEmpty(false, validate, msg);
      }
    }
  });
  if (emptyCount > 0) {
    if (!isUniqueRoom) {
      validateformEmpty(true, $("#validate-roomnumber"), 'ไม่สามารถใช้หมายเลขนี้ได้ เนื่องจากอาคารนี้ใช้หมายเลขนี้แล้ว')
    } else {
      if (!formAndValidateData[0].isValidate) {
        validateformEmpty(true, $("#validate-roomnumber"), 'กรุณากรอกข้อมูลให้ครบ')
      } else {
        validateformEmpty(false, $("#validate-roomnumber"), '')
      }
    }
  }

  const roomNumberId = $.map($('[name="room-number"]'), (element, i) => $(element).attr('data-numberId'))
  let specialOptionsText = $.map($('[name="special-options-text"]'), (text, index) => {
    if (!$(text).is(':disabled')) {
      if ($(text).val().trim() != '' && $(text).val() != undefined) {
        return $(text).val().trim()
      }
    }
  }
  )

  let mapspecialOptions = $.map($('[name="special-options"]')
    .filter(":checked"), (v, i) => {
      if ($(v).val() != 'have-special-options') {
        return $(v).val()
      }
    })

  if (mapspecialOptions.length == 0 && specialOptionsText.length == 0) {
    emptyCount++
    validateformEmpty(true, $("#validate-options"), 'กรุณาเลือกอย่างน้อย 1 ตัวเลือก')
  } else {
    validateformEmpty(false, $("#validate-options"), '')
  }

  if (emptyCount == 0) {
    if (isUniqueRoom) {
      const fd = new FormData();

      const mapnumberAppend = $.map(formAndValidateData[0].input[0], function (e, i) {
        if ($(e).val().trim() != '') {
          return $(e).val()
        }
      })
      const mapbuildingAppend = $.map(formAndValidateData[0].input[1], function (e, i) {
        if ($(e).val().trim() != '') {
          return $(e).val()
        }
      })
      const mapbuildingFloorAppend = $.map(formAndValidateData[0].input[2], function (e, i) {
        if ($(e).val().trim() != '') {
          return $(e).val()
        }
      })


      const fdExampleRoom = $("#room-upload")[0].files
      fd.append('room_id', $('#room-id').val())
      fd.append('room_number_id', JSON.stringify(roomNumberId))
      fd.append('room_number', JSON.stringify(mapnumberAppend))
      fd.append('building', JSON.stringify(mapbuildingAppend))
      fd.append('building_floor', JSON.stringify(mapbuildingFloorAppend))
      fd.append("room_type", $('[name="room-type"]').filter(':checked').val());
      fd.append("bed_type", $('[name="bed-type"]').filter(':checked').val());
      fd.append("room_view", $('[name="roomview"]').filter(':checked').val());
      fd.append('max_people', $('#maxPeople').val())
      fd.append('toilet_count', $('#toiletCount').val())
      fd.append('damage', $('#damage').val())
      fd.append('price_over_people', $('#priceOverPeople').val())
      fd.append('price_over_minutes', $('#priceOverMinutes').val())
      fd.append('price_over_hour', $('#priceOverHour').val())
      fd.append('price_over_day', $('#priceOverDay').val())
      fd.append('price_over_week', $('#priceOverWeek').val())
      fd.append('price_over_month', $('#priceOverMonth').val())
      fd.append('price_over_year', $('#priceOverYear').val())
      fd.append('old_example', $('#example-old-value').val())

      fd.append('old_example_delete', $('#example-old-delete').val())


      if (mapspecialOptions.length > 0) {
        fd.append("special_options", mapspecialOptions.join(","));
      }
      if (specialOptionsText.length > 0) {
        fd.append('special_options', specialOptionsText)
      }


      for (let i = 0; i < fdExampleRoom.length; i++) {
        const example = fdExampleRoom[i];
        fd.append("example", example);
      }
      fd.append("detail", $('#desc-room').val());

      axios({
        method: "post",
        url: "/api/update-room",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: fd,
      })
        .then((res) => {
          const result = res.data.result

          if (result) {
            querySuccess('แก้ไขข้อมูลสำเร็จ', 1000)

          }

          if (!result) {
            queryFail('แก้ไขข้อมูลห้องพัก', 'เกิดข้อผิดพลาดไม่สามารถแก้ไขข้อมูลได้', res.data.err)
          }
        })
        .catch((err) => {
          statusErr()
        });
    }
  }
});
