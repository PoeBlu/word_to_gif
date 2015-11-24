var express = require('express');
var router = express.Router();

/* GET home page. */

router.post('/gifit', function(req,res,next){
	var query = req.body.query
	res.send(query)
})


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
