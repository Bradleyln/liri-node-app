require("dotenv").config();

var keys = require('./keys.js');

var fs = require('fs');
var moment = require('moment');
var bandsintown = require('bandsintown')(APP_ID = 'codingbootcamp');
var request = require('request');
var Spotify = require('node-spotify-api');


var liri = "";

var nodeArgs = process.argv;

var command = process.argv[2];

for (var i = 3; i < nodeArgs.length; i++) {
    if (i > 3 && i < nodeArgs.length) {
        liri = liri + "+" + nodeArgs[i];
    } else {
        liri += nodeArgs[i];
    }
}

//switch case for different Liri Commands. I had to google switch/case.

//bandsintown
switch (command) {
    case "concert-this":
        getConcert();
        break;

    //spotify
    case "spotify-this-song":
        if (liri) {
            getSong(liri);
        } else {
            getSong("The Sign Ace of Base");
        }
        break;

    //OMDB
    case "movie-this":
        if (liri) {
            getMovie(liri)
        } else {
            getMovie("Mr. Nobody")
        }
        break;

    //The do-what-it-says links to I Want It That Way inside random.txt
    //I personally would've picked *NSync instead of Backstreet Boys
    case "do-what-it-says":
        doWhatItSays();
        break;

    default:
        console.log("Please enter a command: concert-this, spotify-this-song, movie-this, do-what-it-says");
        break;
}

//Commands for Liri to accomplish
// * `concert-this`
function getConcert() {
    var query = "https://rest.bandsintown.com/artists/" + liri + "/events?app_id=codingbootcamp"
    bandsintown
    request(query, function (error, response, body) {
        if (error) {
            console.log("Error! Try again");
        } else {
            //var to contain JSON data
            var jsonData = JSON.parse(body);
            var divider = "\n----------------\n\n";

            //This loops through all the concerts listed    
            for (let i = 0; i < jsonData.length; i++) {
                //This prints out the concert information and puts date in correct format
                //All information is put into an object to print to log.txt and to be console-logged
                var concertData = [
                    'Venue Name: ' + jsonData[i].venue.name,
                    'Venue Location: ' + jsonData[i].venue.city,
                    'Concert Date: ' + moment(jsonData[i].datetime).format('MM/DD/YYYY')
                ].join("\n\n")

                console.log(concertData);
            
                // Append songData and the divider to log.txt, print showData to the console
                fs.appendFile("log.txt", concertData + divider, function (err) {
                    if (err) throw err;
                });

            }


        };
    });
}

// * `spotify-this-song`
function getSong(liri) {
    //constructor data for spotify
    var spotify = new Spotify(keys.spotify);

    //query for spotify search and console log the results
    spotify.search({ type: 'track', query: liri }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        } else {
            //var to cut down typing for spotify and turn into object for log.txt and easy console
            var divider = "\n----------------\n\n";
            var song = data.tracks.items[0];

            var songData = [
                "Artist(s): " + song.artists[0].name,
                "Song Name: " + song.name,
                "Preview Link: " + song.preview_url,
                "Album Name: " + song.album.name
            ].join("\n\n");

            console.log(songData);

            // Append songData and the divider to log.txt, print showData to the console
            fs.appendFile("log.txt", songData + divider, function (err) {
                if (err) throw err;
            });
        }

    });

}

// * `movie-this`
function getMovie(liri) {
    var queryUrl = "http://www.omdbapi.com/?t=" + liri + "&y=&plot=short&apikey=trilogy";

    request(queryUrl, function (error, response, body) {

        // If the request is successful
        if (!error && response.statusCode === 200) {

            var divider = "\n----------------\n\n";
            var jsonData = JSON.parse(body);

            // Parse the body of the site and recover just the info into an object for easy writing to log.txt
            var movieData = [
                "Title: " + jsonData.Title,
                "Release Year: " + jsonData.Year,
                "IMdB Rating: " + jsonData.imdbRating,
                "Rotten Tomatoes Rating: " + jsonData.Ratings[1].Value,
                "Country: " + jsonData.Country,
                "Language: " + jsonData.Language,
                "Plot: " + jsonData.Plot,
                "Actors: " + jsonData.Actors

            ].join("\n\n");

            //console logging the results
            console.log(movieData);

            // Append movieData and the divider to log.txt, print showData to the console
            fs.appendFile("log.txt", movieData + divider, function (err) {
                if (err) throw err;
                console.log(movieData);
            });
        } else {
            console.log("Error: " + error);
        }
    });

}

//Do What it says (aka play the Backstreet Boys from random.txt)

function doWhatItSays() {
    fs.readFile('random.txt', "utf8", function (error, data) {
        var txt = data.split(',');

        getSong(txt[1]);
    });
}