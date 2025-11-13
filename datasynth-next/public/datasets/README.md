# Datasets for Sonification

This directory contains rich, multi-dimensional datasets perfect for audio sonification experiments. Each dataset has been chosen for its abundance of numeric fields, natural narrative structure, and sonic potential.

## 📦 Available Datasets

### 1. 🌍 **Earthquake Data (USGS) - REAL-TIME**
**Available Feeds:** 16 live feeds organized by magnitude and time range  
**Files:** `earthquakes-week.geojson` (local archive)  
**Guides:** 
- [USGS_FEEDS_GUIDE.md](USGS_FEEDS_GUIDE.md) - **Complete guide to all 16 feeds**
- [EARTHQUAKES_DATA_GUIDE.md](EARTHQUAKES_DATA_GUIDE.md) - Field descriptions & sonification tips

**Feed Categories:**
- **All Magnitudes:** Hour, Day, Week, Month (complete global coverage)
- **M4.5+ (Major):** Hour, Day, Week, Month (significant events only)
- **M2.5+ (Felt):** Hour, Day, Week, Month (commonly felt earthquakes)
- **Significant:** Hour, Day, Week, Month (headline-worthy events)

**Update Frequency:** Every 1 minute (hourly/daily/weekly), Every 5 minutes (monthly)  
**Size:** 10 KB (hour) to 8 MB (month)  
**Fields:** 26+ measurements per earthquake

**Why it's great:**
- **16 DIFFERENT FEEDS** - choose your magnitude/time range
- **REAL-TIME DATA** - earthquakes happening right now (1-5 min latency)
- Dramatic range (magnitude 1.0 to 9.0+)
- Rich seismic network metrics (gap, rms, nst)
- Global coverage with geographic coordinates
- Natural tension and drama

**Key fields:** `mag`, `depth`, `gap`, `dmin`, `rms`, `nst`, `sig`, `felt`, `tsunami`, `longitude`, `latitude`

---

### 2. 🪐 **Exoplanets (NASA)**
**Files:** `exoplanets.csv`  
**Real-time API:** NASA Exoplanet Archive (updated continuously)

**Size:** 6,000+ confirmed exoplanets  
**Fields:** 683 columns with comprehensive data  
**Guide:** [EXOPLANETS_DATA_GUIDE.md](EXOPLANETS_DATA_GUIDE.md)

**Why it's great:**
- Unprecedented field count (683 columns!)
- Cosmic scale variations (Earth-sized to Jupiter++)
- Temperature extremes (50K to 4000K)
- Multiple measurement types (size, mass, orbit, composition)
- Fascinating subject matter

**Key fields:** `pl_rade`, `pl_masse`, `pl_eqt`, `pl_orbper`, `st_teff`, `sy_dist`, `disc_year`

---

### 3. 🛰️ **International Space Station - REAL-TIME**
**Real-time API:** `http://api.open-notify.org/iss-now.json`

**Updates:** Every second  
**Fields:** Current latitude, longitude, velocity, altitude  

**Why it's great:**
- **LIVE TRACKING** - ISS position updates in real-time
- Orbital mechanics in action
- Familiar landmark (everyone knows the ISS)
- Perfect for continuous monitoring/installation

**Key fields:** `latitude`, `longitude`, `altitude`, `velocity`

---

### 4. 🌌 **Near Earth Objects (NASA) - REAL-TIME**
**Real-time API:** `https://api.nasa.gov/neo/rest/v1/feed`

**Updates:** Daily  
**Fields:** Asteroid size, velocity, closest approach, potential hazard status  

**Why it's great:**
- **DAILY UPDATES** - new asteroids discovered frequently
- Dramatic close approach data
- Size variations (meters to kilometers)
- Speed extremes
- "Potentially Hazardous" flag adds drama

**Key fields:** `estimated_diameter`, `relative_velocity`, `miss_distance`, `is_potentially_hazardous`

---

