import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as dat from 'dat.gui';
import groundT from './groundT.jpg';

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
const textureLoader = new THREE.TextureLoader();
const boxTexture = textureLoader.load(groundT);

const groundGeometry = new THREE.BoxGeometry(100, 0.5, 1)
const groundMaterial = new THREE.MeshBasicMaterial({ map: boxTexture});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
scene.add(ground);
ground.position.y = 0.5 / 2;
ground.position.set(0, -0.5 / 2, 0);
// ==========================================================================================
// ==========================================================================================

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
        scene.add(numberSprite);
    }
}

// Call the function to create meter marks
createMeterMarks();

// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================

// Perfect one Zoom in/out with limit
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
dog.position.set(0, 0.5, 1);

// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================

// Set up Cannon.js physics world
const world = new CANNON.World();
world.gravity.set(0, 0, 0); // No default gravity

// Add lights (optional in 2D, but kept for visibility)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

// Create the dog body for physics
const dogBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 0.5, 1), // Adjusted position for the dog
});

dogBody.addShape(new CANNON.Box(new CANNON.Vec3(1.5, 0.5, 0.5))); // Dimensions for the dog's physics shape
world.addBody(dogBody);

// GUI setup
const gui = new dat.GUI();
const dogSettings = {
    velocity: 0,
    paused: false,
};

// GUI controls
gui.add(dogSettings, 'velocity', -20, 20).step(0.1).onChange((value) => {
    dogBody.velocity.set(value, 0, 0); // Setting velocity to dog in the physics world
});

gui.add(dogSettings, 'paused').name('Pause');

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update the physics world
    world.step(1 / 60); // Step the physics world

    // Sync dog position with its physics body
    dog.position.copy(dogBody.position);
    dog.quaternion.copy(dogBody.quaternion);

    renderer.render(scene, camera);
}

// Start the animation loop
animate();
