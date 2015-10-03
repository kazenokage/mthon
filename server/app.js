'use strict';

var graphloader = require('./graphloader');
var path = require('path');
var config = require('./config.json');
var fs = require('fs');

var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var dijkstra = require('./algo');
var marked = require('marked');
var generator = require('./generator/generate');
var socketS = require('http').createServer();
var _ = require('lodash');
// var io = require('socket.io')(socketS);
var upload = multer({
  dest: 'upload/'
});

var url = config.mongolab.url;
app.use(bodyParser.json()); // for parsing application/json
app.set('view engine', 'jade');
app.set('views', './views')

MongoClient.connect(url, function(err, db) {
  if (err) console.log(err);
  app.post('/api/algo', upload.single('algo'), function(req, res, next) {
    testFile(req.file, res, req.body.chosenTeam);
  });
  //
  // var emitAlgorithm = function(msg) {
  //   console.log(':(');
  // };

  app.get('/api/top', function(req, res) {
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
    db.collection('teams').deleteOne({
        '_id': ObjectId(req.params.id)
      },
      function(err, succ) {
        res.send(succ);
      }
    );
  });

  app.get('/', function(req, res) {
    fs.readFile('./markdown/instructions.md', 'utf-8', function(err, text) {
      res.render('index', {
        md: marked(text)
      });
    });
  });

  app.get('/home', function(req, res) {
    fs.readFile('./markdown/instructions.md', 'utf-8', function(err, text) {
      res.render('index', {
        md: marked(text)
      });
    });
  });

  app.get('/scores', function(req, res) {
    res.render('scores');
  });

  app.get('/scores/resources', function(req, res) {
    db.collection('results').find().toArray(function(err, results) {
      db.collection('teams').find().toArray(function(err, teams) {
        results = results.map(function(r) {
          r.group = _.find(teams, function(t) { return t._id == r.group; }).name;
          return r;
        });

        results.forEach(function(r) {
          r.totalResources = 0;
          _.forOwn(r.resources, function(val, key) { totalResources += val; });
        });

        results.

        res.render('resource_scores', {results: results, teams: teams});
      });
    });
  });

  app.get('/submit', function(req, res) {
    res.render('submit');
  });

  app.get('/submissions', function(req, res) {
    db.collection('teams').find().toArray(function(err, docs) {
      res.render('submissions', {
        teams: docs
      });
    });
  });

  app.get('/submissions/:id', function(req, res) {
    db.collection('results').find({
      group: req.params.id
    }).toArray(function(err, docs) {
      db.collection('teams').find({
        _id: ObjectId(req.params.id)
      }).toArray(function(err, team) {
        res.render('submissions_by', {
          submissions: docs,
          team: team[0]
        });
      });
    });
  });

  app.get('/mthonzip', function(req, res) {
    res.sendFile('views/mthon_fix.zip', {
      root: __dirname
    });
  });

  app.get('/viz', function(req, res) {
    res.sendFile('views/viz.html', {
      root: __dirname
    });
  });

  function testFile(file, res, g) {
    var algo = require('./upload/' + file.filename);
    graphloader.loadGraph(1, function(dataset) {
      var curTime = new Date();
      console.log('algorithm started');
      var answ = algo.algo(dataset);
      console.log('algorithm ended');
      var endTime = new Date();
      var total = endTime.getTime() - curTime.getTime();
      if (checkAnsw(dijkstra.constructNeighbors(dataset.stars), answ, [], dataset)) {
        // var g = generator.generateGraph(500, true, true);
        // var a = algo.algo(g.stars, g.stars[0], g.endPoint);
        // emitAlgorithm({graph: g, answer: a});
        testLarge(res);
      } else {
        console.log('Group ' + g + ' sent an answer we cant accept');
        res.send({
          angryMessage: 'There is something fishy in your answer. Are you calculating the distance between the vertices correctly? It can be at most 30.'
        });
      }
    });

    function testLarge(res) {
      var types = ['Carbon', 'Helium', 'Hydrogen', 'Oxygen', 'Nitrogen'];
      var resources = {
        'Carbon': 0,
        'Helium': 0,
        'Hydrogen': 0,
        'Oxygen': 0,
        'Nitrogen': 0
      };
      graphloader.loadGraph(3, function(dataset) {
        console.log('Testing against 25k stars');
        var curTime = new Date();
        var answ = algo.algo(dataset);
        var endTime = new Date();
        var total = (endTime.getTime() - curTime.getTime()) / 1000;

        var visited = [];
        answ.forEach((sid) => {
          if (visited.indexOf(sid) === -1) {
            var star = getStar(sid, dataset.stars);
            resources[star.resource.type] += star.resource.amount;
            visited.push(sid);
          }
        });

        var distance = dijkstra.calcDistance(answ, dataset.stars);
        db.collection('results').insertOne({
          group: g,
          time: total,
          routeLength: distance,
          resources: resources
        });
        console.log('25k test done');
        console.log({
          total: total,
          dist: distance,
          answ: answ,
          resources: resources
        });
        res.send({
          anticheat: true,
          distance: distance,
          speed: total
        });
      });
    }
  }

  function checkAnsw(stars, answ, resources, dataset) {
    if (answ.indexOf(dataset.endPoint) === -1) {
      console.log('path: ' + answ);
      console.log('path doesnt contain endpoint');
      return false;
    }

    if (answ.indexOf(0) === -1) {
      console.log('path: ' + answ);
      console.log('path doesnt contain starting point');
      return false;
    }
    // Stage 2 answer checking!
    // console.log('Checking if the path contains enough resources: ' + dataset.materialsRequired);
    // var types = ['Carbon', 'Helium', 'Hydrogen', 'Oxygen', 'Nitrogen'];
    // for (var i = 0; i < types.length; i++) {
    //   console.log(resources[types[i]]);
    //   if (resources[types[i]] < dataset.materialsRequired) {
    //     console.log('doesnt cut it, moving back');
    //     return false;
    //   }
    // }

    for (var i = 0; i < answ.length - 1; i++) {
      var s = getStar(answ[i], stars);

      if (!s || (s.nghbrs.indexOf(answ[i + 1]) === -1) && (s._id !== answ[i+1])) {
        console.log('path: ' + answ);
        console.log('neighborcheck failed');
        console.log('current star: ');
        console.log(s);
        console.log('the failing neighbour: ' + answ[i + 1]);
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

  // io.listen(server);
  //
  //
  // io.sockets.on('connection', function(socket) {
  //   io.emit('testo', {test: 'foo'});
  //   emitAlgorithm = function(msg) {
  //     console.log(":D");
  //     io.emit('smallpass', msg);
  //   };
  // });

  console.log("Connected correctly to server.");
});
