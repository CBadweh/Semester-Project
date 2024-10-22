import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as dat from 'dat.gui';
import groundT from './groundT.jpg'
import sea from './bigSea.jpg'
import { SetNode } from 'three/webgpu';


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
    window.innerWidth / -100, 
    window.innerWidth / 100,
    window.innerHeight / 100, 
    window.innerHeight / -100,
    1, 1000
); // Use OrthographicCamera for 2D view
camera.position.set(0, 0, 10); // Set the camera position to look at the origin
camera.lookAt(0, 0, 0); // Look at the origin
scene.background = new THREE.Color(0x87ceeb);

// ===============================================================================================
// grid or graph

const size = 20; // Size of the grid
const divisions = 20; // Number of divisions in the grid

const gridHelper = new THREE.GridHelper(size, divisions, 0x888888, 0x888888);
gridHelper.rotation.x = Math.PI / 2; // Rotate to lie flat on the XY plane
// scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);


// ==========================================================================================
// ==========================================================================================

// Create a ground
// const width = 100; // Full width of X-axis
// const height = 1;  // Height of 1 unit
// const depth = 1;   // Depth to give the box a 3D effect

const textureLoader = new THREE.TextureLoader();
const boxTexture = textureLoader.load(groundT);

const groundGeometry = new THREE.BoxGeometry(100, 0.5, 1)
const groundMaterial = new THREE.MeshBasicMaterial({ map: boxTexture});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
scene.add(ground);
ground.position.y =0.5/2;
ground.position.set(0, -0.5/2, 0);




//==========================================================================================
// ==========================================================================================
// Load the texture for the background
const textureLoader1 = new THREE.TextureLoader();
const backgroundTexture = textureLoader1.load(sea); // Replace with your texture path

// Create the plane for the background (bottom half)
const halfBackgroundGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight /80, 1);
const halfBackgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture }); // Light blue color for example
const halfBackground = new THREE.Mesh(halfBackgroundGeometry, halfBackgroundMaterial);

// Position the plane so it covers the bottom half
halfBackground.position.set(0, -window.innerHeight /  150, -10); // Position slightly behind everything else
// halfBackground.position.set(0, -window.innerHeight / 200, 0); 
scene.add(halfBackground);

// ==========================================================================================
// ==========================================================================================

//Airoplane
function createRealisticAirplane() {
    const airplane = new THREE.Group(); // Group to hold all parts of the airplane

    // Fuselage (Body) - Long and slim cylinder
    const fuselageGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 32); // radiusTop, radiusBottom, height, radialSegments
    const fuselageMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Gray color for the fuselage
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
    fuselage.rotation.z = Math.PI / 2; // Rotate the cylinder horizontally
    airplane.add(fuselage); // Add fuselage to the airplane

    // Tail fin (Vertical stabilizer)
    const tailFinGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.4); // width, height, depth
    const tailFinMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red color for the tail fin
    const tailFin = new THREE.Mesh(tailFinGeometry, tailFinMaterial);
    tailFin.position.set(-2.25, 0.5, 0); // Positioned at the back of the fuselage
    airplane.add(tailFin); // Add tail fin to the airplane

    //nose
    const noseGro = new THREE.SphereGeometry(0.3, 32, 32); // Updated segments to make it smoother
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red color
    const nose = new THREE.Mesh(noseGro, noseMat); // Corrected to THREE.Mesh, not MOUSE
    nose.position.set(2.5, 0, 0); // Set position of the nose
    airplane.add(nose); // Add nose to the airplane group

    // Body
    const bodyGeometry = new THREE.BoxGeometry(1, 1, 0.4); // width, height, depth
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red color for the tail fin
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(1, 0.5, 0); // Positioned at the back of the fuselage
    airplane.add(body); // Add tail fin to the airplane

    // win
    const winGeometry = new THREE.BoxGeometry(1, 0.3, 0.4); // width, height, depth
    const winMaterial = new THREE.MeshStandardMaterial({ color: 0xd67c7c }); // Red color for the tail fin
    const win = new THREE.Mesh(winGeometry, winMaterial);
    win.position.set(0.5, -0.3, 0); // Positioned at the back of the fuselage
    airplane.add(win); // Add tail fin to the airplane


    return airplane; // Return the airplane group
}