### 5. 🏗️ **Housing & Building Permits (Baltimore)**
**Files:** `Housing_and_Building_Permits_2019-Present.geojson`  
**Size:** 265,550+ permits (2019-Present)  
**Fields:** 6-7 useful numeric fields  
**Guide:** [HOUSING_DATA_GUIDE.md](HOUSING_DATA_GUIDE.md)

**Why it's great:**
- Large real-world dataset
- Urban development story
- Geographic mapping (lat/lon)
- Economic variation (cost ranges)
- District-based patterns

**Key fields:** `Cost`, `Council_District`, `latitude`, `longitude`, `IsPermitModification`

---

### 6. 📚 **Prose & Literature - EMBEDDINGS** ⭐ NEW
**Method:** Client-side text embeddings (semantic analysis)  
**Guide:** [PROSE_EMBEDDINGS_GUIDE.md](PROSE_EMBEDDINGS_GUIDE.md)

**Processing:** Text → 384D embeddings → 8-20D synth parameters  
**Model:** Transformers.js (all-MiniLM-L6-v2)  
**No API required:** Runs entirely in browser

**Why it's revolutionary:**
- **Sonify meaning, not just structure** - semantic understanding creates coherent soundscapes
- **Narrative arcs** - track thematic development through a text
- **Character/emotion detection** - different concepts produce different timbres
- **Context-aware** - same word in different contexts sounds different
- **Literary analysis** - compare authors, track motifs, identify callbacks

**How it works:**
1. Split prose into sentences
2. Generate semantic embeddings (captures meaning)
3. Reduce to 8-20 dimensions using UMAP
4. Map dimensions to synth parameters

**Perfect for:**
- Classic literature (Shakespeare, Poe, Hemingway)
- Poetry (sonnets, free verse)
- Speeches (MLK, Lincoln, political rhetoric)
- Historical documents (Declaration of Independence, etc.)
- Modern fiction/non-fiction

**Example texts:**
- Moby Dick opening ("Call me Ishmael...")
- "The Raven" by Edgar Allan Poe
- "I Have a Dream" speech
- Your own creative writing!

---

## 🎯 Quick Start Guide

### Real-Time Data (Start Here!)
1. **Live Earthquakes:** Load USGS real-time feed - hear earthquakes as they happen
2. **ISS Tracking:** Monitor the International Space Station's orbit in real-time
3. **NEO Feed:** Daily updates on asteroids passing near Earth
4. **Earthquake Archive:** Load `earthquakes-week.geojson` for historical patterns

### Full Datasets
1. **Exoplanets:** Load `exoplanets.csv` (6000+ planets, 683 fields - HUGE!)
2. **Housing:** Load `Housing_and_Building_Permits_2019-Present.geojson` (265K+ permits)
3. **Earthquakes:** Load archived `earthquakes-week.geojson` (1600+ events)

---

## 📊 Dataset Comparison

| Dataset | Records | Fields | Update Frequency | Complexity | Drama | Best For |
|---------|---------|--------|------------------|------------|-------|----------|
| **Prose Embeddings** ⭐ NEW | Unlimited | **384→8-20** | Any text | High | ⭐⭐⭐⭐⭐ | **Literary analysis**, semantic journeys, creative writing |
| **Earthquakes (Real-time)** | ~500/day | 26+ | Every minute | Medium | ⭐⭐⭐⭐⭐ | **Real-time monitoring**, pattern detection |
| **ISS Location** | Continuous | 4 | Every second | Low | ⭐⭐⭐⭐ | **Live tracking**, orbital mechanics |
| **NEO (Asteroids)** | 10-20/day | 15+ | Daily | Medium | ⭐⭐⭐⭐ | **Daily drama**, space hazards |
| **Exoplanets** | 6,000+ | **683** | Weekly | High | ⭐⭐⭐⭐ | Data exploration, cosmic scales |
| **Housing** | 265K+ | 6-7 | Historical | Low | ⭐⭐ | Geographic mapping, urban development |

---

## 🎵 Sonification Strategy by Dataset

