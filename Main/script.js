$(document).ready(function () {

    var myAPIkey = "6e5fce99e3612282ac67662359b2658d",
        history = JSON.parse(localStorage.getItem("history"));

    // function makeRow(text) {
    //     var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    //     $(".history").append(li);
    // }

    function search(searchValue) {
        $.ajax({
            url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&units=imperial&appid=" + myAPIkey,
            method: "GET",
            datatype: 'json',
            success: function (object) {
                console.log('current weather');
                console.log(object);

                var card = $("<div>").attr({ "class": "card", "id": "current-card" }),
                    cardBody = $("<div>").attr('class', 'card-body'),
                    title = $("<h3>").attr('class', 'card-title').text(object.name + ' '),
                    time = $("<p>").attr('class', 'float-right').text(dayjs().format('MM-DD-YYYY')),
                    icon = $("<img>").attr('src', 'http://openweathermap.org/img/wn/' + object.weather[0].icon + ".png"),
                    conditions = $("<p>").attr('class', 'card-text').text('Current conditions: ' + object.weather[0].main),
                    temp = $("<p>").attr('class', 'card-text').text('Temperature: ' + object.main.temp + '°f'),
                    humidity = $("<p>").attr('class', 'card-text').text('Humidity: ' + object.main.humidity + '%'),
                    windSpeed = $("<p>").attr('class', 'card-text').text('Wind speed: ' + object.wind.speed + 'mph');

                title.append(icon, time);
                cardBody.append(title, conditions, temp, humidity, windSpeed);
                card.append(cardBody);
                $("#current-div").append(card);

                getForecast(searchValue);

                // take lat and lon from the object, and send it to get the UV index (which requires a separate api call for some reason)
                var lon = object.coord.lon;
                var lat = object.coord.lat;
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
            url: 'http://api.openweathermap.org/data/2.5/forecast?q=' + searchValue + '&appid=' + myAPIkey,
            dataType: "json",
            success: function (object) {
                console.log('forecast');
                console.log(object);

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
            url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude={part}&appid=" + myAPIkey,
            dataType: "json",
            success: function (object) {
                console.log('UV Index');
                console.log(object)
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