// Create the airplane and add it to the scene
const airplane = createRealisticAirplane();
airplane.position.y = 5.5;
airplane.position.x = -7;
airplane.scale.set(0.5, 0.5, 0.5);
scene.add(airplane);


// Position the camera
// Function to create a 2D cloud shape and extrude it
function createCartoonCloud() {
    // Define the shape of the cloud using THREE.Shape()
    const cloudShape = new THREE.Shape();
    
    // Draw a simple cloud shape using moveTo and bezierCurveTo for smooth curves
    cloudShape.moveTo(-2, 0); // Starting point (left)
    cloudShape.bezierCurveTo(-2.5, 1, -1.5, 2, -1, 1.5); // First cloud puff
    cloudShape.bezierCurveTo(-0.5, 3, 0.5, 3, 1, 1.5); // Middle cloud puff
    cloudShape.bezierCurveTo(1.5, 2, 2.5, 1, 2, 0); // Last cloud puff
    cloudShape.lineTo(-2, 0); // Close the shape at the bottom
    
    // Extrude the shape to make it 3D
    const extrudeSettings = { depth: 0.5, bevelEnabled: false }; // Depth for the 3D effect
    const cloudGeometry = new THREE.ExtrudeGeometry(cloudShape, extrudeSettings);

    // Material for the cloud
    const cloudMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, flatShading: true });
    // Create the cloud mesh
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);

    return cloudMesh; // Return the cloud mesh
}

// Create a cloud and add it to the scene
const cloud = createCartoonCloud();
cloud.position.set(3, 4.3, -5); // Position it in the scene
cloud.scale.set(0.5, 0.5, 0.5)
scene.add(cloud);
const cloud1 = createCartoonCloud();
cloud1.position.set(-1, 4.5, -5); // Position it in the scene
cloud1.scale.set(0.6, 0.6, 0.7)
scene.add(cloud1);
const cloud2 = createCartoonCloud();
cloud2.position.set(-4.5, 5, -5); // Position it in the scene
cloud2.scale.set(0.3, 0.3, 0.)
scene.add(cloud2);
const cloud3 = createCartoonCloud();
cloud3.position.set(-7, 4.5,-5);
cloud3.scale.set(0.5,0.5,0.5);
scene.add(cloud3)

// ==========================================================================================

// create a house
function createHouse (width = 3, height = 3, depth = 3, roofHeight = 1){
    const house =new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(width,height,depth)
    const bodyMat = new THREE.MeshBasicMaterial({color: 0x8B4513})
    const houseBody = new THREE.Mesh(bodyGeo, bodyMat)
    houseBody.position.y = height/2;
    house.add(houseBody);

    const roofGeo = new THREE.ConeGeometry(width*0.75 , roofHeight, 4)
    const roofMat = new THREE.MeshBasicMaterial({color:0xff0000})
    const roof = new THREE.Mesh(roofGeo,roofMat)
    roof.position.y = height + roofHeight/2;
    roof.rotation.y = Math.PI/4;
    house.add(roof)


    return house
}
const house1 = createHouse();
house1.position.set(-10, 0,0)
scene.add(house1)

// ==========================================================================================

// // Function to create a house
// function createHouse(width = 3, height = 3, depth = 3, roofHeight = 1) {
//     const house = new THREE.Group(); // Create a group to hold all house parts

//     // Create the house body (BoxGeometry)
//     const bodyGeometry = new THREE.BoxGeometry(width, height, depth);
//     const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Brown color for walls
//     const houseBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
//     houseBody.position.y = height / 2; // Center the house on y-axis
//     house.add(houseBody);

