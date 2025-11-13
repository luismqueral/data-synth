# DataSynth

**Turn any dataset into sound.**

DataSynth is a client-side data sonification tool that transforms JSON, CSV, and GeoJSON data into audio. Built with vanilla JavaScript, Web Audio API, and D3.js - no frameworks, no build step.

🔊 **[Try it live](https://data-synth-two.vercel.app)** | 📖 **[Documentation](docs/AUDIO_ENGINE_DOCUMENTATION.md)**

---

## Features

✨ **Intelligent Mapping**
- Auto-analyzes your data to find interesting patterns
- Maps data fields to audio parameters (pitch, rhythm, effects)
- Suggests optimal scaling curves based on data distribution

🎹 **Dual Sound Engines**
- **Synthesizer:** 10 waveform types (sine, FM, noise, additive, etc.)
- **Sampler:** Upload audio files, pitch shift and slice them with data

🎛️ **Real-Time Effects**
- Reverb (convolution)
- Delay (with analog pitch-shifting)
- Filter (4 types)
- Stereo panning
- Musical quantization

📊 **Live Visualization**
- Patch cable interface showing data→audio mappings
- Real-time waveform display
- Interactive node graph (hover to highlight connections)

---

## Quick Start

### 1. Run Local Server

```bash
python3 -m http.server 8000
```

Then open: **http://localhost:8000**

> **Note:** ES6 modules require HTTP (not file://) to avoid CORS errors

### 2. Load Data

Choose from built-in datasets:
- 🌍 **USGS Earthquakes** (real-time API)
- 🌌 **NASA Exoplanets** (6000+ planets)
- 📦 **Local CSV/JSON files** (drag-and-drop)

Or paste any JSON/CSV URL!

### 3. Play

Click **▶ Play Data** to hear your dataset as sound.

---

## How It Works

```
┌─────────────┐
│  JSON Data  │  → Earthquake magnitude, planet mass, etc.
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  Intelligent Analysis   │  → Find "interesting" fields (high variance)
│  - Variance             │  → Suggest optimal scaling curves
│  - Uniqueness           │  → Map to perceptually important parameters
│  - Range                │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Parameter Mapping      │  → Magnitude → Frequency
│  - Extract values       │  → Depth → Filter
│  - Normalize (0-1)      │  → Latitude → Pan
│  - Apply curves         │  → etc.
│  - Scale to audio range │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Audio Synthesis        │  → Oscillators, samples, effects
│  - Web Audio API        │  → Real-time processing
│  - Effects chain        │  → Reverb → Delay → Output
│  - Envelope (ADSR)      │
└──────┬──────────────────┘
       │
       ▼
       🔊
```

---

## Architecture

### Modular Design

DataSynth uses **4 ES6 modules** for clean separation of concerns:

```
lib/
├── data-processor.js     (~290 lines)  - Pure functions for data parsing
├── parameter-mapper.js   (~461 lines)  - Intelligent mapping algorithm
├── audio-engine.js       (~586 lines)  - Web Audio API management
└── patch-viz.js          (~603 lines)  - D3.js visualization
```

**Coordinated by:**
- `main.js` - Wires modules together, handles playback loop
- `index.html` - UI structure and styling

### No Build Required

- ✅ **ES6 modules** - Native browser imports
- ✅ **Web Audio API** - Browser-native synthesis
- ✅ **D3.js from CDN** - No bundler needed
- ✅ **Tachyons CSS** - Utility-first styling
- ✅ **Static deployment** - Works offline

Deploy to any static host (Vercel, Netlify, GitHub Pages, etc.)

---

## Tech Stack

| Technology | Purpose | Why |
|------------|---------|-----|
| **Vanilla JavaScript** | Core logic | No framework overhead |
| **ES6 Modules** | Code organization | Browser-native, no bundler |
| **Web Audio API** | Sound synthesis | Direct API access, low latency |
| **D3.js** | Node graph viz | Industry standard for data viz |
| **Canvas API** | Waveform display | Hardware-accelerated rendering |
| **Tachyons CSS** | Styling | Utility-first, no custom CSS |

---

## Development

### Running Tests

```bash
python3 -m http.server 8000

# Open in browser:
http://localhost:8000/test/data-processor.test.html
http://localhost:8000/test/parameter-mapper.test.html
http://localhost:8000/test/audio-engine.test.html
http://localhost:8000/test/patch-viz.test.html
```

**Test Coverage:**
- ✅ 77 audio-engine tests
- ✅ 25 data-processor tests
- ✅ 14 parameter-mapper tests
- ✅ 8 patch-viz tests

### Project Structure

```
datasynth/
├── index.html              # Entry point
├── main.js                 # Application coordinator
├── lib/                    # Core modules
│   ├── audio-engine.js
│   ├── data-processor.js
│   ├── parameter-mapper.js
│   └── patch-viz.js
├── test/                   # Unit tests
├── docs/                   # Documentation
├── datasets/               # Sample data
└── _archive/               # Old Next.js exploration
```

### Design Philosophy

**Incremental Development**
- Small, testable changes
- Commit often, keep it working
- Test continuously

**Keep It Simple**
- No frameworks (specialized tool, not a web app)
- No build steps (use native ES6 modules)
- No over-abstraction (solve the problem at hand)
- Static files (maintain deployability)

**Modular Architecture**
- One module = one responsibility
- Pure functions for data processing
- Classes for stateful audio management
- Clear imports/exports

See **[Development Rules](.cursor/rules/datasynth-dev-rules.mdc)** for detailed guidelines.

---

## Documentation

📖 **[Audio Engine Documentation](docs/AUDIO_ENGINE_DOCUMENTATION.md)**
- Complete technical reference
- Signal flow diagrams
- Web Audio API patterns
- Parameter mapping deep dive

📖 **[Refactor Guide](docs/REFACTOR_GUIDE.md)**
- Module extraction process
- Testing strategy
- Migration notes

---

## Datasets

DataSynth works with any JSON/CSV data. Built-in options include:

**🌍 Real-time APIs:**
- USGS Earthquakes (magnitude, depth, location)
- NASA Near-Earth Objects
- ISS Location
- Astronauts in Space

**📦 Local Files:**
- Earthquake archives (1600+ events)
- NASA Exoplanets (6000+ planets)
- Your own JSON/CSV files (drag-and-drop)

See **[datasets/](datasets/)** for sample data and guides.

---

## Audio Parameters

DataSynth can map data to 13+ audio parameters:

**Synthesis:**
- Frequency (pitch)
- Duration (note length)
- Note Spacing (rhythm)
- Waveform type

**Spatial:**
- Pan (stereo position)
- Filter frequency & resonance

**Effects:**
- Delay time, feedback, mix
- Reverb decay, mix

**Envelope:**
- Attack, release

Each parameter has:
- Configurable min/max range
- Curve type (linear, exponential, cubic, logarithmic, inverse)
- Fixed fallback value

---

## Browser Support

**Tested:**
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

**Requirements:**
- Modern browser with Web Audio API support
- JavaScript enabled
- HTTP server (for ES6 modules)

---

## Contributing

This is a personal learning project by [Luis Queral](https://queral.studio), but suggestions and feedback are welcome!

**If you find bugs:**
- Open an issue with steps to reproduce
- Include browser/OS info
- Check console for errors

**If you want to contribute:**
- Keep it simple (no frameworks)
- Follow the design philosophy
- Test your changes
- Update documentation

---

## License

MIT - Use it, learn from it, build your own!

---

## Credits

**Created by:** Luis Queral  
**Website:** [queral.studio](https://queral.studio)  
**GitHub:** [@luismqueral](https://github.com/luismqueral)

**Built with:**
- Web Audio API
- D3.js
- Tachyons CSS
- Earthquake data from USGS
- Exoplanet data from NASA

---

*DataSynth v2.0 - Modular Architecture*
