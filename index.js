
import * as THREE from "https://threejs.org/build/three.module.js";
import { GLTFLoader } from "https://threejs.org/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x7e8c8c );

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});
renderer.shadowMap.enabled = true;

// camera

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 3000 );
camera.position.set(-400,250,500);

const controlador = new OrbitControls(camera, renderer.domElement);
controlador.target.set(0, 5, 0);
controlador.update();


// luz global
{
    const skyColor = 0xB1E1FF;
    const groundColor = 0xB97A20;  
    const intensity = 0.5;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
}

// luz direcionada
{
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.castShadow = true;

    light.position.set(200, 600, 200);
    light.target.position.set(0, 0, 0);

    light.shadow.bias = -0.004;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    scene.add(light);
    scene.add(light.target);
    const cam = light.shadow.camera;
    cam.near = 1;
    cam.far = 1000;
    cam.left = -500;
    cam.right = 500;
    cam.top = 500;
    cam.bottom = -500;

    const cameraHelper = new THREE.CameraHelper(cam);
    scene.add(cameraHelper);
    cameraHelper.visible = false;
    const helper = new THREE.DirectionalLightHelper(light, 100);
    scene.add(helper);
    helper.visible = false;
}

// planos de corte
{
  const globalPlanes = [new THREE.Plane( new THREE.Vector3( -1, 0, 0 ), 300.1 ), //direita
                      new THREE.Plane( new THREE.Vector3(  1, 0, 0 ), 300.1 ), //esquerda
                      new THREE.Plane( new THREE.Vector3(  0, 1, 0 ), 5.01 )]; //baixo

renderer.localClippingEnabled = true;
renderer.clippingPlanes = globalPlanes;
}

const loader = new THREE.TextureLoader();

