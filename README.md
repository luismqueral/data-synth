# DataSynth

Turn any dataset into sound. A flexible data sonification tool that translates multi-dimensional data (JSON, CSV, GeoJSON) into musical compositions using the Web Audio API.

## 🚧 Current Status: Refactoring to Modular Architecture

**Active Version:** `json-mapper-v2.html` (3400+ lines, fully functional)  
**In Progress:** Refactoring to ES6 modules (`index.html` + `lib/` + `main.js`)

See [`docs/REFACTOR_GUIDE.md`](docs/REFACTOR_GUIDE.md) for migration progress.

## ✨ What It Does

- **Universal Data Mapper:** Load any structured data and map fields to synth parameters
- **Real-Time Data:** Sonify live earthquake feeds, weather, and more
- **Node-Based Visualization:** See your data-to-sound mappings as interactive patch cables
- **Dual Modes:** Synthesizer (oscillators) or Sampler (audio files)
- **Smart Processing:** Auto-detects data ranges and applies optimal scaling

## 🚀 Quick Start

```bash
python3 -m http.server 5555
```

Open in browser:
- **`http://localhost:5555/json-mapper-v2.html`** - Current working version (recommended)
- `http://localhost:5555/index.html` - New modular version (in development)
- `http://localhost:5555/datasets/prose-embeddings-example.html` - Text-to-sound tool

## 📊 Data Sources

### Built-In Datasets
- **Earthquakes:** Real-time USGS feeds (16 different feeds by magnitude/time)
- **Exoplanets:** 6,000+ planets with 683 data fields
- **Weather:** Historical and forecast data
- **Prose/Literature:** ANY text using semantic embeddings ⭐ NEW

See **[datasets/README.md](datasets/README.md)** for complete list and guides.

### Custom Data
Drag & drop any:
- JSON files
- CSV files
- GeoJSON files
- Your own datasets!

## 🎵 How It Works

1. **Load Data:** Upload file or use built-in datasets
2. **Map Parameters:** Connect data fields to sound parameters:
   - Frequency, filter, reverb, pan
   - Attack, release, detune
   - Sample offset (sampler mode)
3. **Play:** Hear your data as sound
4. **Visualize:** Watch the node patch graph update in real-time

## 🆕 Prose Embeddings (NEW!)

Convert any text into sonifiable data using **semantic embeddings**:

```
"Call me Ishmael." → [0.234, -0.891, 0.456, ...] → Sound parameters
```

- **Client-side processing** (no API keys needed)
- Uses Transformers.js (all-MiniLM-L6-v2 model)
- Captures *meaning*, not just word counts
- Perfect for literary analysis, speeches, creative writing

**Try it:** Open `datasets/prose-embeddings-example.html`  
**Learn more:** See [datasets/PROSE_EMBEDDINGS_GUIDE.md](datasets/PROSE_EMBEDDINGS_GUIDE.md)

## 🎹 Features

- **Synthesizer Mode:** Oscillators (sine, square, sawtooth, triangle)
- **Sampler Mode:** Load audio samples, map data to playback position
- **Effects:** Filter, reverb, delay, panning
- **Smart Scaling:** Auto-detects low-variance data and applies curves
- **Rhythmic Quantization:** Snap to musical time divisions
- **Pitch Quantization:** Force frequencies to musical scales
- **Real-Time Visualization:** Waveform display and parameter meters
- **Node Graph:** See data flow from sources to audio outputs

## 🛠️ Tech Stack

- **Audio:** Web Audio API (native browser, no libraries)
- **Visualization:** D3.js (node graphs), Canvas API (waveforms)
- **Data Processing:** Vanilla JavaScript
- **UI:** Tachyons CSS
- **Architecture:** ES6 Modules (native, no build step)
- **Deployment:** Static files (works on any web server)

## 📚 Documentation

### User Guides
- [datasets/README.md](datasets/README.md) - Complete dataset guide
- [datasets/EARTHQUAKES_DATA_GUIDE.md](datasets/EARTHQUAKES_DATA_GUIDE.md) - Earthquake field descriptions
- [datasets/EXOPLANETS_DATA_GUIDE.md](datasets/EXOPLANETS_DATA_GUIDE.md) - Exoplanet data guide

### Developer Guides
- **[docs/REFACTOR_GUIDE.md](docs/REFACTOR_GUIDE.md)** - ⭐ Refactoring progress & plan
- **[docs/ARCHITECTURE_SUMMARY.md](docs/ARCHITECTURE_SUMMARY.md)** - Architecture overview
- [docs/AUDIO_ENGINE_DOCUMENTATION.md](docs/AUDIO_ENGINE_DOCUMENTATION.md) - Complete Web Audio API reference
- [CHANGELOG.md](CHANGELOG.md) - Development history
- [.cursor/rules/datasynth-dev-rules.mdc](.cursor/rules/datasynth-dev-rules.mdc) - Development guidelines

### Archived Documentation
- [_archive/](_archive/) - Previous Next.js exploration (deprecated)

## 🎯 Example Use Cases

- **Data Exploration:** Hear patterns you might miss visually
- **Literary Analysis:** Compare authors, track narrative arcs
- **Accessibility:** Audio representation of complex datasets
- **Art/Music:** Generate compositions from data
- **Education:** Teach data analysis through sound
- **Science Communication:** Make data more engaging

## 🎨 Example Sonifications

**"Live Earth Symphony"** - Real-time earthquakes  
Load: USGS feed → Map: magnitude→frequency, depth→reverb

**"Cosmic Tour"** - Exoplanets  
Load: exoplanets.csv → Map: planet_radius→frequency, temperature→filter

**"Literary Soundscape"** - Moby Dick  
Load: Opening chapter → Embeddings → Map: dimensions→synth parameters

**"Seismic Samples"** - Earthquake chopping  
Load: Audio sample + earthquake data → Map: magnitude→sample offset

## 🤝 Contributing

Found an interesting dataset? Create a guide following existing examples in `datasets/`.

## 📝 License

MIT

