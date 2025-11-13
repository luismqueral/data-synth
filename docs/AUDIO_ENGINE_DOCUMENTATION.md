# DataSynth Audio Engine Documentation

**Complete technical reference for the vanilla JavaScript modular architecture**

This document explains how DataSynth processes data into sound using Web Audio API, ES6 modules, and D3.js visualization.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Module Structure](#module-structure)
3. [AudioEngine Module](#audioengine-module)
4. [DataProcessor Module](#dataprocessor-module)
5. [ParameterMapper Module](#parametermapper-module)
6. [PatchViz Module](#patchviz-module)
7. [Main Application Coordination](#main-application-coordination)
8. [Signal Flow](#signal-flow)
9. [Web Audio API Patterns](#web-audio-api-patterns)
10. [Parameter Mapping Deep Dive](#parameter-mapping-deep-dive)
11. [Visualization System](#visualization-system)
12. [Playback Control](#playback-control)

---

## Architecture Overview

DataSynth uses a **modular vanilla JavaScript architecture** with zero build tools and no frameworks.

### Design Philosophy

- **ES6 Modules**: Native browser imports/exports, no bundler
- **Pure Functions**: Data processing with no side effects
- **Class-Based Audio**: AudioEngine manages stateful Web Audio API
- **D3.js Visualization**: Patch cable interface for mapping data to audio
- **Static Deployment**: Works offline, no server required

### File Structure

```
datasynth/
├── index.html              # Entry point with UI
├── main.js                 # Coordinates all modules
├── lib/
│   ├── audio-engine.js     # Web Audio API management
│   ├── data-processor.js   # Data parsing and path extraction
│   ├── parameter-mapper.js # Data-to-audio mapping logic
│   └── patch-viz.js        # D3.js node graph visualization
└── test/                   # Unit tests for each module
```

### Dependency Flow

```
┌─────────────────────────────────────────────────────┐
│                    index.html                        │
│          (UI structure, styling, controls)           │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                     main.js                          │
│        (Coordinates modules, handles events)         │
└──┬────────┬──────────┬───────────┬──────────────────┘
   │        │          │           │
   ▼        ▼          ▼           ▼
┌──────┐ ┌─────┐ ┌──────────┐ ┌─────────┐
│data- │ │audio│ │parameter │ │patch-   │
│proc  │ │eng  │ │mapper    │ │viz      │
│.js   │ │.js  │ │.js       │ │.js      │
└──────┘ └─────┘ └──────────┘ └─────────┘
   │        │          │           │
   │        │          │           └──→ D3.js (CDN)
   │        └──────────┴──→ Web Audio API
   └──→ Pure functions (no dependencies)
```

---

## Module Structure

### Overview of Each Module

| Module | Type | Purpose | Dependencies |
|--------|------|---------|--------------|
| `data-processor.js` | Pure functions | Parse data, extract paths | None |
| `parameter-mapper.js` | Class | Map data to audio params | data-processor.js |
| `audio-engine.js` | Class | Web Audio API management | None |
| `patch-viz.js` | Class | D3.js visualization | data-processor.js, D3.js |
| `main.js` | Coordinator | Wire modules, handle events | All modules |

### Module Communication

```
Data Flow:
1. User loads JSON/CSV → data-processor extracts paths
2. parameter-mapper analyzes paths → creates mappings
3. main.js loops through data items
4. For each item:
   - parameter-mapper calculates audio params
   - audio-engine plays note with params
   - patch-viz updates visual feedback
```

---

## AudioEngine Module

**File:** `lib/audio-engine.js` (~586 lines)

### Purpose

Manages all Web Audio API operations: context initialization, synthesis, effects chain, sample playback, and waveform visualization.

### Class Structure

```javascript
export class AudioEngine {
    constructor()
    initEffects()
    createCustomOscillator(frequency, type, duration)
    createNoiseBuffer(type, duration)
    createReverbImpulse(duration, decay)
    loadSample(audioFile)
    clearSample()
    setupVisualizer(canvas)
    drawVisualizer(isPlaying)
    stopVisualizer()
    cleanup()
}
```

### State Management

The AudioEngine stores:

```javascript
// Audio context (persistent)
this.audioContext = null;

// Global effects nodes (shared across all notes)
this.delayNode = null;
this.delayFeedbackGain = null;
this.delayWetGain = null;
this.delayDryGain = null;
this.reverbNode = null;
this.reverbWetGain = null;
this.reverbDryGain = null;

// Delay pitch shifting state
this.previousDelayTime = null;

// Sampler state
this.samplerMode = false;
this.sampleBuffer = null;
this.sampleFileName = '';
this.sampleDuration = 0;

// Visualizer state
this.analyser = null;
this.dataArray = null;
this.animationId = null;
this.visualizerCanvas = null;
this.visualizerCtx = null;
```

### Key Methods

#### `initEffects()`

Initializes Web Audio context and effects chain:

```javascript
initEffects() {
    // Create context (Safari compatibility)
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Resume if suspended (mobile Safari)
    if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
    }
    
    // Setup delay with feedback loop
    this.delayNode = this.audioContext.createDelay(2.0);
    this.delayFeedbackGain = this.audioContext.createGain();
    this.delayWetGain = this.audioContext.createGain();
    this.delayDryGain = this.audioContext.createGain();
    
    delayNode.connect(delayFeedbackGain);
    delayFeedbackGain.connect(delayNode); // Feedback loop
    delayNode.connect(delayWetGain);
    
    // Setup reverb (convolution)
    this.reverbNode = this.audioContext.createConvolver();
    this.reverbNode.buffer = this.createReverbImpulse(2, 2);
    this.reverbWetGain = this.audioContext.createGain();
    this.reverbDryGain = this.audioContext.createGain();
    
    reverbNode.connect(reverbWetGain);
    
    // Connect effects chain
    reverbWetGain.connect(delayNode);
    reverbWetGain.connect(delayDryGain);
    reverbDryGain.connect(delayNode);
    reverbDryGain.connect(audioContext.destination);
    delayWetGain.connect(audioContext.destination);
}
```

**Signal Flow:**
```
Input → Reverb (wet/dry split) → Delay (wet/dry split) → Destination
```

#### `createCustomOscillator(frequency, type, duration)`

Creates audio sources for synthesizer mode:

**Supported types:**
- Standard: `sine`, `square`, `sawtooth`, `triangle`
- Noise: `white-noise`, `pink-noise`, `brown-noise`
- Synthesis: `fm`, `additive`, `pwm`

**FM Synthesis Example:**
```javascript
if (type === 'fm') {
    const carrier = audioContext.createOscillator();
    const modulator = audioContext.createOscillator();
    const modulatorGain = audioContext.createGain();
    
    carrier.frequency.value = frequency;
    modulator.frequency.value = frequency * 2.5; // Harmonic ratio
    modulatorGain.gain.value = frequency * 0.8;  // Modulation depth
    
    modulator.connect(modulatorGain);
    modulatorGain.connect(carrier.frequency); // Modulate carrier
    
    carrier._modulator = modulator; // Store for start/stop
    return carrier;
}
```

#### `createReverbImpulse(duration, decay)`

Generates synthetic reverb impulse response:

```javascript
createReverbImpulse(duration, decay) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            // White noise with exponential decay
            const noise = Math.random() * 2 - 1;
            const envelope = Math.pow(1 - i / length, decay);
            channelData[i] = noise * envelope;
        }
    }
    
    return impulse;
}
```

**Parameters:**
- `duration` (0.1-10s): Room size
- `decay` (1-10): Reflection density (higher = longer tail)

#### `loadSample(audioFile)`

Decodes audio file for sampler mode:

```javascript
async loadSample(audioFile) {
    if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const arrayBuffer = await audioFile.arrayBuffer();
    this.sampleBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.sampleFileName = audioFile.name;
    this.sampleDuration = this.sampleBuffer.duration;
    
    return {
        fileName: this.sampleFileName,
        duration: this.sampleDuration,
        channels: this.sampleBuffer.numberOfChannels,
        sampleRate: this.sampleBuffer.sampleRate
    };
}
```

**Format support:** WAV, MP3, OGG, WebM (M4A varies by browser)

#### `setupVisualizer(canvas)` & `drawVisualizer(isPlaying)`

Real-time waveform visualization:

```javascript
setupVisualizer(canvas) {
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256; // Low latency
    this.analyser.smoothingTimeConstant = 0; // Instant response
    
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    // Connect to effects output
    this.reverbWetGain.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    
    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    this.visualizerCtx.scale(dpr, dpr);
}

drawVisualizer(isPlaying) {
    if (!isPlaying) return null;
    
    this.animationId = requestAnimationFrame(() => this.drawVisualizer(isPlaying));
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Draw frequency spectrum as line graph
    // (see full implementation in audio-engine.js)
}
```

**Performance:**
- FFT size: 256 (low latency)
- No smoothing (instant response)
- Shows first 60% of spectrum (musical content)
- 2x amplification for visibility

---

## DataProcessor Module

**File:** `lib/data-processor.js` (~290 lines)

### Purpose

Pure functions for parsing data and extracting numeric paths. No side effects, easy to test.

### Exported Functions

```javascript
export function getValueByPath(obj, path)
export function safeId(path)
export function extractPaths(obj, prefix = '', depth = 0)
export function extractValues(data, path)
export function analyzeDataVariance(values)
```

### Key Functions

#### `getValueByPath(obj, path)`

Navigates nested objects using dot notation:

```javascript
getValueByPath({properties: {mag: 4.5}}, 'properties.mag') // → 4.5
getValueByPath({user: {name: "Luis"}}, 'user.age')         // → undefined
```

**Implementation:**
```javascript
export function getValueByPath(obj, path) {
    if (!obj || !path) return undefined;
    
    try {
        return path.split('.').reduce((curr, key) => {
            if (curr === null || curr === undefined) return undefined;
            return curr[key];
        }, obj);
    } catch (e) {
        console.warn(`Error accessing path ${path}:`, e);
        return undefined;
    }
}
```

#### `extractPaths(obj, prefix = '', depth = 0)`

Recursively discovers all numeric fields:

```javascript
const data = [
  { properties: { mag: 4.5, depth: 10 } },
  { properties: { mag: 3.2, depth: 15 } }
];

extractPaths(data);
// Returns:
// [
//   { path: 'properties.mag', type: 'number', coverage: 1.0, sample: 4.5 },
//   { path: 'properties.depth', type: 'number', coverage: 1.0, sample: 10 }
// ]
```

**Coverage calculation:**
- Samples up to 20 items from arrays
- Calculates % of items that have each field
- Filters out fields with <10% coverage (sparse data)

**Why coverage matters:**
If "temperature" only exists in 1 out of 100 items, it's not useful for sonification. We need fields that appear consistently.

#### `analyzeDataVariance(values)`

Suggests optimal mapping curve based on data distribution:

```javascript
analyzeDataVariance([1, 2, 3, 4, 5])
// → { curve: 'linear', coefficient: 0.8 }

analyzeDataVariance([0.01, 0.1, 1, 10, 100])
// → { curve: 'logarithmic', coefficient: 19.8 }

analyzeDataVariance([99.1, 99.2, 99.3])
// → { curve: 'cubic', coefficient: 0.002 }
```

**Algorithm:**
```javascript
const coefficientOfVariation = range / Math.abs(mean);

if (coefficientOfVariation < 0.01) {
    return 'cubic';        // Amplify tiny differences
} else if (coefficientOfVariation < 0.1) {
    return 'exponential';  // Make differences more audible
} else if (coefficientOfVariation > 5) {
    return 'logarithmic';  // Compress extreme values
} else {
    return 'linear';       // Default for most data
}
```

---

## ParameterMapper Module

**File:** `lib/parameter-mapper.js` (~461 lines)

### Purpose

Manages mappings between data fields and audio parameters. Analyzes data to create intelligent default mappings.

### Class Structure

```javascript
export class ParameterMapper {
    constructor()
    getAudioParams()
    intelligentMapping(parsedData, numericPaths)
    randomizeMappings(numericPaths)
    randomizeRanges()
    randomizeAll(numericPaths)
    initializeMappings()
}
```

### State Management

```javascript
this.mappings = {
    frequency: {
        path: 'properties.mag',  // Data field to map from
        fixed: 440,              // Default value if no mapping
        min: 200,                // Audio parameter minimum
        max: 2000,               // Audio parameter maximum
        curve: 'exponential'     // Scaling curve
    },
    // ... other parameters
}

this.samplerMode = false; // Affects available parameters
```

### Mode-Specific Parameters

**Synthesizer Mode:**
- `frequency` (200-2000 Hz) - Base pitch
- `duration` (50-2000 ms) - Note length
- `noteSpacing` (50-2000 ms) - Rhythm
- `pan` (-1 to 1) - Stereo position
- `filterFreq` (200-8000 Hz) - Filter cutoff
- `filterQ` (0.1-20) - Filter resonance
- `delayTime` (50-1000 ms) - Echo time
- `delayFeedback` (0.1-0.85) - Echo repeats
- `delayMix` (0.1-0.9) - Echo wet/dry
- `reverbDecay` (0.1-10 s) - Reverb length
- `reverbMix` (0-1) - Reverb wet/dry
- `attack` (1-1000 ms) - Envelope attack
- `release` (1-2000 ms) - Envelope release

**Sampler Mode:**
- `pitch` (0.25-4) - Playback rate (replaces frequency)
- `sampleOffset` (0-1) - Start position in sample
- All other parameters same as synthesizer

### Intelligent Mapping Algorithm

The `intelligentMapping()` method analyzes data and assigns fields to parameters based on "interestingness":

**Step 1: Calculate Interest Score**

```javascript
// For each numeric path:
const min = Math.min(...values);
const max = Math.max(...values);
const range = max - min;
const mean = values.reduce((a, b) => a + b) / values.length;
const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
const stdDev = Math.sqrt(variance);
const coefficientOfVariation = Math.abs(mean) > 0 ? stdDev / Math.abs(mean) : 0;

const uniqueValues = new Set(values).size;
const uniqueRatio = uniqueValues / values.length;

// Interest = variance × uniqueness × log(range)
const interestScore = coefficientOfVariation * uniqueRatio * Math.log10(range + 1);
```

**What makes data "interesting"?**
- High variance (values change a lot)
- High uniqueness (many distinct values)
- Wide range (spans large numbers)

**Step 2: Sort by Interest**

Most interesting fields are prioritized for perceptually important parameters.

**Step 3: Parameter Tiers**

```javascript
const parameterTiers = {
    critical: ['noteSpacing', 'frequency', 'duration'],  // Rhythm & pitch
    important: ['pan', 'filterFreq', 'delayTime', ...],   // Spatial & timbral
    subtle: ['filterQ', 'reverbDecay', 'reverbMix']      // Fine details
};
```

**Step 4: Map Most Interesting → Most Important**

```javascript
// Map top 3 most interesting fields to critical parameters
parameterTiers.critical.forEach((param, i) => {
    if (pathAnalysis[i]) {
        this.mappings[param].path = pathAnalysis[i].path;
        this.mappings[param].curve = suggestedCurve;
    }
});
```

**Step 5: Auto-Select Curves**

Based on coefficient of variation:
- CV < 0.01: `cubic` (amplify tiny differences)
- CV < 0.1: `exponential` (make differences more obvious)
- CV > 5: `logarithmic` (compress extremes)
- Otherwise: `linear`

**Special handling for `noteSpacing` (rhythm):**
- Favors exponential curves (more dramatic)
- Sets wide range (80-1200ms) for rhythmic variation

---

## PatchViz Module

**File:** `lib/patch-viz.js` (~603 lines)

### Purpose

D3.js-based node graph visualization showing data-to-audio parameter mappings.

### Class Structure

```javascript
export class PatchViz {
    constructor(svgElementId)
    render(numericPaths, mappings, parameterMapper, isPlaying)
    updateNodeValues(currentItem, audioParams, mappings, isPlaying)
    clearNodeValues()
    updateConnections(mappings)
    resetDebugFlags()
}
```

### Visual Design

```
┌─────────────────────────────────────────────────┐
│                  Patch View                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  Data Fields          Audio Parameters          │
│                                                  │
│  ● properties.mag ═══════════╗                  │
│                               ║                  │
│  ● properties.depth           ╠═══════ ● frequency
│                               ║                  │
│  ● geometry.lat               ╚═══════ ● pan     │
│                                                  │
│  ● geometry.lon ═══════════════════════ ● filterFreq
│                                                  │
│  (unmapped fields shown dimmed)                 │
│                                                  │
└─────────────────────────────────────────────────┘

Legend:
● = Node (data field or audio parameter)
═ = Connection (yellow/black dashed "patch cable")
```

### Node Types

**Data Nodes (Left Side):**
- Wider (150-200px) to fit long field names
- Display current value during playback
- Dimmed if unmapped

**Audio Nodes (Right Side):**
- Narrower (110-140px)
- Progress bar shows parameter value
- Display current calculated value

### Key Methods

#### `render(numericPaths, mappings, parameterMapper, isPlaying)`

Full visualization redraw:

```javascript
render(numericPaths, mappings, parameterMapper, isPlaying) {
    // Clear everything
    this.svg.selectAll('*').remove();
    
    // Create nodes
    this._createNodes(numericPaths, parameterMapper, width);
    
    // Calculate dynamic height
    const maxNodes = Math.max(dataNodeCount, audioNodeCount);
    const dynamicHeight = 50 + (maxNodes * 45) + 50;
    this.svg.attr('height', dynamicHeight);
    
    // Draw connections (behind nodes)
    this._drawConnections(connectionGroup, mappings, width);
    
    // Draw nodes (with hover interactivity)
    this._drawNodes(nodeGroup, width, mappings, isPlaying);
}
```

**D3 Pattern:**
```javascript
// D3's data binding pattern
const nodeGroups = container.selectAll('.node')
    .data(this.nodes)           // Bind data
    .enter()                     // Enter selection (new elements)
    .append('g')                 // Create groups
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x},${d.y})`);
```

#### `updateNodeValues(currentItem, audioParams, mappings, isPlaying)`

Live value updates during playback:

```javascript
updateNodeValues(currentItem, audioParams, mappings, isPlaying) {
    // Update data node values (left side)
    this.nodes.forEach(node => {
        if (node.type === 'data') {
            const value = getValueByPath(currentItem, node.dataPath);
            const valueEl = document.getElementById(`value_${node.id}`);
            valueEl.textContent = formatValue(value);
            
            // Highlight if mapped
            if (isMapped(node, mappings)) {
                d3.select(`[data-node-id="${node.id}"]`).classed('playing', true);
            }
        }
    });
    
    // Update audio param values and progress bars (right side)
    Object.entries(audioParams).forEach(([param, value]) => {
        updateProgressBar(param, value, mappings);
        highlightIfMapped(param, mappings);
    });
}
```

**Progress bars:**
```javascript
// Calculate fill width based on normalized value
const normalized = (value - min) / (max - min);
const fillWidth = normalized * barMaxWidth;
barEl.attr('width', fillWidth);
```

### Hover Interactions

```javascript
nodeGroup.on('mouseenter', function(d) {
    // Highlight this node
    d3.select(this).classed('hover-highlight', true);
    
    // Find connected nodes
    const connectedNodeIds = findConnectedNodes(d, mappings);
    
    // Dim non-connected nodes
    d3.selectAll('.node').each(function(otherNode) {
        if (otherNode.id !== d.id && !connectedNodeIds.includes(otherNode.id)) {
            d3.select(this).classed('hover-dimmed', true);
        }
    });
    
    // Highlight related connections
    d3.selectAll('[data-target]').each(function() {
        if (isRelatedConnection(this, d)) {
            d3.select(this).classed('hover-active', true);
        }
    });
});
```

### Connection Lines

**Yellow/black dashed "patch cable" aesthetic:**

```javascript
// Draw yellow background path
container.append('path')
    .attr('class', 'connection-path-yellow')
    .attr('d', pathData)
    .attr('data-target', audioParam);

// Draw black foreground path (offset dasharray creates alternating effect)
container.append('path')
    .attr('class', 'connection-path')
    .attr('d', pathData)
    .attr('data-target', audioParam);
```

**CSS (required in index.html):**
```css
.connection-path-yellow {
    stroke: #FFD700;        /* Yellow */
    stroke-width: 3;
    stroke-dasharray: 8, 8;
}

.connection-path {
    stroke: #000;           /* Black */
    stroke-width: 3;
    stroke-dasharray: 8, 8;
    stroke-dashoffset: 8;   /* Offset creates alternating effect */
}
```

**Bezier curve for natural routing:**
```javascript
const sourceX = sourceNode.x + dataNodeWidth/2;
const targetX = targetNode.x - audioNodeWidth/2;
const midX = (sourceX + targetX) / 2;
const pathData = `M ${sourceX},${sourceY} C ${midX},${sourceY} ${midX},${targetY} ${targetX},${targetY}`;
```

---

## Main Application Coordination

**File:** `main.js` (~749 lines)

### Purpose

Wires modules together, handles UI events, coordinates playback loop.

### Module Imports

```javascript
import { 
    extractPaths, 
    extractValues,
    getValueByPath 
} from './lib/data-processor.js';

import { AudioEngine } from './lib/audio-engine.js';
import { ParameterMapper } from './lib/parameter-mapper.js';
import { PatchViz } from './lib/patch-viz.js';
```

### Module Instance Creation

```javascript
const audioEngine = new AudioEngine();
const parameterMapper = new ParameterMapper();
const patchViz = new PatchViz('patchViz');
```

**Why these are global:**
- `audioEngine`: AudioContext must persist across playback sessions
- `parameterMapper`: Mappings need to survive UI changes
- `patchViz`: D3 needs stable reference to SVG

### Application State

```javascript
let parsedData = null;           // Array of data items
let numericPaths = [];           // Detected numeric fields
let isPlaying = false;           // Playback state
let currentTimeout = null;       // For note timing
let currentPlaybackId = 0;       // Race condition prevention
```

### Event Flow

```
User loads dataset
  ↓
handleDatasetSelection()
  ↓
processData()
  ├─→ extractPaths(data) → numericPaths
  ├─→ parameterMapper.intelligentMapping(data, numericPaths)
  └─→ patchViz.render(numericPaths, mappings)
  
User clicks Play
  ↓
handlePlay()
  ↓
Playback loop
  ├─→ calculateAudioParams(item, mappings, dataRanges)
  ├─→ playNote(audioParams)
  └─→ patchViz.updateNodeValues(item, audioParams, mappings)
```

### Data Loading Pipeline

```javascript
async function handleDatasetSelection(e) {
    const filePath = e.target.value;
    
    // Fetch data
    const response = await fetch(filePath, { cache: 'no-cache' });
    const text = await response.text();
    
    // Parse based on file type
    let data;
    if (filePath.endsWith('.csv')) {
        data = d3.csvParse(text, d3.autoType);
    } else {
        const json = JSON.parse(text);
        // Handle GeoJSON
        data = json.type === 'FeatureCollection' && json.features 
            ? json.features 
            : json;
    }
    
    processData(data);
}

function processData(data) {
    parsedData = data;
    
    // Extract numeric paths
    const allPaths = extractPaths(data);
    numericPaths = allPaths.filter(p => p.type === 'number');
    
    // Initialize mappings
    parameterMapper.initializeMappings();
    parameterMapper.intelligentMapping(parsedData, numericPaths);
    
    // Render visualization
    patchViz.render(numericPaths, parameterMapper.mappings, parameterMapper, false);
    
    // Enable controls
    document.getElementById('playDataBtn').disabled = false;
}
```

### Playback Loop

```javascript
async function handlePlay() {
    if (isPlaying) {
        stopPlayback();
        return;
    }
    
    // Start new playback session
    isPlaying = true;
    currentPlaybackId++;
    const thisPlaybackId = currentPlaybackId;
    
    // Initialize audio
    if (!audioEngine.audioContext) {
        audioEngine.initEffects();
        audioEngine.setupVisualizer(document.getElementById('audioVisualizer'));
    }
    
    // Calculate data ranges once
    const dataRanges = calculateDataRanges(itemsArray, parameterMapper.mappings);
    
    // Loop continuously (race condition protected)
    while (isPlaying && thisPlaybackId === currentPlaybackId) {
        for (let i = 0; i < itemsArray.length && thisPlaybackId === currentPlaybackId; i++) {
            const item = itemsArray[i];
            
            // Calculate audio parameters
            const audioParams = calculateAudioParams(item, parameterMapper.mappings, dataRanges);
            
            // Update visualization
            patchViz.updateNodeValues(item, audioParams, parameterMapper.mappings, isPlaying);
            
            // Play note
            await playNote(audioParams);
            
            // Wait for next note
            const noteSpacing = audioParams.noteSpacing || 300;
            const speed = parseFloat(document.getElementById('speedControl').value) || 1;
            const finalDelay = noteSpacing / speed;
            
            await new Promise(resolve => {
                currentTimeout = setTimeout(resolve, finalDelay);
            });
            
            // Check if still current session
            if (thisPlaybackId !== currentPlaybackId) {
                return; // Graceful exit
            }
        }
    }
}
```

**Race condition protection:**
Each playback session gets a unique ID. If user clicks Play again while playing, the new session increments `currentPlaybackId`, and the old loop exits gracefully.

---

## Signal Flow

### Complete Audio Path

```
┌──────────────────────────────────────────────────────┐
│                    DATA SOURCE                        │
│          (JSON, CSV, GeoJSON from URL or file)        │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│              DATA PROCESSOR MODULE                    │
│  extractPaths() → Find all numeric fields            │
│  analyzeDataVariance() → Suggest curves              │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│           PARAMETER MAPPER MODULE                     │
│  intelligentMapping() → Data → Audio params          │
│  - Analyze interest scores                           │
│  - Assign to parameter tiers                         │
│  - Select optimal curves                             │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│              MAIN.JS PLAYBACK LOOP                    │
│  For each data item:                                 │
│  1. getValueByPath() → Extract values                │
│  2. Normalize to 0-1                                 │
│  3. Apply curve transformation                       │
│  4. Scale to audio parameter range                   │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│                AUDIO ENGINE MODULE                    │
│                                                       │
│  SYNTHESIZER MODE:                                   │
│  createCustomOscillator() → Source                   │
│    ↓                                                  │
│  BiquadFilter (tone shaping)                         │
│    ↓                                                  │
│  StereoPanner (spatial position)                     │
│    ↓                                                  │
│  GainNode (envelope ADSR)                            │
│    ↓                                                  │
│  Effects Chain (reverb → delay)                      │
│    ↓                                                  │
│  AnalyserNode (visualization)                        │
│    ↓                                                  │
│  audioContext.destination (speakers)                 │
│                                                       │
│  SAMPLER MODE:                                       │
│  BufferSource (loaded sample)                        │
│    - playbackRate (pitch control)                    │
│    - offset (start position)                         │
│    - duration (crop length)                          │
│    ↓                                                  │
│  (same per-note chain as synthesizer)                │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│                PATCH VIZ MODULE                       │
│  updateNodeValues() → Live visual feedback           │
│  - Data node values                                  │
│  - Audio param values                                │
│  - Progress bars                                     │
│  - Connection highlighting                           │
└──────────────────────────────────────────────────────┘
```

### Per-Note Signal Chain (Detailed)

```
SYNTHESIZER MODE:
┌─────────────────┐
│  Oscillator     │  Frequency from data
│  (sine/square/  │  Duration from data
│   sawtooth/etc) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  BiquadFilter   │  filterFreq from data
│  (lowpass/etc)  │  filterQ from data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  StereoPanner   │  pan from data (-1 to 1)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GainNode       │  Envelope (ADSR)
│  (Envelope)     │  - Attack from data
│                 │  - Release from data
│                 │  - Master volume from UI
└────────┬────────┘
         │
         ├─────→ reverbNode (ConvolverNode)
         │        ├→ reverbWetGain (reverbMix from data)
         │        └→ reverbDryGain (1 - reverbMix)
         │              ↓
         └─────────────→ delayNode
                         ├→ delayFeedbackGain (feedback loop)
                         ├→ delayWetGain (delayMix from data)
                         └→ delayDryGain (1 - delayMix)
                              ↓
                         analyserNode (for visualization)
                              ↓
                         audioContext.destination


SAMPLER MODE:
┌─────────────────┐
│  BufferSource   │  pitch (playback rate) from data
│  (loaded sample)│  sampleOffset (0-1) from data
│                 │  duration (crop) from data
└────────┬────────┘
         │
         └────→ (same per-note chain as synthesizer)
```

---

## Web Audio API Patterns

### Why Class vs Functions?

**AudioEngine uses a class because:**
- AudioContext must persist across playback sessions
- Effects nodes are global and shared
- State needs cleanup (close context, cancel animations)
- Multiple methods operate on same context/nodes

**DataProcessor uses pure functions because:**
- No state to maintain
- Same input = same output (testable)
- Can be used independently
- No side effects

### Browser Compatibility

```javascript
// Safari compatibility
this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Resume context if suspended (mobile Safari requirement)
if (this.audioContext.state === 'suspended') {
    this.audioContext.resume();
}
```

### User Gesture Requirement

Modern browsers require user interaction before audio:

```javascript
// Initialize on first Play button click
if (!audioEngine.audioContext) {
    audioEngine.initEffects(); // Creates context
}
```

**Why:** Prevents annoying autoplay ads. Must be called from user event (click, touch, keypress).

### Memory Management

```javascript
cleanup() {
    // Stop visualizer
    this.stopVisualizer();
    
    // Close audio context (frees resources)
    if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
    }
    
    // Clear all references
    this.delayNode = null;
    this.reverbNode = null;
    this.sampleBuffer = null;
}
```

**When to call:** App shutdown, switching to sampler mode, memory constraints.

### Exponential Ramps for Natural Sound

```javascript
// Exponential ramps sound more natural than linear
// But can't start/end at 0 (use 0.001)

envelope.gain.setValueAtTime(0.001, now);
envelope.gain.exponentialRampToValueAtTime(volume, now + attackTime);
envelope.gain.setValueAtTime(volume, now + sustainTime);
envelope.gain.exponentialRampToValueAtTime(0.001, now + totalTime);
```

### Analog Delay Pitch Shifting

```javascript
// Ramping delay time creates pitch bend (tape delay effect)
if (Math.abs(newDelayTime - previousDelayTime) > 0.005) {
    delayNode.delayTime.linearRampToValueAtTime(newDelayTime, now + 0.05);
    // 50ms ramp creates audible pitch shift
}
```

**Effect:** When data changes delay time, you hear a pitch bend like analog tape.

---

## Parameter Mapping Deep Dive

### Mapping Pipeline

```
1. EXTRACT
   Raw value from data
   getValueByPath(item, 'properties.mag') → 4.5

2. NORMALIZE
   Scale to 0-1 based on data range
   (4.5 - 0.5) / (8.5 - 0.5) → 0.5

3. CURVE
   Apply transformation
   exponential: 0.5² → 0.25
   cubic: 0.5³ → 0.125
   logarithmic: log₁₀(1 + 0.5×9) / log₁₀(10) → 0.681
   inverse: 1 - 0.5 → 0.5
   linear: 0.5 → 0.5

4. SCALE
   Map to audio parameter range
   200 + (0.25 × (2000 - 200)) → 650 Hz
```

### Curve Comparison

Given input 0.5 (middle of range):

| Curve | Output | Use Case |
|-------|--------|----------|
| linear | 0.5 | Evenly distributed data |
| exponential | 0.25 | Emphasize high values (frequencies) |
| cubic | 0.125 | Amplify tiny differences (lat/lon) |
| logarithmic | 0.681 | Compress large ranges (magnitudes) |
| inverse | 0.5 | Flip mapping direction |

**Visual representation:**
```
1.0 ┤                                    ╱─ exponential
    │                                ╱───
    │                            ╱───
0.5 ┤           ╱────────────────  linear
    │       ╱───
    │   ╱───
0.0 ┤───                                     cubic
    └───────────────────────────────────►
   0.0                                 1.0
```

### Data Range Pre-calculation

Ranges calculated **once** at playback start for efficiency:

```javascript
const dataRanges = {};
Object.entries(mappings).forEach(([param, mapping]) => {
    if (mapping.path) {
        const values = itemsArray
            .map(item => getValueByPath(item, mapping.path))
            .filter(v => !isNaN(parseFloat(v)))
            .map(v => parseFloat(v));
        
        dataRanges[param] = {
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }
});
```

**Why pre-calculate:**
- Avoids recalculating min/max for every data item
- Ensures consistent scaling across entire dataset
- ~100x faster than recalculating per item

### Special Parameter: noteSpacing (Rhythm)

Note spacing gets special treatment because rhythm is perceptually important:

```javascript
// Wide range for dramatic variation
mapping.min = 80;    // Rapid-fire
mapping.max = 1200;  // Spacious

// Favor exponential curves
if (coefficientOfVariation < 0.5) {
    mapping.curve = 'exponential';
}

// Apply ±20% random variation for organic feel
const baseSpacing = calculateSpacing(item);
const variation = (Math.random() - 0.5) * 0.4; // ±20%
const finalSpacing = baseSpacing * (1 + variation);
```

### Quantization Options

**Pitch Quantization:**
```javascript
function quantizePitch(frequency) {
    const scales = {
        pentatonic: [0, 2, 4, 7, 9],
        major: [0, 2, 4, 5, 7, 9, 11],
        minor: [0, 2, 3, 5, 7, 8, 10],
        // ... more scales
    };
    
    const midiNote = 69 + 12 * Math.log2(frequency / 440);
    const octave = Math.floor(midiNote / 12);
    const noteInOctave = midiNote % 12;
    
    // Snap to nearest scale degree
    const closestDegree = findClosest(noteInOctave, scale);
    const quantizedMidi = octave * 12 + closestDegree;
    
    return 440 * Math.pow(2, (quantizedMidi - 69) / 12);
}
```

**Rhythmic Quantization:**
```javascript
function quantizeRhythm(spacing) {
    // Musical divisions at 120 BPM
    const rhythmGrid = [125, 250, 375, 500, 750, 1000, 1500, 2000];
    return findClosest(spacing, rhythmGrid);
}
```

---

## Visualization System

### Two-Part Visualization

**1. Waveform Visualizer (Canvas)**
- Real-time frequency spectrum
- Shows musical content (first 60% of FFT)
- Black line on light gray background
- Low latency, instant response

**2. Patch Visualization (D3.js + SVG)**
- Node graph showing mappings
- Data nodes → Audio parameter nodes
- Connection lines (yellow/black patch cables)
- Live value updates and progress bars

### Waveform Implementation

```javascript
// Setup (once)
analyser.fftSize = 256;              // Low latency
analyser.smoothingTimeConstant = 0;  // Instant response
dataArray = new Uint8Array(analyser.frequencyBinCount);

// Draw loop (60fps)
analyser.getByteFrequencyData(dataArray);

const relevantBins = Math.floor(dataArray.length * 0.6);
const sliceWidth = width / relevantBins;
const amplification = 2.0;

for (let i = 0; i < relevantBins; i++) {
    const v = Math.min(1, (dataArray[i] / 255.0) * amplification);
    const y = height - (v * height);
    const x = i * sliceWidth;
    
    if (i === 0) {
        ctx.moveTo(x, y);
    } else {
        ctx.lineTo(x, y);
    }
}
ctx.stroke();
```

**Why only 60% of spectrum?**
Higher frequencies (above ~5kHz) contain mostly noise and harmonics, not useful musical information.

### D3.js Patterns

**Clear and redraw vs incremental update:**

DataSynth uses **clear and redraw** for simplicity:
```javascript
render() {
    this.svg.selectAll('*').remove();  // Clear everything
    // ... rebuild from scratch
}
```

**When to use incremental:**
- Large graphs (>100 nodes)
- Frequent updates (>60fps)
- Complex animations

**For DataSynth:** Clear/redraw is fine (<20 nodes, updates on mapping changes only).

**D3 Data Binding:**
```javascript
// Select, bind data, create elements
const nodeGroups = container.selectAll('.node')
    .data(this.nodes, d => d.id)  // Key function for object constancy
    .enter()                       // New elements
    .append('g')
    .attr('class', 'node');

// Update existing elements
nodeGroups.attr('transform', d => `translate(${d.x},${d.y})`);

// Remove old elements
nodeGroups.exit().remove();
```

### Responsive Design

```javascript
// Adjust node sizing based on viewport
const audioNodeWidth = svgWidth < 600 ? 110 : 140;
const dataNodeWidth = svgWidth < 600 ? 150 : 200;
const nodeHeight = svgWidth < 600 ? 36 : 40;
```

---

## Playback Control

### States

```javascript
isPlaying = false;  // Main playback state
isPaused = false;   // Pause (not implemented yet)
currentPlaybackId = 0; // Race condition prevention
```

### Race Condition Protection

```javascript
// Each playback session gets unique ID
currentPlaybackId++;
const thisPlaybackId = currentPlaybackId;

// Check if still current session
while (isPlaying && thisPlaybackId === currentPlaybackId) {
    // ... playback loop
    
    if (thisPlaybackId !== currentPlaybackId) {
        return; // Graceful exit, new session started
    }
}
```

**Problem solved:** If user clicks Play → Stop → Play rapidly, old loop exits cleanly instead of overlapping with new loop.

### Speed Control

```javascript
const noteSpacing = audioParams.noteSpacing || 300;  // From data
const speed = parseFloat(document.getElementById('speedControl').value) || 1;
const actualDelay = noteSpacing / speed;

// Speed 0.5x → 2× slower (600ms)
// Speed 1.0x → normal (300ms)
// Speed 2.0x → 2× faster (150ms)
```

### Master Controls

**Volume:**
```javascript
const volume = parseFloat(document.getElementById('masterVolume').value) || 0.2;
envelope.gain.exponentialRampToValueAtTime(volume, now + attackTime);
```

**Pitch Transpose:**
```javascript
const pitchTranspose = parseFloat(document.getElementById('pitchControl').value) || 0;
const transposeSemitones = Math.pow(2, pitchTranspose / 12);

// Synthesizer: multiply frequency
frequency = frequency * transposeSemitones;

// Sampler: multiply playback rate
source.playbackRate.value = pitchRate * transposeSemitones;
```

---

## Best Practices

### Module Design

✅ **DO:**
- Use pure functions for data transformation
- Use classes when state must persist
- Export minimal public API
- Document purpose at top of file
- Include usage examples in comments

❌ **DON'T:**
- Mix concerns (keep modules focused)
- Create circular dependencies
- Mutate imported state
- Skip error handling

### Web Audio API

✅ **DO:**
- Initialize context from user gesture
- Resume suspended context
- Use exponential ramps for envelopes
- Disconnect/cleanup nodes when done
- Check browser compatibility

❌ **DON'T:**
- Start oscillators before connecting
- Close context during playback
- Use linear ramps for volume (sounds robotic)
- Create new context per note
- Forget about mobile Safari quirks

### Performance

✅ **DO:**
- Pre-calculate data ranges once
- Reuse audio nodes when possible
- Use requestAnimationFrame for visualization
- Cancel animation frames on stop
- Debounce UI parameter changes

❌ **DON'T:**
- Recalculate ranges per item
- Create nodes in hot loops
- Use setInterval for animation
- Update visualization faster than 60fps
- Apply every slider change immediately

### D3.js

✅ **DO:**
- Let D3 own its DOM elements
- Use data binding pattern
- Clear and redraw for simplicity (small graphs)
- Store D3 selections, not raw elements
- Use CSS classes for styling

❌ **DON'T:**
- Mix vanilla JS and D3 DOM manipulation
- Update individual elements manually
- Skip key functions in data binding
- Inline styles (use CSS classes)
- Create unnecessary enter/update/exit complexity

---

## Testing

Each module has unit tests in `test/`:

```
test/
├── audio-engine.test.html       (19 tests)
├── data-processor.test.html     (25 tests)
├── parameter-mapper.test.html   (14 tests)
├── patch-viz.test.html          (8 tests)
└── integration-verification.html (full pipeline)
```

### Running Tests

```bash
# Start server
python3 -m http.server 8000

# Open in browser
http://localhost:8000/test/data-processor.test.html
http://localhost:8000/test/integration-verification.html
```

### Test Structure

```html
<script type="module">
import { functionToTest } from '../lib/module.js';

const results = [];

// Test 1: Normal case
const test1 = functionToTest(validInput) === expectedOutput;
results.push({ name: 'Test description', pass: test1 });

// Test 2: Edge case
const test2 = functionToTest(null) === undefined;
results.push({ name: 'Edge case handling', pass: test2 });

// Display results
results.forEach(result => {
    console.log(result.pass ? '✅' : '❌', result.name);
});
</script>
```

---

## Deployment

### Static Deployment

DataSynth works as static files:

```bash
# No build step required
# Just upload these files to any static host:
index.html
main.js
lib/
  ├── audio-engine.js
  ├── data-processor.js
  ├── parameter-mapper.js
  └── patch-viz.js
datasets/ (optional)
```

### CDN Dependencies

Loaded from CDN (no local copies needed):
- Tachyons CSS: https://unpkg.com/tachyons@4.12.0/css/tachyons.min.css
- D3.js: https://d3js.org/d3.v7.min.js
- Google Fonts: IBM Plex Mono

### Offline Support

To make it work offline:
1. Download CDN files locally
2. Update URLs in index.html
3. Add service worker (optional)

---

## Summary

### Key Takeaways

**Architecture:**
- 4 ES6 modules + main coordinator
- Pure functions for data processing
- Classes for stateful audio management
- D3.js for interactive visualization

**Audio Processing:**
- Web Audio API for synthesis and effects
- Dual mode: synthesizer (oscillators) or sampler (audio files)
- Global effects: reverb → delay
- Per-note chain: filter → pan → envelope

**Parameter Mapping:**
- Intelligent auto-mapping based on data analysis
- 5 curve types for different data distributions
- Pre-calculated ranges for performance
- Real-time visual feedback

**Design Principles:**
- No frameworks, no build tools
- Browser-native ES6 modules
- Incremental development
- Test continuously
- Keep it deployable

### Module Reference

| Module | Lines | Purpose | Key Exports |
|--------|-------|---------|-------------|
| data-processor.js | ~290 | Data parsing | extractPaths, getValueByPath |
| parameter-mapper.js | ~461 | Mapping logic | ParameterMapper class |
| audio-engine.js | ~586 | Web Audio API | AudioEngine class |
| patch-viz.js | ~603 | D3 visualization | PatchViz class |
| main.js | ~749 | Coordination | Event handlers, playback loop |

---

*Last updated: 2025-11-13*
*Version: Modular refactor (post-extraction from json-mapper-v2.html)*
