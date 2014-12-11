var Twit = require('twit'),
	async = require('async'),
	request = require('request');

// authentication for the Twitter API
var t = new Twit({
	consumer_key: process.env.BOT_CONSUMER_KEY,
	consumer_secret: process.env.BOT_CONSUMER_SECRET,
	access_token: process.env.BOT_ACCESS_TOKEN,
	access_token_secret: process.env.BOT_ACCESS_TOKEN_SECRET
});

// get an image from the Urban Sketchers Flickr group pool
getImage = function (cb) {

	var flickr_api_method = "flickr.groups.pools.getPhotos",
		flickr_api_key = process.env.BOT_FLICKR_KEY,
		flickr_group_id = "568523%40N21",
		flickr_per_page = 10,
		flickr_format = "json&nojsoncallback=1",
		flickrAPI = "https://api.flickr.com/services/rest/?method=" + flickr_api_method + "&api_key=" + flickr_api_key + "&group_id=" + flickr_group_id + "&per_page=" + flickr_per_page + "&format=" + flickr_format + '"';
	
	request(flickrAPI, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var json = JSON.parse(body);
			var botData = {
				photoID: json.photos.photo[0].id,
				photoOwnerID: json.photos.photo[0].owner,
				photoOwnerName: json.photos.photo[0].ownername,
				photoTitle: json.photos.photo[0].title
			}
			console.log("here's the photoID: " + botData.photoID);
			cb(null, botData);
		};
	})
}


// format the tweet
formatTweet = function (botData, cb) {
	
	var tweetText = botData.photoTitle;
	var tweetOwnerName = botData.photoOwnerName;
	var tweetOwnerID = botData.photoOwnerID;
	var tweetPicID = botData.photoID;

	// example url to get: https://www.flickr.com/photos/48097026@N02/15956844955/in/pool-urbansketches
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
}, 60000);