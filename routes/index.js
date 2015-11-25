var express = require('express');
var router = express.Router();
var config = require('../config/config');

var giphy = require('giphy-api')(config.key);

var GIFEncoder = require('gifencoder');
var encoder = new GIFEncoder(854,480);
var pngFileStream = require('png-file-stream');

var fs = require('fs')


/* GET home page. */

router.post('/gifit', function(req,res,next){
	var query = req.body.query;

	//search images and stitch them together
	
	giphy.search(query, function(err, resp){
		res.send(resp.data[0].images["original"]);
	})
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
