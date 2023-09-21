function querySuccess(title, times) {
    Swal.fire({
        position: 'top',
        icon: 'success',
        title: title,
        showConfirmButton: false,
        timer: times
    })
    setInterval(() => {
        window.location.reload()
    }, times)

}

function queryFail(title, subTitle, err) {
    Swal.fire({
        icon: 'error',
        title: title,
        text: subTitle,
        footer: err
    })
}

function confirm(title, subTitle) {
    return Swal.fire({
        title: title,
        text: subTitle,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก'
    })
}


function statusErr() {
    Swal.fire({
        icon: 'error',
        title: 'แจ้งเตือน',
        text: 'เกิดผิดพลาด !',
    })
}


function alertMsg(title, subTitle) {
    Swal.fire({
        icon: 'error',
        title: title,
        text: subTitle,
    })
}