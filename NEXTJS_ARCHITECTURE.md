# Next.js Architecture & Plugin System Design

**Sustainable architecture for DataSynth with extensibility via plugins**

This document outlines a complete Next.js architecture featuring a **plugin system** that allows extending functionality without modifying the core codebase.

---

## 📋 Table of Contents

1. [Architecture Philosophy](#architecture-philosophy)
2. [Project Structure](#project-structure)
3. [Plugin Architecture](#plugin-architecture)
4. [Core Systems](#core-systems)
5. [Technology Stack](#technology-stack)
6. [Implementation Guide](#implementation-guide)
7. [Migration Strategy](#migration-strategy)
8. [Extensibility Examples](#extensibility-examples)

---

## Architecture Philosophy

### Core Principles

**1. Separation of Concerns**
- Audio engine completely decoupled from UI
- Data processing independent of visualization
- Plugins isolated from core functionality

**2. Strong Core, Flexible Plugins**
- Core provides stable API contracts
- Plugins extend without modifying core
- Version core API for backward compatibility

**3. Type Safety**
- TypeScript throughout
- Strict plugin interfaces
- Runtime validation for plugin data

**4. Performance First**
- Web Audio operations off React render cycle
- Code splitting for plugins (dynamic imports)
- Server Components where possible (Next.js 14+)

**5. Developer Experience**
- Hot module reloading for plugins
- Plugin development toolkit
- Comprehensive plugin API documentation

---

## Project Structure

```
datasynth/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── editor/                   # Main editor page
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   └── plugins/                  # Plugin management UI
│   │       └── page.tsx
│   │
│   ├── core/                         # 🎯 CORE ENGINE (stable API)
│   │   ├── audio/
│   │   │   ├── AudioEngine.ts        # Main audio coordinator
│   │   │   ├── Synthesizer.ts        # Synth implementation
│   │   │   ├── Sampler.ts            # Sampler implementation
│   │   │   ├── EffectsChain.ts       # Global effects
│   │   │   ├── Envelope.ts           # ADSR envelope
│   │   │   └── types.ts              # Audio types
│   │   │
│   │   ├── data/
│   │   │   ├── DataEngine.ts         # Data processing coordinator
│   │   │   ├── DataExtractor.ts      # Path extraction
│   │   │   ├── DataMapper.ts         # Parameter mapping
│   │   │   ├── DataScaler.ts         # Normalization/curves
│   │   │   └── types.ts              # Data types
│   │   │
│   │   ├── playback/
│   │   │   ├── PlaybackEngine.ts     # Playback coordinator
│   │   │   ├── Scheduler.ts          # Note scheduling
│   │   │   └── types.ts              # Playback types
│   │   │
│   │   └── plugin/
│   │       ├── PluginRegistry.ts     # Plugin registration
│   │       ├── PluginLoader.ts       # Dynamic loading
│   │       ├── PluginValidator.ts    # Runtime validation
│   │       ├── PluginAPI.ts          # API for plugins
│   │       └── types.ts              # Plugin interfaces
│   │
│   ├── plugins/                      # 🔌 PLUGIN IMPLEMENTATIONS
│   │   ├── data-sources/             # Data source plugins
│   │   │   ├── earthquakes/
│   │   │   │   ├── index.ts
│   │   │   │   ├── config.ts
│   │   │   │   └── EarthquakeSource.ts
│   │   │   ├── exoplanets/
│   │   │   ├── prose-embeddings/
│   │   │   └── csv-loader/
│   │   │
│   │   ├── audio-effects/            # Audio effect plugins
│   │   │   ├── chorus/
│   │   │   ├── distortion/
│   │   │   ├── compressor/
│   │   │   └── granular/
│   │   │
│   │   ├── synthesizers/             # Synthesizer plugins
│   │   │   ├── wavetable/
│   │   │   ├── subtractive/
│   │   │   └── physical-modeling/
│   │   │
│   │   ├── visualizations/           # Visualization plugins
│   │   │   ├── spectrogram/
│   │   │   ├── particle-field/
│   │   │   └── 3d-graph/
│   │   │
│   │   ├── mappers/                  # Mapping strategy plugins
│   │   │   ├── ml-mapper/            # ML-based auto-mapping
│   │   │   ├── harmonic-mapper/      # Music theory-based
│   │   │   └── emotional-mapper/     # Sentiment-based
│   │   │
│   │   └── exporters/                # Export format plugins
│   │       ├── midi-export/
│   │       ├── wav-export/
│   │       └── json-export/
│   │
│   ├── components/                   # React components
│   │   ├── audio/
│   │   │   ├── AudioControls.tsx
│   │   │   ├── EffectsPanel.tsx
│   │   │   ├── WaveformSelector.tsx
│   │   │   └── Visualizer.tsx
│   │   │
│   │   ├── data/
│   │   │   ├── DataLoader.tsx
│   │   │   ├── DataTable.tsx
│   │   │   └── DataSourceSelector.tsx
│   │   │
│   │   ├── mapping/
│   │   │   ├── ParameterMapping.tsx
│   │   │   ├── PatchVisualization.tsx
│   │   │   └── MappingPresets.tsx
│   │   │
│   │   ├── playback/
│   │   │   ├── PlaybackControls.tsx
│   │   │   └── TransportBar.tsx
│   │   │
│   │   └── plugins/
│   │       ├── PluginManager.tsx     # Plugin UI management
│   │       ├── PluginCard.tsx
│   │       └── PluginSettings.tsx
│   │
│   ├── hooks/                        # React hooks
│   │   ├── audio/
│   │   │   ├── useAudioEngine.ts
│   │   │   ├── useEffects.ts
│   │   │   └── useVisualizer.ts
│   │   │
│   │   ├── data/
│   │   │   ├── useDataLoader.ts
│   │   │   └── useDataMapper.ts
│   │   │
│   │   ├── playback/
│   │   │   └── usePlayback.ts
│   │   │
│   │   └── plugins/
│   │       ├── usePlugins.ts
│   │       └── usePluginState.ts
│   │
│   ├── stores/                       # State management (Zustand)
│   │   ├── audioStore.ts
│   │   ├── dataStore.ts
│   │   ├── mappingStore.ts
│   │   ├── playbackStore.ts
│   │   └── pluginStore.ts
│   │
│   ├── lib/                          # Utilities
│   │   ├── utils/
│   │   │   ├── math.ts
│   │   │   ├── audio.ts
│   │   │   └── validation.ts
│   │   │
│   │   └── constants/
│   │       ├── audio.ts
│   │       └── mappings.ts
│   │
│   └── types/                        # Global TypeScript types
│       ├── audio.ts
│       ├── data.ts
│       ├── mapping.ts
│       └── plugin.ts
│
├── plugins-external/                 # 📦 EXTERNAL PLUGIN PACKAGES
│   ├── @datasynth/
│   │   ├── plugin-spotify/           # Example: Spotify integration
│   │   ├── plugin-ableton-link/      # Example: Ableton Link sync
│   │   └── plugin-generative-ai/     # Example: AI-powered mapping
│   │
│   └── community/                    # Third-party plugins
│       └── ...
│
├── public/
│   ├── datasets/                     # Static datasets
│   └── plugins/                      # Plugin assets
│
├── docs/                             # Documentation
│   ├── plugin-development/
│   │   ├── getting-started.md
│   │   ├── plugin-api.md
│   │   └── examples.md
│   │
│   └── architecture/
│       ├── audio-engine.md
│       └── data-processing.md
│
├── scripts/
│   ├── create-plugin.ts              # Plugin scaffolding tool
│   └── validate-plugin.ts            # Plugin validation
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── .env.local
```

---

## Plugin Architecture

### Plugin Types

The system supports **5 core plugin types**:

```typescript
// src/types/plugin.ts

export enum PluginType {
    DATA_SOURCE = 'data-source',       // Load/process data
    AUDIO_EFFECT = 'audio-effect',     // Audio processing
    SYNTHESIZER = 'synthesizer',       // Sound generation
    VISUALIZATION = 'visualization',   // Visual output
    MAPPER = 'mapper',                 // Auto-mapping strategies
    EXPORTER = 'exporter'              // Export formats
}
```

### Plugin Interface

Every plugin must implement this interface:

```typescript
// src/core/plugin/types.ts

export interface Plugin {
    // Metadata
    id: string;                        // Unique identifier (e.g., 'earthquakes-source')
    name: string;                      // Display name
    version: string;                   // Semantic version
    type: PluginType;                  // Plugin category
    author: string;
    description: string;
    icon?: string;                     // Icon URL or component
    
    // Lifecycle hooks
    initialize?: (api: PluginAPI) => Promise<void> | void;
    activate?: () => Promise<void> | void;
    deactivate?: () => Promise<void> | void;
    cleanup?: () => Promise<void> | void;
    
    // Settings
    settings?: PluginSettings;
    defaultSettings?: Record<string, any>;
    
    // Dependencies (other plugins required)
    dependencies?: string[];
    
    // API version compatibility
    apiVersion: string;                // e.g., '^1.0.0'
}

// Type-specific interfaces extend Plugin
export interface DataSourcePlugin extends Plugin {
    type: PluginType.DATA_SOURCE;
    
    // Data loading
    load: (options?: any) => Promise<DataSourceResult>;
    
    // Schema definition (what fields are available)
    getSchema: () => Promise<DataSchema>;
    
    // Preview/sampling
    getSample?: (count: number) => Promise<any[]>;
    
    // Real-time data support
    supportsRealtime?: boolean;
    subscribe?: (callback: (data: any) => void) => () => void;
}

export interface AudioEffectPlugin extends Plugin {
    type: PluginType.AUDIO_EFFECT;
    
    // Create Web Audio nodes
    createNode: (audioContext: AudioContext) => AudioEffectNode;
    
    // Parameter definitions
    parameters: EffectParameter[];
    
    // UI component for settings
    SettingsComponent?: React.ComponentType<EffectSettingsProps>;
}

export interface VisualizationPlugin extends Plugin {
    type: PluginType.VISUALIZATION;
    
    // React component to render
    Component: React.ComponentType<VisualizationProps>;
    
    // Update on data change
    onDataUpdate?: (data: any[]) => void;
    
    // Update on audio analysis
    onAudioUpdate?: (analyserData: Uint8Array) => void;
}

export interface MapperPlugin extends Plugin {
    type: PluginType.MAPPER;
    
    // Analyze data and suggest mappings
    analyze: (data: any[], paths: DataPath[]) => Promise<MappingSuggestion[]>;
    
    // Strategy metadata
    strategy: {
        name: string;
        description: string;
        bestFor?: string[];              // e.g., ['time-series', 'geospatial']
    };
}

export interface ExporterPlugin extends Plugin {
    type: PluginType.EXPORTER;
    
    // Export current state
    export: (state: AppState) => Promise<ExportResult>;
    
    // Supported format
    format: {
        name: string;
        extension: string;
        mimeType: string;
    };
}
```

### Plugin API

Core provides a stable API to plugins:

```typescript
// src/core/plugin/PluginAPI.ts

export class PluginAPI {
    // Audio system access
    audio: {
        getContext: () => AudioContext;
        getEffectsChain: () => EffectsChain;
        registerEffect: (effect: AudioNode) => void;
        scheduleNote: (params: AudioParams, time: number) => void;
    };
    
    // Data system access
    data: {
        getCurrentData: () => any[];
        getDataPaths: () => DataPath[];
        addDataSource: (source: DataSource) => void;
        transformData: (fn: (data: any[]) => any[]) => void;
    };
    
    // Mapping system access
    mapping: {
        getCurrentMappings: () => Record<string, Mapping>;
        suggestMapping: (param: string, path: string) => void;
        applyMappings: (mappings: Record<string, Mapping>) => void;
    };
    
    // UI system access
    ui: {
        showNotification: (message: string, type: 'info' | 'success' | 'error') => void;
        openModal: (content: React.ReactNode) => void;
        closeModal: () => void;
        addToolbarButton: (button: ToolbarButton) => void;
    };
    
    // State access
    state: {
        get: <T>(key: string) => T;
        set: <T>(key: string, value: T) => void;
        subscribe: (key: string, callback: (value: any) => void) => () => void;
    };
    
    // Plugin communication
    plugins: {
        get: (id: string) => Plugin | undefined;
        invoke: (id: string, method: string, ...args: any[]) => Promise<any>;
        broadcast: (event: string, data: any) => void;
        listen: (event: string, callback: (data: any) => void) => () => void;
    };
    
    // Storage (persistent plugin settings)
    storage: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<void>;
        remove: (key: string) => Promise<void>;
    };
    
    // Logger
    logger: {
        info: (message: string, meta?: any) => void;
        warn: (message: string, meta?: any) => void;
        error: (message: string, error?: Error) => void;
    };
}
```

### Plugin Registry

Manages plugin lifecycle:

```typescript
// src/core/plugin/PluginRegistry.ts

export class PluginRegistry {
    private plugins = new Map<string, Plugin>();
    private activePlugins = new Set<string>();
    private api: PluginAPI;
    
    constructor(api: PluginAPI) {
        this.api = api;
    }
    
    // Register a plugin
    async register(plugin: Plugin): Promise<void> {
        // Validate plugin
        this.validatePlugin(plugin);
        
        // Check API compatibility
        if (!this.isCompatible(plugin.apiVersion)) {
            throw new Error(`Plugin ${plugin.id} requires API ${plugin.apiVersion}`);
        }
        
        // Check dependencies
        await this.checkDependencies(plugin);
        
        // Initialize plugin
        if (plugin.initialize) {
            await plugin.initialize(this.api);
        }
        
        // Store plugin
        this.plugins.set(plugin.id, plugin);
        
        console.log(`✅ Registered plugin: ${plugin.name} v${plugin.version}`);
    }
    
    // Activate a plugin
    async activate(pluginId: string): Promise<void> {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) throw new Error(`Plugin ${pluginId} not found`);
        
        if (plugin.activate) {
            await plugin.activate();
        }
        
        this.activePlugins.add(pluginId);
    }
    
    // Deactivate a plugin
    async deactivate(pluginId: string): Promise<void> {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) throw new Error(`Plugin ${pluginId} not found`);
        
        if (plugin.deactivate) {
            await plugin.deactivate();
        }
        
        this.activePlugins.delete(pluginId);
    }
    
    // Get plugins by type
    getPluginsByType(type: PluginType): Plugin[] {
        return Array.from(this.plugins.values())
            .filter(p => p.type === type);
    }
    
    // Get active plugins
    getActivePlugins(): Plugin[] {
        return Array.from(this.activePlugins)
            .map(id => this.plugins.get(id)!)
            .filter(Boolean);
    }
    
    // Plugin communication
    async invokePlugin(
        pluginId: string, 
        method: string, 
        ...args: any[]
    ): Promise<any> {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) throw new Error(`Plugin ${pluginId} not found`);
        
        if (typeof (plugin as any)[method] !== 'function') {
            throw new Error(`Method ${method} not found on plugin ${pluginId}`);
        }
        
        return await (plugin as any)[method](...args);
    }
    
    // Event broadcasting
    private eventListeners = new Map<string, Set<Function>>();
    
    broadcast(event: string, data: any): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }
    }
    
    listen(event: string, callback: (data: any) => void): () => void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)!.add(callback);
        
        // Return unsubscribe function
        return () => {
            this.eventListeners.get(event)?.delete(callback);
        };
    }
    
    // Validation
    private validatePlugin(plugin: Plugin): void {
        if (!plugin.id) throw new Error('Plugin must have an id');
        if (!plugin.name) throw new Error('Plugin must have a name');
        if (!plugin.version) throw new Error('Plugin must have a version');
        if (!plugin.type) throw new Error('Plugin must have a type');
        if (this.plugins.has(plugin.id)) {
            throw new Error(`Plugin ${plugin.id} already registered`);
        }
    }
    
    private isCompatible(requiredVersion: string): boolean {
        // Use semver to check compatibility
        // For now, simple check
        return requiredVersion.startsWith('1.');
    }
    
    private async checkDependencies(plugin: Plugin): Promise<void> {
        if (!plugin.dependencies) return;
        
        for (const depId of plugin.dependencies) {
            if (!this.plugins.has(depId)) {
                throw new Error(
                    `Plugin ${plugin.id} requires ${depId} which is not installed`
                );
            }
        }
    }
}
```

### Plugin Loader

Dynamically loads plugins:

```typescript
// src/core/plugin/PluginLoader.ts

export class PluginLoader {
    private registry: PluginRegistry;
    
    constructor(registry: PluginRegistry) {
        this.registry = registry;
    }
    
    // Load built-in plugins
    async loadBuiltInPlugins(): Promise<void> {
        const pluginModules = [
            // Data sources
            () => import('@/plugins/data-sources/earthquakes'),
            () => import('@/plugins/data-sources/exoplanets'),
            () => import('@/plugins/data-sources/prose-embeddings'),
            
            // Visualizations
            () => import('@/plugins/visualizations/spectrogram'),
            () => import('@/plugins/visualizations/waveform'),
        ];
        
        for (const loadPlugin of pluginModules) {
            try {
                const module = await loadPlugin();
                const plugin = module.default as Plugin;
                await this.registry.register(plugin);
            } catch (error) {
                console.error('Failed to load plugin:', error);
            }
        }
    }
    
    // Load external plugin from URL
    async loadExternalPlugin(url: string): Promise<void> {
        try {
            // Fetch plugin code
            const response = await fetch(url);
            const code = await response.text();
            
            // Security: validate and sandbox
            // In production, use proper sandboxing
            const plugin = await this.evaluatePlugin(code);
            
            await this.registry.register(plugin);
        } catch (error) {
            console.error('Failed to load external plugin:', error);
            throw error;
        }
    }
    
    // Load plugin from npm package
    async loadNpmPlugin(packageName: string): Promise<void> {
        try {
            // Dynamic import from node_modules
            const module = await import(packageName);
            const plugin = module.default as Plugin;
            await this.registry.register(plugin);
        } catch (error) {
            console.error('Failed to load npm plugin:', error);
            throw error;
        }
    }
    
    private async evaluatePlugin(code: string): Promise<Plugin> {
        // WARNING: eval() is dangerous! In production:
        // 1. Use a sandboxed iframe
        // 2. Use Web Workers
        // 3. Validate code with AST parsing
        // 4. Implement Content Security Policy
        
        // For demonstration only:
        const module = { exports: {} };
        const fn = new Function('module', 'exports', code);
        fn(module, module.exports);
        
        return (module.exports as any).default as Plugin;
    }
}
```

---

## Core Systems

### 1. Audio Engine (Core)

**Responsibility:** Coordinate all audio operations

```typescript
// src/core/audio/AudioEngine.ts

export class AudioEngine {
    private context: AudioContext | null = null;
    private effectsChain: EffectsChain | null = null;
    private synthesizer: Synthesizer;
    private sampler: Sampler;
    
    // Plugin effects
    private pluginEffects = new Map<string, AudioNode>();
    
    constructor() {
        this.synthesizer = new Synthesizer();
        this.sampler = new Sampler();
    }
    
    initialize(): void {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.effectsChain = new EffectsChain(this.context);
    }
    
    getContext(): AudioContext {
        if (!this.context) this.initialize();
        return this.context!;
    }
    
    getEffectsChain(): EffectsChain {
        if (!this.effectsChain) this.initialize();
        return this.effectsChain!;
    }
    
    // Plugin integration
    registerEffect(id: string, effect: AudioNode): void {
        this.pluginEffects.set(id, effect);
        this.effectsChain?.addEffect(effect);
    }
    
    unregisterEffect(id: string): void {
        const effect = this.pluginEffects.get(id);
        if (effect) {
            this.effectsChain?.removeEffect(effect);
            this.pluginEffects.delete(id);
        }
    }
    
    playNote(params: AudioParams): void {
        // Delegate to synthesizer or sampler
        if (params.mode === 'sampler') {
            this.sampler.playNote(params, this.context!, this.effectsChain!);
        } else {
            this.synthesizer.playNote(params, this.context!, this.effectsChain!);
        }
    }
}
```

### 2. Data Engine (Core)

**Responsibility:** Process and transform data

```typescript
// src/core/data/DataEngine.ts

export class DataEngine {
    private dataSources = new Map<string, DataSource>();
    private currentData: any[] | null = null;
    private transformPipeline: DataTransform[] = [];
    
    // Register data source plugin
    registerDataSource(id: string, source: DataSource): void {
        this.dataSources.set(id, source);
    }
    
    // Load data from a source
    async loadData(sourceId: string, options?: any): Promise<any[]> {
        const source = this.dataSources.get(sourceId);
        if (!source) throw new Error(`Data source ${sourceId} not found`);
        
        const result = await source.load(options);
        this.currentData = result.data;
        
        // Apply transform pipeline
        this.currentData = this.applyTransforms(this.currentData);
        
        return this.currentData;
    }
    
    // Add transform (plugin-provided)
    addTransform(transform: DataTransform): void {
        this.transformPipeline.push(transform);
    }
    
    private applyTransforms(data: any[]): any[] {
        return this.transformPipeline.reduce(
            (acc, transform) => transform(acc),
            data
        );
    }
    
    getCurrentData(): any[] {
        return this.currentData || [];
    }
}
```

### 3. Playback Engine (Core)

**Responsibility:** Schedule and coordinate playback

```typescript
// src/core/playback/PlaybackEngine.ts

export class PlaybackEngine {
    private isPlaying = false;
    private scheduler: Scheduler;
    private audioEngine: AudioEngine;
    private dataEngine: DataEngine;
    
    constructor(audioEngine: AudioEngine, dataEngine: DataEngine) {
        this.audioEngine = audioEngine;
        this.dataEngine = dataEngine;
        this.scheduler = new Scheduler();
    }
    
    async play(mappings: Record<string, Mapping>): Promise<void> {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        const data = this.dataEngine.getCurrentData();
        
        for (let i = 0; i < data.length && this.isPlaying; i++) {
            const item = data[i];
            
            // Calculate audio parameters from mappings
            const params = this.calculateParams(item, mappings);
            
            // Play note
            this.audioEngine.playNote(params);
            
            // Wait for next note
            await this.scheduler.wait(params.noteSpacing);
        }
        
        this.isPlaying = false;
    }
    
    stop(): void {
        this.isPlaying = false;
    }
    
    private calculateParams(
        item: any, 
        mappings: Record<string, Mapping>
    ): AudioParams {
        // Use DataMapper to calculate parameters
        // ... (see AUDIO_ENGINE_DOCUMENTATION.md for full implementation)
        return {} as AudioParams;
    }
}
```

---

## Technology Stack

### Frontend

```json
{
  "dependencies": {
    "next": "^14.2.0",                    // Next.js App Router
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    
    // State Management
    "zustand": "^4.5.0",                  // Lightweight state
    
    // UI Components
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    
    // Visualization
    "d3": "^7.9.0",
    "@types/d3": "^7.4.3",
    
    // Machine Learning (for prose embeddings)
    "@xenova/transformers": "^2.17.1",
    "umap-js": "^1.4.0",
    
    // Utilities
    "clsx": "^2.1.0",                     // Class name utility
    "tailwind-merge": "^2.2.1",           // Merge Tailwind classes
    "zod": "^3.22.4",                     // Runtime validation
    "semver": "^7.6.0"                    // Plugin version checking
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.55",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "prettier": "^3.2.5"
  }
}
```

### Project Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    serverActions: true,
  },
  
  // Webpack config for audio worklets
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Add support for audio worklets
      config.module.rules.push({
        test: /\.worklet\.(ts|js)$/,
        use: { loader: 'worklet-loader' }
      });
      
      // Externalize native modules
      config.externals.push({
        'umap-js': 'umap-js'
      });
    }
    
    return config;
  },
  
  // Headers for Web Audio and SharedArrayBuffer
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

---

## Implementation Guide

### Step 1: Initialize Project

```bash
# Create Next.js app
npx create-next-app@latest datasynth --typescript --tailwind --app

cd datasynth

# Install dependencies
npm install zustand @radix-ui/react-slider @radix-ui/react-select \
            @radix-ui/react-switch @radix-ui/react-dialog \
            @radix-ui/react-tabs d3 @xenova/transformers \
            umap-js zod semver clsx tailwind-merge

# Install dev dependencies
npm install -D @types/d3 worklet-loader
```

### Step 2: Set Up Core Architecture

```typescript
// src/core/plugin/PluginAPI.ts
export class PluginAPI {
  // Implementation from above
}

// src/core/plugin/PluginRegistry.ts
export class PluginRegistry {
  // Implementation from above
}

// src/core/plugin/PluginLoader.ts
export class PluginLoader {
  // Implementation from above
}

// src/core/audio/AudioEngine.ts
export class AudioEngine {
  // Implementation from above
}

// src/core/data/DataEngine.ts
export class DataEngine {
  // Implementation from above
}

// src/core/playback/PlaybackEngine.ts
export class PlaybackEngine {
  // Implementation from above
}
```

### Step 3: Create First Plugin

```bash
# Use scaffolding script
npm run create-plugin --name=earthquakes --type=data-source
```

```typescript
// src/plugins/data-sources/earthquakes/index.ts

import { DataSourcePlugin, PluginType } from '@/types/plugin';

const earthquakesPlugin: DataSourcePlugin = {
    id: 'earthquakes-source',
    name: 'USGS Earthquakes',
    version: '1.0.0',
    type: PluginType.DATA_SOURCE,
    author: 'DataSynth Core',
    description: 'Real-time earthquake data from USGS',
    apiVersion: '1.0.0',
    
    async initialize(api) {
        console.log('Initializing Earthquakes plugin');
    },
    
    async load(options = {}) {
        const feed = options.feed || 'all_week';
        const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${feed}.geojson`;
        
        const response = await fetch(url);
        const geojson = await response.json();
        
        return {
            data: geojson.features.map((f: any) => ({
                ...f.properties,
                longitude: f.geometry.coordinates[0],
                latitude: f.geometry.coordinates[1],
                depth: f.geometry.coordinates[2]
            })),
            metadata: {
                source: 'USGS',
                count: geojson.features.length,
                updated: geojson.metadata.generated
            }
        };
    },
    
    async getSchema() {
        return {
            fields: [
                { name: 'mag', type: 'number', description: 'Magnitude' },
                { name: 'depth', type: 'number', description: 'Depth (km)' },
                { name: 'latitude', type: 'number', description: 'Latitude' },
                { name: 'longitude', type: 'number', description: 'Longitude' },
                { name: 'time', type: 'number', description: 'Unix timestamp' },
                { name: 'sig', type: 'number', description: 'Significance' }
            ]
        };
    },
    
    supportsRealtime: true,
    
    subscribe(callback) {
        // Poll every minute
        const interval = setInterval(async () => {
            const result = await this.load();
            callback(result.data);
        }, 60000);
        
        // Return unsubscribe function
        return () => clearInterval(interval);
    }
};

export default earthquakesPlugin;
```

### Step 4: Create Plugin Management UI

```tsx
// src/app/plugins/page.tsx

'use client';

import { usePluginStore } from '@/stores/pluginStore';
import { PluginCard } from '@/components/plugins/PluginCard';
import { Button } from '@/components/ui/Button';

export default function PluginsPage() {
    const { plugins, activePlugins, activatePlugin, deactivatePlugin } = usePluginStore();
    
    return (
        <div className="container mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Plugin Manager</h1>
                <p className="text-gray-600">
                    Extend DataSynth with plugins
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plugins.map(plugin => (
                    <PluginCard
                        key={plugin.id}
                        plugin={plugin}
                        active={activePlugins.has(plugin.id)}
                        onToggle={() => {
                            if (activePlugins.has(plugin.id)) {
                                deactivatePlugin(plugin.id);
                            } else {
                                activatePlugin(plugin.id);
                            }
                        }}
                    />
                ))}
            </div>
            
            <div className="mt-8 border-t pt-8">
                <h2 className="text-xl font-bold mb-4">Install Plugin</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="npm package or URL"
                        className="flex-1 px-4 py-2 border rounded"
                    />
                    <Button>Install</Button>
                </div>
            </div>
        </div>
    );
}
```

### Step 5: Integrate Plugins into Main App

```tsx
// src/app/editor/page.tsx

'use client';

import { useEffect } from 'react';
import { usePluginStore } from '@/stores/pluginStore';
import { DataLoader } from '@/components/data/DataLoader';
import { ParameterMapping } from '@/components/mapping/ParameterMapping';
import { AudioControls } from '@/components/audio/AudioControls';

export default function EditorPage() {
    const { initializePlugins, getPluginsByType } = usePluginStore();
    
    useEffect(() => {
        // Load plugins on mount
        initializePlugins();
    }, [initializePlugins]);
    
    const dataSources = getPluginsByType('data-source');
    const visualizations = getPluginsByType('visualization');
    
    return (
        <div className="h-screen flex flex-col">
            <header className="border-b p-4">
                <h1 className="text-2xl font-bold">DataSynth Editor</h1>
            </header>
            
            <main className="flex-1 flex overflow-hidden">
                {/* Left: Data */}
                <aside className="w-80 border-r p-4 overflow-y-auto">
                    <DataLoader sources={dataSources} />
                </aside>
                
                {/* Center: Visualization */}
                <section className="flex-1 p-4">
                    {visualizations[0] && (
                        <visualizations[0].Component />
                    )}
                </section>
                
                {/* Right: Controls */}
                <aside className="w-96 border-l p-4 overflow-y-auto">
                    <AudioControls />
                    <ParameterMapping />
                </aside>
            </main>
            
            <footer className="border-t p-4">
                <PlaybackControls />
            </footer>
        </div>
    );
}
```

---

## Migration Strategy

### Phase 1: Core Infrastructure (Weeks 1-2)

**Goal:** Set up project structure and core systems

- [ ] Initialize Next.js project with TypeScript
- [ ] Set up folder structure
- [ ] Implement PluginRegistry, PluginLoader, PluginAPI
- [ ] Port AudioEngine from existing code
- [ ] Port DataEngine from existing code
- [ ] Port PlaybackEngine from existing code
- [ ] Set up Zustand stores
- [ ] Create basic UI shell with Radix

### Phase 2: First Plugins (Weeks 3-4)

**Goal:** Migrate existing functionality as plugins

- [ ] Create Earthquakes data source plugin
- [ ] Create Exoplanets data source plugin
- [ ] Create CSV Loader plugin
- [ ] Create Waveform visualizer plugin
- [ ] Create Patch visualization plugin
- [ ] Test plugin loading and activation

### Phase 3: UI Components (Weeks 5-6)

**Goal:** Build user interface

- [ ] Data loader component with plugin selector
- [ ] Parameter mapping component
- [ ] Audio controls (synth/sampler toggle)
- [ ] Effects panel
- [ ] Playback controls
- [ ] Plugin manager UI
- [ ] Settings panels

### Phase 4: Advanced Plugins (Weeks 7-8)

**Goal:** Add new extensibility

- [ ] Prose Embeddings plugin
- [ ] Intelligent Mapper plugin (ML-based)
- [ ] Additional audio effect plugins (chorus, etc.)
- [ ] Additional visualization plugins
- [ ] Export plugins (MIDI, WAV, JSON)

### Phase 5: Plugin Development Tools (Week 9)

**Goal:** Enable community development

- [ ] Plugin scaffolding CLI
- [ ] Plugin validation tool
- [ ] Plugin documentation generator
- [ ] Plugin starter templates
- [ ] Plugin development guide

### Phase 6: Testing & Polish (Week 10)

**Goal:** Ensure stability

- [ ] Unit tests for core systems
- [ ] Integration tests for plugins
- [ ] E2E tests for user flows
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Documentation

---

## Extensibility Examples

### Example 1: Audio Effect Plugin (Chorus)

```typescript
// src/plugins/audio-effects/chorus/index.ts

import { AudioEffectPlugin, PluginType } from '@/types/plugin';

const chorusPlugin: AudioEffectPlugin = {
    id: 'chorus-effect',
    name: 'Chorus',
    version: '1.0.0',
    type: PluginType.AUDIO_EFFECT,
    author: 'DataSynth Core',
    description: 'Classic chorus effect',
    apiVersion: '1.0.0',
    
    parameters: [
        {
            id: 'rate',
            name: 'Rate',
            min: 0.1,
            max: 10,
            default: 1.5,
            unit: 'Hz'
        },
        {
            id: 'depth',
            name: 'Depth',
            min: 0,
            max: 1,
            default: 0.5
        },
        {
            id: 'mix',
            name: 'Mix',
            min: 0,
            max: 1,
            default: 0.5
        }
    ],
    
    createNode(audioContext) {
        // Create chorus using delay + LFO
        const input = audioContext.createGain();
        const output = audioContext.createGain();
        const delay = audioContext.createDelay(0.05);
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        const wet = audioContext.createGain();
        const dry = audioContext.createGain();
        
        // Set defaults
        delay.delayTime.value = 0.02;
        lfo.frequency.value = 1.5;
        lfoGain.gain.value = 0.005;
        wet.gain.value = 0.5;
        dry.gain.value = 0.5;
        
        // Connect
        lfo.connect(lfoGain);
        lfoGain.connect(delay.delayTime);
        input.connect(delay);
        delay.connect(wet);
        input.connect(dry);
        wet.connect(output);
        dry.connect(output);
        
        lfo.start();
        
        // Expose parameters
        const node = input as AudioEffectNode;
        node.output = output;
        node.parameters = {
            rate: lfo.frequency,
            depth: lfoGain.gain,
            mix: { 
                set: (value: number) => {
                    wet.gain.value = value;
                    dry.gain.value = 1 - value;
                }
            }
        };
        
        return node;
    }
};

export default chorusPlugin;
```

### Example 2: Visualization Plugin (3D Particles)

```typescript
// src/plugins/visualizations/particle-field/index.ts

import { VisualizationPlugin, PluginType } from '@/types/plugin';
import ParticleFieldComponent from './ParticleFieldComponent';

const particleFieldPlugin: VisualizationPlugin = {
    id: 'particle-field-viz',
    name: '3D Particle Field',
    version: '1.0.0',
    type: PluginType.VISUALIZATION,
    author: 'DataSynth Core',
    description: 'Particles in 3D space controlled by data',
    apiVersion: '1.0.0',
    
    Component: ParticleFieldComponent,
    
    onDataUpdate(data) {
        // Update particle positions based on data
        // (ParticleFieldComponent will handle this internally)
    },
    
    onAudioUpdate(analyserData) {
        // React to audio spectrum
    }
};

export default particleFieldPlugin;
```

```tsx
// src/plugins/visualizations/particle-field/ParticleFieldComponent.tsx

'use client';

import { useEffect, useRef } from 'react';
import { useDataStore } from '@/stores/dataStore';
import * as THREE from 'three';

export default function ParticleFieldComponent() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const data = useDataStore(state => state.currentData);
    
    useEffect(() => {
        if (!canvasRef.current || !data) return;
        
        // Initialize Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
        
        // Create particles from data
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(data.length * 3);
        
        data.forEach((item, i) => {
            // Map data fields to 3D coordinates
            positions[i * 3] = item.longitude || 0;
            positions[i * 3 + 1] = item.latitude || 0;
            positions[i * 3 + 2] = item.mag || 0;
        });
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({ color: 0xff0000, size: 2 });
        const particles = new THREE.Points(geometry, material);
        scene.add(particles);
        
        camera.position.z = 50;
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            particles.rotation.y += 0.001;
            renderer.render(scene, camera);
        }
        animate();
        
        return () => {
            renderer.dispose();
        };
    }, [data]);
    
    return (
        <canvas 
            ref={canvasRef} 
            className="w-full h-full"
        />
    );
}
```

### Example 3: Intelligent Mapper Plugin (ML-based)

```typescript
// src/plugins/mappers/ml-mapper/index.ts