//     // Create the roof (ConeGeometry)
//     const roofGeometry = new THREE.ConeGeometry(width * 0.75, roofHeight, 4); // Base size, height, 4 segments for pyramid shape
//     const roofMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color for roof
//     const roof = new THREE.Mesh(roofGeometry, roofMaterial);
//     roof.position.y = height + roofHeight / 2; // Position roof on top of the house body
//     roof.rotation.y = Math.PI / 4; // Rotate roof to align with the square house body
//     house.add(roof);

//     // Optionally: Add a door (thin BoxGeometry)
//     const doorGeometry = new THREE.BoxGeometry(width * 0.3, height * 0.5, depth * 0.05); // Door size relative to house
//     const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 }); // Dark brown for the door
//     const door = new THREE.Mesh(doorGeometry, doorMaterial);
//     door.position.set(0, height * 0.25, depth / 2 + 0.03); // Position door at the front of the house
//     house.add(door);

//     return house; // Return the complete house group
// }

// // Create and add houses to the scene
// const house1 = createHouse(); // Default house
// house1.position.set(-10, 0, 0); // Position the house
// scene.add(house1);

// const house2 = createHouse(6, 4, 6, 2.5); // Custom house with different dimensions
// house2.position.set(10, 0, 0);
// scene.add(house2);

// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================

// Function to create a tree
function createTree(trunkHeight = 3, trunkRadius = 0.2, foliageRadius = 1) {
    // Create a group for the tree
    const tree = new THREE.Group();

    // Create trunk (Cylinder)
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, 32);
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Brown
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2; // Center the trunk on the y-axis
    tree.add(trunk);

    // Create foliage (Sphere)
    const foliageGeometry = new THREE.SphereGeometry(foliageRadius, 32, 32);
    const foliageMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 }); // Green
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = trunkHeight + foliageRadius / 2; // Position foliage on top of the trunk
    tree.add(foliage);

    return tree; // Return the complete tree group
}

// Create and add trees to the scene
const tree1 = createTree(); // Default tree
tree1.position.set(-5, 0, -0.1); // Position the tree in the scene
scene.add(tree1);

const tree2 = createTree(); // Custom tree with taller trunk and larger foliage
tree2.position.set(5, 0, -0.1);
scene.add(tree2);

// ==========================================================================================
// ==========================================================================================
/*
Function to create a text canvas for the number labels
function createTextCanvas(text) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    // context.font = "bold 72px Arial"; // Increased font size for larger numbers
    context.font = '70px Arial';
    const textWidth = context.measureText(text).width;

    // Set canvas size
    canvas.width = textWidth;
    canvas.height = 30;

    context.fillStyle = "black";
    context.fillText(text, 0, 20); // Adjust the Y position to match the new font size
    return canvas;
}*/
function createTextCanvas(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '20px Arial';
    
    const textWidth = context.measureText(text).width;
    canvas.width = textWidth + 20; // Add padding to ensure there's enough space for centering
    canvas.height = 30;

    // Center the text in the canvas
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = 'black';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    return canvas;
}
// Function to create meter marks with number labels
function createMeterMarks() {
    const markMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const markGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -0.1, 0),
        new THREE.Vector3(0, 0.1, 0)
    ]);

    // Create marks and labels
    for (let i = -20; i <= 20; i++) {
        // Create vertical mark
        const markLine = new THREE.Line(markGeometry, markMaterial);
        markLine.position.set(i, 0, 0);
        scene.add(markLine);

        // Create number sprite
        const numberTexture = new THREE.CanvasTexture(createTextCanvas(i.toString()));
        const numberMaterial = new THREE.SpriteMaterial({ map: numberTexture });
        const numberSprite = new THREE.Sprite(numberMaterial);

        numberSprite.position.set(i, -0.7, 0); // Position below the mark (adjusted for larger numbers)
        numberSprite.scale.set(1.5, 0.8, 1); // Set scaling to 1 to match the new size
        // numberSprite.renderOrder = 1;
        scene.add(numberSprite);
    }
}

