/**
 * Enhanced Phoneme Detection and Audio Analysis System
 * Integrates real-time audio analysis with Character Creator 4 morph targets
 */

class PhonemeDetector {
    constructor() {
        // All available morph targets in the Character Creator 4 model
        this.availableMorphTargets = [
            // Core phoneme morph targets
            'EE', 'Er', 'IH', 'Ah', 'Oh', 'W_OO', 'S_Z', 'Ch_J', 'F_V', 'TH',
            'T_L_D_N', 'B_M_P', 'K_G_H_NG', 'AE', 'R',

            // Additional mouth and jaw morph targets
            'Mouth_Close', 'Jaw_Open', 'Jaw_Forward', 'Jaw_L', 'Jaw_R',
            'Mouth_L', 'Mouth_R', 'Mouth_Stretch_L', 'Mouth_Stretch_R',
            'Mouth_Press_L', 'Mouth_Press_R', 'Mouth_Pucker', 'Mouth_Funnel',
            'Mouth_Roll_In_Upper', 'Mouth_Roll_In_Lower',
            'Mouth_Up_Upper_L', 'Mouth_Up_Upper_R', 'Mouth_Down_Lower_L', 'Mouth_Down_Lower_R',
            'Mouth_Shrug_Upper', 'Mouth_Shrug_Lower',

            // Tongue morph targets
            'Tongue_Bulge_L', 'Tongue_Bulge_R',

            // Facial expression morph targets
            'Mouth_Smile_L', 'Mouth_Smile_R', 'Mouth_Frown_L', 'Mouth_Frown_R',
            'Mouth_Dimple_L', 'Mouth_Dimple_R',
            'Cheek_Raise_L', 'Cheek_Raise_R', 'Cheek_Puff_L', 'Cheek_Puff_R',
            'Nose_Sneer_L', 'Nose_Sneer_R',

            // Eye morph targets
            'Eye_Blink_L', 'Eye_Blink_R', 'Eye_Squint_L', 'Eye_Squint_R',
            'Eye_Wide_L', 'Eye_Wide_R',
            'Eye_L_Look_L', 'Eye_R_Look_L', 'Eye_L_Look_R', 'Eye_R_Look_R',
            'Eye_L_Look_Up', 'Eye_R_Look_Up', 'Eye_L_Look_Down', 'Eye_R_Look_Down',

            // Brow morph targets
            'Brow_Raise_Inner_L', 'Brow_Raise_Inner_R', 'Brow_Raise_Outer_L', 'Brow_Raise_Outer_R',
            'Brow_Drop_L', 'Brow_Drop_R',

            // Head morph targets
            'Head_Turn_Up', 'Head_Turn_Down', 'Head_Turn_L', 'Head_Turn_R',
            'Head_Tilt_L', 'Head_Tilt_R', 'Head_L', 'Head_R', 'Head_Forward', 'Head_Backward'
        ];

        // Enhanced viseme system with multiple morph targets per phoneme
        this.visemeSystem = {
            // Vowels - use multiple morph targets for realistic mouth shapes
            'AA': { primary: 'Ah', secondary: 'Jaw_Open', intensity: 0.8 },      // father, car
            'AE': { primary: 'AE', secondary: 'Jaw_Open', intensity: 0.7 },      // cat, bat
            'AH': { primary: 'Ah', secondary: 'Jaw_Open', intensity: 0.6 },      // cup, luck
            'AO': { primary: 'Oh', secondary: 'Jaw_Open', intensity: 0.8 },      // law, call
            'AW': { primary: 'W_OO', secondary: 'Mouth_Pucker', intensity: 0.9 }, // cow, how
            'AY': { primary: 'Ah', secondary: 'Mouth_Stretch_L', intensity: 0.8 }, // my, eye
            'EH': { primary: 'EE', secondary: 'Jaw_Open', intensity: 0.6 },      // bed, red
            'ER': { primary: 'Er', secondary: 'Mouth_Press_L', intensity: 0.7 }, // her, fur
            'EY': { primary: 'EE', secondary: 'Mouth_Stretch_L', intensity: 0.8 }, // say, day
            'IH': { primary: 'IH', secondary: 'Jaw_Open', intensity: 0.5 },      // it, sit
            'IY': { primary: 'EE', secondary: 'Mouth_Stretch_L', intensity: 0.9 }, // see, me
            'OW': { primary: 'Oh', secondary: 'Mouth_Pucker', intensity: 0.8 },  // go, no
            'OY': { primary: 'W_OO', secondary: 'Mouth_Pucker', intensity: 0.9 }, // boy, toy
            'UH': { primary: 'W_OO', secondary: 'Mouth_Pucker', intensity: 0.7 }, // book, look
            'UW': { primary: 'W_OO', secondary: 'Mouth_Pucker', intensity: 0.9 }, // too, you

            // Consonants - use specific mouth shapes
            'B': { primary: 'B_M_P', secondary: 'Mouth_Close', intensity: 0.9 },  // be, by
            'CH': { primary: 'Ch_J', secondary: 'Mouth_Pucker', intensity: 0.8 }, // cheese, chair
            'D': { primary: 'T_L_D_N', secondary: 'Jaw_Open', intensity: 0.6 },   // do, day
            'DH': { primary: 'TH', secondary: 'Mouth_Stretch_L', intensity: 0.7 }, // the, this
            'F': { primary: 'F_V', secondary: 'Mouth_Press_L', intensity: 0.8 },  // for, from
            'G': { primary: 'K_G_H_NG', secondary: 'Jaw_Open', intensity: 0.7 },  // go, get
            'HH': { primary: 'K_G_H_NG', secondary: 'Jaw_Open', intensity: 0.5 }, // he, how
            'JH': { primary: 'Ch_J', secondary: 'Mouth_Pucker', intensity: 0.8 }, // just, jump
            'K': { primary: 'K_G_H_NG', secondary: 'Jaw_Open', intensity: 0.7 },  // key, keep
            'L': { primary: 'T_L_D_N', secondary: 'Tongue_Bulge_L', intensity: 0.6 }, // like, look
            'M': { primary: 'B_M_P', secondary: 'Mouth_Close', intensity: 0.9 },  // me, my
            'N': { primary: 'T_L_D_N', secondary: 'Jaw_Open', intensity: 0.6 },   // no, not
            'NG': { primary: 'K_G_H_NG', secondary: 'Jaw_Open', intensity: 0.7 }, // sing, ring
            'P': { primary: 'B_M_P', secondary: 'Mouth_Close', intensity: 0.9 },  // please, play
            'R': { primary: 'R', secondary: 'Mouth_Pucker', intensity: 0.7 },     // right, run
            'S': { primary: 'S_Z', secondary: 'Mouth_Stretch_L', intensity: 0.8 }, // see, say
            'SH': { primary: 'S_Z', secondary: 'Mouth_Pucker', intensity: 0.8 },  // she, show
            'T': { primary: 'T_L_D_N', secondary: 'Jaw_Open', intensity: 0.6 },   // to, the
            'TH': { primary: 'TH', secondary: 'Mouth_Stretch_L', intensity: 0.7 }, // think, thing
            'V': { primary: 'F_V', secondary: 'Mouth_Press_L', intensity: 0.8 },  // very, voice
            'W': { primary: 'W_OO', secondary: 'Mouth_Pucker', intensity: 0.9 },  // we, will
            'Y': { primary: 'EE', secondary: 'Mouth_Stretch_L', intensity: 0.7 }, // you, yes
            'Z': { primary: 'S_Z', secondary: 'Mouth_Stretch_L', intensity: 0.8 }, // zoo, zebra
            'ZH': { primary: 'S_Z', secondary: 'Mouth_Pucker', intensity: 0.8 },  // vision, measure

            // Rest/neutral state
            'rest': { primary: 'Ah', secondary: null, intensity: 0.3 },
            'neutral': { primary: 'Ah', secondary: null, intensity: 0.2 }
        };

        // Legacy mapping for backward compatibility
        this.phonemeToMorphTarget = {
            'AA': 'Ah', 'AE': 'AE', 'AH': 'Ah', 'AO': 'Oh', 'AW': 'W_OO',
            'AY': 'Ah', 'EH': 'EE', 'ER': 'Er', 'EY': 'EE', 'IH': 'IH',
            'IY': 'EE', 'OW': 'Oh', 'OY': 'W_OO', 'UH': 'W_OO', 'UW': 'W_OO',
            'B': 'B_M_P', 'CH': 'Ch_J', 'D': 'T_L_D_N', 'DH': 'TH', 'F': 'F_V',
            'G': 'K_G_H_NG', 'HH': 'K_G_H_NG', 'JH': 'Ch_J', 'K': 'K_G_H_NG',
            'L': 'T_L_D_N', 'M': 'B_M_P', 'N': 'T_L_D_N', 'NG': 'K_G_H_NG',
            'P': 'B_M_P', 'R': 'R', 'S': 'S_Z', 'SH': 'S_Z', 'T': 'T_L_D_N',
            'TH': 'TH', 'V': 'F_V', 'W': 'W_OO', 'Y': 'EE', 'Z': 'S_Z',
            'ZH': 'S_Z', 'rest': 'Ah', 'neutral': 'Ah'
        };

        // Audio analysis components
        this.audioContext = null;
        this.analyser = null;
        this.audioSource = null;
        this.isAnalyzing = false;
        this.currentPhoneme = 'Basis';
        this.onPhonemeChange = null;

        // Timing settings
        this.wordPause = 0.05;
        this.sentencePause = 0.2;
        this.morphTransitionDuration = 0.1;
        this.analysisInterval = null;
    }

