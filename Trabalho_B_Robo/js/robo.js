/*global THREE, requestAnimationFrame, console*/

var perspectiveCamera,
    scene,
    renderer,
    cameraFront,
    cameraSide,
    cameraTop,
    ortographicCamera,
    truck,
    trailer,
    rightArm,
    leftArm,
    legs,
    feet,
    head,
    thighs,
    abdomen,
    torso,
    waist,
    fullLeg,
    clock,
    delta,
    activeCamera;

var geometry, material, mesh;

var distanciaBracoInicial = 10.5
    , distanciaBracoCurrent = 10.5
    , bracoZCurrent = 0
    , globalWireframe = true
    , visibleBBC = true
    , dockingPort = {x: 0, y: 17.75, z: -7}
    , BBCdockingPort = {x: 0, y: 30, z: -35.5}
    , collisionPoint
    , BBCcollisionPoint
    , duration = 100
    , elapsed = 0;

let truckBBC, trailerBBC, truckMax, truckMin, trailerMax, trailerMin;

let trailerForward = false,
    trailerBackward = false,
    trailerLeft = false,
    trailerRight = false,
    armIncrease = false,
    armDecrease = false,
    headIncrease = false,
    headDecrease = false,
    feetIncrease = false,
    feetDecrease = false,
    waistIncrease = false,
    waistDecrease = false,
    truckMode = false,
    together = false,
    animating = false;

function createThigh(leftRight,x,y,z){
  var thigh;
  thigh = new THREE.Mesh(
      new THREE.CubeGeometry(2,5,2.5),
      new THREE.MeshBasicMaterial({color: 0xA8A9AD, wireframe: true})
  );

  thigh.position.set(x + leftRight * 4,y,z);

  return thigh;
}

function giveHead(x,y,z){
  var olho1, olho2, antena1, antena2, cabeca, group;
  cabeca = new THREE.Mesh(
      new THREE.CubeGeometry(4,4,4),
      new THREE.MeshBasicMaterial({color: 0x4682BF, wireframe: true})
  );
  olho1 = new THREE.Mesh(
      new THREE.CubeGeometry(1,0.5,1),
      new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: true})
  );
  olho2 = new THREE.Mesh(
      new THREE.CubeGeometry(1,0.5,1),
      new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: true})
  );
  antena1 = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 2.5, 32),
      new THREE.MeshBasicMaterial({color: 0x4682BF, wireframe: true})
  );
  antena2 = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 2.5, 32),
      new THREE.MeshBasicMaterial({color: 0x4682BF, wireframe: true})
  );


  cabeca.position.set(0,2,0);
  antena1.position.set(2.5,4,0);
  antena2.position.set(-2.5,4,0);
  olho1.position.set(1,3,1.5);
  olho2.position.set(-1,3,1.5);

  group = new THREE.Object3D();
  group.add(cabeca);
  group.add(olho1);
  group.add(olho2);
  group.add(antena1);
  group.add(antena2);

  group.position.set(x,y-2,z);

  return group;
}

function createTorso(x, y, z) {
  var torso;
  torso = new THREE.Mesh(
      new THREE.CubeGeometry(17, 9, 8.5),
      new THREE.MeshBasicMaterial({ color: 0xD92121, wireframe: true })
  );

  torso.position.set(x, y, z);

  return torso;
}

function createAbdomen(x, y, z) {
  var abdomen;
  abdomen = new THREE.Mesh(
      new THREE.CubeGeometry(11, 5, 6),
      new THREE.MeshBasicMaterial({ color: 0xB11226, wireframe: true })
  );

  abdomen.position.set(x, y, z);

  return abdomen;
}

