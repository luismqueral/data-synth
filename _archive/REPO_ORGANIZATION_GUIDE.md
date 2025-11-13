# Repository Organization Guide

**How to structure DataSynth v1 (HTML) and v2 (Next.js)**

---

## 🎯 The Question

Should you:
- **A)** Keep both in same repo? (`data-synth` + `data-synth-v2` folders)
- **B)** Separate into two repos? (`data-synth` and `data-synth-v2`)
- **C)** Use monorepo with shared code?

---

## 📊 Option Comparison

| Aspect | Same Repo (2 folders) | Separate Repos | Monorepo (shared) |
|--------|----------------------|----------------|-------------------|
| **Setup complexity** | Low | Low | Medium |
| **Code sharing** | Copy-paste | None | Automatic |
| **Independent deployment** | Medium | Easy | Easy |
| **Learning curve** | Low | Low | High |
| **Version control** | Shared history | Clean separation | Shared + isolated |
| **CI/CD** | One config | Two configs | Complex but powerful |
| **Dependencies** | Can conflict | Independent | Managed centrally |
| **Best for** | Learning, comparison | Production split | Shared libraries |

---

## 🏆 My Recommendation: **Same Repo, Two Folders**

For your situation (learning + evolution), I recommend:

```
data-synth/
├── data-synth-v1/          # Original HTML version
│   ├── index.html          # Original single file
│   ├── datasets/
│   └── README.md
│
├── data-synth-v2/          # Next.js version  
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── shared/                 # Optional: shared assets/docs
│   └── datasets/           # Datasets both can use
│
├── docs/                   # Shared documentation
│   ├── ARCHITECTURE_*.md
│   └── guides/
│
├── README.md               # Root README (explains both)
└── CHANGELOG.md            # Shared changelog
```

---

## ✅ Why Same Repo?

### **1. Learning Benefits**

**Easy Comparison:**
```bash
# See both implementations side-by-side
git diff data-synth-v1/index.html data-synth-v2/src/core/audio/AudioEngine.ts
```

**Shared History:**
- See how features evolved from v1 → v2
- Learn from your own progression
- Document design decisions in one place

**Reference Original:**
- When implementing in v2, easily check v1
- Copy proven logic
- Ensure feature parity

### **2. Practical Benefits**

**Single Clone:**
```bash
git clone your-repo
# Get both versions immediately
```

**Shared Documentation:**
- One changelog covering both
- Architecture docs reference both
- Comparison guides make sense

**Unified Datasets:**
- Both use same earthquake data
- Both use same exoplanets CSV
- No duplication

**One Issue Tracker:**
- Bug in v1? File issue
- Feature request for v2? Same place
- Cross-reference between versions

### **3. Deployment Benefits**

**Separate Deployments:**
```
v1: yoursite.com          (GitHub Pages)
v2: yoursite.com/v2       (Vercel)
```

Or:
```
v1: data-synth.vercel.app
v2: data-synth-v2.vercel.app
```

Both from same repo!

### **4. Branding Benefits**

**Unified Project:**
- "DataSynth" = the project
- v1 = lightweight version
- v2 = plugin version
- Users choose what fits their needs

**Clear Evolution:**
- Shows progression
- Shows you iterate
- Shows you learn
- Shows mastery of both approaches

---

## ❌ Why NOT Separate Repos?

### **Disadvantages:**

**1. Duplication**
- Two READMEs to maintain
- Two CHANGELOGs to update
- Two issue trackers to monitor
- Datasets duplicated

**2. Lost Context**
- Hard to reference original when building v2
- Design decisions forgotten
- No shared history

**3. Discovery Problem**
- Users find one, miss the other
- "Why are there two repos?"
- Confusion about which to use

**4. Maintenance Overhead**
- Two repos to update
- Two sets of CI/CD
- Two places for docs
- Twice the work

---

## ⚖️ When Separate Repos Make Sense

### **Use Separate Repos If:**

✅ **Completely different audiences**
- v1 for creative coders
- v2 for enterprises
- Different branding

✅ **Different teams**
- Team A maintains v1
- Team B maintains v2
- No overlap

✅ **One is deprecated**
- v1 is frozen, archived
- v2 is only active development
- Clean break

