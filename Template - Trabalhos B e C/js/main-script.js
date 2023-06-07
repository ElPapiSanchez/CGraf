/*global THREE, requestAnimationFrame, console*/

var perspectiveCamera,
    scene,
    renderer,
    OVNI,
    spotLightOvni,
    terrain,
    skydome,
    moon,
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

var objetos =  [];

function toggleMoonLight() {
    if(moonLightOn) {
        moon.material.emissiveIntensity = 0;
        moonLight.intensity = 0;
    }
    else {
        moon.material.emissiveIntensity = 1;
        moonLight.intensity = 0.2;
    }
    moonLightOn = !moonLightOn;
}

function toggleOvniSpotLight() {
    if(ovniSpotLightOn) spotLightOvni.intensity = 0;
    else spotLightOvni.intensity = 2.5;
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
            ovniPointLightArray[i].intensity = 5;
        }
    }
    ovniPointLightsOn = !ovniPointLightsOn;
}

function createSkydome() {
    const skyGeometry = new THREE.SphereGeometry(550, 256, 256, 0, 2 * Math.PI, 0, Math.PI / 2);
    skyGeometry.computeVertexNormals();
  
    skydome = new THREE.Mesh(skyGeometry, new THREE.MeshPhongMaterial({map: null, side: THREE.BackSide}));
    skydome.position.y -= 20;
    scene.add(skydome);
    objetos.push(skydome);
}

function updateSkydomeTexture() {
    const texture = generateStarrySkyTexture();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 1);
    skydome.material.map = texture;
    skydome.material.needsUpdate = true;
}

function updateTerrainTexture() {
    const texture = generateFloralTerrainTexture();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    terrain.material.map = texture;
    terrain.material.needsUpdate = true;
}

function generateFloralTerrainTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;

    const context = canvas.getContext("2d");

    // Criar a cor do fundo
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "lightgreen");
    gradient.addColorStop(1, "lightgreen");

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar as estrelas brancas
    const numFlowers = 1500;
    const flowerRadius = 1.5;
    const flowerColors = ["#FFFFFF", "#FFFF00", "#E6E6FA", "#ADD8E6"];

    for (let i = 0; i < numFlowers; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        context.beginPath();
        context.arc(x, y, flowerRadius, 0, 2 * Math.PI);
        context.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
        context.fill();
    }

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    return texture;
}
  
function generateStarrySkyTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;

    const context = canvas.getContext("2d");

    // Criar a cor do fundo
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgb(0, 0, 64)");
    gradient.addColorStop(1, "rgb(50, 0, 62)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar as estrelas brancas
    const numStars = 500;
    const starRadius = 1;

    for (let i = 0; i < numStars; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        context.beginPath();
        context.arc(x, y, starRadius, 0, 2 * Math.PI);
        context.fillStyle = "rgb(255, 255, 255)";
        context.fill();
    }

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    return texture;
}
  

function createTerrain() {

    var loader = new THREE.TextureLoader();
    loader.load('js/utils/terrain.png', function(texture) {
  
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
        
        geometry.computeVertexNormals();
        terrain = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({map: texture}));
        terrain.rotation.x = -Math.PI/2;
        terrain.position.y += 10;
        scene.add(terrain);
        objetos.push(terrain);
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
    objetos.push(body);
  
    // Calote esférica para o cockpit
    const cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(7, 32, 32, 0, 2 * Math.PI, 0, Math.PI / 2),
      new THREE.MeshPhongMaterial({ color: 0x99E2EE })
    );
    cockpit.position.y = 1; // Posicionando o cockpit acima do corpo da nave
    OVNI.add(cockpit);
    objetos.push(cockpit)
  
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
      const pointLight = new THREE.PointLight(0xffffff, 5, 7);
      smallSphere.add(pointLight);
      pointLight.position.y -= 1;
      ovniPointLightArray.push(pointLight);
      OVNI.add(smallSphere);
      objetos.push(smallSphere);
    }
    // Cilindro achatado no centro da parte de baixo da nave
    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.5, 2, 64),
      new THREE.MeshPhongMaterial({ color: 0xcccc00 })
    );
    cylinder.position.y = -2.5;
    OVNI.add(cylinder);
    objetos.push(cylinder);
  
    // Adicionar spotlight
    spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, -20, 0);
    OVNI.add(spotTarget);

    spotLightOvni = new THREE.SpotLight(0xffffff, 2.5, 125, Math.PI/5);
    spotLightOvni.position.set(cylinder.position.x, cylinder.position.y - 1, cylinder.position.z);
    OVNI.add(spotLightOvni)

    spotLightOvni.target = spotTarget;
        
    OVNI.position.y = 75;
    scene.add(OVNI);
}

