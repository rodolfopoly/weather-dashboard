
var apiKey = "368601d95cc25d28ac72ffc607f2cff8";
var currentWeatherEl = $("#currentWeather");
var latitude;
var longitude;
var savedCity = [];
savedCity = JSON.parse(localStorage.getItem("savedCity"));
var isAlreadyInTheList = false;




function charge() {
    if (savedCity !== null) {
        for (i = 0; i < savedCity.length; i++) {
            var li = $("<li>").addClass("list-group-item m-1").text(savedCity[i].cityName);
            $("#cityList").prepend(li);
        }
    }
}


function start(e) {
    e.preventDefault();
    $("#currentWeather").empty();
    $("#forecast").empty();
    var cityNameForm = $("#cityNameForm").val();
    getCurrentWeather(cityNameForm);
}


function getCurrentWeather(city) {

    var requestUrlCurrentWeather = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;
    console.log(requestUrlCurrentWeather);
    fetch(requestUrlCurrentWeather)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var cityName = $("<h2>").text(data.name).addClass("p-2 m-2 d-inline");
            var date = $("<h2>").text(" (" + dayjs().format("MM/DD/YYYY") + ")").addClass("d-inline me-4");
            var iconLink = "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
            var icon = $("<img>").attr("src", iconLink);

            var temperature = $("<p>").text("Temp: " + Math.round(data.main.temp) + "°F").addClass("m-2");
            var humidity = $("<p>").text("Humidity: " + data.main.humidity + "%").addClass("m-2");
            var wind = $("<p>").text("Wind: " + Math.round(data.wind.speed) + "MPH").addClass("m-2");

            latitude = data.coord.lat;
            longitude = data.coord.lon;

            currentWeatherEl.append(cityName, date, icon, temperature, wind, humidity)

            getUvIndexAndForecast();
        });
}

function getUvIndexAndForecast() {
    var requestUrlUvIndex = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&exclude={minutely}&units=imperial&appid=" + apiKey;
    console.log(requestUrlUvIndex);
    fetch(requestUrlUvIndex)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var uvIndexBox = $("<span>").text(data.current.uvi).addClass("border p-1");
            if (data.current.uvi < 3) {
                uvIndexBox.addClass("bg-success")
            }
            else if (data.current.uvi > 7) {
                uvIndexBox.addClass("bg-danger text-white")
            }
            else {
                uvIndexBox.addClass("bg-warning")
            }
            var uvIndex = $("<p>").text("Uv Index: ").addClass("m-2")
            uvIndex.append(uvIndexBox);
            currentWeatherEl.append(uvIndex);

            for (var i = 0; i < 6; i++) {
                var div = $("<div>").addClass("rounded bg-secondary text-white col m-2");
                var dateResponse = ((data.daily[i].dt) * 1000);
                var date = $("<p>").text(new Date(dateResponse).toLocaleDateString());
                var iconLink = "https://openweathermap.org/img/w/" + data.daily[i].weather[0].icon + ".png";
                var icon = $("<img>").attr("src", iconLink);
                var temp = $("<p>").text("Temp: " + Math.round(data.daily[i].temp.day) + "°F");
                var wind = $("<p>").text("Wind: " + Math.round(data.daily[i].wind_speed) + "MPH");
                var humidity = $("<p>").text("Humidity: " + data.daily[i].humidity + "%");
                div.append(date, icon, temp, wind, humidity);
                $("#forecast").append(div);

            }
            saveCity();
        });
}

function saveCity() {
    var cityName = $("#cityNameForm").val();
    console.log(cityName);
    savedCity = JSON.parse(localStorage.getItem("savedCity")) || [];
    var city = {
        cityName: cityName,
    }
    isAlreadyInTheList = false;
    for (var i = 0; i < savedCity.length; i++) {
        console.log(savedCity[i].cityName);
        if (cityName === savedCity[i].cityName) {
            isAlreadyInTheList = true;
        }
    }
    if (isAlreadyInTheList === false) {
        console.log(cityName);
        if (cityName !== "") {
            savedCity.push(city);
            localStorage.setItem("savedCity", JSON.stringify(savedCity));
            var li = $("<li>").addClass("list-group-item m-1").text(cityName);
            $("#cityList").prepend(li);
        }
    }
}

charge();
if (savedCity !== null) {
    getCurrentWeather(savedCity[savedCity.length - 1].cityName);
}

$("#searchButton").on("click", start);

$(".list-group-item").on("click", function (e) {

    $("#currentWeather").empty();
    $("#forecast").empty();
    e.preventDefault();
    var cityButton = $(this).text();
    console.log(cityButton);
    getCurrentWeather(cityButton);
});