function createWaist(x, y, z) {
  var group = new THREE.Object3D();
  var cintura, roda1, roda2;

  cintura = new THREE.Mesh(
      new THREE.CubeGeometry(17, 4, 2),
      new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: true })
  );
  cintura.position.set(x, y, z);
  group.add(cintura);

  roda1 = new THREE.Mesh(
      new THREE.CylinderGeometry(2.25, 2.25, 2, 32),
      new THREE.MeshBasicMaterial({ color: 0x000001, wireframe: true })
  );
  roda2 = new THREE.Mesh(
      new THREE.CylinderGeometry(2.25, 2.25, 2, 32),
      new THREE.MeshBasicMaterial({ color: 0x000001, wireframe: true })
  );

  roda1.rotation.z = -Math.PI / 2;
  roda2.rotation.z = -Math.PI / 2;

  roda1.position.set(x + 7, y, z - 3);
  roda2.position.set(x - 7, y, z - 3);

  group.add(roda1);
  group.add(roda2);

  return group;
}

function createArm(leftRight, x, y, z){
  var braco, antebraco, baseTubo, saidaTubo, group;

  var larguraBraco = 3.5,
      comprimentoBraco = 9,
      comprimentoAntebraco = 12,
      raioBaseTubo = 1,
      comprimentoBaseTubo = 5,
      raioSaidaTubo = 0.5,
      comprimentoSaidaTubo = 3
  ;

  braco = new THREE.Mesh(
      new THREE.CubeGeometry(larguraBraco, comprimentoBraco, larguraBraco),
      new THREE.MeshBasicMaterial({ color: 0xB11226, wireframe: true})
  );

  antebraco = new THREE.Mesh(
      new THREE.CubeGeometry(larguraBraco, larguraBraco, comprimentoAntebraco),
      new THREE.MeshBasicMaterial({ color: 0xB11226, wireframe: true})
  );

  baseTubo = new THREE.Mesh(
      new THREE.CylinderGeometry(raioBaseTubo, raioBaseTubo, comprimentoBaseTubo, 32),
      new THREE.MeshBasicMaterial({ color: 0xA8A9AD, wireframe: true})
  )

  saidaTubo = new THREE.Mesh(
      new THREE.CylinderGeometry(raioSaidaTubo, raioSaidaTubo, comprimentoSaidaTubo, 32),
      new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: true})
  );

  braco.position.set(x, y, z - comprimentoAntebraco/2 + larguraBraco / 2);
  antebraco.position.set(x, y - (comprimentoBraco / 2 + larguraBraco / 2), z);
  baseTubo.position.set(x + leftRight * (larguraBraco / 2 + raioBaseTubo), y, z - comprimentoAntebraco/2 + larguraBraco / 2);
  saidaTubo.position.set(x + leftRight * (larguraBraco / 2 + raioBaseTubo), y + comprimentoBaseTubo / 2 + comprimentoSaidaTubo / 2, z - comprimentoAntebraco/2 + larguraBraco / 2)

  group = new THREE.Object3D();
  group.add(braco);
  group.add(antebraco);
  group.add(baseTubo);
  group.add(saidaTubo);

  return group;
}

function createLeg(leftRight, x, y, z) {
  var perna, group, roda1, roda2, tanque;
  perna = new THREE.Mesh(
      new THREE.CubeGeometry(4, 13, 4),
      new THREE.MeshBasicMaterial({ color: 0x0047AB, wireframe: true })
  );
  roda1 = new THREE.Mesh(
      new THREE.CylinderGeometry(2.25, 2.25, 2, 32),
      new THREE.MeshBasicMaterial({ color: 0x000001, wireframe: true })
  );
  roda2 = new THREE.Mesh(
      new THREE.CylinderGeometry(2.25, 2.25, 2, 32),
      new THREE.MeshBasicMaterial({ color: 0x000001, wireframe: true })
  );
  tanque = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 3.5, 32),
      new THREE.MeshBasicMaterial({ color: 0xA8A9AD, wireframe: true })
  );

  roda1.rotation.z = -Math.PI / 2;
  roda2.rotation.z = -Math.PI / 2;

  perna.position.set(x, y, z);

  roda1.position.set(x + leftRight * 3, y - 4.25, z);
  roda2.position.set(x + leftRight * 3, y + 0.25, z);
  tanque.position.set(x + leftRight * 3, y + 4.5, z);

  group = new THREE.Object3D();
  group.add(perna);
  group.add(roda1);
  group.add(roda2);
  group.add(tanque);

  return group;
}