    /**
     * Initialize audio analysis capabilities
     */
    async initializeAudioAnalysis() {
        try {
            // Check if audio context is already created
            if (this.audioContext) {
                console.log('Audio context already exists');
                return true;
            }

            // Create audio context with user interaction requirement handling
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Resume audio context if suspended (required for Chrome)
            if (this.audioContext.state === 'suspended') {
                console.log('Audio context suspended, attempting to resume...');
                await this.audioContext.resume();
            }

            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;

            console.log('Audio analysis initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize audio analysis:', error);
            return false;
        }
    }

    /**
     * Start real-time audio analysis for lip-sync
     * @param {HTMLAudioElement} audioElement - The audio element to analyze
     * @param {Function} onPhonemeCallback - Callback when phoneme changes
     */
    async startAudioAnalysis(audioElement, onPhonemeCallback) {
        if (this.isAnalyzing) {
            this.stopAudioAnalysis();
        }

        try {
            // Resume audio context if suspended
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Create audio source from the audio element
            this.audioSource = this.audioContext.createMediaElementSource(audioElement);

            // IMPORTANT: Connect to analyser for analysis BUT DON'T disconnect original audio
            // This allows both analysis AND playback to work simultaneously
            this.audioSource.connect(this.analyser);

            // DON'T connect analyser to destination - this would replace the original audio
            // Instead, let the original audio element handle playback
            // this.analyser.connect(this.audioContext.destination); // REMOVED THIS LINE

            // The audio element will continue playing through its original output
            // while we analyze the audio through the analyser node

            this.onPhonemeChange = onPhonemeCallback;
            this.isAnalyzing = true;

            // Start analysis loop
            this.analyzeAudio();
            console.log('Real-time audio analysis started for lip-sync');
        } catch (error) {
            console.error('Failed to start audio analysis:', error);
        }
    }

