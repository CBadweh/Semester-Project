// Import Three.js and dat.GUI
import * as THREE from 'three';
import { GUI } from 'dat.gui';

// Basic Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a Cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.z = 5;

// GUI Setup
const gui = new GUI();
const params = { distance: 0, time: 0, recording: false };
gui.add(params, 'distance').name('Distance');
gui.add(params, 'time').name('Time');
const toggleRecordingButton = gui.add(params, 'recording').name('Start Moving').onChange(toggleRecording);

// Movement, Time, and Recording Variables
let startTime = 0;
let isRecording = false;
let recordedData = [];
let playbackIndex = 0;
let isPlayingBack = false;
let isPaused = false;
let playbackRequest;

// Toggle Recording Function
function toggleRecording() {
    if (isRecording) {
        stopRecording();
        toggleRecordingButton.name('Start Moving');
    } else {
        startRecording();
        toggleRecordingButton.name('Stop Moving');
    }
}

// Start Recording Function
function startRecording() {
    recordedData = [];
    startTime = performance.now();
    isRecording = true;
    params.distance = 0;
    params.time = 0;
}

// Stop Recording Function
function stopRecording() {
    isRecording = false;
    params.moving = false; // Stop movement
}

// Playback with Pause and Resume from Last Position
function playback() {
    if (!isPlayingBack) {
        isPlayingBack = true;
        isPaused = false;
        document.getElementById('playback').innerText = 'Pause Playback';
        playbackRequest = requestAnimationFrame(playbackLoop);
    } else if (isPlayingBack && isPaused) {
        isPaused = false;
        document.getElementById('playback').innerText = 'Pause Playback';
        playbackRequest = requestAnimationFrame(playbackLoop); // Resume from last paused position
    } else {
        isPaused = true;
        document.getElementById('playback').innerText = 'Resume Playback';
        cancelAnimationFrame(playbackRequest); // Pause playback
    }
}

function playbackLoop() {
    if (playbackIndex < recordedData.length && !isPaused) {
        const data = recordedData[playbackIndex];
        cube.position.copy(data.position);
        params.distance = data.distance;
        params.time = data.time;
        playbackIndex++;
        gui.updateDisplay();
        playbackRequest = requestAnimationFrame(playbackLoop);
    } else if (playbackIndex >= recordedData.length) {
        // End playback if we've reached the end of the recording
        isPlayingBack = false;
        playbackIndex = 0; // Reset for next playback session if needed
      
    }
}

// Animation Loop with Movement and Recording
function animate() {
    requestAnimationFrame(animate);

    if (isRecording) {
        // Calculate time and distance
        const elapsedTime = (performance.now() - startTime) / 1000;
        cube.position.x += 0.01; // Move cube on x-axis
        params.distance = cube.position.x;
        params.time = elapsedTime;

        // Record position, time, and distance
        recordedData.push({
            position: cube.position.clone(),
            time: elapsedTime,
            distance: params.distance
        });
        gui.updateDisplay();
    }

    renderer.render(scene, camera);
}

// HTML Button Event Listeners for Playback Controls
document.getElementById('playback').onclick = playback;
const startMoving = document.getElementById('startMoving');
startMoving.addEventListener('click', () => {
    toggleRecording();
});

animate();