function createFeet(x,y,z){
  var pe1, pe2, group;

  pe1 = new THREE.Mesh(
      new THREE.CubeGeometry(4, 2, 2.5),
      new THREE.MeshBasicMaterial({ color: 0x0047AB, wireframe: true })
  );
  pe2 = new THREE.Mesh(
      new THREE.CubeGeometry(4, 2, 2.5),
      new THREE.MeshBasicMaterial({ color: 0x0047AB, wireframe: true })
  );

  pe1.position.set(x,1,1.25);
  pe2.position.set(x * -1,1,1.25);

  group = new THREE.Object3D();

  group.position.set(0,y-6.5,z+2);
  group.add(pe1);
  group.add(pe2);

  return group;
}

function positionSubtraction(pos1, pos2){
  return {
    x: pos1.x - Math.abs(pos2.x), 
    y: pos1.y - Math.abs(pos2.y), 
    z: pos1.z - Math.abs(pos2.z)
  };
}

function positionAddition(pos1, pos2){
  return {
    x: pos1.x + Math.abs(pos2.x), 
    y: pos1.y + Math.abs(pos2.y), 
    z: pos1.z + Math.abs(pos2.z)
  };
}

function createTrailer(x, y, z){
  "use strict";

  var reboque, roda1, roda2, roda3, roda4, pecaDeLigacao;

  const altura = 20, largura = 20, comprimento = 55;

  reboque = new THREE.Mesh(
      new THREE.CubeGeometry(largura, altura, comprimento),
      new THREE.MeshBasicMaterial({ color: 0x666666, wireframe: true})
  );

  roda1 = new THREE.Mesh(
      new THREE.CylinderGeometry(2.25, 2.25, 2, 32),
      new THREE.MeshBasicMaterial({ color: 0x000001, wireframe: true })
  );

  roda2 = new THREE.Mesh(
      new THREE.CylinderGeometry(2.25, 2.25, 2, 32),
      new THREE.MeshBasicMaterial({ color: 0x000001, wireframe: true })
  );

  roda3 = new THREE.Mesh(
      new THREE.CylinderGeometry(2.25, 2.25, 2, 32),
      new THREE.MeshBasicMaterial({ color: 0x000001, wireframe: true })
  );

  roda4 = new THREE.Mesh(
      new THREE.CylinderGeometry(2.25, 2.25, 2, 32),
      new THREE.MeshBasicMaterial({ color: 0x000001, wireframe: true })
  );

  pecaDeLigacao = new THREE.Mesh(
      new THREE.CubeGeometry(2, 2, 4),
      new THREE.MeshBasicMaterial({ color: 0x86af7b, wireframe: true})
  );

  roda1.rotation.z = -Math.PI / 2;
  roda2.rotation.z = -Math.PI / 2;
  roda3.rotation.z = -Math.PI / 2;
  roda4.rotation.z = -Math.PI / 2;

  reboque.position.set(x, y + altura/2 + 4.5, z);
  roda1.position.set(x + largura / 2 - 1, y + 2.25, z - comprimento/2 + 2.25);
  roda2.position.set(x + largura / 2 - 1, y + 2.25, z - comprimento/2 + 7);
  roda3.position.set(x - largura / 2 + 1, y + 2.25, z - comprimento/2 + 2.25);
  roda4.position.set(x - largura / 2 + 1, y + 2.25, z - comprimento/2 + 7);
  pecaDeLigacao.position.set(x, y + 3.5, z + comprimento/2 + 1);
  trailer = new THREE.Object3D();
  trailer.add(reboque);
  trailer.add(roda1);
  trailer.add(roda2);
  trailer.add(roda3);
  trailer.add(roda4);
  trailer.add(pecaDeLigacao);

  scene.add(trailer);

  trailer.position.x = x;
  trailer.position.y = y + 17.75;
  trailer.position.z = z;

  var geometry = new THREE.CubeGeometry(largura, altura + 4.5, comprimento + 3);
  trailerBBC = new THREE.Mesh(geometry,
      new THREE.MeshBasicMaterial({ color: 0xFFF000, wireframe: true, visible: visibleBBC}));
  trailerBBC.position.set(x, y + 30, z - comprimento/2 - 1);
  trailerMin = positionSubtraction(trailerBBC.position, trailerBBC.geometry.vertices[6]);
  trailerMax = positionAddition(trailerBBC.position, trailerBBC.geometry.vertices[0]);
  scene.add(trailerBBC);
}

