/**
 * Professional 3D Baby Character with Perfect Lip-Sync
 * 
 * Features:
 * - Audio-driven lip-sync using real-time frequency analysis
 * - Character Creator 4 morph target integration
 * - Perfect text-audio alignment
 * - Professional-grade animation system
 */

class ProfessionalBabyCharacter {
    constructor() {
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.babyModel = null;
        this.mixer = null;
        this.clock = new THREE.Clock();

        // Professional lip-sync system
        this.lipSyncSystem = new ProfessionalLipSyncSystem();
        
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
        
        // Start animation loop
        this.animate();
        
        // Hide loading screen
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }
        
        this.updateStatus('Ready! Click 🎤 to speak or test the lip-sync system.');
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
        this.controls.minDistance = 1.0;
        this.controls.maxDistance = 5.0;
        
        // Mobile optimizations
        if (window.innerWidth <= 768) {
            this.controls.enableDamping = false;
            this.controls.rotateSpeed = 0.8;
        }
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
                    loader.load(
                        path,
                        (object) => resolve(object),
                        (progress) => {
                            const percent = (progress.loaded / progress.total * 100).toFixed(0);
                            document.getElementById('loading').textContent = `Loading 3D Model... ${percent}%`;
                        },
                        (error) => tryLoad(index + 1)
                    );
                };

                tryLoad(0);
            });

            // Setup the model
            this.setupModel();
            
        } catch (error) {
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

        // Scale and position the model
        this.babyModel.scale.setScalar(0.01);
        this.babyModel.position.set(0, 0, 0);

        // Apply materials and find morph targets
        this.babyModel.traverse((child) => {
            if (child.isMesh) {
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
                        metalness: 0.1
                    });
                    
                    child.material = bodyMaterial;
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
                        metalness: 0.1
                    });
                    
                    child.material = standardMaterial;
                }
                
                child.castShadow = true;
                child.receiveShadow = true;

                // Find mesh with morph targets (usually the main face mesh)
                if (child.morphTargetDictionary && Object.keys(child.morphTargetDictionary).length > 10) {
                    this.morphTargets = child.morphTargetDictionary;
                    this.mainMesh = child;
                    
                    // Enable morph targets on material
                    child.material.morphTargets = true;
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
                await this.playBabyResponse(response.audioUrl, response.textContent);
            } else {
                this.updateStatus('Failed to generate response');
            }
        } catch (error) {
            this.updateStatus('Error processing speech');
        }
    }

    /**
     * Generate baby response from API
     */
    async generateBabyResponse(userText) {
        // Simulate API response for demo
        // In production, replace with actual API call
        return {
            success: true,
            audioUrl: 'https://example.com/baby-response.mp3', // Replace with actual audio
            textContent: `Hello! I heard you say "${userText}". That's very interesting!`
        };
    }

    /**
     * Play baby response with perfect lip-sync
     */
    async playBabyResponse(audioUrl, textContent) {
        // Show baby's speech
        this.showBabySpeech(textContent);
        
        try {
            // Create audio element
            this.audioElement = new Audio(audioUrl);
            this.currentAudioUrl = audioUrl;
            this.currentText = textContent;
            
            // Configure audio
            this.audioElement.volume = 1.0;
            this.audioElement.preload = 'auto';
            
            // Wait for audio to load
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Audio loading timeout'));
                }, 10000);
                
                this.audioElement.onloadedmetadata = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                
                this.audioElement.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Audio loading failed'));
                };
            });
            
            // Start audio playback
            await this.audioElement.play();
            
            this.isSpeaking = true;
            
            // Start perfect lip-sync
            await this.startPerfectLipSync(this.audioElement, textContent);
            
            // Wait for audio to finish
            await new Promise((resolve) => {
                this.audioElement.onended = () => {
                    this.stopLipSync();
                    this.isSpeaking = false;
                    this.updateStatus('Ready to interact!');
                    resolve();
                };
            });
            
        } catch (error) {
            this.updateStatus('Audio failed - using text-based animation');
            
            // Fallback to text-based animation
            this.startTextBasedLipSync(textContent);
            this.isSpeaking = false;
        }
    }

    /**
     * Start perfect lip-sync using audio analysis
     */
    async startPerfectLipSync(audioElement, textContent) {
        if (!this.mainMesh || !this.morphTargets) {
            this.startTextBasedLipSync(textContent);
            return;
        }

        try {
            // Initialize lip-sync system
            await this.lipSyncSystem.initializeAudioAnalysis();
            
            // Start real-time audio analysis
            await this.lipSyncSystem.startRealTimeAudioAnalysis(audioElement, (visemeData) => {
                this.applyVisemeInRealTime(visemeData);
            });
            
        } catch (error) {
            this.startTextBasedLipSync(textContent);
        }
    }

    /**
     * Apply viseme data in real-time
     */
    applyVisemeInRealTime(visemeData) {
        if (!this.mainMesh || !this.morphTargets) return;

        const { primary, secondary, intensity, confidence } = visemeData;
        
        // Reset all morph targets
        for (let i = 0; i < this.mainMesh.morphTargetInfluences.length; i++) {
            this.mainMesh.morphTargetInfluences[i] = 0;
        }

        // Apply primary viseme
        if (primary && this.morphTargets[primary] !== undefined) {
            const primaryIndex = this.morphTargets[primary];
            const primaryIntensity = Math.min(1.0, intensity * confidence * 1.2);
            this.mainMesh.morphTargetInfluences[primaryIndex] = primaryIntensity;
        }

        // Apply secondary viseme
        if (secondary && this.morphTargets[secondary] !== undefined) {
            const secondaryIndex = this.morphTargets[secondary];
            const secondaryIntensity = Math.min(1.0, intensity * confidence * 0.6);
            this.mainMesh.morphTargetInfluences[secondaryIndex] = secondaryIntensity;
        }

        // Apply jaw opening based on intensity
        if (this.morphTargets['Jaw_Open'] !== undefined) {
            const jawIntensity = Math.min(1.0, intensity * 0.8);
            this.mainMesh.morphTargetInfluences[this.morphTargets['Jaw_Open']] = jawIntensity;
        }

        // Force updates
        this.mainMesh.morphTargetInfluencesNeedUpdate = true;
        if (this.mainMesh.geometry) {
            this.mainMesh.geometry.attributes.position.needsUpdate = true;
            this.mainMesh.geometry.attributes.normal.needsUpdate = true;
        }
    }

    /**
     * Start text-based lip-sync (fallback)
     */
    startTextBasedLipSync(textContent) {
        if (!this.mainMesh || !this.morphTargets) return;

        // Clear existing timeouts
        this.stopLipSync();
        
        // Extract phonemes from text
        const phonemes = this.lipSyncSystem.extractPhonemes(textContent);
        
        if (phonemes.length === 0) {
            this.startSimpleLipSync(2.0); // Default duration
            return;
        }

        // Calculate timing
        const totalDuration = 2.0; // Default duration
        const timePerPhoneme = totalDuration / phonemes.length;

        // Schedule phoneme transitions
        phonemes.forEach((phonemeData, index) => {
            const startTime = index * timePerPhoneme;
            
            const timeout = setTimeout(() => {
                this.applyPhoneme(phonemeData);
            }, startTime * 1000);
            
            this.lipSyncTimeouts.push(timeout);
        });

        // Reset to neutral at the end
        const resetTimeout = setTimeout(() => {
            this.resetToNeutral();
        }, totalDuration * 1000);
        
        this.lipSyncTimeouts.push(resetTimeout);
    }

    /**
     * Apply a single phoneme
     */
    applyPhoneme(phonemeData) {
        if (!this.mainMesh || !this.morphTargets) return;

        const { morphTarget } = phonemeData;
        
        // Reset all morph targets
        for (let i = 0; i < this.mainMesh.morphTargetInfluences.length; i++) {
            this.mainMesh.morphTargetInfluences[i] = 0;
        }

        // Apply the target morph target
        if (morphTarget && this.morphTargets[morphTarget] !== undefined) {
            const targetIndex = this.morphTargets[morphTarget];
            this.mainMesh.morphTargetInfluences[targetIndex] = 1.0;
            
            // Also apply jaw opening
            if (this.morphTargets['Jaw_Open'] !== undefined) {
                this.mainMesh.morphTargetInfluences[this.morphTargets['Jaw_Open']] = 0.5;
            }
        }

        // Force updates
        this.mainMesh.morphTargetInfluencesNeedUpdate = true;
    }

    /**
     * Start simple lip-sync animation
     */
    startSimpleLipSync(duration) {
        if (!this.mainMesh || !this.morphTargets) return;

        this.stopLipSync();
        
        // Simple mouth movement pattern
        const patterns = [
            { target: 'Ah', delay: 0, duration: 0.3 },
            { target: 'EE', delay: 0.4, duration: 0.3 },
            { target: 'Oh', delay: 0.8, duration: 0.3 },
            { target: 'Ah', delay: 1.2, duration: 0.3 }
        ];

        patterns.forEach((pattern) => {
            if (pattern.delay < duration) {
                const timeout = setTimeout(() => {
                    this.applyPhoneme({ morphTarget: pattern.target });
                }, pattern.delay * 1000);
                
                this.lipSyncTimeouts.push(timeout);
            }
        });

        // Reset to neutral
        const resetTimeout = setTimeout(() => {
            this.resetToNeutral();
        }, duration * 1000);
        
        this.lipSyncTimeouts.push(resetTimeout);
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
     * Stop all lip-sync animations
     */
    stopLipSync() {
        if (this.lipSyncTimeouts) {
            this.lipSyncTimeouts.forEach(timeout => clearTimeout(timeout));
            this.lipSyncTimeouts = [];
        }
        
        if (this.lipSyncSystem) {
            this.lipSyncSystem.stopAudioAnalysis();
        }
        
        this.resetToNeutral();
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
            babyBubble.appendChild(content);
            
            const content = document.createElement('div');
            content.className = 'speech-content';
            userBubble.appendChild(content);
            
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
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    new ProfessionalBabyCharacter();
});