### Prose Embeddings: "Literary Soundscapes" ⭐ NEW
**Best mappings:**
- `dim[0]` → Frequency (semantic "pitch")
- `dim[1]` → Filter cutoff (conceptual "brightness")
- `dim[2]` → Filter resonance (emphasis)
- `dim[3]` → Reverb mix (abstraction level)
- `dim[4]` → Reverb decay (temporal spread)
- `dim[5]` → Pan (perspective shift)
- `dim[6]` → Attack (sentence onset)
- `dim[7]` → Release (sentence decay)

**Listen for:** 
- Topic shifts (dramatic sonic changes)
- Thematic callbacks (similar timbres returning)
- Emotional arcs (harmonic tension/release)
- Narrative rhythm (temporal pacing)

**Advanced techniques:**
- Measure semantic distance between sentences → dissonance
- Find similar sentences → recurring motifs
- Track distance from opening → tension curve
- Cluster by theme → assign different instruments

---

### Earthquakes: "Earth's Drama"
**Best mappings:**
- `mag` → Frequency (hear magnitude differences)
- `depth` → Reverb depth
- `sig` → Volume
- `longitude` → Pan

**Listen for:** Aftershock sequences, swarms, daily patterns

---

### Exoplanets: "Cosmic Tour"
**Best mappings:**
- `pl_rade` → Frequency (planet size)
- `pl_eqt` → Filter brightness (temperature)
- `sy_dist` → Reverb size (distance)
- `pl_masse` → Volume

**Listen for:** Planet types, habitable zone candidates, discovery history

---

### Weather: "Atmospheric Rhythms"
**Best mappings:**
- `temperature_2m` → Frequency
- `precipitation` → White noise mix
- `wind_speed_10m` → Filter resonance
- `pressure_msl` → Volume
- `cloud_cover` → Reverb

**Listen for:** Daily cycles, approaching storms, weather fronts

---

### Housing: "Urban Development"
**Best mappings:**
- `Cost` → Frequency
- `Council_District` → Pan
- `latitude`/`longitude` → Stereo field
- Sequential playback by date

**Listen for:** Development hotspots, economic patterns, district character

---

## 🔍 Finding More Datasets

### Criteria for Great Sonification Data
1. **Multiple numeric fields** (8-20 ideal)
2. **Wide value ranges** (2-3 orders of magnitude)
3. **Natural narrative** (tells a story)
4. **Clean structure** (JSON or easily converted)
5. **Moderate size** (20-10,000 records)
6. **Temporal or spatial structure** (playback order)

### Recommended Sources
- **Kaggle:** Machine learning datasets (many features)
- **Data.gov:** Government data (comprehensive)
- **NASA APIs:** Space and Earth science
- **NOAA:** Climate and weather
- **USGS:** Earthquakes, geology
- **UCI ML Repository:** Classic datasets
- **Open Data portals:** City/state data

### Dataset Ideas
- 🌊 Ocean buoy measurements (waves, temperature, salinity)
- 🚆 Subway delays (time, line, duration)
- 💰 Cryptocurrency prices (volatility, volume)
- 🔭 Asteroid close approaches (distance, size, velocity)
- 🌋 Volcanic activity (VEI, location, emissions)
- 🏃 Fitness tracker data (heart rate, pace, elevation)
- 📈 Stock market ticks (OHLC, volume)
- 🌡️ Climate station data (multi-year)

---

## 📂 File Structure

```
datasets/
├── README.md (this file)
│
├── PROSE_EMBEDDINGS_GUIDE.md ⭐ NEW - Client-side semantic text analysis
│
├── USGS_FEEDS_GUIDE.md - Complete guide to 16 earthquake feeds
├── EARTHQUAKES_DATA_GUIDE.md
├── earthquakes-week.geojson (1600+ events, local archive)
│
├── EXOPLANETS_DATA_GUIDE.md
├── exoplanets.csv (6000+ planets, 683 columns)
│
├── HOUSING_DATA_GUIDE.md
├── Housing_and_Building_Permits_2019-Present.geojson (265K+ permits)
│
└── WEATHER_DATA_GUIDE.md

Note: Real-time/dynamic data sources:
- USGS Earthquake Feeds (16 feeds: all magnitudes, M4.5+, M2.5+, significant)
- NASA NEO API (daily asteroid updates)
- ISS Tracking API (real-time orbital position)
- Prose Embeddings (any text, client-side processing via Transformers.js)
```

