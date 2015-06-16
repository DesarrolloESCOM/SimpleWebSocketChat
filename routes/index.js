var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});
router.post('/fileUpload',function(req,res){
	console.log("POST method to this url");
});
router.get('/getFile',function(req,res){
	console.log("Get a file");
});
module.exports = router;