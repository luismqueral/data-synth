# USGS Real-Time Data Feeds Guide

Complete guide to all USGS earthquake feeds available in the data-to-sound interface.

## 📡 Live Earthquake Feeds

All feeds update automatically from USGS servers. Data is typically updated within 1-5 minutes of an earthquake occurring.

---

## 🌍 All Magnitudes (Complete Data)

**Best for:** Comprehensive monitoring, pattern analysis, hearing everything happening globally

| Feed | Time Range | Typical Count | Update Frequency | URL |
|------|------------|---------------|------------------|-----|
| **Past Hour** | Last 60 minutes | 10-50 events | Every minute | `all_hour.geojson` |
| **Past Day** | Last 24 hours | 200-500 events | Every minute | `all_day.geojson` |
| **Past Week** | Last 7 days | 1000-2000 events | Every minute | `all_week.geojson` |
| **Past Month** | Last 30 days | 4000-8000 events | Every 5 minutes | `all_month.geojson` |

**Characteristics:**
- Includes tiny quakes (magnitude 1.0+)
- Global coverage
- Extremely detailed seismic network
- Great for hearing Earth's constant activity

**Sonification Tips:**
- Use magnitude → frequency to distinguish small from large
- Map depth → reverb (deep quakes sound cavernous)
- Use gap → filter (network quality affects timbre)

---

## 🔴 Magnitude 4.5+ (Moderate to Major)

**Best for:** Significant seismic events, dramatic sonification, fewer but bigger events

| Feed | Time Range | Typical Count | Update Frequency |
|------|------------|---------------|------------------|
| **Past Hour** | Last 60 minutes | 0-3 events | Every minute |
| **Past Day** | Last 24 hours | 5-15 events | Every minute |
| **Past Week** | Last 7 days | 30-80 events | Every minute |
| **Past Month** | Last 30 days | 100-300 events | Every 5 minutes |

**Characteristics:**
- Felt by large populations
- Can cause damage
- M4.5-6.0 = moderate, M6.0+ = strong/major
- Cleaner dataset (less noise)

**Sonification Tips:**
- Every event is "important" - use dramatic mappings
- Highlight magnitude variations (4.5 vs 6.0 is huge difference)
- Use tsunami flag for special emphasis
- Pan by longitude to create geographic sweep

---

## 🟠 Magnitude 2.5+ (Commonly Felt)

**Best for:** Balance between detail and significance, felt earthquakes only

| Feed | Time Range | Typical Count | Update Frequency |
|------|------------|---------------|------------------|
| **Past Hour** | Last 60 minutes | 3-10 events | Every minute |
| **Past Day** | Last 24 hours | 50-150 events | Every minute |
| **Past Week** | Last 7 days | 300-700 events | Every minute |
| **Past Month** | Last 30 days | 1200-2500 events | Every 5 minutes |

**Characteristics:**
- Felt by people near epicenter
- Rarely cause damage
- Sweet spot for sonification (not too many, not too few)
- Rich seismic data

**Sonification Tips:**
- Good for rhythmic patterns (manageable count)
- Map seismic network metrics (nst, gap, dmin, rms)
- Use exponential curves for magnitude (logarithmic scale)
- Create "swarm" sequences from aftershocks

---

## ⚠️ Significant Earthquakes Only

**Best for:** Headline events, disaster monitoring, dramatic narratives

| Feed | Time Range | Typical Count | Update Frequency |
|------|------------|---------------|------------------|
| **Past Hour** | Last 60 minutes | 0-1 events | Every minute |
| **Past Day** | Last 24 hours | 0-3 events | Every minute |
| **Past Week** | Last 7 days | 1-10 events | Every minute |
| **Past Month** | Last 30 days | 5-30 events | Every 5 minutes |

**Criteria for "Significant":**
- M6.0+ anywhere globally
- M4.0+ causing damage/casualties
- Events generating significant scientific interest
- Manually reviewed by USGS staff

**Characteristics:**
- Every earthquake is a story
- High "felt" reports
- Often includes aftershock sequences
- May include tsunami warnings

**Sonification Tips:**
- Slow playback (500ms+ per event)
- Use all available parameters (all data is meaningful)
- Highlight "felt" counts (map to volume?)
- Create narrative arcs from sequences

---

## 📊 Field Descriptions

All feeds include these key numeric fields perfect for sonification:

### Core Seismic Data
- **mag** (0.5-9.0): Earthquake magnitude - exponential scale!
- **depth** (0-700 km): Depth below surface - shallow quakes feel different
- **sig** (0-2000): Significance score - USGS calculation of importance

