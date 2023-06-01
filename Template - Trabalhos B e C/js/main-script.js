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
    moonLight,
    delta,
    clock,
    controls;

var geometry, material, mesh, globalWireframe = false;

let ovniForward = false,
  ovniBackward = false,
  ovniLeft = false,
  ovniRight = false,
  ovniPointLightArray = [],
  moonLightOn = true,
  ovniSpotLightOn = true,
  ovniPointLightsOn = true;

function toggleMoonLight() {
    if(moonLightOn) moonLight.intensity = 0;
    else moonLight.intensity = 0.5;
    moonLightOn = !moonLightOn;
}

function toggleOvniSpotLight() {
    if(ovniSpotLightOn) spotLightOvni.intensity = 0;
    else spotLightOvni.intensity = 6;
    ovniSpotLightOn = !ovniSpotLightOn;
}

function toggleOvniPointLights() {
    if(ovniPointLightsOn) {
        for (let i = 0; i < 8; i++) {
            ovniPointLightArray[i].intensity = 0;
        }
    }
    else {
        for (let i = 0; i < 8; i++) {
            ovniPointLightArray[i].intensity = 2;
        }
    }
    ovniPointLightsOn = !ovniPointLightsOn;
}

function createTerrain() {

    var loader = new THREE.TextureLoader();
    loader.load('https://web.tecnico.ulisboa.pt/~ist146643/cg/dagoba/map.png', function(texture) {
  
        var geometry = new THREE.PlaneGeometry(1100,1100,100,100);
        
        var canvas = document.createElement('canvas');
        canvas.height = 1081;
        canvas.width = 1081;
        var context = canvas.getContext('2d'); 
        context.drawImage(texture.image, 0, 0, texture.image.width, texture.image.height, 0, 0, texture.image.width, texture.image.height);
        var data = context.getImageData(0, 0, texture.image.width, texture.image.height).data;
        var textureWidth = texture.image.width;
        var textureHeight = texture.image.height;
    
        for (var i = 0; i < geometry.getAttribute('position').count; i++) {
            var v = geometry.getAttribute('uv').array[i*2+1];
            var u = geometry.getAttribute('uv').array[i*2];
            let row = Math.min(Math.floor(textureHeight*v), textureHeight-1)*4;
            let col = Math.min(Math.floor(textureWidth*u), textureWidth-1)*4;
            var z = data[row*textureWidth+col+1]/255.0*255-55;
            geometry.getAttribute('position').array[i*3+2] = z;
        }
    
        var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0x00bb00, map: texture}));
        mesh.rotation.x = -Math.PI/2;
        mesh.position.y += 10;
        scene.add(mesh);
    });
}

function createOvni() {

    OVNI = new THREE.Object3D();
    // Esfera achatada para o corpo da nave
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64).scale(15, 3, 15),
      new THREE.MeshPhongMaterial({ color: 0x999999 })
    );
    OVNI.add(body);
  
    // Calote esférica para o cockpit
    const cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(7, 32, 32, 0, 2 * Math.PI, 0, Math.PI / 2),
      new THREE.MeshPhongMaterial({ color: 0x99E2EE })
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
      const pointLight = new THREE.PointLight(0xffffff, 2, 50);
      smallSphere.add(pointLight);
      pointLight.position.y -= 1;
      ovniPointLightArray.push(pointLight);
      OVNI.add(smallSphere);
    }
    // Cilindro achatado no centro da parte de baixo da nave
    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.5, 2, 64),
      new THREE.MeshPhongMaterial({ color: 0xcccc00 })
    );
    cylinder.position.y = -2.5;
    OVNI.add(cylinder);
  
    // Adicionar spotlight
    spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, -20, 0);
    OVNI.add(spotTarget);

    spotLightOvni = new THREE.SpotLight(0xffffff, 3, 125, Math.PI/5);
    spotLightOvni.position.set(cylinder.position.x, cylinder.position.y - 1, cylinder.position.z);
    OVNI.add(spotLightOvni)

    spotLightOvni.target = spotTarget;
        
    OVNI.position.y = 75;
    scene.add(OVNI);
}

