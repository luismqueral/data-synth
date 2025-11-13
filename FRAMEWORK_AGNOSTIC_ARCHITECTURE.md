# Framework-Agnostic Plugin Architecture

**How to implement DataSynth's plugin system in any framework**

---

## 🎯 Core Insight

The **plugin architecture is framework-agnostic** because:

1. **Core Engine is Pure TypeScript** - No framework dependencies
2. **Web Audio API is Universal** - Works everywhere
3. **Plugin Interface is Standard** - Just TypeScript interfaces
4. **State Management is Pluggable** - Use framework's native solution

---

## 🔄 What Changes vs What Stays the Same

### ✅ **Framework-Independent (Core)**

These parts are **identical** across all frameworks:

```
✓ Audio Engine (Web Audio API)
✓ Data Processing (JavaScript/TypeScript)
✓ Plugin Registry & Loader
✓ Plugin API Interface
✓ Parameter Mapping Logic
✓ Playback Scheduling
```

### 🔄 **Framework-Specific (UI Layer)**

These parts **adapt** to each framework:

```
○ Component syntax (JSX vs Templates vs Svelte)
○ State management (Zustand vs Pinia vs Svelte stores)
○ Routing (Next.js vs Vue Router vs SvelteKit)
○ Lifecycle hooks (useEffect vs onMounted vs onMount)
○ Reactivity system (React vs Vue vs Svelte)
```

---

## 🏗️ Architecture by Framework

### Universal Core Pattern

```
┌─────────────────────────────────────────────────────┐
│           Framework-Agnostic Core                    │
│  • AudioEngine.ts                                    │
│  • DataEngine.ts                                     │
│  • PluginRegistry.ts                                 │
│  • Pure TypeScript, no framework imports            │
└─────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼────────┐
│ React/Next   │ │  Vue/Nuxt   │ │ Svelte/Kit   │
│ Components   │ │ Components  │ │ Components   │
│ useEffect    │ │ onMounted   │ │ onMount      │
│ Zustand      │ │ Pinia       │ │ Stores       │
└──────────────┘ └─────────────┘ └──────────────┘
```

---

## 1️⃣ React/Next.js (As Documented)

**Strengths:**
- Large ecosystem
- Excellent TypeScript support
- Next.js provides SSR, routing, optimization
- Huge community for plugins

**Implementation:**

```typescript
// Core (framework-independent)
import { AudioEngine } from '@/core/audio/AudioEngine';

// React wrapper
function useAudioEngine() {
    const [engine] = useState(() => new AudioEngine());
    
    useEffect(() => {
        engine.initialize();
        return () => engine.cleanup();
    }, []);
    
    return engine;
}

// Component
export default function Editor() {
    const engine = useAudioEngine();
    return <AudioControls engine={engine} />;
}
```

**State Management:** Zustand, Redux Toolkit, Jotai
**UI Library:** Radix UI, Headless UI, Chakra UI
**Routing:** Next.js App Router, React Router

---

## 2️⃣ Vue 3 + Nuxt 3

**Strengths:**
- Progressive framework (easy learning curve)
- Excellent composition API
- Built-in reactivity
- Great documentation

**Implementation:**

```vue
<!-- Core (framework-independent) - same as React -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { AudioEngine } from '@/core/audio/AudioEngine';

// Vue wrapper
const engine = ref<AudioEngine>();

onMounted(() => {
    engine.value = new AudioEngine();
    engine.value.initialize();
});

onUnmounted(() => {
    engine.value?.cleanup();
});
</script>

<template>
    <AudioControls :engine="engine" />
</template>
```

**State Management:** Pinia (recommended), Vuex
**UI Library:** Naive UI, Radix Vue, PrimeVue
**Routing:** Vue Router, Nuxt 3 file-based routing

### Project Structure (Nuxt 3)

```
app/
├── core/                    # ← Same as Next.js
│   ├── audio/
│   ├── data/
│   └── plugin/
│
├── plugins/                 # ← Same as Next.js
│   ├── data-sources/
│   ├── audio-effects/
│   └── visualizations/
│
├── components/              # Vue SFCs instead of React
│   ├── audio/
│   │   ├── AudioControls.vue
│   │   └── EffectsPanel.vue
│   └── data/
│       └── DataLoader.vue
│
├── composables/             # Instead of hooks/
│   ├── useAudioEngine.ts
│   └── usePlugins.ts
│
├── stores/                  # Pinia instead of Zustand
│   ├── audio.ts
│   └── plugins.ts
│
└── pages/                   # Nuxt file-based routing
    ├── index.vue
    └── editor.vue
```

---

