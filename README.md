# Interactive 3D Baby Character 🍼

An interactive 3D baby character with speech recognition, lip-sync animation, and realistic 3D rendering using Three.js.

## ✨ Features

- **3D Baby Model**: High-quality FBX model with realistic textures
- **Speech Recognition**: Built-in microphone support for voice interaction
- **Lip-Sync Animation**: Real-time lip movement based on speech
- **Interactive Controls**: Orbit camera controls and reset functionality
- **Responsive Design**: Works on desktop and mobile devices
- **HDRI Lighting**: Professional lighting with environment maps

## 🚀 Live Demo

**Local Development**: http://localhost:8080 (when running locally)
**GitHub Pages**: Will be available at `https://[your-username].github.io/interactive-3d-baby-character/`

## 🛠️ How to Run

### Option 1: Local Development Server
```bash
# Install http-server globally
npm install -g http-server

# Start the server
http-server -p 8080 --cors

# Open your browser to http://localhost:8080
```

### Option 2: GitHub Pages (Automatic)
1. Push your code to GitHub
2. Go to Repository Settings → Pages
3. Select "Deploy from a branch"
4. Choose "gh-pages" branch
5. Your site will be automatically deployed

## 🎮 How to Use

1. **Load the Page**: Wait for the 3D model to load
2. **Interact with Camera**: 
   - Left click + drag to rotate
   - Right click + drag to pan
   - Scroll to zoom
3. **Speech Recognition**: 
   - Click the 🎤 button to start recording
   - Speak into your microphone
   - The baby will respond with lip-sync animation
4. **Reset Camera**: Click "Reset Camera" to return to default view

## 📁 Project Structure

```
interactive-3d-baby-character/
├── index.html          # Main HTML file
├── app.js             # Main application logic
├── config.js          # Configuration settings
├── phoneme-detector.js # Speech analysis
├── src/               # 3D assets
│   ├── baby.fbx      # 3D model
│   ├── *.jpg         # Textures
│   └── hdri.exr     # Environment map
└── .github/workflows/ # GitHub Actions
```

## 🔧 Technologies Used

- **Three.js**: 3D graphics library
- **Web Speech API**: Speech recognition and synthesis
- **FBX Loader**: 3D model loading
- **EXR Loader**: High dynamic range image support
- **Orbit Controls**: Camera manipulation

## 📱 Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (with limitations)

## 🚨 Requirements

- Modern web browser with WebGL support
- Microphone access for speech recognition
- HTTPS connection (required for speech recognition)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Note**: Make sure to enable microphone permissions in your browser to use the speech recognition features!
