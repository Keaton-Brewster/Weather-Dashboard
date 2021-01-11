$(document).ready(function () {

    var myAPIkey = "6e5fce99e3612282ac67662359b2658d",
        history = JSON.parse(localStorage.getItem("history")) || [];

    function makeRow(text) {
        var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
        $("#previous").prepend(li);
    }

    function search(searchValue) {
        $.ajax({
            url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&units=imperial&appid=" + myAPIkey,
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
                    time = $("<p>").addClass('float-right').text(dayjs().format('MM-DD-YYYY')),
                    icon = $("<img>").attr('src', 'http://openweathermap.org/img/wn/' + object.weather[0].icon + ".png"),
                    conditions = $("<p>").addClass('card-text').text('Current conditions: ' + object.weather[0].description),
                    temp = $("<p>").addClass('card-text').text('Temperature: ' + object.main.temp + '°f'),
                    humidity = $("<p>").addClass('card-text').text('Humidity: ' + object.main.humidity + '%'),
                    windSpeed = $("<p>").addClass('card-text').text('Wind speed: ' + object.wind.speed + 'mph');

                title.append(icon, time);
                cardBody.append(title, conditions, temp, humidity, windSpeed);
                card.append(cardBody);
                $("#current-div").append(card);

                getForecast(searchValue);

                // take lat and lon from the object, and send it to get the UV index (which requires a separate api call for some reason)
                let lon = object.coord.lon;
                let lat = object.coord.lat;
                getUVIndex(lat, lon);
            },
            error: function (error) {
                console.log(error);
            }
        });
    };

    function getForecast(searchValue) {
        $.ajax({
            method: 'GET',
            url: 'http://api.openweathermap.org/data/2.5/forecast?q=' + searchValue + '&units=imperial&appid=' + myAPIkey,
            dataType: "json",
            success: function (object) {
                $("#forecast-div").empty();
                for (let i = 0; i < object.list.length; i++) {
                    var hour = object.list[i];
                    if (hour.dt_txt.indexOf("15:00:00") !== -1) {
                        var card = $("<div>").attr({'class':'card col-2','id':'forecast-day'}),
                            cardBody = $("<div>").addClass('card-body');
                            title = $("<p>").addClass('card-title').text(dayjs(hour.dt_txt).format('MM-DD')),
                            conditions = $("<p>").addClass('card-text').text('conditions: ' + hour.weather[0].description),
                            icon = $("<img>").attr('src', 'http://openweathermap.org/img/wn/' + hour.weather[0].icon + ".png"),
                            temp = $("<p>").addClass('card-text').text('Temp: ' + hour.main.temp + '°f'),
                            humidity = $("<p>").addClass('card-text').text('Humidity: ' + hour.main.humidity + '%');

                            title.append(icon);
                            cardBody.append(title, conditions, temp, humidity);
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
            url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=" + myAPIkey,
            dataType: "json",
            success: function (object) {
                var uvindex = object.current.uvi,
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
    $("#history li").on("click", function(){
        search($(this).text());
    });

    // set up initial time
    $("#time").text(dayjs().format('dddd, MMMM D, h:mm a'))
    // then update every 10 seconds
    setInterval(() => {
        $("#time").text(dayjs().format('dddd, MMMM D, h:mm a'))
    }, 10000);

    // Assign the main function to the search button
    $("#search-button").on("click", function (event) {
        event.preventDefault();
        var searchValue = $("#search-value").val();
        $("#search-value").val('')
        search(searchValue);
    })
});