---

## 🎨 Creative Sonification Ideas

### Cross-Dataset Mashups
- **Planet Weather:** Use exoplanet temperatures to modulate Earth weather sounds
- **Seismic Housing:** Map earthquake intensity to building permit costs
- **Cosmic Earthquakes:** Both have magnitude/distance scales

### Generative Music
- Use datasets as scores for algorithmic composition
- Loop temporal data for ambient soundscapes
- Random access for aleatoric music

### Data Installations
- Multi-channel spatial audio (each dataset = speaker)
- Real-time live feeds (earthquakes, weather)
- Interactive exploration (user-controlled mappings)

### Accessibility
- Audio data browsers for blind/low-vision users
- Sonified dashboards (monitor data while multitasking)
- Pattern detection through sound

---

## 🔄 Updating Datasets

All datasets can be refreshed with current data:

### Earthquakes (updates every minute)
```bash
curl -o earthquakes-week.geojson \
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
```

### Exoplanets (updates continuously)
```bash
curl -o exoplanets.csv \
  "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+*+from+pscomppars&format=csv"
```

### Weather (your location, your timeframe)
```bash
curl -o weather.json \
  "https://api.open-meteo.com/v1/forecast?latitude=YOUR_LAT&longitude=YOUR_LON&hourly=temperature_2m,precipitation&past_days=7"
```

---

## 💡 Tips for Success

1. **Start with samples** - Test mappings before loading huge files
2. **Use "Randomize All"** - Discover unexpected sonic combinations
3. **Layer parameters** - Multiple mappings create richness
4. **Respect scale** - Logarithmic mappings for magnitude, temperature
5. **Tell a story** - Choose playback order thoughtfully
6. **Embrace extremes** - Outliers create memorable moments
7. **Listen repeatedly** - Patterns emerge with familiarity

---

## 📝 Contributing

Found an amazing dataset? Add it to this collection:

1. Ensure it has 8+ numeric fields
2. Create a guide file (see existing guides)
3. Provide sample and full versions
4. Include suggested sonification mappings
5. Document data sources and update methods

---

## 🎧 Examples to Try

### "Live Earth Symphony" (Real-time Earthquakes) 🔴 LIVE
- Load: USGS real-time feed (past day)
- Map: `mag` → freq, `depth` → reverb, `longitude` → pan
- Tempo: 50-100ms per note
- Listen: Hear earthquakes happening RIGHT NOW

### "ISS Orbit Tracker" (Real-time Space Station) 🔴 LIVE
- Load: ISS location API
- Map: `latitude` → freq, `longitude` → pan, `velocity` → tempo
- Tempo: Real-time or accelerated
- Listen: Track the ISS as it orbits Earth

### "Near Earth Objects" (Daily Asteroids) 🆕 DAILY
- Load: NASA NEO feed
- Map: `miss_distance` → freq (closer = higher), `velocity` → tempo, `diameter` → volume
- Tempo: 300ms per asteroid
- Listen: Today's cosmic close encounters

### "Exoplanet Radio" (Full Database)
- Load: `exoplanets.csv`
- Map: `pl_eqt` → freq, `sy_dist` → reverb, `pl_rade` → volume
- Tempo: 500ms per planet
- Listen: Tour 6000+ alien worlds

---

## 📚 Further Reading

- [Sonification Handbook](https://sonification.de/handbook/)
- [ICAD (International Community for Auditory Display)](https://icad.org/)
- [NASA's Space Sounds](https://www.nasa.gov/vision/universe/features/halloween_sounds.html)

---

**Happy Sonifying!** 🎵🔊✨

Each dataset here has been carefully chosen for maximum sonic potential. Start with the samples, experiment with mappings, and discover the sound of data.