// Call the function to create meter marks
createMeterMarks();
// Adjust the camera to render in orthographic projection



// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================

// Zoom functionality
/*
function onMouseWheel(event) {
    event.preventDefault();
    const zoomAmount =0.1;
    let currentZoom = camera; // Start zoom level (adjust as needed)
    
    if (event.deltaY < 0) {
        // Zoom in
        currentZoom.left *= (1 - zoomAmount);
        currentZoom.right *= (1 - zoomAmount);
        currentZoom.top *= (1 - zoomAmount);
        currentZoom.bottom *= (1 - zoomAmount);
    } else {
        // Zoom out
        currentZoom.left *= (1 + zoomAmount);
        currentZoom.right *= (1 + zoomAmount);
        currentZoom.top *= (1 + zoomAmount);
        currentZoom.bottom *= (1 + zoomAmount);
    }
    currentZoom = Math.max(0.5, Math.min(currentZoom, 20)); 
    camera.updateProjectionMatrix();
}
window.addEventListener('wheel', onMouseWheel, false);
*/
// Initialize zoom level
// Initialize zoom level

// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================

// prefect one Zoom in/out with limit
function onMouseWheel(event) {
    event.preventDefault();

    const zoomAmount = 0.1; // Smaller step for smoother zoom
    let minZoom = 1;         // Minimum zoom level
    let maxZoom = 30;        // Maximum zoom level

    // Calculate zoom factor based on scroll direction
    let zoomFactor = event.deltaY < 0 ? 1 - zoomAmount : 1 + zoomAmount;

    // Get the current zoom level
    let currentZoom = Math.abs(camera.right - camera.left);

    // Ensure zoom stays within bounds
    if ((currentZoom > minZoom || event.deltaY > 0) && (currentZoom < maxZoom || event.deltaY < 0)) {
        camera.left *= zoomFactor;
        camera.right *= zoomFactor;
        camera.top *= zoomFactor;
        camera.bottom *= zoomFactor;
        camera.updateProjectionMatrix();
    }
}
window.addEventListener('wheel', onMouseWheel, false);
// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================

// Mouse panning functionality
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Mouse down event
window.addEventListener('mousedown', (event) => {
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
});

// Mouse move event
window.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y,
        };

        // Update camera position based on mouse movement
        camera.left -= deltaMove.x * 0.01; // Adjust the multiplier as needed for sensitivity
        camera.right -= deltaMove.x * 0.01;
        // camera.top += deltaMove.y * 0.01; // Invert y-axis movement
        // camera.bottom += deltaMove.y * 0.01;

        camera.updateProjectionMatrix();

        previousMousePosition = { x: event.clientX, y: event.clientY }; // Update previous mouse position
    }
});

// Mouse up event
window.addEventListener('mouseup', () => {
    isDragging = false; // Stop dragging
});

// Mouse leave event (to handle when mouse leaves the window)
window.addEventListener('mouseleave', () => {
    isDragging = false; // Stop dragging
});

// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================

