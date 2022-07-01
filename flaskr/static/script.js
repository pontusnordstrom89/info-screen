function startTime() {
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    let s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('clock').innerHTML = h + ":" + m + ":" + s;
    setTimeout(startTime, 1000);
}

function checkTime(i) {
    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
    return i;
}





$( document ).ready(function() {
    startTime()
    $.get( "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=55.619892&lon=13.030888", function( data ) {
  console.log(data)
  document.getElementById('weather').innerHTML = data.properties.timeseries[2].data.instant.details.air_temperature;
  let img = data.properties.timeseries[2].data.next_1_hours.summary.symbol_code
  console.log(img)
});
});