function createRobot(x, y, z) {
  "use strict";

  truck = new THREE.Object3D();

  legs = new THREE.Object3D();
  thighs = new THREE.Object3D();

  fullLeg = new THREE.Object3D();

  rightArm = createArm(-1, -1 * distanciaBracoInicial, 25, 3.5/2);
  leftArm = createArm(1, distanciaBracoInicial, 25, 3.5/2);

  head = giveHead(0,31,0);

  torso = createTorso(0, 25, 0);
  abdomen = createAbdomen(0, 18, 0);
  waist = createWaist(0, 13.5, 1);

  legs.add(createLeg(-1, -4, 0 - 13.5, 0));
  legs.add(createLeg(1, 4, 0 - 13.5, 0));

  thighs.add(createThigh(-1, 0, 9 - 13.5, 0));
  thighs.add(createThigh(1, 0, 9 - 13.5, 0));

  feet = createFeet(4,0 - 13.5,0);

  fullLeg.position.set(0,13.5,0);

  fullLeg.add(legs);
  fullLeg.add(thighs);
  fullLeg.add(feet);

  truck.add(head);

  truck.add(torso);
  truck.add(leftArm);
  truck.add(rightArm);
  truck.add(abdomen);
  truck.add(waist);
  truck.add(fullLeg);

  scene.add(truck);

  truck.position.x = x;
  truck.position.y = y;
  truck.position.z = z;

  truckBBC = new THREE.Mesh(new THREE.CubeGeometry(22, 20, 27),
      new THREE.MeshBasicMaterial({ color: 0xFFF000, wireframe: true, visible: visibleBBC}));
  truckBBC.position.set(x, 27.5, z-9);
  truckMin = positionSubtraction(truckBBC.position, truckBBC.geometry.vertices[6]);
  truckMax = positionAddition(truckBBC.position, truckBBC.geometry.vertices[0]);
  scene.add(truckBBC);
}

function increaseArm(){
  if(distanciaBracoCurrent < distanciaBracoInicial){
    distanciaBracoCurrent += 0.25 * delta * 20;
    rightArm.position.x -= 0.25 * delta * 20;
    leftArm.position.x += 0.25 * delta * 20;
  }
  else if (bracoZCurrent < 0){
    bracoZCurrent += 0.25 * delta * 20;
    rightArm.position.z += 0.25 * delta * 20;
    leftArm.position.z += 0.25 * delta * 20;
  }
}

function decreaseArm(){
  if (bracoZCurrent > -3.5){
    bracoZCurrent -= 0.25 * delta * 20;
    rightArm.position.z -= 0.25 * delta * 20;
    leftArm.position.z -= 0.25 * delta * 20;
  }
  else if(distanciaBracoCurrent > distanciaBracoInicial - 3.75){
    distanciaBracoCurrent -= 0.25 * delta * 20;
    rightArm.position.x += 0.25 * delta * 20;
    leftArm.position.x -= 0.25 * delta * 20;
  }
}

function increaseHeadRotation(){
  if(-head.rotation.x < Math.PI){
    head.rotation.x -= (Math.PI / 32) * delta * 20;
  }
}

function decreaseHeadRotation(){
  if(-head.rotation.x > 0){
    head.rotation.x += (Math.PI / 32) * delta * 20;
  }
}

