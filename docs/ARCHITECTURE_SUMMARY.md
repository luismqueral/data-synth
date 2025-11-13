# Architecture Summary

**Quick reference for DataSynth architecture and migration strategy**

---

## 🎯 Project Goal

Migrate DataSynth from a monolithic HTML file to a **sustainable Next.js architecture** with a **plugin system** for extensibility.

---

## 🏗️ Core Architecture Principles

### 1. **Separation of Concerns**

```
┌─────────────┐
│    Core     │ ← Stable, well-tested, versioned API
└─────────────┘
      ↑
      │ Plugin API
      ↓
┌─────────────┐
│   Plugins   │ ← Extensible, hot-swappable, community-driven
└─────────────┘
```

### 2. **Strong Core, Flexible Plugins**

**Core Responsibilities:**
- Audio engine (Web Audio API coordination)
- Data processing (extraction, mapping, scaling)
- Playback scheduling
- Plugin registry & lifecycle management

**Plugin Responsibilities:**
- Data sources (APIs, files, databases)
- Audio effects (chorus, distortion, etc.)
- Synthesizers (wavetable, FM, etc.)
- Visualizations (3D, particles, spectrograms)
- Auto-mapping strategies (ML-based, rule-based)
- Export formats (MIDI, WAV, JSON)

### 3. **Technology Decisions**

| Component | Technology | Why |
|-----------|-----------|-----|
| Framework | Next.js 14+ (App Router) | SSR, RSC, performance |
| State | Zustand | Lightweight, simple API |
| UI | Radix UI + Tailwind | Accessible, customizable |
| Audio | Web Audio API | Native, performant |
| ML | Transformers.js | Client-side embeddings |
| Types | TypeScript (strict) | Type safety, DX |
| Viz | D3.js, Three.js | Powerful, flexible |

---

## 📂 High-Level Structure

```
src/
├── core/              # 🎯 Stable engine (v1.x.x API)
│   ├── audio/         # Web Audio coordination
│   ├── data/          # Data processing
│   ├── playback/      # Scheduling
│   └── plugin/        # Plugin system
│
├── plugins/           # 🔌 Extensible functionality
│   ├── data-sources/
│   ├── audio-effects/
│   ├── synthesizers/
│   ├── visualizations/
│   ├── mappers/
│   └── exporters/
│
├── components/        # React UI
├── hooks/             # React hooks
├── stores/            # Zustand stores
└── app/               # Next.js routes
```

---

## 🔌 Plugin System

### Plugin Types (6 Total)

```typescript
enum PluginType {
    DATA_SOURCE,      // Load data (APIs, files, etc.)
    AUDIO_EFFECT,     // Process audio (chorus, reverb, etc.)
    SYNTHESIZER,      // Generate sound (FM, wavetable, etc.)
    VISUALIZATION,    // Display data (3D, particles, etc.)
    MAPPER,           // Auto-map data to parameters
    EXPORTER          // Export (MIDI, WAV, etc.)
}
```

### Plugin Interface (Simplified)

```typescript
interface Plugin {
    // Metadata
    id: string;
    name: string;
    version: string;
    type: PluginType;
    author: string;
    apiVersion: string;    // e.g., '^1.0.0'
    
    // Lifecycle
    initialize?(api: PluginAPI): Promise<void>;
    activate?(): Promise<void>;
    deactivate?(): Promise<void>;
    
    // Dependencies
    dependencies?: string[];
}
```

### Plugin API (What Plugins Can Access)

```typescript
class PluginAPI {
    audio: {
        getContext(): AudioContext;
        registerEffect(effect: AudioNode): void;
        scheduleNote(params: AudioParams): void;
    };
    
    data: {
        getCurrentData(): any[];
        addDataSource(source: DataSource): void;
    };
    
    mapping: {
        suggestMapping(param: string, path: string): void;
    };
    
    ui: {
        showNotification(message: string): void;
        addToolbarButton(button: ToolbarButton): void;
    };
    
    plugins: {
        invoke(id: string, method: string, ...args: any[]): Promise<any>;
        broadcast(event: string, data: any): void;
    };
}
```

---

## 🎵 Audio Architecture

### Signal Flow

```
Data → Mapping → Source (Synth/Sampler) → Filter → Pan → 
Envelope → Reverb → Delay → Analyser → Output
```

### Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| AudioEngine | Coordinate all audio | `core/audio/AudioEngine.ts` |
| Synthesizer | Generate oscillators | `core/audio/Synthesizer.ts` |
| Sampler | Playback audio buffers | `core/audio/Sampler.ts` |
| EffectsChain | Global effects | `core/audio/EffectsChain.ts` |
| Envelope | ADSR gain control | `core/audio/Envelope.ts` |

### Extensibility Points

