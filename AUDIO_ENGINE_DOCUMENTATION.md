# Audio Engine Documentation

**Complete technical reference for migrating to React/Next.js/Tailwind/Radix**

This document covers ALL audio processing logic in the DataSynth project, including synthesis, sampling, effects, parameter mapping, and visualization.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Global State & Audio Context](#global-state--audio-context)
3. [Effects Chain](#effects-chain)
4. [Synthesizer Mode](#synthesizer-mode)
5. [Sampler Mode](#sampler-mode)
6. [Parameter Mapping System](#parameter-mapping-system)
7. [Envelope (ADSR)](#envelope-adsr)
8. [Playback Control](#playback-control)
9. [Visualization](#visualization)
10. [Data Processing & Scaling](#data-processing--scaling)
11. [Helper Functions](#helper-functions)
12. [Migration Notes](#migration-notes)

---

## Architecture Overview

### Signal Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA SOURCE                              │
│               (JSON, CSV, GeoJSON, Prose)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PARAMETER MAPPING                             │
│  • Extract values from data paths                                │
│  • Normalize to 0-1 range                                        │
│  • Apply curves (linear, exponential, cubic, log, inverse)       │
│  • Scale to audio parameter ranges                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SOUND SOURCE                                  │
│  ┌──────────────────┐              ┌─────────────────┐          │
│  │   SYNTHESIZER    │      OR      │     SAMPLER     │          │
│  │                  │              │                 │          │
│  │ • Oscillators    │              │ • Audio Buffer  │          │
│  │ • Noise          │              │ • Playback Rate │          │
│  │ • FM Synthesis   │              │ • Sample Offset │          │
│  │ • Additive       │              │ • Crop Duration │          │
│  └──────────────────┘              └─────────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PER-NOTE CHAIN                                │
│                                                                   │
│    Source → Filter → Panner → Envelope → Effects                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GLOBAL EFFECTS                                │
│                                                                   │
│            ┌─────────┐         ┌─────────┐                       │
│  Input ──→ │ REVERB  │  ────→  │  DELAY  │  ────→  Output       │
│         ↓  │ (wet)   │      ↓  │ (wet)   │      ↓               │
│         ↓  └─────────┘      ↓  └─────────┘      ↓               │
│         ↓                   ↓                   ↓               │
│         ↓─── Dry ───────────↓─── Dry ───────────↓               │
│            (reverb dry)        (delay dry)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ANALYSER                                    │
│              (for waveform visualization)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
                    audioContext.destination
```

---

## Global State & Audio Context

### State Variables

```javascript
// Core audio state
let audioContext;              // Web Audio API context
let isPlaying = false;         // Playback state
let isPaused = false;          // Pause state
let currentTimeout;            // For note timing

// Effects nodes (global, shared by all notes)
let delayNode;                 // Delay effect
let delayFeedbackGain;         // Delay feedback amount
let delayWetGain;              // Delay wet signal
let delayDryGain;              // Delay dry signal
let reverbNode;                // Convolver reverb
let reverbWetGain;             // Reverb wet signal
let reverbDryGain;             // Reverb dry signal
let previousDelayTime = null;  // Track for analog pitch shifting

// Sampler state
let samplerMode = false;       // false = synth, true = sampler
let sampleBuffer = null;       // Decoded audio buffer
let originalSampleRate = null; // For display/info

// Visualization
let analyser;                  // AnalyserNode for waveform
let dataArray;                 // Frequency data array
let animationId;               // requestAnimationFrame ID

// Data & mappings
let parsedData = null;         // Array of data items
let mappings = {};             // Parameter mappings
let numericPaths = [];         // Available data paths
```

### Audio Context Initialization

```javascript
function initEffects() {
    // Create audio context if it doesn't exist
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Initialize delay
    delayNode = audioContext.createDelay(2.0); // Max 2 seconds
    delayFeedbackGain = audioContext.createGain();
    delayWetGain = audioContext.createGain();
    delayDryGain = audioContext.createGain();
    
    // Delay feedback loop
    delayNode.connect(delayFeedbackGain);
    delayFeedbackGain.connect(delayNode);
    delayNode.connect(delayWetGain);
    
    // Initialize reverb
    reverbNode = audioContext.createConvolver();
    reverbNode.buffer = createReverbImpulse(2, 2); // 2s duration, decay=2
    reverbWetGain = audioContext.createGain();
    reverbDryGain = audioContext.createGain();
    
    reverbNode.connect(reverbWetGain);
    
    // Connect effects chain to destination
    // Signal flow: Input → Reverb (wet/dry) → Delay (wet/dry) → Output
    reverbWetGain.connect(delayNode);
    reverbWetGain.connect(delayDryGain);
    reverbDryGain.connect(delayNode);
    reverbDryGain.connect(audioContext.destination);
    delayWetGain.connect(audioContext.destination);
}
```

**Key Points:**
- Audio context created lazily (on first playback or sample load)
- Effects are global and shared by all notes
- Delay has feedback loop for infinite repeats
- Reverb uses convolution with impulse response

---

## Effects Chain

### Reverb

**Type:** Convolution reverb  
**Implementation:** ConvolverNode with synthetic impulse response

```javascript
function createReverbImpulse(duration, decay) {
    if (!audioContext) return null;
    
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioContext.createBuffer(2, length, sampleRate); // Stereo
    
    // Generate impulse response (decaying noise)
    for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
            // Random noise * exponential decay
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
    }
    
    return impulse;
}
```

**Parameters:**
- `reverbDecay` (0.1-10s): Decay time, regenerates impulse when changed >0.5s
- `reverbMix` (0-1): Wet/dry mix

**Signal Flow:**
```
Input → reverbNode → reverbWetGain (scaled by mix)
     ↓
     → reverbDryGain (scaled by 1-mix)
```

### Delay

**Type:** Feedback delay with analog-style pitch shifting  
**Implementation:** DelayNode with feedback loop

```javascript
// Delay parameter update (happens per note)
const now = audioContext.currentTime;
const newDelayTimeSeconds = Math.max(0.001, Math.min(2, delayTime / 1000));

// Analog delay pitch shifting: ramp delay time for pitch bend
if (previousDelayTime !== null && Math.abs(newDelayTimeSeconds - previousDelayTime) > 0.005) {
    // Fast ramp creates tape-style pitch shift
    const rampTime = 0.05; // 50ms creates audible pitch bend
    delayNode.delayTime.cancelScheduledValues(now);
    delayNode.delayTime.setValueAtTime(previousDelayTime, now);
    delayNode.delayTime.linearRampToValueAtTime(newDelayTimeSeconds, now + rampTime);
} else {
    delayNode.delayTime.setValueAtTime(newDelayTimeSeconds, now);
}
previousDelayTime = newDelayTimeSeconds;

// Update feedback and mix
delayFeedbackGain.gain.setValueAtTime(Math.max(0, Math.min(0.9, delayFeedback)), now);
delayWetGain.gain.setValueAtTime(delayMix, now);
delayDryGain.gain.setValueAtTime(1 - delayMix, now);
```

**Parameters:**
- `delayTime` (50-1000ms): Delay time with ±15% random variation per note
- `delayFeedback` (0.1-0.85): Feedback amount (capped at 0.9 to prevent runaway)
- `delayMix` (0.1-0.9): Wet/dry mix

**Special Features:**
- **Analog pitch shifting:** When delay time changes, it ramps over 50ms causing pitch bend (like tape delay)
- **Organic variation:** Each note gets ±15% random delay time variation
- **Safe feedback:** Clamped to 0.9 maximum to prevent infinite feedback

### Filter

**Type:** Biquad filter (per-note, not global)  
**Types Available:** lowpass, highpass, bandpass, notch

```javascript
const filter = audioContext.createBiquadFilter();
filter.type = 'lowpass'; // or highpass, bandpass, notch
filter.frequency.value = filterFreq; // 200-8000 Hz
filter.Q.value = filterQ; // 0.1-20
```

**Parameters:**
- `filterFreq` (200-8000 Hz): Cutoff frequency
- `filterQ` (0.1-20): Resonance

### Panner

**Type:** Stereo panner (per-note)

```javascript
const panner = audioContext.createStereoPanner();
panner.pan.value = Math.max(-1, Math.min(1, pan)); // -1 (left) to 1 (right)
```

**Parameters:**
- `pan` (-1 to 1): Stereo position

---

## Synthesizer Mode

### Oscillator Types

The synthesizer supports standard and custom waveforms:

```javascript
function createCustomOscillator(audioContext, frequency, type, duration) {
    // Standard waveforms
    if (type === 'sine' || type === 'square' || type === 'sawtooth' || type === 'triangle') {
        const osc = audioContext.createOscillator();
        osc.frequency.value = frequency;
        osc.type = type;
        return osc;
    }
    
    // WHITE NOISE
    if (type === 'white-noise') {
        const source = audioContext.createBufferSource();
        source.buffer = createNoiseBuffer(audioContext, 'white-noise', duration);
        source.loop = false;
        return source;
    }
    
    // PINK NOISE (1/f spectrum, more bass)
    if (type === 'pink-noise') {
        const source = audioContext.createBufferSource();
        source.buffer = createNoiseBuffer(audioContext, 'pink-noise', duration);
        source.loop = false;
        return source;
    }
    
    // BROWN NOISE (1/f² spectrum, even more bass)
    if (type === 'brown-noise') {
        const source = audioContext.createBufferSource();
        source.buffer = createNoiseBuffer(audioContext, 'brown-noise', duration);
        source.loop = false;
        return source;
    }
    
    // FM SYNTHESIS (carrier modulated by modulator)
    if (type === 'fm') {
        const carrier = audioContext.createOscillator();
        const modulator = audioContext.createOscillator();
        const modulatorGain = audioContext.createGain();
        
        carrier.frequency.value = frequency;
        modulator.frequency.value = frequency * 2.5; // Harmonic ratio
        modulatorGain.gain.value = frequency * 0.8;  // Modulation depth
        
        // Connect modulator to carrier frequency
        modulator.connect(modulatorGain);
        modulatorGain.connect(carrier.frequency);
        
        carrier.type = 'sine';
        modulator.type = 'sine';
        
        // Store references to start/stop together
        carrier._modulator = modulator;
        carrier._modulatorGain = modulatorGain;
        
        return carrier;
    }
    
    // ADDITIVE SYNTHESIS (multiple harmonics)
    if (type === 'additive') {
        const osc = audioContext.createOscillator();
        osc.frequency.value = frequency;
        osc.type = 'sine';
        osc._isAdditive = true; // Flag for special handling
        return osc;
    }
    
    // PWM (Pulse Width Modulation) - currently just square wave
    if (type === 'pwm') {
        const osc = audioContext.createOscillator();
        osc.frequency.value = frequency;
        osc.type = 'square';
        osc._isPWM = true;
        return osc;
    }
}
```

### Noise Generation

```javascript
function createNoiseBuffer(audioContext, type, duration) {
    const bufferSize = audioContext.sampleRate * (duration / 1000);
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    if (type === 'white-noise') {
        // Equal power across all frequencies
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    } 
    else if (type === 'pink-noise') {
        // 1/f power spectrum (more bass)
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
    } 
    else if (type === 'brown-noise') {
        // 1/f² power spectrum (even more bass)
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; // Compensate for volume loss
        }
    }
    
    return buffer;
}
```

### Additive Synthesis

When `_isAdditive` flag is set, creates additional harmonics:

```javascript
if (!samplerMode && source._isAdditive) {
    // Reduce fundamental
    const harmonicGain = audioContext.createGain();
    harmonicGain.gain.value = 0.6;
    source.connect(harmonicGain);
    harmonicGain.connect(filter);
    
    // Add harmonics 2x, 3x, 4x with decreasing amplitude
    const frequency = audioParams.frequency || 440;
    const transposedFrequency = frequency * Math.pow(2, pitchTranspose / 12);
    
    for (let h = 2; h <= 4; h++) {
        const harmonic = audioContext.createOscillator();
        const hGain = audioContext.createGain();
        harmonic.frequency.value = transposedFrequency * h;
        harmonic.type = 'sine';
        hGain.gain.value = 0.3 / h; // Amplitude decreases with harmonic number
        harmonic.connect(hGain);
        hGain.connect(filter);
        harmonic.start(now);
        harmonic.stop(now + durationTime);
    }
}
```

### Pitch Quantization

Forces frequencies to musical scale:

```javascript
function quantizePitch(frequency) {
    // Quantize to nearest semitone (12-TET)
    const midiNote = 12 * Math.log2(frequency / 440) + 69;
    const roundedMidi = Math.round(midiNote);
    return 440 * Math.pow(2, (roundedMidi - 69) / 12);
}

// Usage in playback:
if (document.getElementById('pitchQuantization')?.checked) {
    transposedFrequency = quantizePitch(transposedFrequency);
}
```

### Synthesizer Parameters

```javascript
{
    id: 'frequency',
    label: 'Frequency (Hz)',
    min: 200,
    max: 2000,
    default: 440
}
```

---

## Sampler Mode

### Sample Loading

```javascript
// Triggered by file input
async function handleSampleUpload(file) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const arrayBuffer = await file.arrayBuffer();
    sampleBuffer = await audioContext.decodeAudioData(arrayBuffer);
    originalSampleRate = sampleBuffer.sampleRate;
    
    console.log('Sample loaded:', {
        duration: sampleBuffer.duration.toFixed(2) + 's',
        sampleRate: originalSampleRate,
        channels: sampleBuffer.numberOfChannels
    });
}
```

### Sample Playback

```javascript
// Create buffer source
const source = audioContext.createBufferSource();
source.buffer = sampleBuffer;

// Playback rate (pitch)
const pitchRate = audioParams.pitch || 1; // Data-driven rate
const pitchTranspose = parseFloat(document.getElementById('pitchControl')?.value || 0);
const transposeSemitones = Math.pow(2, pitchTranspose / 12); // Convert semitones to rate
source.playbackRate.value = pitchRate * transposeSemitones;

// Sample offset (where to start in the sample)
let sampleOffsetSeconds;
let sampleOffsetNorm; // 0-1 normalized position

// Check Random Chop Mode
const randomChopMode = document.getElementById('randomChopMode')?.checked || false;

if (randomChopMode) {
    // RANDOM CHOP MODE: Pick random 1-second increments, play 5 seconds
    const chunkDuration = 5.0;
    const startIncrement = 1.0;
    const maxStartTime = Math.max(0, sampleBuffer.duration - chunkDuration);
    
    if (maxStartTime > 0) {
        const numPositions = Math.floor(maxStartTime / startIncrement) + 1;
        const randomPosition = Math.floor(Math.random() * numPositions);
        sampleOffsetSeconds = randomPosition * startIncrement;
        sampleOffsetNorm = sampleOffsetSeconds / sampleBuffer.duration;
    } else {
        sampleOffsetSeconds = 0;
        sampleOffsetNorm = 0;
    }
} else {
    // NORMAL MODE: Use data-driven offset
    sampleOffsetNorm = audioParams.sampleOffset || 0; // 0-1 range
    sampleOffsetSeconds = sampleOffsetNorm * sampleBuffer.duration;
}

// Crop duration (how long to play from offset)
const fullNoteDuration = document.getElementById('fullNoteDuration')?.checked || false;
let cropDurationSeconds;

if (randomChopMode) {
    cropDurationSeconds = 5.0; // Always 5 seconds in random chop
} else if (fullNoteDuration) {
    // Play until next note (use noteSpacing)
    const noteSpacing = audioParams.noteSpacing || 300;
    cropDurationSeconds = noteSpacing / 1000;
} else {
    // Normal: use duration parameter
    cropDurationSeconds = duration / 1000;
}

// Start playback
source.start(now, sampleOffsetSeconds, cropDurationSeconds);
```

### Anti-Click Protection

Samples get minimum attack/release to prevent clicks:

```javascript
// For samples, ensure minimum smoothing
const minSmoothTime = samplerMode ? 0.003 : 0; // 3ms minimum for samples
const attackTime = Math.max(minSmoothTime, attack / 1000);
const releaseTime = Math.max(minSmoothTime, release / 1000);
```

### Sampler Parameters

```javascript
{
    id: 'pitch',
    label: 'Pitch (Playback Rate)',
    min: 0.25,   // 2 octaves down
    max: 4,      // 2 octaves up
    default: 1
},
{
    id: 'sampleOffset',
    label: 'Sample Start (0-1)',
    min: 0,
    max: 1,
    default: 0
}
```

---

## Parameter Mapping System

### Available Parameters

**Synthesizer Mode:**
- `frequency` (200-2000 Hz): Base pitch
- `duration` (50-2000ms): Note length
- `noteSpacing` (50-2000ms): Time between notes (rhythm)
- `pan` (-1 to 1): Stereo position
- `filterFreq` (200-8000 Hz): Filter cutoff
- `filterQ` (0.1-20): Filter resonance
- `delayTime` (50-1000ms): Delay time
- `delayFeedback` (0.1-0.85): Delay repeats
- `delayMix` (0.1-0.9): Delay wet/dry
- `reverbDecay` (0.1-10s): Reverb length
- `reverbMix` (0-1): Reverb wet/dry
- `attack` (1-1000ms): Envelope attack
- `release` (1-2000ms): Envelope release

**Sampler Mode:**
- `pitch` (0.25-4): Playback rate (replaces frequency)
- `sampleOffset` (0-1): Starting position in sample
- All other parameters same as synthesizer

### Mapping Structure

```javascript
mappings = {
    frequency: {
        path: 'properties.mag',     // Data path to extract value from
        fixed: 440,                  // Default if no path mapped
        min: 200,                    // Audio parameter minimum
        max: 2000,                   // Audio parameter maximum
        curve: 'exponential'         // Scaling curve
    },
    // ... other parameters
}
```

### Parameter Calculation Pipeline

```javascript
function getParamValue(paramName) {
    const mapping = mappings[paramName];
    if (!mapping) return null;
    
    // 1. Extract raw value from data
    if (mapping.path && dataRanges[paramName]) {
        const rawValue = parseFloat(getValueByPath(item, mapping.path));
        if (isNaN(rawValue)) return mapping.fixed;
        
        // 2. Get data range (pre-calculated from entire dataset)
        const dataMin = dataRanges[paramName].min;
        const dataMax = dataRanges[paramName].max;
        
        if (dataMax === dataMin) return mapping.min;
        
        // 3. Normalize to 0-1
        let normalized = (rawValue - dataMin) / (dataMax - dataMin);
        normalized = Math.max(0, Math.min(1, normalized)); // Clamp
        
        // 4. Apply curve transformation
        let curved = normalized;
        switch (mapping.curve) {
            case 'exponential':
                curved = Math.pow(normalized, 2);
                break;
            case 'cubic':
                curved = Math.pow(normalized, 3);
                break;
            case 'logarithmic':
                curved = normalized > 0 
                    ? Math.log(1 + normalized * 9) / Math.log(10) 
                    : 0;
                break;
            case 'inverse':
                curved = 1 - normalized;
                break;
            case 'linear':
            default:
                curved = normalized;
                break;
        }
        
        // 5. Scale to audio parameter range
        return mapping.min + (curved * (mapping.max - mapping.min));
    }
    
    // No mapping: return fixed value
    return mapping.fixed;
}
```

### Curve Types

**Linear:** `y = x`
- Direct 1:1 mapping
- Use for most parameters

**Exponential:** `y = x²`
- Emphasizes higher values
- Good for frequencies (makes changes more perceptible)

**Cubic:** `y = x³`
- Even more emphasis on higher values
- Good for very low-variance data (lat/lon)

**Logarithmic:** `y = log₁₀(1 + 9x)`
- Compresses large ranges
- Good for magnitude scales (earthquakes, etc.)

**Inverse:** `y = 1 - x`
- Inverts the mapping
- Higher data values → lower parameter values

### Data Range Pre-calculation

Ranges calculated once at playback start:

```javascript
// Calculate data ranges for all mapped parameters ONCE
const dataRanges = {};
Object.entries(mappings).forEach(([param, mapping]) => {
    if (mapping && mapping.path) {
        const values = dataArray
            .map(item => getValueByPath(item, mapping.path))
            .filter(v => v !== undefined && !isNaN(parseFloat(v)))
            .map(v => parseFloat(v));
        
        if (values.length > 0) {
            dataRanges[param] = {
                min: Math.min(...values),
                max: Math.max(...values)
            };
        }
    }
});
```

---

## Envelope (ADSR)

### Envelope Implementation

Uses exponential ramps for natural-sounding envelopes:

```javascript
const envelope = audioContext.createGain();
const now = audioContext.currentTime;

// Minimum smoothing for samples (prevents clicks)
const minSmoothTime = samplerMode ? 0.003 : 0; // 3ms for samples
const attackTime = Math.max(minSmoothTime, attack / 1000); // Convert ms to seconds
const releaseTime = Math.max(minSmoothTime, release / 1000);
const durationTime = duration / 1000;

// Exponential ramps (can't start at 0, use 0.001)
envelope.gain.setValueAtTime(0.001, now); // START
envelope.gain.exponentialRampToValueAtTime(volume, now + attackTime); // ATTACK
envelope.gain.setValueAtTime(volume, now + Math.max(attackTime, durationTime - releaseTime)); // SUSTAIN
envelope.gain.exponentialRampToValueAtTime(0.001, now + durationTime); // RELEASE
```

### Envelope Stages

```
         Attack    Sustain         Release
           ↗       ━━━━━━━           ↘
         ↗                           ↘
       ↗                             ↘
     ↗                               ↘
   ↗_________________________________↘___
  0ms        attackTime    durationTime-releaseTime    durationTime
  
  0.001 → volume (exponential) → volume (hold) → 0.001 (exponential)
```

**Parameters:**
- `attack` (1-1000ms): Time to reach full volume
- `release` (1-2000ms): Time to fade out
- `volume` (0-1): Master volume from slider

**Key Points:**
- Exponential ramps sound more natural than linear
- Must start/end at non-zero for exponential (use 0.001)
- Samples get minimum 3ms attack/release to prevent clicks
- Sustain level is just full volume (simplified ADSR, no decay stage)

---

## Playback Control

### Main Playback Loop

```javascript
async function playDataSonification() {
    if (!parsedData) return;
    
    // Toggle stop if already playing
    if (isPlaying) {
        stopPlayback();
        return;
    }
    
    // Start playback
    isPlaying = true;
    isPaused = false;
    previousDelayTime = null;
    
    // Initialize effects
    if (!delayNode) {
        initEffects();
    }
    
    // Setup visualizer
    if (!analyser) {
        setupVisualizer();
    }
    drawVisualizer();
    
    const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
    
    // Calculate data ranges once
    const dataRanges = {};
    Object.entries(mappings).forEach(([param, mapping]) => {
        if (mapping && mapping.path) {
            const values = dataArray
                .map(item => getValueByPath(item, mapping.path))
                .filter(v => v !== undefined && !isNaN(parseFloat(v)))
                .map(v => parseFloat(v));
            
            if (values.length > 0) {
                dataRanges[param] = {
                    min: Math.min(...values),
                    max: Math.max(...values)
                };
            }
        }
    });
    
    // Loop continuously
    while (isPlaying) {
        for (let i = 0; i < dataArray.length && isPlaying; i++) {
            // Wait if paused
            while (isPaused && isPlaying) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            if (!isPlaying) break;
            
            const item = dataArray[i];
            
            // Calculate all audio parameters
            const audioParams = {};
            // ... (see Parameter Mapping section)
            
            // Update global effects
            updateDelayParameters(audioParams);
            updateReverbParameters(audioParams);
            
            // Play note
            playNote(audioParams);
            
            // Calculate note spacing with variation
            let noteSpacing = calculateNoteSpacing(audioParams);
            
            // Apply rhythmic quantization if enabled
            if (document.getElementById('rhythmicQuantization')?.checked) {
                noteSpacing = quantizeRhythm(noteSpacing);
            }
            
            // Wait for next note
            await new Promise(resolve => setTimeout(resolve, noteSpacing));
        }
    }
}
```

### Stop Playback

```javascript
function stopPlayback() {
    isPlaying = false;
    isPaused = false;
    
    // Update UI
    document.getElementById('playIcon').textContent = '▶';
    document.getElementById('playText').textContent = 'Play';
    visualizerCanvas.classList.remove('active');
    
    // Cancel animation frame
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Clear visualizer
    const rect = visualizerCanvas.getBoundingClientRect();
    visualizerCtx.fillStyle = '#eee';
    visualizerCtx.fillRect(0, 0, rect.width, rect.height);
    
    // Reset node visualization
    clearNodeVisualization();
}
```

### Rhythmic Quantization

Snaps note spacing to musical time divisions:

```javascript
function quantizeRhythm(spacing) {
    // Musical time divisions (in ms at 120 BPM)
    const rhythmGrid = [
        125,   // 32nd note
        250,   // 16th note
        375,   // Dotted 16th
        500,   // 8th note
        750,   // Dotted 8th
        1000,  // Quarter note
        1500,  // Dotted quarter
        2000   // Half note
    ];
    
    // Find closest grid value
    let closest = rhythmGrid[0];
    let minDiff = Math.abs(spacing - closest);
    
    for (const gridValue of rhythmGrid) {
        const diff = Math.abs(spacing - gridValue);
        if (diff < minDiff) {
            minDiff = diff;
            closest = gridValue;
        }
    }
    
    return closest;
}
```

---

## Visualization

### Waveform Visualizer

Real-time frequency spectrum display:

```javascript
function setupVisualizer() {
    if (!audioContext) return;
    
    // Create analyser
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; // Smaller FFT = lower latency
    analyser.smoothingTimeConstant = 0; // No smoothing = instant response
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    // Connect to effects chain output
    reverbWetGain.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // Set canvas resolution for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = visualizerCanvas.getBoundingClientRect();
    visualizerCanvas.width = rect.width * dpr;
    visualizerCanvas.height = rect.height * dpr;
    visualizerCtx.scale(dpr, dpr);
}

function drawVisualizer() {
    if (!isPlaying) return;
    
    animationId = requestAnimationFrame(drawVisualizer);
    
    // Get frequency data
    analyser.getByteFrequencyData(dataArray);
    
    const rect = visualizerCanvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Clear with light gray
    visualizerCtx.fillStyle = '#eee';
    visualizerCtx.fillRect(0, 0, width, height);
    
    // Show only first 60% of spectrum (musical content)
    const relevantBins = Math.floor(dataArray.length * 0.6);
    
    // Draw as line graph
    visualizerCtx.lineWidth = 2;
    visualizerCtx.strokeStyle = '#000';
    visualizerCtx.lineCap = 'round';
    visualizerCtx.lineJoin = 'round';
    visualizerCtx.beginPath();
    
    const sliceWidth = width / relevantBins;
    const amplification = 2.0; // 2x for more dramatic movement
    
    for (let i = 0; i < relevantBins; i++) {
        const v = dataArray[i] / 255.0;
        const y = height - (v * height * amplification);
        const x = i * sliceWidth;
        
        if (i === 0) {
            visualizerCtx.moveTo(x, y);
        } else {
            visualizerCtx.lineTo(x, y);
        }
    }
    
    visualizerCtx.stroke();
}
```

**Key Features:**
- Low latency (fftSize=256, no smoothing)
- High DPI support (uses devicePixelRatio)
- Shows musical range (first 60% of spectrum)
- 2x amplification for visibility

### Node Visualization

D3.js-based patch cable visualization (see separate D3 section in code)

**Features:**
- Data nodes (left) → Audio parameter nodes (right)
- Connection lines show active mappings
- Real-time progress bars on parameter nodes
- Active/hover states

---

## Data Processing & Scaling

### Path Extraction

Recursively extracts all numeric paths from data:

```javascript
function extractPaths(obj, prefix = '', depth = 0) {
    const paths = [];
    const maxDepth = 5;
    
    if (depth > maxDepth) return paths;
    
    if (Array.isArray(obj)) {
        // Sample first few items of array
        for (let i = 0; i < Math.min(3, obj.length); i++) {
            paths.push(...extractPaths(obj[i], prefix, depth + 1));
        }
    } else if (obj && typeof obj === 'object') {
        // Recurse into object properties
        for (const [key, value] of Object.entries(obj)) {
            const newPrefix = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'number') {
                paths.push({ path: newPrefix, type: 'number' });
            } else if (typeof value === 'object') {
                paths.push(...extractPaths(value, newPrefix, depth + 1));
            }
        }
    }
    
    return paths;
}
```

### Value Extraction

Gets value from nested path:

```javascript
function getValueByPath(obj, path) {
    if (!path || !obj) return undefined;
    
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
        if (current === null || current === undefined) {
            return undefined;
        }
        current = current[part];
    }
    
    return current;
}
```

### Intelligent Mapping

Auto-assigns data to parameters based on "interestingness":

```javascript
function intelligentMapping() {
    const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
    
    // Analyze each path
    const pathAnalysis = numericPaths.map(pathObj => {
        const values = extractValues(dataArray, pathObj.path);
        const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
        
        if (numericValues.length === 0) return null;
        
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const range = max - min;
        const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        const variance = numericValues.reduce((sum, v) => 
            sum + Math.pow(v - mean, 2), 0) / numericValues.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = Math.abs(mean) > 0 ? stdDev / Math.abs(mean) : 0;
        
        const uniqueValues = new Set(numericValues).size;
        const uniqueRatio = uniqueValues / numericValues.length;
        
        // Interest score: variance + uniqueness + range
        const interestScore = coefficientOfVariation * uniqueRatio * Math.log10(range + 1);
        
        return {
            path: pathObj.path,
            values: numericValues,
            min, max, range, mean, stdDev,
            coefficientOfVariation,
            uniqueRatio,
            interestScore
        };
    }).filter(a => a !== null);
    
    // Sort by interest score (most interesting first)
    pathAnalysis.sort((a, b) => b.interestScore - a.interestScore);
    
    // Assign top paths to key parameters
    const priorityParams = samplerMode 
        ? ['pitch', 'sampleOffset', 'filterFreq', 'pan', 'delayTime']
        : ['frequency', 'filterFreq', 'pan', 'reverbMix', 'delayTime'];
    
    priorityParams.forEach((param, i) => {
        if (pathAnalysis[i]) {
            const analysis = pathAnalysis[i];
            
            // Auto-select curve based on coefficient of variation
            let curve = 'linear';
            if (analysis.coefficientOfVariation < 0.01) {
                curve = 'cubic'; // Very low variance
            } else if (analysis.coefficientOfVariation < 0.1) {
                curve = 'exponential'; // Low variance
            } else if (analysis.coefficientOfVariation > 5) {
                curve = 'logarithmic'; // High variance
            }
            
            // Update mapping
            mappings[param].path = analysis.path;
            mappings[param].curve = curve;
            
            // Update UI
            document.getElementById(`map_${param}`).value = analysis.path;
            document.getElementById(`curve_${param}`).value = curve;
        }
    });
    
    updatePatchVisualization();
}
```

---

## Helper Functions

### Extract Values from Array

```javascript
function extractValues(data, path) {
    if (Array.isArray(data)) {
        return data.map(item => getValueByPath(item, path)).filter(v => v !== undefined);
    }
    return [getValueByPath(data, path)].filter(v => v !== undefined);
}
```

### Sample Info Display

```javascript
function displaySampleInfo() {
    if (!sampleBuffer) return;
    
    document.getElementById('sampleDuration').textContent = 
        sampleBuffer.duration.toFixed(2) + 's';
    document.getElementById('sampleRate').textContent = 
        originalSampleRate + ' Hz';
}
```

---

## Migration Notes

### React/Next.js Architecture Recommendations

#### **1. State Management**

Use React Context or Zustand for global audio state:

```typescript
// audioStore.ts (Zustand example)
interface AudioState {
    audioContext: AudioContext | null;
    isPlaying: boolean;
    isPaused: boolean;
    samplerMode: boolean;
    sampleBuffer: AudioBuffer | null;
    delayNode: DelayNode | null;
    reverbNode: ConvolverNode | null;
    mappings: Record<string, Mapping>;
    parsedData: any[] | null;
    
    initAudioContext: () => void;
    setIsPlaying: (playing: boolean) => void;
    // ... other actions
}

export const useAudioStore = create<AudioState>((set) => ({
    audioContext: null,
    isPlaying: false,
    // ... other state
    
    initAudioContext: () => set((state) => {
        if (!state.audioContext) {
            return { 
                audioContext: new (window.AudioContext || window.webkitAudioContext)() 
            };
        }
        return state;
    }),
    // ... other actions
}));
```

#### **2. Custom Hooks**

Break functionality into hooks:

```typescript
// useAudioEngine.ts
export function useAudioEngine() {
    const { audioContext, initAudioContext } = useAudioStore();
    
    useEffect(() => {
        initAudioContext();
    }, []);
    
    const playNote = useCallback((params: AudioParams) => {
        // ... playback logic
    }, [audioContext]);
    
    return { playNote };
}

// useEffectsChain.ts
export function useEffectsChain() {
    const { audioContext } = useAudioStore();
    const [delayNode, setDelayNode] = useState<DelayNode | null>(null);
    const [reverbNode, setReverbNode] = useState<ConvolverNode | null>(null);
    
    useEffect(() => {
        if (audioContext) {
            initEffects(audioContext);
        }
    }, [audioContext]);
    
    return { delayNode, reverbNode };
}

// useVisualizer.ts
export function useVisualizer(canvasRef: React.RefObject<HTMLCanvasElement>) {
    const { analyser, isPlaying } = useAudioStore();
    
    useEffect(() => {
        if (isPlaying && analyser) {
            const animationLoop = () => {
                drawVisualizer(canvasRef.current, analyser);
                requestAnimationFrame(animationLoop);
            };
            const id = requestAnimationFrame(animationLoop);
            return () => cancelAnimationFrame(id);
        }
    }, [isPlaying, analyser]);
}
```

#### **3. Component Structure**

```
src/
├── components/
│   ├── audio/
│   │   ├── AudioEngine.tsx         // Main audio controller
│   │   ├── Synthesizer.tsx         // Synth controls
│   │   ├── Sampler.tsx             // Sample controls
│   │   ├── EffectsPanel.tsx        // Reverb/delay controls
│   │   └── Visualizer.tsx          // Waveform canvas
│   ├── data/
│   │   ├── DataLoader.tsx          // File upload/dataset selector
│   │   ├── DataTable.tsx           // Data preview
│   │   └── PathSelector.tsx        // Path extraction UI
│   ├── mapping/
│   │   ├── ParameterMapping.tsx    // Mapping controls
│   │   ├── PatchVisualization.tsx  // D3 node graph
│   │   └── IntelligentMapper.tsx   // Auto-mapping
│   └── playback/
│       ├── PlaybackControls.tsx    // Play/pause/stop
│       └── GlobalSettings.tsx      // Volume/speed/pitch
├── lib/
│   ├── audio/
│   │   ├── audioEngine.ts          // Core audio logic
│   │   ├── synthesizer.ts          // Synth functions
│   │   ├── sampler.ts              // Sampler functions
│   │   ├── effects.ts              // Effects creation
│   │   └── envelope.ts             // ADSR logic
│   ├── data/
│   │   ├── dataExtractor.ts        // Path extraction
│   │   ├── dataMapper.ts           // Parameter mapping
│   │   └── dataScaler.ts           // Normalization/curves
│   └── visualization/
│       ├── waveform.ts             // Visualizer logic
│       └── patchGraph.ts           // D3 patch visualization
├── hooks/
│   ├── useAudioEngine.ts
│   ├── useEffectsChain.ts
│   ├── useVisualizer.ts
│   ├── useDataMapping.ts
│   └── usePlayback.ts
└── stores/
    └── audioStore.ts               // Zustand store
```

#### **4. TypeScript Types**

```typescript
// types/audio.ts

export interface AudioParams {
    frequency?: number;
    pitch?: number;
    sampleOffset?: number;
    duration: number;
    noteSpacing: number;
    pan: number;
    filterFreq: number;
    filterQ: number;
    delayTime: number;
    delayFeedback: number;
    delayMix: number;
    reverbDecay: number;
    reverbMix: number;
    attack: number;
    release: number;
}

export interface Mapping {
    path: string;
    fixed: number;
    min: number;
    max: number;
    curve: 'linear' | 'exponential' | 'cubic' | 'logarithmic' | 'inverse';
}

export type WaveformType = 
    | 'sine' | 'square' | 'sawtooth' | 'triangle'
    | 'white-noise' | 'pink-noise' | 'brown-noise'
    | 'fm' | 'additive' | 'pwm';

export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';

export interface DataPath {
    path: string;
    type: 'number' | 'string';
    coverage?: number;
}

export interface DataRange {
    min: number;
    max: number;
}
```

#### **5. Web Audio API Cleanup**

Important for React lifecycle:

```typescript
// useAudioCleanup.ts
export function useAudioCleanup() {
    const { audioContext, delayNode, reverbNode } = useAudioStore();
    
    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (delayNode) delayNode.disconnect();
            if (reverbNode) reverbNode.disconnect();
            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close();
            }
        };
    }, [audioContext, delayNode, reverbNode]);
}
```

#### **6. Radix UI Integration**

Use Radix for controls:

```tsx
import * as Slider from '@radix-ui/react-slider';
import * as Select from '@radix-ui/react-select';
import * as Switch from '@radix-ui/react-switch';

// Example: Volume Slider
<Slider.Root
    value={[volume]}
    onValueChange={([value]) => setVolume(value)}
    min={0}
    max={1}
    step={0.01}
    className="w-full"
>
    <Slider.Track className="h-2 bg-gray-200 rounded">
        <Slider.Range className="h-full bg-black rounded" />
    </Slider.Track>
    <Slider.Thumb className="block w-4 h-4 bg-black rounded-full" />
</Slider.Root>

// Example: Waveform Select
<Select.Root value={waveform} onValueChange={setWaveform}>
    <Select.Trigger className="px-4 py-2 border">
        <Select.Value />
    </Select.Trigger>
    <Select.Content>
        <Select.Item value="sine">Sine</Select.Item>
        <Select.Item value="square">Square</Select.Item>
        <Select.Item value="sawtooth">Sawtooth</Select.Item>
        <Select.Item value="triangle">Triangle</Select.Item>
    </Select.Content>
</Select.Root>
```

#### **7. Performance Considerations**

- Move Web Audio operations outside React render cycle
- Use `useMemo` for data range calculations
- Debounce UI slider changes to audio parameters
- Use Web Workers for heavy data processing (prose embeddings)
- Canvas rendering should use `useRef` + `useEffect`, not state

```typescript
// Good: useRef for canvas
const canvasRef = useRef<HTMLCanvasElement>(null);

useEffect(() => {
    if (!canvasRef.current || !analyser) return;
    
    const drawFrame = () => {
        drawVisualizer(canvasRef.current!, analyser);
        animationId = requestAnimationFrame(drawFrame);
    };
    
    const animationId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animationId);
}, [analyser]);

// Bad: state for canvas (causes re-renders)
const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
```

---

## Summary

This document covers:
- ✅ Audio context initialization
- ✅ Effects chain (reverb, delay, filter, pan)
- ✅ Synthesizer mode (oscillators, noise, FM, additive)
- ✅ Sampler mode (buffer playback, pitch, offset, anti-click)
- ✅ Parameter mapping system (paths, ranges, curves)
- ✅ Envelope (ADSR)
- ✅ Playback control
- ✅ Visualization (waveform, node graph)
- ✅ Data processing (extraction, scaling, intelligent mapping)
- ✅ Migration guidance for React/Next.js

All audio logic is documented with code examples ready for migration. The Web Audio API calls remain the same in React - only the state management and component structure change.

