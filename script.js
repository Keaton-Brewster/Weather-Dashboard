$(document).ready(function () {

    var myAPIkey = "6e5fce99e3612282ac67662359b2658d",
        history = JSON.parse(localStorage.getItem("history")) || [];

    function makeRow(text) {
        var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
        $("#previous").prepend(li);
    }

    function search(searchValue) {
        // this is the call that takes the city you input and gives current weather info, as well as lat and lon values that we can feed into another call to retrieve more information
        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&units=imperial&appid=" + myAPIkey,
            method: "GET",
            datatype: 'json',
            success: function (object) {
                // make a list item that you can revisit when you search for something IF that city has not previously been stored locally
                if (history.indexOf(searchValue) === -1) {
                    history.push(object.name);
                    localStorage.setItem('history', JSON.stringify(history));
                    makeRow(object.name);
                }

                // empty the previous results before loading new results
                $("#current-div").empty();

                // then, just creating all the elements that will have the dynamic information for the todays weather
                var toady_current = $("<div>").attr({ "class": "card-like", 'id': 'rightnowtoday' }),

                    title = $("<h3>").attr({'class':'card-header font-30','id':'current-header'}).text(object.name + ''),
                    time = $("<p>").addClass('float-right').text(dayjs().format('M-DD-YYYY')),
                    icon = $("<img>").attr('src', 'http://openweathermap.org/img/wn/' + object.weather[0].icon + ".png"),

                    divider = $('<div>').addClass('dropdown-divider'),
                    divider2 = $('<div>').addClass('dropdown-divider'),

                    row = $("<div>").attr({ 'id': 'today-row', 'class': 'row justify-content-around' }),

                    currWeather = $("<div>").attr({ 'class': 'card col-5 text-center', 'id': 'current-weather' }),
                    currWeatherBody = $('<div>').attr({'class':'card-body','id':'current-weather-body'}),
                    currTitle = $('<p>').attr({ 'class': 'card-title font-weight-bold font-20' }).text('Current'),
                    currConditions = $("<p>").addClass('card-text').text('Current Conditions: ' + object.weather[0].main),
                    currTemp_data = $('<span>').addClass('font-weight-light').text(object.main.temp + '°f'),
                    currTemp_text = $("<p>").addClass('card-text font-weight-bold').text('Current Temperature: ').append(currTemp_data),
                    feelsLike_data = $('<span>').addClass('font-weight-light').text(object.main.feels_like + '°f'),
                    feelsLike_text = $('<p>').addClass('card-text font-weight-bold').text('Feels like: ').append(feelsLike_data),
                    currHumidity = $("<p>").addClass('card-text').text('Humidity: ' + object.main.humidity + '%'),
                    currWndSpd = $("<p>").addClass('card-text').text('Wind speed: ' + object.wind.speed + ' mph'),

                    todaysWeather = $("<div>").attr({ 'class': 'card col-5 text-center', 'id': 'todays-weather' }),
                    todaysTitle = $("<p>").attr({ 'class': 'card-title font-weight-bold font-20' }).text('Today');

                // appending all the dynamic information
                title.append(icon, time);
                currWeatherBody.append(currConditions, currTemp_text, feelsLike_text, currHumidity, currWndSpd);
                currWeather.append(currTitle, divider, currWeatherBody);
                todaysWeather.append(todaysTitle, divider2);
                row.append(currWeather, todaysWeather);
                toady_current.append(title, row);
                $("#current-div").append(toady_current);

                getForecast(searchValue);

                // take lat and lon from the object, and send it to get the UV index (which requires a separate api call for some reason)
                let lon = object.coord.lon,
                    lat = object.coord.lat;

                // get other weather information for the current day as well as UV indexes for current and daily
                $.ajax({
                    method: 'GET',
                    url: "https://api.openweathermap.org/data/2.5/onecall?units=imperial&lat=" + lat + "&lon=" + lon + "&appid=" + myAPIkey,
                    dataType: "json",
                    success: function (object) {
                        var high_data = $("<span>").addClass('font-weight-light').text(object.daily[0].temp.max + '°f'),
                            high = $('<p>').addClass('card-text font-weight-bold').text('High: ').append(high_data),
                            low_data = $('<span>').addClass('font-weight-light').text(object.daily[0].temp.min + '°f'),
                            low = $("<p>").addClass('card-text font-weight-bold').text('Low: ').append(low_data),
                            conditions = $('<p>').attr({ 'class': 'card-text' }).text('Conditions: ' + object.daily[0].weather[0].main),
                            pop = $('<p>').addClass('card-text').text('Chance of precipitation: ' + object.daily[0].pop + '%'),

                            uvindex = object.current.uvi,
                            currUVele = $("<p>").attr('class', 'card-text mt-2').text('UV Index: '),
                            currUVp = $("<span>").addClass('font-weight-bold').text(uvindex),

                            todayIndex = object.daily[0].uvi,
                            todayUVele = $("<p>").addClass('card-text mt-2').text('UV Index: '),
                            todayUVp = $('<span>').addClass('font-weight-bold').text(todayIndex);

                        // function to check the conditions of the UV index
                        function checkUVI(index, element) {
                            if (index < 3) { element.addClass('good-uvi') }
                            else if (index < 6) { element.addClass('okay-uvi') }
                            else { element.addClass('bad-uvi') };
                        }

                        checkUVI(uvindex, currUVp);
                        checkUVI(todayIndex, todayUVp);

                        currUVele.append(currUVp);
                        todayUVele.append(todayUVp);

                        $("#current-div #current-weather-body").append(currUVele);

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

    // this function pull the information for the next five days, and dynamically created the elements to display the information
    function getForecast(searchValue) {
        $.ajax({
            method: 'GET',
            url: 'https://api.openweathermap.org/data/2.5/forecast?q=' + searchValue + '&units=imperial&appid=' + myAPIkey,
            dataType: "json",
            success: function (object) {
                console.log(object)
                $("#forecast-div").empty();
                for (let i = 0; i < object.list.length; i++) {
                    var hour = object.list[i];
                    if (hour.dt_txt.indexOf("15:00:00") !== -1) {
                        var card = $("<div>").attr({ 'class': 'card col-2', 'id': 'forecast-day' }),
                            cardBody = $("<div>").addClass('card-body'),
                            title = $("<p>").attr({'class':'card-header text-center font-weight-bold','id':'forecast-header'}).text(dayjs(hour.dt_txt).format('M-DD')),
                            icon = $("<img>").attr('src', 'http://openweathermap.org/img/wn/' + hour.weather[0].icon + ".png"),
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
    $("#history").on('click', 'li', function () {
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