function createMoon() {
    var moon = new THREE.Mesh(
        new THREE.SphereGeometry(10, 32, 16),
        new THREE.MeshStandardMaterial({color: 0xF8FF81, emissive: 0xF8FF81, emissiveIntensity: 1, roughness: 0, metalness: 1})
    );

    moonLight = new THREE.DirectionalLight(0xF8FF81, 0.5);
    moonLight.position.set(170, 160, 110);
    scene.add(moonLight);

    moon.position.set(170, 160, 110);
    scene.add(moon);
}

function createSobreiroDescorticado(x, y, z, height, alpha, rotation) {

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
    tree.scale.set(alpha, alpha, alpha);
    tree.rotation.y = rotation;
    tree.position.set(x, y, z);
    return tree;
}

function createHouse(x, y, z){
    const vertices = new Float32Array([
        0, 0, 0,
        0, 1, 0,
        1, 0, 0,
        1, 1, 0,
        0, 0, 1,
        0, 1, 1,
        1, 0, 1,
        1, 1, 1
    ]);

    const indices = [
        0, 1, 2,
        1, 3, 2,
        0, 5, 1,
        0, 4, 5,
        4, 6, 5,
        5, 6, 7,
        2, 7, 6,
        2, 3, 7
    ];

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);

    const house = new THREE.Object3D();

    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: globalWireframe}));

    mesh.scale.set(15,10,10);

    mesh.position.set(x, y, z);

    house.add(mesh);

    scene.add(house);
}

function createRoof(x,y,z){
    const vertices = new Float32Array([
        0, 1, 0,
        0, 1, 1,
        0, 1.5, 0.5,

        1, 1, 0,
        1, 1, 1,
        1, 1.5, 0.5
    ]);

    const indices = [
        0, 1, 2,
        0, 2, 3,
        2, 5, 3,
        1, 4, 2,
        2, 4, 5,
        3, 5, 4,
    ];

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);

    const roof = new THREE.Object3D();

    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: globalWireframe}));

    mesh.scale.set(15,10,10);

    mesh.position.set(x, y, z);

    roof.add(mesh);

    scene.add(roof);
}

function createDoorAndWindows(x,y,z){

}

function createAmbientLight() {
    "use strict";
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
}


function createScene() {
    "use strict";

    scene = new THREE.Scene();

    createAmbientLight();

    createTerrain();

    createMoon();

    createOvni();

    scene.background = new THREE.Color(0x000045);
    
    const sobreiro1 = createSobreiroDescorticado(50, -6, 0, 20, 1.25, 0);
    scene.add(sobreiro1);
    const sobreiro2 = createSobreiroDescorticado(-50, 0, 0, 22, 1.3, Math.PI);
    scene.add(sobreiro2);
    const sobreiro3 = createSobreiroDescorticado(0, -10.25, -80, 21, 1.45, 3*Math.PI/4);
    scene.add(sobreiro3);
    const sobreiro4 = createSobreiroDescorticado(0, 0, 50, 20, 1.4, 5*Math.PI/6);
    scene.add(sobreiro4);
    const sobreiro5 = createSobreiroDescorticado(-50, 0, 50, 23, 1.5, Math.PI);
    scene.add(sobreiro5);
    const sobreiro6 = createSobreiroDescorticado(50, -9, -80, 21, 1.2, Math.PI/4);
    scene.add(sobreiro6);
    
    createHouse(10, 1, 10);

    createRoof(10, 1, 10);
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
    perspectiveCamera.position.x = 130;
    perspectiveCamera.position.y = 100;
    perspectiveCamera.position.z = 130;
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
        case 68: //D
            toggleMoonLight();
            break;
        case 100: //d
            toggleMoonLight();
            break;
        case 80: //P
            toggleOvniPointLights();
            break;
        case 112: //p
            toggleOvniPointLights();
            break;
        case 83: //S
            toggleOvniSpotLight();
            break;
        case 115: //s
            toggleOvniSpotLight();
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

    OVNI.rotation.y += 0.02 * delta * 100;

    if (ovniLeft) {
        OVNI.position.x += 0.4 * delta * 100;
    }
    if (ovniRight) {
        OVNI.position.x -= 0.4 * delta * 100;
    }
    if (ovniForward) {
        OVNI.position.z -= 0.4 * delta * 100;
    }
    if (ovniBackward) {
        OVNI.position.z += 0.4 * delta * 100;
    }

    render();

    requestAnimationFrame(animate);
}
