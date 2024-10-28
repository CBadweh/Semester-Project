import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as dat from 'dat.gui';


// =====================================================================
//                       INIT. THREEJS
// =====================================================================
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


// grid or graph
const size = 20; // Size of the grid
const divisions = 20; // Number of divisions in the grid

const gridHelper = new THREE.GridHelper(size, divisions, 0x888888, 0x888888);
gridHelper.rotation.x = Math.PI / 2; // Rotate to lie flat on the XY plane
// scene.add(gridHelper);
const axesHelper = new THREE.AxesHelper(4);
scene.add(axesHelper);

// Add lights (optional in 2D, but kept for visibility)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// =====================================================================
//                       CREATE GROUND
// =====================================================================
const groundGeometry = new THREE.BoxGeometry(100, 0.5, 1)
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x000000});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
scene.add(ground);
ground.position.y =0.5/2;
ground.position.set(0, -0.5/2, 0);


// =====================================================================
//                        Set up Cannon.js physics world
// =====================================================================
const world = new CANNON.World();
world.gravity.set(0, 0, 0); // No default gravity


// function createTextCanvas(text) {
//     const canvas = document.createElement('canvas');
//     const context = canvas.getContext('2d');
//     context.font = '20px Arial';
    
//     const textWidth = context.measureText(text).width;
//     canvas.width = textWidth + 20; // Add padding to ensure there's enough space for centering
//     canvas.height = 30;

//     // Center the text in the canvas
//     context.textAlign = 'center';
//     context.textBaseline = 'middle';
//     context.fillStyle = 'black';
//     context.fillText(text, canvas.width / 2, canvas.height / 2);

//     return canvas;
// }
// // Function to create meter marks with number labels
// function createMeterMarks() {
//     const markMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
//     const markGeometry = new THREE.BufferGeometry().setFromPoints([
//         new THREE.Vector3(0, -0.1, 0),
//         new THREE.Vector3(0, 0.1, 0)
//     ]);

//     // Create marks and labels
//     for (let i = -20; i <= 20; i++) {
//         // Create vertical mark
//         const markLine = new THREE.Line(markGeometry, markMaterial);
//         markLine.position.set(i, 0, 0);
//         scene.add(markLine);

//         // Create number sprite
//         const numberTexture = new THREE.CanvasTexture(createTextCanvas(i.toString()));
//         const numberMaterial = new THREE.SpriteMaterial({ map: numberTexture });
//         const numberSprite = new THREE.Sprite(numberMaterial);

//         numberSprite.position.set(i, -0.7, 0); // Position below the mark (adjusted for larger numbers)
//         numberSprite.scale.set(1.5, 0.8, 1); // Set scaling to 1 to match the new size
//         // numberSprite.renderOrder = 1;
//         scene.add(numberSprite);
//     }
// }

// // Call the function to create meter marks
// createMeterMarks();

// =====================================================================
//                        Create a cube
// =====================================================================


const cubeSize = 1;
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, depthTest:false});
const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cubeMesh);
cubeMesh.position.set(0,0.5,0)

// Initialize cube body at the correct position (1 meter away from the y-axis)
const cubeBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 0.5, 0), // Position the cube body exactly at 1 meter
});
cubeBody.addShape(new CANNON.Box(new CANNON.Vec3(cubeSize / 2, cubeSize / 2, cubeSize / 2))); // Add shape to the body
world.addBody(cubeBody);


// ==========================================================================================
//                              INIT GUI FUNCTION
// ==========================================================================================
// GUI Functions
function resetCube() {
    // Reset cube position to exactly 1 meter on the x-axis
    cubeBody.position.set(0, 0.5, 0); 
    cubeBody.velocity.set(0, 0, 0); // Reset velocity to 0
    cubeMesh.position.copy(cubeBody.position); // Update Three.js mesh position
}
// GUI Setup
const gui = new dat.GUI({ autoPlace: false });