function createDog(x, y, z) {
    const group = new THREE.Group(); // Group to hold all parts of the dog

    // Body of the Dog (BoxGeometry)
    const bodyGeometry = new THREE.BoxGeometry(3, 1, 1);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // Head of the Dog (BoxGeometry)
    const headGeometry = new THREE.BoxGeometry(1, 1, 1);
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(2, 0.5, 0); // Slightly in front of the body
    group.add(head);

    // Legs (CylinderGeometry)
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);
    const legMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });

    const leg1 = new THREE.Mesh(legGeometry, legMaterial);
    leg1.position.set(1, -0.5, 0.5); // Front right
    group.add(leg1);

    const leg2 = new THREE.Mesh(legGeometry, legMaterial);
    leg2.position.set(1, -0.5, -0.5); // Front left
    group.add(leg2);

    const leg3 = new THREE.Mesh(legGeometry, legMaterial);
    leg3.position.set(-1, -0.5, 0.5); // Back right
    group.add(leg3);

    const leg4 = new THREE.Mesh(legGeometry, legMaterial);
    leg4.position.set(-1, -0.5, -0.5); // Back left
    group.add(leg4);

    // Tail (CylinderGeometry)
    const tailGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32);
    const tailMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(-1.5, 0, 0); // Positioned at the back
    tail.rotation.z = Math.PI / 4; // Rotate tail upwards
    group.add(tail);

    // Position the entire group
    group.position.set(x, y, z);

    // Add the dog group to the scene
    // scene.add(group);

    return group; // Return the dog group so we can manipulate it later
}

// Create a dog at position (0, 0, 0)
const dog = createDog(0, 0, 0);
dog.scale.set(0.5, 0.5, 0.5);
dog.position.set(0,0.5,1)

// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================

// Set up Cannon.js physics world
const world = new CANNON.World();
world.gravity.set(0, 0, 0); // No default gravity

// Add lights (optional in 2D, but kept for visibility)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Create Object
// Create a cube
const cubeSize = 1;
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff , depthTest:false});
const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cubeMesh);

// Initialize cube body at the correct position (1 meter away from the y-axis)
const cubeBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 0.5, 0), // Position the cube body exactly at 1 meter
});
cubeBody.addShape(new CANNON.Box(new CANNON.Vec3(cubeSize / 2, cubeSize / 2, cubeSize / 2))); // Add shape to the body
world.addBody(cubeBody);

// Refresh function to reset cube
function resetCube() {
    // Reset cube position to exactly 1 meter on the x-axis
    cubeBody.position.set(0, 0.5, 0); 
    cubeBody.velocity.set(0, 0, 0); // Reset velocity to 0
    cubeMesh.position.copy(cubeBody.position); // Update Three.js mesh position
}

// Box position control
const positionSettings = {
    x: cubeBody.position.x,
};


// GUI Setup
const gui = new dat.GUI();

// Create folders for GUI groups
const positionFolder = gui.addFolder('Position & Velocity');
const actionFolder = gui.addFolder('Actions');
// Open the folders by default
positionFolder.open();
actionFolder.open();


// Cube settings for GUI
const cubeSettings = {
    color: cubeMesh.material.color.getHex(),
    axis: 'x', // Control axis: 'x' or 'y'
    velocity: 1, // Control velocity
    paused: false,
    distance: 0, // Added distance tracking
  
    startMoving: () => {
        // Reset position to 1 meter on x-axis, which aligns with the label
        cubeBody.position.set(-0.5, 0.5, 0);
        cubeSettings.distance = 0; // Reset distance
        setCubeVelocity();
        cubeSettings.paused = false;
    },
    togglePause: () => {
        cubeSettings.paused = !cubeSettings.paused;
        if (cubeSettings.paused) {
            cubeBody.velocity.set(0, 0, 0); // Stop the cube
        } else {
            setCubeVelocity(); // Reset velocity on resume
        }
    },
};

// Set cube velocity based on axis
function setCubeVelocity() {
    if (cubeSettings.axis === 'x') {
        cubeBody.velocity.set(cubeSettings.velocity, 0, 0);
    } else {
        cubeBody.velocity.set(0, cubeSettings.velocity, 0);
    }
}
// Create position controls in the GUI
positionFolder.add(positionSettings, 'x', -10, 10).step(0.1).name('Position X').onChange((value) => {
    cubeBody.position.x = value; // Update the physics body position
    cubeMesh.position.x = value; // Update the mesh position
});
// gui.add(cubeSettings, 'moveY', 0, 10).name('Position Y').onChange((value) => {
//     cubeBody.position.y = value; // Update the physics body position
//     cubeMesh.position.y = value; // Update the mesh position
// });

