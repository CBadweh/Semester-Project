import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as dat from 'dat.gui';
import groundT from './groundT.jpg'


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
    scene.add(group);

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
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
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
