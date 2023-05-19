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
  activeCamera;

var geometry, material, mesh;

function addTableLeg(obj, x, y, z) {
  "use strict";

  geometry = new THREE.CubeGeometry(2, 6, 2);
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y - 3, z);
  obj.add(mesh);
}

function addTableTop(obj, x, y, z) {
  "use strict";
  geometry = new THREE.CubeGeometry(60, 2, 20);
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function createTable(x, y, z) {
  "use strict";

  var table = new THREE.Object3D();

  material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

  addTableTop(table, 0, 0, 0);
  addTableLeg(table, -25, -1, -8);
  addTableLeg(table, -25, -1, 8);
  addTableLeg(table, 25, -1, 8);
  addTableLeg(table, 25, -1, -8);

  scene.add(table);

  table.position.x = x;
  table.position.y = y;
  table.position.z = z;
}

function createHead(x,y,z){
  var olho1, olho2, antena1, antena2, cabeca, group;
  cabeca = new THREE.Mesh(
    new THREE.CubeGeometry(4,4,4),
    new THREE.MeshBasicMaterial({color: 0x0000ff, wireframe: false})
  );
  olho1 = new THREE.Mesh(
    new THREE.CubeGeometry(1,0.5,1),
    new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: false})
  );
  olho2 = new THREE.Mesh(
    new THREE.CubeGeometry(1,0.5,1),
    new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: false})
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

function createLeg(leftRight, x, y, z) {
  var pe, perna, group, roda1, roda2, tanque;
  pe = new THREE.Mesh(
    new THREE.CubeGeometry(4, 2, 2.5),
    new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: false })
  );
  perna = new THREE.Mesh(
    new THREE.CubeGeometry(4, 13, 4),
    new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: false })
  );
  roda1 = new THREE.Mesh(
    new THREE.CylinderGeometry(2.25, 2.25, 2, 32),
    new THREE.MeshBasicMaterial({ color: 0x000001, wireframe: false })
  );
  roda2 = new THREE.Mesh(
    new THREE.CylinderGeometry(2.25, 2.25, 2, 32),
    new THREE.MeshBasicMaterial({ color: 0x000001, wireframe: false })
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

  legs.add(createLeg(-1, -4, 0, 0));
  legs.add(createLeg(1, 4, 0, 0));

  truck.add(legs);

  head = createHead(0,15,0);

  truck.add(head);
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
    case 65: //A
    case 97: //a
      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.material.wireframe = !node.material.wireframe;
        }
      });
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