✅ **Different licenses**
- v1 is MIT
- v2 is proprietary
- Legal separation needed

✅ **Different business models**
- v1 is free/open source
- v2 is commercial/paid
- Organizational separation

**None of these apply to you right now!**

---

## 🎨 Recommended Structure

### **Root Layout**

```
data-synth/                    # Repo root
├── README.md                  # "DataSynth - Two Versions"
├── CHANGELOG.md               # Unified changelog
│
├── data-synth-v1/             # Lightweight version
│   ├── index.html             # Original single file
│   ├── json-mapper-v2.html    # Latest v1
│   ├── README.md              # "Lightweight HTML Version"
│   └── .gitignore
│
├── data-synth-v2/             # Plugin platform
│   ├── src/                   # Next.js source
│   ├── public/
│   ├── package.json
│   ├── README.md              # "Next.js Plugin Platform"
│   └── ...
│
├── datasets/                  # Shared datasets
│   ├── earthquakes-week.geojson
│   ├── exoplanets.csv
│   └── guides/
│
├── docs/                      # Shared documentation
│   ├── architecture/
│   │   ├── AUDIO_ENGINE_DOCUMENTATION.md
│   │   ├── NEXTJS_ARCHITECTURE.md
│   │   └── FRAMEWORK_AGNOSTIC_ARCHITECTURE.md
│   │
│   └── guides/
│       ├── PROSE_EMBEDDINGS_GUIDE.md
│       └── comparison/
│           └── SINGLE_FILE_VS_NEXTJS.md
│
└── .github/                   # Shared GitHub config
    └── workflows/
        ├── deploy-v1.yml      # Deploy HTML to GitHub Pages
        └── deploy-v2.yml      # Deploy Next.js to Vercel
```

### **Root README.md**

```markdown
# DataSynth

Turn any dataset into sound. Available in two versions:

## 🎵 Version 1: Lightweight (HTML)
**Best for:** Quick use, portability, learning, sharing

- Single HTML file
- No build step
- Works anywhere
- [Open v1 →](data-synth-v1/)

## 🔌 Version 2: Platform (Next.js)
**Best for:** Extensibility, team collaboration, production

- Plugin architecture
- TypeScript + React
- Modern tooling
- [Open v2 →](data-synth-v2/)

## Quick Start

### V1 (Instant)
```bash
python3 -m http.server 5555
# Open http://localhost:5555/data-synth-v1/
```

### V2 (Modern)
```bash
cd data-synth-v2
npm install
npm run dev
# Open http://localhost:3000
```

## Documentation
See [docs/](docs/) for complete guides.
```

---

## 🔄 Migration Plan

### From Current State

You currently have:
```
json-to-sound-v1/
├── index.html
├── json-mapper-v2.html
├── datasynth-next/         # Next.js version
├── datasets/
└── docs (various .md files)
```

### Reorganize To:

```bash
# 1. Create v1 folder
mkdir data-synth-v1

# 2. Move v1 files
mv index.html data-synth-v1/
mv json-mapper-v2.html data-synth-v1/
mv metrics.json data-synth-v1/
mv Settings.json data-synth-v1/
mv NODE_BASED_INTERFACE_GUIDE.md data-synth-v1/

# 3. Rename Next.js folder
mv datasynth-next data-synth-v2

# 4. Create docs folder
mkdir docs
mv ARCHITECTURE_*.md docs/
mv AUDIO_ENGINE_DOCUMENTATION.md docs/
mv NEXTJS_ARCHITECTURE.md docs/
mv FRAMEWORK_AGNOSTIC_ARCHITECTURE.md docs/
mv SINGLE_FILE_VS_NEXTJS.md docs/

# 5. Keep at root
# - README.md (update to explain both versions)
# - CHANGELOG.md (unified)
# - datasets/ (shared)
# - vercel.json (for deployment)

# 6. Create v1 and v2 READMEs
# (explain each version)
```

---

## 🎯 Benefits of This Organization

### **1. Clear Separation**
- v1 has its own folder (self-contained)
- v2 has its own folder (independent)
- Shared resources at root (datasets, docs)

### **2. Easy to Navigate**
```
Want v1? → cd data-synth-v1
Want v2? → cd data-synth-v2
Want docs? → cd docs
```

