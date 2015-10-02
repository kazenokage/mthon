var fs = require('fs');
var algo = require('../algo');
var _ = require('lodash');

/**
* Helps with calculating the densities for the vertices.
*/
Math.cbrt = Math.cbrt || function(x) {
  var y = Math.pow(Math.abs(x), 1/3);
  return x < 0 ? -y : y;
};

/**
* Get the specified star.
*/
function getStar(id, stars) {
  var ret = stars.filter(function(s) { return s._id === id });
  return ret.length > 0 ? ret[0] : undefined;
}

/**
* Generates the graph part of the scenario.
*/
function generateGraph(n, materials, direction) {
  var universeSize = n / 0.00005;
  var boundary = universeBoundary(universeSize);
  var graph = [];
  for (var i = 0; i < n; i++) {
    var v = {};
    v.size = getRandomInt(5, 10) / 10;
    v._id = i;
    v.velocity = Math.random();
    assignPosition(v, n, boundary);
    assignType(v);
    if (materials) assignMaterials(v, n);
    if (direction) assignDirection(v);
    graph.push(v);
  }
  return graph;
}

/**
* Generates the scenario according to given parameters.
* @param {number} n - The amount of vertices.
* @param {boolean} materials - Are materials included?
* @param {boolean} direction - Are vertices given a direction vector?
* @param {string=} filename - Optional: Exports the generated graph as json with the given name and exits.
* @returns {array} - The generated graph.
*/
function generateScenario(n, materials, direction, filename) {
  var scenario = {};
  var path = {};
  scenario.stars = generateGraph(n, materials, direction);
  scenario.endPoint = getEndPoint(scenario.stars, path);
  if (materials) scenario.materialsRequired = Math.floor(path.nodes/5*80);
  console.log("materials required: " + scenario.materialsRequired);

  if (checkIfAnswerCanBeFound(scenario)) {
    scenario.dataset = {};
    scenario.dataset.stars = scenario.stars;
    scenario.dataset.endPoint = scenario.endPoint;
    scenario.dataset.materialsRequired = scenario.materialsRequired;
    delete scenario.stars;
    delete scenario.endPoint;
    delete scenario.materialsRequired;
    if (filename) {
      fs.writeFile(filename, JSON.stringify(scenario));
    } else {
      return scenario;
    }
  } else {
    console.log("tough luck, cant find a good route");
  }
}

/**
* We need to make sure that it is actually possible to
*/
function checkIfAnswerCanBeFound(scenario) {
  var types = ['Carbon', 'Helium', 'Hydrogen', 'Oxygen', 'Nitrogen'];
  var resources = {'Carbon': 0, 'Helium': 0, 'Hydrogen': 0, 'Oxygen': 0, 'Nitrogen': 0};
  var starz = _.cloneDeep(scenario.stars);
  algo.algo(starz, starz[0], scenario.endPoint);
  starz.forEach((s) => {
    if (s.dist !== Number.MAX_VALUE) {
      resources[s.resource.type] += s.resource.amount;
    }
  });
  types.forEach((t) => {
    if (resources[t] < scenario.materialsRequired) {
      return false;
    }
  });
  return true;
}

/**
* Random integer between the given range where min is inclusive, max is not.
*/
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
* Assigns a position for the given vertex.
*/
function assignPosition(v, size, boundary) {
  var p = {};
  p.x = getRandomInt(-boundary, boundary);
  p.y = getRandomInt(-boundary, boundary);
  p.z = getRandomInt(-boundary, boundary);
  v.position = p;
}

function universeBoundary(number) {
  return Math.floor(Math.cbrt(number)/2);
}

/**
* Assigns a material type and amount for the given vertex.
*/
function assignMaterials(v, size) {
  var types = ['Carbon', 'Helium', 'Hydrogen', 'Oxygen', 'Nitrogen'];
  var resource = {
    type: types[getRandomInt(0, 5)],
    amount: getRandomInt(0, 101)
  };
  v.resource = resource;
}

/**
* Assigns a direction vector for the given vertex.
*/
function assignDirection(v) {
  var direction = {
    x: Math.floor(Math.random() * 20) - 10,
    y: Math.floor(Math.random() * 20) - 10,
    z: Math.floor(Math.random() * 20) - 10
  };
  v.direction = direction;
}

/**
* Assign a type from 0 to 4, used to color the vertex.
*/
function assignType(v) {
  v.type = getRandomInt(1, 6);
}

/**
* Makes sure that the generated graph contains a path that is long enough.
*/
function checkGraphLength(endPoint, path) {
  var route = algo.getPath(endPoint);
  path.nodes = route.length;
}

/**
* Picks the furthest vertex from the graph[0].
*/
function getEndPoint(graph, path) {
  var furthest = algo.findFurthest(_.cloneDeep(graph));
  checkGraphLength(furthest, path);
  return furthest._id;
}

// This can be used as a standalone script to generate a json.
var args = process.argv.slice(2);

if (args.length > 0) {
  var size, materials, direction, filename;
  args.forEach(function(a) {
    if (a.indexOf('-size') !== -1) size = parseInt(a.split('=')[1]);
    if (a === '-m') materials = true;
    if (a === '-d') direction = true;
    if (a.indexOf('-fn') !== -1) filename = a.split('=')[1];
  });
  generateScenario(size, materials, direction, filename);
}

// Call this from somewhere else to get a graph.
module.exports = {
  generateGraph: generateScenario
}
