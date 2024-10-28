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
//                              INIT GUI
// ==========================================================================================
// GUI Functions
function resetCube() {
    // Reset cube position to exactly 1 meter on the x-axis
    cubeBody.position.set(0, 0.5, 0); 
    cubeBody.velocity.set(0, 0, 0); // Reset velocity to 0
    cubeMesh.position.copy(cubeBody.position); // Update Three.js mesh position
}
// GUI Setup
const gui = new dat.GUI();

const cubeSettings = {
    color: cubeMesh.material.color.getHex(),
    axis: 'x', // Control axis: 'x' or 'y'
    velocity: 1, // Control velocity
    paused: false,
    initialDistance: 0, // Added distance tracking
    finalDistance: 5,
  
    startMoving: () => {
        // Reset position based on initial distance setting
        if (cubeSettings.axis === 'x') {
            cubeBody.position.set(cubeSettings.initialDistance, 0.5, 0);
            cubeBody.velocity.set(cubeSettings.velocity, 0, 0); // Apply velocity on start
        } else {
            cubeBody.position.set(0, cubeSettings.initialDistance + 0.5, 0);
            cubeBody.velocity.set(0, cubeSettings.velocity, 0); // Apply velocity on start
        }
        cubeBody.velocity.set(cubeSettings.velocity, 0, 0);
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
        cubeBody.velocity.set(cubeSettings.velocity, 0, 0);
    } else {
        // Set velocity based on axis
        if (cubeSettings.axis === 'x') {
            cubeBody.velocity.set(cubeSettings.velocity, 0, 0);
        } else {
            cubeBody.velocity.set(0, cubeSettings.velocity, 0);
        }
    }
}



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






// ==========================================================================================
//                              ANIMATION
// ==========================================================================================
function animate() {
    requestAnimationFrame(animate);

    if (!cubeSettings.paused) {
        world.fixedStep();
    }
    
     // Check if the cube has reached the final distance
     if (cubeSettings.axis === 'x') {
        if (cubeBody.position.x >= cubeSettings.finalDistance) {
            cubeBody.velocity.set(0, 0, 0); // Stop when reaching final distance
            cubeBody.position.x = cubeSettings.finalDistance; // Correct position
        }
    } else {
        if (cubeBody.position.y >= cubeSettings.finalDistance) {
            cubeBody.velocity.set(0, 0, 0); // Stop when reaching final distance
            cubeBody.position.y = cubeSettings.finalDistance; // Correct position
        }
    }
    // Fuse Mesh and Body
    cubeMesh.position.copy(cubeBody.position);
    cubeMesh.quaternion.copy(cubeBody.quaternion);

    // Update distance traveled
    cubeSettings.distance = Math.abs(cubeBody.position.x) + Math.abs(cubeBody.position.y); // Use the length for 2D distance
    cubeSettings.distance = parseFloat(cubeSettings.distance.toFixed(2)); // Ensure two decimal precision

    // Step the physics world
    world.step(1 / 60);


    renderer.render(scene, camera);
}
animate();
