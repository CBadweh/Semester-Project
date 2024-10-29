
    // import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
    // import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17.0/dist/lil-gui.esm.min.js';

    // // Basic Scene Setup
    // const scene = new THREE.Scene();
    // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // const renderer = new THREE.WebGLRenderer();
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // document.body.appendChild(renderer.domElement);

    // // Create a moving cube
    // const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    // // Position the camera
    // camera.position.z = 5;

    // // Variables for Timer
    // let startTime = null;
    // let elapsedTime = 0;
    // let isMoving = false;

    // // GUI for elapsed time display
    // const gui = new GUI();
    // const timerData = { elapsedTime: 0 };
    // gui.add(timerData, 'elapsedTime').name('Time (s)').listen();

    // // Start Movement and Timer
    // function startMovement() {
    //   startTime = performance.now();
    //   isMoving = true;
    // }

    // // Animation Loop
    // function animate() {
    //   requestAnimationFrame(animate);

    //   // Update elapsed time if the object is moving
    //   if (isMoving) {
    //     elapsedTime = (performance.now() - startTime) / 1000; // Calculate time in seconds
    //     timerData.elapsedTime = elapsedTime.toFixed(2); // Update GUI display
    //     cube.position.x += 0.01; // Move the cube

    //     // Stop movement after 3 seconds (example condition)
    //     if (elapsedTime >= 3) {
    //       isMoving = false; // Stop the movement
    //     }
    //   }

    //   renderer.render(scene, camera);
    // }

    // // Start the movement when the page loads
    // startMovement();
    // animate();

    // // Handle window resizing
    // window.addEventListener('resize', () => {
    //   renderer.setSize(window.innerWidth, window.innerHeight);
    //   camera.aspect = window.innerWidth / window.innerHeight;
    //   camera.updateProjectionMatrix();
    // });
    import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
    import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17.0/dist/lil-gui.esm.min.js';
    import * as CANNON from 'cannon-es';

    // Basic Scene Setup
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

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setClearColor(0xffffff, 1); // Set background to white
    document.body.appendChild(renderer.domElement);
    
  
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
     
    
    const groundGeometry = new THREE.BoxGeometry(100, 0.5, 1)
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x000000});
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    scene.add(ground);
    ground.position.y =0.5/2;
    ground.position.set(0, -0.5/2, 0);
   
    const world = new CANNON.World();
    world.gravity.set(0, 0, 0); // No default gravity

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

    
    // Cube settings
    const cubeSettings = {
        axis: 'x', // Control axis: 'x' or 'y'
        velocity: 1, // Control velocity
        paused: true,
        initialDistance: 0, // Initial distance from the origin
        finalDistance: 1,

        travelTimeDisplay: 0, // Display calculated travel time
        travelStartTime: null, // Track when travel starts
        distanceTraveled: 0, // New property for distance traveled

        startMoving: () => {
            // Set initial position based on the selected axis
            if (cubeSettings.axis === 'x') {
                cubeMesh.position.set(cubeSettings.initialDistance, 0.5, 0);
            } else {
                cubeMesh.position.set(0, cubeSettings.initialDistance + 0.5, 0);
            }
            setCubeVelocity();
            const distanceToTravel = Math.abs(cubeSettings.finalDistance - cubeSettings.initialDistance);
            cubeSettings.distanceTraveled = 0;
            cubeSettings.paused = false; // Start movement
            cubeSettings.travelStartTime = performance.now(); // Start timer
        },
        togglePause: () => {
            cubeSettings.paused = !cubeSettings.paused;
            if (cubeSettings.paused) {
                cubeSettings.travelStartTime = null; // Stop the timer
            } else {
                cubeSettings.travelStartTime = performance.now(); // Restart timer
            }
        },
    };
    
    function setCubeVelocity() {
        // Set the velocity for the cube
        if (cubeSettings.axis === 'x') {
            cubeMesh.userData.velocity = new THREE.Vector3(cubeSettings.velocity, 0, 0); // Set x-axis velocity
        } else {
            cubeMesh.userData.velocity = new THREE.Vector3(0, cubeSettings.velocity, 0); // Set y-axis velocity
        }
    }
    
    // Reset function
    function resetCube() {
        cubeMesh.position.set(0, 0.5, 0); // Reset cube position
        cubeMesh.userData.velocity = new THREE.Vector3(0, 0, 0); // Reset velocity
        cubeSettings.distanceTraveled = 0; // Reset distance
        cubeSettings.travelTimeDisplay = 0; // Reset travel time
    }
    
    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
    
        if (!cubeSettings.paused) {
            const elapsedTime = performance.now() - (cubeSettings.travelStartTime || performance.now());
            cubeSettings.travelTimeDisplay = (elapsedTime / 1000).toFixed(2); // Update travel time
    
            // Update cube position based on its velocity
            if (cubeSettings.axis === 'x') {
                cubeMesh.position.x += cubeMesh.userData.velocity.x * (1 / 60); // Move the cube along x-axis
            } else {
                cubeMesh.position.y += cubeMesh.userData.velocity.y * (1 / 60); // Move the cube along y-axis
            }
    
            // Update distance traveled
            cubeSettings.distanceTraveled = Math.abs(cubeMesh.position[cubeSettings.axis] - cubeSettings.initialDistance);
    
            // Stop cube at final distance
            if (cubeSettings.axis === 'x' && cubeMesh.position.x >= cubeSettings.finalDistance) {
                cubeMesh.position.x = cubeSettings.finalDistance; // Correct position
                cubeSettings.paused = true; // Pause movement
            } else if (cubeSettings.axis === 'y' && cubeMesh.position.y >= cubeSettings.finalDistance) {
                cubeMesh.position.y = cubeSettings.finalDistance; // Correct position
                cubeSettings.paused = true; // Pause movement
            }
        }
    
        // Display distance and time
        document.getElementById('travel-time').innerText = `Travel Time: ${cubeSettings.travelTimeDisplay} s`;
        document.getElementById('distance-display').innerText = `Distance Traveled: ${cubeSettings.distanceTraveled.toFixed(2)} units`;
    
        renderer.render(scene, camera);
    }

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
        
    // GUI Controls
    const gui = new GUI();
    gui.add(cubeSettings, 'velocity', -20, 20).name('Velocity').step(0.1);
    gui.add(cubeSettings, 'startMoving').name('Start Moving');
    gui.add(cubeSettings, 'togglePause').name('Pause/Resume');
    gui.add({ Reset: resetCube }, 'Reset').name('Reset Cube');
    // gui.add(cubeSettings, 'initialDistance', -10, 10).name('Initial Distance').step(0.1);
    
    gui.add(cubeSettings, 'initialDistance', -10, 10).name('Initial Distance').step(0.1).onChange((value) => {
      // Update the cube's position immediately based on the selected axis
      if (cubeSettings.axis === 'x') {
          cubeBody.position.x = value; // Set the x position
      } else {
          cubeBody.position.y = value; // Set the y position
      }
  });
    gui.add(cubeSettings, 'finalDistance', -10, 10).name('Final Distance').step(0.1);
    gui.add(cubeSettings, 'distanceTraveled').name('Distance Traveled').listen();
    gui.add(cubeSettings, 'travelTimeDisplay').name('Travel Time Display (s)').listen();
    
    // Start Animation
    animate();
    
    // Handle window resizing
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
    