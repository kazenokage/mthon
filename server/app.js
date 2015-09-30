'use strict';

var graphloader = require('./graphloader');
var path = require('path');
var config = require('./config.json');

var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var dijkstra = require('./algo');
var upload = multer({
  dest: 'upload/'
});

var url = config.mongolab.url;
app.use(bodyParser.json()); // for parsing application/json

MongoClient.connect(url, function(err, db) {
  if (err) console.log(err);
  app.post('/api/algo', upload.single('algo'), function(req, res, next) {
    testFile(req.file, res, req.body.chosenTeam);
  });

  app.get('/api/top', function(req, res) {
    var ret = [];
    db.collection('results').find().toArray(function(err, docs) {
      res.send(docs);
    });
  });

  app.post('/api/teams', function(req, res) {
    var team = req.body;
    db.collection('teams').insertOne(team, function(err, succ) {
      res.send(succ.ops);
    });
  });

  app.get('/api/teams', function(req, res) {
    db.collection('teams').find().toArray(function(err, succ) {
      res.send(succ);
    });
  });

  app.delete('/api/teams/:id', function(req, res) {
    db.collection('teams').deleteOne(
      {'_id': ObjectId(req.params.id)},
      function(err, succ) {
        res.send(succ);
      }
    );
  });

  function testFile(file, res, g) {
    var algo = require('./upload/' + file.filename);
    graphloader.loadGraph(1, function(stars, goal) {
      var curTime = new Date();
      var answ = algo.algo(stars, stars[0], getStar(goal, stars));
      var endTime = new Date();
      var total = endTime.getTime() - curTime.getTime();
      // if (!checkAnsw(stars, answ)) {
      //   res.send('HEY, THINK CHEATING IS FUNNY?');
      // } else {
      if (checkAnsw(dijkstra.constructNeighbors(stars), answ)) {
        console.log('YEEHAA');
      };
      // console.log(answ);
      // console.log(total / 1000);
      res.send({anticheat: true, distance: 1, speed: total / 1000 });
        // testLarge();
      // }
    });

    function testLarge() {
      graphloader.loadGraph(2, function(stars) {
        console.log('Testing against 10k stars');
        var curTime = new Date();
        var goal = stars.filter(function(s) { 
          return s._id === 8294
        })[0];
        var answ = algo.algo(stars, stars[0], goal);
        var endTime = new Date();
        var total = (endTime.getTime() - curTime.getTime()) / 1000;
        var length = goal.dist;
        db.collection('results').insertOne({group: g, time: total, routeLength: length});
        console.log('10k test done');
      });
    }
  }

  function checkAnsw(stars, answ) {
    for (var i = 0; i < answ.length - 1; i++) {
      var s = getStar(answ[i], stars);

      if (!s || s.nghbrs.indexOf(answ[i + 1]) === -1) {
        return false;
      }
    }
    return true;
  }

  function getStar(id, stars) {
    var ret = stars.filter(function(s) {
      return s._id === id
    });
    return ret.length > 0 ? ret[0] : undefined;
  }

  app.use(express.static(path.join(__dirname, '../front')));

  var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
  });

  console.log("Connected correctly to server.");
});
