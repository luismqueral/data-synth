# Quick Start Guide - DataSynth Next.js

## Prerequisites

**Node.js 20.9.0 or higher required**

Check your version:
```bash
node --version
```

If you need to upgrade:
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download from nodejs.org
```

---

## Installation

```bash
# Navigate to the Next.js project
cd datasynth-next

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Usage

1. **Select a dataset** from the dropdown (or use the default earthquakes feed)
2. **Click Play** to hear the data as sound
3. **Adjust settings** in the Global Settings drawer
4. **View the patch** to see data-to-audio mappings
5. **Click Randomize** to try different mappings

---

## Compared to Original

| Feature | Original HTML | Next.js Version |
|---------|---------------|-----------------|
| Audio engine | ✅ | ✅ Same code |
| Data processing | ✅ | ✅ Same logic |
| UI framework | Vanilla JS | React |
| State management | Global variables | Zustand |
| Styling | Tachyons | Tailwind |
| Plugin system | ❌ | ✅ Full support |
| Type safety | ❌ | ✅ TypeScript |

---

## What's Different?

### Better
- ✅ Plugin architecture for extensibility
- ✅ Type safety with TypeScript
- ✅ Modern React patterns
- ✅ Better state management
- ✅ Hot module reloading
- ✅ Accessibility (Radix UI)

### Same
- ✅ Audio processing (Web Audio API)
- ✅ Visual design (IBM Plex Mono, minimalist)
- ✅ Data processing algorithms
- ✅ All effects (reverb, delay, filter)
- ✅ Synth and Sampler modes

### Planned
- ⏳ Drag-and-drop upload
- ⏳ Global paste support
- ⏳ Connection editing modal
- ⏳ Data table modal
- ⏳ Additional plugins
- ⏳ Export functionality

---

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

---

## Troubleshooting

### "Node version error"
**Solution:** Upgrade to Node 20+
```bash
nvm install 20
nvm use 20
```

### "Module not found"
**Solution:** Install dependencies
```bash
npm install
```

### "Page won't load"
**Solution:** Clear Next.js cache
```bash
rm -rf .next
npm run dev
```

---

## Next Steps

1. Test with different datasets
2. Try both Synthesizer and Sampler modes
3. Experiment with different waveforms and effects
4. Compare to original HTML version
5. Report any issues or missing features

---

**Happy Sonifying! 🎵**

