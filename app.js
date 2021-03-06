//tells where to start in table
var endRow = 0;
//is input valid
var inputValid = true;
//error message string
var errorString = "";

//function to display error in Modal
function displayError() {
    $("#errorMessage").text(errorString);
    $("#myModal").modal("show");
    errorString = "";
    inputValid = true;
    $("tbody").empty();
}

//Autocomplete function
function initialize() {
    var options = {
        types: ['(cities)'],
        componentRestrictions: { country: "us" }
    };

    var input = document.getElementById("city-input");
    var autocomplete = new google.maps.places.Autocomplete(input, options);
}
google.maps.event.addDomListener(window, 'load', initialize);

//when the submit button is clicked
$(document).on("click", ".submit-button", function (event) {
    event.preventDefault();

    var result = $("#city-input").val();
    //if the input is empty
    if (!/./.test(result)) {
        errorString = "You must enter a city, state, and country."
        inputValid = false;
    }
    //if there is not a word a comma and another word
    if (!/\b, \b/.test(result)) {
        errorString = "You must enter a city, state, and country."
        inputValid = false;
    }

    if (inputValid) {
        //get the input and split it into city, state, and country
        result = result.trim().split(",");
        if (result.length === 3) {
            var city = result[0];
            var state = result[1].trim();
            var country = result[2].trim();
        }
        else {
            var city = result[0];
            var state = "";
            var country = result[1].trim();
        }

        ///MAP API CODE DONE
        //URL: https://maps.googleapis.com/maps/api/staticmap?center=Chapel%20Hill,NC&zoom=13&size=600x400&maptype=roadmap&key=AIzaSyC8fZcU3HJ2jihLd3KxN6-XV1Itwot6LgA
        //API: AIzaSyCCcr95yw_abVJ7PV3GxQtMiYqRA-py-vw
        //Garcian Code
        var queryUrl = "https://maps.googleapis.com/maps/api/staticmap?center="
        queryUrl += city;
        queryUrl += ",";
        queryUrl += state;
        queryUrl += "&zoom=13&size=450x400&maptype=roadmap";
        queryUrl += "&key=AIzaSyCCcr95yw_abVJ7PV3GxQtMiYqRA-py-vw";

        $("#maparea").empty();
        $("#maparea").append(`<img id='theImg' src='${queryUrl}'/>`);
        /////END MAP API CODE


        ///WEATHER API CODE
        var queryUrl = "https://api.openweathermap.org/data/2.5/forecast?q=";
        queryUrl += city;
        queryUrl += ",";
        queryUrl += state;
        queryUrl += ",";
        queryUrl += country;
        queryUrl += "&units=imperial";
        queryUrl += "&appid=e307e80a57e9ae32c5039265b1a6d235";

        $.ajax({
            url: queryUrl,
            method: "GET"
        }).then(function (response) {

            //clear the table body and create the new rows to append
            $("#weather-body").empty();
            for (var i = 0; i < response.list.length; i++) {
                //get the date returned by the data and use moment JS to convert it to the day of the week.
                var dateTime = response.list[i].dt_txt.split(" ");
                var date = dateTime[0];
                var time = dateTime[1].trim().substring(0, 2);
                date = moment(date, "YYYY-MM-DD").format('dddd');

                if (i == 0) {
                    var newRow = $("<tr  class='by-1'>");
                    newRow.append($("<td scope='col' class='w-col header-bold align-middle'>").text(date));
                    //first time through, figure out where to start in the table
                    if (time === "00") {
                        endRow = 7;
                    }
                    else if (time === "03") {
                        endRow = 6;
                    }
                    else if (time === "06") {
                        endRow = 5;
                    }
                    else if (time === "09") {
                        endRow = 4;
                    }
                    else if (time === "12") {
                        endRow = 3;
                    }
                    else if (time === "15") {
                        endRow = 2;
                    }
                    else if (time === "18") {
                        endRow = 1;
                    }
                    else if (time === "21") {
                        endRow = 0;
                    }
                    //add blank columns to table accordingly
                    for (var j = endRow; j < 7; j++) {
                        newRow.append($("<td scope='col' class='w-col'>"));
                    }
                }
                else if (endRow === 7) {
                    //starting a new row in the table
                    var newRow = $("<tr>");
                    newRow.append($("<td scope='col' class='w-col header-bold align-middle'>").text(date));
                }

                var newCol = $("<td scope='col' class='w-col'>");
                newCol.append($("<p class='wp'>").text(response.list[i].main.temp + "\u00B0F"));
                newCol.append($("<p class='wp'>").text(response.list[i].weather[0].main));
                newRow.append(newCol);

                if (endRow === 0) {
                    //at the end of the row, append the row
                    $("#weather-body").append(newRow);
                    endRow = 7;
                }
                else if (i === response.list.length - 1) {
                    //at the end of the array, append the row
                    $("#weather-body").append(newRow);
                }
                else {
                    //move to the next column
                    endRow--;
                }
            }

        }).fail(function () {
            //if ajax data could not be returned
            errorString = " Weather Data could not be found.";
            displayError();
        });

        ///EVENTS API CODE
        var apikey = "tvUTVI2iiCqaDja6l48lucGqABUD4KWS";
        var size = "";
        var sort = "";

        $.ajax({
            url: "https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US" + "&stateCode=" + state + "&city=" + city + "&sort=date,asc" + sort + "&size=15" + size + "&apikey=" + apikey,
            method: "GET"
        }).then(function (json) {
            $("#events").empty();
            for (var i = 0; i < json._embedded.events.length; i++) {
                var newRow = $("<tr>");
                var newCol1 = $("<td>");
                newCol1.addClass("text-center").addClass("font-weight-bold");
                var date = json._embedded.events[i].dates.start.localDate;
                date = moment(date, "YYYY-MM-DD").format('dddd');
                newCol1.text(date);
                var newCol2 = $("<td>");
                newCol2.text(json._embedded.events[i].name);
                newRow.append(newCol1).append(newCol2)
                $("#events").append(newRow)
            }
        }).fail(function () {
            errorString = " Events Data could not be found.";
            displayError();
        });

    }
    else {
        //input data was invalid
        displayError();
    }

    //clear the inputs
    $("#city-input").val("");
    $("#state-input").val("");
});