## 3️⃣ Svelte + SvelteKit

**Strengths:**
- Truly reactive (no virtual DOM)
- Smallest bundle sizes
- Svelte stores are elegant
- Compiler optimizations

**Implementation:**

```svelte
<!-- Core (framework-independent) - same as React/Vue -->
<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { AudioEngine } from '$lib/core/audio/AudioEngine';

let engine: AudioEngine;

onMount(() => {
    engine = new AudioEngine();
    engine.initialize();
});

onDestroy(() => {
    engine?.cleanup();
});
</script>

<AudioControls {engine} />
```

**State Management:** Svelte stores (built-in)
**UI Library:** Skeleton UI, Melt UI, Svelte Material UI
**Routing:** SvelteKit file-based routing

### Svelte Store Example

```typescript
// lib/stores/audio.ts
import { writable } from 'svelte/store';
import { AudioEngine } from '$lib/core/audio/AudioEngine';

function createAudioStore() {
    const { subscribe, set, update } = writable<AudioEngine | null>(null);
    
    return {
        subscribe,
        initialize: () => {
            const engine = new AudioEngine();
            engine.initialize();
            set(engine);
        },
        cleanup: () => update(engine => {
            engine?.cleanup();
            return null;
        })
    };
}

export const audioStore = createAudioStore();
```

### Project Structure (SvelteKit)

```
src/
├── lib/
│   ├── core/                # ← Same as Next.js
│   │   ├── audio/
│   │   ├── data/
│   │   └── plugin/
│   │
│   ├── plugins/             # ← Same as Next.js
│   │
│   ├── components/          # Svelte components
│   │   ├── audio/
│   │   │   ├── AudioControls.svelte
│   │   │   └── EffectsPanel.svelte
│   │   └── data/
│   │
│   └── stores/              # Svelte stores
│       ├── audio.ts
│       └── plugins.ts
│
└── routes/                  # SvelteKit routing
    ├── +page.svelte
    └── editor/
        └── +page.svelte
```

---

## 4️⃣ Angular

**Strengths:**
- Enterprise-ready
- Built-in everything (DI, routing, forms)
- RxJS for reactive programming
- Strong TypeScript support

**Implementation:**

```typescript
// Core (framework-independent) - same AudioEngine

// Angular service
@Injectable({ providedIn: 'root' })
export class AudioEngineService {
    private engine: AudioEngine;
    
    constructor() {
        this.engine = new AudioEngine();
    }
    
    ngOnInit() {
        this.engine.initialize();
    }
    
    ngOnDestroy() {
        this.engine.cleanup();
    }
    
    getEngine(): AudioEngine {
        return this.engine;
    }
}

// Component
@Component({
    selector: 'app-editor',
    template: `<app-audio-controls [engine]="engine"></app-audio-controls>`
})
export class EditorComponent {
    engine: AudioEngine;
    
    constructor(private audioService: AudioEngineService) {
        this.engine = audioService.getEngine();
    }
}
```

**State Management:** NgRx, Akita, Elf
**UI Library:** Angular Material, PrimeNG, Clarity
**Routing:** Angular Router (built-in)

### Project Structure (Angular)

```
src/
├── core/                    # ← Same as Next.js
│   ├── audio/
│   ├── data/
│   └── plugin/
│
├── plugins/                 # ← Same as Next.js
│
├── app/
│   ├── services/            # Instead of hooks
│   │   ├── audio-engine.service.ts
│   │   └── plugin.service.ts
│   │
│   ├── components/          # Angular components
│   │   ├── audio/
│   │   └── data/
│   │
│   └── state/               # NgRx store
│       ├── audio/
│       └── plugins/
│
└── environments/
```

---

## 5️⃣ Solid.js

**Strengths:**
- React-like syntax but truly reactive
- No virtual DOM
- Fine-grained reactivity
- Excellent performance

**Implementation:**

```tsx
// Core (framework-independent) - same AudioEngine

// Solid wrapper
function useAudioEngine() {
    const [engine] = createSignal(new AudioEngine());
    
    onMount(() => {
        engine().initialize();
    });
    
    onCleanup(() => {
        engine().cleanup();
    });
    
    return engine;
}

// Component
export default function Editor() {
    const engine = useAudioEngine();
    return <AudioControls engine={engine()} />;
}
```

**State Management:** Solid stores (built-in)
**UI Library:** Kobalte, HOPE UI
**Routing:** Solid Router, SolidStart

---

## 6️⃣ Vanilla JavaScript / TypeScript

**Strengths:**
- No framework overhead
- Maximum control
- Smallest possible bundle
- Educational value

**Implementation:**

