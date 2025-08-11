# Interactive 3D Baby Character

An interactive 3D web application featuring a baby character that responds to speech input with realistic lip-sync animation.

## Features

- **3D Baby Character**: High-quality FBX model with Character Creator 4 morph targets
- **Speech Recognition**: Real-time microphone input processing
- **AI Response Generation**: Integration with Digital Baby API for intelligent responses
- **Lip-Sync Animation**: Realistic mouth movements synchronized with speech
- **HDRI Lighting**: Professional lighting setup with environment mapping
- **Interactive UI**: Speech bubbles and real-time feedback

## Technical Stack

- **Three.js**: 3D graphics and rendering
- **FBX Loader**: 3D model loading
- **Web Speech API**: Speech recognition
- **Web Audio API**: Audio analysis and processing
- **Character Creator 4**: Morph target system for facial animation

## Project Structure

```
babyyy/
├── src/                          # 3D assets
│   ├── baby.fbx                  # Main 3D model
│   ├── hdri.exr                  # Environment lighting
│   ├── body__Opacity.jpg         # Body alpha map
│   ├── body_Diffuse.jpg          # Body texture
│   ├── clothes_Diffuse.jpg       # Clothes texture
│   ├── hair_Diffuse.jpg          # Hair texture
│   └── ...                       # Other texture files
├── index.html                    # Main HTML file
├── app.js                        # Core application logic
├── phoneme-detector.js           # Phoneme detection and mapping
├── config.js                     # Configuration settings
├── package.json                  # Project dependencies
└── README.md                     # This file
```

## Setup and Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```

3. **Access Application**:
   Open `http://localhost:3000` in your browser

## Usage

1. **Load the Application**: Wait for the 3D model to load completely
2. **Test Morph Targets**: Click "Test Morph" to verify facial animation
3. **Start Speaking**: Click the microphone button and speak
4. **Watch Response**: The baby will respond with speech and lip-sync animation

## Morph Target System

The application uses Character Creator 4 morph targets for realistic facial animation:

### Available Phoneme Morph Targets:
- **Vowels**: EE, Er, IH, Ah, Oh, W_OO, AE
- **Consonants**: S_Z, Ch_J, F_V, TH, T_L_D_N, B_M_P, K_G_H_NG, R

### Additional Facial Morph Targets:
- **Eye Controls**: Blink, Squint, Wide, Look directions
- **Brow Controls**: Raise, Drop, Inner/Outer controls
- **Mouth Controls**: Smile, Frown, Stretch, Press, Pucker
- **Jaw Controls**: Open, Forward, Left/Right
- **Head Controls**: Turn, Tilt, Forward/Backward

## API Integration

The application integrates with the Digital Baby API for generating responses:

```javascript
POST https://digital-baby.pixora.app/api/v1/text-to-speech/baby-voice
```

**Response Format**:
```json
{
  "success": true,
  "audioUrl": "https://media.crafto.app/baby-voice-tts/...",
  "textContent": "Baby's response text",
  "userContent": "User's input text"
}
```

## Configuration

Key settings can be modified in `config.js`:

- **API Configuration**: Endpoints and headers
- **3D Scene Settings**: Camera, lighting, model positioning
- **Speech Recognition**: Language, continuous mode, interim results
- **Performance**: Tone mapping, antialiasing, pixel ratio

## Troubleshooting

### Common Issues:

1. **Morph Targets Not Working**:
   - Click "Test Morph" button to verify
   - Check console for morph target logs
   - Ensure model is fully loaded

2. **Audio Not Playing**:
   - Check browser audio permissions
   - Verify API response contains valid audioUrl
   - Check console for audio errors

3. **Speech Recognition Issues**:
   - Ensure microphone permissions are granted
   - Check browser compatibility (Chrome recommended)
   - Verify internet connection for API calls

4. **3D Model Not Loading**:
   - Check file paths in `src/` directory
   - Verify FBX file integrity
   - Check browser console for loading errors

## Development

### Adding New Features:

1. **New Morph Targets**: Update `phoneme-detector.js` with new mappings
2. **UI Enhancements**: Modify `index.html` and CSS styles
3. **API Integration**: Extend `app.js` with new API calls
4. **Performance**: Adjust settings in `config.js`

### Debugging:

- Use browser console for detailed logs
- Test morph targets with "Test Morph" button
- Monitor network requests for API calls
- Check WebGL support and performance

## Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Limited support (Web Speech API)
- **Edge**: Full support

## License

This project is for educational and development purposes.

## Support

For issues and questions, check the console logs and refer to the troubleshooting section above.
