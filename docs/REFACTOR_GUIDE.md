# DataSynth Refactoring Guide

**Status**: Active refactoring in progress  
**Goal**: Transform `json-mapper-v2.html` (3422 lines) into modular ES6 architecture  
**Timeline**: 2-3 weeks  
**Branch**: `refactor`

---

## 🎯 Refactoring Principles

These are **temporary rules** specific to the migration. Once refactoring is complete, follow the general development rules in `.cursor/rules/datasynth-dev-rules.mdc`.

### Golden Rules During Migration

1. **Keep the original HTML working** - It's the source of truth until migration is complete
2. **Extract as-is, refactor later** - Don't improve logic while extracting (do it after)
3. **Test after each module** - Never extract multiple modules without verifying each one works
4. **Keep both versions temporarily** - Original function stays in HTML until module is confirmed working
5. **One module at a time** - Resist the urge to extract everything at once

---

## 📦 Migration Steps

### Step-by-Step Process

1. **Identify module boundary** - Find logical grouping of functions
2. **Create module file** - `lib/module-name.js`
3. **Copy functions exactly** - Don't modify, just extract
4. **Add exports** - Mark what's public API
5. **Create test file** - Verify module works in isolation
6. **Update HTML** - Import and use module
7. **Manual browser test** - Load the page, click buttons, verify nothing broke
8. **Remove old code** - Delete original functions from HTML
9. **Commit** - Save working state before next module
10. **Repeat** - Move to next module

---

## 🗺️ Module Extraction Order

Extract in this order (dependencies flow downward):

### Phase 1: Pure Functions (Week 1)

**Module**: `lib/data-processor.js`  
**Lines**: ~1492-1628, 1813-2068 from HTML  
**Functions**:
- `getValueByPath()`
- `safeId()`
- `extractPaths()`
- `extractValues()`
- `analyzeDataVariance()`

**Why first**: No dependencies, pure functions, easy to test

---

### Phase 2: Audio Core (Week 1-2)

**Module**: `lib/audio-engine.js`  
**Lines**: ~1401-1490, 2731-2778 from HTML  
**Functions**:
- `createCustomOscillator()`
- `createNoiseBuffer()`
- `createReverbImpulse()`
- `initEffects()`
- Effects chain setup

**Why second**: Core functionality, depends on nothing

---

### Phase 3: Parameter Mapping (Week 2)

**Module**: `lib/parameter-mapper.js`  
**Lines**: ~1694-1811 from HTML  
**Functions**:
- `getAudioParams()`
- `intelligentMapping()`
- Curve functions (linear, exponential, logarithmic, etc.)

**Depends on**: `data-processor.js`

---

### Phase 4: Visualization (Week 2)

**Module**: `lib/visualizer.js`  
**Lines**: ~2780-2865 from HTML  
**Functions**:
- Canvas waveform drawing
- Real-time audio visualization
- Animation loop

**Depends on**: `audio-engine.js`

---

### Phase 5: Patch Visualization (Week 2)

**Module**: `lib/patch-viz.js`  
**Lines**: ~2167-2729 from HTML  
**Functions**:
- D3.js node graph
- Connection rendering
- Interactive editing

**Depends on**: `parameter-mapper.js`

---

### Phase 6: UI Controller (Week 3)

**Module**: `lib/ui-controller.js`  
**Lines**: Event handlers throughout HTML  
**Functions**:
- Button click handlers
- Form submissions
- UI updates
- Glue code

**Depends on**: Everything (coordinates all modules)

---

## 🧪 Testing Strategy

### Per-Module Tests

Create `test/module-name.test.html` for each module:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Module Name Tests</title>
    <style>
        .pass { color: green; }
        .fail { color: red; }
    </style>
</head>
<body>
    <h1>Module Name Tests</h1>
    <div id="results"></div>
    
    <script type="module">
        import { functionName } from '../lib/module-name.js';
        
        const results = [];
        
        // Test cases
        const test1 = functionName(input) === expectedOutput;
        results.push({ name: 'Test description', pass: test1 });
        
        // Display results
        const resultsDiv = document.getElementById('results');
        results.forEach(result => {
            const div = document.createElement('div');
            div.className = result.pass ? 'pass' : 'fail';
            div.textContent = `${result.pass ? '✅' : '❌'} ${result.name}`;
            resultsDiv.appendChild(div);
        });
        
        console.log(`${results.filter(r => r.pass).length}/${results.length} passed`);
    </script>
</body>
</html>
```

### Manual Verification Checklist

After each module extraction, verify these still work:

```
□ Page loads without console errors
□ Dataset selector populates with options
□ Can select "All Earthquakes: Past Day"
□ Data loads and parses (check parseStatus div)
□ Numeric paths detected (check console logs)
□ Play button becomes enabled
□ Click "Randomize Mappings" works
□ Patch visualization draws
□ Can click connection lines to edit
□ Audio plays when clicking Play button
□ Waveform visualizer animates
□ Can upload custom dataset (drag & drop)
□ Sampler mode toggle works
□ All sliders update parameters
```

### Behavior Comparison Test

Compare old vs new to ensure identical behavior:

```javascript
// Take "snapshot" before refactoring
const testDataset = [...]; // Sample data
const originalPaths = extractPaths(testDataset); // From HTML version

// After module extraction
import { extractPaths } from './lib/data-processor.js';
const newPaths = extractPaths(testDataset);

// Should be identical
console.assert(
    JSON.stringify(originalPaths) === JSON.stringify(newPaths),
    'Paths extraction matches original'
);
```

---

## 🔄 Git Workflow During Refactoring

### Branch Strategy

```bash
# Create refactor branch from main
git checkout -b refactor

