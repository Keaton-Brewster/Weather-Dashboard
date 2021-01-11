$(document).ready(function () {

    var myAPIkey = "6e5fce99e3612282ac67662359b2658d",
        history = JSON.parse(localStorage.getItem("history")) || [];

    function makeRow(text) {
        var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
        $("#previous").prepend(li);
    }

    function search(searchValue) {
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&units=imperial&appid=" + myAPIkey,
            method: "GET",
            datatype: 'json',
            success: function (object) {
                if (history.indexOf(searchValue) === -1) {
                    history.push(object.name);
                    localStorage.setItem('history', JSON.stringify(history));
                    makeRow(object.name);
                }

                $("#current-div").empty();

                var card = $("<div>").attr({ "class": "card", "id": "current-card" }),
                    cardBody = $("<div>").addClass('card-body'),
                    title = $("<h3>").addClass('card-title').text(object.name + ' '),
                    time = $("<p>").addClass('float-right').text(dayjs().format('M-DD-YYYY')),
                    icon = $("<img>").attr('src', 'http://openweathermap.org/img/wn/' + object.weather[0].icon + ".png"),
                    divider = $("<div>").addClass('dropdown-divider'),
                    conditions = $("<p>").addClass('card-text').text('Current Conditions: ' + object.weather[0].description),
                    temp = $("<p>").addClass('card-text').text('Current Temperature: ' + object.main.temp + '°f'),
                    today = $("<p>").attr({'class': 'card-text', 'id':'daily-temp'}).text('Today'),
                    humidity = $("<p>").addClass('card-text').text('Humidity: ' + object.main.humidity + '%'),
                    windSpeed = $("<p>").addClass('card-text').text('Wind speed: ' + object.wind.speed + 'mph');

                title.append(icon, time);
                cardBody.append(title, divider, conditions, temp, today, humidity, windSpeed);
                card.append(cardBody);
                $("#current-div").append(card);

                getForecast(searchValue);

                // take lat and lon from the object, and send it to get the UV index (which requires a separate api call for some reason)
                let lon = object.coord.lon,
                    lat = object.coord.lat;
                getUVIndex(lat, lon);

                // get high/low for the current day
                $.ajax({
                    method: 'GET',
                    url: "https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=" + lat + "&lon=" + lon + "&appid=" + myAPIkey,
                    dataType: "json",
                    success: function (object) {
                        var high = $("<p>").addClass('card-text high').text('High: ' + object.daily[0].temp.max + '°f'),
                            low = $("<p>").addClass('card-text low').text('Low: ' + object.daily[0].temp.min + '°f');

                        $("#daily-temp").append(high, low);
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            },
            error: function (error) {
                console.log(error);
            }
        });
    };

    function getForecast(searchValue) {
        $.ajax({
            method: 'GET',
            url: 'https://api.openweathermap.org/data/2.5/forecast?q=' + searchValue + '&units=imperial&appid=' + myAPIkey,
            dataType: "json",
            success: function (object) {
                $("#forecast-div").empty();
                for (let i = 0; i < object.list.length; i++) {
                    var hour = object.list[i];
                    if (hour.dt_txt.indexOf("15:00:00") !== -1) {
                        var card = $("<div>").attr({ 'class': 'card col-2', 'id': 'forecast-day' }),
                            cardBody = $("<div>").addClass('card-body'),
                            title = $("<p>").addClass('card-title').text(dayjs(hour.dt_txt).format('M-DD')),
                            icon = $("<img>").attr('src', 'http://openweathermap.org/img/wn/' + hour.weather[0].icon + ".png"),
                            divider = $("<div>").addClass('dropdown-divider'),
                            conditions = $("<p>").addClass('card-text').text('Conditions: ' + hour.weather[0].main),
                            temp = $("<p>").addClass('card-text').text('Temp: ' + hour.main.temp + '°f'),
                            humidity = $("<p>").addClass('card-text').text('Humidity: ' + hour.main.humidity + '%');

                        title.append(icon);
                        cardBody.append(title, divider, conditions, temp, humidity);
                        card.append(cardBody);
                        $("#forecast-div").append(card);
                    }
                }

            },
            error: function (error) {
                console.log(error);
            }
        });
    }

    function getUVIndex(lat, lon) {
        // get uv index function
        $.ajax({
            type: "GET",
            url: "https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=" + lat + "&lon=" + lon + "&appid=" + myAPIkey,
            dataType: "json",
            success: function (object) {
                var uvindex = object.daily[0].uvi,
                    uvEle = $("<p>").attr('class', 'card-text').text('UV Index: '),
                    uvP = $("<span>").text(uvindex);
                if (uvindex < 3) { uvP.addClass('good-uvi') }
                else if (uvindex < 6) { uvP.addClass('okay-uvi') }
                else { uvP.addClass('bad-uvi') };

                uvEle.append(uvP);
                $("#current-div .card-body").append(uvEle);

            },
            error: function (error) {
                console.log(error);
            },
        });
    }

    // load in any previously searched locations
    if (history.length > 0) {
        for (let i = 0; i < history.length; i++) {
            makeRow(history[i]);
        }
        search(history[history.length - 1]);
    }

    // set up handler for when you click list item 
    $("#history li").on("click", function () {
        search($(this).text());
    });

    // Assign the main function to the search button
    $("#search-button").on("click", function (event) {
        event.preventDefault();
        var searchValue = $("#search-value").val();
        $("#search-value").val('')
        search(searchValue);
    })
});



