var express = require('express');
var router = express.Router();
var config = require('../config/config');

var giphy = require('giphy-api')(config.key);

var Bing = require('node-bing-api')({accKey:config.bing});

var GIFEncoder = require('gifencoder');

var pngFileStream = require('png-file-stream');

var fs = require('fs')

var Flickr = require('node-flickr')
var flickrKey = {'api_key':config.flickr}
var flickr = new Flickr(flickrKey);

var request = require('request');

var shortid = require('shortid');
var easyimg = require('easyimage');

var exec = require('child_process').exec;

var rimraf = require('rimraf');

/* GET home page. */

router.post('/imgtogif', function(req,res,next){
	var query = req.body.query;
	var searchApi = req.body.searchApi;

	query = query.trim();

	var uniqueFilename = shortid.generate();

	//split query on spaces
	var queryTerms = query.split(/\s+/);

	queryTermsLength = queryTerms.length;

	// return if no query is detected
	checkQueryLength();

	console.log(queryTerms)

	var imageCounter = 0;
	var resizeImageCounter = 0;

	console.log("IMG COUNTER: "+imageCounter)
	console.log("RESIZE COUNTER: "+resizeImageCounter)

	//for each term search flickr and append to a url list
	if(searchApi == 'bing'){
		for(var i in queryTerms){
			searchBing(i);
		}
	} else if (searchApi == 'flickr'){
		for(var i in queryTerms){
			searchFlickr(i);
		}
	}

	function searchBing(index){
		console.log("Search Bing");
		Bing.images(queryTerms[index],{top:25}, function(bingerror, bingres, bingbody){
			if(!bingbody || bingerror){  //if no results returned then skip
				queryTermsLength--; //reduce length of acceptable query terms
				checkQueryLength(); //do this so if all are unacceptable words then it the post call returns something
				return; 
			}
			var randomImg = bingbody.d.results[Math.floor(Math.random()*(bingbody.d.results.length))]
			if(!randomImg){
				queryTermsLength--;
				checkQueryLength();
				return;
			}
			var url = randomImg.MediaUrl;
			imageCounter++;
			downloadImage(url, uniqueFilename ,imageCounter)
		})
	}

	function searchFlickr(index) {
		console.log("Search Flickr")
		var sortOrder = ["date-posted-desc", "relevance", "interestingness-desc"]
		var sort = sortOrder[Math.floor(Math.random()*(sortOrder.length))];
		flickr.get('photos.search', {
			"text":queryTerms[index],
			"page":1,
			"per_page":1,
			"sort":sort,
			"media":"photos"
		}, function(err,result){
			if(err){
				queryTermsLength--; //reduce length of acceptable query terms
				checkQueryLength();
				return;
				//return console.error(err)
			}

			

			var response = result.photos.photo[0]

			if(!response){
				queryTermsLength--;
				checkQueryLength();
				return;
			}

			var url = "https://farm"+response["farm"]+".staticflickr.com/"+response["server"]+"/"+response["id"]+"_"+response["secret"]+".jpg";
			console.log(url);
			imageCounter++;

			//download the image
			downloadImage(url, uniqueFilename ,imageCounter)
		})
	}

	function checkQueryLength(){
		if(queryTermsLength == 0){
			res.send("no query sent")
			return
		}
	}
	

	function downloadImage(imageUrl,filename,counter){
		console.log("Downloading image");
		var img_url = filename+counter;
		request(imageUrl).pipe(fs.createWriteStream("./images/"+img_url+".jpg")).on('close', function(){
			console.log("Downloaded")
			resizeImage(img_url, counter, filename);
		})
	}

	function resizeImage(imageToResize, imageCounterVar, filenameVar){
		console.log("Resizing images")

		var dir = './images/converted/'+filenameVar;

		if(!fs.existsSync(dir)){
			fs.mkdirSync(dir);
		}

		var cmd = "convert ./images/"+imageToResize+".jpg -resize 500x400^ -gravity center -extent 500x400 "+dir+"/"+imageToResize+".jpg"

		exec(cmd, function(err){
			console.log('RESIZED JPG');
			resizeImageCounter++;
			deleteFile("./images/"+imageToResize+".jpg");
			if(resizeImageCounter == queryTermsLength){
				console.log(resizeImageCounter, queryTermsLength)
				console.log("Make gif")
				createGif(filenameVar);
			}
		})
		
		// easyimg.rescrop({
		// 	src:"../images/"+imageToResize+".jpg",
		// 	dst:"../images/converted/"+filenameVar+"/"+imageToResize+".png",
		// 	width:700,
		// 	height:500,
		// 	cropwidth:400,
		// 	cropheight:400,
		// 	x:0,
		// 	y:0
		// }).then(function(image){
		// 	console.log("Resized Image")
		// 	resizeImageCounter++;
		// 	console.log(resizeImageCounter, queryTerms.length)
		// 	//delete original image once its been resized
		// 	deleteFile("../images/"+imageToResize+".jpg");
		// 	if(resizeImageCounter == queryTerms.length){
		// 		console.log(resizeImageCounter, queryTerms.length)
		// 		console.log("Make gif")
		// 		createGif(filenameVar);
		// 	}
		// }, function(err){
		// 	console.log(err);
		// })
	}

	function createGif(filenameToGif){
		// var encoder = new GIFEncoder(400,400);
		// var stream = fs.createWriteStream('../public/images/gif/'+filenameToGif+'.gif');
		// stream.on('close', function(){
		// 	stream.end();
		// 	console.log('Made gif!')
		// 	//delete folder once its been combined to a gif
		// 	deleteFolder('../images/converted/'+filenameToGif)
		// 	res.send('http://localhost:3000/images/gif/'+filenameToGif+'.gif');
		// })
		// pngFileStream('../images/converted/'+filenameToGif+'/'+filenameToGif+'?.png')
		// .pipe(encoder.createWriteStream({repeat:0, delay:350, quality:10}))
		// .pipe(stream);
		var name = queryTerms.join("")
		var finalName = filenameToGif+'-'+name;
		//name = filenameToGif+name;
		var cmd = 'convert -delay 50 -loop 0 ./images/converted/'+filenameToGif+'/'+filenameToGif+'*.jpg ./public/images/gif/'+finalName+'.gif';

		exec(cmd, function(err){
			console.log("COMBINED to gif");
			//delete folders once its been combined to a gif
			deleteFolder('./images/converted/'+filenameToGif)
			res.end('http://localhost:3000/images/gif/'+finalName+'.gif');
		})

	}

})