### **3. Independent Deployment**
```yaml
# .github/workflows/deploy-v1.yml
Deploy data-synth-v1/ to GitHub Pages

# .github/workflows/deploy-v2.yml  
Deploy data-synth-v2/ to Vercel
```

### **4. Shared Resources**
```
datasets/           # Both versions use same data
docs/              # One set of architecture docs
CHANGELOG.md       # One history
```

### **5. Learning-Friendly**
- Compare implementations easily
- Reference v1 while building v2
- Document differences
- Show progression

---

## 🚀 Deployment Strategy

### **V1 (HTML) → GitHub Pages**

```yaml
# .github/workflows/deploy-v1.yml
name: Deploy V1 to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'data-synth-v1/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./data-synth-v1
```

**URL:** `https://yourusername.github.io/data-synth/`

### **V2 (Next.js) → Vercel**

**Option A: Vercel Dashboard**
- Import repo
- Set Root Directory: `data-synth-v2`
- Auto-deploys on push

**Option B: Vercel CLI**
```bash
cd data-synth-v2
vercel --prod
```

**URL:** `https://data-synth-v2.vercel.app`

### **Result: Both Live!**

```
V1: https://yourusername.github.io/data-synth/
V2: https://data-synth-v2.vercel.app

Users can choose based on needs!
```

---

## 📋 Implementation Checklist

### Phase 1: Reorganize (30 minutes)

- [ ] Create `data-synth-v1/` folder
- [ ] Move original HTML files to v1
- [ ] Rename `datasynth-next/` → `data-synth-v2/`
- [ ] Create `docs/` folder
- [ ] Move architecture docs to `docs/`
- [ ] Update root `README.md` to explain both versions
- [ ] Create v1 and v2 READMEs
- [ ] Test both still work

### Phase 2: Update Links (15 minutes)

- [ ] Update internal links in READMEs
- [ ] Update dataset paths in v1
- [ ] Update dataset paths in v2 (already uses `/datasets/`)
- [ ] Update vercel.json path
- [ ] Test all links work

### Phase 3: Git Cleanup (10 minutes)

```bash
git add .
git commit -m "refactor: organize into v1 and v2 folders"
git push
```

### Phase 4: Deploy (20 minutes)

- [ ] Deploy v1 to GitHub Pages
- [ ] Deploy v2 to Vercel (set Root Directory)
- [ ] Test both deployments
- [ ] Update READMEs with live URLs

**Total time: ~75 minutes**

---

## 🤔 Alternative: Monorepo with Shared Code

If you want to **share code between versions** (advanced):

```
data-synth/
├── packages/
│   ├── core/               # Shared core logic
│   │   ├── audio/
│   │   ├── data/
│   │   └── package.json
│   │
│   ├── v1/                 # HTML version
│   │   └── index.html
│   │
│   └── v2/                 # Next.js version
│       ├── src/
│       └── package.json
│
├── package.json            # Root package.json (workspaces)
└── turbo.json              # Turborepo config (optional)
```

**Benefits:**
- Share core logic
- Both use same AudioEngine
- Update once, both benefit

**Costs:**
- More complex setup
- Need monorepo tools (pnpm/yarn workspaces or Turborepo)
- Steeper learning curve

**Verdict:** Overkill for now, but good for later if v1 and v2 converge

---

## 🎯 My Recommendation

### **For You Right Now:**

**Same Repo, Two Folders** ✅

```
data-synth/  (keep current repo name)
├── data-synth-v1/          # Lightweight HTML
├── data-synth-v2/          # Next.js platform
├── datasets/               # Shared data
├── docs/                   # Shared docs
├── README.md               # Explains both
└── CHANGELOG.md            # Unified history
```

**Why?**
1. ✅ Easy to reorganize (just move folders)
2. ✅ Share datasets and docs
3. ✅ One git history (see evolution)
4. ✅ Easy to compare versions
5. ✅ Simple for learning
6. ✅ Can deploy both independently
7. ✅ Low overhead

**When to split into separate repos:**
- When v2 becomes commercial (different business model)
- When different teams maintain them (different ownership)
- When one is archived (v1 frozen, v2 active only)
- When licenses differ (v1 open source, v2 proprietary)