    /**
     * Start real-time viseme analysis from ElevenLabs audio with high refresh rate
     * @param {HTMLAudioElement} audioElement - The audio element to analyze
     * @param {Function} onVisemeCallback - Callback when viseme changes
     */
    async startRealTimeVisemeAnalysis(audioElement, onVisemeCallback) {
        if (this.isAnalyzing) {
            this.stopAudioAnalysis();
        }

        try {
            // Ensure audio context is initialized
            if (!this.audioContext) {
                const initialized = await this.initializeAudioAnalysis();
                if (!initialized) {
                    throw new Error('Failed to initialize audio context');
                }
            }

            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                console.log('Resuming suspended audio context...');
                await this.audioContext.resume();
            }

            // Check if audio context is running
            if (this.audioContext.state !== 'running') {
                console.log('Audio context not running, current state:', this.audioContext.state);
                throw new Error('Audio context not in running state');
            }

            // Create audio source from the audio element
            this.audioSource = this.audioContext.createMediaElementSource(audioElement);

            // IMPORTANT: Connect to analyser for analysis BUT DON'T disconnect original audio
            // This allows both analysis AND playback to work simultaneously
            this.audioSource.connect(this.analyser);

            // DON'T connect analyser to destination - this would replace the original audio
            // Instead, let the original audio element handle playback
            // this.analyser.connect(this.audioContext.destination); // REMOVED THIS LINE

            // The audio element will continue playing through its original output
            // while we analyze the audio through the analyser node

            this.onVisemeChange = onVisemeCallback;
            this.isAnalyzing = true;

            // Start high-frequency viseme analysis
            this.analyzeVisemesInRealTime();
            console.log('Real-time viseme analysis started with high refresh rate');

            // Check for CORS issues after a short delay
            setTimeout(() => {
                if (this.isAnalyzing) {
                    // Test if we're getting actual audio data
                    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
                    this.analyser.getByteFrequencyData(frequencyData);
                    const totalEnergy = frequencyData.reduce((sum, value) => sum + value, 0);

                    if (totalEnergy === 0) {
                        console.log('Detected CORS issue - no audio data available');
                        this.stopAudioAnalysis();
                        // Don't throw error here, just log it
                        console.log('CORS restrictions prevent audio analysis - will use fallback');
                    }
                }
            }, 100);

        } catch (error) {
            console.error('Failed to start viseme analysis:', error);
            this.isAnalyzing = false;
            throw error;
        }
    }

    /**
     * Stop audio analysis
     */
    stopAudioAnalysis() {
        this.isAnalyzing = false;

        if (this.analysisInterval) {
            cancelAnimationFrame(this.analysisInterval);
            this.analysisInterval = null;
        }

        if (this.audioSource) {
            this.audioSource.disconnect();
            this.audioSource = null;
        }

        this.currentPhoneme = 'Basis';
        if (this.onPhonemeChange) {
            this.onPhonemeChange('Basis');
        }

        if (this.onVisemeChange) {
            this.onVisemeChange({ primary: 'Ah', secondary: null, intensity: 0.0, confidence: 0.0 });
        }

        console.log('Audio analysis stopped');
    }

    /**
     * Real-time audio analysis loop
     */
    analyzeAudio() {
        if (!this.isAnalyzing) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);

        // Detect phoneme from frequency data
        const detectedPhoneme = this.detectPhonemeFromAudio(dataArray);

        if (detectedPhoneme && detectedPhoneme !== this.currentPhoneme) {
            this.currentPhoneme = detectedPhoneme;
            if (this.onPhonemeChange) {
                this.onPhonemeChange(detectedPhoneme);
            }
        }

        // Continue analysis
        requestAnimationFrame(() => this.analyzeAudio());
    }

    /**
     * Analyze visemes in real-time with high refresh rate (60fps)
     */
    analyzeVisemesInRealTime() {
        if (!this.isAnalyzing) return;

        const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(frequencyData);

        // Detect viseme from frequency data with high precision
        const visemeData = this.detectVisemeFromAudio(frequencyData);

        if (visemeData && this.onVisemeChange) {
            this.onVisemeChange(visemeData);
        }

        // Continue analysis at 60fps for high refresh rate
        this.analysisInterval = requestAnimationFrame(() => this.analyzeVisemesInRealTime());
    }

    /**
     * Detect viseme from audio frequency data with high precision
     * @param {Uint8Array} frequencyData - Audio frequency data
     * @returns {Object} Viseme data with primary, secondary, intensity, and confidence
     */
    detectVisemeFromAudio(frequencyData) {
        // Analyze different frequency bands for viseme detection
        const lowFreq = this.getAverageFrequency(frequencyData, 0, 50);      // 0-500Hz
        const midFreq = this.getAverageFrequency(frequencyData, 50, 150);    // 500-1500Hz
        const highFreq = this.getAverageFrequency(frequencyData, 150, 300);  // 1500-3000Hz
        const ultraFreq = this.getAverageFrequency(frequencyData, 300, 500); // 3000-5000Hz

        // Calculate overall intensity
        const totalIntensity = (lowFreq + midFreq + highFreq + ultraFreq) / 4;

        // Determine viseme based on frequency patterns
        let visemeData = this.classifyVisemeFromFrequencies(lowFreq, midFreq, highFreq, ultraFreq, totalIntensity);

        // Add confidence based on signal strength
        visemeData.confidence = Math.min(1.0, totalIntensity / 50);

        return visemeData;
    }

    /**
     * Classify viseme based on frequency patterns
     * @param {number} lowFreq - Low frequency intensity
     * @param {number} midFreq - Mid frequency intensity
     * @param {number} highFreq - High frequency intensity
     * @param {number} ultraFreq - Ultra high frequency intensity
     * @param {number} totalIntensity - Total audio intensity
     * @returns {Object} Viseme data
     */
    classifyVisemeFromFrequencies(lowFreq, midFreq, highFreq, ultraFreq, totalIntensity) {
        // Vowel detection (high low and mid frequencies)
        if (lowFreq > 30 && midFreq > 25) {
            if (highFreq > 20) {
                return { primary: 'EE', secondary: 'Mouth_Stretch_L', intensity: 0.8 }; // E, I sounds
            } else {
                return { primary: 'Ah', secondary: 'Jaw_Open', intensity: 0.7 }; // A, O sounds
            }
        }

        // Consonant detection (high high and ultra frequencies)
        if (highFreq > 25 || ultraFreq > 20) {
            if (ultraFreq > 25) {
                return { primary: 'S_Z', secondary: 'Mouth_Stretch_L', intensity: 0.9 }; // S, Z sounds
            } else if (highFreq > 30) {
                return { primary: 'F_V', secondary: 'Mouth_Press_L', intensity: 0.8 }; // F, V sounds
            } else {
                return { primary: 'T_L_D_N', secondary: 'Jaw_Open', intensity: 0.6 }; // T, D, N sounds
            }
        }

        // Plosive detection (sudden low frequency spikes)
        if (lowFreq > 40 && midFreq < 15) {
            return { primary: 'B_M_P', secondary: 'Mouth_Close', intensity: 0.9 }; // B, P sounds
        }

        // Nasal detection (mid frequency dominance)
        if (midFreq > 30 && lowFreq > 20 && highFreq < 15) {
            return { primary: 'K_G_H_NG', secondary: 'Jaw_Open', intensity: 0.7 }; // M, N, NG sounds
        }

        // Rest/neutral state
        if (totalIntensity < 10) {
            return { primary: 'Ah', secondary: null, intensity: 0.2 };
        }

        // Default to neutral
        return { primary: 'Ah', secondary: null, intensity: 0.3 };
    }

    /**
     * Detect phoneme from audio frequency data
     * @param {Uint8Array} frequencyData - Audio frequency data
     * @returns {string} Detected phoneme
     */
    detectPhonemeFromAudio(frequencyData) {
        // Analyze different frequency ranges
        const lowFreq = this.getAverageFrequency(frequencyData, 0, 100);
        const midFreq = this.getAverageFrequency(frequencyData, 100, 500);
        const highFreq = this.getAverageFrequency(frequencyData, 500, 1000);
        const veryHighFreq = this.getAverageFrequency(frequencyData, 1000, 2000);

        // Enhanced phoneme detection based on frequency characteristics
        if (lowFreq > 60 && midFreq > 40) {
            return 'AH'; // Open mouth sounds (a, ah)
        } else if (midFreq > 50 && highFreq > 30) {
            return 'EE'; // Closed mouth sounds (e, ee)
        } else if (lowFreq > 40 && midFreq < 30) {
            return 'OH'; // Rounded mouth sounds (o, oh)
        } else if (highFreq > 40 && veryHighFreq > 20) {
            return 'S_Z'; // Sibilant sounds (s, z, sh)
        } else if (lowFreq > 30 && midFreq > 20) {
            return 'B_M_P'; // Bilabial sounds (b, m, p)
        } else if (midFreq > 25 && highFreq > 15) {
            return 'F_V'; // Labiodental sounds (f, v)
        } else if (lowFreq > 20 && midFreq > 15) {
            return 'T_L_D_N'; // Alveolar sounds (t, l, d, n)
        } else if (highFreq > 25) {
            return 'Ch_J'; // Affricate sounds (ch, j)
        }

        return 'Ah'; // Neutral/rest state
    }

    /**
     * Calculate average frequency in a range
     * @param {Uint8Array} data - Frequency data
     * @param {number} start - Start index
     * @param {number} end - End index
     * @returns {number} Average frequency value
     */
    getAverageFrequency(data, start, end) {
        let sum = 0;
        let count = 0;
        for (let i = start; i < end && i < data.length; i++) {
            sum += data[i];
            count++;
        }
        return count > 0 ? sum / count : 0;
    }

    /**
     * Extract phonemes from text (fallback method)
     * @param {string} text - Input text to analyze
     * @returns {Array} Array of phoneme objects with timing
     */
    extractPhonemes(text) {
        const phonemes = [];
        const words = text.toLowerCase().split(/\s+/);

        words.forEach((word, wordIndex) => {
            const wordPhonemes = this.wordToPhonemes(word);

            wordPhonemes.forEach((phoneme, phonemeIndex) => {
                const morphTarget = this.phonemeToMorphTarget[phoneme] || 'Ah';
                phonemes.push({
                    phoneme: phoneme,
                    morphTarget: morphTarget,
                    duration: this.getPhonemeDuration(phoneme),
                    wordIndex: wordIndex,
                    phonemeIndex: phonemeIndex
                });
            });

            // Add pause between words
            if (wordIndex < words.length - 1) {
                phonemes.push({
                    phoneme: 'rest',
                    morphTarget: 'Ah',
                    duration: this.wordPause,
                    wordIndex: wordIndex,
                    phonemeIndex: -1
                });
            }
        });

        // Add sentence pause at the end
        phonemes.push({
            phoneme: 'rest',
            morphTarget: 'Ah',
            duration: this.sentencePause,
            wordIndex: -1,
            phonemeIndex: -1
        });

        // Ensure we have a reasonable number of phonemes for timing
        const minPhonemes = Math.max(8, Math.floor(text.length / 2));
        const maxPhonemes = Math.min(25, Math.floor(text.length * 1.5));

        if (phonemes.length < minPhonemes) {
            // Add more phonemes by duplicating some
            const additionalPhonemes = [];
            for (let i = 0; i < minPhonemes - phonemes.length; i++) {
                const randomPhoneme = phonemes[Math.floor(Math.random() * phonemes.length)];
                if (randomPhoneme) {
                    additionalPhonemes.push({ ...randomPhoneme });
                }
            }
            phonemes.push(...additionalPhonemes);
        } else if (phonemes.length > maxPhonemes) {
            // Reduce phonemes by taking every nth phoneme
            const step = Math.ceil(phonemes.length / maxPhonemes);
            const reducedPhonemes = [];
            for (let i = 0; i < phonemes.length; i += step) {
                reducedPhonemes.push(phonemes[i]);
            }
            return reducedPhonemes;
        }

        return phonemes;
    }

    /**
     * Get phoneme duration
     * @param {string} phoneme - Phoneme code
     * @returns {number} Duration in seconds
     */
    getPhonemeDuration(phoneme) {
        const durations = {
            // Vowels (longer duration) - optimized for audio sync
            'AA': 0.2, 'AE': 0.18, 'AH': 0.18, 'AO': 0.2, 'AW': 0.25,
            'AY': 0.2, 'EH': 0.18, 'ER': 0.2, 'EY': 0.2, 'IH': 0.18,
            'IY': 0.2, 'OW': 0.2, 'OY': 0.25, 'UH': 0.18, 'UW': 0.2,

            // Consonants (shorter duration) - optimized for audio sync
            'B': 0.15, 'CH': 0.18, 'D': 0.15, 'DH': 0.15, 'F': 0.18,
            'G': 0.15, 'HH': 0.15, 'JH': 0.18, 'K': 0.15, 'L': 0.15,
            'M': 0.18, 'N': 0.15, 'NG': 0.18, 'P': 0.15, 'R': 0.15,
            'S': 0.18, 'SH': 0.18, 'T': 0.15, 'TH': 0.15, 'V': 0.15,
            'W': 0.15, 'Y': 0.15, 'Z': 0.15, 'ZH': 0.18,

            // Rest states
            'rest': 0.08, 'neutral': 0.08
        };

        return durations[phoneme] || 0.18;
    }

    /**
     * Convert word to phonemes (simplified)
     * @param {string} word - Single word to convert
     * @returns {Array} Array of phoneme codes
     */
    wordToPhonemes(word) {
        const phonemes = [];
        let i = 0;

        while (i < word.length) {
            const phoneme = this.extractNextPhoneme(word, i);
            if (phoneme) {
                phonemes.push(phoneme.phoneme);
                i += phoneme.length;
            } else {
                i++;
            }
        }

        return phonemes;
    }

    /**
     * Extract next phoneme from word
     * @param {string} word - Word to analyze
     * @param {number} i - Starting position
     * @returns {Object|null} Phoneme object or null
     */
    extractNextPhoneme(word, i) {
        const remaining = word.substring(i);

        // Check for multi-character phonemes first
        const multiCharPhonemes = ['CH', 'DH', 'HH', 'JH', 'NG', 'SH', 'TH', 'ZH'];
        for (const phoneme of multiCharPhonemes) {
            const pattern = this.getPhonemePattern(phoneme);
            if (pattern && remaining.match(pattern)) {
                return { phoneme: phoneme, length: 2 };
            }
        }

        // Check for single character phonemes
        const singleCharPhonemes = ['B', 'D', 'F', 'G', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'Y', 'Z'];
        for (const phoneme of singleCharPhonemes) {
            const pattern = this.getPhonemePattern(phoneme);
            if (pattern && remaining.match(pattern)) {
                return { phoneme: phoneme, length: 1 };
            }
        }

        // Check for vowels
        const vowels = ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'];
        for (const phoneme of vowels) {
            const pattern = this.getPhonemePattern(phoneme);
            if (pattern && remaining.match(pattern)) {
                return { phoneme: phoneme, length: 1 };
            }
        }

        return null;
    }

    /**
     * Get regex pattern for phoneme
     * @param {string} phoneme - Phoneme code
     * @returns {RegExp|null} Regex pattern or null
     */
    getPhonemePattern(phoneme) {
        const patterns = {
            // Vowels
            'AA': /^[a]/, 'AE': /^[a]/, 'AH': /^[u]/, 'AO': /^[o]/, 'AW': /^[o]/,
            'AY': /^[a]/, 'EH': /^[e]/, 'ER': /^[e]/, 'EY': /^[a]/, 'IH': /^[i]/,
            'IY': /^[e]/, 'OW': /^[o]/, 'OY': /^[o]/, 'UH': /^[u]/, 'UW': /^[u]/,

            // Consonants
            'B': /^[b]/, 'CH': /^[c]/, 'D': /^[d]/, 'DH': /^[t]/, 'F': /^[f]/,
            'G': /^[g]/, 'HH': /^[h]/, 'JH': /^[j]/, 'K': /^[k]/, 'L': /^[l]/,
            'M': /^[m]/, 'N': /^[n]/, 'NG': /^[n]/, 'P': /^[p]/, 'R': /^[r]/,
            'S': /^[s]/, 'SH': /^[s]/, 'T': /^[t]/, 'TH': /^[t]/, 'V': /^[v]/,
            'W': /^[w]/, 'Y': /^[y]/, 'Z': /^[z]/, 'ZH': /^[z]/
        };

        return patterns[phoneme] || null;
    }

    /**
     * Get morph target name for phoneme
     * @param {string} phoneme - Phoneme code
     * @returns {string} Morph target name
     */
    getMorphTargetName(phoneme) {
        return this.phonemeToMorphTarget[phoneme] || 'Ah';
    }

    /**
     * Get morph target weight for smooth transitions
     * @param {string} phoneme - Phoneme code
     * @returns {number} Weight value (0-1)
     */
    getMorphTargetWeight(phoneme) {
        // Vowels get higher weight for more pronounced mouth shapes
        const vowelPhonemes = ['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW'];
        if (vowelPhonemes.includes(phoneme)) {
            return 1.0; // Full weight for vowels to make them more visible
        }

        // Consonants get higher weight too
        return 0.8; // Higher weight for consonants to make them more visible
    }

    /**
     * Get all available morph targets
     * @returns {Array} Array of available morph target names
     */
    getAvailableMorphTargets() {
        return this.availableMorphTargets;
    }

    /**
     * Validate if morph target exists in model
     * @param {string} morphTargetName - Name of morph target
     * @returns {boolean} True if morph target exists
     */
    isValidMorphTarget(morphTargetName) {
        return this.availableMorphTargets.includes(morphTargetName);
    }

    // Enhanced viseme system methods
    /**
     * Get viseme data for a phoneme
     * @param {string} phoneme - Phoneme code
     * @returns {Object} Viseme data with primary, secondary, and intensity
     */
    getVisemeData(phoneme) {
        return this.visemeSystem[phoneme] || this.visemeSystem['rest'];
    }

    /**
     * Get primary morph target for a phoneme
     * @param {string} phoneme - Phoneme code
     * @returns {string} Primary morph target name
     */
    getPrimaryMorphTarget(phoneme) {
        const viseme = this.getVisemeData(phoneme);
        return viseme.primary;
    }

    /**
     * Get secondary morph target for a phoneme
     * @param {string} phoneme - Phoneme code
     * @returns {string|null} Secondary morph target name or null
     */
    getSecondaryMorphTarget(phoneme) {
        const viseme = this.getVisemeData(phoneme);
        return viseme.secondary;
    }

    /**
     * Get viseme intensity for a phoneme
     * @param {string} phoneme - Phoneme code
     * @returns {number} Intensity value (0-1)
     */
    getVisemeIntensity(phoneme) {
        const viseme = this.getVisemeData(phoneme);
        return viseme.intensity;
    }

    /**
     * Get all morph targets for a phoneme (primary + secondary)
     * @param {string} phoneme - Phoneme code
     * @returns {Array} Array of morph target names
     */
    getAllMorphTargetsForPhoneme(phoneme) {
        const viseme = this.getVisemeData(phoneme);
        const targets = [viseme.primary];
        if (viseme.secondary) {
            targets.push(viseme.secondary);
        }
        return targets;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhonemeDetector;
}
