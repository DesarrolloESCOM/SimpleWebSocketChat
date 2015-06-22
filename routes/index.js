var express = require('express');
var router = express.Router();
var mime = require('mime');
var fs = require('fs');
/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', {title: 'Express'});
});
router.get('/getMimeType',function(req, res){
  var mimeType = mime.lookup('./public/uploads/'+req.query.nameOfFile);
  if(mimeType){
    res.json({'Content-Type': mimeType});		
  } else {
  	res.json({'Content-Type': 'octet-stream'});
  }
});
router.get('/getFileLog', function(req, res){
  var files = fs.readdirSync('./public/uploads/');
  /*
  var filteredFiles = [];
  for(var i=0;i<files.length;i++){
    var fileInformation = fs.statSync(files[i]);
    if(!(fileInformation.isDirectory())){
      console.log(files[i]);
      console.log(files[i]);
      console.log(files[i]);
  	  filteredFiles.push(files[i]);
    }
    res.json(filteredFiles);
    return;
  }
  */
  res.json(files);
});
module.exports = router;