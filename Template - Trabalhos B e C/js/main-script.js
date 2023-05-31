//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var perspectiveCamera,
    scene,
    renderer,
    cameraFront,
    cameraSide,
    cameraTop,
    ortographicCamera;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////

function createScene() {
    "use strict";

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0xd3d3d3);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

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
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createSobreiroDescortiçado(x, y, z, height, rotation) {
    const group = new THREE.Group();

    // Criação do tronco
    const trunkGeometry = new THREE.CylinderGeometry(1, 1, height, 32);
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, y, z);
    trunk.rotation.y = rotation;
    group.add(trunk);

    // Criação do ramo secundário
    const branchGeometry = new THREE.CylinderGeometry(0.5, 0.5, height / 2, 32);
    const branchMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const branch = new THREE.Mesh(branchGeometry, branchMaterial);
    branch.position.set(x, y + height / 2, z);
    branch.rotation.y = rotation + Math.PI / 4; // Inclinação oposta ao tronco
    group.add(branch);

    // Criação da copa
    const numEllipsoids = Math.floor(Math.random() * 3) + 1; // Número aleatório de elipsóides
    const crownHeight = height * 0.8; // Altura da copa é proporcional à altura do tronco
    const crownColor = new THREE.Color(0x006400); // Verde-escura
    const crownStep = crownHeight / numEllipsoids;

    for (let i = 0; i < numEllipsoids; i++) {
        const radiusX = Math.random() * 2 + 2; // Raio aleatório em X
        const radiusY = Math.random() * 2 + 2; // Raio aleatório em Y
        const radiusZ = Math.random() * 2 + 2; // Raio aleatório em Z

        const crownGeometry = new THREE.SphereGeometry(radiusX, 32, 32);
        const crownMaterial = new THREE.MeshBasicMaterial({ color: crownColor });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.set(x, y + height + crownStep * i, z);
        group.add(crown);
    }

    return group;
}

// Criação do terreno da Tarefa 2 (não incluído neste exemplo)

// Criação de múltiplas instâncias do sobreiro descortiçado
for (let i = 0; i < 10; i++) {
    const x = Math.random() * 10 - 5; // Posição X aleatória
    const y = 0; // Posição Y no terreno
    const z = Math.random() * 10 - 5; // Posição Z aleatória
    const height = Math.random() * 5 + 5; // Altura aleatória
    const rotation = Math.random() * Math.PI * 2; // Rotação aleatória

    const sobreiro = createSobreiroDescortiçado(x, y, z, height, rotation);
    scene.add(sobreiro);
}
//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
    'use strict';

}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';

}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

}

/////////////
/* DISPLAY */
/////////////

function render() {
    "use strict";
    renderer.render(scene, activeCamera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
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


/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';

}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';

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

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

}