Plugins can:
- Add custom oscillators (new waveforms)
- Insert audio effects (chorus, distortion, etc.)
- Override synthesis methods (FM, wavetable, etc.)
- Add analyzers (pitch detection, beat tracking, etc.)

---

## 📊 Data Architecture

### Data Flow

```
Source → Extract Paths → Map to Parameters → Scale/Curve → Audio Params
```

### Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| DataEngine | Coordinate data operations | `core/data/DataEngine.ts` |
| DataExtractor | Find numeric paths | `core/data/DataExtractor.ts` |
| DataMapper | Map data to parameters | `core/data/DataMapper.ts` |
| DataScaler | Normalize & apply curves | `core/data/DataScaler.ts` |

### Extensibility Points

Plugins can:
- Add data sources (APIs, databases, websockets)
- Add data transforms (filters, aggregations, ML)
- Add auto-mapping strategies (ML-based, rule-based)
- Add data validators

---

## 🎮 State Management

### Zustand Stores (5 Total)

```typescript
// Audio state
useAudioStore: {
    audioContext: AudioContext | null;
    isPlaying: boolean;
    samplerMode: boolean;
    sampleBuffer: AudioBuffer | null;
}

// Data state
useDataStore: {
    currentData: any[] | null;
    dataPaths: DataPath[];
    selectedSource: string | null;
}

// Mapping state
useMappingStore: {
    mappings: Record<string, Mapping>;
    presets: MappingPreset[];
}

// Playback state
usePlaybackStore: {
    isPlaying: boolean;
    isPaused: boolean;
    currentIndex: number;
}

// Plugin state
usePluginStore: {
    plugins: Map<string, Plugin>;
    activePlugins: Set<string>;
    registry: PluginRegistry;
}
```

---

## 🔄 Migration Strategy

### 10-Week Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| **1. Core Infrastructure** | Weeks 1-2 | Set up Next.js, implement plugin system |
| **2. First Plugins** | Weeks 3-4 | Migrate existing features as plugins |
| **3. UI Components** | Weeks 5-6 | Build React components with Radix |
| **4. Advanced Plugins** | Weeks 7-8 | Add new functionality (embeddings, etc.) |
| **5. Plugin Tools** | Week 9 | CLI tools, templates, validation |
| **6. Testing & Polish** | Week 10 | Tests, performance, accessibility |

### Migration Order

1. **Core Engine** (audio, data, playback) → Pure TypeScript, no React
2. **Plugin System** (registry, loader, API) → Foundation for extensibility
3. **Basic Plugins** (earthquakes, exoplanets, CSV) → Prove plugin system works
4. **UI Components** (Radix + Tailwind) → Modern, accessible interface
5. **Advanced Features** (prose embeddings, ML mapper) → New capabilities
6. **Documentation** (API docs, plugin guides) → Enable community

---

## 🚀 Getting Started (After Migration)

### For Users

```bash
# Clone repo
git clone https://github.com/yourusername/datasynth.git
cd datasynth

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### For Plugin Developers

```bash
# Create new plugin
npm run create-plugin --name=my-plugin --type=data-source

# Develop with hot reload
npm run dev

# Validate plugin
npm run validate-plugin plugins/my-plugin