# After each successful module:
git add lib/module-name.js test/module-name.test.html index.html
git commit -m "refactor: extract module-name module"

# When all modules complete and tested:
git checkout main
git merge refactor
git branch -d refactor
```

### Commit Message Format

```bash
git commit -m "refactor: extract [module-name] module

- moved [function1, function2] to lib/[module-name].js
- added unit tests in test/[module-name].test.html
- updated index.html to import module
- all existing functionality preserved
- tests passing: X/X"
```

### Example Commits

```bash
# First module
git commit -m "refactor: extract data-processor module

- moved getValueByPath, extractPaths, analyzeDataVariance to lib/data-processor.js
- added unit tests in test/data-processor.test.html
- updated index.html to import module
- all existing functionality preserved
- tests passing: 5/5"

# Second module
git commit -m "refactor: extract audio-engine module

- moved createCustomOscillator, initEffects to lib/audio-engine.js
- created AudioEngine class to encapsulate audio state
- added unit tests in test/audio-engine.test.html
- updated index.html to use AudioEngine instance
- all existing functionality preserved
- tests passing: 8/8"
```

---

## 🚨 Common Mistakes During Refactoring

### ❌ Mistake 1: Refactoring Logic While Extracting

```javascript
// ❌ WRONG - Changing behavior during extraction
export const getValueByPath = (obj, path) => {
    // Let me add caching while I'm here...
    if (this.cache[path]) return this.cache[path];
    // ... NEW CODE ...
};

// ✅ RIGHT - Extract exactly as-is
export const getValueByPath = (obj, path) => {
    // Exact copy from original HTML
    return path.split('.').reduce((curr, key) => curr[key], obj);
};
```

**Why**: If something breaks, you won't know if it's the extraction or the refactor.

---

### ❌ Mistake 2: Deleting Original Before Verifying

```javascript
// ❌ WRONG sequence:
// 1. Create module
// 2. Delete original function from HTML
// 3. Test... oops, imports not working

// ✅ RIGHT sequence:
// 1. Create module
// 2. Import in HTML (keep original function)
// 3. Test that module works
// 4. Remove original function
// 5. Test again
```

---

### ❌ Mistake 3: Extracting Multiple Modules Without Testing

```javascript
// ❌ WRONG - Extract 3 modules at once
// Create data-processor.js ✅
// Create audio-engine.js ✅
// Create parameter-mapper.js ✅
// Test... which one broke it?

// ✅ RIGHT - Extract one, test, then next
// Create data-processor.js ✅
// Test data-processor.js ✅ (works!)
// Commit ✅
// Create audio-engine.js ✅
// Test audio-engine.js ✅ (works!)
// Commit ✅
```

---

### ❌ Mistake 4: Adding Dependencies Prematurely

```javascript
// ❌ WRONG - Installing packages during refactor
npm install lodash moment axios

// ✅ RIGHT - Keep dependencies unchanged
// Only use what's already in the HTML
// (D3.js from CDN, vanilla JS)
```

---

## 🎯 Success Criteria

### After Each Module Extraction:

- [ ] Module file created with clear exports
- [ ] Test file created with at least 3 test cases
- [ ] All tests passing
- [ ] Original HTML updated to import module
- [ ] Manual browser test confirms nothing broke
- [ ] Console shows no errors
- [ ] Performance unchanged (check load time)
- [ ] Original functions removed from HTML
- [ ] Changes committed to git

### After Complete Refactoring:

- [ ] All modules under 400 lines
- [ ] `index.html` under 500 lines (just structure + imports)
- [ ] 100% feature parity with original HTML
- [ ] All modules have passing tests
- [ ] Load time unchanged or faster
- [ ] No new dependencies added
- [ ] Still deployable as static files
- [ ] Code is more maintainable
- [ ] Documentation updated
- [ ] Can delete `json-mapper-v2.html.backup`

---

## 🔧 Rollback Strategy

If something breaks:

```bash
# Immediate rollback - restore original HTML
cp json-mapper-v2.html.backup json-mapper-v2.html

# Or revert specific module
git checkout HEAD -- lib/module-name.js index.html

# Or revert entire commit
git revert HEAD
```

**Always keep `json-mapper-v2.html.backup` until refactoring is 100% complete and tested.**

---

## 📅 Progress Tracking

Update this as you complete each module:

- [ ] Setup (folders, backup, branch created)
- [ ] `lib/data-processor.js` - Pure data functions
- [ ] `lib/audio-engine.js` - Web Audio API coordination
- [ ] `lib/parameter-mapper.js` - Data → audio mapping
- [ ] `lib/visualizer.js` - Canvas waveform
- [ ] `lib/patch-viz.js` - D3 node graph
- [ ] `lib/ui-controller.js` - Event handlers
- [ ] `main.js` - Initialization glue
- [ ] Final integration testing
- [ ] Delete original HTML
- [ ] Merge to main
- [ ] Deploy and verify production

---

## 🎓 Learning Resources

If you get stuck during refactoring:

**ES6 Modules:**
- [MDN: JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

**Web Audio API:**
- [MDN: Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- Existing: `docs/AUDIO_ENGINE_DOCUMENTATION.md`

**D3.js Patterns:**
- [D3 General Update Pattern](https://d3js.org/d3-selection/joining)

**Testing:**
- Keep it simple - just assertions in HTML files
- No need for Jest/Mocha during refactoring

---

## ✅ When Refactoring is Complete

1. Delete this file (`docs/REFACTOR_GUIDE.md`)
2. Delete `json-mapper-v2.html` and `.backup`
3. Update `README.md` to reflect new structure
4. Follow only `datasynth-dev-rules.mdc` going forward
5. Celebrate! 🎉

**Remember**: The goal is **better organization**, not **new features**. Save new features for after refactoring is complete.

