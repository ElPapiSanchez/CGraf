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
  activeCamera;

var geometry, material, mesh;

var distanciaBracoInicial = 10.5, distanciaBracoCurrent = 10.5, headAngle = 0, feetAngle = 0, waistAngle = 0;

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
    new THREE.CubeGeometry(17, 9.2, 8.5),
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

  roda1.rotation.z = -3.1413926 / 2;
  roda2.rotation.z = -3.1413926 / 2;

  roda1.position.set(x + 7, y, z - 3);
  roda2.position.set(x - 7, y, z - 3);

  group.add(roda1);
  group.add(roda2);

  return group;
}

function createArm(leftRight, x, y, z){
  var braco, antebraco, baseTubo, saidaTubo, group;

  var larguraBraco = 3.5,
      comprimentoBraco = 10,
      comprimentoAntebraco = 8.5,
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

  roda1.rotation.z = -3.1413926 / 2;
  roda2.rotation.z = -3.1413926 / 2;

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

function createTrailer(x, y, z){
  "use strict";

  var reboque, roda1, roda2, roda3, roda4, pecaDeLigacao, group;

  const altura = 13, largura = 13, comprimento = 65;

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

  roda1.rotation.z = -3.1413926 / 2;
  roda2.rotation.z = -3.1413926 / 2;
  roda3.rotation.z = -3.1413926 / 2;
  roda4.rotation.z = -3.1413926 / 2;

  reboque.position.set(x, y + altura/2 + 4.5, z);
  roda1.position.set(x + largura / 2 - 1, y + 2.25, z - comprimento/2 + 2.25);
  roda2.position.set(x + largura / 2 - 1, y + 2.25, z - comprimento/2 + 7);
  roda3.position.set(x - largura / 2 + 1, y + 2.25, z - comprimento/2 + 2.25);
  roda4.position.set(x - largura / 2 + 1, y + 2.25, z - comprimento/2 + 7);
  pecaDeLigacao.position.set(x, y + 3.5, z + comprimento/2 + 1);
  group = new THREE.Object3D();
  group.add(reboque);
  group.add(roda1);
  group.add(roda2);
  group.add(roda3);
  group.add(roda4);
  group.add(pecaDeLigacao);
  scene.add(group);
}

function createRobot(x, y, z) {
  "use strict";

  truck = new THREE.Object3D();

  legs = new THREE.Object3D();
  thighs = new THREE.Object3D();

  fullLeg = new THREE.Object3D();

  

  rightArm = createArm(-1, -1 * distanciaBracoInicial, 24.5, 0);
  leftArm = createArm(1, distanciaBracoInicial, 24.5, 0);

  head = giveHead(0,31.5,0);

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
  
  //truck.add(thighs);
  //truck.add(legs);
  //truck.add(feet);

  scene.add(truck);

  truck.position.x = x;
  truck.position.y = y;
  truck.position.z = z;
}

function increaseArm(){
  if(distanciaBracoCurrent < distanciaBracoInicial){
    distanciaBracoCurrent += 0.25;
    rightArm.position.x -= 0.25;
    leftArm.position.x += 0.25;
  }
}

function decreaseArm(){
  if(distanciaBracoCurrent > distanciaBracoInicial - 3.75){
    distanciaBracoCurrent -= 0.25;
    rightArm.position.x += 0.25;
    leftArm.position.x -= 0.25;
  }
}

function increaseHeadRotation(){
  if(headAngle < 60){
    head.rotation.x -= 3.1413926 * ++headAngle * 0.1 / 180;
  }
}

function decreaseHeadRotation(){
  if(headAngle > 0){
    head.rotation.x += 3.1413926 * --headAngle * 0.1 / 180;
  }
  if(headAngle === 0){
    head.rotation.x = 0;
  }
}

function increaseFeetRotation(){
  if(feetAngle < 60){
    feet.rotation.x += 3.1413926 * ++feetAngle * 0.1 / 180;
  }
  if(feetAngle === 60){
    feet.rotation.x = 3.1413926;
  }
}

function decreaseFeetRotation(){
  if(feetAngle > 0){
    feet.rotation.x -= 3.1413926 * --feetAngle * 0.1 / 180;
  }
  if(feetAngle === 0){
    feet.rotation.x = 0;
  }
}

function increaseWaistRotation(){
  if(waistAngle < 41){
    fullLeg.rotation.x += 3.1413926 * ++waistAngle * 0.1 / 180;
  }
  if(waistAngle === 41){
    fullLeg.rotation.x = 3.1413926 / 2;
  }
}

function decreaseWaistRotation(){
  if(waistAngle > 0){
    fullLeg.rotation.x -= 3.1413926 * --waistAngle * 0.1 / 180;
  }
  if(waistAngle === 0){
    fullLeg.rotation.x = 0;
  }
}

function createScene() {
  "use strict";

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0xd3d3d3);

  scene.add(new THREE.AxisHelper(10));

  createRobot(0, 6.5, 0);
  createTrailer(0, 0, -70);
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
      camera.position.set(0, 0, 100);
      break;
    case "side":
      camera.position.set(100, 0, 0);
      break;
    case "top":
      camera.position.set(0, 100, 0);
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
      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.material.wireframe = !node.material.wireframe;
        }
      });
      break;
    case 65: //A
      increaseFeetRotation();
      break;
    case 97: //a
      increaseFeetRotation();
      break;
    case 68: //D
      decreaseArm();
      break;
    case 100: //d
      decreaseArm();
      break;
    case 69: //E
      increaseArm();
      break;
    case 101: //e
      decreaseArm();
      break;
    case 70: //F
      increaseHeadRotation();
      break;
    case 102: //f
      increaseHeadRotation();
      break;
    case 81: //Q
      decreaseFeetRotation();
      break;
    case 113: //q
      decreaseFeetRotation();
      break;
    case 82: //R
      decreaseHeadRotation();
      break;
    case 114: //r
      decreaseHeadRotation();
      break;
    case 83: //S
      increaseWaistRotation();
      break;
    case 113: //s
      increaseWaistRotation();
      break;
    case 80://87: //W
      decreaseWaistRotation();
      break;
    case 112: //119: //w
      decreaseWaistRotation();
      break;
  }
}

function render() {
  "use strict";
  renderer.render(scene, activeCamera);
}

function init() {
  "use strict";
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  createScene();
  perspectiveCamera = createPerspectiveCamera();
  cameraFront = createOrthographicCamera("front");
  cameraSide = createOrthographicCamera("side");
  cameraTop = createOrthographicCamera("top");
  ortographicCamera = createOrthographicCamera("default");

  activeCamera = perspectiveCamera;

  render();

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", onResize);
}

function animate() {
  "use strict";

  /*if (ball.userData.jumping) {
    ball.userData.step += 0.04;
    ball.position.y = Math.abs(30 * Math.sin(ball.userData.step));
    ball.position.z = 13 * Math.cos(ball.userData.step);
  }*/
  render();

  requestAnimationFrame(animate);
}