function createMoon() {
    moon = new THREE.Mesh(
        new THREE.SphereGeometry(10, 32, 16),
        new THREE.MeshPhongMaterial({color: 0xF8FF81, emissive: 0xF8FF81, emissiveIntensity: 1})
    );

    moonLight = new THREE.DirectionalLight(0xF8FF81, 0.2);
    moonLight.position.set(220, 300, 140);
    scene.add(moonLight);

    moon.position.set(220, 300, 140);
    scene.add(moon);
    objetos.push(moon);
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
    objetos.push(secTrunk);
    objetos.push(mainTrunk);
    trunks.rotation.x = -Math.PI / 9;
    trunks.position.set(0,-0.5,0);
    tree.add(trunks);
    tree.add(mainLeafs);
    tree.add(secLeafs);
    objetos.push(mainLeafs);
    objetos.push(secLeafs);
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

        0, 0, 1, //4
        0, 1, 1,
        1, 0, 1,
        1, 1, 1,
        
        1/7, 0, 1, //8
        2/7, 0, 1,
        3/7, 0, 1,
        4/7, 0, 1,
        5/7, 0, 1,
        6/7, 0, 1,
        
        1/7, 1, 1, //14
        2/7, 1, 1,
        3/7, 1, 1,
        4/7, 1, 1,
        5/7, 1, 1,
        6/7, 1, 1,

        3/7, 2/3, 1, //20
        4/7, 2/3, 1,

        1/7, 3/7, 1, //22
        1/7, 5/7, 1,
        2/7, 3/7, 1,
        2/7, 5/7, 1,

        5/7, 3/7, 1, //26
        5/7, 5/7, 1,
        6/7, 3/7, 1,
        6/7, 5/7, 1
    ]);

    const indices = [
        0, 1, 2,
        1, 3, 2,
        0, 5, 1,
        0, 4, 5,
        2, 7, 6,
        2, 3, 7,
        
        //parede da frente
        4, 8, 5, // seccao 1/7
        5, 8, 14,
        14, 23, 25, //seccao 2/7 parte de cima
        14, 25, 15,
        22, 8, 9, //seccao 2/7 parte de baixo
        22, 9, 24,
        15, 9, 10, //seccao 3/7
        15, 10, 16,
        16, 20, 21, //seccao 4/7 por cima da porta
        16, 21, 17,
        17, 11, 12, //seccao 5/7
        17, 12, 18,
        18, 27, 29, //seccao 6/7 parte de cima
        18, 29, 19,
        26, 12, 13, //seccao 6/7 parte de baixo
        26, 13, 28,
        19, 13, 6, //seccao 7/7
        19, 6, 7
    ];

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const house = new THREE.Object3D();

    const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0xffffff}));

    mesh.scale.set(35,15,20);

    mesh.position.set(x, y, z);

    house.add(mesh);

    house.rotation.y = Math.PI / 3;

    scene.add(house);
    objetos.push(house);
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
    geometry.computeVertexNormals();

    const roof = new THREE.Object3D();

    const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0xAA4A44}));

    mesh.scale.set(35,15,20);

    mesh.position.set(x, y, z);

    roof.add(mesh);

    roof.rotation.y = Math.PI / 3;

    scene.add(roof);
    objetos.push(roof);
}

function createDoorAndWindows(x,y,z){
    const vertices = new Float32Array([
        0, 0, 0,
        0, 1, 0,
        1, 0, 0,
        1, 1, 0
    ]);

    const indices = [
        0, 2, 1,
        1, 2, 3
    ];

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const doorWindow = new THREE.Object3D();

    const meshDoor = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0xA0522D, wireframe: globalWireframe}));
    meshDoor.scale.set(5,10,1);
    meshDoor.position.set(x, y, z);
    doorWindow.add(meshDoor);
    objetos.push(meshDoor);
    
    const meshWindow1 = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0x87CEFA, wireframe: globalWireframe}));
    meshWindow1.scale.set(5,30/7,1);
    meshWindow1.position.set(x + 10, y + 45/7, z);
    doorWindow.add(meshWindow1);
    objetos.push(meshWindow1);

    const meshWindow2 = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0x87CEFA, wireframe: globalWireframe}));
    meshWindow2.scale.set(5,30/7,1);
    meshWindow2.position.set(x - 10, y + 45/7, z);
    doorWindow.add(meshWindow2);
    objetos.push(meshWindow2);

    doorWindow.rotation.y = Math.PI / 3;

    scene.add(doorWindow);
}

function createAmbientLight() {
    "use strict";
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
}


function createScene() {
    "use strict";

    scene = new THREE.Scene();

    createAmbientLight();

    createTerrain();

    createSkydome();

    createMoon();

    createOvni();

    scene.background = new THREE.Color(0x000000);
    
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
    
    createHouse(-24, -1, -20);

    createRoof(-24, -1, -20);

    createDoorAndWindows(-9, -1, 0);
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
            updateSkydomeTexture();
            break;
        case 50: // 2 key
            updateTerrainTexture();
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
    renderer.setAnimationLoop( function () {

        renderer.render( scene, perspectiveCamera );

    } );
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
    document.body.appendChild( VRButton.createButton( renderer ) );
    renderer.xr.enabled = true;

    clock = new THREE.Clock();

    createScene();
    perspectiveCamera = createPerspectiveCamera();
    controls = new THREE.OrbitControls(perspectiveCamera, renderer.domElement);

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
