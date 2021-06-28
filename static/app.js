let lat
let lon

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(locationSucceed, locationError);
    } else {
        alert("Your browser does not support location");
    }
}

function locationSucceed(pos) {
    let data = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
    };

    $.ajax({
        url: '/api/weather',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(res) {
            console.log("Server says: ", res);
            lat = res.lat;
            lon = res.lon;
            let loc = `
            <h5 class="text-center lead">Your current location is latitude ${lat}, longitude ${lon}</h5>`;
            initMap();
            $("#weather-loc").append(loc);
            formatWeather(lat, lon, res);
        },
        error: function(err) {
            console.error("Error getting weather ", err);
        }
    });
}

function formatWeather(lat, lon, wxdata) {
    $.ajax({
        url: 'http://open.mapquestapi.com/geocoding/v1/reverse?key=MYjkFodGtZtQWx7tSCQiu6wfvYupMQGK&location=46.7673,-114.09&includeRoadMetadata=true&includeNearestIntersection=true',
        type: 'GET',
        success: function(res) {
            let icon=wxdata.current.weather[0].icon;
            let sunriseStamp = wxdata.current.sunrise;
            let sunsetStamp = wxdata.current.sunset;
            let wx = `
            <img src="http://openweathermap.org/img/wn/${icon}@2x.png" class="rounded mx-auto d-block" id="wx-icon"/>
            <h5 class="text-center">The weather in ${res.results[0].locations[0].adminArea5} is:</h5>
            <table border="1">
                <tbody>
                    <tr>
                        <td class="descriptor">Sky Condition:</td>
                        <td class="condition wx-desc">${wxdata.current.weather[0].description}</td>
                        <td class="descriptor">Temperature/Dew Point:</td>
                        <td class="condition">${Math.round(wxdata.current.temp)}F / ${Math.round(wxdata.current.dew_point)}F</td>
                    </tr>
                    <tr>
                        <td class="descriptor">Wind Direction/Speed:</td>
                        <td class="condition">${getWindDir(wxdata)} / ${Math.round(wxdata.current.wind_speed)} mph</td>
                        <td class="descriptor">Relative Humidity:</td>
                        <td class="condition">${wxdata.current.humidity}%</td>
                    </tr>
                    <tr>
                        <td class="descriptor">Sunrise/Sunset</td>
                        <td class="condition">${convertTimestamp(sunriseStamp)} / ${convertTimestamp(sunsetStamp)}</td>
                        <td class="descriptor">High/Low Temp</td>
                        <td class="condition">${Math.round(wxdata.daily[0].temp.max)} / ${Math.round(wxdata.daily[0].temp.min)}</td>
                </tbody>
            </table>`
            $("#weather-data").append(wx);
            },
        error: function(err) {
            console.error("Error getting reverse geo.")
        }
    })
}

function convertTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    let merid = ""
    if (hours < 12) {
        merid = "am"
    } else {
        hours = hours-12;
        merid = "pm"
    }
    return hours + ':' + minutes.substr(-2) + ' ' + merid;
}

function getWindDir(wxdata) {
    let windDir = wxdata.current.wind_deg;
    const sector = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"];
    windDir = Math.round(windDir/45);
    if (windDir === 8) windDir = 0;
    return sector[windDir];
}

function locationError() {
    console.error("Error getting location");
}

function populateWeather(data) {
    let desc = data.weather.description
}

function initMap() {
    let mymap = L.map('mapid', {
        zoomControl: false,
        center: [lat, lon],
        zoom: 9,
        minZoom: 9,
        maxZoom: 9,
        dragging: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);
    let marker = L.marker([lat, lon]).addTo(mymap);
}

function init() {
    getLocation();
}

window.onload = init;