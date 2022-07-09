/**
 * När dokumentet är laddat kör funktionerna startTime(), getWeather(), getDate() och playMovie()
 */
$(document).ready(function () {
    startTime()
    getWeather();
    getDate();

    console.log(screen.width)
    if (screen.width < 1100) {
        playMovie();
    }
    postUpdater();
});

function postUpdater() {
    //Dum lösning för att hämta nya inlägg, 10.800.000ms == 3 timmar
    setTimeout("location.reload(true);", 10800000);
}

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
    // Tar elementet med id "clock" och visar tiden
    document.getElementById('clock').innerHTML = h + ":" + m + ":" + s;

    // Timer för att kalla denna funktion igen efter (1000 millisekunder = 1 sekund) för att uppdatera klockan
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
    // Tar elementet med id "date" och visar datum
    document.getElementById('date').innerHTML = todayDate.toDateString();

    // Timer för att kalla denna funktion igen 1800000 millisekunder = 30min
    setTimeout(getDate, 1800000);
}


/**
 * API call för att hämta väderdata från yr.no
 */
function getWeather() {

    // Get request so mhämtar forecast från yr.no. Parametrar i API call är latitud och longitud för spira kosterögatan
    $.get("https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=55.619892&lon=13.030888", function (data) {
        // Tar lufttemp från response och skriver på element med id weather
        document.getElementById('weather').innerHTML = `${data.properties.timeseries[2].data.instant.details.air_temperature} °C`;

        // Tar sympolbeteckning från api response och sätter den som source för img elementet med id weatherIMG
        let img = data.properties.timeseries[2].data.next_1_hours.summary.symbol_code
        let imgElem = document.getElementById('weatherIMG')
        imgElem.src = `static/img/png/${img}.png`
    });

    // Timer för att kalla denna funktion igen 1800000 millisekunder = 30min
    setTimeout(getWeather, 1800000);

}

function playMovie() {
    // Ta elementet video-frame, sätt opacity till 0 för mjuk övergång och ändra elementet från display none till display block
    video = document.getElementById('video-frame')
    video.style.opacity = 0;
    video.style.display = "block";

    // Starta video
    video.play();
    

    // Funktion för fadein ökar opacity med 0.1 var 50ms
    function fadeIn(element) {
        var op = 0;
        var timer = setInterval(function () {
            if (op >= 1) clearInterval(timer);
            element.style.opacity = op;
            element.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op += op * 0.1 || 0.1;
        }, 50);
    }

    // Funktion som sätter timer på 2000ms från videons start för att köra funktionen fadeIn
    video.oncanplaythrough = function () {
        setTimeout(function () {
            var e = document.getElementById('video-frame');
            fadeIn(e);
        }, 2000);
    };

    // Lägg till en eventlyssnare till videoelementet = När videon är slut sätt videoelement till display none
    document.getElementById('video-frame').addEventListener('ended', myHandler, false);
    function myHandler(e) {
        video.style.display = "none";
    }

    // Sätt timeout, spela videon igen om 180.000ms = 3 min
    setTimeout(playMovie, 180000);
    
}





/**
 * Funktion som hanterar crop av uppladdad bild
 * när input fältet med id "formFile" ändras körs denna funktion
 */
$('#formFile').change(function (e) {
    // ta modal med id "imageCropModal"
    const cropModal = $('#imageCropModal');

    // Ta filen som laddas upp
    let uploadFile = e.target.files;

    // Ta elementet med id "image"
    var image = document.getElementById('image');

    // Om fler än en fil laddas upp välj den första
    if (uploadFile && uploadFile.length > 0) {
        uploadFile = uploadFile[0];
    };


    // Om en fil är uppladdad, skapa ett nytt FileReader object
    if (uploadFile) {
        var reader = new FileReader();

        // Använd FileReader objectet för att läsa in vår uppladdade fil
        reader.onload = function () {
            $("#image").attr("src", reader.result);
        }

        reader.readAsDataURL(uploadFile);
    }

    // Visa modal där filen croppas
    cropModal.modal('show')

    // När modal visas skapa ett Cropper object och definiera aspect ratio, viewmode och preview
    cropModal.on('shown.bs.modal', function () {
        cropper = new Cropper(image, {
            aspectRatio: 1,
            viewMode: 3,
            preview: '.preview'
        });
        // När modal stängs förstör Cropperobjeket
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
        $.ajax('http://127.0.0.1:5000/upload-file', {
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

// Efter varje tangenttryck uppdatera titeltexten i förhansgranskning
$('#title').on('keyup', function() {
    let titleVal = $('#title').val()
    $('#titleCount').text(`${titleVal.length}/20`)
    if (titleVal.length > 20) {
        $('#title').addClass('is-invalid');
        $('#titleFeedback').text('Titeln är för lång')
    } else {
        $('#title').removeClass('is-invalid');
        $('#titleFeedback').text('')
    }
    $('#previewTitle').text(titleVal)
})


// Efter varje tangenttryck uppdatera bodytexten i förhansgranskning
$('#body').on('keyup', function () {
    let bodyVal = $('#body').val()
    $('#bodyCount').text(`${bodyVal.length}/300`)
    if (bodyVal.length > 300) {
        $('#body').addClass('is-invalid');
        $('#bodyFeedback').text('Texten är för lång')
    } else {
        $('#body').removeClass('is-invalid');
        $('#bodyFeedback').text('')
    }
    $('#previewBody').text(bodyVal)
})


if (window.location.href.indexOf("update") > -1) {
    let titelVal = $('#title').val()
    $('#previewTitle').text(titelVal)
    let bodyVal = $('#body').val()
    $('#previewBody').text(bodyVal)
}