import { MapperPlugin, PluginType } from '@/types/plugin';

const mlMapperPlugin: MapperPlugin = {
    id: 'ml-mapper',
    name: 'ML Auto-Mapper',
    version: '1.0.0',
    type: PluginType.MAPPER,
    author: 'DataSynth Community',
    description: 'Uses machine learning to suggest optimal mappings',
    apiVersion: '1.0.0',
    
    strategy: {
        name: 'Machine Learning',
        description: 'Analyzes data patterns and suggests mappings',
        bestFor: ['time-series', 'complex-patterns']
    },
    
    async analyze(data, paths) {
        // Use ML to analyze data characteristics
        const features = this.extractFeatures(data, paths);
        
        // Use simple heuristics (in production, use actual ML model)
        const suggestions: MappingSuggestion[] = [];
        
        // Find most varying path → frequency
        const mostVarying = this.findMostVarying(data, paths);
        if (mostVarying) {
            suggestions.push({
                parameter: 'frequency',
                path: mostVarying,
                confidence: 0.9,
                reason: 'High variance makes it ideal for pitch'
            });
        }
        
        // Find temporal path → noteSpacing
        const temporal = paths.find(p => 
            p.path.includes('time') || p.path.includes('date')
        );
        if (temporal) {
            suggestions.push({
                parameter: 'noteSpacing',
                path: temporal.path,
                confidence: 0.85,
                reason: 'Temporal data controls rhythm'
            });
        }
        
        // Find spatial paths → pan
        const spatial = paths.find(p =>
            p.path.includes('longitude') || p.path.includes('x')
        );
        if (spatial) {
            suggestions.push({
                parameter: 'pan',
                path: spatial.path,
                confidence: 0.8,
                reason: 'Spatial data creates stereo field'
            });
        }
        
        return suggestions;
    },
    
    extractFeatures(data: any[], paths: DataPath[]) {
        // Extract statistical features for each path
        // This would use actual feature extraction in production
        return {};
    },
    
    findMostVarying(data: any[], paths: DataPath[]): string | null {
        let maxVariance = 0;
        let bestPath: string | null = null;
        
        for (const pathObj of paths) {
            const values = data.map(item => this.getValueByPath(item, pathObj.path))
                .filter(v => typeof v === 'number');
            
            if (values.length === 0) continue;
            
            const variance = this.calculateVariance(values);
            if (variance > maxVariance) {
                maxVariance = variance;
                bestPath = pathObj.path;
            }
        }
        
        return bestPath;
    },
    
    calculateVariance(values: number[]): number {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    },
    
    getValueByPath(obj: any, path: string): any {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    }
};

