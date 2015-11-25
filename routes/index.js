var express = require('express');
var router = express.Router();
var config = require('../config/config');

var giphy = require('giphy-api')(config.key);

var GIFEncoder = require('gifencoder');
var encoder = new GIFEncoder(854,480);
var pngFileStream = require('png-file-stream');

var fs = require('fs')

// var Flickr = require("flickrapi"),
//     flickrOptions = {
//     	"api-key":config.flickr
//     }
var Flickr = require('node-flickr')
var flickrKey = {'api_key':config.flickr}
var flickr = new Flickr(flickrKey);

var request = require('request');

var shortid = require('shortid');

/* GET home page. */

router.post('/gifit', function(req,res,next){
	var query = req.body.query;

	var uniqueFilename = shortid.generate();

	//split query on spaces
	var queryTerms = query.split(/\s+/);

	var resultUrls = [];

	var imageCounter = 0;

	//for each term search flickr and append to a url list
	for(var i in queryTerms){

		searchFlickr(i);
		
	}

	function searchFlickr(index) {
		flickr.get('photos.search', {
			"text":queryTerms[index],
			"page":1,
			"per_page":1,
			"sort":"interestingness-desc",
			"media":"photos"
		}, function(err,result){
			if(err){
				return console.error(err)
			}
			// callsFinished++;
			// if (callsFinished == queryTerms.length) {
			// 	// res.send("done");
			// }

			imageCounter++;

			var response = result.photos.photo[0]
			var url = "https://farm"+response["farm"]+".staticflickr.com/"+response["server"]+"/"+response["id"]+"_"+response["secret"]+".jpg";
			console.log(url);

			//download the image
			downloadImage(url, uniqueFilename ,imageCounter)
		})
	}

	function downloadImage(imageUrl,filename,counter){
		// request.head(imageUrl, function(erro,respo,body){
		// 	request(imageUrl).pipe(fs.createWriteStream("../images"+filename+counter+".png")).on('close', function(){
		// 		console.log("downloaded image")
		// 	})
		// })
		// request.get(imageUrl, function(erro, respo, body){
		// 	fs.write(filename+counter+".png", respo.body, function(){
		// 		console.log("Downloaded: "+imageUrl)
		// 	})
		// })
		request(imageUrl).pipe(fs.createWriteStream(filename+counter+".png")).on('close', function(){
			console.log("DOwnloaded")
		})
		console.log(imageUrl, filename, counter)
	}



	//function down


	//search images and stitch them together
	res.send("done")
	// giphy.search(query, function(err, resp){
	// 	res.send(resp.data[0].images["original"]);
	// })
})

router.get('/giff', function(req,res,next){
	pngFileStream('../test/frame?.png')
	.pipe(encoder.createWriteStream({repeat:0, delay:150, quality:10}))
	.pipe(fs.createWriteStream('../gif/animated.gif'));

	res.send('hello')
})


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
