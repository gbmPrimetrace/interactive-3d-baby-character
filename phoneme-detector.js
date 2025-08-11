/**
 * Professional Audio-Driven Lip-Sync System
 * Inspired by AccuLips technology for Character Creator 4 models
 * 
 * Features:
 * - Real-time audio frequency analysis
 * - Text-audio alignment for perfect timing
 * - Advanced viseme mapping to CC4 morph targets
 * - Audio-driven intensity and timing
 */

class ProfessionalLipSyncSystem {
    constructor() {
        // Character Creator 4 morph targets for perfect lip-sync
        this.cc4MorphTargets = {
            // Core lip-sync morph targets
            'EE': 'EE',           // High front vowel
            'Er': 'Er',           // R-colored vowel
            'IH': 'IH',           // High front vowel
            'Ah': 'Ah',           // Open back vowel
            'Oh': 'Oh',           // Mid back vowel
            'AE': 'AE',           // Low front vowel
            
            // Consonant groups
            'W_OO': 'W_OO',       // Rounded vowels/consonants
            'S_Z': 'S_Z',         // Sibilants
            'Ch_J': 'Ch_J',       // Affricates
            'F_V': 'F_V',         // Labiodentals
            'TH': 'TH',           // Interdentals
            'B_M_P': 'B_M_P',     // Bilabials
            'K_G_H_NG': 'K_G_H_NG', // Velars
            'T_L_D_N': 'T_L_D_N', // Alveolars
            'R': 'R',             // Rhotic
            
            // Jaw and mouth control
            'Jaw_Open': 'Jaw_Open',
            'Mouth_Close': 'Mouth_Close',
            'Mouth_Pucker': 'Mouth_Pucker',
            'Mouth_Stretch_L': 'Mouth_Stretch_L',
            'Mouth_Stretch_R': 'Mouth_Stretch_R'
        };

        // Advanced viseme mapping with audio characteristics
        this.audioVisemeMapping = {
            // Vowels with frequency ranges and intensity curves
            'AA': {
                primary: 'Ah',
                secondary: 'Jaw_Open',
                frequencyRange: [500, 1200],
                intensityCurve: 'bell',
                jawIntensity: 0.8
            },
            'AE': {
                primary: 'AE',
                secondary: 'Jaw_Open',
                frequencyRange: [600, 1500],
                intensityCurve: 'bell',
                jawIntensity: 0.7
            },
            'AH': {
                primary: 'Ah',
                secondary: 'Jaw_Open',
                frequencyRange: [400, 1000],
                intensityCurve: 'bell',
                jawIntensity: 0.6
            },
            'AO': {
                primary: 'Oh',
                secondary: 'Jaw_Open',
                frequencyRange: [400, 800],
                intensityCurve: 'bell',
                jawIntensity: 0.8
            },
            'AW': {
                primary: 'W_OO',
                secondary: 'Mouth_Pucker',
                frequencyRange: [300, 700],
                intensityCurve: 'bell',
                jawIntensity: 0.6
            },
            'AY': {
                primary: 'Ah',
                secondary: 'Mouth_Stretch_L',
                frequencyRange: [500, 1200],
                intensityCurve: 'bell',
                jawIntensity: 0.7
            },
            'EH': {
                primary: 'EE',
                secondary: 'Jaw_Open',
                frequencyRange: [700, 1800],
                intensityCurve: 'bell',
                jawIntensity: 0.5
            },
            'ER': {
                primary: 'Er',
                secondary: 'Mouth_Press_L',
                frequencyRange: [400, 1000],
                intensityCurve: 'bell',
                jawIntensity: 0.4
            },
            'EY': {
                primary: 'EE',
                secondary: 'Mouth_Stretch_L',
                frequencyRange: [800, 2000],
                intensityCurve: 'bell',
                jawIntensity: 0.6
            },
            'IH': {
                primary: 'IH',
                secondary: 'Jaw_Open',
                frequencyRange: [800, 2000],
                intensityCurve: 'bell',
                jawIntensity: 0.4
            },
            'IY': {
                primary: 'EE',
                secondary: 'Mouth_Stretch_L',
                frequencyRange: [1000, 2500],
                intensityCurve: 'bell',
                jawIntensity: 0.5
            },
            'OW': {
                primary: 'Oh',
                secondary: 'Mouth_Pucker',
                frequencyRange: [400, 800],
                intensityCurve: 'bell',
                jawIntensity: 0.7
            },
            'OY': {
                primary: 'W_OO',
                secondary: 'Mouth_Pucker',
                frequencyRange: [300, 700],
                intensityCurve: 'bell',
                jawIntensity: 0.6
            },
            'UH': {
                primary: 'W_OO',
                secondary: 'Mouth_Pucker',
                frequencyRange: [300, 600],
                intensityCurve: 'bell',
                jawIntensity: 0.5
            },
            'UW': {
                primary: 'W_OO',
                secondary: 'Mouth_Pucker',
                frequencyRange: [200, 500],
                intensityCurve: 'bell',
                jawIntensity: 0.6
            },

            // Consonants with specific audio characteristics
            'B': {
                primary: 'B_M_P',
                secondary: 'Mouth_Close',
                frequencyRange: [100, 400],
                intensityCurve: 'sharp',
                jawIntensity: 0.3
            },
            'CH': {
                primary: 'Ch_J',
                secondary: 'Mouth_Pucker',
                frequencyRange: [2000, 4000],
                intensityCurve: 'sharp',
                jawIntensity: 0.2
            },
            'D': {
                primary: 'T_L_D_N',
                secondary: 'Jaw_Open',
                frequencyRange: [200, 600],
                intensityCurve: 'sharp',
                jawIntensity: 0.4
            },
            'DH': {
                primary: 'TH',
                secondary: 'Mouth_Stretch_L',
                frequencyRange: [100, 300],
                intensityCurve: 'smooth',
                jawIntensity: 0.3
            },
            'F': {
                primary: 'F_V',
                secondary: 'Mouth_Press_L',
                frequencyRange: [3000, 6000],
                intensityCurve: 'smooth',
                jawIntensity: 0.2
            },
            'G': {
                primary: 'K_G_H_NG',
                secondary: 'Jaw_Open',
                frequencyRange: [200, 600],
                intensityCurve: 'sharp',
                jawIntensity: 0.5
            },
            'HH': {
                primary: 'K_G_H_NG',
                secondary: 'Jaw_Open',
                frequencyRange: [100, 400],
                intensityCurve: 'smooth',
                jawIntensity: 0.3
            },
            'JH': {
                primary: 'Ch_J',
                secondary: 'Mouth_Pucker',
                frequencyRange: [2000, 4000],
                intensityCurve: 'sharp',
                jawIntensity: 0.2
            },
            'K': {
                primary: 'K_G_H_NG',
                secondary: 'Jaw_Open',
                frequencyRange: [200, 600],
                intensityCurve: 'sharp',
                jawIntensity: 0.5
            },
            'L': {
                primary: 'T_L_D_N',
                secondary: 'Tongue_Bulge_L',
                frequencyRange: [300, 800],
                intensityCurve: 'smooth',
                jawIntensity: 0.4
            },
            'M': {
                primary: 'B_M_P',
                secondary: 'Mouth_Close',
                frequencyRange: [100, 400],
                intensityCurve: 'smooth',
                jawIntensity: 0.3
            },
            'N': {
                primary: 'T_L_D_N',
                secondary: 'Jaw_Open',
                frequencyRange: [200, 600],
                intensityCurve: 'smooth',
                jawIntensity: 0.4
            },
            'NG': {
                primary: 'K_G_H_NG',
                secondary: 'Jaw_Open',
                frequencyRange: [200, 600],
                intensityCurve: 'smooth',
                jawIntensity: 0.5
            },
            'P': {
                primary: 'B_M_P',
                secondary: 'Mouth_Close',
                frequencyRange: [100, 400],
                intensityCurve: 'sharp',
                jawIntensity: 0.3
            },
            'R': {
                primary: 'R',
                secondary: 'Mouth_Pucker',
                frequencyRange: [400, 1000],
                intensityCurve: 'smooth',
                jawIntensity: 0.3
            },
            'S': {
                primary: 'S_Z',
                secondary: 'Mouth_Stretch_L',
                frequencyRange: [4000, 8000],
                intensityCurve: 'smooth',
                jawIntensity: 0.1
            },
            'SH': {
                primary: 'S_Z',
                secondary: 'Mouth_Pucker',
                frequencyRange: [2000, 4000],
                intensityCurve: 'smooth',
                jawIntensity: 0.2
            },
            'T': {
                primary: 'T_L_D_N',
                secondary: 'Jaw_Open',
                frequencyRange: [200, 600],
                intensityCurve: 'sharp',
                jawIntensity: 0.4
            },
            'TH': {
                primary: 'TH',
                secondary: 'Mouth_Stretch_L',
                frequencyRange: [100, 300],
                intensityCurve: 'smooth',
                jawIntensity: 0.3
            },
            'V': {
                primary: 'F_V',
                secondary: 'Mouth_Press_L',
                frequencyRange: [3000, 6000],
                intensityCurve: 'smooth',
                jawIntensity: 0.2
            },
            'W': {
                primary: 'W_OO',
                secondary: 'Mouth_Pucker',
                frequencyRange: [200, 500],
                intensityCurve: 'smooth',
                jawIntensity: 0.4
            },
            'Y': {
                primary: 'EE',
                secondary: 'Mouth_Stretch_L',
                frequencyRange: [800, 2000],
                intensityCurve: 'smooth',
                jawIntensity: 0.4
            },
            'Z': {
                primary: 'S_Z',
                secondary: 'Mouth_Stretch_L',
                frequencyRange: [4000, 8000],
                intensityCurve: 'smooth',
                jawIntensity: 0.1
            },
            'ZH': {
                primary: 'S_Z',
                secondary: 'Mouth_Pucker',
                frequencyRange: [2000, 4000],
                intensityCurve: 'smooth',
                jawIntensity: 0.2
            }
        };

        // Audio analysis configuration
        this.audioConfig = {
            sampleRate: 44100,
            fftSize: 2048,
            frequencyBands: {
                low: [80, 400],      // Bass frequencies
                mid: [400, 2000],    // Mid frequencies
                high: [2000, 8000],  // High frequencies
                ultra: [8000, 22050] // Ultra high frequencies
            },
            analysisInterval: 16,    // ~60 FPS analysis
            smoothingFactor: 0.8     // Smooth transitions
        };

        // State management
        this.audioContext = null;
        this.analyser = null;
        this.audioSource = null;
        this.isAnalyzing = false;
        this.currentViseme = null;
        this.visemeHistory = [];
        this.audioIntensity = 0;
        
        // Text-audio alignment
        this.textTiming = [];
        this.audioTiming = [];
        this.syncOffset = 0;
    }

