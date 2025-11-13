# Manual Testing Checklist

After extracting audio-engine module, verify all functionality still works.

## 🧪 Test Server

```bash
cd "/Users/luisqueral/Library/CloudStorage/GoogleDrive-luismqueral@gmail.com/My Drive/projects/data-synth/data-synth-v1"
python3 -m http.server 5555
```

---

## ✅ Unit Tests

### Data Processor Module
**URL**: `http://localhost:5555/test/data-processor.test.html`

**Expected**:
- [ ] 25/25 tests passing
- [ ] All green checkmarks
- [ ] No console errors

### Audio Engine Module  
**URL**: `http://localhost:5555/test/audio-engine.test.html`

**Expected**:
- [ ] Click "Run Audio Tests" button
- [ ] 19/19 tests passing
- [ ] AudioContext initialized message in console
- [ ] No errors about missing methods

### Integration Verification
**URL**: `http://localhost:5555/test/integration-verification.html`

**Expected**:
- [ ] Loads real earthquake data
- [ ] Shows paths extracted
- [ ] Shows magnitude analysis
- [ ] Displays recommended curve
- [ ] Green "Integration Test: PASSED" message

---

## 🎵 Full Application Tests

**URL**: `http://localhost:5555/json-mapper-v2.html`

### Console Verification

**Expected on page load**:
```
✅ Loaded data-processor.js module
✅ Loaded audio-engine.js module
```

- [ ] Both module load messages appear
- [ ] No import errors
- [ ] No "function not defined" errors

### Dataset Loading

- [ ] Dataset dropdown populates
- [ ] Select "All Earthquakes: Past Day"
- [ ] Console shows: "Loaded earthquake data"
- [ ] Console shows: "Detected numeric paths"
- [ ] Patch visualization draws nodes and connections
- [ ] No errors in console

### Synthesizer Mode Tests

**Test 1: Basic Playback**
- [ ] Click "Play Data" button
- [ ] Console shows: "✅ AudioContext created"
- [ ] Console shows: "✅ Effects chain initialized"
- [ ] **Sound plays** (synthesized tones)
- [ ] Waveform visualizer animates (black line moving)
- [ ] Item counter updates (1 / N, 2 / N, etc.)
- [ ] Patch visualization highlights active nodes (light blue)
- [ ] Connection lines turn yellow/black dashed
- [ ] No clicks or pops at note boundaries
- [ ] No console errors during playback

**Test 2: Waveform Types**
- [ ] Open "Global Settings" drawer
- [ ] Try each waveform:
  - [ ] Sine (smooth, pure tone)
  - [ ] Square (buzzy, harsh)
  - [ ] Sawtooth (bright, string-like)
  - [ ] Triangle (soft, hollow)
  - [ ] White Noise (static hiss)
  - [ ] Pink Noise (balanced static)
  - [ ] Brown Noise (warm rumble)
  - [ ] FM Synthesis (metallic, bell-like)
  - [ ] Additive (rich, organ-like)
- [ ] Each waveform sounds different
- [ ] No errors when switching

**Test 3: Effects Chain**
- [ ] Delay audible (echoes repeating)
- [ ] Reverb audible (spacious sound)
- [ ] Filter affects tone (sweep filterFreq mapping)
- [ ] Pan moves sound left/right
- [ ] Effects don't cause distortion

**Test 4: Randomize Mappings**
- [ ] Click "🔀 Randomize Patch" button
- [ ] Patch visualization updates
- [ ] Play Data again
- [ ] Sound is different (new mappings applied)
- [ ] No errors

### Sampler Mode Tests

**Test 5: Load Audio Sample**
- [ ] Open "Global Settings" drawer  
- [ ] Select "🎵 Sampler" mode
- [ ] Sample upload section appears
- [ ] Click "Load Audio Sample"
- [ ] Upload a WAV or MP3 file
- [ ] Console shows: "✅ Sample loaded: X.XXs"
- [ ] Sample info displays (duration, channels, sample rate)
- [ ] No errors

**Test 6: Sampler Playback**
- [ ] Click "Play Data" button
- [ ] **Sound plays** (audio sample triggered)
- [ ] Different magnitudes trigger sample at different pitches
- [ ] Sample offset varies (different start positions)
- [ ] Waveform visualizer shows sample audio
- [ ] No clicks between samples
- [ ] No console errors

**Test 7: Random Chop Mode**
- [ ] Enable "🎲 Random Chop Mode" checkbox
- [ ] Play Data
- [ ] Each note plays 5-second chunk from random position
- [ ] Varied playback (not same section every time)
- [ ] No errors

**Test 8: Clear Sample**
- [ ] Click "Clear Sample" button
- [ ] Console shows: "🗑️ Sample cleared"
- [ ] Sample info disappears
- [ ] Switch back to Synthesizer mode
- [ ] Synthesizer plays normally

### Visualization Tests

**Test 9: Waveform Visualizer**
- [ ] Visualizer shows during playback
- [ ] Black waveform line on gray background
- [ ] Line moves/animates smoothly
- [ ] Responds to volume changes
- [ ] Disappears when playback stops
- [ ] No flickering or artifacts

**Test 10: Patch Visualization**
- [ ] Nodes appear for all detected paths
- [ ] Connection lines drawn between mapped paths
- [ ] Active connections highlight (yellow/black dashed)
- [ ] Node values update during playback
- [ ] Progress bars fill at bottom of audio nodes
- [ ] Click connection line opens editor
- [ ] Can edit min/max/curve
- [ ] Changes apply immediately

### Edge Cases

**Test 11: Stop Playback**
- [ ] Click stop button during playback
- [ ] Sound stops immediately
- [ ] Visualizer animation stops
- [ ] Node highlights clear
- [ ] No errors in console
- [ ] Can restart playback

**Test 12: Upload Custom Dataset**
- [ ] Drag & drop JSON file
- [ ] Parses correctly
- [ ] Paths extracted
- [ ] Can play data
- [ ] No errors

**Test 13: Mobile Responsive**  
- [ ] Resize browser window to mobile size
- [ ] Layout adapts
- [ ] Buttons still work
- [ ] Patch viz scrolls horizontally
- [ ] No UI breakage

---

## 🚨 Common Issues & Fixes

### "AudioContext not initialized"
- **Cause**: Browser requires user interaction
- **Fix**: Click Play button (initializes on first click)

### "Module not found"
- **Cause**: Not running from local server
- **Fix**: Use `python3 -m http.server 5555` (not file://)

### "Function is not defined"
- **Cause**: Old browser or ES6 modules not supported
- **Fix**: Use modern browser (Chrome 61+, Firefox 60+, Safari 11+)

### No sound playing
- **Cause**: Volume too low or effects misconfigured
- **Fix**: Check master volume slider, verify effects chain initialized

### Clicks/pops between notes
- **Cause**: Attack/release times too short
- **Fix**: Module includes anti-click protection (3ms minimum for samples)

---

## 📋 Success Criteria

**All tests above should pass** with:
- ✅ No console errors
- ✅ Smooth audio playback
- ✅ Visualizations working
- ✅ All modes functional (synth/sampler)
- ✅ Effects audible
- ✅ Module load messages in console

**If everything passes**:
- Modules are working correctly ✅
- Ready to extract next module (parameter-mapper.js)

**If tests fail**:
- Check console for specific errors
- Verify running on local server (not file://)
- Check browser compatibility (ES6 modules required)
- Review git diff to see what changed