export default mlMapperPlugin;
```

---

## Considerations & Best Practices

### 1. **Security**

**Plugin Sandboxing:**
- Run untrusted plugins in iframes or Web Workers
- Implement Content Security Policy (CSP)
- Validate plugin code with AST parsing
- Limit API access based on plugin permissions

```typescript
// Example: Permission system
interface PluginPermissions {
    audio: boolean;      // Can access audio system
    data: boolean;       // Can access data system
    storage: boolean;    // Can persist settings
    network: boolean;    // Can make network requests
    ui: boolean;         // Can modify UI
}

// Request permissions in plugin manifest
const plugin: Plugin = {
    // ...
    permissions: {
        audio: true,
        data: true,
        storage: true,
        network: false,  // No external requests
        ui: true
    }
};
```

### 2. **Performance**

**Code Splitting:**
- Lazy load plugins with dynamic imports
- Tree-shake unused code
- Bundle plugins separately

```typescript
// Good: Dynamic import
const plugin = await import(`@/plugins/data-sources/${pluginId}`);

// Better: Webpack magic comments
const plugin = await import(
    /* webpackChunkName: "plugin-[request]" */
    /* webpackMode: "lazy" */
    `@/plugins/data-sources/${pluginId}`
);
```

**Web Workers:**
- Offload heavy computation (embeddings, data processing)
- Keep UI thread responsive

### 3. **Error Handling**

**Graceful Degradation:**
```typescript
try {
    await pluginRegistry.register(plugin);
} catch (error) {
    // Log error but don't crash app
    console.error(`Failed to load plugin ${plugin.name}:`, error);
    
    // Show user-friendly notification
    api.ui.showNotification(
        `Plugin "${plugin.name}" failed to load`,
        'error'
    );
    
    // Continue with other plugins
}
```

**Plugin Isolation:**
- Plugin errors shouldn't crash core
- Implement error boundaries for plugin UI

### 4. **Versioning**

**Semantic Versioning:**
```typescript
// Plugin specifies compatible API versions
apiVersion: '^1.0.0'  // Compatible with 1.x.x