function increaseFeetRotation(){
  if(feet.rotation.x < Math.PI){
    feet.rotation.x += (Math.PI / 32) * delta * 20;
  }
}

function decreaseFeetRotation(){
  if(feet.rotation.x > 0){
    feet.rotation.x -= (Math.PI / 32) * delta * 20;
  }
}

function increaseWaistRotation(){
  if(fullLeg.rotation.x < Math.PI / 2){
    fullLeg.rotation.x += (Math.PI / 32) * delta * 20;
  }
}

function decreaseWaistRotation(){
  if(fullLeg.rotation.x > 0){
    fullLeg.rotation.x -= (Math.PI / 32) * delta * 20;
  }
}

function createScene() {
  "use strict";

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0xd3d3d3);

  createRobot(0, 6.5, 0);
  createTrailer(0, 0, -30);
}

function createPerspectiveCamera() {
  "use strict";
  var perspectiveCamera;

  perspectiveCamera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      1000
  );
  perspectiveCamera.position.x = 50;
  perspectiveCamera.position.y = 50;
  perspectiveCamera.position.z = 50;
  perspectiveCamera.lookAt(scene.position);

  return perspectiveCamera;
}

function createOrthographicCamera(place) {
  "use strict";
  var camera;

  camera = new THREE.OrthographicCamera(
      window.innerWidth / -16,
      window.innerWidth / 16,
      window.innerHeight / 16,
      window.innerHeight / -16,
      1,
      1000
  );

  switch (place) {
    case "front":
      camera.position.set(0, 0, 200);
      break;
    case "side":
      camera.position.set(200, 0, 0);
      break;
    case "top":
      camera.position.set(0, 200, 0);
      break;
    case "default":
      camera.position.set(50, 50, 50);
      break;
  }

  camera.lookAt(scene.position);
  return camera;
}

function onResize() {
  "use strict";

  renderer.setSize(window.innerWidth, window.innerHeight);

  if (window.innerHeight > 0 && window.innerWidth > 0) {
    perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
    perspectiveCamera.updateProjectionMatrix();
  }
}

