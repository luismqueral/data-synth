# DataSynth - Next.js Version

**Modern rebuild with plugin architecture**

This is a Next.js migration of DataSynth featuring:
- ✅ Plugin-based architecture for extensibility
- ✅ TypeScript throughout
- ✅ Radix UI + Tailwind CSS
- ✅ Zustand state management
- ✅ Framework-agnostic core (can be ported to any framework)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Architecture

```
src/
├── core/              # Framework-agnostic engines
│   ├── audio/         # AudioEngine (Web Audio API)
│   ├── data/          # DataEngine (data processing)
│   └── plugin/        # PluginRegistry (plugin system)
│
├── plugins/           # Plugin implementations
│   └── data-sources/  # Data source plugins
│
├── stores/            # Zustand state management
│   ├── audioStore.ts
│   ├── dataStore.ts
│   └── mappingStore.ts
│
├── components/        # React UI components
│   ├── audio/         # Audio controls
│   ├── data/          # Data loading
│   ├── playback/      # Playback controls
│   └── visualization/ # D3 visualizations
│
└── app/               # Next.js routes
    └── page.tsx       # Main editor
```

## Plugin System

See `../NEXTJS_ARCHITECTURE.md` for complete plugin development guide.

## Original Version

The original HTML version is preserved as `json-mapper-v2.html` in the parent directory.

## Documentation

- [NEXTJS_ARCHITECTURE.md](../NEXTJS_ARCHITECTURE.md) - Complete architecture guide
- [AUDIO_ENGINE_DOCUMENTATION.md](../AUDIO_ENGINE_DOCUMENTATION.md) - Audio processing reference
- [FRAMEWORK_AGNOSTIC_ARCHITECTURE.md](../FRAMEWORK_AGNOSTIC_ARCHITECTURE.md) - Framework portability

## Migration Status

This is an initial migration focusing on:
- ✅ Core audio engine (framework-agnostic)
- ✅ Data processing engine
- ✅ Plugin system foundation
- ✅ Basic UI recreation
- 🚧 Full feature parity (in progress)
- ⏳ Additional plugins (planned)
- ⏳ Advanced features (planned)