```typescript
// Core (framework-independent) - same AudioEngine

// Vanilla wrapper
class DataSynthApp {
    private engine: AudioEngine;
    private container: HTMLElement;
    
    constructor(containerId: string) {
        this.container = document.getElementById(containerId)!;
        this.engine = new AudioEngine();
        this.init();
    }
    
    private async init() {
        await this.engine.initialize();
        this.render();
        this.attachEventListeners();
    }
    
    private render() {
        this.container.innerHTML = `
            <div class="audio-controls">
                <button id="playBtn">Play</button>
                <!-- ... -->
            </div>
        `;
    }
    
    private attachEventListeners() {
        document.getElementById('playBtn')?.addEventListener('click', () => {
            this.engine.play();
        });
    }
}

// Usage
const app = new DataSynthApp('app-root');
```

**State Management:** Custom event emitter, MobX, Signals
**UI Library:** Shoelace, Web Components
**Routing:** Vanilla router, History API

---

## 7️⃣ Desktop App (Electron/Tauri)

**Use Case:** Native desktop app with file system access

**Electron (Chromium-based):**

```typescript
// main.ts (Node.js process)
import { app, BrowserWindow } from 'electron';

// renderer.ts (Web process)
import { AudioEngine } from './core/audio/AudioEngine';

// Use with any web framework (React, Vue, etc.)
// Plus Node.js APIs for file system, etc.
```

**Tauri (Rust-based, smaller):**

```rust
// src-tauri/src/main.rs
#[tauri::command]
fn load_audio_file(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(path).map_err(|e| e.to_string())
}

// Frontend (any framework)
import { invoke } from '@tauri-apps/api/tauri';
const audioData = await invoke('load_audio_file', { path: '/path/to/file' });
```

**Benefits:**
- File system access
- Better performance
- Offline-first
- Native features

---

## 8️⃣ Mobile (React Native / Capacitor / Flutter)

### React Native

```typescript
// Core audio needs platform-specific implementation
import { NativeModules } from 'react-native';

class AudioEngineNative extends AudioEngine {
    protected createAudioContext() {
        // Use react-native-audio-toolkit or expo-audio
        return NativeModules.AudioEngine.createContext();
    }
}
```

### Capacitor (Web → Native)

```typescript
// Same core code, runs in web view
// Use Capacitor plugins for native features
import { Filesystem } from '@capacitor/filesystem';

const data = await Filesystem.readFile({ path: 'data.json' });
```

### Flutter (Dart)

```dart
// Would need to rewrite core in Dart
// Or use platform channels to JavaScript core
class AudioEngine {
  Future<void> initialize() async {
    // Dart implementation
  }
}
```

---

## 🔌 Plugin System Across Frameworks

### Core Plugin Interface (Universal)

This is **identical** for all frameworks:

```typescript
// types/plugin.ts (framework-agnostic)
export interface Plugin {
    id: string;
    name: string;
    version: string;
    type: PluginType;
    apiVersion: string;
    
    initialize?(api: PluginAPI): Promise<void>;
    activate?(): Promise<void>;
    deactivate?(): Promise<void>;
}

export class PluginRegistry {
    // Implementation is framework-agnostic
    register(plugin: Plugin): void { /* ... */ }
    activate(id: string): void { /* ... */ }
}
```

### Framework-Specific UI Components

Only the **UI rendering** differs:

**React:**
```tsx
interface PluginCardProps {
    plugin: Plugin;
    onActivate: () => void;
}

export function PluginCard({ plugin, onActivate }: PluginCardProps) {
    return (
        <div className="plugin-card">
            <h3>{plugin.name}</h3>
            <button onClick={onActivate}>Activate</button>
        </div>
    );
}
```

**Vue:**
```vue
<script setup lang="ts">
interface Props {
    plugin: Plugin;
}
const props = defineProps<Props>();
const emit = defineEmits<{ activate: [] }>();
</script>

<template>
    <div class="plugin-card">
        <h3>{{ plugin.name }}</h3>
        <button @click="emit('activate')">Activate</button>
    </div>
</template>
```

**Svelte:**
```svelte
<script lang="ts">
export let plugin: Plugin;
export let onActivate: () => void;
</script>

<div class="plugin-card">
    <h3>{plugin.name}</h3>
    <button on:click={onActivate}>Activate</button>
</div>
```

**Angular:**
```typescript
@Component({
    selector: 'app-plugin-card',
    template: `
        <div class="plugin-card">
            <h3>{{ plugin.name }}</h3>
            <button (click)="activate.emit()">Activate</button>
        </div>
    `
})
export class PluginCardComponent {
    @Input() plugin!: Plugin;
    @Output() activate = new EventEmitter<void>();
}
```

