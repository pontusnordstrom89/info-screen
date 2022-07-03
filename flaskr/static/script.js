/**
 * Funktion för klocka
 */

function startTime() {
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('clock').innerHTML = h + ":" + m + ":" + s;

    // Timer för att kalla denna funktion igen 1000 millisekunder = 1 sekund
    setTimeout(startTime, 1000);
}


/**
 * Funktion som lägger till en nolla framför om värdet är < 10
 *  exempel 9:1  = 09:01
 */
function checkTime(i) {
    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
    return i;
}

/**
 * Funktion för att visa datum
 */

function getDate() {
    let todayDate = new Date()
    document.getElementById('date').innerHTML = todayDate.toDateString();

    // Timer för att kalla denna funktion igen 1800000 millisekunder = 30min
    setTimeout(getDate, 1800000);
}


/**
 * API call för att hämta väderdata från yr.no
 */
function getWeather() {

    $.get("https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=55.619892&lon=13.030888", function (data) {
        console.log(data)
        document.getElementById('weather').innerHTML = `${data.properties.timeseries[2].data.instant.details.air_temperature} °C`;
        let img = data.properties.timeseries[2].data.next_1_hours.summary.symbol_code
        console.log(img)
        let imgElem = document.getElementById('weatherIMG')
        imgElem.src = `static/img/png/${img}.png`
    });

    // Timer för att kalla denna funktion igen 1800000 millisekunder = 30min
    setTimeout(getWeather, 1800000);

}


/**
 * När dokumentet är laddat kör funktionerna startTime() och getWeather() getDate()
 */
$(document).ready(function () {
    startTime()
    getWeather();
    getDate();
});



$('#formFile').change(function (e) {
    const cropModal = $('#imageCropModal');
    let uploadFile = e.target.files;
    var image = document.getElementById('image');


    if (uploadFile && uploadFile.length > 0) {
        uploadFile = uploadFile[0];
    };



    if (uploadFile) {
        var reader = new FileReader();

        reader.onload = function () {
            $("#image").attr("src", reader.result);
        }

        reader.readAsDataURL(uploadFile);
    }

    cropModal.modal('show')

    cropModal.on('shown.bs.modal', function () {
        cropper = new Cropper(image, {
            aspectRatio: 1,
            viewMode: 3,
            preview: '.preview'
        });
    }).on('hidden.bs.modal', function () {
        cropper.destroy();
        cropper = null;
    });

});


$("#crop").click(function () {
    canvas = cropper.getCroppedCanvas({
        width: 1000,
        height: 1000,
    });




    // Upload cropped image to server if the browser supports `HTMLCanvasElement.toBlob`.
    // The default value for the second parameter of `toBlob` is 'image/png', change it if necessary.
    cropper.getCroppedCanvas().toBlob((blob) => {
        url = URL.createObjectURL(blob);
        $('#changedFile').attr("src", url);
        const formData = new FormData();
        const today = Date.now();
        // Pass the image file name as the third parameter if necessary.
        formData.append('croppedImage', blob, `${today}.jpg`);
        $('#imgName').val(`${today}.jpg`)
        console.log(formData)
        // Use `jQuery.ajax` method for example
        $.ajax('upload-file', {
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success() {
                console.log('Upload success');
                //Set input (imgName) to name + path of file for python to save to db
                
            },
            error() {
                console.log('Upload error');
            },
        });
    }/*, 'image/png' */);

});


$('#title').on('keyup', function() {
    let titelVal = $('#title').val()
    console.log(titelVal)
    $('#previewTitle').text(titelVal)
})

$('#body').on('keyup', function () {
    let bodyVal = $('#body').val()
    console.log(bodyVal)
    $('#previewBody').text(bodyVal)
})
