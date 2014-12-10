var Twit = require('twit'); 
var async = require('async');
var jquery = require('jquery');
var Flickr = require("flickrapi"),
    flickrOptions = {
      api_key: "4f6c35e5446ddeb1fa681dfc8464b7c6",
      secret: "29a6663e320971cc"
    };
var request = require('request');

// authentication for the Twitter API
var t = new Twit({
	consumer_key: 			process.env.BOT_CONSUMER_KEY,
	consumer_secret: 		process.env.BOT_CONSUMER_SECRET,
	access_token: 			process.env.BOT_ACCESS_TOKEN,
	access_token_secret: 	process.env.BOT_ACCESS_TOKEN_SECRET
});

// Flickr.authenticate(flickrOptions, function (error, flickr) {
// 	console.log("checkpoint#1");
// 	if (!error) {
// 		flickr.groups.pools.getPhotos({
// 			group_id: "568523@N21",
// 			page: 1,
// 			per_page: 10
// 		}, function (err, result) {
// 			console.log("checkpoint#2");
// 			if (!err) {
// 				var botData = {
// 					photoID: result.photos.photo[0].id,
// 					photoOwnerID: result.photos.photo[0].owner,
// 					photoOwnerName: result.photos.photo[0].ownername,
// 					photoTitle: result.photos.photo[0].title
// 				};
// 				console.log("here's the photoID: " + botData.photoID);
// 				//cb(null, botData);
// 			} else {
// 				console.log("There was error getting an image. ABORT!");
// 				//cb(err, botData);
// 			}
// 		});		
// 	} else {
// 		console.log("There was an issue with flickr. ABORT!");
// 	}
// });

var flickrAPI = "https://api.flickr.com/services/rest/?method=flickr.groups.pools.getPhotos&api_key=77b820af248ee9b5bfd060ff315f8ee4&group_id=568523%40N21&per_page=10&format=json&nojsoncallback=1";
	//var flickrAPI = "http://api.flickr.com/services/"
	
request(flickrAPI, function (error, response, body) {
	if (!error && response.statusCode == 200) {
		// console.log(body);
		// console.log(JSON.stringify(body));
		var json = JSON.parse(body);
		// console.log(JSON.parse(body));
		console.log(json.photos.photo[0].title);
	};
})

// get an image from the Urban Sketchers Flickr group pool
getImage = function (cb) {
	console.log("checkpoint#1");
	var flickrAPI = "https://api.flickr.com/services/rest/?method=flickr.groups.pools.getPhotos&api_key=77b820af248ee9b5bfd060ff315f8ee4&group_id=568523%40N21&per_page=10&format=json&nojsoncallback=1";
	//var flickrAPI = "http://api.flickr.com/services/"
	
	request(flickrAPI, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			// console.log(body);
			console.log(JSON.stringify(body));
			var botData = {
				photoID: body.photos.photo[0].id,
				photoOwnerID: body.photos.photo[0].owner,
				photoOwnerName: body.photos.photo[0].ownername,
				photoTitle: body.photos.photo[0].title
			}
			console.log("here's the photoID: " + botData.photoID);
			cb(null, botData);
		};
	})

	// var xhr = new XMLHttpRequest();
	// xhr.open("GET", flickrAPI, true);
	// xhr.send();
	// xhr.onreadystatechange=function () {
	// 	if (xhr.readyState === 4 && xhr.status === 200) {
	// 		var json = JSON.parse(xhr.responseText);
	// 		console.log("success!");
	// 		var botData = {
	// 			photoID: json.photos.photo[0].id,
	// 			photoOwnerID: json.photos.photo[0].owner,
	// 			photoOwnerName: json.photos.photo[0].ownername,
	// 			photoTitle: json.photos.photo[0].title
	// 		}
	// 		console.log("here's the photoID: " + botData.photoID);
	// 		cb(null, botData);
	// 	};
	// }

	// jquery.getJSON( flickrAPI, function (json) {
	// 	console.log("success!");
	// 	var botData = {
	// 		photoID: json.photos.photo[0].id,
	// 		photoOwnerID: json.photos.photo[0].owner,
	// 		photoOwnerName: json.photos.photo[0].ownername,
	// 		photoTitle: json.photos.photo[0].title
	// 	}
	// 	console.log("here's the photoID: " + botData.photoID);
	// });
}


// format the tweet
formatTweet = function (botData, cb) {
	var tweetText = botData.photoTitle;
	var tweetOwnerName = botData.photoOwnerName;
	var tweetOwnerID = botData.photoOwner;
	var tweetPicID = botData.photoID;
	//https://www.flickr.com/photos/98277396@N08/15350213575/in/pool-urbansketches
	//https://www.flickr.com/photos/48097026@N02/15956844955/in/pool-urbansketches
	var tweetURL = "https://www.flickr.com/photos/" + tweetOwnerID + "/" + tweetPicID + "/in/pool-urbansketches";
	var tweet = '"' + tweetText + '" by ' + tweetOwnerName + ": " + tweetURL;
	botData.tweetBlock = tweet;
	cb(null, botData);
}


// post the tweet
postTweet = function (botData, cb) {
	t.post('statuses/update', {status: botData.tweetBlock}, function (err, data, response) {
		cb(err, botData);
	});
}


// run each function in sequence
run = function () {
	async.waterfall([
		getImage,
		formatTweet,
		postTweet
	],
	function (err, botData) {
		if (err) {
			console.log("There was an error posting to Twitter: ", err);
		} else {
			console.log("Tweet successful!");
			console.log("Tweet: ", botData.tweetBlock);
		}
		console.log("Base tweet: ", botData.baseTweet);
	});
}


// run every two hours: 60000 * 60 * 2
setInterval(function () {
	try {
		run();
	}
	catch (e) {
		console.log(e);
	}
}, 60000 * 2);