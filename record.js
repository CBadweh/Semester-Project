import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17.0/dist/lil-gui.esm.min.js';

// Basic Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cube setup
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.z = 5;

// GUI setup
const gui = new GUI();
const cubeSettings = {
    initialDistance: 0,
    finalDistance: 5,
    velocity: 0.05,
    isMoving: false,
    distanceTraveled: 0,
    
    recordPath: [],
    playbackSpeed: 1,
};

// Variables for recording and playback
let isRecording = false;
let isPlayingBack = false;
let startTime = null;

// Record the cube's movement
function startRecording() {
    cubeSettings.recordPath = []; // Clear previous path
    isRecording = true;
}

function stopRecording() {
    isRecording = false;
}

// Playback recorded path
function startPlayback() {
    if (cubeSettings.recordPath.length > 0) {
        isPlayingBack = true;
        playbackIndex = 0;
    }
}

// Update position and record if active
function moveCube() {
    if (!cubeSettings.isMoving) return;

    const direction = cubeSettings.finalDistance > cubeSettings.initialDistance ? 1 : -1;
    const movement = direction * cubeSettings.velocity;

    // Update position and distance
    cube.position.x += movement;
    cubeSettings.distanceTraveled = Math.abs(cube.position.x - cubeSettings.initialDistance);

    // Record position if recording is on
    if (isRecording) {
        cubeSettings.recordPath.push({ x: cube.position.x, timestamp: performance.now() });
    }

    // Stop movement if reached the final distance
    if (direction > 0 && cube.position.x >= cubeSettings.finalDistance ||
        direction < 0 && cube.position.x <= cubeSettings.finalDistance) {
        cubeSettings.isMoving = false;
        stopRecording();
    }
}

// Playback function
let playbackIndex = 0;
function playbackRecordedPath() {
    if (!isPlayingBack || playbackIndex >= cubeSettings.recordPath.length) return;

    const record = cubeSettings.recordPath[playbackIndex];
    cube.position.x = record.x;
    playbackIndex++;

    if (playbackIndex >= cubeSettings.recordPath.length) {
        isPlayingBack = false;
    }
}

// Animate loop
function animate() {
    requestAnimationFrame(animate);

    if (cubeSettings.isMoving) {
        moveCube();
    }

    if (isPlayingBack) {
        playbackRecordedPath();
    }

    renderer.render(scene, camera);
}

animate();

// GUI Controls
gui.add(cubeSettings, 'initialDistance', -10, 10).name('Initial Distance').onChange(value => {
    cube.position.x = value;
});
gui.add(cubeSettings, 'finalDistance', -10, 10).name('Final Distance');
gui.add(cubeSettings, 'velocity', 0.01, 0.5).name('Velocity');
gui.add(cubeSettings, 'isMoving').name('Start Moving').onChange(value => {
    if (value) startRecording();
});
gui.add(cubeSettings, 'distanceTraveled').name('Distance Traveled').listen();
gui.add(cubeSettings, 'playbackSpeed', 0.5, 2).name('Playback Speed');
gui.add({ startPlayback }, 'startPlayback').name('Play Recording');
gui.add({ stopRecording }, 'stopRecording').name('Stop Recording');
