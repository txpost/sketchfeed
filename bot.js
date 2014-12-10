var Twit = require('twit'); 
var async = require('async');
var Flickr = require("flickrapi"),
    flickrOptions = {
      api_key: "4f6c35e5446ddeb1fa681dfc8464b7c6",
      secret: "29a6663e320971cc"
    };

Flickr.authenticate(flickrOptions, function (error, flickr) {
	// body...
});

// authentication for the Twitter API
var t = new Twit({
	consumer_key: 			process.env.BOT_CONSUMER_KEY,
	consumer_secret: 		process.env.BOT_CONSUMER_SECRET,
	access_token: 			process.env.BOT_ACCESS_TOKEN,
	access_token_secret: 	process.env.BOT_ACCESS_TOKEN_SECRET
});

// get an image from the Urban Sketchers Flickr group pool
getImage = function (cb) {
	flickr.groups.pools.getPhotos({
		group_id: 568523@N21,
		page: 1,
		per_page: 10
	}, function (err, result) {
		if (!err) {
			var botData = {
				photoID = result.photos.photo[0].id,
				photoOwnerID = result.photos.photo[0].owner;
				photoOwnerName = result.photos.photo[0].ownername;
				photoTitle = result.photos.photo[0].title;
			};
			cb(null, botData);
		} else {
			console.log("There was error getting an image. ABORT!");
			cb(err, botData);
		}
	});
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