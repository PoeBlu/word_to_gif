var express = require('express');
var router = express.Router();
var config = require('../config/config');

var giphy = require('giphy-api')(config.key);

var GIFEncoder = require('gifencoder');
var encoder = new GIFEncoder(400,400);
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
var easyimg = require('easyimage');

/* GET home page. */

router.post('/gifit', function(req,res,next){
	var query = req.body.query;

	var uniqueFilename = shortid.generate();

	//split query on spaces
	var queryTerms = query.split(/\s+/);

	var resultUrls = [];
	console.log(queryTerms)
	var imageCounter = 0;
	var resizeImageCounter = 0;

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
		var img_url = filename+counter;
		request(imageUrl).pipe(fs.createWriteStream("../images/"+img_url+".png")).on('close', function(){
			console.log("Downloaded")
			resizeImage(img_url, counter, filename);
		})
		console.log(imageUrl, filename, counter)
	}

	function resizeImage(imageToResize, imageCounterVar, filenameVar){
		console.log("resizing images")
		
		easyimg.rescrop({
			src:"../images/"+imageToResize+".png",
			dst:"../images/converted/"+imageToResize+".png",
			width:700,
			height:500,
			cropwidth:400,
			cropheight:400,
			x:0,
			y:0
		}).then(function(image){
			console.log(resizeImageCounter, queryTerms.length)
			resizeImageCounter++;
			if(resizeImageCounter == queryTerms.length){
				console.log(resizeImageCounter, queryTerms.length)
				console.log("Make gif")
				createGif(filenameVar);
			}
		}, function(err){
			console.log(err);
		})
	}

	function createGif(filenameToGif){

		var stream = fs.createWriteStream('../public/images/gif/'+filenameToGif+'.gif');
		stream.on('close', function(){
			console.log('made gif!')
			res.send('done')
		})
		pngFileStream('../images/converted/'+filenameToGif+'?.png')
		.pipe(encoder.createWriteStream({repeat:0, delay:150, quality:10}))
		.pipe(stream);
		// .on('close', function(){
		// 	console.log('created gif');
		// 	res.send('done');
		// });
		
		
		//res.send('http://localhost/images/gif/'+filenameToGif+'.gif');
		// pngFileStream('../images/converted/frame?.png')
		// .pipe(encoder.createWriteStream({repeat:0, delay:150, quality:10}))
		// .pipe(fs.createWriteStream('../gif/'+filenameToGif+'.gif'));
	}


	//function down


	//search images and stitch them together
	//res.send("done")
	// giphy.search(query, function(err, resp){
	// 	res.send(resp.data[0].images["original"]);
	// })
})

router.get('/giff', function(req,res,next){
	pngFileStream('../test/frame?.png')
	.pipe(encoder.createWriteStream({repeat:0, delay:150, quality:10}))
	.pipe(fs.createWriteStream('../gif/animated.gif'))


	res.send('giffed')
})


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
