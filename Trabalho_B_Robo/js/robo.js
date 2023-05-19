/*global THREE, requestAnimationFrame, console*/

var perspectiveCamera,
  scene,
  renderer,
  cameraFront,
  cameraSide,
  cameraTop,
  ortographicCamera,
  truck,
  leftLeg,
  rightLeg,
  legs,
  feet,
  head,
  thighs,
  abdomen,
  torso,
  waist,
  activeCamera;

var geometry, material, mesh;

function createThigh(leftRight,x,y,z){
  var thigh;
  thigh = new THREE.Mesh(
    new THREE.CubeGeometry(2,5,2.5),
    new THREE.MeshBasicMaterial({color: 0x808080, wireframe: true})
  );

  thigh.position.set(x + leftRight * 4,y,z);

  return thigh;
}

function createHead(x,y,z){
  var olho1, olho2, antena1, antena2, cabeca, group;
  cabeca = new THREE.Mesh(
    new THREE.CubeGeometry(4,4,4),
    new THREE.MeshBasicMaterial({color: 0x0000ff, wireframe: true})
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
    new THREE.MeshBasicMaterial({color: 0x0000ff, wireframe: true})
  );
  antena2 = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 2.5, 32),
    new THREE.MeshBasicMaterial({color: 0x0000ff, wireframe: true})
  );

  cabeca.position.set(x,y,z);
  antena1.position.set(x+2.5,y+2,z);
  antena2.position.set(x-2.5,y+2,z);
  olho1.position.set(x+1,y+1,z+1.5);
  olho2.position.set(x-1,y+1,z+1.5);

  group = new THREE.Object3D();
  group.add(cabeca);
  group.add(olho1);
  group.add(olho2);
  group.add(antena1);
  group.add(antena2);

  return group;
}

function createTorso(x, y, z) {
  var torso;
  torso = new THREE.Mesh(
    new THREE.CubeGeometry(17, 9, 6),
    new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
  );

  torso.position.set(x, y, z);

  return torso;
}

function createAbdomen(x, y, z) {
  var abdomen;
  abdomen = new THREE.Mesh(
    new THREE.CubeGeometry(11, 5, 6),
    new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
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

  roda1.rotation.z = -3.1415926 / 2;
  roda2.rotation.z = -3.1415926 / 2;

  roda1.position.set(x + 7, y, z - 3);
  roda2.position.set(x - 7, y, z - 3);

  group.add(roda1);
  group.add(roda2);

  return group;
}

function createLeg(leftRight, x, y, z) {
  var pe, perna, group, roda1, roda2, tanque;
  pe = new THREE.Mesh(
    new THREE.CubeGeometry(4, 2, 2.5),
    new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
  );
  perna = new THREE.Mesh(
    new THREE.CubeGeometry(4, 13, 4),
    new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
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
    new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: true })
  );

  roda1.rotation.z = -3.1415926 / 2;
  roda2.rotation.z = -3.1415926 / 2;

  perna.position.set(x, y, z);
  pe.position.set(x, y - 5.5, z + 3.25);

  roda1.position.set(x + leftRight * 3, y - 4.25, z);
  roda2.position.set(x + leftRight * 3, y + 0.25, z);
  tanque.position.set(x + leftRight * 3, y + 4.5, z);

  group = new THREE.Object3D();
  group.add(pe);
  group.add(perna);
  group.add(roda1);
  group.add(roda2);
  group.add(tanque);

  return group;
}

function createTruck(x, y, z) {
  "use strict";

  truck = new THREE.Object3D();
  legs = new THREE.Object3D();
  thighs = new THREE.Object3D();

  legs.add(createLeg(-1, -4, 0, 0));
  legs.add(createLeg(1, 4, 0, 0));

  head = createHead(0,35,0);

  thighs.add(createThigh(-1, 0, 9, 0));
  thighs.add(createThigh(1, 0, 9, 0));

  truck.add(legs);
  truck.add(head);
  truck.add(thighs);

  abdomen = createAbdomen(0, 19.5, 0);
  truck.add(abdomen);

  torso = createTorso(0, 26.5, 0);
  truck.add(torso);

  waist = createWaist(0, 15, 2);
  truck.add(waist);

  scene.add(truck);

  truck.position.x = x;
  truck.position.y = y;
  truck.position.z = z;
}

function createScene() {
  "use strict";

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0xd3d3d3);

  scene.add(new THREE.AxisHelper(10));

  createTruck(0, 8, 0);
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
    case 97: //a
      break;
    case 69: //E
    case 101: //e
      scene.traverse(function (node) {
        if (node instanceof THREE.AxisHelper) {
          node.visible = !node.visible;
        }
      });
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
    ball.position.z = 15 * Math.cos(ball.userData.step);
  }*/
  render();

  requestAnimationFrame(animate);
}
