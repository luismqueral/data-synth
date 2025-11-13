# 🚀 DataSynth Next.js Server Running!

**Status:** ✅ Active  
**Port:** 3000  
**Process ID:** Running in background  
**Node Version:** 20.19.0  

---

## 🌐 Access the App

**Open in your browser:**
```
http://localhost:3000
```

---

## 🎵 What You'll See

The Next.js version of DataSynth with:
- ✅ Modern React interface
- ✅ Same minimalist design (IBM Plex Mono font)
- ✅ Dataset dropdown with USGS earthquake feeds
- ✅ Play/Stop controls
- ✅ Global settings drawer
- ✅ Audio waveform visualizer
- ✅ D3 patch cable visualization
- ✅ Plugin architecture under the hood

---

## 🎮 How to Use

1. **Select a dataset** from the dropdown (default: All Earthquakes - Past Day)
2. **Click "Play Data"** to start sonification
3. **Open "Global Settings"** to adjust:
   - Volume, Pitch, Speed
   - Waveform type (9 options)
   - Filter type
   - Processing flags
4. **Watch the visualizer** show the frequency spectrum
5. **See the patch view** show data-to-audio mappings

---

## 🔄 Development

The server is running with hot module reloading, so any changes you make to the code will update automatically.

### File Locations

```
datasynth-next/
├── src/
│   ├── app/page.tsx                    # Main editor page
│   ├── components/                     # React components
│   │   ├── data/DatasetSelector.tsx    # Dataset dropdown
│   │   ├── playback/PlaybackControls.tsx
│   │   ├── audio/GlobalSettings.tsx
│   │   └── visualization/
│   │       ├── AudioVisualizer.tsx     # Waveform
│   │       └── PatchVisualization.tsx  # D3 patch
│   │
│   ├── core/                           # Framework-agnostic
│   │   ├── audio/AudioEngine.ts        # Web Audio
│   │   ├── data/DataEngine.ts          # Data processing
│   │   └── plugin/PluginRegistry.ts    # Plugins
│   │
│   └── stores/                         # Zustand state
│       ├── audioStore.ts
│       ├── dataStore.ts
│       └── mappingStore.ts
```

---

## 🛑 Stop the Server

To stop the development server:

```bash
# Find the process
lsof -ti:3000

# Kill it
kill $(lsof -ti:3000)

# Or use Ctrl+C in the terminal where it's running
```

---

## 🐛 Troubleshooting

### Server Won't Start
```bash
cd datasynth-next
source ~/.nvm/nvm.sh
nvm use 20
rm -rf .next
npm run dev
```

### Port 3000 Already in Use
```bash
# Kill existing process
kill $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run dev
```

---

## 📊 Compare with Original

Want to compare with the original HTML version?

```bash
# In another terminal
cd /Users/luisqueral/Library/CloudStorage/GoogleDrive-luismqueral@gmail.com/My\ Drive/projects/json-to-sound-v1
python3 -m http.server 5555

# Open http://localhost:5555/json-mapper-v2.html
```

Now you can see both versions side-by-side!

---

## 🎯 What to Test

### Basic Functionality
- [ ] Dataset loads from dropdown
- [ ] Play button produces sound
- [ ] Waveform visualizer appears
- [ ] Settings drawer opens/closes
- [ ] Volume slider changes volume
- [ ] Mode toggle works (Synth/Sampler)

### Audio Features
- [ ] Different waveforms produce different timbres
- [ ] Filters affect the sound
- [ ] Pitch transpose changes the pitch
- [ ] Speed affects tempo

### Visualization
- [ ] Patch cables appear between nodes
- [ ] Waveform shows frequency spectrum
- [ ] Design matches original

---

## ✨ What's New in Next.js Version

Compared to the original `json-mapper-v2.html`:

### Architecture
- ✅ **Plugin system** - Can add data sources/effects without modifying core
- ✅ **TypeScript** - Type safety throughout
- ✅ **Modular code** - Separated into logical files
- ✅ **Framework-agnostic core** - Can port to other frameworks

### UI/UX
- ✅ **Radix UI components** - Better accessibility
- ✅ **Tailwind CSS** - Modern styling system
- ✅ **React** - Component-based architecture
- ✅ **Same visual design** - IBM Plex Mono, minimalist aesthetic

### Developer Experience
- ✅ **Hot reload** - Changes appear instantly
- ✅ **TypeScript autocomplete** - Better IDE support
- ✅ **Clear structure** - Easy to find code
- ✅ **Testable** - Can unit test core systems

---

**Enjoy the Next.js version of DataSynth! 🚀🎵**

The server is ready and waiting at **http://localhost:3000**

