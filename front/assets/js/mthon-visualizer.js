var MTHON = MTHON || {};

MTHON.globals = {
  orbitAnimation : false,
  path : [],
  connections : [],
  dataset : {},
  performance : {},
  starSprites : {},
  animationSpeed : 10000,
  mode: 'local'
}

MTHON.textures = {
  starspritemap : THREE.ImageUtils.loadTexture("assets/js/glow.png"),
  startpointer : THREE.ImageUtils.loadTexture("assets/js/pointer-start.png"),
  endpointer : THREE.ImageUtils.loadTexture("assets/js/pointer-end.png")
}

MTHON.materials = {
  startMaterial : new THREE.SpriteMaterial( { map: MTHON.textures.startpointer, blending: THREE.AdditiveBlending } ),
  endMaterial : new THREE.SpriteMaterial( { map: MTHON.textures.endpointer, blending: THREE.AdditiveBlending } )
}

MTHON.colors = {
  planetarycolor : [{"hex": 0xc0cbe4}, {"hex": 0xd4dbee}, {"hex": 0xffffeb}, {"hex": 0xffffbd}, {"hex": 0xfee4b6}],
  PATH : 0xceadff,
  CONNECTION : 0x2c1d46
}

// scene & camera setup
MTHON.scene = new THREE.Scene();
MTHON.scene.fog = new THREE.Fog(0x110329, 100, 270);
MTHON.camera = new THREE.PerspectiveCamera( 50, window.innerWidth/window.innerHeight, 0.1, 10000 );

// renderer setup
MTHON.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
MTHON.renderer.setSize( window.innerWidth, window.innerHeight );
MTHON.winResize = new THREEx.WindowResize(MTHON.renderer, MTHON.camera);
document.body.appendChild( MTHON.renderer.domElement );

// default zoom of camera
MTHON.camera.position.z = 120;

// controls for camera
MTHON.controls = new THREE.OrbitControls( MTHON.camera, MTHON.renderer.domElement );

MTHON.render = function () {
  requestAnimationFrame( MTHON.render );
  TWEEN.update();
  MTHON.controls.update();
  MTHON.moveCamera();
  MTHON.renderer.render(MTHON.scene, MTHON.camera);
};

MTHON.initVisualizer = function(data,solution,performance) {
  // set global vars
  MTHON.globals.dataset = data;
  MTHON.globals.path = solution.path;
  MTHON.globals.connections = solution.connections;
  MTHON.globals.performance = performance;
  // render non-webgl static elements
  if (MTHON.globals.mode === 'local') {
    $('#algo-runtime').html(MTHON.globals.performance.runTime+' s');
    $('#algo-length').html(MTHON.globals.path.length +' su');
  }
}

MTHON.buildScene = function() {
  MTHON.drawStars(MTHON.globals.dataset.stars);
  MTHON.drawConnections();
  MTHON.drawTargets(MTHON.globals.path);
  MTHON.drawPath(0,1);
}

MTHON.drawStars = function(data) {
  data.forEach(function(star) {
    var material = new THREE.SpriteMaterial( { map: MTHON.textures.starspritemap, color: MTHON.colors.planetarycolor[star.type - 1].hex, fog: true, blending: THREE.AdditiveBlending } );
    var sprite = new THREE.Sprite( material );
    sprite.position.set(star.position.x,star.position.y,star.position.z);
    sprite.scale.x = sprite.scale.y = star.size;
    MTHON.scene.add( sprite );
    MTHON.globals.starSprites[star._id] = sprite;
  })
}

MTHON.drawConnections = function() {
  // simple and straightforward
  $.each(MTHON.globals.connections, function() {
    v1 = MTHON.toolkit.getStar($(this)[0]).position;
    v2 = MTHON.toolkit.getStar($(this)[1]).position;
    var newLine = MTHON.drawLine(v1.x,v1.y,v1.z,v2.x,v2.y,v2.z,MTHON.colors.CONNECTION,1);
    MTHON.scene.add(newLine.line);
  })
}

MTHON.drawTargets = function(path) {
  var v1 = MTHON.toolkit.getStar(MTHON.globals.path[0]);
  var v2 = MTHON.toolkit.getStar(MTHON.globals.path[MTHON.globals.path.length-1]);
  var startSprite = new THREE.Sprite( MTHON.materials.startMaterial );
  var endSprite = new THREE.Sprite( MTHON.materials.endMaterial );
  startSprite.position.set(v1.position.x,v1.position.y,v1.position.z)
  endSprite.position.set(v2.position.x,v2.position.y,v2.position.z)
  startSprite.scale.x = startSprite.scale.y = endSprite.scale.x = endSprite.scale.y = 8;
  MTHON.scene.add( startSprite, endSprite );
}

