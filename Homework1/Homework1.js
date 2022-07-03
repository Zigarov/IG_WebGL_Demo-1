"use strict";

var homework1 = function() {

// WebGl Context variables:
  var canvas;
  var gl;
  var program;

// VIEWING SETTINGS:
/*
  I will use the lookAt function to set the camera in a (variable) point in the object space,
  the vec3 eye, which coordinates are polar (radius, beta, and phi).

  The camera will be initially pointed at the origin of the object space and the up direction
  will be fixed to the y axes.
*/
  var radius = 5.0;
  var beta = 0.0;
  var phi = 0.0;
  var eye = vec3(0.0, 0.0, 0.0);  // coordiantes of the camera position (expressed in polar coordinates). eye = [radius * cos(beta), radius * sin(beta) * cos(phi), radius * sin(theta) * sin(phi)
  const at = vec3(0.0, 0.0, 0.0); // Set where the camera point in the object space. For the purpose of the homework it can be constant.
  const up = vec3(0.0, 1.0, 0.0); // Set the top of the camera.
//var viewerPos = vec3(0.0, 0.0, -5.0);
  var modelViewMatrix;

// ProjectionMatrix PARAMETERS: I will use the perspective() function.
  var projectionMatrix;
  var near = 0.5;       // Distance of the near face of the viewing Volume.
  var far = 6.0;        // Distance of the far face of the viewing Volume.
  var fovy = 60.0;      // Field-of-view in Y direction angle (in degrees).
  var aspect;           // Viewport aspect ratio.

// GEOMETRY PARAMETERS:
  var x0 = 0.0;
  var y0 = 1.0;
  var z0 = 0.0;

  var vertices = [
        vec4(-0.5+x0, -0.5+y0,  0.5+z0, 1.0),
        vec4(-0.5+x0,  0.5+y0,  0.5+z0, 1.0),
        vec4(0.5+x0,  0.5+y0,  0.5+z0, 1.0),
        vec4(0.5+x0, -0.5+y0,  0.5+z0, 1.0),
        vec4(-0.5+x0, -0.5+y0, -0.5+z0, 1.0),
        vec4(-0.5+x0,  0.5+y0, -0.5+z0, 1.0),
        vec4(0.5+x0,  0.5+y0, -0.5+z0, 1.0),
        vec4(0.5+x0, -0.5+y0, -0.5+z0, 1.0),

        vec4(-0.25+x0, -0.25+y0,  0.75+z0, 1.0),
        vec4(-0.25+x0,  0.25+y0,  0.75+z0, 1.0),
        vec4(0.25+x0,  0.25+y0,  0.75+z0, 1.0),
        vec4(0.25+x0, -0.25+y0,  0.75+z0, 1.0),
        vec4(-0.25+x0, -0.25+y0, -0.75+z0, 1.0),
        vec4(-0.25+x0,  0.25+y0, -0.75+z0, 1.0),
        vec4(0.25+x0,  0.25+y0, -0.75+z0, 1.0),
        vec4(0.25+x0, -0.25+y0, -0.75+z0, 1.0),

        vec4(-0.75+x0, -0.25+y0,  0.25+z0, 1.0),
        vec4(-0.75+x0,  0.25+y0,  0.25+z0, 1.0),
        vec4(0.75+x0,  0.25+y0,  0.25+z0, 1.0),
        vec4(0.75+x0, -0.25+y0,  0.25+z0, 1.0),
        vec4(-0.75+x0, -0.25+y0, -0.25+z0, 1.0),
        vec4(-0.75+x0,  0.25+y0, -0.25+z0, 1.0),
        vec4(0.75+x0,  0.25+y0, -0.25+z0, 1.0),
        vec4(0.75+x0, -0.25+y0, -0.25+z0, 1.0)
    ];
/*
  A cube has 8 vertices -> 6 Square faces -> 12 Triangles.
  To draw the cube we have a total of 3x12 = 36 coordinates in the positions array.
  For this Homework I will draw three concatenated cube for a total of 36*3 coordinates.
*/
  var numPositions = 36*3;    // Number of  vertices needed to draw the object.
  var cylinderpositions;      // number of vertices needed to draw the cylinder.
  var positionsArray = [];  	// Array to load in the buffer data with the position of the vertices for drawing triangles.
  var normalsArray = [];      // Array of normals associated to each vertex.
  var tangentsArray = [];      // Array of tangents associated to each vertex.
// Animation:
  var bar = baricentro();     // Barycentrum of the object.
  var axis = 0;               // Axis of Rotation. [x = 0, y = 1, z = 2]
  var theta = vec3(0, 0, 0);  // Angles of Rotation.
  var animation = false;      // Boolean to start and stop the animation.

// LIGHTS SETTINGS:
/*
  I will put three lights, (red, green, blue) inside the cylinder.
*/
// Lights Parameters:
  var enabledLights = [true, true, true]; // booleans to control the lights.
  var cylinderEmissiveColor;
  var lightPositions = [      // Positions of the three lights.
    vec4(-0.5, 0.0, 4.0, 1.0),
    vec4(0.0, 0.0, 4.0, 1.0),
    vec4(0.5, 0.0, 4.0, 1.0),
  ]

  var lightAmbient = [
    vec4(0.1, 0.1, 0.1, 1.0),
    vec4(0.1, 0.1, 0.1, 1.0),
    vec4(0.1, 0.1, 0.1, 1.0)
  ];

  var lightDiffuse = [
    vec4(1.0, 0.0, 0.0, 1.0), // Red Light
    vec4(0.0, 1.0, 0.0, 1.0), // Green Light
    vec4(0.0, 0.0, 1.0, 1.0), // Blue Light
  ];
  var lightSpecular = [
    vec4(1.0, 1.0, 1.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0)
  ];

  var vertexShading = false;

// Material parameters:
  var materialAmbient = vec4(0.3, 0.3, 0.3, 1.0);
  var materialDiffuse = vec4(0.5, 0.5, 0.5, 1.0);
  var materialSpecular = vec4(0.8, 0.8, 0.8, 1.0);
  var materialShininess = 100.0;

// TEXTURE PARAMETERS:
  var texSize = 64;
  var texEnabled = false;
  var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
  ];
  var nMatrix;
  var texCoordsArray = [];

  init();

  function baricentro(){
    var bar4 = vec4(0.0,0.0,0.0,0.0);
    for(var i = 0; i<vertices.length; i++){
      bar4 = add(bar4,vertices[i]);
    }
    var bar3 = vec3(bar4[0]/vertices.length,bar4[1]/vertices.length,bar4[2]/vertices.length);
    return bar3;
  }

  function quad(a, b, c, d) {
     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     normal = vec3(normal[0],normal[1],normal[2]);
     var tangent = vec3(t1[0],t1[1],t1[2]);

     var quadIndex = [a,b,c, a,c,d];
     var texIndex = [0,1,2, 0,2,3];
     for(var i = 0; i<6; i++){
       positionsArray.push(vertices[quadIndex[i]]);
       texCoordsArray.push(texCoord[texIndex[i]]);
       normalsArray.push(normal);
       tangentsArray.push(tangent);
     }
  }

  function myObject() {
    for(var i = 0; i<3; i++){
      quad(1+(i*8), 0+(i*8), 3+(i*8), 2+(i*8));
      quad(2+(i*8), 3+(i*8), 7+(i*8), 6+(i*8));
      quad(3+(i*8), 0+(i*8), 4+(i*8), 7+(i*8));
      quad(6+(i*8), 5+(i*8), 1+(i*8), 2+(i*8));
      quad(4+(i*8), 5+(i*8), 6+(i*8), 7+(i*8));
      quad(5+(i*8), 4+(i*8), 0+(i*8), 1+(i*8));
    }
  }

  function cylinder(l, r, caps) {

    var data = {};
    var slices = 36;
    //if(numSlices) slices = numSlices;
    var stacks = 1;
    //if(numStacks) stacks = numStacks;
    var capsFlag = true;
    if(caps==false) capsFlag = caps;

    var top = 0.6;
    var bottom = -0.6;
    if(l) {
      top = l/2;
      bottom = -l/2;
    }

    var radius = 0.01;
    if(r) {
      radius = r;
    }

    var topCenter = [0.0, top, 0.0];
    var bottomCenter = [0.0, bottom, 0.0];

    var sideColor = [1.0, 1.0, 1.0, 1.0];
    var topColor = [1.0, 1.0, 1.0, 1.0];
    var bottomColor = [1.0, 1.0, 1.0, 1.0];

    var cylinderVertexCoordinates = [];
    var cylinderNormals = [];
    var cylinderVertexColors = [];
    var cylinderTextureCoordinates = [];

    for(var j=0; j<stacks; j++) {
      var stop = bottom + (j+1)*(top-bottom)/stacks;
      var sbottom = bottom + j*(top-bottom)/stacks;
      var topPoints = [];
      var bottomPoints = [];
      var topST = [];
      var bottomST = [];
      for(var i =0; i<slices; i++) {
        var theta = 2.0*i*Math.PI/slices;
        topPoints.push([radius*Math.sin(theta), stop, radius*Math.cos(theta), 1.0]);
        bottomPoints.push([radius*Math.sin(theta), sbottom, radius*Math.cos(theta), 1.0]);
      };

      topPoints.push([0.0, stop, radius, 1.0]);
      bottomPoints.push([0.0,  sbottom, radius, 1.0]);

      for(var i=0; i<slices; i++) {
        var a = topPoints[i];
        var d = topPoints[i+1];
        var b = bottomPoints[i];
        var c = bottomPoints[i+1];
        var u = [b[0]-a[0], b[1]-a[1], b[2]-a[2]];
        var v = [c[0]-b[0], c[1]-b[1], c[2]-b[2]];

        var normal = [
          u[1]*v[2] - u[2]*v[1],
          u[2]*v[0] - u[0]*v[2],
          u[0]*v[1] - u[1]*v[0]
        ];

        var mag = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1] + normal[2]*normal[2])
        normal = [normal[0]/mag, normal[1]/mag, normal[2]/mag];
        cylinderVertexCoordinates.push([a[0], a[1], a[2], 1.0]);
        cylinderVertexColors.push(sideColor);
        cylinderNormals.push([normal[0], normal[1], normal[2]]);
        cylinderTextureCoordinates.push([(i+1)/slices, j*(top-bottom)/stacks]);

        cylinderVertexCoordinates.push([b[0], b[1], b[2], 1.0]);
        cylinderVertexColors.push(sideColor);
        cylinderNormals.push([normal[0], normal[1], normal[2]]);
        cylinderTextureCoordinates.push([i/slices, (j-1)*(top-bottom)/stacks]);

        cylinderVertexCoordinates.push([c[0], c[1], c[2], 1.0]);
        cylinderVertexColors.push(sideColor);
        cylinderNormals.push([normal[0], normal[1], normal[2]]);
        cylinderTextureCoordinates.push([(i+1)/slices, (j-1)*(top-bottom)/stacks]);

        cylinderVertexCoordinates.push([a[0], a[1], a[2], 1.0]);
        cylinderVertexColors.push(sideColor);
        cylinderNormals.push([normal[0], normal[1], normal[2]]);
        cylinderTextureCoordinates.push([(i+1)/slices, j*(top-bottom)/stacks]);

        cylinderVertexCoordinates.push([c[0], c[1], c[2], 1.0]);
        cylinderVertexColors.push(sideColor);
        cylinderNormals.push([normal[0], normal[1], normal[2]]);
        cylinderTextureCoordinates.push([(i+1)/slices, (j-1)*(top-bottom)/stacks]);

        cylinderVertexCoordinates.push([d[0], d[1], d[2], 1.0]);
        cylinderVertexColors.push(sideColor);
        cylinderNormals.push([normal[0], normal[1], normal[2]]);
        cylinderTextureCoordinates.push([(i+1)/slices, j*(top-bottom)/stacks]);
      };
    };

    var topPoints = [];
    var bottomPoints = [];
    for(var i =0; i<slices; i++) {
      var theta = 2.0*i*Math.PI/slices;
      topPoints.push([radius*Math.sin(theta), top, radius*Math.cos(theta), 1.0]);
      bottomPoints.push([radius*Math.sin(theta), bottom, radius*Math.cos(theta), 1.0]);
    };
    topPoints.push([0.0, top, radius, 1.0]);
    bottomPoints.push([0.0,  bottom, radius, 1.0]);

    if(capsFlag) {

      //top

      for(i=0; i<slices; i++) {
        normal = [0.0, 1.0, 0.0];
        var a = [0.0, top, 0.0, 1.0];
        var b = topPoints[i];
        var c = topPoints[i+1];
        cylinderVertexCoordinates.push([a[0], a[1], a[2], 1.0]);
        cylinderVertexColors.push(topColor);
        cylinderNormals.push(normal);
        cylinderTextureCoordinates.push([0, 1]);

        cylinderVertexCoordinates.push([b[0], b[1], b[2], 1.0]);
        cylinderVertexColors.push(topColor);
        cylinderNormals.push(normal);
        cylinderTextureCoordinates.push([0, 1]);

        cylinderVertexCoordinates.push([c[0], c[1], c[2], 1.0]);
        cylinderVertexColors.push(topColor);
        cylinderNormals.push(normal);
        cylinderTextureCoordinates.push([0, 1]);
      };

      //bottom
      for(i=0; i<slices; i++) {
        normal = [0.0, -1.0, 0.0];
        var a = [0.0, bottom, 0.0, 1.0];
        var b = bottomPoints[i];
        var c = bottomPoints[i+1];
        cylinderVertexCoordinates.push([a[0], a[1], a[2], 1.0]);
        cylinderVertexColors.push(bottomColor);
        cylinderNormals.push(normal);
        cylinderTextureCoordinates.push([0, 1]);

        cylinderVertexCoordinates.push([b[0], b[1], b[2], 1.0]);
        cylinderVertexColors.push(bottomColor);
        cylinderNormals.push(normal);
        cylinderTextureCoordinates.push([0, 1]);

        cylinderVertexCoordinates.push([c[0], c[1], c[2], 1.0]);
        cylinderVertexColors.push(bottomColor);
        cylinderNormals.push(normal);
        cylinderTextureCoordinates.push([0, 1]);
      };

    };

    function translate(x, y, z){
     for(var i=0; i<cylinderVertexCoordinates.length; i++) {
       cylinderVertexCoordinates[i][0] += x;
       cylinderVertexCoordinates[i][1] += y;
       cylinderVertexCoordinates[i][2] += z;
     };
   }

   function scale(sx, sy, sz){
      for(var i=0; i<cylinderVertexCoordinates.length; i++) {
          cylinderVertexCoordinates[i][0] *= sx;
          cylinderVertexCoordinates[i][1] *= sy;
          cylinderVertexCoordinates[i][2] *= sz;
          cylinderNormals[i][0] /= sx;
          cylinderNormals[i][1] /= sy;
          cylinderNormals[i][2] /= sz;
      };
    }

    function radians( degrees ) {
      return degrees * Math.PI / 180.0;
    }

    function rotate( angle, axis) {
      var d = Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]);
      var x = axis[0]/d;
      var y = axis[1]/d;
      var z = axis[2]/d;

      var c = Math.cos( radians(angle) );
      var omc = 1.0 - c;
      var s = Math.sin( radians(angle) );

      var mat = [
          [ x*x*omc + c,   x*y*omc - z*s, x*z*omc + y*s ],
          [ x*y*omc + z*s, y*y*omc + c,   y*z*omc - x*s ],
          [ x*z*omc - y*s, y*z*omc + x*s, z*z*omc + c ]
      ];

      for(var i=0; i<cylinderVertexCoordinates.length; i++) {
            var u = [0, 0, 0];
            var v = [0, 0, 0];
            for( var j =0; j<3; j++)
             for( var k =0 ; k<3; k++) {
                u[j] += mat[j][k]*cylinderVertexCoordinates[i][k];
                v[j] += mat[j][k]*cylinderNormals[i][k];
              };
             for( var j =0; j<3; j++) {
               cylinderVertexCoordinates[i][j] = u[j];
               cylinderNormals[i][j] = v[j];
             };
      };
    }

    data.TriangleVertices = cylinderVertexCoordinates;
    data.TriangleNormals = cylinderNormals;
    data.TriangleVertexColors = cylinderVertexColors;
    data.TextureCoordinates = cylinderTextureCoordinates;
    data.rotate = rotate;
    data.translate = translate;
    data.scale = scale;
    return data;
  }

  function roughTextureMap(texSize){
  //  Bump Data:
      var data = new Array()
      for (var i = 0; i<= texSize; i++)  data[i] = new Array();
      for (var i = 0; i<= texSize; i++) for (var j=0; j<=texSize; j++)
          data[i][j] = Math.random();

  //  Bump Map Normals:
      var normalst = new Array()
      for (var i=0; i<texSize; i++)  normalst[i] = new Array();
      for (var i=0; i<texSize; i++) for ( var j = 0; j < texSize; j++)
          normalst[i][j] = new Array();
      for (var i=0; i<texSize; i++) for ( var j = 0; j < texSize; j++) {
          normalst[i][j][0] = data[i][j]-data[i+1][j];
          normalst[i][j][1] = data[i][j]-data[i][j+1];
          normalst[i][j][2] = 1;
      }

  // Scale to Texture Coordinates..
      for (var i=0; i<texSize; i++) for (var j=0; j<texSize; j++) {
          var d = 0;
          for(k=0;k<3;k++) d+=normalst[i][j][k]*normalst[i][j][k];
          d = Math.sqrt(d);
          for(k=0;k<3;k++) normalst[i][j][k]= 0.5*normalst[i][j][k]/d + 0.5;
      }

      var normals = new Uint8Array(3*texSize*texSize);
      for ( var i = 0; i < texSize; i++ ){
          for ( var j = 0; j < texSize; j++ ) {
                for(var k =0; k<3; k++){
                    normals[3*texSize*i+3*j+k] = 255*normalst[i][j][k];
                }
          }
      }
      return normals;
  }

  function configureTexture( image ) {
      var texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, texSize, texSize, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
  }

  function init() {
//  Inizialization..
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect =  canvas.width/canvas.height;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

//  Load shaders..
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

//  Object computation..
    myObject();

//  Cylinder computation..
    var myCylinder = cylinder(1.2, 0.01, true);
//    myCylinder.scale(1.0, 1.0, 1.0);
    myCylinder.rotate(90.0, [ 0, 0, 1]);
    myCylinder.translate(0.0, 0.0, 4.0);
    cylinderEmissiveColor = vec4(0.5,0.5,0.5,0.5);
    normalsArray = normalsArray.concat(myCylinder.TriangleNormals);
    positionsArray = positionsArray.concat(myCylinder.TriangleVertices);
    cylinderpositions = myCylinder.TriangleVertices.length;

//  bind attribute buffers..
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(tangentsArray), gl.STATIC_DRAW);

    var tangentLoc = gl.getAttribLocation( program, "aTangent");
    gl.vertexAttribPointer(tangentLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(tangentLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var texBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation( program, "aTexCoord");
    gl.vertexAttribPointer( texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    configureTexture(roughTextureMap(texSize));
    gl.uniform1i( gl.getUniformLocation(program, "uTextureMap"), 0);

//  Handle Interactions..
//  Rotation:
    document.getElementById("Axis").onchange = function(event) { axis = event.target.value; };

    document.getElementById("ButtonT").onclick = function(){
      animation = !animation;
      if (animation) {event.target.title = "ON";}
      else {event.target.title = "OFF";}
    };

//  Lights:
    document.getElementById("ButtonR").onclick = function(){
      enabledLights[0] = !enabledLights[0];
    };
    document.getElementById("ButtonG").onclick = function(){
      enabledLights[1] = !enabledLights[1];
    };
    document.getElementById("ButtonB").onclick = function(){
      enabledLights[2] = !enabledLights[2];
    };
    document.getElementById("shading").onchange = function(){
      vertexShading = event.target.value;
      if (vertexShading) texEnabled = false;
    };

//  Texture:
    document.getElementById("ButtonTex").onclick = function(){
      texEnabled = !texEnabled;
      vertexShading = false;
      document.getElementById("shading").value = 0;
    };

//  Viewer Volume:
    document.getElementById("fovySlider").onchange = function(event) { fovy = event.target.value; };
    document.getElementById("zFarSlider").onchange = function(event) { far = event.target.value; };
    document.getElementById("zNearSlider").onchange = function(event) { near = event.target.value; };
//  Camera Position:
    document.getElementById("radius").onchange = function(event) { radius = event.target.value; };
    document.getElementById("beta").onchange = function(event) { beta = event.target.value; };
    document.getElementById("phi").onchange = function(event) { phi = event.target.value; };

//  Render..
    render();

    function render(){
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //  Update the camera position..
      eye = vec3(
        radius*Math.sin(beta)*Math.cos(phi),
        radius*Math.sin(beta)*Math.sin(phi),
        radius*Math.cos(beta)
      );
  //  Link lights parameters..
      for (var i = 0; i<3; i++) {
            gl.uniform1i(gl.getUniformLocation(program, "uLights[" + i + "].enabled"), enabledLights[i]);
            gl.uniform4fv(gl.getUniformLocation(program, "uLights[" + i + "].position"),lightPositions[i]);
            gl.uniform4fv(gl.getUniformLocation(program, "uLights[" + i + "].ambientColor"), lightAmbient[i]);
            gl.uniform4fv(gl.getUniformLocation(program, "uLights[" + i + "].diffuseColor"),  lightDiffuse[i]);
            gl.uniform4fv(gl.getUniformLocation(program, "uLights[" + i + "].specularColor"), lightSpecular[i]);
      }

  //  Compute and Link the ProjectionMatrix..
      projectionMatrix = perspective(fovy, aspect, near, far);
      gl.uniformMatrix4fv( gl.getUniformLocation(program, "uProjectionMatrix"), false, flatten(projectionMatrix));

  //  Compute the modelViewMatrix for the Object..
      if(animation)  theta[axis] += 2.0;
      modelViewMatrix = lookAt(eye, at, up);
      modelViewMatrix = mult(modelViewMatrix,translate1(bar));
      modelViewMatrix = mult(modelViewMatrix, rotateX(theta[0]));
      modelViewMatrix = mult(modelViewMatrix, rotateY(theta[1]));
      modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[2]));
      modelViewMatrix = mult(modelViewMatrix,translate1(negate(bar)));
      gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, flatten(modelViewMatrix));

  //  Compute normalMatrix..
      nMatrix = normalMatrix(modelViewMatrix, true);
      gl.uniformMatrix3fv( gl.getUniformLocation(program, "uNormalMatrix"), false, flatten(nMatrix));

  //  Link Material Parameters of the Object..
      gl.uniform4fv(gl.getUniformLocation(program, "uMaterial.emissiveColor"), vec4(0.0,0.0,0.0,1.0));
      gl.uniform4fv(gl.getUniformLocation(program, "uMaterial.ambientColor"), materialAmbient);
      gl.uniform4fv(gl.getUniformLocation(program, "uMaterial.diffuseColor"), materialDiffuse);
      gl.uniform4fv(gl.getUniformLocation(program, "uMaterial.specularColor"), materialSpecular);
      gl.uniform1f(gl.getUniformLocation(program, "uMaterial.shininess"), materialShininess);

  //  Link boolean controls..
      gl.uniform1i(gl.getUniformLocation(program,"uTexEnabled"), texEnabled);
      gl.uniform1i(gl.getUniformLocation(program,"uVertexShading"), vertexShading);

  //  Draw the Object..
      gl.drawArrays(gl.TRIANGLES, 0, numPositions);

//    Cylinder neon light:
//    Compute and Link modelViewMatrix for the cylinder..
      modelViewMatrix = lookAt(eye, at, up);
      gl.uniformMatrix4fv(gl.getUniformLocation(program, "uModelViewMatrix"), false, flatten(modelViewMatrix));
//    Load Cylinder Material Parameters in the shader..
      gl.uniform4fv(gl.getUniformLocation(program, "uMaterial.emissiveColor"), cylinderEmissiveColor);
      gl.uniform4fv(gl.getUniformLocation(program, "uMaterial.ambientColor"), vec4(0.0,0.0,0.0,0.0));
      gl.uniform4fv(gl.getUniformLocation(program, "uMaterial.diffuseColor"), vec4(1.0,1.0,1.0,1.0));
      gl.uniform4fv(gl.getUniformLocation(program, "uMaterial.specularColor"), vec4(0.0,0.0,0.0,0.0));
      gl.uniform1f(gl.getUniformLocation(program, "uMaterial.shininess"), 0.0);
//    Disable texture..
      gl.uniform1i(gl.getUniformLocation(program,"uTexEnabled"), false);
//    Draw the cylinder..
      gl.drawArrays(gl.TRIANGLES, numPositions, cylinderpositions+numPositions);
      requestAnimationFrame(render);
    }
  }
}
homework1();