function onKeyDown(e) {
  "use strict";

  switch (e.keyCode) {
    case 49: // 1 key
      activeCamera = cameraFront;
      break;
    case 50: // 2 key
      activeCamera = cameraSide;
      break;
    case 51: // 3 key
      activeCamera = cameraTop;
      break;
    case 52: // 4 key
      activeCamera = ortographicCamera;
      break;
    case 53: // 5 key
      activeCamera = perspectiveCamera;
      break;
    case 54: // 6 key
      globalWireframe = !globalWireframe;
      visibleBBC = !visibleBBC;

      feet.children[0].material.wireframe = globalWireframe;
      feet.children[1].material.wireframe = globalWireframe;

      legs.children[0].children[0].material.wireframe = globalWireframe;
      legs.children[0].children[1].material.wireframe = globalWireframe;
      legs.children[0].children[2].material.wireframe = globalWireframe;
      legs.children[0].children[3].material.wireframe = globalWireframe;
      legs.children[1].children[0].material.wireframe = globalWireframe;
      legs.children[1].children[1].material.wireframe = globalWireframe;
      legs.children[1].children[2].material.wireframe = globalWireframe;
      legs.children[1].children[3].material.wireframe = globalWireframe;

      thighs.children[0].material.wireframe = globalWireframe;
      thighs.children[1].material.wireframe = globalWireframe;

      waist.children[0].material.wireframe = globalWireframe;
      waist.children[1].material.wireframe = globalWireframe;
      waist.children[2].material.wireframe = globalWireframe;

      abdomen.material.wireframe = globalWireframe;

      torso.material.wireframe = globalWireframe;

      rightArm.children[0].material.wireframe = globalWireframe;
      rightArm.children[1].material.wireframe = globalWireframe;
      rightArm.children[2].material.wireframe = globalWireframe;
      rightArm.children[3].material.wireframe = globalWireframe;

      leftArm.children[0].material.wireframe = globalWireframe;
      leftArm.children[1].material.wireframe = globalWireframe;
      leftArm.children[2].material.wireframe = globalWireframe;
      leftArm.children[3].material.wireframe = globalWireframe;

      head.children[0].material.wireframe = globalWireframe;
      head.children[1].material.wireframe = globalWireframe;
      head.children[2].material.wireframe = globalWireframe;
      head.children[3].material.wireframe = globalWireframe;
      head.children[4].material.wireframe = globalWireframe;

      trailer.children[0].material.wireframe = globalWireframe;
      trailer.children[1].material.wireframe = globalWireframe;
      trailer.children[2].material.wireframe = globalWireframe;
      trailer.children[3].material.wireframe = globalWireframe;
      trailer.children[4].material.wireframe = globalWireframe;
      trailer.children[5].material.wireframe = globalWireframe;

      truckBBC.material.visible = visibleBBC;
      trailerBBC.material.visible = visibleBBC;

      break;
    case 65: //A
      feetIncrease = true;
      break;
    case 97: //a
      feetIncrease = true;
      break;
    case 68: //D
      armDecrease = true;
      break;
    case 100: //d
      armDecrease = true;
      break;
    case 69: //E
      armIncrease = true;
      break;
    case 101: //e
      armIncrease = true;
      break;
    case 70: //F
      headIncrease = true;
      break;
    case 102: //f
      headIncrease = true;
      break;
    case 81: //Q
      feetDecrease = true;
      break;
    case 113: //q
      feetDecrease = true;
      break;
    case 82: //R
      headDecrease = true;
      break;
    case 114: //r
      headDecrease = true;
      break;
    case 37: //left
      trailerRight = true;
      break;
    case 38: //up
      trailerForward = true;
      break;
    case 39: //right
      trailerLeft = true;
      break;
    case 40: //down
      trailerBackward = true;
      break;
    case 83: //S
      waistIncrease = true;
      break;
    case 115: //s
      waistIncrease = true;
      break;
    case 87: //W
      waistDecrease = true;
      break;
    case 119: //w
      waistDecrease = true;
      break;
  }
}

function onKeyUp(e){
  switch (e.keyCode){
    case 65: //A
      feetIncrease = false;
      break;
    case 97: //a
      feetIncrease = false;
      break;
    case 70: //F
      headIncrease = false;
      break;
    case 102: //f
      headIncrease = false;
      break;
    case 81: //Q
      feetDecrease = false;
      break;
    case 113: //q
      feetDecrease = false;
      break;
    case 82: //R
      headDecrease = false;
      break;
    case 114: //r
      headDecrease = false;
      break;
    case 68: //D
      armDecrease = false;
      break;
    case 100: //d
      armDecrease = false;
      break;
    case 69: //E
      armIncrease = false;
      break;
    case 101: //e
      armIncrease = false;
      break;
    case 37: //left
      trailerRight = false;
      break;
    case 38: //up
      trailerForward = false;
      break;
    case 39: //right
      trailerLeft = false;
      break;
    case 40: //down
      trailerBackward = false;
      break;
    case 83: //S
      waistIncrease = false;
      break;
    case 115: //s
      waistIncrease = false;
      break;
    case 87: //W
      waistDecrease = false;
      break;
    case 119: //w
      waistDecrease = false;
      break;
  }
}

function render() {
  "use strict";
  renderer.render(scene, activeCamera);
}

function checkCollision(){
  "use strict";
  return (trailerMax.x >= truckMin.x 
    && trailerMin.x <= truckMax.x 
    && trailerMax.y >= truckMin.y
    && trailerMin.y <= truckMax.y
    && trailerMax.z >= truckMin.z
    && trailerMin.z <= truckMax.z);
}

