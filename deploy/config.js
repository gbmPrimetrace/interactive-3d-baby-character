/**
 * Configuration file for the Interactive 3D Baby Character application
 */

const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'https://digital-baby.pixora.app/api/v1/text-to-speech/baby-voice',
        HEADERS: {
            'language': 'english',
            'Content-Type': 'application/json',
            'userId': '10000146533',
            'platform': 'ios',
            'Accept': 'application/json',
            'amplitude-device-id': '766B3893-2FBD-4DB7-92E9-B80152A96568',
            'x-auth-token': 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNvbnkuY29kZS40MDRAZ21haWwuY29tIiwidmVyc2lvbiI6MiwiaWF0IjoxNzUzOTcyNzQ5LCJleHAiOjE4MTcwNDQ3NDl9.bU15LaV9KMpVEDSQk8eDDEpDwNZ2J31KUDDWTOYl8xnD2W2_RLdSdHeWw9OyWWySVMuzajDr-c6EHUjB13dP48eRR0_MQ7rfC6QzOaY-bUR-auCfiOIPyVBE3UUbbwp2Bogt58LmQhOrLjYJFdgB82ghgo_a-6UtN19lXOvd1QVKgjV0S8nZIKAPlDzbs8AkofSNY3nP6khjV5zL8Pc3VKQoDou1oCv2pbv5PS3OfBnZDGtpJJFk0FNjsDP0AXLtpObTE_Bod7qgmpTalK8oalGDtqnHfQnlKQ0dYQkep5sxVemwSj_tCOpVwkupJa8ihBxqeRNpMJ2z1NGX7wIOog',
            'app-id': 'digitalbaby',
            'countryId': '2',
            'build-version': '200'
        }
    },

    // 3D Scene Configuration
    SCENE: {
        BACKGROUND_COLOR: 0x87CEEB,
        FOG_COLOR: 0x87CEEB,
        FOG_NEAR: 10,
        FOG_FAR: 100,
        MODEL_SCALE: 0.06,
        MODEL_POSITION: { x: 0, y: -0.8, z: 0 }
    },

    // Camera Configuration
    CAMERA: {
        FOV: 60,
        NEAR: 0.1,
        FAR: 1000,
        INITIAL_POSITION: { x: 0, y: 0.5, z: 2.5 },
        MIN_DISTANCE: 1.5,
        MAX_DISTANCE: 8,
        MAX_POLAR_ANGLE: Math.PI / 2.2
    },

    // Lighting Configuration
    LIGHTING: {
        AMBIENT: {
            COLOR: 0x404040,
            INTENSITY: 1
        },
        DIRECTIONAL: {
            COLOR: 0xffffff,
            INTENSITY: 1,
            POSITION: { x: 10, y: 10, z: 5 },
            CAST_SHADOW: true,
            SHADOW_MAP_SIZE: 2048
        },
        FILL: {
            COLOR: 0xffffff,
            INTENSITY: 0.3,
            POSITION: { x: -5, y: 5, z: -5 }
        },
        RIM: {
            COLOR: 0xffffff,
            INTENSITY: 0.2,
            POSITION: { x: 0, y: 5, z: -10 }
        }
    },

    // Speech Recognition Configuration
    SPEECH: {
        LANGUAGE: 'en-US',
        CONTINUOUS: false,
        INTERIM_RESULTS: true,
        MAX_ALTERNATIVES: 1
    },

    // Audio Configuration
    AUDIO: {
        VOLUME: 1.0,
        FADE_IN_DURATION: 0.1,
        FADE_OUT_DURATION: 0.1
    },

    // Animation Configuration
    ANIMATION: {
        LIP_SYNC_ENABLED: true,
        IDLE_ANIMATION_ENABLED: true,
        MORPH_TARGET_TRANSITION_DURATION: 0.1
    },

    // UI Configuration
    UI: {
        STATUS_UPDATE_DELAY: 1000,
        LOADING_TIMEOUT: 30000,
        ERROR_DISPLAY_DURATION: 5000
    },

    // Performance Configuration
    PERFORMANCE: {
        SHADOW_ENABLED: true,
        ANTIALIASING: true,
        TONE_MAPPING: 'NeutralToneMapping',
        TONE_MAPPING_EXPOSURE: 1.0,
        PIXEL_RATIO: window.devicePixelRatio || 1
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
