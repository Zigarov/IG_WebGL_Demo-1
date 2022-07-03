# Homework1 

Pignata Giovanni 1913547

## 1.

I modified the cube by concatenating it with 2 parallelepipeds in order to have a more complex object of 24 vertices. In order to draw my object, I computed 4 vertex arrays: `positionsArray`, `normalsArray`, `tangentsArray` and `texCoordsArray`. 

Since the object was formed by quadrilateral (each of them was approximated by 2 triangles), in order to compute the normal associated to each vertex, I used the following code:

``` javascript
// These operations are inside the function quad() used to draw 
// a rectangular face of the object.  
var t1 = subtract(vertices[b], vertices[a]);
var t2 = subtract(vertices[c], vertices[b]);
var normal = cross(t1, t2);
normal = vec3(normal[0],normal[1],normal[2]);
	
```

where `vertices[a]`, `vertices[b]`, `vertices[c]` and `vertices[d]`  correspond to the vertices of a single rectangular face. With the vector `t1` I computed the tangents array. 

For the texture coordinates, I used the following code in order to link the extreme vertices of the 64x64 texture that I procedurally created and the vertices of the  to draw: 

```Javascript
// These operations are inside the function quad used to draw 
// a rectangular face of the object.  
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
  ];
var quadIndex = [a,b,c, a,c,d];
var texIndex = [0,1,2 0,2,3];
for(var i = 0; i<6; i++){
    positionsArray.push(vertices[quadIndex[i]]);
    texCoordsArray.push(texCoord[texIndex[i]]);
}
```

## 2. 

In order to compute the barycenter of my geometry I wrote the following simple function: 

```Javascript
function baricentro(){
    var bar4 = vec4(0.0,0.0,0.0,0.0);
    for(var i = 0; i<vertices.length; i++){
      bar4 = add(bar4,vertices[i]);
    }
    var bar3 = vec3(
        bar4[0]/vertices.length, 
        bar4[1]/vertices.length, 
        bar4[2]/vertices.length
    );
    return bar3;
  }
```

and I implemented the rotation along the three axes whit the following transformations on the `modelViewMatrix` (all in the application program):

```Javascript
      modelViewMatrix = mult(modelViewMatrix,translate1(bar));
      modelViewMatrix = mult(modelViewMatrix, rotateX(theta[0]));
      modelViewMatrix = mult(modelViewMatrix, rotateY(theta[1]));
      modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[2]));
      modelViewMatrix = mult(modelViewMatrix,translate1(negate(bar)));
```

## 3.

  I used the `lookAt(eye, at, up)` function to set the camera in a `eye` point in the object space, defined by polar coordinates (`radius`, `beta`, and `phi`).  The camera initially was pointed at the origin of the object space and the up direction was fixed to the y axis. For the purpose of this homework I chose to set these options to constant. So, to compute the `modelViewMatrix` I simply wrote

```javascript
modelViewMatrix = lookAt(eye, at, up);
```

In order to compute the `projectionMatrix`, I used the  `perspective(fovy, aspect, near, far) ` function, which parameters correspond to the **field of view** (angle of vision in the y axis), **aspect ratio** (that I chose to let be equal to the one of the canvas), and the distance of the front and back faces of the **viewing volume**. 

```javascript
projectionMatrix = perspective(fovy, aspect, near, far);
```

## 4. 

For the cylindrical neon light, I modeled the cylinder by slightly modifying the `cylinder(length, radius, caps)` function that I imported from the `geometry.js` file in the book repository on the web and I added it in the scene with the following code: 

```javascript
var myCylinder = cylinder(1.2, 0.01, true);
myCylinder.rotate(90.0, [ 0, 0, 1]);
myCylinder.translate(0.0, 0.0, 4.0);
myCylinderEmissiveColor = vec4(0.5,0.5,0.5,0.5);

normalsArray = normalsArray.concat(myCylinder.TriangleNormals);
positionsArray = positionsArray.concat(myCylinder.TriangleVertices);
```

It is important to note that I chose to use a single script for  the vertex and the fragment shaders, so I managed to modeled first my geometry and then I concatenated the cylinder vertices in the same buffer. 

For the lights, I positioned the three lights (one red, one green, one blue) inside the cylinder (one near the left border, one in the center and the last near the right border). 

I set the emissive property of the cylinder to `(0.5, 0.5, 0.5, 0.5)`.

## 5. 

For the object material I used the following parameters: 

```javascript
  var materialAmbient = vec4(0.3, 0.3, 0.3, 1.0);
  var materialDiffuse = vec4(0.5, 0.5, 0.5, 1.0);
  var materialSpecular = vec4(0.8, 0.8, 0.8, 1.0);
  var materialShininess = 100.0;
```

I used these parameters in the shaders to compute the terms in the illumination equations.

## 6.

I used a boolean variable `uVertexShading` to control the shading system. 

In `true` case,  the vertex-shader compute the terms in the illumination in the variable `vColor` equation and the fragment-shader use the `vColor` as color for the fragment. 

In `false` case, the fragment shader use as input variable from the vertex shader the lights direction `vec3 L[3]`,  the viewer direction `V` and the normal direction `N`, to compute the terms in the illumination equation and set the fragment color. 

With the initial parameters it is possible to see the difference between the per-vertex and per-fragment shading.

## 7. 

I created a procedural normal map that gives the appearance of a rough surface in the function `roughTextureMap`:

This function first compute the **displacement map** (stored in `data`) using the `Math.random()` function to achieve the "rough" characteristic.

Then, it compute the **normal map** by taking differences to approximate the partial derivatives for two of the components and using 1.0 for the third to form the array normals. 

After scaled the data in texture coordinates, it returns the  `Uint8Array normals`. This array was sent to the GPU by building a texture object.  In case of bump texture enabled, the vertex shader first compute the terms of the transformation matrix that will converts representations in the original space to representations in the texture space. 

```glgs
    vec3 T  = normalize(uNormalMatrix*aTangent);
    vec3 M = normalize(uNormalMatrix*aNormal);
    vec3 B = cross(M, T);
```

Then, it use this vector to compute the output variable for the fragment shader described in point 6 (`L[i],V`)

At this point, the fragment-shader takes care of attach the bump texture to the object using the perturbed normals stored in the `uniform sampler2D uTexMap`with the following code:

```
          vec4 MM = texture(uTexMap, vTexCoord);
          M =  normalize(2.0*MM.xyz-1.0);
```

Note that the values in the texture map are scaled back to the interval (−1.0, 1.0). After that it use the `M` vector to compute the terms in the illumination equation as usual. 