### Network Quality Metrics
- **nst** (3-500): Number of seismic stations used - more = better data
- **gap** (0-360°): Largest azimuthal gap in station coverage
- **dmin** (0-20°): Distance to nearest station
- **rms** (0-5): Root mean square of residuals - measurement accuracy

### Felt Reports
- **felt** (0-10000+): Number of "Did you feel it?" reports submitted
- **cdi** (1-10): Community Decimal Intensity - how strongly it was felt
- **mmi** (1-10): Modified Mercalli Intensity - instrumental intensity

### Geographic
- **longitude** (-180 to 180): East-west position
- **latitude** (-90 to 90): North-south position

### Hazards
- **tsunami** (0 or 1): Tsunami warning/watch issued?
- **alert** (green/yellow/orange/red): Pager alert level

---

## 🎵 Sonification Strategies by Feed Type

### "Earth's Heartbeat" (All Earthquakes - Past Hour)
Fast, detailed, capturing every tremor
```
mag → frequency (hear magnitude instantly)
depth → reverb depth
nst → filter cutoff (more stations = brighter)
Time: 30-50ms per event (fast playback)
```

### "Seismic Drama" (M4.5+ Past Week)  
Medium pace, dramatic events
```
mag → frequency + volume (double mapping for impact)
sig → duration (important events = longer notes)
felt → wetness (felt reports add ambience)
Time: 200-400ms per event
```

### "Significance Report" (Significant Past Month)
Slow, narrative, storytelling
```
mag → frequency
felt → volume (public impact)
tsunami → special effect (reverse delay?)
depth → pan (shallow left, deep right?)
Time: 500-1000ms per event, or manual advancement
```

### "Network Symphony" (M2.5+ Past Day)
Focus on data quality, not magnitude
```
nst → frequency (station count = pitch)
gap → filter resonance (coverage quality)
rms → reverb mix (accuracy = dryness)
dmin → pan (nearest station distance)
Time: 100-200ms per event
```

---

## 🚀 Advanced Ideas

### Real-Time Monitoring Installation
Use `all_hour.geojson`, reload every 60 seconds, continuous sonic stream

### Aftershock Sequence Detector
Load significant event, then load `all_day` to hear aftershocks

### Global Seismic Tour
Start with `all_month`, sort by longitude, pan by position

### Magnitude Comparison
Load M2.5+ and M4.5+ side by side, hear the difference

---

## ⏱️ Update Frequencies

| Feed Size | Update Frequency | Latency |
|-----------|-----------------|---------|
| Hour feeds | Every 1 minute | 1-3 minutes |
| Day feeds | Every 1 minute | 1-5 minutes |
| Week feeds | Every 1 minute | 1-5 minutes |
| Month feeds | Every 5 minutes | 5-10 minutes |

**Note:** During major events, update frequency may increase temporarily.

---

## 🔍 Technical Details

**Format:** GeoJSON (RFC 7946)  
**Encoding:** UTF-8  
**Coordinate System:** WGS84 (EPSG:4326)  
**Time Format:** Unix milliseconds (UTC)

**File Sizes:**
- Hour: 10-100 KB
- Day: 50-500 KB  
- Week: 300-2 MB
- Month: 1-8 MB

---

## 📚 Resources

- **USGS Earthquake Catalog:** https://earthquake.usgs.gov/earthquakes/search/
- **Real-time Feeds:** https://earthquake.usgs.gov/earthquakes/feed/
- **API Documentation:** https://earthquake.usgs.gov/fdsnws/event/1/
- **Magnitude Explained:** https://earthquake.usgs.gov/learn/topics/measure.php

---

## 💡 Pro Tips

1. **Start small:** Use "Past Hour" or M4.5+ feeds first
2. **Cache locally:** Download and sonify offline for consistent experience
3. **Compare time periods:** Load same feed at different times to hear changes
4. **Layer magnitude ranges:** Play M2.5+ and M4.5+ simultaneously
5. **Use appropriate tempo:** Month feeds need fast playback (20-50ms)
6. **Focus on variance:** Gap, nst, rms show data quality differences
7. **Geographic filtering:** Sort by region using lat/lon ranges
8. **Normalize magnitude:** Use exponential/logarithmic scaling

---

**Updated:** 2024-11-12  
**Source:** USGS Earthquake Hazards Program

🎧 Happy Seismic Sonification!