---

## 📊 Framework Comparison for DataSynth

| Framework | Bundle Size | Performance | DX | Plugin Support | Best For |
|-----------|-------------|-------------|-----|---------------|----------|
| **React/Next** | Medium | Good | Excellent | ⭐⭐⭐⭐⭐ | Large ecosystem, SSR |
| **Vue/Nuxt** | Small | Excellent | Excellent | ⭐⭐⭐⭐⭐ | Gentle learning curve |
| **Svelte/Kit** | Smallest | Best | Excellent | ⭐⭐⭐⭐ | Performance critical |
| **Angular** | Largest | Good | Good | ⭐⭐⭐⭐ | Enterprise apps |
| **Solid** | Small | Best | Good | ⭐⭐⭐ | React-like + performance |
| **Vanilla** | Tiny | Excellent | Medium | ⭐⭐⭐⭐⭐ | Full control |
| **Electron** | Large | Medium | Good | ⭐⭐⭐⭐⭐ | Desktop features |
| **Tauri** | Small | Excellent | Good | ⭐⭐⭐⭐ | Desktop (Rust) |

---

## 🎯 Recommendation Matrix

### Choose React/Next.js if:
- ✅ Want largest ecosystem
- ✅ Need SSR/SSG
- ✅ Team knows React
- ✅ Want most plugin examples
- ✅ Need enterprise backing (Vercel)

### Choose Vue/Nuxt if:
- ✅ Want gentler learning curve
- ✅ Prefer template syntax
- ✅ Need excellent docs
- ✅ Want smaller bundle than React
- ✅ Team familiar with Vue

### Choose Svelte/SvelteKit if:
- ✅ Want smallest bundle
- ✅ Need best performance
- ✅ Like reactive paradigm
- ✅ Willing to learn new syntax
- ✅ Building performance-critical app

### Choose Vanilla/Web Components if:
- ✅ Want zero framework lock-in
- ✅ Need maximum portability
- ✅ Building library/SDK
- ✅ Want educational project
- ✅ Prefer full control

### Choose Electron/Tauri if:
- ✅ Need desktop app
- ✅ Require file system access
- ✅ Want offline-first
- ✅ Need native performance
- ✅ Building pro audio tool

---

## 🔄 Migration Strategy Across Frameworks

### Phase 1: Extract Core (Week 1)

**Goal:** Make core framework-agnostic

```typescript
// Before (coupled to React)
function useAudioEngine() {
    const [context, setContext] = useState<AudioContext>();
    useEffect(() => {
        setContext(new AudioContext());
    }, []);
    return context;
}

// After (framework-agnostic)
export class AudioEngine {
    private context: AudioContext | null = null;
    
    initialize(): void {
        this.context = new AudioContext();
    }
    
    getContext(): AudioContext {
        if (!this.context) this.initialize();
        return this.context!;
    }
}
```

### Phase 2: Create Adapters (Week 2)

Create thin wrappers for each framework:

```typescript
// adapters/react.ts
export function useAudioEngine() {
    const [engine] = useState(() => new AudioEngine());
    useEffect(() => {
        engine.initialize();
        return () => engine.cleanup();
    }, []);
    return engine;
}

// adapters/vue.ts
export function useAudioEngine() {
    const engine = ref<AudioEngine>();
    onMounted(() => {
        engine.value = new AudioEngine();
        engine.value.initialize();
    });
    return engine;
}

// adapters/svelte.ts
export function createAudioEngine() {
    const engine = new AudioEngine();
    onMount(() => engine.initialize());
    onDestroy(() => engine.cleanup());
    return engine;
}
```

### Phase 3: Test Across Frameworks (Week 3)

Build simple demo in each framework using **same core**.

---

## 💡 Universal Patterns

These patterns work in **any** framework:

### 1. **Dependency Injection**

```typescript
// Framework-agnostic
interface Dependencies {
    audioEngine: AudioEngine;
    dataEngine: DataEngine;
    pluginRegistry: PluginRegistry;
}

class App {
    constructor(private deps: Dependencies) {}
}

// React
const DepsContext = createContext<Dependencies | null>(null);

// Vue
const DepsKey: InjectionKey<Dependencies> = Symbol('deps');
provide(DepsKey, deps);

// Angular
@Injectable()
export class DependenciesService { /* ... */ }
```

### 2. **Event Bus**

```typescript
// Framework-agnostic
class EventBus {
    private listeners = new Map<string, Set<Function>>();
    
    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }
    
    emit(event: string, data: any) {
        this.listeners.get(event)?.forEach(cb => cb(data));
    }
}

// Works with any framework
const bus = new EventBus();
bus.on('plugin:activated', (plugin) => console.log(plugin));
bus.emit('plugin:activated', myPlugin);
```

