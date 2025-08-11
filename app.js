class InteractiveBabyCharacter {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.babyModel = null;
        this.mixer = null;
        this.clock = new THREE.Clock();

        // Speech recognition
        this.recognition = null;
        this.isRecording = false;

        // Audio
        this.audioContext = null;
        this.audioElement = null;

        // Character state
        this.currentEmotion = 'neutral';
        this.isSpeaking = false;
        this.morphTargets = {};

        // Speech display
        this.currentUserSpeech = '';
        this.currentBabySpeech = '';
        this.speechDisplay = null;

        // Initialize phoneme detector (audio context will be initialized on first user interaction)
        this.phonemeDetector = new PhonemeDetector();

        this.init();
    }

    async init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();

        // Wait for HDRI to load before continuing
        try {
            await this.setupHDRI();
        } catch (error) {
            console.error('Failed to load HDRI, using fallback lighting');
            // Add a simple ambient light as fallback
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            this.scene.add(ambientLight);
            // Set white background for fallback case too
            this.scene.background = new THREE.Color(0xedede9);
        }

        this.setupControls();
        this.setupSpeechRecognition();
        this.setupEventListeners();

        await this.loadBabyModel();

        // Initialize speech display
        this.speechDisplay = document.getElementById('speech-display');

        this.animate();

        document.getElementById('loading').classList.add('hidden');
        this.updateStatus('Ready! Click "Test Morph" to see animations or "🎤" to speak.');
    }

    setupScene() {
        this.scene = new THREE.Scene();
        // Remove fog and background color - will be set by HDRI
    }

    async setupHDRI() {
        return new Promise((resolve, reject) => {
            // Load HDRI environment map for lighting
            const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
            pmremGenerator.compileEquirectangularShader();

            // Load the HDRI texture using EXR loader
            const exrLoader = new THREE.EXRLoader();

            // Try multiple possible paths for GitHub Pages compatibility
            const possiblePaths = [
                'src/hdri.exr',
                './src/hdri.exr',
                'hdri.exr',
                './hdri.exr'
            ];

            const tryLoadHDRI = (index) => {
                if (index >= possiblePaths.length) {
                    console.warn('Failed to load HDRI from all possible paths, using fallback lighting');
                    resolve(); // Resolve without error to continue with fallback
                    return;
                }

                const path = possiblePaths[index];
                console.log(`Trying to load HDRI from: ${path}`);

                exrLoader.load(
                    path,
                    (hdriTexture) => {
                        try {
                            // Generate environment map from HDRI
                            const envMap = pmremGenerator.fromEquirectangular(hdriTexture).texture;

                            // Set environment map for the scene (this provides lighting)
                            this.scene.environment = envMap;

                            // Set background to white (this is just visual, doesn't affect lighting)
                            this.scene.background = new THREE.Color(0xffffff);

                            console.log('✅ HDRI loaded successfully from:', path);
                            console.log('Environment map set:', this.scene.environment);
                            console.log('Background set:', this.scene.background);

                            // Clean up
                            hdriTexture.dispose();
                            pmremGenerator.dispose();
                            resolve();
                        } catch (error) {
                            console.error('Error processing HDRI:', error);
                            tryLoadHDRI(index + 1);
                        }
                    },
                    (progress) => {
                        console.log('HDRI loading progress:', progress);
                    },
                    (error) => {
                        console.warn(`❌ Failed to load HDRI from ${path}:`, error);
                        // Try next path
                        tryLoadHDRI(index + 1);
                    }
                );
            };

            tryLoadHDRI(0);
        });
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.CAMERA.FOV,
            window.innerWidth / window.innerHeight,
            CONFIG.CAMERA.NEAR,
            CONFIG.CAMERA.FAR
        );

        // Position camera to fit model on screen by default
        this.camera.position.set(0, 0.5, 2.5);

        // Mobile-specific camera adjustments
        if (window.innerWidth <= 768) {
            this.camera.position.set(0, 0.3, 2.8); // Slightly further back on mobile
        }
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas'),
            antialias: CONFIG.PERFORMANCE.ANTIALIASING,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(CONFIG.PERFORMANCE.PIXEL_RATIO);
        this.renderer.shadowMap.enabled = false; // Disable shadows for HDRI lighting
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.NeutralToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        // Ensure tone mapping is properly set
        if (this.renderer.toneMapping === undefined) {
            this.renderer.toneMapping = THREE.NoToneMapping;
        }
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;

        // Enable zoom and pan for better model exploration
        this.controls.enableZoom = true;
        this.controls.enablePan = true;

        // Set reasonable distance limits for zooming
        this.controls.minDistance = 1.0;
        this.controls.maxDistance = 5.0;
        this.controls.maxPolarAngle = CONFIG.CAMERA.MAX_POLAR_ANGLE;

        // Mobile-specific settings
        if (window.innerWidth <= 768) {
            this.controls.enableDamping = false; // Disable damping on mobile for better performance
            this.controls.rotateSpeed = 0.8; // Slightly slower rotation on mobile
        }
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = CONFIG.SPEECH.CONTINUOUS;
            this.recognition.interimResults = CONFIG.SPEECH.INTERIM_RESULTS;
            this.recognition.lang = CONFIG.SPEECH.LANGUAGE;
            this.recognition.maxAlternatives = CONFIG.SPEECH.MAX_ALTERNATIVES;

            this.recognition.onstart = () => {
                this.isRecording = true;
                document.getElementById('micButton').classList.add('recording');
                this.updateStatus('Listening...');
            };

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                // Process all results
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
                console.error('Speech recognition error:', event.error);
                this.updateStatus('Speech recognition error. Please try again.');
                this.stopRecording();
            };

            this.recognition.onend = () => {
                this.stopRecording();
            };
        } else {
            console.error('Speech recognition not supported');
            this.updateStatus('Speech recognition not supported in this browser');
        }
    }

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

    async loadBabyModel() {
        const loader = new THREE.FBXLoader();

        try {
            this.babyModel = await new Promise((resolve, reject) => {
                // Try multiple possible paths for GitHub Pages compatibility
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
                    console.log(`Trying to load model from: ${path}`);

                    loader.load(
                        path,
                        (object) => {
                            console.log(`✅ Model loaded successfully from: ${path}`);
                            resolve(object);
                        },
                        (progress) => {
                            const percent = (progress.loaded / progress.total * 100).toFixed(0);
                            document.getElementById('loading').textContent = `Loading 3D Model... ${percent}%`;
                        },
                        (error) => {
                            console.warn(`❌ Failed to load from ${path}:`, error);
                            // Try next path
                            tryLoad(index + 1);
                        }
                    );
                };

                tryLoad(0);
            });

            // Setup the model
            this.setupModel();

        } catch (error) {
            console.error('Error loading FBX model:', error);
            this.updateStatus('Error loading 3D model - check console for details');

            // Show more helpful error message
            document.getElementById('loading').innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h3>❌ 3D Model Loading Failed</h3>
                    <p>Error: ${error.message}</p>
                    <p>Please check the browser console for more details.</p>
                    <p>Make sure all files are uploaded to GitHub Pages correctly.</p>
                </div>
            `;
        }
    }

    setupModel() {
        if (!this.babyModel) return;

        // Scale and position the model
        this.babyModel.scale.setScalar(CONFIG.SCENE.MODEL_SCALE);
        this.babyModel.position.set(
            CONFIG.SCENE.MODEL_POSITION.x,
            CONFIG.SCENE.MODEL_POSITION.y,
            CONFIG.SCENE.MODEL_POSITION.z
        );

        // Apply MeshStandardMaterial to all meshes and enable shadows
        this.babyModel.traverse((child) => {
            if (child.isMesh) {
                let standardMaterial;

                // Check if this is the body mesh (by name or material properties)
                const isBodyMesh = child.name.toLowerCase().includes('body') ||
                    (child.material && child.material.name && child.material.name.toLowerCase().includes('body'));

                if (isBodyMesh) {
                    // Load alpha map for body mesh with fallback paths
                    const textureLoader = new THREE.TextureLoader();

                    // Try multiple possible paths for GitHub Pages compatibility
                    const alphaMapPaths = [
                        'src/body__Opacity.jpg',
                        './src/body__Opacity.jpg',
                        'body__Opacity.jpg',
                        './body__Opacity.jpg'
                    ];

                    let alphaMap = null;
                    let alphaMapLoaded = false;

                    const tryLoadAlphaMap = (index) => {
                        if (index >= alphaMapPaths.length) {
                            console.warn('Failed to load alpha map from all possible paths');
                            return;
                        }

                        const path = alphaMapPaths[index];
                        console.log(`Trying to load alpha map from: ${path}`);

                        textureLoader.load(
                            path,
                            (texture) => {
                                console.log(`✅ Alpha map loaded successfully from: ${path}`);
                                alphaMap = texture;
                                alphaMapLoaded = true;
                            },
                            undefined,
                            (error) => {
                                console.warn(`❌ Failed to load alpha map from ${path}:`, error);
                                tryLoadAlphaMap(index + 1);
                            }
                        );
                    };

                    tryLoadAlphaMap(0);

                    standardMaterial = new THREE.MeshStandardMaterial({
                        color: child.material.color || 0xffffff,
                        map: child.material.map || null,
                        normalMap: child.material.normalMap || null,
                        roughnessMap: child.material.roughnessMap || null,
                        aoMap: child.material.aoMap || null,
                        alphaMap: alphaMap,
                        alphaTest: 0.5,
                        transparent: true,
                        side: THREE.DoubleSide,
                        roughness: 0.5,
                        metalness: 0.1
                    });
                } else {
                    // Apply standard material for other meshes
                    standardMaterial = new THREE.MeshStandardMaterial({
                        color: child.material.color || 0xffffff,
                        map: child.material.map || null,
                        normalMap: child.material.normalMap || null,
                        roughnessMap: child.material.roughnessMap || null,
                        aoMap: child.material.aoMap || null,
                        opacity: child.material.opacity !== undefined ? child.material.opacity : 1,
                        transparent: child.material.transparent || false,
                        roughness: 0.5,
                        metalness: 0.1
                    });
                }

                child.material = standardMaterial;
                // No shadows with HDRI lighting

                // Store morph targets for lip sync (use the mesh with the most morph targets - the main face mesh)
                if (child.morphTargetDictionary && Object.keys(child.morphTargetDictionary).length > 50) {
                    this.morphTargets = child.morphTargetDictionary;
                    this.mainMesh = child; // Store reference to the main mesh

                    // Ensure the material supports morph targets
                    if (child.material) {
                        child.material.morphTargets = true;
                        console.log('Enabled morph targets on material for mesh:', child.name);
                    }

                    console.log('Found main morph target mesh:', child.name);
                    console.log('Available morph targets:', Object.keys(child.morphTargetDictionary));
                    console.log('Available morph targets from phoneme detector:', this.phonemeDetector.getAvailableMorphTargets());
                    console.log('Mesh has morphTargetInfluences:', child.morphTargetInfluences ? 'Yes' : 'No');
                    console.log('Number of morph target influences:', child.morphTargetInfluences ? child.morphTargetInfluences.length : 'None');
                }
            }
        });

        // Setup animations
        if (this.babyModel.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.babyModel);
            const idleAction = this.mixer.clipAction(this.babyModel.animations[0]);
            idleAction.play();
        }

        this.scene.add(this.babyModel);
    }

    async startRecording() {
        // Initialize audio context on first user interaction
        if (!this.phonemeDetector.audioContext) {
            console.log('Initializing audio context on first user interaction...');
            await this.phonemeDetector.initializeAudioAnalysis();
        }

        // Also initialize audio context for playback
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                if (this.audioContext.state === 'suspended') {
                    console.log('Audio context suspended, attempting to resume...');
                    await this.audioContext.resume();
                }
                console.log('✅ Audio context initialized:', this.audioContext.state);
            } catch (error) {
                console.warn('Could not initialize audio context:', error);
            }
        }

        if (this.recognition && !this.isRecording) {
            this.recognition.start();
            this.isRecording = true;
            document.getElementById('micButton').classList.add('recording');
            this.updateStatus('Listening...');
        }
    }

    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
            document.getElementById('micButton').classList.remove('recording');
        }
    }

    async processUserSpeech(text) {
        this.updateStatus('Processing your speech...');

        try {
            // Generate response using the API
            const response = await this.generateBabyResponse(text);

            if (response.success) {
                this.updateStatus('Baby is responding...');
                await this.playBabyResponse(response.audioUrl, response.textContent);
            } else {
                this.updateStatus('Failed to generate response');
            }
        } catch (error) {
            console.error('Error processing speech:', error);
            this.updateStatus('Error processing speech');
        }
    }

    async generateBabyResponse(userText) {
        const response = await fetch(CONFIG.API.BASE_URL, {
            method: 'POST',
            headers: CONFIG.API.HEADERS,
            body: JSON.stringify({
                context: [],
                text: userText
            })
        });

        return await response.json();
    }

    async playBabyResponse(audioUrl, textContent) {
        // Show baby's speech
        this.showBabySpeech(textContent);

        console.log('🎵 Starting audio playback for:', audioUrl);

        // Check if audio URL is accessible first
        const isAccessible = await this.checkAudioUrlAccessibility(audioUrl);
        if (!isAccessible) {
            console.warn('⚠️ Audio URL not accessible, using text-based animation only');
            this.updateStatus('Audio URL not accessible - using text-based animation');
            this.triggerTextBasedFallback(textContent);
            return;
        }

        try {
            // Create audio element
            this.audioElement = new Audio(audioUrl);

            // Add essential audio event logging
            this.audioElement.addEventListener('play', () => console.log('🎵 Audio: play event fired'));
            this.audioElement.addEventListener('playing', () => console.log('🎵 Audio: playing event fired'));
            this.audioElement.addEventListener('ended', () => console.log('🎵 Audio: ended event fired'));
            this.audioElement.addEventListener('error', (e) => console.error('🎵 Audio: error event', e));

            // Add error handling for audio loading
            this.audioElement.onerror = (error) => {
                console.error('❌ Audio loading error:', error);
                this.updateStatus('Audio loading failed - using text-based animation only');
                // Still trigger animation even if audio fails
                this.triggerTextBasedFallback(textContent);
            };

            // Add volume control and ensure audio is audible
            this.audioElement.volume = 1.0;
            this.audioElement.preload = 'auto';

            // Wait for audio to load and get its duration
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Audio loading timeout'));
                }, 10000); // 10 second timeout

                this.audioElement.onloadedmetadata = () => {
                    clearTimeout(timeout);
                    console.log('✅ Audio loaded successfully, duration:', this.audioElement.duration);
                    resolve();
                };

                this.audioElement.oncanplaythrough = () => {
                    console.log('🎯 Audio can play through');
                };
            });

            // Play audio first
            console.log('▶️ Attempting to play audio...');

            // Check if user has interacted with the page (required for autoplay)
            if (document.visibilityState === 'hidden') {
                console.warn('⚠️ Page is hidden, audio may not play');
            }

            try {
                await this.audioElement.play();
                console.log('✅ Audio playback started successfully');
            } catch (playError) {
                console.error('❌ Audio play() failed:', playError);

                // Handle autoplay policy issues
                if (playError.name === 'NotAllowedError') {
                    this.updateStatus('Click to enable audio playback');
                    console.log('🔒 Autoplay blocked - user interaction required');

                    // Try to resume audio context if suspended
                    if (this.audioContext && this.audioContext.state === 'suspended') {
                        try {
                            await this.audioContext.resume();
                            console.log('✅ Audio context resumed');
                        } catch (resumeError) {
                            console.error('❌ Failed to resume audio context:', resumeError);
                        }
                    }
                }

                // Still continue with animation even if audio fails
                this.triggerTextBasedFallback(textContent);
                return;
            }

            this.isSpeaking = true;

            // IMPORTANT: Wait for audio to actually start playing before starting animation
            // This prevents the animation system from interfering with audio playback
            await new Promise((resolve) => {
                const checkAudioPlaying = () => {
                    if (!this.audioElement.paused && this.audioElement.currentTime > 0) {
                        console.log('🎵 Audio is actively playing, starting animation system...');
                        resolve();
                    } else {
                        setTimeout(checkAudioPlaying, 100);
                    }
                };
                checkAudioPlaying();
            });

            // Now start the animation system after audio is confirmed playing
            console.log('🎭 Starting animation system...');

            // Use the new non-intrusive lip-sync method that won't interfere with audio
            console.log('🎯 Using non-intrusive lip-sync to preserve audio playback...');
            this.startSimpleNonIntrusiveLipSync(textContent, this.audioElement.duration);

            // Wait for audio to finish
            await new Promise((resolve) => {
                this.audioElement.onended = () => {
                    console.log('🏁 Audio playback ended');
                    this.stopLipSync();
                    this.isSpeaking = false;
                    this.updateStatus('Ready to interact!');
                    resolve();
                };
            });

        } catch (error) {
            console.error('❌ Audio playback failed:', error);
            this.updateStatus('Audio failed - using text-based animation only');

            // Still provide animation even if audio fails
            this.triggerTextBasedFallback(textContent);

            // Reset speaking state
            this.isSpeaking = false;
        }
    }

    // New method: Simple lip-sync that doesn't interfere with audio playback
    startSimpleNonIntrusiveLipSync(textContent, audioDuration) {
        console.log('🎭 Starting simple non-intrusive lip-sync...');

        if (!this.mainMesh || !this.morphTargets) return;

        // Clear any existing timeouts
        if (this.lipSyncTimeouts) {
            this.lipSyncTimeouts.forEach(timeout => clearTimeout(timeout));
        }
        this.lipSyncTimeouts = [];

        // Reset all morph targets
        this.resetAllMorphTargets();

        // Extract phonemes from text
        const phonemes = this.extractPhonemes(textContent);

        if (phonemes.length === 0) {
            // Fallback to simple animation
            this.startSimpleLipSync(audioDuration);
            return;
        }

        // Calculate timing for smoother transitions
        const totalPhonemes = phonemes.length;
        const timePerPhoneme = audioDuration / totalPhonemes;
        const transitionDuration = Math.min(0.18, timePerPhoneme * 0.6); // Increased duration for smoother bell curve

        console.log(`🎯 Lip-sync: ${totalPhonemes} phonemes over ${audioDuration}s (${timePerPhoneme.toFixed(3)}s per phoneme, ${transitionDuration.toFixed(3)}s transition)`);

        phonemes.forEach((phonemeData, index) => {
            const startTime = index * timePerPhoneme;

            const startTimeout = setTimeout(() => {
                console.log(`🎭 Applying phoneme: ${phonemeData.phoneme} -> ${phonemeData.morphTarget}`);
                this.smoothTransitionToMorphTarget(phonemeData.morphTarget, phonemeData.phoneme, transitionDuration);
            }, startTime * 1000);

            this.lipSyncTimeouts.push(startTimeout);
        });

        // Reset to neutral at the end with longer transition
        const resetTimeout = setTimeout(() => {
            this.smoothTransitionToNeutral(0.5);
        }, (audioDuration - 0.1) * 1000);

        this.lipSyncTimeouts.push(resetTimeout);
    }

    // Check if audio URL is accessible
    async checkAudioUrlAccessibility(audioUrl) {
        try {
            const response = await fetch(audioUrl, { method: 'HEAD' });
            if (response.ok) {
                console.log('✅ Audio URL accessible:', response.status);
                return true;
            } else {
                console.warn('⚠️ Audio URL returned status:', response.status);
                return false;
            }
        } catch (error) {
            console.error('❌ Audio URL check failed:', error);
            return false;
        }
    }

    extractPhonemes(text) {
        // Fallback method for text-based phoneme extraction
        return this.phonemeDetector.extractPhonemes(text);
    }

    startLipSync(phonemes) {
        if (!this.mainMesh) return;

        console.log('Starting lip sync with phonemes:', phonemes);

        // Clear any existing timeouts and animations
        if (this.lipSyncTimeouts) {
            this.lipSyncTimeouts.forEach(timeout => clearTimeout(timeout));
        }
        this.lipSyncTimeouts = [];

        // Reset all morph targets to start clean
        this.resetAllMorphTargets();

        let currentTime = 0;
        const transitionDuration = 0.1; // Smooth transition duration

        phonemes.forEach((phonemeData, index) => {
            // Start transition to this morph target
            const startTimeout = setTimeout(() => {
                this.smoothTransitionToMorphTarget(phonemeData.morphTarget, phonemeData.phoneme, transitionDuration);
            }, currentTime * 1000);

            this.lipSyncTimeouts.push(startTimeout);
            currentTime += phonemeData.duration;
        });

        // Reset to neutral after all phonemes
        const resetTimeout = setTimeout(() => {
            this.smoothTransitionToNeutral(0.2); // Longer transition to neutral
        }, currentTime * 1000);

        this.lipSyncTimeouts.push(resetTimeout);
    }

    startLipSyncWithAudioDuration(phonemes, audioDuration) {
        if (!this.mainMesh) return;

        console.log(`Starting lip sync with ${phonemes.length} phonemes over ${audioDuration}s audio`);

        // Clear any existing timeouts and animations
        if (this.lipSyncTimeouts) {
            this.lipSyncTimeouts.forEach(timeout => clearTimeout(timeout));
        }
        this.lipSyncTimeouts = [];

        // Reset all morph targets to start clean
        this.resetAllMorphTargets();

        // Handle edge cases for audio duration
        if (audioDuration < 0.5) {
            // Very short audio - use simple approach
            this.handleShortAudio(phonemes, audioDuration);
            return;
        }

        if (audioDuration > 10) {
            // Very long audio - limit phonemes
            phonemes = phonemes.slice(0, Math.min(phonemes.length, 30));
        }

        // Calculate timing based on audio duration
        const totalPhonemes = phonemes.length;
        const timePerPhoneme = audioDuration / totalPhonemes;
        const transitionDuration = Math.min(0.08, timePerPhoneme * 0.3); // Slightly longer transitions for better visibility

        console.log(`Time per phoneme: ${timePerPhoneme}s, Transition duration: ${transitionDuration}s`);

        // Ensure minimum time per phoneme
        const minTimePerPhoneme = 0.06; // 60ms minimum for better visibility
        const adjustedTimePerPhoneme = Math.max(timePerPhoneme, minTimePerPhoneme);

        phonemes.forEach((phonemeData, index) => {
            const startTime = index * adjustedTimePerPhoneme;

            // Start transition to this morph target using enhanced viseme system
            const startTimeout = setTimeout(() => {
                this.smoothTransitionToMorphTarget(phonemeData.morphTarget, phonemeData.phoneme, transitionDuration);
            }, startTime * 1000);

            this.lipSyncTimeouts.push(startTimeout);
        });

        // Reset to neutral slightly before audio ends
        const resetTimeout = setTimeout(() => {
            this.smoothTransitionToNeutral(0.1);
        }, (audioDuration - 0.05) * 1000);

        this.lipSyncTimeouts.push(resetTimeout);
    }

    handleShortAudio(phonemes, audioDuration) {
        console.log(`Handling short audio (${audioDuration}s)`);

        // For very short audio, just cycle through a few key phonemes
        const keyPhonemes = phonemes.slice(0, Math.min(phonemes.length, 5));
        const timePerPhoneme = audioDuration / keyPhonemes.length;

        keyPhonemes.forEach((phonemeData, index) => {
            const startTime = index * timePerPhoneme;

            const startTimeout = setTimeout(() => {
                this.smoothTransitionToMorphTarget(phonemeData.morphTarget, phonemeData.phoneme, 0.05);
            }, startTime * 1000);

            this.lipSyncTimeouts.push(startTimeout);
        });

        // Reset immediately after
        const resetTimeout = setTimeout(() => {
            this.smoothTransitionToNeutral(0.1);
        }, audioDuration * 1000);

        this.lipSyncTimeouts.push(resetTimeout);
    }

    // Real-time viseme analysis from ElevenLabs audio
    async startRealTimeVisemeAnalysis(audioElement) {
        if (!this.mainMesh || !this.morphTargets) return;

        console.log('Starting real-time viseme analysis from ElevenLabs audio');

        // Clear any existing timeouts and animations
        if (this.lipSyncTimeouts) {
            this.lipSyncTimeouts.forEach(timeout => clearTimeout(timeout));
        }
        this.lipSyncTimeouts = [];

        // Reset all morph targets to start clean
        this.resetAllMorphTargets();

        try {
            // Initialize audio analysis if not already done
            if (!this.phonemeDetector.audioContext) {
                await this.phonemeDetector.initializeAudioAnalysis();
            }

            // Start real-time audio analysis with high refresh rate
            await this.phonemeDetector.startRealTimeVisemeAnalysis(audioElement, (visemeData) => {
                this.applyVisemeInRealTime(visemeData);
            });

        } catch (error) {
            console.error('Failed to start real-time viseme analysis:', error);
            console.log('Falling back to text-based lip-sync method');

            // Fallback to text-based method with enhanced timing
            const phonemes = this.extractPhonemes(this.currentBabySpeech || 'Hello');
            if (phonemes.length > 0) {
                this.startEnhancedTextBasedLipSync(phonemes, audioElement.duration);
            } else {
                // If no phonemes, create a simple animation
                this.startSimpleLipSync(audioElement.duration);
            }
        }
    }

    // Enhanced text-based lip-sync with better timing
    startEnhancedTextBasedLipSync(phonemes, audioDuration) {
        // Clear any existing timeouts
        if (this.lipSyncTimeouts) {
            this.lipSyncTimeouts.forEach(timeout => clearTimeout(timeout));
        }
        this.lipSyncTimeouts = [];

        // Reset all morph targets
        this.resetAllMorphTargets();

        // Calculate timing with overlap for smoother transitions
        const totalPhonemes = phonemes.length;
        const timePerPhoneme = audioDuration / totalPhonemes;
        const transitionDuration = Math.min(0.2, timePerPhoneme * 0.7); // Increased for smoother bell curve

        phonemes.forEach((phonemeData, index) => {
            const startTime = index * timePerPhoneme;

            // Start transition to this morph target
            const startTimeout = setTimeout(() => {
                this.smoothTransitionToMorphTarget(phonemeData.morphTarget, phonemeData.phoneme, transitionDuration);
            }, startTime * 1000);

            this.lipSyncTimeouts.push(startTimeout);
        });

        // Reset to neutral at the end with longer transition
        const resetTimeout = setTimeout(() => {
            this.smoothTransitionToNeutral(0.6);
        }, (audioDuration - 0.15) * 1000);

        this.lipSyncTimeouts.push(resetTimeout);
    }

    // Simple lip-sync for when phoneme extraction fails
    startSimpleLipSync(audioDuration) {
        // Clear any existing timeouts
        if (this.lipSyncTimeouts) {
            this.lipSyncTimeouts.forEach(timeout => clearTimeout(timeout));
        }
        this.lipSyncTimeouts = [];

        // Reset all morph targets
        this.resetAllMorphTargets();

        // Create a simple mouth movement pattern
        const simplePhonemes = [
            { morphTarget: 'Ah', phoneme: 'AA' },
            { morphTarget: 'EE', phoneme: 'EE' },
            { morphTarget: 'Oh', phoneme: 'OH' },
            { morphTarget: 'Ah', phoneme: 'AA' }
        ];

        const timePerPhoneme = audioDuration / simplePhonemes.length;

        simplePhonemes.forEach((phonemeData, index) => {
            const startTime = index * timePerPhoneme;

            const startTimeout = setTimeout(() => {
                this.smoothTransitionToMorphTarget(phonemeData.morphTarget, phonemeData.phoneme, 0.2);
            }, startTime * 1000);

            this.lipSyncTimeouts.push(startTimeout);
        });

        // Reset to neutral with longer transition
        const resetTimeout = setTimeout(() => {
            this.smoothTransitionToNeutral(0.5);
        }, audioDuration * 1000);

        this.lipSyncTimeouts.push(resetTimeout);
    }

    // Apply viseme data in real-time with high refresh rate
    applyVisemeInRealTime(visemeData) {
        if (!this.mainMesh || !this.morphTargets) return;

        const { primaryTarget, secondaryTarget, intensity, confidence } = visemeData;

        // Apply primary viseme target
        if (primaryTarget && this.morphTargets[primaryTarget] !== undefined) {
            const primaryIndex = this.morphTargets[primaryTarget];
            this.mainMesh.morphTargetInfluences[primaryIndex] = intensity * confidence;
        }

        // Apply secondary viseme target
        if (secondaryTarget && this.morphTargets[secondaryTarget] !== undefined) {
            const secondaryIndex = this.morphTargets[secondaryTarget];
            this.mainMesh.morphTargetInfluences[secondaryIndex] = intensity * confidence * 0.7;
        }

        // Force immediate updates for high refresh rate
        this.mainMesh.morphTargetInfluencesNeedUpdate = true;
        if (this.mainMesh.geometry) {
            this.mainMesh.geometry.attributes.position.needsUpdate = true;
            this.mainMesh.geometry.attributes.normal.needsUpdate = true;
        }
    }

    setMorphTarget(morphTargetName, phoneme) {
        if (!this.mainMesh || !this.morphTargets) return;

        // Only log occasionally to avoid spam
        if (Math.random() < 0.01) { // 1% chance to log
            console.log(`Setting morph target: ${morphTargetName} for phoneme: ${phoneme}`);
        }

        const morphTargetIndex = this.morphTargets[morphTargetName];
        if (morphTargetIndex !== undefined) {
            // Reset all morph targets
            for (let i = 0; i < this.mainMesh.morphTargetInfluences.length; i++) {
                this.mainMesh.morphTargetInfluences[i] = 0;
            }

            // Set the current morph target with maximum weight (1.0)
            this.mainMesh.morphTargetInfluences[morphTargetIndex] = 1.0;

            // Force update the mesh
            this.mainMesh.morphTargetInfluencesNeedUpdate = true;

            // Force geometry update
            if (this.mainMesh.geometry) {
                this.mainMesh.geometry.attributes.position.needsUpdate = true;
                this.mainMesh.geometry.attributes.normal.needsUpdate = true;
            }

            console.log(`Applied morph target ${morphTargetName} with weight 1.0 to mesh ${this.mainMesh.name}`);
        } else {
            console.warn(`Morph target ${morphTargetName} not found in model`);
        }
    }

    // Smooth transition to a specific morph target with gradual 0→1→0 curve
    smoothTransitionToMorphTarget(morphTargetName, phoneme, duration = 0.15) {
        if (!this.mainMesh || !this.morphTargets) return;

        // Get enhanced viseme data
        const visemeData = this.phonemeDetector.getVisemeData(phoneme);
        const primaryTarget = visemeData.primary;
        const secondaryTarget = visemeData.secondary;
        const intensity = visemeData.intensity;

        const startTime = performance.now();
        const startWeights = [...this.mainMesh.morphTargetInfluences];

        const animate = (currentTime) => {
            const elapsed = (currentTime - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);

            // Create a bell curve effect: 0 → 1 → 0
            // Use a sine wave to create smooth rise and fall
            const bellCurve = Math.sin(progress * Math.PI);
            const easedProgress = bellCurve;

            // Reset all morph targets first
            for (let i = 0; i < this.mainMesh.morphTargetInfluences.length; i++) {
                this.mainMesh.morphTargetInfluences[i] = 0;
            }

            // Apply primary morph target with bell curve
            const primaryIndex = this.morphTargets[primaryTarget];
            if (primaryIndex !== undefined) {
                const targetWeight = Math.min(1.0, intensity * 1.2); // Slightly reduced for smoother effect
                const startWeight = startWeights[primaryIndex] || 0;
                const currentWeight = startWeight + (targetWeight - startWeight) * easedProgress;
                this.mainMesh.morphTargetInfluences[primaryIndex] = currentWeight;
            }

            // Apply secondary morph target if available with bell curve
            if (secondaryTarget) {
                const secondaryIndex = this.morphTargets[secondaryTarget];
                if (secondaryIndex !== undefined) {
                    const targetWeight = Math.min(1.0, intensity * 0.8); // Secondary gets 80% of primary intensity
                    const startWeight = startWeights[secondaryIndex] || 0;
                    const currentWeight = startWeight + (targetWeight - startWeight) * easedProgress;
                    this.mainMesh.morphTargetInfluences[secondaryIndex] = currentWeight;
                }
            }

            // Force updates
            this.mainMesh.morphTargetInfluencesNeedUpdate = true;
            if (this.mainMesh.geometry) {
                this.mainMesh.geometry.attributes.position.needsUpdate = true;
                this.mainMesh.geometry.attributes.normal.needsUpdate = true;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // Smooth transition to neutral state with improved easing
    smoothTransitionToNeutral(duration = 0.4) {
        if (!this.mainMesh) return;

        const startTime = performance.now();
        const startWeights = [...this.mainMesh.morphTargetInfluences];

        const animate = (currentTime) => {
            const elapsed = (currentTime - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);

            // Use a smoother ease-out function for natural decay
            const easedProgress = this.easeOutQuart(progress);

            // Interpolate all morph targets to 0 with smooth decay
            for (let i = 0; i < this.mainMesh.morphTargetInfluences.length; i++) {
                const startWeight = startWeights[i] || 0;
                if (startWeight > 0.05) { // Lower threshold for smoother transitions
                    this.mainMesh.morphTargetInfluences[i] = startWeight * (1 - easedProgress);
                } else {
                    this.mainMesh.morphTargetInfluences[i] = 0;
                }
            }

            // Force updates
            this.mainMesh.morphTargetInfluencesNeedUpdate = true;
            if (this.mainMesh.geometry) {
                this.mainMesh.geometry.attributes.position.needsUpdate = true;
                this.mainMesh.geometry.attributes.normal.needsUpdate = true;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // Enhanced easing functions for smoother morph target transitions
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Bell curve function for natural morph target transitions
    bellCurve(t) {
        // Creates a smooth 0→1→0 transition using a modified sine wave
        return Math.sin(t * Math.PI) * Math.sin(t * Math.PI);
    }

    // Reset all morph targets to 0
    resetAllMorphTargets() {
        if (!this.mainMesh) return;

        for (let i = 0; i < this.mainMesh.morphTargetInfluences.length; i++) {
            this.mainMesh.morphTargetInfluences[i] = 0;
        }

        this.mainMesh.morphTargetInfluencesNeedUpdate = true;
        if (this.mainMesh.geometry) {
            this.mainMesh.geometry.attributes.position.needsUpdate = true;
            this.mainMesh.geometry.attributes.normal.needsUpdate = true;
        }
    }

    stopLipSync() {
        if (!this.mainMesh) return;

        // Use smooth transition to neutral
        this.smoothTransitionToNeutral(0.2);
        console.log('Smoothly reset all morph targets to neutral');
    }

    resetCamera() {
        // Reset camera to mobile-friendly position
        if (window.innerWidth <= 768) {
            this.camera.position.set(0, 0.3, 2.8);
        } else {
            this.camera.position.set(0, 0.5, 2.5);
        }
        this.controls.reset();
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }

    showUserSpeech(text, isFinal = false) {
        if (!this.speechDisplay) return;

        // Find or create user speech bubble
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

        // Update the content
        const content = userBubble.querySelector('.speech-content');
        content.textContent = text;

        // Update label for interim vs final
        const label = userBubble.querySelector('.speech-label');
        label.textContent = isFinal ? 'You said:' : 'Listening...';

        // Adjust bubble size based on content
        this.adjustBubbleSize(userBubble);

        // Scroll to bottom
        this.speechDisplay.scrollTop = this.speechDisplay.scrollHeight;

        // Store current user speech
        if (isFinal) {
            this.currentUserSpeech = text;
        }
    }

    showBabySpeech(text) {
        if (!this.speechDisplay) return;

        // Store current baby speech for fallback
        this.currentBabySpeech = text;

        // Find or create baby speech bubble
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

        // Update the content
        const content = babyBubble.querySelector('.speech-content');
        content.textContent = text;

        // Adjust bubble size based on content
        this.adjustBubbleSize(babyBubble);

        // Scroll to bottom
        this.speechDisplay.scrollTop = this.speechDisplay.scrollHeight;
    }

    adjustBubbleSize(bubble) {
        const content = bubble.querySelector('.speech-content');
        if (!content) return;

        // Calculate approximate width based on text length
        const textLength = content.textContent.length;
        const baseWidth = 200; // Minimum width
        const charWidth = 8; // Approximate width per character
        const maxWidth = 400; // Maximum width

        const calculatedWidth = Math.min(maxWidth, Math.max(baseWidth, textLength * charWidth));

        // Apply the width
        bubble.style.width = `${calculatedWidth}px`;

        // Also adjust height if needed
        const lineHeight = 20;
        const lines = Math.ceil(textLength / 40); // Approximate characters per line
        const minHeight = 60;
        const calculatedHeight = Math.max(minHeight, lines * lineHeight + 40); // 40px for padding

        bubble.style.minHeight = `${calculatedHeight}px`;
    }

    clearSpeechDisplay() {
        if (this.speechDisplay) {
            this.speechDisplay.innerHTML = '';
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(delta);
        }

        // Update controls
        this.controls.update();

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    // Trigger text-based fallback for lip-sync
    triggerTextBasedFallback(textContent) {
        // Fallback to text-based lip-sync
        const phonemes = this.extractPhonemes(textContent);
        if (phonemes.length > 0) {
            this.startEnhancedTextBasedLipSync(phonemes, this.audioElement.duration);
        } else {
            this.startSimpleLipSync(this.audioElement.duration);
        }
    }
}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new InteractiveBabyCharacter();
});