**None of these apply yet!**

---

## 📝 Naming Conventions

### Option A: Versioned (Clear)
```
data-synth-v1/    # "Version 1"
data-synth-v2/    # "Version 2"
```

**Pros:** Clear what's what  
**Cons:** Implies v1 is "old/deprecated"

### Option B: Named by Approach (Better)
```
data-synth-lite/     # or "html", "classic", "portable"
data-synth-pro/      # or "platform", "next", "modern"
```

**Pros:** Both feel valid, not deprecated  
**Cons:** Less clear which is which

### Option C: Named by Use Case (Best)
```
data-synth-portable/    # Single file, works anywhere
data-synth-platform/    # Plugin system, for teams
```

**Pros:** Describes purpose, not age  
**Cons:** Longer names

### My Pick: **Option A with Clarification**

```
data-synth-v1/         # Lightweight HTML version
data-synth-v2/         # Plugin platform (Next.js)
```

But in README, emphasize:
- **v1 is NOT deprecated** - it's the portable version
- **v2 is NOT replacing v1** - it's the extensible version
- **Both are actively maintained** (if true)

---

## 🔧 Implementation Steps

### Step 1: Reorganize Folders

```bash
cd /path/to/json-to-sound-v1

# Create v1 directory
mkdir data-synth-v1

# Move v1 files
mv index.html data-synth-v1/
mv json-mapper-v2.html data-synth-v1/
mv metrics.json data-synth-v1/ 2>/dev/null || true
mv Settings.json data-synth-v1/ 2>/dev/null || true
mv NODE_BASED_INTERFACE_GUIDE.md data-synth-v1/

# Rename Next.js folder
mv datasynth-next data-synth-v2

# Create docs directory  
mkdir docs

# Move docs
mv ARCHITECTURE_SUMMARY.md docs/
mv AUDIO_ENGINE_DOCUMENTATION.md docs/
mv NEXTJS_ARCHITECTURE.md docs/
mv FRAMEWORK_AGNOSTIC_ARCHITECTURE.md docs/
mv SINGLE_FILE_VS_NEXTJS.md docs/
mv NEXTJS_MIGRATION_SUMMARY.md docs/
mv SERVER_RUNNING.md docs/
mv VERCEL_DEPLOYMENT.md docs/
mv REPO_ORGANIZATION_GUIDE.md docs/

# Keep at root: README.md, CHANGELOG.md, datasets/, vercel.json
```

### Step 2: Create Version-Specific READMEs

Create `data-synth-v1/README.md`:
```markdown
# DataSynth v1 - Lightweight HTML Version

**Portable, single-file data sonification tool**

## Features
- ✅ One HTML file, works anywhere
- ✅ No build step, no dependencies
- ✅ 9 waveforms, full effects chain
- ✅ Real-time earthquake feeds
- ✅ ~3,400 lines of pure JavaScript

## Quick Start
```bash
python3 -m http.server 5555
# Open http://localhost:5555/json-mapper-v2.html
```

## Why Use V1?
- Maximum portability
- No Node.js required
- Educational (see all code at once)
- Perfect for demos/sharing

## Docs
See [../docs/](../docs/) for architecture guides.
```

Create `data-synth-v2/README.md`:
```markdown
# DataSynth v2 - Plugin Platform

**Extensible data sonification with modern architecture**

## Features
- ✅ Plugin system (6 plugin types)
- ✅ TypeScript + React + Next.js
- ✅ Framework-agnostic core
- ✅ Same audio engine as v1
- ✅ Radix UI + Tailwind

## Quick Start
```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Why Use V2?
- Plugin extensibility
- Type safety
- Team collaboration
- Modern DX

## Docs
See [../docs/](../docs/) for complete guides.
```

### Step 3: Update Root README

```markdown
# DataSynth

Turn any dataset into sound. Choose your version:

## 🎵 [V1: Lightweight](data-synth-v1/)
**Single HTML file. Works anywhere. No setup.**

Perfect for:
- Quick experiments
- Sharing/teaching  
- Maximum portability
- Personal projects