router.post('/giftogif', function(req, res, next){

	var query = req.body.query;
	query = query.trim();

	var uniqueFilename = shortid.generate();

	//split query on spaces
	var queryTerms = query.split(/\s+/);
	console.log(queryTerms)
	var queryTermsLength = queryTerms.length;
	// return if no query is detected
	checkQueryLength();

	var imageCounter = 0;
	var explodedGif = 0;

	console.log("IMG COUNTER: "+imageCounter)
	console.log("EXPLODED GIF: "+explodedGif)

	//for each term search flickr and append to a url list
	for(var i in queryTerms){

		searchGiphy(i);
		
	}

	function checkQueryLength(){
		if(queryTermsLength == 0){
			res.send("no query sent")
			return
		}
	}

	function searchGiphy(index){
		giphy.search(queryTerms[index], function(err, resp){
			
			if(err || !resp){
				queryTermsLength--;
				checkQueryLength();
				return;
			}

			console.log("IMG COUNTER: "+imageCounter);
			// pick random gif from the array of returned gifs
			var randomGif = resp.data[Math.floor(Math.random()*(resp.data.length))]

			if(!randomGif){
				queryTermsLength--;
				checkQueryLength();
				return;
			}

			var url = randomGif.images['original'].url
			imageCounter++;
			//var url = resp.data[0].images['original'].url;
			console.log("URL: "+url);
			downloadGif(url,uniqueFilename ,imageCounter)
		})
	}

	function downloadGif(imageUrl,filename,counter){
		console.log("Downloading Gif");
		var img_path = filename+counter;
		console.log(img_path)
		request(imageUrl).pipe(fs.createWriteStream("./images/"+img_path+".gif")).on('close', function(){
			console.log("Downloaded Gif")
			//resizeGif(img_path, counter, filename);
			explodeImageMagick(img_path, filename);		
		})
	}

	function explodeImageMagick(img_name, filename){
		//create a unique directory for the gifs if it doesnt exist
		console.log('Exploding gif')
		var dir = './images/gifconverted/'+filename;

		if(!fs.existsSync(dir)){
			fs.mkdirSync(dir);
		}
		
		var cmd = 'convert -coalesce ./images/'+img_name+'.gif '+dir+'/'+img_name+'%04d.gif'
		exec(cmd, function(err){
			console.log('Exploded Gif');

			explodedGif++;
			console.log("ERROR: " +err)
			console.log("EXPLODED GIF: ",explodedGif)
			console.log("QUERY LENGTH: ", queryTermsLength)
			// delete file once its been exploded as its no longer needed
			deleteFile('./images/'+img_name+'.gif')
			// combine only once all gifs have been exploded
			if(explodedGif == queryTermsLength){
				console.log("ALL Exploded")
				resizeExplodedGifs(filename);
				//combineToGif(filename);
			}
		})
		
	}

	function resizeGif(imageToResize, imageCounterVar, filenameVar){
		console.log("Resizing GIF")
		
		// var cmd = "convert ./images/"+imageToResize+".gif -resize 400x300^ -gravity center -extent 400x300 ./images/"+imageToResize+".gif"

		// exec(cmd, function(err){
		// 	console.log('RESIZED GIF');
		// 	//explodeImageMagick(imageToResize, filenameVar)
		// })

		// easyimg.rescrop({
		// 	src:"../images/"+imageToResize+".gif",
		// 	dst:"../images/"+imageToResize+".gif",
		// 	width:800,
		// 	height:800,
		// 	cropwidth:400,
		// 	cropheight:300,
		// 	gravity: 'NorthWest'
		// }).then(function(image){
		// 	console.log("Resized GIF")
		// 	explodeImageMagick(imageToResize, filenameVar)
		// }, function(err){
		// 	console.log(err);
		// })
	}

	

	

	function resizeExplodedGifs(filename){
		console.log("RESIZING IMAGES");
		// make new folder to save resized images to
		var dir = "./images/gifconverted/"+filename+"/resized";
		fs.mkdirSync(dir);
		var cmd = "convert ./images/gifconverted/"+filename+"/"+filename+"*.gif -resize 400x300^ -gravity center -extent 400x300 "+dir+"/"+filename+"%04d.gif"

		exec(cmd, function(err){
			console.log('RESIZED GIFS');
			combineToGif(filename);
			//explodeImageMagick(imageToResize, filenameVar)
		})
	}

	function combineToGif(filename){
		console.log("combining to gif")
		var name = queryTerms.join("")
		var finalName = filename+'-'+name
		var cmd = 'convert -delay 7 -loop 0 ./images/gifconverted/'+filename+'/resized/'+filename+'*.gif ./public/images/gifgif/'+finalName+'.gif';

		exec(cmd, function(err){
			console.log("COMBINED");
			//delete folders once its been combined to a gif
			deleteFolder('./images/gifconverted/'+filename)
			res.send('http://localhost:3000/images/gifgif/'+finalName+'.gif');
		})
	}

	// NOT WORKING - uses gif-explode package
	// function explodeGif(img_name){
	// 	fs.createReadStream("../images/"+img_name+".gif")
	// 	  .pipe(gif(function(frame){
	// 	  	frame.pipe(fs.createWriteStream('../images/hello'+i+'.gif'))
	// 	  }))
	// }


	// NOT WORKING - using gifsicle package
	// function gifsicleIt(img_name){
	// 	var filePath = '../images/*.gif'
	// 	var outFilePath = '../images/anim.gif'
	// 	execFile(gifsicle, ['--explode',filePath], function(err){
	// 		console.log('combined');
	// 	})
	// 	return
	// }

	// function execGifsicle(){
	// 	var cmd = 'gifsicle -d 100 --loop ../images/1.gif ../images/2.gif > anim.gif'

	// 	exec(cmd, function(err){
	// 		console.log("Error: "+err)
	// 		console.log("Combined")
	// 	})

	// 	return
	// }
})

router.post('/s', function(req,res,next){

	 giphy.search('hello', function(err, resp){
	 	var randomGif = resp.data[Math.floor(Math.random()*(resp.data.length))]
	 	res.send(randomGif);
	})
})

function deleteFile(filePath){
	console.log("DELETING FILE")
	fs.unlink(filePath, function(err){
		console.log("Deleted  File")
	})
}

function deleteFolder(folderPath){
	console.log("DELETE FOLDER")
	rimraf(folderPath, function(err){
		console.log(err);
		console.log("Deleted Folder")
	})
}

// router.get('/giff', function(req,res,next){
// 	pngFileStream('../test/frame?.png')
// 	.pipe(encoder.createWriteStream({repeat:0, delay:150, quality:10}))
// 	.pipe(fs.createWriteStream('../gif/animated.gif'))


// 	res.send('giffed')
// })


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