function init() {
  "use strict";
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  createScene();
  perspectiveCamera = createPerspectiveCamera();
  cameraFront = createOrthographicCamera("front");
  cameraSide = createOrthographicCamera("side");
  cameraTop = createOrthographicCamera("top");
  ortographicCamera = createOrthographicCamera("default");

  activeCamera = perspectiveCamera;

  render();

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("resize", onResize);
}

function animate() {
  "use strict";
  delta = clock.getDelta();

  if(!animating){
    duration = 100;
    elapsed = 0;
    if (trailerLeft) {
      trailer.position.x += 0.25 * delta * 20;
      trailerBBC.position.x += 0.25 * delta * 20;
      trailerMin.x += 0.25 * delta * 20;
      trailerMax.x += 0.25 * delta * 20;
    }
    if (trailerRight) {
      trailer.position.x -= 0.25 * delta * 20;
      trailerBBC.position.x -= 0.25 * delta * 20;
      trailerMin.x -= 0.25 * delta * 20;
      trailerMax.x -= 0.25 * delta * 20;
    }
    if (trailerForward) {
      trailer.position.z += 0.25 * delta * 20;
      trailerBBC.position.z += 0.25 * delta * 20;
      trailerMin.z += 0.25 * delta;
      trailerMax.z += 0.25 * delta * 20;
    }
    if (trailerBackward) {
      trailer.position.z -= 0.25 * delta * 20;
      trailerBBC.position.z -= 0.25 * delta * 20;
      trailerMin.z -= 0.25 * delta * 20;
      trailerMax.z -= 0.25 * delta * 20;
    }
  
    if (armIncrease) increaseArm();
    if (armDecrease) decreaseArm();
  
    if (headIncrease) increaseHeadRotation();
    if (headDecrease) decreaseHeadRotation();
  
    if (feetIncrease) increaseFeetRotation();
    if (feetDecrease) decreaseFeetRotation();
  
    if (waistIncrease) increaseWaistRotation();
    if (waistDecrease) decreaseWaistRotation();

    truckMode = (distanciaBracoCurrent <= distanciaBracoInicial - 3.75) &&
        (-head.rotation.x >= Math.PI) &&
        (feet.rotation.x >= Math.PI) &&
        (fullLeg.rotation.x >= Math.PI / 2);
    trailer.children[0].material.color.r = 0.4;
    trailer.children[0].material.color.g = 0.4;
    trailer.children[0].material.color.b = 0.4;
    if(checkCollision() && truckMode && !together){
      trailer.children[0].material.color.r = 1;
      trailer.children[0].material.color.g = 1;
      trailer.children[0].material.color.b = 1;
      animating = true;
      collisionPoint = trailer.position;
      BBCcollisionPoint = trailerBBC.position;
    }
    if(together && !checkCollision()){
      together = false;
    }
    if(together && !truckMode){
      together = false;
    }
  }
  else{
    const t = Math.min(1, elapsed / duration);
    trailer.position.set(collisionPoint.x + (dockingPort.x - collisionPoint.x) * t
        , collisionPoint.y + (dockingPort.y - collisionPoint.y) * t
        , collisionPoint.z + (dockingPort.z - collisionPoint.z) * t);
    trailerBBC.position.set(BBCcollisionPoint.x + (BBCdockingPort.x - BBCcollisionPoint.x) * t
        , BBCcollisionPoint.y + (BBCdockingPort.y - BBCcollisionPoint.y) * t
        , BBCcollisionPoint.z + (BBCdockingPort.z - BBCcollisionPoint.z) * t);
    if(!(t < 1)){
      animating = false;
      together = true;
      truckMin = positionSubtraction(truckBBC.position, truckBBC.geometry.vertices[6]);
      truckMax = positionAddition(truckBBC.position, truckBBC.geometry.vertices[0]);
      trailerMin = positionSubtraction(trailerBBC.position, trailerBBC.geometry.vertices[6]);
      trailerMax = positionAddition(trailerBBC.position, trailerBBC.geometry.vertices[0]);
    }
    elapsed += 0.5;
  }
  render();

  requestAnimationFrame(animate);
}