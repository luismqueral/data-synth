# Sonic Experiments - Custom Datasets for Sonification

These datasets are specifically designed for audio sonification. Unlike earthquake or space data, these contain abstract numerical values with Latin-inspired names that create interesting sonic patterns.

---

## 🎵 Dataset Collection

### 1. **Pulsar Vortex** (`pulsar-vortex.json`)
**Theme:** Oscillating energy patterns  
**12 items, 9 fields each**

Fields designed for rhythmic, pulsing sounds:
- `amplitude` (0-1) → Volume variations
- `frequency` (192-640 Hz) → Direct pitch mapping
- `phase` (0-1) → Pan or timing offset
- `resonance` (1-5) → Filter resonance
- `velocity` (0-1) → Attack/release dynamics
- `decay` (0.6-2.4s) → Note duration
- `harmonics` (2-7) → Harmonic content
- `offset` (85-220ms) → Delay time
- `modulation` (0-1) → LFO depth

**Sonic Character:** Rhythmic pulses with varying pitch and timbre

---

### 2. **Nebula Cascade** (`nebula-cascade.json`)
**Theme:** Cosmic cloud formations  
**12 items, 9 fields each**

Fields designed for atmospheric, evolving textures:
- `density` (0-1) → Volume/opacity
- `luminosity` (378-1678) → Brightness/frequency
- `temperature` (1850-5600K) → Timbre/filter cutoff
- `radius` (7-23) → Spatial spread/reverb
- `mass` (1.3-6.8) → Low-end presence
- `rotation` (0-1) → Stereo movement
- `magnetism` (67-378) → Modulation intensity
- `opacity` (0-1) → Clarity/definition
- `drift` (1.9-9.2) → Slow parameter changes

**Sonic Character:** Slow, evolving ambient textures

---

### 3. **Temporal Flux** (`temporal-flux.json`)
**Theme:** Time-based phenomena  
**12 items, 9 fields each**

Fields designed for complex, changing patterns:
- `momentum` (78-389) → Energy/velocity
- `entropy` (0-1) → Chaos/randomness
- `coherence` (0-1) → Harmonic stability
- `dispersion` (11-61) → Spread/width
- `resonance` (0-1) → Filter emphasis
- `threshold` (51-201) → Trigger points
- `variance` (0-1) → Value fluctuation
- `potential` (134-2034) → Peak energy
- `gradient` (0-1) → Rate of change

**Sonic Character:** Dynamic, evolving sequences with clear progression

---

### 4. **Aether Wave** (`aether-wave.json`)
**Theme:** Wave propagation through space  
**12 items, 9 fields each**

Fields designed for wave-like, flowing sounds:
- `oscillation` (0-1) → Primary rhythm
- `wavelength` (267-834) → Frequency spectrum
- `intensity` (0-1) → Amplitude envelope
- `propagation` (9-40) → Delay/timing spread
- `interference` (0-1) → Phase relationships
- `reflection` (0-1) → Feedback amount
- `absorption` (0-1) → Dampening
- `transmission` (76-378) → Filter cutoff
- `refraction` (0-1) → Pitch bend

**Sonic Character:** Flowing, wave-like patterns with interference effects

---

### 5. **Quantum Drift** (`quantum-drift.json`)
**Theme:** Quantum state transitions  
**12 items, 9 fields each**

Fields designed for unpredictable, quantum-like behavior:
- `spin` (-2.5 to 2.5) → Stereo position (negative/positive)
- `charge` (-4 to 4) → Polarity (can be negative!)
- `entanglement` (0-1) → Correlation between parameters
- `superposition` (0-1) → Multiple simultaneous states
- `decoherence` (76-389) → Transition time
- `tunneling` (0-1) → Probability jumps
- `uncertainty` (12-61) → Randomness factor
- `probability` (0-1) → Event likelihood
- `energy` (523-2034) → Overall intensity

**Sonic Character:** Unpredictable, quantum-like state changes

---

## 🎨 Design Philosophy

### Why These Datasets Work for Sonification:

1. **Varied ranges** - Each field has a different numerical range, creating diverse sonic possibilities
2. **Natural distributions** - Values follow realistic patterns (not purely random)
3. **Coherent themes** - Field names suggest sonic relationships
4. **Multiple scales** - Mix of 0-1 normalized values and larger ranges
5. **12 items each** - Enough for patterns, not overwhelming
6. **9 fields each** - Maps well to audio parameters (frequency, duration, pan, etc.)

### Sonification Strategies:

**Pulsar Vortex** → Map `frequency` to pitch, `amplitude` to volume, `decay` to note length  
**Nebula Cascade** → Map `temperature` to filter cutoff, `luminosity` to brightness  
**Temporal Flux** → Map `momentum` to velocity, `entropy` to randomness  
**Aether Wave** → Map `wavelength` to frequency, `interference` to phasing  
**Quantum Drift** → Map `spin` to pan (negative left, positive right), `energy` to intensity  

---

## 🧪 Field Categories

### Normalized (0-1):
Good for: Volume, pan, mix levels, envelope shapes
- amplitude, phase, velocity, modulation
- density, opacity, rotation
- entropy, coherence, resonance, variance
- oscillation, intensity, interference, reflection, absorption, refraction
- entanglement, superposition, tunneling, probability
- curvature, permeability, elasticity

### Medium Range (1-500):
Good for: Frequency, filter cutoff, delay time
- frequency (192-640 Hz)
- luminosity (378-1678)
- momentum (78-389)
- wavelength (267-834)
- decoherence (76-389)
- tension (67-334)
- bandwidth (98-589)

### High Range (500+):
Good for: Frequency (high pitches), intensity, energy
- temperature (1850-5600K)
- potential (134-2034)
- transmission (76-378)
- energy (523-2034)

### Integers:
Good for: Harmonic count, quantized values
- harmonics (2-7)
- symmetry (3-9)
- harmonic (1-10)

### Can Be Negative:
Good for: Pan (L/R), pitch shift
- spin (-2.5 to 2.5)
- charge (-4 to 4)

---

## 💡 Usage Tips

1. **Start with automatic mapping** - Let DataSynth's intelligent mapper suggest connections
2. **Experiment with ranges** - Adjust min/max to find sweet spots
3. **Try different waveforms** - Each dataset sounds different with different synth types
4. **Combine parameters** - Map multiple fields to create complex timbres
5. **Use quantization** - Pitch quantization makes melodic patterns more musical

---

## 🔊 Expected Sonic Results

### Pulsar Vortex
- Rhythmic, pulsing patterns
- Clear pitch sequences (frequency field is pre-scaled to musical range)
- Good for melodic sonification

### Nebula Cascade  
- Slow, evolving ambient textures
- Wide dynamic range (temperature/luminosity)
- Good for atmospheric soundscapes

### Temporal Flux
- Dynamic, changing sequences
- High entropy creates variation
- Good for generative music

### Aether Wave
- Flowing, wave-like movements
- Interference patterns create phasing
- Good for drone/ambient music

### Quantum Drift
- Unpredictable state changes
- Negative values create stereo movement
- Good for experimental/glitch music

---

**Tip:** These datasets are meant to be starting points - modify the values, add fields, or create your own variations!