const cubeSettings = {
    axis: 'x', // Control axis: 'x' or 'y'
    velocity: 1, // Control velocity
    paused: false,
    initialDistance: 0, // Added distance tracking
    finalDistance: 1,
    travelTimeDisplay: 0, // Display calculated travel time
    travelStartTime: null, // Track when the travel starts
    distanceTraveled: 0, // New property for distance traveled
  
    startMoving: () => {
        // Reset position based on initial distance setting
        if (cubeSettings.axis === 'x') {
            cubeBody.position.set(cubeSettings.initialDistance, 0.5, 0);
            // cubeBody.velocity.set(cubeSettings.velocity, 0, 0); // Apply velocity on start
        } else {
            cubeBody.position.set(0, cubeSettings.initialDistance + 0.5, 0);
            // cubeBody.velocity.set(0, cubeSettings.velocity, 0); // Apply velocity on start
        }
        setCubeVelocity();

        // Calculate expected travel time and reset travel time display
        const distanceToTravel = Math.abs(cubeSettings.finalDistance - cubeBody.position[cubeSettings.axis === 'x' ? 'x' : 'y']);
        cubeSettings.expectedTravelTime = distanceToTravel / Math.abs(cubeSettings.velocity); // Calculate expected time
        cubeSettings.travelStartTime = performance.now(); // Start timer
        cubeSettings.travelTimeDisplay = 0; // Reset travel time display
        cubeSettings.distanceTraveled = 0; // Reset distance traveled
        cubeSettings.paused = false; // Unpause movement
        
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
function setCubeVelocity() {
    if (cubeSettings.axis === 'x') {
        cubeBody.velocity.set(cubeSettings.velocity, 0, 0); // Set x-axis velocity
    } else {
        cubeBody.velocity.set(0, cubeSettings.velocity, 0); // Set y-axis velocity
    }
}

function finalDistance() {
    const position = cubeBody.position[cubeSettings.axis === 'x' ? 'x' : 'y'];
    if (position >= cubeSettings.finalDistance) {
        cubeBody.velocity.set(0, 0, 0); // Stop when reaching final distance
        cubeBody.position[cubeSettings.axis === 'x' ? 'x' : 'y'] = cubeSettings.finalDistance; // Correct position
        cubeSettings.travelStartTime = null; // Stop the timer
        cubeSettings.travelTimeDisplay = cubeSettings.expectedTravelTime.toFixed(2); // Display expected travel time
    }
}


// ==========================================================================================
//                             ADD GUI
// ==========================================================================================
// Add GUI

gui.add(cubeSettings, 'velocity', -20, 20).name('Velocity').step(0.1);
gui.add(cubeSettings, 'startMoving').name('Start Moving');
gui.add(cubeSettings, 'togglePause').name('Pause/Resume');
gui.add({ Reset: resetCube }, 'Reset').name('Reset Cube');
// gui.add(cubeSettings, 'initialDistance', -10, 10).name('Initial Distance').step(0.1);
gui.add(cubeSettings, 'initialDistance', -10, 10).name('Initial Distance').step(0.1).onChange((value) => {
    // Update the cube's position immediately based on the selected axis
    if (cubeSettings.axis === 'x') {
        cubeBody.position.x = value;
    } else {
        cubeBody.position.y = value;
    }
});
gui.add(cubeSettings, 'finalDistance', -10, 10).name('Final Distance').step(0.1);
gui.add(cubeSettings, 'distanceTraveled').name('Distance Traveled').listen(); // New distance traveled display
// gui.add(cubeSettings, 'travelTimeDisplay').name('Travel Time Display (s)').listen(); // Display calculated travel time


// ==========================================================================================
//                              LINK BTN to CSS
// ==========================================================================================
// Select buttons
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
// Link buttons to cube settings functions
startButton.addEventListener('click', () => {
    cubeSettings.startMoving();
});

pauseButton.addEventListener('click', () => {
    cubeSettings.togglePause();
    pauseButton.textContent = cubeSettings.paused ? 'Resume' : 'Pause';
});

resetButton.addEventListener('click', resetCube);

const distanceDisplay = document.getElementById('distance-display');


// ==========================================================================================
//                              INIT SLIDER
// ==========================================================================================
// Get references to the sliders and input fields
const initialDistanceSlider = document.getElementById('initial-distance');
const finalDistanceSlider = document.getElementById('final-distance');
const velocitySlider = document.getElementById('velocity');

const initialDistanceInput = document.getElementById('initial-distance-input');
const finalDistanceInput = document.getElementById('final-distance-input');
const velocityInput = document.getElementById('velocity-input');

const initialDistanceValue = document.getElementById('initial-distance-value');
const finalDistanceValue = document.getElementById('final-distance-value');
const velocityValue = document.getElementById('velocity-value');

// Set initial display values
initialDistanceValue.textContent = cubeSettings.initialDistance;
finalDistanceValue.textContent = cubeSettings.finalDistance;
velocityValue.textContent = cubeSettings.velocity;

// Update cube settings when sliders are moved
initialDistanceSlider.addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    cubeSettings.initialDistance = value;
    initialDistanceValue.textContent = value;
    initialDistanceInput.value = value; // Update input field
    // Update cube position immediately
    if (cubeSettings.axis === 'x') {
        cubeBody.position.x = value;
    } else {
        cubeBody.position.y = value;
    }
});