// Add GUI controls


positionFolder.add(cubeSettings, 'axis', ['x', 'y']).name('Move Axis').onChange(() => {
    cubeBody.velocity.set(0, 0, 0); // Stop cube to change direction
    if (!cubeSettings.paused) {
        setCubeVelocity(); // Set velocity based on new axis
    }
});
positionFolder.add(cubeSettings, 'velocity', -20, 20).name('Velocity').step(0.1).onChange((value) => {
    cubeBody.velocity.set(0, 0, 0); // Stop the cube
    if (!cubeSettings.paused) {
        setCubeVelocity(); // Set velocity based on selected axis and new value
    }
});
positionFolder.add(cubeSettings, 'distance').name('Distance Traveled').listen(); // Add distance display to GUI

actionFolder.addColor(cubeSettings, 'color').onChange((value) => {
    cubeMesh.material.color.set(value); // Update cube color
});

actionFolder.add(cubeSettings, 'startMoving').name('Start Moving');
actionFolder.add(cubeSettings, 'togglePause').name('Pause/Resume');
actionFolder.add({ Reset: resetCube }, 'Reset').name('Reset Cube');
// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================

// Posiont Gui Folder
/*
actionFolder.domElement.style.bottom = '20px'; 
actionFolder.domElement.style.right = '20px'; 
actionFolder.domElement.style.zIndex = 10; 

// Move the Position & Velocity folder to the middle of the screen
positionFolder.domElement.style.position = 'absolute'; // Set absolute positioning
positionFolder.domElement.style.top = '20%'; // Position at 50% from the top of the screen
positionFolder.domElement.style.left = '60%'; // Position at 50% from the left of the screen
// positionFolder.domElement.style.transform = 'translate(-50%, -50%)'; // Center the folder
positionFolder.domElement.style.zIndex = 10; // Ensure it's above other elements
*/
// Move the Position & Velocity folder to the middle-left
positionFolder.domElement.style.position = 'fixed'; // Use fixed positioning
positionFolder.domElement.style.top = '80%'; // Position 50% from the top of the screen
positionFolder.domElement.style.left = '40%'; // Position it slightly left of center
positionFolder.domElement.style.transform = 'translate(-50%, -50%)'; // Center it correctly
positionFolder.domElement.style.zIndex = 10; // Ensure it stays above other elements

// Move the Actions folder to the middle-right
actionFolder.domElement.style.position = 'fixed'; // Use fixed positioning
actionFolder.domElement.style.top = '80%'; // Position 50% from the top of the screen
actionFolder.domElement.style.left = '60%'; // Position it slightly right of center
actionFolder.domElement.style.transform = 'translate(-50%, -50%)'; // Center it correctly
actionFolder.domElement.style.zIndex = 10; // Ensure it stays above other elements

// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================

const distanceDisplay = document.getElementById('distance-display'); // Select the distance display element


// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update the physics world
    if (!cubeSettings.paused) {
        world.fixedStep();
    }

    cubeMesh.position.copy(cubeBody.position);
    cubeMesh.quaternion.copy(cubeBody.quaternion);

    // Update distance traveled
    cubeSettings.distance = Math.abs(cubeBody.position.x) + Math.abs(cubeBody.position.y); // Use the length for 2D distance
    cubeSettings.distance = parseFloat(cubeSettings.distance.toFixed(2)); // Ensure two decimal precision

    // Update the HTML distance display
    if (distanceDisplay) {
        distanceDisplay.innerText = `Distance traveled: ${cubeSettings.distance.toFixed(2)}`; // Display distance in the HTML element
    }
    

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.left = window.innerWidth / -200;
    camera.right = window.innerWidth / 200;
    camera.top = window.innerHeight / 200;
    camera.bottom = window.innerHeight / -200;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
