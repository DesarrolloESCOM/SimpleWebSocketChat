var express = require('express');
var router = express.Router();
var mime = require('mime');
router.get('/', function (req, res) {
  res.render('index', {title: 'Express'});
});
router.get('/getMimeType/:file',function(req, res){
  var mimeType = mime.lookup('./public/upload/'+req.params.file);
  if(mimeType){
    res.json({'Content-Type': mimeType});		
  } else {
  	res.json({'Content-Type': 'octet-stream'});
  }
});
module.exports = router;