// Core checks compatibility
import semver from 'semver';

if (!semver.satisfies(CORE_API_VERSION, plugin.apiVersion)) {
    throw new Error('Incompatible API version');
}
```

**Migration Paths:**
- Maintain backward compatibility in core API
- Provide migration guides for breaking changes
- Deprecate gradually (1.x → 2.x with warnings)

### 5. **Testing**

**Plugin Testing Framework:**
```typescript
// src/core/plugin/__tests__/PluginTestHarness.ts

export class PluginTestHarness {
    private mockAPI: PluginAPI;
    
    constructor() {
        this.mockAPI = this.createMockAPI();
    }
    
    async testPlugin(plugin: Plugin): Promise<TestResult> {
        const results: TestResult = {
            passed: [],
            failed: [],
            warnings: []
        };
        
        // Test initialization
        try {
            await plugin.initialize?.(this.mockAPI);
            results.passed.push('Initialization');
        } catch (error) {
            results.failed.push({ test: 'Initialization', error });
        }
        
        // Test type-specific methods
        if (plugin.type === PluginType.DATA_SOURCE) {
            await this.testDataSource(plugin as DataSourcePlugin, results);
        }
        
        return results;
    }
    
    private createMockAPI(): PluginAPI {
        // Create mock API for testing
        return new PluginAPI(/* ... */);
    }
}
```

### 6. **Documentation**

**Auto-Generate Plugin Docs:**
```typescript
// Extract metadata for documentation
function generatePluginDocs(plugin: Plugin): string {
    return `
# ${plugin.name}

**Version:** ${plugin.version}  
**Author:** ${plugin.author}  
**Type:** ${plugin.type}

${plugin.description}

## Installation

\`\`\`bash
npm install @datasynth/plugin-${plugin.id}
\`\`\`

## Parameters

${plugin.parameters?.map(p => `
- **${p.name}**: ${p.description}
  - Range: ${p.min} - ${p.max}
  - Default: ${p.default}
`).join('\n')}

## Usage

\`\`\`typescript
// Example code
\`\`\`
    `;
}
```

### 7. **Community & Distribution**

**Plugin Registry:**
- Create npm org: `@datasynth/plugin-*`
- Publish to npm registry
- Searchable plugin directory on website

**Plugin Store UI:**
```tsx
// Future: In-app plugin store
<PluginStore>
    <PluginSearch />
    <PluginCategories />
    <PluginList>
        <PluginCard
            name="Spotify Integration"
            author="Community"
            downloads={1250}
            rating={4.5}
            onInstall={() => installPlugin('@datasynth/plugin-spotify')}
        />
    </PluginList>
</PluginStore>
```

---

## Summary

This architecture provides:

✅ **Strong Core**: Stable, well-tested audio/data/playback engines  
✅ **Flexible Plugins**: Easy to extend without modifying core  
✅ **Type Safety**: Full TypeScript throughout  
✅ **Developer Experience**: Hot reloading, scaffolding tools, clear API  
✅ **Performance**: Code splitting, Web Workers, efficient rendering  
✅ **Security**: Sandboxing, permissions, validation  
✅ **Community**: Plugin registry, documentation, examples  

The plugin architecture allows:
- Adding new data sources (APIs, databases, file formats)
- Creating custom audio effects
- Building new visualizations
- Implementing mapping strategies
- Exporting to different formats

All without ever modifying the core codebase!

