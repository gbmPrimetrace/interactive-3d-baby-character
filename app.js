/**
 * Simple 3D Baby Character with Basic Lip-Sync
 * 
 * Features:
 * - Microphone input detection
 * - API response generation
 * - Simple phoneme-to-morph-target mapping
 * - Basic lip-sync animation on body mesh only
 */

class SimpleBabyCharacter {
    constructor() {
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.babyModel = null;
        this.mixer = null;
        this.clock = new THREE.Clock();

        // Simple lip-sync system
        this.lipSyncSystem = new SimpleLipSyncSystem();

        // Initialize API mode (start with mock for testing)
        this.useRealAPI = false;

        // Audio components
        this.audioContext = null;
        this.audioElement = null;
        this.currentAudioUrl = null;
        this.currentText = null;

        // Character state
        this.isSpeaking = false;
        this.morphTargets = {};
        this.mainMesh = null;

        // Speech recognition
        this.recognition = null;
        this.isRecording = false;

        // Speech display
        this.speechDisplay = null;
        this.currentUserSpeech = '';
        this.currentBabySpeech = '';

        // Animation system
        this.lipSyncTimeouts = [];
        this.currentViseme = null;
        this.visemeTransitionDuration = 0.1;

        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupSpeechRecognition();
        this.setupEventListeners();

        // Load the 3D model
        await this.loadBabyModel();

        // Initialize speech display
        this.speechDisplay = document.getElementById('speech-display');

        // Initialize emotion system
        this.initializeEmotionSystem();

        // Start animation loop
        this.animate();

        // Hide loading screen
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }

