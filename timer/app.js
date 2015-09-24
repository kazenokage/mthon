var graphloader = require('./graphloader');
var path = require('path');

var express = require('express');
var multer = require('multer');
var app = express();
var upload = multer({dest: 'upload/'});

app.post('/api/algo', upload.single('algo'), function(req, res, next) {
    console.log("file got!");
    console.log(req.file);
    console.log(req.body.group);
    testFile(req.file, res);
});

function testFile(file, res) {
  var algo = require('./upload/'+file.filename);
  graphloader.loadGraph(1, function(stars) {
    var curTime = new Date();
    var goal = stars.filter(function(s) { return s._id === 167 })[0];
    var answ = algo.algo(stars, stars[0], goal);
    var endTime = new Date();
    var total = endTime.getTime() - curTime.getTime();
    console.log(total/1000);
    if (!checkAnsw(stars, answ)) {
      console.log('HEY, THINK CHEATING IS FUNNY?');
    }
    console.log(answ);
    console.log('Legit');
    res.send(answ);
  });
  graphloader.loadGraph(2, function(stars) {
    console.log('Testing against 10k stars');
    var curTime = new Date();
    var goal = stars.filter(function(s) { return s._id === 8294 })[0];
    var answ = algo.algo(stars, stars[0], goal);
    var endTime = new Date();
    var total = endTime.getTime() - curTime.getTime();
    console.log(total/1000);
    // if (!checkAnsw(stars, answ)) {
    //   console.log('HEY, THINK CHEATING IS FUNNY?');
    // }
    console.log(answ);
    console.log('Legit');
  });
}

function checkAnsw(stars, answ) {
  for (var i = 0; i < answ.length-1; i++) {
    var s = getStar(answ[i], stars);
    if (s.nghbrs.indexOf(answ[i+1]) === -1) {
      return false;
    }
  }
  return true;
}

function getStar(id, stars) {
  var ret = stars.filter(function(s) { return s._id === id });
  return ret.length > 0 ? ret[0] : undefined;
}

app.use(express.static(path.join(__dirname, '../front')));

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
