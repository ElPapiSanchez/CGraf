/*global THREE, requestAnimationFrame, console*/

var perspectiveCamera,
    scene,
    renderer,
    cameraFront,
    cameraSide,
    cameraTop,
    ortographicCamera,
    activeCamera,
    clock;

var geometry, material, mesh;

function createSobreiroDescorticado(x, y, z, height, rotation) {
    const mainTrunk = new THREE.Object3D();
    const secTrunk = new THREE.Object3D();
    const fullTrunk = new THREE.Object3D();
    const trunkHeight = height / 3.5;
    const secSmallTrunkHeight = height / 2;
    const secTrunkHeight = trunkHeight;

    // Criação do tronco
    const trunkGeometry = new THREE.CylinderGeometry(1, 1, trunkHeight, 32);
    const secTrunkGeometry = new THREE.CylinderGeometry(1, 1, secTrunkHeight, 32);
    const secSmallTrunkGeometry = new THREE.CylinderGeometry(0.8, 0.8, secSmallTrunkHeight, 32);
    const smallTrunkGeometry = new THREE.CylinderGeometry(0.8, 0.8, height, 32);
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    const smallTrunk = new THREE.Mesh(smallTrunkGeometry, trunkMaterial);

    smallTrunk.position.set(x, y , z);
    trunk.position.set(x, y + height / 2 + trunkHeight / 2, z);
    mainTrunk.add(trunk);
    mainTrunk.add(smallTrunk);

    const secondaryTrunk = new THREE.Mesh(secTrunkGeometry, trunkMaterial);
    const secondarySmallTrunk = new THREE.Mesh(secSmallTrunkGeometry, trunkMaterial);

    secondarySmallTrunk.position.set(x, y + 4, z);
    secondaryTrunk.position.set( x, 4 + secSmallTrunkHeight / 2 + secTrunkHeight / 2, z);
    trunk.rotation.y = rotation;
    secTrunk.add(secondaryTrunk);
    secTrunk.add(secondarySmallTrunk);
    secTrunk.rotation.x = -Math.PI/3;

    fullTrunk.add(mainTrunk);
    fullTrunk.add(secTrunk);
    //fullTrunk.rotation.x = Math.PI/6;


    // Criação do ramo secundário
    /*
    const branchGeometry = new THREE.CylinderGeometry(0.5, 0.5, height / 2, 32);
    const branchMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const branch = new THREE.Mesh(branchGeometry, branchMaterial);
    branch.position.set(x, y + height / 2, z);
    branch.rotation.y = rotation + Math.PI / 4; // Inclinação oposta ao tronco
    group.add(branch);*/

    // Criação da copa
    /*
    const numEllipsoids = Math.floor(Math.random() * 3) + 1; // Número aleatório de elipsóides
    const crownHeight = height * 0.8; // Altura da copa é proporcional à altura do tronco
    const crownColor = new THREE.Color(0x006400); // Verde-escura
    const crownStep = crownHeight / numEllipsoids;

    for (let i = 0; i < numEllipsoids; i++) {
        const radiusX = Math.random() * 2 + 2; // Raio aleatório em X

        const crownGeometry = new THREE.SphereGeometry(radiusX, 32, 32);
        const crownMaterial = new THREE.MeshBasicMaterial({ color: crownColor });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.set(x, y + height + crownStep * i, z);
        group.add(crown);
    }*/

    return fullTrunk;
}


function createScene() {
    "use strict";

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0xd3d3d3);

    for (let i = 0; i < 1; i++) {
        const x = Math.random() * 10 - 5; // Posição X aleatória
        const y = 0; // Posição Y no terreno
        const z = Math.random() * 10 - 5; // Posição Z aleatória
        const height = Math.random() * 5 + 5; // Altura aleatória
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

    }
}

function onKeyUp(e){
    switch (e.keyCode){
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

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

function animate() {
    "use strict"

    render();

    requestAnimationFrame(animate);
}