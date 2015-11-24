var express = require('express');
var router = express.Router();
var config = require('../config/config');

var giphy = require('giphy-api')(config.key);

/* GET home page. */

router.post('/gifit', function(req,res,next){
	var query = req.body.query

	giphy.search(query, function(err, resp){
		res.send(resp.data[0].images["original"]);
	})
})


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
