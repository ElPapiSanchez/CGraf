/*global THREE, requestAnimationFrame, console*/

var perspectiveCamera,
    scene,
    renderer,
    cameraFront,
    cameraSide,
    cameraTop,
    ortographicCamera,
    activeCamera,
    OVNI,
    spotLightOvni,
    delta,
    clock,
    controls;

var geometry, material, mesh;

let ovniForward = false,
  ovniBackward = false,
  ovniLeft = false,
  ovniRight = false;


  function createOvni() {

    OVNI = new THREE.Object3D();
    // Esfera achatada para o corpo da nave
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64).scale(15, 3, 15),
      new THREE.MeshPhongMaterial({ color: 0x006600 })
    );
    OVNI.add(body);
  
    // Calote esférica para o cockpit
    const cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(7, 32, 32, 0, 2 * Math.PI, 0, Math.PI / 2),
      new THREE.MeshPhongMaterial({ color: 0xaaaaff })
    );
    cockpit.position.y = 1; // Posicionando o cockpit acima do corpo da nave
    OVNI.add(cockpit);
  
    // Esferas no fundo da nave
    for (let i = 0; i < 8; i++) {
      const smallSphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 16, 16),
        new THREE.MeshPhongMaterial({ color: 0xcccc00 })
      );
      const angle = (i / 8) * Math.PI * 2; // Distribuir as esferas radialmente
      const radius = 12; // Distância do centro da nave
      smallSphere.position.set(
        radius * Math.cos(angle),
        -2,
        radius * Math.sin(angle)
      );
      const pointLight = new THREE.PointLight(0xffff00, 2, 50);
      smallSphere.add(pointLight);
      pointLight.position.y -= 1;
      OVNI.add(smallSphere);
    }
    // Cilindro achatado no centro da parte de baixo da nave
    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.5, 2, 64),
      new THREE.MeshPhongMaterial({ color: 0xcccc00 })
    );
    cylinder.position.y = -2.5;
    OVNI.add(cylinder);
  
    //add spotlight
    spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, -20, 0);
    OVNI.add(spotTarget);
    spotLightOvni = new THREE.SpotLight(0xffff00, 40, 1000);
    cylinder.add(spotLightOvni);
    spotLightOvni.position.set(cylinder.position);
    spotLightOvni.target = spotTarget;
        
    OVNI.position.y = 50;
    scene.add(OVNI);
  }

function createSobreiroDescorticado(x, y, z, height, rotation) {

    var trunks = new THREE.Object3D();
    var mainTrunk = new THREE.Object3D();
    var secTrunk = new THREE.Object3D();
    var tree = new THREE.Object3D();
    var mainLeafs = new THREE.Object3D();
    var secLeafs = new THREE.Object3D();
    var wearHeight =  height / 5;
    var nakedHeight = height * 4 / 5;
    var nakedMaterial = new THREE.MeshPhongMaterial({ color : 0x795C34 });
    var wearMaterial = new THREE.MeshPhongMaterial({ color : 0x3F301D });
    var treeMaterial = new THREE.MeshPhongMaterial({ color : 0x5C9A16 });

    var mainTrunkWear = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2, wearHeight, 32),
        wearMaterial);
    var mainTrunkNaked = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 1.8, nakedHeight, 32),
        nakedMaterial);

    var secTrunkWear = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 1.8, wearHeight, 32),
        wearMaterial);
    var secTrunkNaked = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.5, nakedHeight / 1.5, 32),
        nakedMaterial);

    var mainLeafMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 64, 64).scale(8, 7, 12),
        treeMaterial);
    var secLeafMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1, 64, 64).scale(8, 7, 12),
        treeMaterial);

    mainTrunkWear.position.set(0, nakedHeight / 2, 0);
    mainTrunk.add(mainTrunkWear);
    mainTrunk.add(mainTrunkNaked);
    mainTrunk.position.set(0,nakedHeight/2, 0);

    secTrunkWear.position.set(0, nakedHeight / 1.5 / 2, 0);
    secTrunk.add(secTrunkWear);
    secTrunk.add(secTrunkNaked);
    secTrunk.position.set(0, nakedHeight / 2 , 4);
    secTrunk.rotation.x = Math.PI / 3;

    secLeafMesh.rotation.x = Math.PI/20
    secLeafMesh.position.set(0, height - 2, 4);
    secLeafs.add(secLeafMesh);
    mainLeafMesh.rotation.x = -Math.PI/18
    mainLeafMesh.position.set(0, height + 1, -8);
    mainLeafs.add(mainLeafMesh);

    trunks.add(secTrunk);
    trunks.add(mainTrunk);
    trunks.rotation.x = -Math.PI / 9;
    trunks.position.set(0,-0.5,0);
    tree.add(trunks);
    tree.add(mainLeafs);
    tree.add(secLeafs);
    tree.rotation.y = rotation;
    tree.position.set(x, y, z);
    return tree;
}


function createScene() {
    "use strict";

    scene = new THREE.Scene();

    createOvni();

    scene.background = new THREE.Color(0xd3d3d3);

    for (let i = 0; i < 5; i++) {
        const x = 100 - Math.random() * 200; // Posição X aleatória
        const y = 0; // Posição Y no terreno
        const z = 100 - Math.random() * 200; // Posição Z aleatória
        const height = 20 + 5 * Math.random(); // Altura aleatória
        const rotation = Math.random() * Math.PI * 2; // Rotação aleatória

        const sobreiro = createSobreiroDescorticado(x, y, z, height, rotation);
        scene.add(sobreiro);
    }
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
        case 37: //left
            ovniRight = true;
            break;
        case 38: //up
            ovniForward = true;
            break;
        case 39: //right
            ovniLeft = true;
            break;
        case 40: //down
            ovniBackward = true;
            break;
        case 80: //P
            spotLightOvni.intensity = 1;
            break;
        case 112: //p
            spotLightOvni.intensity = 1;
            break;
        case 83: //S
            spotLightOvni.intensity = 0;
            break;
        case 115: //s
            spotLightOvni.intensity = 0;
            break;
    }
}

function onKeyUp(e) {
    switch (e.keyCode) {
      case 37: //left
        ovniRight = false;
        break;
      case 38: //up
        ovniForward = false;
        break;
      case 39: //right
        ovniLeft = false;
        break;
      case 40: //down
        ovniBackward = false;
        break;
    }
  }

function render() {
    "use strict";
    renderer.render(scene, activeCamera);
}

function checkCollision(){
    "use strict";
    return 0;
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
    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );
    perspectiveCamera = createPerspectiveCamera();
    cameraFront = createOrthographicCamera("front");
    cameraSide = createOrthographicCamera("side");
    cameraTop = createOrthographicCamera("top");
    ortographicCamera = createOrthographicCamera("default");
    activeCamera = perspectiveCamera;
    controls = new THREE.OrbitControls(activeCamera, renderer.domElement);


    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

function animate() {
    "use strict"

    delta = clock.getDelta();

    OVNI.rotation.y += 0.04;

    if (ovniLeft) {
        OVNI.position.x += 0.25 * delta * 100;
    }
    if (ovniRight) {
        OVNI.position.x -= 0.25 * delta * 100;
    }
    if (ovniForward) {
        OVNI.position.z -= 0.25 * delta * 100;
    }
    if (ovniBackward) {
        OVNI.position.z += 0.25 * delta * 100;
    }

    render();

    requestAnimationFrame(animate);
}