### 3. **Observable Pattern**

```typescript
// Framework-agnostic
class Observable<T> {
    private subscribers = new Set<(value: T) => void>();
    
    constructor(private value: T) {}
    
    subscribe(callback: (value: T) => void) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
    
    set(newValue: T) {
        this.value = newValue;
        this.subscribers.forEach(cb => cb(newValue));
    }
    
    get(): T {
        return this.value;
    }
}

// Use in any framework
const audioState = new Observable({ isPlaying: false });
audioState.subscribe(state => console.log(state));
audioState.set({ isPlaying: true });
```

---

## 🎨 Web Components (Ultimate Portability)

Build as **Web Components** to work in ANY framework:

```typescript
// datasynth-editor.ts (works everywhere!)
class DataSynthEditor extends HTMLElement {
    private engine: AudioEngine;
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.engine = new AudioEngine();
    }
    
    connectedCallback() {
        this.engine.initialize();
        this.render();
    }
    
    disconnectedCallback() {
        this.engine.cleanup();
    }
    
    render() {
        this.shadowRoot!.innerHTML = `
            <style>/* ... */</style>
            <div class="editor">
                <button id="play">Play</button>
            </div>
        `;
    }
}

customElements.define('datasynth-editor', DataSynthEditor);
```

**Use in React:**
```tsx
<datasynth-editor></datasynth-editor>
```

**Use in Vue:**
```vue
<datasynth-editor></datasynth-editor>
```

**Use in HTML:**
```html
<datasynth-editor></datasynth-editor>
```

**Use in Angular:**
```typescript
// Add CUSTOM_ELEMENTS_SCHEMA
<datasynth-editor></datasynth-editor>
```

---

## 🌐 Server-Side Rendering Considerations

### Next.js (React)
```typescript
// app/page.tsx
export default function Page() {
    // Audio code must be client-only
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    if (!isMounted) return <div>Loading...</div>;
    
    return <AudioEngine />;
}
```

### Nuxt (Vue)
```vue
<script setup>
// Audio code client-only
const audioEngine = ref(null);
onMounted(() => {
    audioEngine.value = new AudioEngine();
});
</script>
```

### SvelteKit
```svelte
<script>
import { browser } from '$app/environment';

let engine;
if (browser) {
    engine = new AudioEngine();
}
</script>
```

---

## 🚀 Real-World Examples

### 1. **VSCode Extensions** (TypeScript + Web)
```typescript
// Same plugin architecture as DataSynth
// Core logic in TypeScript
// UI adapts to VSCode API
```

### 2. **Figma Plugins** (TypeScript + Canvas)
```typescript
// Similar pattern:
// - Core logic is framework-agnostic
// - UI uses Figma's API
// - Plugins extend core functionality
```

### 3. **Obsidian Plugins** (TypeScript)
```typescript
// Plugin architecture similar to our design:
export default class MyPlugin extends Plugin {
    async onload() {
        // Initialize
    }
}
```

---

## 📋 Summary

### ✅ Core Principle

```
Keep core framework-agnostic → Adapter pattern → Framework-specific UI
```

### ✅ What's Universal

- Audio processing (Web Audio API)
- Data processing (JavaScript/TypeScript)
- Plugin system architecture
- Business logic
- Algorithms

### ✅ What's Framework-Specific

- Component syntax
- State management
- Lifecycle hooks
- Routing
- Build system

### ✅ Best Approach

1. **Build core in pure TypeScript** (no framework imports)
2. **Create thin adapters** for each framework
3. **Test core independently** (unit tests)
4. **UI is just a view layer** over core

---

## 🎯 Recommended Path

For **maximum portability**:

1. **Phase 1:** Build core as framework-agnostic library
2. **Phase 2:** Create React/Next.js UI (largest ecosystem)
3. **Phase 3:** Add Vue adapter (gentle learning curve)
4. **Phase 4:** Add Svelte adapter (performance)
5. **Phase 5:** Web Components version (universal)

This way you have:
- ✅ Core that works anywhere
- ✅ React version for immediate use
- ✅ Other frameworks as needed
- ✅ Ultimate portability

---

**The plugin architecture transcends frameworks! 🚀**

The key insight: **Separate core logic from UI framework**. Then you can:
- Switch frameworks easily
- Support multiple frameworks simultaneously
- Build desktop, mobile, web from same core
- Future-proof your architecture

**Your audio engine, data processing, and plugin system will work identically across all frameworks.**