# Publish to npm
cd plugins/my-plugin
npm publish --access public
```

---

## 🔑 Key Decisions & Rationale

### Why Plugin Architecture?

**Benefits:**
- ✅ Extend without modifying core
- ✅ Community contributions easier
- ✅ Code splitting (only load what you need)
- ✅ Versioned, stable API
- ✅ Isolate failures (plugin error ≠ core crash)

**Tradeoffs:**
- ⚠️ More complex initial setup
- ⚠️ API design requires forethought
- ⚠️ Testing more involved

**Verdict:** Worth it for long-term sustainability

### Why Next.js (App Router)?

**Benefits:**
- ✅ Server Components for performance
- ✅ Built-in routing, layouts, metadata
- ✅ TypeScript first-class
- ✅ Excellent DX (hot reload, etc.)
- ✅ Easy deployment (Vercel, etc.)

**Tradeoffs:**
- ⚠️ Learning curve (RSC paradigm)
- ⚠️ Slightly heavier than pure React

**Verdict:** Future-proof choice

### Why Zustand (Not Redux/Jotai/etc.)?

**Benefits:**
- ✅ Minimal boilerplate
- ✅ No Provider wrapper needed
- ✅ Easy async actions
- ✅ DevTools support
- ✅ Small bundle size (~1KB)

**Tradeoffs:**
- ⚠️ Less prescriptive than Redux
- ⚠️ Smaller ecosystem

**Verdict:** Perfect for this project's needs

### Why Radix UI (Not MUI/Chakra/etc.)?

**Benefits:**
- ✅ Unstyled (full Tailwind control)
- ✅ Accessibility baked in (ARIA, focus mgmt)
- ✅ Composable primitives
- ✅ Small bundle (tree-shakeable)
- ✅ Headless (framework-agnostic patterns)

**Tradeoffs:**
- ⚠️ More styling work than MUI
- ⚠️ Smaller component library

**Verdict:** Best for custom design + a11y

---

## 📈 Extensibility Examples

### Example 1: Add New Data Source

```typescript
// plugins/data-sources/spotify/index.ts
const spotifyPlugin: DataSourcePlugin = {
    id: 'spotify-source',
    name: 'Spotify',
    type: PluginType.DATA_SOURCE,
    // ...
    async load(options) {
        const tracks = await fetchSpotifyTracks(options.playlistId);
        return {
            data: tracks.map(t => ({
                name: t.name,
                tempo: t.audio_features.tempo,
                energy: t.audio_features.energy,
                valence: t.audio_features.valence,
                danceability: t.audio_features.danceability
            }))
        };
    }
};
```

### Example 2: Add Audio Effect

```typescript
// plugins/audio-effects/distortion/index.ts
const distortionPlugin: AudioEffectPlugin = {
    id: 'distortion-effect',
    name: 'Distortion',
    type: PluginType.AUDIO_EFFECT,
    // ...
    createNode(ctx) {
        const waveshaper = ctx.createWaveShaper();
        waveshaper.curve = makeDistortionCurve(400);
        return waveshaper;
    }
};
```

### Example 3: Add Visualization

```typescript
// plugins/visualizations/particles/index.ts
const particlesPlugin: VisualizationPlugin = {
    id: 'particles-viz',
    name: '3D Particles',
    type: PluginType.VISUALIZATION,
    // ...
    Component: ParticleFieldComponent,
    onDataUpdate(data) {
        // Update particle positions
    }
};
```

---

## 🛡️ Security Considerations

### Plugin Sandboxing

**Production Requirements:**
- Run untrusted plugins in iframes or Web Workers
- Implement Content Security Policy
- Validate plugin code (AST parsing)
- Permission system (audio, data, storage, network, UI)

**Example Permission System:**

```typescript
const plugin: Plugin = {
    // ...
    permissions: {
        audio: true,    // Can access audio system
        data: true,     // Can access data system
        storage: true,  // Can persist settings
        network: false, // Cannot make network requests
        ui: true        // Can modify UI
    }
};
```

---

## 📚 Documentation Structure

```
docs/
├── README.md                      # This file
├── AUDIO_ENGINE_DOCUMENTATION.md  # Complete audio reference
├── NEXTJS_ARCHITECTURE.md         # Full architecture guide
├── ARCHITECTURE_SUMMARY.md        # Quick reference (you are here)
│
├── plugin-development/
│   ├── getting-started.md
│   ├── plugin-api.md
│   ├── plugin-types.md
│   └── examples/
│       ├── data-source-example.md
│       ├── audio-effect-example.md
│       └── visualization-example.md
│
└── architecture/
    ├── audio-engine.md
    ├── data-processing.md
    ├── plugin-system.md
    └── state-management.md
```

---

## ✅ Next Steps

### Immediate (Pre-Migration)

1. **Review docs** - Read NEXTJS_ARCHITECTURE.md and AUDIO_ENGINE_DOCUMENTATION.md
2. **Prototype plugin system** - Build proof-of-concept with one plugin
3. **Test migration** - Port one feature (e.g., earthquakes) to Next.js

### Short-Term (Weeks 1-4)

1. **Set up project** - Initialize Next.js with full structure
2. **Implement core** - AudioEngine, DataEngine, PlaybackEngine
3. **Build plugin system** - Registry, Loader, API
4. **Create first plugins** - Earthquakes, Exoplanets, CSV

### Medium-Term (Weeks 5-8)

1. **Build UI** - Components with Radix + Tailwind
2. **Advanced plugins** - Prose embeddings, ML mapper, new effects
3. **Testing** - Unit, integration, E2E
4. **Documentation** - API docs, plugin guides

### Long-Term (Beyond Week 10)

1. **Community** - Plugin registry, marketplace
2. **Extensions** - Desktop app (Tauri), mobile PWA
3. **Integrations** - Ableton Link, MIDI, OSC
4. **Cloud features** - Save/share projects, collaborate

---

## 🎯 Success Criteria

The migration is successful when:

- ✅ Core functionality matches current HTML version
- ✅ Plugin system allows extending without core changes
- ✅ Performance is equal or better (FPS, latency)
- ✅ At least 5 plugins built and working
- ✅ Plugin development guide completed
- ✅ Community contributor can create plugin in < 1 hour
- ✅ Tests achieve >80% coverage
- ✅ Lighthouse score >90 (performance, accessibility)

---

**Ready to build the future of data sonification! 🚀🎵**

