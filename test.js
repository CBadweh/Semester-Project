import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as dat from 'dat.gui';
import groundT from './groundT.jpg';
import sea from "./sea.jpg"

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
// Scene background (this will be your sky)
// scene.background = new THREE.Color(0xff0000,); // Light blue (sky color)


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
    // const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, depthTest: false });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // Head of the Dog (BoxGeometry)
    const headGeometry = new THREE.BoxGeometry(1, 1, 1);
    // const headMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, depthTest: false });
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
const dog = createDog(0, 0, 2);
dog.scale.set(0.5, 0.5, 0.5);
dog.position.set(0, 0.5, 1);



// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================

// Function to create a house
function createHouse(width = 3, height = 3, depth = 3, roofHeight = 1) {
    const house = new THREE.Group(); // Create a group to hold all house parts

    // Create the house body (BoxGeometry)
    const bodyGeometry = new THREE.BoxGeometry(width, height, depth);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Brown color for walls
    const houseBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    houseBody.position.y = height / 2; // Center the house on y-axis
    house.add(houseBody);

    // Create the roof (ConeGeometry)
    const roofGeometry = new THREE.ConeGeometry(width * 0.75, roofHeight, 4); // Base size, height, 4 segments for pyramid shape
    const roofMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color for roof
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = height + roofHeight / 2; // Position roof on top of the house body
    roof.rotation.y = Math.PI / 4; // Rotate roof to align with the square house body
    house.add(roof);

    // Optionally: Add a door (thin BoxGeometry)
    const doorGeometry = new THREE.BoxGeometry(width * 0.3, height * 0.5, depth * 0.05); // Door size relative to house
    const doorMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 }); // Dark brown for the door
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, height * 0.25, depth / 2 + 0.03); // Position door at the front of the house
    house.add(door);

    return house; // Return the complete house group
}

// Create and add houses to the scene
const house1 = createHouse(); // Default house
house1.position.set(-10, 0, 0); // Position the house
scene.add(house1);

const house2 = createHouse(6, 4, 6, 2.5); // Custom house with different dimensions
house2.position.set(10, 0, 0);
scene.add(house2);

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



dog.renderOrder = 10; // Higher number means it will render after the trees and houses
tree1.renderOrder = 0;
tree2.renderOrder = 0;
house1.renderOrder =-1;
house2.renderOrder = -1;

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