finalDistanceSlider.addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    cubeSettings.finalDistance = value;
    finalDistanceValue.textContent = value;
    finalDistanceInput.value = value; // Update input field
});

velocitySlider.addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    cubeSettings.velocity = value;
    velocityValue.textContent = value;
    velocityInput.value = value; // Update input field
    // Update velocity if cube is currently moving
    if (!cubeSettings.paused) {
        setCubeVelocity();
    }
});

// Update cube settings when inputs are changed
initialDistanceInput.addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    cubeSettings.initialDistance = value;
    initialDistanceSlider.value = value; // Update slider
    initialDistanceValue.textContent = value; // Update display value
    // Update cube position immediately
    if (cubeSettings.axis === 'x') {
        cubeBody.position.x = value;
    } else {
        cubeBody.position.y = value;
    }
});

finalDistanceInput.addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    cubeSettings.finalDistance = value;
    finalDistanceSlider.value = value; // Update slider
    finalDistanceValue.textContent = value; // Update display value
});

velocityInput.addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    cubeSettings.velocity = value;
    velocitySlider.value = value; // Update slider
    velocityValue.textContent = value; // Update display value
    // Update velocity if cube is currently moving
    if (!cubeSettings.paused) {
        setCubeVelocity();
    }
});
// ==========================================================================================
//                              ANIMATION
// ==========================================================================================
function animate() {
    requestAnimationFrame(animate);

    if (!cubeSettings.paused) {
        world.fixedStep();

        const currentPosition = cubeSettings.axis === 'x' ? cubeBody.position.x : cubeBody.position.y;
        cubeSettings.distanceTraveled = Math.abs(currentPosition - cubeSettings.initialDistance);

        // Update travel time if the cube is moving
        if (cubeSettings.travelStartTime !== null) {
            const currentTime = performance.now();
            // Calculate elapsed time in seconds
            cubeSettings.travelTimeDisplay = ((currentTime - cubeSettings.travelStartTime) / 1000).toFixed(2); // Update travel time display dynamically
        }
        distanceDisplay.textContent = `Distance Traveled: ${cubeSettings.distanceTraveled.toFixed(2)} units`;


           // Check if the cube has reached the final distance
        finalDistance();
    }
    
    document.getElementById('travel-time').innerText = `Travel Time: ${cubeSettings.travelTimeDisplay} s`;
    // Fuse Mesh and Body
    cubeMesh.position.copy(cubeBody.position);
    cubeMesh.quaternion.copy(cubeBody.quaternion);



    // Step the physics world
    world.step(1 / 60);


    renderer.render(scene, camera);
}
animate();