[View V1 →](data-synth-v1/) | [Try Live](https://your-link)

## 🔌 [V2: Platform](data-synth-v2/)
**Plugin architecture. TypeScript. Production-ready.**

Perfect for:
- Team projects
- Plugin development
- Long-term maintenance
- Professional deployment

[View V2 →](data-synth-v2/) | [Try Live](https://your-link)

## Comparison

| Feature | V1 (HTML) | V2 (Next.js) |
|---------|-----------|--------------|
| Setup | None | npm install |
| Dependencies | 0 | 480 packages |
| File count | 1 | 23 |
| Type safety | No | Yes (TypeScript) |
| Plugins | No | Yes (6 types) |
| Bundle size | ~100KB | ~500KB |
| Portability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Extensibility | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## Documentation
Complete guides in [docs/](docs/)
```

### Step 4: Commit

```bash
git add .
git commit -m "refactor: organize into v1 (HTML) and v2 (Next.js) folders"
git push
```

---

## 🌐 Deployment URLs

### After Reorganization:

**V1 (GitHub Pages):**
```
https://yourusername.github.io/data-synth/data-synth-v1/
```

**V2 (Vercel):**
```
Settings → Root Directory: data-synth-v2
https://data-synth-v2.vercel.app
```

Or use custom domains:
```
v1.datasynth.io  → GitHub Pages (v1)
app.datasynth.io → Vercel (v2)
```

---

## ✅ Advantages of This Structure

### **For You (Developer)**
1. Clear organization
2. Easy to find things
3. Easy to compare versions
4. Shared docs/datasets
5. One git history

### **For Users**
1. Can choose version based on needs
2. Both easily accessible
3. Clear what each offers
4. Smooth upgrade path (v1 → v2)

### **For Contributors**
1. Can contribute to either
2. Can port features v1 → v2
3. Can improve both
4. Clear where to add code

### **For Learning**
1. See progression (v1 → v2)
2. Compare approaches
3. Understand trade-offs
4. Document decisions

---

## 🎓 Learning Benefits

By keeping both in same repo, you can:

**Document the journey:**
```markdown
# Feature X

## V1 Implementation
[See code](data-synth-v1/index.html#L1234)
- Inline in main file
- Global variable
- Direct DOM manipulation

## V2 Implementation  
[See code](data-synth-v2/src/components/FeatureX.tsx)
- Separate component
- Zustand state
- React rendering

## Lessons Learned
- v1 is faster to write
- v2 is easier to test
- Both work, different trade-offs
```

**Create comparison guides:**
- "How feature X evolved from v1 to v2"
- "Performance comparison: v1 vs v2"
- "When to use which version"

---

## 🎯 Action Items

### **Immediate (Today)**

Want me to reorganize the folders for you?

I can:
1. Create `data-synth-v1/` and `data-synth-v2/` folders
2. Move files appropriately
3. Create version-specific READMEs
4. Update root README
5. Create `docs/` folder
6. Commit and push

Just say the word!

### **Then (This Week)**

1. Test both versions still work
2. Deploy v1 to GitHub Pages
3. Deploy v2 to Vercel (with correct Root Directory)
4. Update READMEs with live URLs

### **Future (Ongoing)**

1. Maintain both versions
2. Port stable features v1 → v2
3. Experiment in v1, productionize in v2
4. Use whichever fits the task

---

## 💡 Final Recommendation

**Keep both in same repo with this structure:**

```
data-synth/
├── data-synth-v1/      # HTML version (portable)
├── data-synth-v2/      # Next.js version (platform)
├── datasets/           # Shared
├── docs/               # Shared
└── README.md           # Explains both
```

**Why?**
- ✅ Easy to reorganize (just folders, same repo)
- ✅ Shared resources (datasets, docs)
- ✅ One git history (learning trail)
- ✅ Independent deployment (GitHub Pages + Vercel)
- ✅ Low overhead (no complex setup)
- ✅ Can split later if needed (easy to separate)

**You're learning, so keeping them together lets you:**
- Compare implementations
- Reference while building
- Document the journey
- Show progression

**Later, if v2 becomes a commercial product or has different team, THEN split into separate repos.**

For now? **Same repo, two folders is perfect.** ✨

---

Want me to reorganize the folders for you right now? It'll take ~5 minutes!