MTHON.drawPath = function(start,end) {
  // let's set the actual path up
  var first = MTHON.toolkit.getStar(MTHON.globals.path[start]);
  var second = MTHON.toolkit.getStar(MTHON.globals.path[end]);
  var position = {x:first.position.x,y:first.position.y,z:first.position.z,size:second.size};
  var target = {x:second.position.x,y:second.position.y,z:second.position.z,size:6};
  // create the line
  var newline = MTHON.drawLine(first.position.x,first.position.y,first.position.z,first.position.x,first.position.y,first.position.z,MTHON.colors.PATH,3);
  MTHON.scene.add(newline.line);
  // update target info
  MTHON.updateInfo(second);
  // create tween
  var tween = new TWEEN.Tween(position).to(target,MTHON.globals.animationSpeed/MTHON.globals.path.length).easing(TWEEN.Easing.Quadratic.InOut);
  tween.onUpdate(function() {
    MTHON.globals.starSprites[second._id].scale.x = MTHON.globals.starSprites[second._id].scale.y = position.size;
    MTHON.moveCamera(position.x,position.y,position.z);
    newline.end.set(position.x,position.y,position.z);
    newline.geometry.verticesNeedUpdate = true;
  })
  .onComplete(function() {
    newline.geometry.verticesNeedUpdate = false;
    if (end < MTHON.globals.path.length-1) {
      MTHON.drawPath(start+1,end+1);
    }
  });
  tween.start();
}

MTHON.drawLine = function(x1,y1,z1,x2,y2,z2,color,width) {
  var material = new THREE.LineBasicMaterial({
    color: color || 0xffffff,
    linewidth: width || 1,
  });
  var geometry = new THREE.Geometry();
  var startVertex = new THREE.Vector3(x1, y1, z1);
  var endVertex = new THREE.Vector3(x2, y2, z2);
  geometry.vertices.push(startVertex,endVertex);
  var line = new THREE.Line(geometry, material);
  line.frustumCulled = false;
  return {
    geometry: geometry,
    start: startVertex,
    end: endVertex,
    line: line
  }
}

MTHON.updateInfo = function(star) {
  if (MTHON.globals.mode === 'local') {
    $('#current-position').html("x:"+star.position.x+", y:"+star.position.y+", z:"+star.position.z);
    $('#current-elements').html("<div class='row'><img src='assets/img/icon-"+star.resource.type.toLowerCase()+".png' class='icon'></img><span class='label'>"+star.resource.amount+" units</span></div>");
    var startype = star.type || Math.floor(Math.random() * (5 - 1)) + 1;
    $('#current-star-image').html("<div class='image-container'><img src='assets/img/star-type-"+startype+".png' class='star-image'></div>");
    $('#current-star-name').html(MTHON.toolkit.generateName(star));
    var current = parseInt($('#total-'+star.resource.type.toLowerCase()).html());
    $('#total-'+star.resource.type.toLowerCase()).html((current+star.resource.amount)+' units');
  }
}

MTHON.moveCamera = function(posx,posy,posz) {
  var posx = posx || MTHON.controls.center.x;
  var posy = posy || MTHON.controls.center.y;
  var posz = posz || MTHON.controls.center.z;
  if (MTHON.globals.orbitAnimation) {
    var timer = Date.now() * 0.00005;
    MTHON.camera.position.x = Math.cos( timer ) * 100;
    MTHON.camera.position.z = Math.sin( timer ) * 100;
  }
  MTHON.controls.center.set(posx, posy, posz);
  MTHON.controls.noRotate = MTHON.controls.noZoom = MTHON.globals.orbitAnimation;
}

MTHON.toolkit = {
  getStar : function(id) {
    var ret = MTHON.globals.dataset.stars.filter(function(s) { return s._id === id });
    return ret.length > 0 ? ret[0] : undefined;
  },
  generateName : function(star) {
    var starNames = ["Alpha","Beta","Gamma","Omega","Vega","Sirius"];
    var starEnds = ["A","C","K","N","S"];
    return starNames[Math.floor(Math.random()*starNames.length)]+"-"+star._id+starEnds[Math.floor(Math.random()*starEnds.length)];
  }
}

$(document).ready(function() {
  // bind controls
  $('#playControl').on('click', function() {
    MTHON.globals.orbitAnimation = !MTHON.globals.orbitAnimation;
    if (MTHON.globals.orbitAnimation) {
      $('#playControl').html("<img src='assets/img/icon-play.png' class='icon-large'>");
    } else {
      $('#playControl').html("<img src='assets/img/icon-pause.png' class='icon-large'>");
    }
  });
  // prevent page scrolling
  $(document).on('scroll touchmove mousewheel', function(e){
    e.preventDefault();
    e.stopPropagation();
  });
});