        this.updateStatus('Ready! Click 🎤 to speak or test the simple lip-sync system! 🎭✨');
    }

    /**
     * Setup Three.js scene
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xE6E8E6);

        // Add ambient lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Add directional lighting
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Add hair-specific lighting for enhanced realism
        const hairLight = new THREE.DirectionalLight(0xfff5e6, 0.4); // Warm light for hair
        hairLight.position.set(-3, 4, 2);
        this.scene.add(hairLight);

        // Add rim lighting for hair depth
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
        rimLight.position.set(0, 0, -3);
        this.scene.add(rimLight);
    }

    /**
     * Setup camera
     */
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Position camera for optimal viewing
        this.camera.position.set(0, 0.5, 2.5);

        // Mobile adjustments
        if (window.innerWidth <= 768) {
            this.camera.position.set(0, 0.3, 2.8);
        }
    }

    /**
     * Setup renderer
     */
    setupRenderer() {
        const canvas = document.getElementById('canvas');

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Handle different Three.js versions
        if (THREE.sRGBEncoding !== undefined) {
            this.renderer.outputEncoding = THREE.sRGBEncoding;
        } else if (this.renderer.outputColorSpace !== undefined) {
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        }

        if (THREE.ACESFilmicToneMapping !== undefined) {
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        }

        this.renderer.toneMappingExposure = 1.0;

        // Add subtle environment map for hair reflections
        this.setupEnvironmentMap();
    }

    /**
     * Setup environment map for enhanced reflections
     */
    setupEnvironmentMap() {
        try {
            // Create a subtle environment map for hair reflections
            const envMap = new THREE.CubeTextureLoader().load([
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // right
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // left
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // top
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfNcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // bottom
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // front
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='  // back
            ]);

            this.scene.environment = envMap;
            this.scene.environment.intensity = 0.3; // Subtle reflection
            console.log('🎨 Environment map setup complete for hair reflections');
        } catch (error) {
            console.log('🎨 Environment map setup failed, continuing without it');
        }
    }

    /**
     * Setup camera controls
     */
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.minDistance = .9;
        this.controls.maxDistance = 1.1;

        // Mobile optimizations
        if (window.innerWidth <= 768) {
            this.controls.enableDamping = false;
            this.controls.rotateSpeed = 0.8;
        }
    }

    /**
     * Initialize emotion system
     */
    initializeEmotionSystem() {
        // Set up emotion button event listeners
        const emotionButtons = document.querySelectorAll('.emotion-btn');
        const intensitySlider = document.getElementById('emotion-intensity');
        const intensityValue = document.getElementById('intensity-value');

        // Update intensity display
        if (intensitySlider && intensityValue) {
            intensitySlider.addEventListener('input', (e) => {
                const value = e.target.value;
                intensityValue.textContent = `${value}%`;
            });
        }

        // Add emotion button listeners
        emotionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const emotion = button.dataset.emotion;
                const intensity = (intensitySlider ? intensitySlider.value / 100 : 1.0);
                this.applyEmotion(emotion, intensity);
            });
        });

        console.log('🎭 Emotion system initialized!');
    }

    /**
     * Apply emotion preset using simple morph targets
     */
    applyEmotion(emotion, intensity = 1.0) {
        if (!this.mainMesh || !this.morphTargets) {
            console.warn('🎭 Cannot apply emotion: model not loaded');
            return;
        }

        // Reset all morph targets first
        this.resetToNeutral();

        // Complete emotion mapping using actual morph target names
        const emotionMorphs = {
            'happy': { 'Mouth_Smile_L': 0.8, 'Mouth_Smile_R': 0.8, 'Eye_Blink_L': 0.3, 'Eye_Blink_R': 0.3 },
            'sad': { 'Mouth_Frown_L': 0.7, 'Mouth_Frown_R': 0.7, 'Brow_Drop_L': 0.6, 'Brow_Drop_R': 0.6 },
            'angry': { 'Mouth_Press_L': 0.8, 'Mouth_Press_R': 0.8, 'Brow_Drop_L': 0.8, 'Brow_Drop_R': 0.8, 'Eye_Squint_L': 0.6, 'Eye_Squint_R': 0.6 },
            'surprised': { 'Jaw_Open': 0.7, 'Eye_Wide_L': 0.8, 'Eye_Wide_R': 0.8, 'Brow_Raise_Outer_L': 0.7, 'Brow_Raise_Outer_R': 0.7 },
            'disgust': { 'Mouth_Press_L': 0.8, 'Mouth_Press_R': 0.8, 'Nose_Sneer_L': 0.6, 'Nose_Sneer_R': 0.6, 'Brow_Drop_L': 0.5, 'Brow_Drop_R': 0.5 },
            'fear': { 'Mouth_Press_L': 0.8, 'Mouth_Press_R': 0.8, 'Eye_Wide_L': 0.8, 'Eye_Wide_R': 0.8, 'Brow_Raise_Outer_L': 0.7, 'Brow_Raise_Outer_R': 0.7 },
            'contempt': { 'Mouth_Press_L': 0.8, 'Mouth_Press_R': 0.8, 'Mouth_Dimple_L': 0.6, 'Mouth_Dimple_R': 0.6, 'Brow_Drop_L': 0.5, 'Brow_Drop_R': 0.5 },
            'neutral': {}
        };

        const morphs = emotionMorphs[emotion] || {};

        // Apply emotions with smooth transitions
        this.applyEmotionSmoothly(morphs, intensity);

        console.log(`🎭 Applied emotion: ${emotion} with intensity: ${intensity}`);
    }

    /**
     * Apply emotion with smooth transitions
     */
    applyEmotionSmoothly(morphs, intensity) {
        const steps = 15; // Number of steps for smooth transition
        const stepDuration = 0.05; // 50ms per step
        let currentStep = 0;

        const animateStep = () => {
            if (currentStep >= steps) return;

            // Calculate current value (0 to target)
            const progress = currentStep / steps;
            const easeValue = this.easeInOutCubic(progress);

            Object.entries(morphs).forEach(([morphTarget, targetValue]) => {
                const currentValue = targetValue * intensity * easeValue;
                this.applyMorphTarget(morphTarget, currentValue);
            });

            currentStep++;

            if (currentStep < steps) {
                setTimeout(animateStep, stepDuration * 1000);
            }
        };

        animateStep();
    }

    /**
     * Easing function for smooth transitions
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Apply individual morph target with value
     * Handles both left and right sides for symmetrical expressions
     */
    applyMorphTarget(morphTarget, value) {
        if (!this.mainMesh || !this.morphTargets) {
            console.warn('🎭 Cannot apply morph target: model or morphTargets not ready');
            return;
        }

        // Handle symmetrical blend shapes (both left and right sides)
        if (morphTarget.includes('_L')) {
            // Apply left side
            const leftIndex = this.morphTargets[morphTarget];
            if (leftIndex !== undefined) {
                this.mainMesh.morphTargetInfluences[leftIndex] = value;
                console.log(`🎭 Applied LEFT: ${morphTarget} = ${value}`);
            } else {
                console.warn(`🎭 Left morph target ${morphTarget} not found`);
            }

            // Also apply right side for symmetry
            const rightMorphTarget = morphTarget.replace('_L', '_R');
            const rightIndex = this.morphTargets[rightMorphTarget];
            if (rightIndex !== undefined) {
                this.mainMesh.morphTargetInfluences[rightIndex] = value;
                console.log(`🎭 Applied RIGHT: ${rightMorphTarget} = ${value}`);
            } else {
                console.warn(`🎭 Right side morph target ${rightMorphTarget} not found`);
            }
        } else if (morphTarget.includes('_R')) {
            // Apply right side
            const rightIndex = this.morphTargets[morphTarget];
            if (rightIndex !== undefined) {
                this.mainMesh.morphTargetInfluences[rightIndex] = value;
                console.log(`🎭 Applied RIGHT: ${morphTarget} = ${value}`);
            } else {
                console.warn(`🎭 Right morph target ${morphTarget} not found`);
            }

            // Also apply left side for symmetry
            const leftMorphTarget = morphTarget.replace('_R', '_L');
            const leftIndex = this.morphTargets[leftMorphTarget];
            if (leftIndex !== undefined) {
                this.mainMesh.morphTargetInfluences[leftIndex] = value;
                console.log(`🎭 Applied LEFT: ${leftMorphTarget} = ${value}`);
            } else {
                console.warn(`🎭 Left side morph target ${leftMorphTarget} not found`);
            }
        } else {
            // Non-symmetrical morph target (like Jaw_Open, Mouth_Close, etc.)
            const targetIndex = this.morphTargets[morphTarget];
            if (targetIndex !== undefined) {
                this.mainMesh.morphTargetInfluences[targetIndex] = value;
                console.log(`🎭 Applied CENTER: ${morphTarget} = ${value}`);
            } else {
                console.warn(`🎭 Morph target ${morphTarget} not found`);
            }
        }

        // Force updates
        this.mainMesh.morphTargetInfluencesNeedUpdate = true;
    }

    /**
     * Setup speech recognition
     */
    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 1;

            this.recognition.onstart = () => {
                this.isRecording = true;
                document.getElementById('micButton').classList.add('recording');
                this.updateStatus('Listening...');
            };

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Show real-time input
                if (interimTranscript) {
                    this.showUserSpeech(interimTranscript, false);
                }

                // Process final result
                if (finalTranscript) {
                    this.showUserSpeech(finalTranscript, true);
                    this.updateStatus(`Heard: "${finalTranscript}"`);
                    this.processUserSpeech(finalTranscript);
                }
            };

            this.recognition.onerror = (event) => {
                this.updateStatus('Speech recognition error. Please try again.');
                this.stopRecording();
            };

            this.recognition.onend = () => {
                this.stopRecording();
            };
        } else {
            this.updateStatus('Speech recognition not supported in this browser');
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Microphone button
        document.getElementById('micButton').addEventListener('click', () => {
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        });

        // Reset camera button
        document.getElementById('resetButton').addEventListener('click', () => {
            this.resetCamera();
        });

        // Test lip-sync button
        document.getElementById('testLipSync').addEventListener('click', () => {
            this.testLipSyncSystem();
        });



        // Test audio lip-sync button
        document.getElementById('testAudioLipSync').addEventListener('click', () => {
            this.testAudioLipSyncSystem();
        });

        // Toggle API button
        document.getElementById('toggleAPI').addEventListener('click', () => {
            this.toggleAPI();
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);

            // Adjust camera position for mobile
            if (window.innerWidth <= 768) {
                this.camera.position.set(0, 0.3, 2.8);
                if (this.controls) {
                    this.controls.enableDamping = false;
                    this.controls.rotateSpeed = 0.8;
                }
            } else {
                this.camera.position.set(0, 0.5, 2.5);
                if (this.controls) {
                    this.controls.enableDamping = true;
                    this.controls.rotateSpeed = 1.0;
                }
            }
        });
    }

    /**
     * Load the 3D baby model
     */
    async loadBabyModel() {
        const loader = new THREE.FBXLoader();

        try {
            console.log('🚀 Starting 3D model loading...');
            this.babyModel = await new Promise((resolve, reject) => {
                const possiblePaths = [
                    'src/baby.fbx',
                    './src/baby.fbx',
                    'baby.fbx',
                    './baby.fbx'
                ];

                const tryLoad = (index) => {
                    if (index >= possiblePaths.length) {
                        reject(new Error('Failed to load model from all possible paths'));
                        return;
                    }

                    const path = possiblePaths[index];
                    console.log(`🔍 Trying to load model from: ${path}`);

                    loader.load(
                        path,
                        (object) => {
                            console.log('✅ Model loaded successfully:', object);
                            console.log('📊 Model info:', {
                                children: object.children.length,
                                animations: object.animations.length,
                                hasMorphTargets: object.morphTargetDictionary ? Object.keys(object.morphTargetDictionary).length : 0
                            });
                            resolve(object);
                        },
                        (progress) => {
                            const percent = (progress.loaded / progress.total * 100).toFixed(0);
                            document.getElementById('loading').textContent = `Loading 3D Model... ${percent}%`;
                            console.log(`📈 Loading progress: ${percent}%`);
                        },
                        (error) => {
                            console.error(`❌ Failed to load from ${path}:`, error);
                            tryLoad(index + 1);
                        }
                    );
                };

                tryLoad(0);
            });

            console.log('🎯 Model loaded, setting up...');
            // Setup the model
            this.setupModel();

        } catch (error) {
            console.error('💥 Model loading failed:', error);
            this.updateStatus('Error loading 3D model - check console for details');

            document.getElementById('loading').innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h3>❌ 3D Model Loading Failed</h3>
                    <p>Error: ${error.message}</p>
                    <p>Please check the browser console for more details.</p>
                </div>
            `;
        }
    }

    /**
     * Setup the loaded 3D model
     */
    setupModel() {
        if (!this.babyModel) return;

        console.log('🔧 Setting up model...');
        console.log('📐 Model scale and position...');

        // Scale and position the model
        this.babyModel.scale.setScalar(0.01);
        this.babyModel.position.set(0, 0, 0);

        // Apply materials and find morph targets
        this.babyModel.traverse((child) => {
            if (child.isMesh) {
                console.log(`🔍 Checking mesh: ${child.name} - Morph targets: ${child.morphTargetDictionary ? Object.keys(child.morphTargetDictionary).length : 0}`);
                if (child.morphTargetDictionary && Object.keys(child.morphTargetDictionary).length > 0) {
                    console.log(`🔍 Available morph targets in ${child.name}:`, Object.keys(child.morphTargetDictionary));
                }

                // Check if this is the body mesh that needs alpha map
                const isBodyMesh = child.name.toLowerCase().includes('body') ||
                    (child.material && child.material.name && child.material.name.toLowerCase().includes('body'));

                if (isBodyMesh) {
                    // Load alpha map for body mesh
                    const textureLoader = new THREE.TextureLoader();
                    const alphaMapPaths = [
                        'src/body__Opacity.jpg',
                        './src/body__Opacity.jpg',
                        'body__Opacity.jpg',
                        './body__Opacity.jpg'
                    ];

                    let alphaMap = null;
                    for (let i = 0; i < alphaMapPaths.length; i++) {
                        try {
                            alphaMap = textureLoader.load(alphaMapPaths[i]);
                            break;
                        } catch (error) {
                            // Continue to next path
                        }
                    }

                    // Create material with alpha map
                    const bodyMaterial = new THREE.MeshStandardMaterial({
                        color: child.material?.color || 0xffffff,
                        map: child.material?.map || null,
                        normalMap: child.material?.normalMap || null,
                        roughnessMap: child.material?.roughnessMap || null,
                        aoMap: child.material?.aoMap || null,
                        alphaMap: alphaMap,
                        alphaTest: 0.5,
                        transparent: true,
                        side: THREE.DoubleSide,
                        roughness: 0.5,
                        metalness: 0.1,
                        skinning: child.isSkinnedMesh || false // Preserve skinning for SkinnedMesh objects
                    });

                    child.material = bodyMaterial;
                } else if (child.name.toLowerCase().includes('hair')) {
                    // Enhanced hair material with realistic shaders
                    const hairMaterial = new THREE.MeshStandardMaterial({
                        color: child.material?.color || 0x8B4513, // Brown hair color
                        map: child.material?.map || null,
                        normalMap: child.material?.normalMap || null,
                        roughnessMap: child.material?.roughnessMap || null,
                        aoMap: child.material?.aoMap || null,
                        transparent: true,
                        opacity: 0.9,
                        roughness: 0.3, // Shiny hair
                        metalness: 0.0,
                        side: THREE.DoubleSide,
                        skinning: child.isSkinnedMesh || false, // Preserve skinning for SkinnedMesh objects
                        // Enhanced hair properties
                        envMapIntensity: 1.2
                    });

                    child.material = hairMaterial;
                } else {
                    // Apply standard material for other meshes
                    const standardMaterial = new THREE.MeshStandardMaterial({
                        color: child.material?.color || 0xffffff,
                        map: child.material?.map || null,
                        normalMap: child.material?.normalMap || null,
                        roughnessMap: child.material?.roughnessMap || null,
                        aoMap: child.material?.aoMap || null,
                        transparent: child.material?.transparent || false,
                        opacity: child.material?.opacity !== undefined ? child.material.opacity : 1,
                        roughness: 0.5,
                        metalness: 0.1,
                        skinning: child.isSkinnedMesh || false // Preserve skinning for SkinnedMesh objects
                    });

                    child.material = standardMaterial;
                }

                child.castShadow = true;
                child.receiveShadow = true;

                // Find mesh with morph targets (usually the main face mesh)
                if (child.morphTargetDictionary && Object.keys(child.morphTargetDictionary).length > 5) {
                    // Check if this mesh has any facial expression morph targets
                    // Look for common patterns in morph target names
                    const morphTargetNames = Object.keys(child.morphTargetDictionary);
                    const hasLipSyncTargets = morphTargetNames.some(name =>
                        name.toLowerCase().includes('eye') ||
                        name.toLowerCase().includes('mouth') ||
                        name.toLowerCase().includes('jaw') ||
                        name.toLowerCase().includes('brow') ||
                        name.toLowerCase().includes('cheek') ||
                        name.toLowerCase().includes('nose')
                    );

                    console.log(`🔍 Checking ${child.name} for lip-sync targets:`);
                    console.log(`🔍   Total morph targets: ${morphTargetNames.length}`);
                    console.log(`🔍   Sample targets: ${morphTargetNames.slice(0, 10).join(', ')}`);
                    console.log(`🔍   Has facial targets: ${hasLipSyncTargets ? '✅ Yes' : '❌ No'}`);

                    if (hasLipSyncTargets) {
                        // Priority: body mesh > other meshes, and more morph targets > fewer
                        const currentMorphCount = this.morphTargets ? Object.keys(this.morphTargets).length : 0;
                        const newMorphCount = Object.keys(child.morphTargetDictionary).length;

                        // Prefer body mesh or mesh with more morph targets
                        const shouldSelect = !this.mainMesh ||
                            newMorphCount > currentMorphCount ||
                            (child.name.toLowerCase().includes('body') && newMorphCount >= currentMorphCount);

                        if (shouldSelect) {
                            this.morphTargets = child.morphTargetDictionary;
                            this.mainMesh = child;

                            // Enable morph targets on material
                            child.material.morphTargets = true;

                            console.log('🎭 Found lip-sync mesh:', child.name);
                            console.log('🎭 Available morph targets:', Object.keys(child.morphTargetDictionary));
                        }
                    }
                }
            }
        });

        // Setup animations if available
        if (this.babyModel.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.babyModel);
            const idleAction = this.mixer.clipAction(this.babyModel.animations[0]);
            idleAction.play();
        }

        this.scene.add(this.babyModel);

        // Log final setup results
        if (this.mainMesh && this.morphTargets) {
            console.log('✅ Lip-sync setup complete!');
            console.log('✅ Main mesh:', this.mainMesh.name);
            console.log('✅ Morph targets count:', Object.keys(this.morphTargets).length);
            console.log('✅ Sample morph targets:', Object.keys(this.morphTargets).slice(0, 10));

            // Initialize lip-sync system with the detected morph targets
            this.lipSyncSystem.initializeMorphTargets(this.morphTargets);
            this.lipSyncSystem.setBodyMesh(this.mainMesh);
        } else {
            console.warn('⚠️ No lip-sync mesh found!');
            console.warn('⚠️ Available meshes:', this.babyModel.children.map(child => child.name));
        }
    }

    /**
     * Start recording user speech
     */
    async startRecording() {
        if (!this.recognition || this.isRecording) return;

        try {
            // Initialize audio context if needed
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
            }

            this.recognition.start();

        } catch (error) {
            this.updateStatus('Failed to start recording');
        }
    }

    /**
     * Stop recording
     */
    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
            document.getElementById('micButton').classList.remove('recording');
        }
    }

    /**
     * Process user speech input
     */
    async processUserSpeech(text) {
        this.updateStatus('Processing your speech...');

        try {
            // Generate baby response using API
            const response = await this.generateBabyResponse(text);

            if (response.success) {
                this.updateStatus('Baby is responding...');
                await this.playBabyResponse(response.textContent);
            } else {
                this.updateStatus('Failed to generate response');
            }
        } catch (error) {
            this.updateStatus('Error processing speech');
        }
    }

    /**
     * Generate baby response from API or mock
     */
    async generateBabyResponse(userText) {
        // Check if we should use real API or mock
        if (this.useRealAPI) {
            try {
                return await this.generateRealBabyResponse(userText);
            } catch (error) {
                console.log('Real API failed, falling back to mock');
                return this.generateMockResponse(userText);
            }
        } else {
            return this.generateMockResponse(userText);
        }
    }

    /**
     * Generate mock baby response for testing
     */
    generateMockResponse(userText) {
        // Simulate different types of responses based on input
        const responses = [
            {
                success: true,
                audioUrl: null, // No audio for demo - will use text-based animation
                textContent: `Hewwo, Baccha! I heard you say "${userText}". That's very interesting! I love talking to you!`
            },
            {
                success: true,
                audioUrl: null,
                textContent: `Oh my! You said "${userText}"! That makes me so happy! Can we play together?`
            },
            {
                success: true,
                audioUrl: null,
                textContent: `Wow! "${userText}" is what you said! I'm learning so much from you!`
            }
        ];

        // Pick a random response
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }

    /**
     * Generate real baby response from external API (when you have proper access)
     */
    async generateRealBabyResponse(userText) {
        try {
            // Make actual API call to get response
            const response = await fetch('https://digital-baby.pixora.app/api/v1/text-to-speech/baby-voice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    context: [],
                    text: userText
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    audioUrl: data.audioUrl || null,
                    textContent: data.textContent || `Hello! I heard you say "${userText}". That's very interesting!`
                };
            } else {
                throw new Error('API request failed');
            }
        } catch (error) {
            console.log('Real API call failed, falling back to mock response');
            return this.generateMockResponse(userText);
        }
    }

    /**
     * Play baby response with simple lip-sync
     */
    async playBabyResponse(textContent) {
        // Show baby's speech
        this.showBabySpeech(textContent);

        // Start simple lip-sync animation
        this.startSimpleLipSync(textContent);
        this.isSpeaking = true;

        // Simulate speaking duration
        setTimeout(() => {
            this.stopLipSync();
            this.isSpeaking = false;
            this.updateStatus('Ready to interact!');
        }, 3000);
    }

    /**
     * Start simple lip-sync using text analysis
     */
    startSimpleLipSync(textContent) {
        if (!this.mainMesh || !this.morphTargets) {
            this.updateStatus('No morph targets available for lip-sync');
            return;
        }

        console.log('🎭 Starting simple lip-sync for:', textContent);

        // Convert text to morph targets
        const morphTargets = this.lipSyncSystem.textToVisemes(textContent);
        console.log('🎭 Generated morph targets:', morphTargets);

        // Start TTS for audio
        this.speakText(textContent);

        // Start lip-sync animation using the new system
        this.lipSyncSystem.startLipSync(morphTargets, (visemeName, intensity) => {
            if (visemeName === null) {
                // Lip-sync complete, reset to neutral smoothly
                console.log('🎭 Lip-sync complete, resetting to neutral smoothly');
                this.resetToNeutralSmoothly();
            } else {
                // Apply morph target
                console.log(`🎭 Applying morph target: ${visemeName} with intensity: ${intensity}`);
                this.applyMorphTarget(visemeName, intensity);
            }
        });

        this.isSpeaking = true;
    }







    /**
     * Speak text using TTS for audio playback during lip-sync
     */
    speakText(text) {
        if ('speechSynthesis' in window) {
            // Stop any existing speech
            window.speechSynthesis.cancel();

            // Create new speech utterance
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9; // Slightly slower for better lip-sync
            utterance.pitch = 1.1; // Slightly higher pitch for baby voice
            utterance.volume = 0.8;

            // Start speaking
            window.speechSynthesis.speak(utterance);
            console.log('🎤 TTS started:', text);
        } else {
            console.warn('🎤 TTS not supported in this browser');
        }
    }











    /**
     * Reset to neutral expression
     */
    resetToNeutral() {
        if (!this.mainMesh) return;

        for (let i = 0; i < this.mainMesh.morphTargetInfluences.length; i++) {
            this.mainMesh.morphTargetInfluences[i] = 0;
        }

        this.mainMesh.morphTargetInfluencesNeedUpdate = true;
    }

    /**
     * Reset to neutral expression with smooth transition
     */
    resetToNeutralSmoothly() {
        if (!this.mainMesh) return;

        const steps = 20; // Number of steps for smooth transition
        const stepDuration = 0.03; // 30ms per step
        let currentStep = 0;

        const animateStep = () => {
            if (currentStep >= steps) return;

            // Calculate current value (current to 0)
            const progress = currentStep / steps;
            const easeValue = this.easeInOutCubic(progress);

            for (let i = 0; i < this.mainMesh.morphTargetInfluences.length; i++) {
                const currentValue = this.mainMesh.morphTargetInfluences[i];
                this.mainMesh.morphTargetInfluences[i] = currentValue * (1 - easeValue);
            }

            this.mainMesh.morphTargetInfluencesNeedUpdate = true;
            currentStep++;

            if (currentStep < steps) {
                setTimeout(animateStep, stepDuration * 1000);
            }
        };

        animateStep();
    }

    /**
     * Stop all lip-sync animations
     */
    stopLipSync() {
        // Stop the lip-sync system
        if (this.lipSyncSystem) {
            this.lipSyncSystem.stopAudioAnalysis();
        }

        // Clear any remaining timeouts
        if (this.lipSyncTimeouts) {
            this.lipSyncTimeouts.forEach(timeout => clearTimeout(timeout));
            this.lipSyncTimeouts = [];
        }

        // Reset to neutral expression
        this.resetToNeutral();
    }

    /**
     * Test the lip-sync system with sample text
     */
    testLipSyncSystem() {
        if (!this.mainMesh || !this.morphTargets) {
            this.updateStatus('No morph targets available for lip-sync');
            return;
        }

        const testText = "Hello! This is a test of the simple lip-sync system. Watch the baby's mouth move!";
        this.updateStatus('Testing lip-sync system...');

        // Show baby's speech
        this.showBabySpeech(testText);

        // Start simple lip-sync
        this.startSimpleLipSync(testText);
        this.isSpeaking = true;

        // Stop after the lip-sync completes
        setTimeout(() => {
            this.stopLipSync();
            this.isSpeaking = false;
            this.updateStatus('Lip-sync test completed! Ready to interact.');
        }, 5000);
    }

    /**
     * Test the lip-sync system with real audio from API
     */
    async testAudioLipSyncSystem() {
        if (!this.mainMesh || !this.morphTargets) {
            this.updateStatus('No morph targets available for lip-sync');
            return;
        }

        this.updateStatus('Testing audio lip-sync system...');

        try {
            // Test with a sample message
            const testMessage = "Hello baby, how are you?";

            // Try real API first, fallback to mock
            let response = await this.generateRealBabyResponse(testMessage);

            if (response.success) {
                this.updateStatus('Real API test started!');
                await this.playBabyResponse(response.textContent);
            } else {
                this.updateStatus('Using mock response for testing');
                response = this.generateMockResponse(testMessage);
                this.startSimpleLipSync(response.textContent);
                this.isSpeaking = true;

                setTimeout(() => {
                    this.stopLipSync();
                    this.isSpeaking = false;
                    this.updateStatus('Mock lip-sync test completed! Ready to interact.');
                }, 4000);
            }
        } catch (error) {
            console.error('Audio lip-sync test failed:', error);
            this.updateStatus('API test failed - using mock response instead');

            // Fallback to mock
            const testMessage = "Hello baby, how are you?";
            const response = this.generateMockResponse(testMessage);
            this.startSimpleLipSync(response.textContent);
            this.isSpeaking = true;

            setTimeout(() => {
                this.stopLipSync();
                this.isSpeaking = false;
                this.updateStatus('Mock lip-sync test completed! Ready to interact.');
            }, 4000);
        }
    }





    /**
     * Reset camera to default position
     */
    resetCamera() {
        if (window.innerWidth <= 768) {
            this.camera.position.set(0, 0.3, 2.8);
        } else {
            this.camera.position.set(0, 0.5, 2.5);
        }

        if (this.controls) {
            this.controls.reset();
        }
    }

    /**
     * Update status display
     */
    updateStatus(message) {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    /**
     * Show user speech
     */
    showUserSpeech(text, isFinal = false) {
        if (!this.speechDisplay) return;

        let userBubble = this.speechDisplay.querySelector('.user-speech');
        if (!userBubble) {
            userBubble = document.createElement('div');
            userBubble.className = 'speech-bubble user-speech';

            const label = document.createElement('div');
            label.className = 'speech-label';
            label.textContent = 'You said:';
            userBubble.appendChild(label);

            const content = document.createElement('div');
            content.className = 'speech-content';
            userBubble.appendChild(content);

            this.speechDisplay.appendChild(userBubble);
        }

        const content = userBubble.querySelector('.speech-content');
        content.textContent = text;

        const label = userBubble.querySelector('.speech-label');
        label.textContent = isFinal ? 'You said:' : 'Listening...';

        if (isFinal) {
            this.currentUserSpeech = text;
        }
    }

    /**
 * Show baby speech
 */
    showBabySpeech(text) {
        if (!this.speechDisplay) return;

        this.currentBabySpeech = text;

        let babyBubble = this.speechDisplay.querySelector('.baby-speech');
        if (!babyBubble) {
            babyBubble = document.createElement('div');
            babyBubble.className = 'speech-bubble baby-speech';

            const label = document.createElement('div');
            label.className = 'speech-label';
            label.textContent = 'Baby says:';
            babyBubble.appendChild(label);

            const content = document.createElement('div');
            content.className = 'speech-content';
            babyBubble.appendChild(content);

            this.speechDisplay.appendChild(babyBubble);
        }

        const content = babyBubble.querySelector('.speech-content');
        content.textContent = text;
    }

    /**
     * Main animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(delta);
        }

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        // Render scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Toggle between mock and real API
     */
    toggleAPI() {
        this.useRealAPI = !this.useRealAPI;
        const button = document.getElementById('toggleAPI');

        if (this.useRealAPI) {
            button.textContent = 'Use Mock API';
            button.style.background = '#FF9800';
            this.updateStatus('Switched to REAL API mode. Note: May require proper authentication.');
        } else {
            button.textContent = 'Use Real API';
            button.style.background = '#4CAF50';
            this.updateStatus('Switched to MOCK API mode. Safe for testing.');
        }

        console.log(`API mode switched to: ${this.useRealAPI ? 'REAL' : 'MOCK'}`);
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    new SimpleBabyCharacter();
});
