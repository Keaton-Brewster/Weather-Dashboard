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
                console.log(object);
                if (history.indexOf(searchValue) === -1) {
                    history.push(object.name);
                    localStorage.setItem('history', JSON.stringify(history));
                    makeRow(object.name);
                }

                $("#current-div").empty();

                var toady_current = $("<div>").attr({ "class": "card-like", 'id': 'todayANDcurrent' }),


                    title = $("<h3>").attr({'class':'card-header','id':'current-header'}).text(object.name + ' '),
                    time = $("<p>").addClass('float-right').text(dayjs().format('M-DD-YYYY')),
                    icon = $("<img>").attr('src', 'http://openweathermap.org/img/wn/' + object.weather[0].icon + ".png"),

                    divider = $('<div>').addClass('dropdown-divider'),
                    divider2 = $('<div>').addClass('dropdown-divider'),

                    row = $("<div>").attr({ 'id': 'today-row', 'class': 'row justify-content-around' }),

                    currWeather = $("<div>").addClass('card col-5 text-center'),
                    currWeatherBody = $('<div>').attr({'class':'card-body','id':'current-weather'}),
                    currTitle = $('<p>').attr({ 'class': 'card-title font-weight-bold' }).text('Current'),
                    currConditions = $("<p>").addClass('card-text').text('Current Conditions: ' + object.weather[0].main),
                    currTemp = $("<p>").addClass('card-text').text('Current Temperature: ' + object.main.temp + '°f'),
                    feelsLike = $('<p>').addClass('card-text').text('Feels like: ' + object.main.feels_like + '°f'),
                    currHumidity = $("<p>").addClass('card-text').text('Humidity: ' + object.main.humidity + '%'),
                    currWndSpd = $("<p>").addClass('card-text').text('Wind speed: ' + object.wind.speed + 'mph'),

                    todaysWeather = $("<div>").attr({ 'class': 'card col-5 text-center', 'id': 'todays-weather' }),
                    todaysTitle = $("<p>").attr({ 'class': 'card-title font-weight-bold' }).text('Today');

                title.append(icon, time);
                currWeatherBody.append(currConditions, currTemp, feelsLike, currHumidity, currWndSpd);
                currWeather.append(currTitle, divider, currWeatherBody);
                todaysWeather.append(todaysTitle, divider2);
                row.append(currWeather, todaysWeather);
                toady_current.append(title, row);
                $("#current-div").append(toady_current);

                getForecast(searchValue);

                // take lat and lon from the object, and send it to get the UV index (which requires a separate api call for some reason)
                let lon = object.coord.lon,
                    lat = object.coord.lat;

                // get high/low for the current day and UVI's
                $.ajax({
                    method: 'GET',
                    url: "https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=" + lat + "&lon=" + lon + "&appid=" + myAPIkey,
                    dataType: "json",
                    success: function (object) {
                        console.log(object);
                        var high = $("<p>").addClass('card-text').text('High: ' + object.daily[0].temp.max + '°f'),
                            low = $("<p>").addClass('card-text').text('Low: ' + object.daily[0].temp.min + '°f'),
                            conditions = $('<p>').attr({ 'class': 'card-text' }).text('Conditions: ' + object.daily[0].weather[0].main),
                            pop = $('<p>').addClass('card-text').text('Chance of precipitation: ' + object.daily[0].pop + '%'),

                            uvindex = object.current.uvi,
                            currUVele = $("<p>").attr('class', 'card-text').text('UV Index: '),
                            currUVp = $("<span>").text(uvindex),

                            todayIndex = object.daily[0].uvi,
                            todayUVele = $("<p>").addClass('card-text').text('UV Index: '),
                            todayUVp = $('<span>').text(todayIndex);


                        function checkUVI(index, element) {
                            if (index < 3) { element.addClass('good-uvi') }
                            else if (index < 6) { element.addClass('okay-uvi') }
                            else { element.addClass('bad-uvi') };
                        }

                        checkUVI(uvindex, currUVp);
                        checkUVI(todayIndex, todayUVp);

                        currUVele.append(currUVp);
                        todayUVele.append(todayUVp);

                        $("#current-div #current-weather").append(currUVele);

                        $("#todays-weather").append(high, low, conditions, pop, todayUVele);
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
                            title = $("<p>").attr({'class':'card-header text-center','id':'forecast-header'}).text(dayjs(hour.dt_txt).format('M-DD')),
                            icon = $("<img>").attr('src', 'http://openweathermap.org/img/wn/' + hour.weather[0].icon + ".png"),
                            divider = $("<div>").addClass('dropdown-divider'),
                            conditions = $("<p>").addClass('card-text').text('Conditions: ' + hour.weather[0].main),
                            temp = $("<p>").addClass('card-text').text('Temp: ' + hour.main.temp + '°f'),
                            humidity = $("<p>").addClass('card-text').text('Humidity: ' + hour.main.humidity + '%');

                        title.append(icon);
                        cardBody.append(conditions, temp, humidity);
                        card.append(title, cardBody);
                        $("#forecast-div").append(card);
                    }
                }
            },
            error: function (error) {
                console.log(error);
            }
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

    // clear history button
    $('#clear-history').on('click', function(event){
        localStorage.clear();
        location.reload();
    })
});