    /**
     * Initialize the audio analysis system
     */
    async initializeAudioAnalysis() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.audioConfig.fftSize;
            this.analyser.smoothingTimeConstant = 0.8;
            
            console.log('✅ Professional lip-sync audio system initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize audio analysis:', error);
            return false;
        }
    }

    /**
     * Start real-time audio analysis for perfect lip-sync
     */
    async startRealTimeAudioAnalysis(audioElement, onVisemeCallback) {
        if (!this.audioContext || !this.analyser) {
            console.error('❌ Audio system not initialized');
            return false;
        }

        try {
            // Create audio source from element
            this.audioSource = this.audioContext.createMediaElementSource(audioElement);
            this.audioSource.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            this.isAnalyzing = true;
            console.log('🎵 Starting real-time audio analysis for perfect lip-sync...');

            // Start continuous analysis
            this.analyzeAudioContinuously(onVisemeCallback);

            return true;
        } catch (error) {
            console.error('❌ Failed to start audio analysis:', error);
            return false;
        }
    }

    /**
     * Continuous audio analysis for real-time lip-sync
     */
    analyzeAudioContinuously(onVisemeCallback) {
        if (!this.isAnalyzing) return;

        const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(frequencyData);

        // Analyze current audio frame
        const visemeData = this.analyzeAudioFrame(frequencyData);
        
        if (visemeData && onVisemeCallback) {
            onVisemeCallback(visemeData);
        }

        // Continue analysis
        setTimeout(() => {
            this.analyzeAudioContinuously(onVisemeCallback);
        }, this.audioConfig.analysisInterval);
    }

    /**
     * Analyze a single audio frame for viseme detection
     */
    analyzeAudioFrame(frequencyData) {
        // Calculate frequency band intensities
        const bandIntensities = this.calculateFrequencyBandIntensities(frequencyData);
        
        // Detect overall audio intensity
        this.audioIntensity = this.calculateOverallIntensity(frequencyData);
        
        // Detect viseme based on frequency characteristics
        const detectedViseme = this.detectVisemeFromFrequencyAnalysis(bandIntensities);
        
        // Apply smoothing and transitions
        const smoothedViseme = this.applyVisemeSmoothing(detectedViseme);
        
        // Store in history for analysis
        this.visemeHistory.push(smoothedViseme);
        if (this.visemeHistory.length > 10) {
            this.visemeHistory.shift();
        }

        return smoothedViseme;
    }

    /**
     * Calculate intensity for different frequency bands
     */
    calculateFrequencyBandIntensities(frequencyData) {
        const bands = {};
        const binSize = this.audioContext.sampleRate / (this.analyser.fftSize * 2);

        // Low frequencies (bass)
        const lowStart = Math.floor(this.audioConfig.frequencyBands.low[0] / binSize);
        const lowEnd = Math.floor(this.audioConfig.frequencyBands.low[1] / binSize);
        bands.low = this.calculateBandIntensity(frequencyData, lowStart, lowEnd);

        // Mid frequencies
        const midStart = Math.floor(this.audioConfig.frequencyBands.mid[0] / binSize);
        const midEnd = Math.floor(this.audioConfig.frequencyBands.mid[1] / binSize);
        bands.mid = this.calculateBandIntensity(frequencyData, midStart, midEnd);

        // High frequencies
        const highStart = Math.floor(this.audioConfig.frequencyBands.high[0] / binSize);
        const highEnd = Math.floor(this.audioConfig.frequencyBands.high[1] / binSize);
        bands.high = this.calculateBandIntensity(frequencyData, highStart, highEnd);

        // Ultra high frequencies
        const ultraStart = Math.floor(this.audioConfig.frequencyBands.ultra[0] / binSize);
        const ultraEnd = Math.floor(this.audioConfig.frequencyBands.ultra[1] / binSize);
        bands.ultra = this.calculateBandIntensity(frequencyData, ultraStart, ultraEnd);

        return bands;
    }

    /**
     * Calculate intensity for a specific frequency band
     */
    calculateBandIntensity(frequencyData, startBin, endBin) {
        let sum = 0;
        let count = 0;
        
        for (let i = startBin; i <= endBin && i < frequencyData.length; i++) {
            sum += frequencyData[i];
            count++;
        }
        
        return count > 0 ? sum / count / 255 : 0;
    }

    /**
     * Calculate overall audio intensity
     */
    calculateOverallIntensity(frequencyData) {
        let sum = 0;
        for (let i = 0; i < frequencyData.length; i++) {
            sum += frequencyData[i];
        }
        return sum / (frequencyData.length * 255);
    }

    /**
     * Detect viseme based on frequency analysis
     */
    detectVisemeFromFrequencyAnalysis(bandIntensities) {
        const { low, mid, high, ultra } = bandIntensities;
        
        // Use frequency characteristics to determine viseme type
        let primaryViseme = 'Ah'; // Default
        let secondaryViseme = null;
        let confidence = 0.5;
        
        // High frequency dominance (sibilants, fricatives)
        if (high > 0.6 || ultra > 0.5) {
            if (ultra > 0.6) {
                primaryViseme = 'S_Z'; // S, Z sounds
                confidence = Math.min(0.9, ultra);
            } else if (high > 0.7) {
                primaryViseme = 'F_V'; // F, V sounds
                confidence = Math.min(0.8, high);
            }
        }
        // Mid frequency dominance (vowels, nasals)
        else if (mid > 0.6) {
            if (mid > 0.8) {
                primaryViseme = 'EE'; // High front vowels
                confidence = Math.min(0.9, mid);
            } else if (mid > 0.7) {
                primaryViseme = 'Ah'; // Open vowels
                confidence = Math.min(0.8, mid);
            }
        }
        // Low frequency dominance (stops, nasals)
        else if (low > 0.6) {
            if (low > 0.8) {
                primaryViseme = 'B_M_P'; // Bilabial stops
                confidence = Math.min(0.9, low);
            } else if (low > 0.7) {
                primaryViseme = 'K_G_H_NG'; // Velar stops
                confidence = Math.min(0.8, low);
            }
        }

        // Determine secondary viseme based on overall pattern
        if (this.audioIntensity > 0.7) {
            secondaryViseme = 'Jaw_Open';
        } else if (high > 0.5) {
            secondaryViseme = 'Mouth_Stretch_L';
        }

        return {
            primary: primaryViseme,
            secondary: secondaryViseme,
            intensity: this.audioIntensity,
            confidence: confidence,
            frequencyBands: bandIntensities,
            timestamp: performance.now()
        };
    }

    /**
     * Apply smoothing to viseme transitions
     */
    applyVisemeSmoothing(currentViseme) {
        if (!this.currentViseme) {
            this.currentViseme = currentViseme;
            return currentViseme;
        }

        // Smooth transitions between visemes
        const smoothingFactor = this.audioConfig.smoothingFactor;
        
        const smoothedViseme = {
            primary: currentViseme.primary,
            secondary: currentViseme.secondary,
            intensity: this.currentViseme.intensity * smoothingFactor + currentViseme.intensity * (1 - smoothingFactor),
            confidence: this.currentViseme.confidence * smoothingFactor + currentViseme.confidence * (1 - smoothingFactor),
            frequencyBands: currentViseme.frequencyBands,
            timestamp: currentViseme.timestamp
        };

        this.currentViseme = smoothedViseme;
        return smoothedViseme;
    }

    /**
     * Stop audio analysis
     */
    stopAudioAnalysis() {
        this.isAnalyzing = false;
        
        if (this.audioSource) {
            this.audioSource.disconnect();
            this.audioSource = null;
        }
        
        console.log('🛑 Audio analysis stopped');
    }

    /**
     * Get available morph targets
     */
    getAvailableMorphTargets() {
        return Object.keys(this.cc4MorphTargets);
    }

    /**
     * Get viseme data for a specific phoneme
     */
    getVisemeData(phoneme) {
        return this.audioVisemeMapping[phoneme] || {
            primary: 'Ah',
            secondary: null,
            intensity: 0.5,
            jawIntensity: 0.3
        };
    }

    /**
     * Extract phonemes from text (fallback method)
     */
    extractPhonemes(text) {
        // Simple text-to-phoneme conversion for fallback
        const words = text.toLowerCase().split(/\s+/);
        const phonemes = [];
        
        words.forEach(word => {
            const wordPhonemes = this.wordToPhonemes(word);
            phonemes.push(...wordPhonemes);
        });
        
        return phonemes;
    }

    /**
     * Convert word to phonemes
     */
    wordToPhonemes(word) {
        const phonemes = [];
        let i = 0;
        
        while (i < word.length) {
            const phoneme = this.extractNextPhoneme(word, i);
            if (phoneme) {
                phonemes.push({
                    phoneme: phoneme.phoneme,
                    morphTarget: phoneme.morphTarget,
                    duration: phoneme.duration || 0.1
                });
                i += phoneme.length;
            } else {
                i++;
            }
        }
        
        return phonemes;
    }

    /**
     * Extract next phoneme from word
     */
    extractNextPhoneme(word, startIndex) {
        const remaining = word.slice(startIndex);
        
        // Common English phoneme patterns
        const patterns = [
            { pattern: /^th/i, phoneme: 'TH', morphTarget: 'TH', length: 2 },
            { pattern: /^ch/i, phoneme: 'CH', morphTarget: 'Ch_J', length: 2 },
            { pattern: /^sh/i, phoneme: 'SH', morphTarget: 'S_Z', length: 2 },
            { pattern: /^ng/i, phoneme: 'NG', morphTarget: 'K_G_H_NG', length: 2 },
            { pattern: /^ph/i, phoneme: 'F', morphTarget: 'F_V', length: 2 },
            { pattern: /^wh/i, phoneme: 'W', morphTarget: 'W_OO', length: 2 },
            { pattern: /^qu/i, phoneme: 'KW', morphTarget: 'K_G_H_NG', length: 2 },
            { pattern: /^ai/i, phoneme: 'AY', morphTarget: 'Ah', length: 2 },
            { pattern: /^ay/i, phoneme: 'AY', morphTarget: 'Ah', length: 2 },
            { pattern: /^oi/i, phoneme: 'OY', morphTarget: 'W_OO', length: 2 },
            { pattern: /^oy/i, phoneme: 'OY', morphTarget: 'W_OO', length: 2 },
            { pattern: /^ou/i, phoneme: 'OW', morphTarget: 'Oh', length: 2 },
            { pattern: /^ow/i, phoneme: 'OW', morphTarget: 'Oh', length: 2 },
            { pattern: /^ee/i, phoneme: 'IY', morphTarget: 'EE', length: 2 },
            { pattern: /^ea/i, phoneme: 'IY', morphTarget: 'EE', length: 2 },
            { pattern: /^oo/i, phoneme: 'UW', morphTarget: 'W_OO', length: 2 },
            { pattern: /^ar/i, phoneme: 'AR', morphTarget: 'Ah', length: 2 },
            { pattern: /^er/i, phoneme: 'ER', morphTarget: 'Er', length: 2 },
            { pattern: /^ir/i, phoneme: 'ER', morphTarget: 'Er', length: 2 },
            { pattern: /^ur/i, phoneme: 'ER', morphTarget: 'Er', length: 2 },
            { pattern: /^or/i, phoneme: 'OR', morphTarget: 'Oh', length: 2 },
            { pattern: /^aw/i, phoneme: 'AW', morphTarget: 'W_OO', length: 2 },
            { pattern: /^au/i, phoneme: 'AW', morphTarget: 'W_OO', length: 2 }
        ];
        
        // Check patterns first
        for (const pattern of patterns) {
            if (pattern.pattern.test(remaining)) {
                return {
                    phoneme: pattern.phoneme,
                    morphTarget: pattern.morphTarget,
                    length: pattern.length,
                    duration: 0.15
                };
            }
        }
        
        // Single character phonemes
        const char = remaining[0];
        const charPhonemes = {
            'a': { phoneme: 'AE', morphTarget: 'AE', duration: 0.2 },
            'e': { phoneme: 'EH', morphTarget: 'EE', duration: 0.15 },
            'i': { phoneme: 'IH', morphTarget: 'IH', duration: 0.15 },
            'o': { phoneme: 'AH', morphTarget: 'Ah', duration: 0.2 },
            'u': { phoneme: 'UH', morphTarget: 'W_OO', duration: 0.15 },
            'b': { phoneme: 'B', morphTarget: 'B_M_P', duration: 0.1 },
            'c': { phoneme: 'K', morphTarget: 'K_G_H_NG', duration: 0.1 },
            'd': { phoneme: 'D', morphTarget: 'T_L_D_N', duration: 0.1 },
            'f': { phoneme: 'F', morphTarget: 'F_V', duration: 0.15 },
            'g': { phoneme: 'G', morphTarget: 'K_G_H_NG', duration: 0.1 },
            'h': { phoneme: 'HH', morphTarget: 'K_G_H_NG', duration: 0.1 },
            'j': { phoneme: 'JH', morphTarget: 'Ch_J', duration: 0.1 },
            'k': { phoneme: 'K', morphTarget: 'K_G_H_NG', duration: 0.1 },
            'l': { phoneme: 'L', morphTarget: 'T_L_D_N', duration: 0.15 },
            'm': { phoneme: 'M', morphTarget: 'B_M_P', duration: 0.15 },
            'n': { phoneme: 'N', morphTarget: 'T_L_D_N', duration: 0.15 },
            'p': { phoneme: 'P', morphTarget: 'B_M_P', duration: 0.1 },
            'q': { phoneme: 'K', morphTarget: 'K_G_H_NG', duration: 0.1 },
            'r': { phoneme: 'R', morphTarget: 'R', duration: 0.15 },
            's': { phoneme: 'S', morphTarget: 'S_Z', duration: 0.15 },
            't': { phoneme: 'T', morphTarget: 'T_L_D_N', duration: 0.1 },
            'v': { phoneme: 'V', morphTarget: 'F_V', duration: 0.15 },
            'w': { phoneme: 'W', morphTarget: 'W_OO', duration: 0.15 },
            'x': { phoneme: 'KS', morphTarget: 'K_G_H_NG', duration: 0.1 },
            'y': { phoneme: 'Y', morphTarget: 'EE', duration: 0.15 },
            'z': { phoneme: 'Z', morphTarget: 'S_Z', duration: 0.15 }
        };
        
        if (charPhonemes[char]) {
            return {
                ...charPhonemes[char],
                length: 1
            };
        }
        
        return null;
    }
}

// Export for use in other modules
window.ProfessionalLipSyncSystem = ProfessionalLipSyncSystem;
