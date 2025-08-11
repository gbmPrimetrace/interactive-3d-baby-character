# 👶 Interactive 3D Baby Character

An interactive 3D web application featuring a baby character that responds to speech input with realistic lip-sync animation. Built with Three.js, Web Speech API, and Character Creator 4 morph targets.

## 🌟 Features

- **🎭 3D Baby Character**: High-quality FBX model with 80+ Character Creator 4 morph targets
- **🎤 Speech Recognition**: Real-time microphone input processing
- **🤖 AI Response Generation**: Integration with Digital Baby API for intelligent responses
- **👄 Lip-Sync Animation**: Smooth 0→1→0 morph target transitions synchronized with speech
- **💡 HDRI Lighting**: Professional lighting setup with environment mapping
- **📱 Responsive Design**: Optimized for both desktop and mobile devices
- **🎮 Touch Controls**: Mobile-optimized interface with swipe camera controls

## 🚀 Live Demo

**Access the live application**: [Your GitHub Pages URL will be here]

## 🛠️ Technical Stack

- **Three.js**: 3D graphics and rendering
- **FBX Loader**: 3D model loading and animation
- **Web Speech API**: Speech recognition and synthesis
- **Web Audio API**: Audio analysis and processing
- **Character Creator 4**: Morph target system for facial animation
- **Responsive CSS**: Mobile-first design approach

## 📱 Mobile & Web Responsive

- **Centered Controls**: Mic button and camera reset positioned center-bottom
- **Touch Optimized**: Swipe gestures for camera movement on mobile
- **Responsive Layout**: Adapts to all screen sizes (320px to 4K+)
- **Landscape Support**: Optimized for both portrait and landscape orientations
- **Speech Recognition**: Works on all modern mobile browsers

## 🎯 How to Use

1. **Load the Application**: Wait for the 3D model to load completely
2. **Allow Microphone Access**: Grant permission when prompted
3. **Start Speaking**: Click the 🎤 button and speak naturally
4. **Watch Response**: The baby will respond with speech and synchronized lip-sync animation
5. **Camera Controls**: 
   - **Desktop**: Mouse drag to rotate, scroll to zoom
   - **Mobile**: Touch and swipe to control camera

## 🔧 Setup and Installation

### Local Development
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/interactive-3d-baby-character.git
cd interactive-3d-baby-character

# Start local server
npx http-server -p 3000

# Open in browser
open http://localhost:3000
```

### GitHub Pages Deployment
1. **Fork this repository**
2. **Enable GitHub Pages** in repository settings
3. **Select source**: "Deploy from a branch"
4. **Choose branch**: "main" or "master"
5. **Your site will be published at**: `https://YOUR_USERNAME.github.io/interactive-3d-baby-character`

## 📁 Project Structure

```
interactive-3d-baby-character/
├── index.html              # Main HTML file with responsive design
├── app.js                  # Core application logic and 3D scene management
├── config.js               # Configuration settings for camera, lighting, API
├── phoneme-detector.js     # Phoneme detection and morph target mapping
├── src/                    # 3D assets and textures
│   ├── baby.fbx           # Main 3D model (8MB)
│   ├── hdri.exr           # Environment lighting (1.9MB)
│   ├── body_*.jpg         # Body texture maps
│   ├── clothes_*.jpg      # Clothes texture maps
│   ├── hair_*.jpg         # Hair texture maps
│   └── eye_Diffuse.jpg    # Eye texture
├── README.md               # This file
└── .gitignore             # Git ignore patterns
```

## 🎭 Morph Target System

The application uses Character Creator 4 morph targets for realistic facial animation:

### **Core Phoneme Morph Targets**
- **Vowels**: EE, Er, IH, Ah, Oh, W_OO, AE
- **Consonants**: S_Z, Ch_J, F_V, TH, T_L_D_N, B_M_P, K_G_H_NG, R

### **Enhanced Animation Features**
- **Smooth Transitions**: Bell curve interpolation (0→1→0)
- **Dual Target System**: Primary and secondary morph targets
- **Real-time Analysis**: 60fps audio analysis for live lip-sync
- **Fallback System**: Text-based phoneme extraction when audio analysis fails

## 🌐 API Integration

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

## ⚙️ Configuration

Key settings can be modified in `config.js`:

- **API Configuration**: Endpoints and authentication headers
- **3D Scene Settings**: Camera FOV, positioning, and model scale
- **Speech Recognition**: Language, continuous mode, interim results
- **Performance**: Tone mapping, antialiasing, pixel ratio
- **Responsive Design**: Breakpoints and mobile optimizations

## 🔍 Troubleshooting

### Common Issues

1. **Speech Recognition Not Working**:
   - Ensure HTTPS connection (required for Web Speech API)
   - Grant microphone permissions
   - Check browser compatibility (Chrome recommended)

2. **3D Model Not Loading**:
   - Verify all files are uploaded to GitHub Pages
   - Check browser console for loading errors
   - Ensure WebGL support is enabled

3. **Audio Not Playing**:
   - Check browser autoplay policies
   - Verify API responses contain valid audioUrl
   - Ensure audio context is initialized

4. **Mobile Performance Issues**:
   - Use modern mobile browsers (Chrome, Safari)
   - Check device WebGL support
   - Reduce model complexity if needed

## 🌍 Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Limited support (Web Speech API)
- **Edge**: Full support
- **Mobile**: Chrome, Safari, Firefox

## 📱 Mobile Features

- **Touch Controls**: Swipe to rotate camera, pinch to zoom
- **Responsive UI**: Adapts to all screen sizes
- **Speech Recognition**: Works on mobile browsers
- **Performance Optimized**: Reduced polygon count for mobile
- **Landscape Support**: Optimized for both orientations

## 🚀 Performance Optimizations

- **HDRI Lighting**: Single environment map for realistic lighting
- **Efficient Morph Targets**: Only animate active targets
- **Responsive Design**: Adaptive quality based on device capabilities
- **Memory Management**: Proper disposal of 3D resources
- **Mobile Optimization**: Reduced complexity for smaller screens

## 📄 License

This project is for educational and development purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review browser console logs
3. Test on different devices and browsers
4. Create an issue in the GitHub repository

## 🎉 Acknowledgments

- **Three.js**: 3D graphics library
- **Character Creator 4**: Morph target system
- **Digital Baby API**: AI response generation
- **Web Speech API**: Speech recognition capabilities

---

**Your interactive 3D baby character is ready to bring joy to users worldwide!** 🌍✨