//grama
{
  var texture = loader.load('texturas/grama.jpg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.repeat.set(12, 12);

  var geometry = new THREE.BoxGeometry(600, 10, 450);
  var material = new THREE.MeshPhongMaterial( { map: texture} );
  var cube = new THREE.Mesh( geometry, material );
  cube.position.set(0,0,-75);
  cube.receiveShadow = true;
  cube.castShadow = true;
  scene.add( cube );

  texture.dispose();
  geometry.dispose();
  material.dispose();
}

//asfalto
{
  texture = loader.load('texturas/asfalto.jpg');
  texture.wrapS = THREE.MirroredRepeatWrapping;
  texture.wrapT = THREE.MirroredRepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.repeat.set(6, 2);

  var geometry = new THREE.BoxGeometry(600, 10, 150);
  var material = new THREE.MeshPhongMaterial( {  map: texture} );
  var cube = new THREE.Mesh( geometry, material );
  cube.position.set(0,0,225);
  cube.receiveShadow = true;
  cube.castShadow = true;
  scene.add( cube );

  texture.dispose();
  geometry.dispose();
  material.dispose();
}

//lajota da calcada
{
  var objs = [
    {posicao: [0,5.5,-43], geometria: [80, 0.5, 40]},
    {posicao: [0,5.5,-1], geometria: [80, 0.5, 40]},
    {posicao: [0,5.5,41], geometria: [80, 0.5, 40]},
    {posicao: [0,5.5,83], geometria: [80, 0.5, 40]},
    {posicao: [0,5.5,125], geometria: [80, 0.5, 40]},

    {posicao: [82,5.5,83], geometria: [80, 0.5, 40]},
    {posicao: [164,5.5,83], geometria: [80, 0.5, 40]},
    {posicao: [246,5.5,83], geometria: [80, 0.5, 40]},
    {posicao: [328,5.5,83], geometria: [80, 0.5, 40]},

    {posicao: [-82,5.5,83], geometria: [80, 0.5, 40]},
    {posicao: [-164,5.5,83], geometria: [80, 0.5, 40]},
    {posicao: [-246,5.5,83], geometria: [80, 0.5, 40]},
    {posicao: [-328,5.5,83], geometria: [80, 0.5, 40]},
  ];

  objs.forEach( (obj) => {
    const {posicao, geometria} = obj;

    texture = loader.load('texturas/concreto.jpg');
    texture.magFilter = THREE.NearestFilter;

    var geometry = new THREE.BoxGeometry(geometria[0],geometria[1],geometria[2]);
    var material = new THREE.MeshPhongMaterial( {  map: texture} );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.set(posicao[0],posicao[1],posicao[2]);
    cube.receiveShadow = true;
    cube.castShadow = true;
    scene.add( cube );

    texture.dispose();
    geometry.dispose();
    material.dispose();

  });
}

const gltfLoader = new GLTFLoader();

// carro
let car
{
  gltfLoader.load("models/car/scene.gltf", function ( gltf ) {
    const root = gltf.scene;
    root.scale.set(0.15,0.15,0.15);
    root.position.set(200, 5, 250);
    root.rotation.y = Math.PI * -.5;

    root.traverse((obj) => {
      if (obj.castShadow !== undefined) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    car = root;
    scene.add(root);
      
  },	function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  function ( error ) {
    console.log( 'An error happened' );
});
}

// casa
{
  gltfLoader.load("models/house/scene.gltf", function ( gltf ) {
    const root = gltf.scene;
    root.scale.set(12,12,12);
    root.position.set(0, 4, -150);

    root.traverse((obj) => {
      if (obj.castShadow !== undefined) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    const fix = root.getObjectByName('mesh_0');
    fix.visible = false;
    
    scene.add(root);

  },	function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  function ( error ) {
      console.log( 'An error happened' );
  });
}

//arvores
{
  gltfLoader.load('models/low_poly_trees/scene.gltf', function ( gltf ) {
    const root = gltf.scene;
    root.traverse((obj) => {
      if (obj.castShadow !== undefined) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    const base = new THREE.Object3D();
    scene.add(base);

    const arvore1 = root.getObjectByName('_12_tree');
    arvore1.scale.set(7,7,7);
    arvore1.position.set(270,5,30);
    base.add(arvore1)

    const arvore3 = root.getObjectByName('_6_tree');
    arvore3.scale.set(12,12,12);
    arvore3.position.set(-200,5,-40);
    base.add(arvore3)

    const arvore2 = root.getObjectByName('_3_tree');
    arvore2.scale.set(12,12,12);
    arvore2.position.set(220,5,-250);
    base.add(arvore2)

    const arvore4 = root.getObjectByName('_5_tree');
    arvore4.scale.set(13,13,13);
    arvore4.position.set(250,5,-110);
    arvore4.rotateZ(45);
    base.add(arvore4);

    const arvore5 = root.getObjectByName('_7_tree');
    arvore5.scale.set(13,13,13);
    arvore5.position.set(110,5,5);
    base.add(arvore5);

    const rock = root.getObjectByName('Rock_1_');
    rock.scale.set(5,5,5);
    rock.position.set(-250,5,-240);
    base.add(rock);


  },	function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  function ( error ) {
      console.log( 'An error happened' );
  });
}

//cerca
{
  gltfLoader.load("models/wood_fence_low_poly/scene.gltf", function ( gltf ) {
    const root = gltf.scene;
    root.traverse((obj) => {
      if (obj.castShadow !== undefined) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    root.scale.set(0.15,0.15,0.15);
    root.rotation.y = Math.PI * -.5;

    const base = new THREE.Object3D();
    scene.add(base);

    var objs = [-345, -305, -265, -225, -185, -145, -105, -65,
                65, 105, 145, 185, 225, 265, 305];

    objs.forEach( (obj) => {
      const fence = root.clone();
      fence.position.set(obj,5,47);
      base.add(fence);
    });

  },	function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  function ( error ) {
    console.log( 'An error happened' );
  });
}

// postes
{
  gltfLoader.load('models/street_light/scene.gltf', function ( gltf ) {
    const root = gltf.scene;
    root.traverse((obj) => {
      if (obj.castShadow !== undefined) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    root.scale.set(23,23,23);
    root.position.set(200, 0, 130);
    scene.add(root);
    
    const post2 = root.clone();
    post2.position.set(-200, 0, 130);
    scene.add(post2);

  },	function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  function ( error ) {
    console.log( 'An error happened' );
  });
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width  = canvas.clientWidth  * pixelRatio | 0;
  const height = canvas.clientHeight * pixelRatio | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}


var direcaoAnimada = true;
function animate() {

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  };
  
  if (car) {
    if(direcaoAnimada){
      car.translateZ(4);
      var posi = new THREE.Vector3();
      car.getWorldPosition(posi);
      if(posi.x <= -500){
        car.position.set(-500, 5, 185);
        car.rotation.y = Math.PI * -1.5;
        direcaoAnimada = false;
      }
    }else{
      car.translateZ(4);
      var posi = new THREE.Vector3();
      car.getWorldPosition(posi);
      if(posi.x >= 500){
        car.position.set(500, 5, 260);
        car.rotation.y = Math.PI * -0.5;
        direcaoAnimada = true; 
      }
    }
  }
  
  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}; 
requestAnimationFrame( animate );
