# USGS Earthquake Data Guide

## Overview
Real-time seismic activity from the United States Geological Survey. This dataset captures earthquakes worldwide with rich technical measurements.

**Source:** https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php

## Files Available
- `earthquakes-week.geojson` - Full week of seismic activity (1000-2000 events, ~1MB)
- `earthquakes-sample.json` - 50 earthquake sample for testing

## Data Structure
Each earthquake is a GeoJSON feature with:
- **geometry**: `[longitude, latitude, depth]` coordinates
- **properties**: 26+ fields with seismic measurements

## Key Numeric Fields for Sonification (18 fields)

### Core Measurements
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **mag** | -1.0 to 9.0+ | Magnitude (Richter scale) | **Frequency** - dramatic range, hear big vs small quakes |
| **depth** | 0 to 700 km | Depth below surface | **Reverb depth** - deep quakes = longer reverb tail |
| **time** | Unix timestamp (ms) | When earthquake occurred | **Playback order** - chronological story |

### Seismic Network Quality Metrics
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **gap** | 0° to 360° | Azimuthal gap between stations | **Filter cutoff** - large gap = darker tone (less reliable) |
| **dmin** | 0 to 20+ | Distance to nearest station (degrees) | **Delay time** - far stations = longer delay |
| **rms** | 0.0 to 2.0+ | Root-mean-square travel time residual | **Distortion/fuzz** - higher rms = more distortion |
| **nst** | 0 to 200+ | Number of seismic stations | **Chorus/voices** - more stations = richer sound |

### Error Measurements
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **horizontalError** | 0 to 50+ km | Horizontal location uncertainty | **Stereo width** - more error = wider stereo |
| **depthError** | 0 to 100+ km | Depth uncertainty | **Reverb mix** - uncertain = more wet |
| **magError** | 0.0 to 1.0+ | Magnitude uncertainty | **Pitch vibrato** - uncertainty = wobble |

### Impact Measurements
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **sig** | 0 to 1000+ | Significance (computed score) | **Volume** - more significant = louder |
| **felt** | 0 to 10000+ | Number of "felt it" reports | **Harmonic richness** - more felt = more harmonics |
| **cdi** | 0.0 to 10.0 | Community Decimal Intensity | **Filter resonance** - higher intensity = more resonant |
| **mmi** | 0.0 to 10.0 | Modified Mercalli Intensity | **Waveform complexity** - higher = more complex |

### Geographic
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **longitude** | -180° to 180° | East-West position | **Pan** - west = left, east = right |
| **latitude** | -90° to 90° | North-South position | **Filter brightness** - north = brighter |

### Categorical/Boolean
| Field | Values | Description | Audio Mapping Ideas |
|-------|--------|-------------|---------------------|
| **tsunami** | 0 or 1 | Tsunami warning issued | **Trigger alarm sound** - rare but dramatic |
| **alert** | null, green, yellow, orange, red | Alert level | **Different waveforms** per color |

## Sonification Ideas

### Option 1: Seismic Drama
"Hear the Earth's movements with emphasis on dramatic events"
```
mag → Frequency (40-2000 Hz, exponential)
sig → Volume (larger events dominate)
depth → Reverb size (deep = cathedral)
gap → Filter cutoff (good data = bright)
longitude → Pan (global stereo spread)
time → Note spacing (chronological playback)
```

### Option 2: Network Quality
"Hear the quality of seismic measurements"
```
mag → Base frequency
nst → Number of oscillators (chorus)
gap → Filter cutoff
rms → Distortion amount
dmin → Delay time
horizontalError → Stereo width
```

### Option 3: Geographic Journey
"Travel the world through earthquakes"
```
longitude → Pan (-180° = hard left, 180° = hard right)
latitude → Filter frequency (poles = extreme)
depth → Reverb depth
mag → Volume
sig → Harmonic richness
place → Visual label only
```

### Option 4: Tsunami Alert System
"Functional earthquake monitoring"
```
mag → Frequency (warning threshold)
depth → Reverb (shallow = less reverb = more dangerous)
tsunami → Alarm trigger (special sound)
sig → Volume
cdi → Filter resonance (felt intensity)
time → Real-time playback
```

## Data Ranges (from current week sample)

**Most common magnitudes:** 1.0 - 4.0 (hundreds per day)  
**Significant events:** 5.0+ (several per week)  
**Major events:** 7.0+ (rare, maybe 1-2 per month)

**Depth distribution:**
- Shallow (0-70km): ~85% of earthquakes - most dangerous
- Intermediate (70-300km): ~12%
- Deep (300-700km): ~3%

**Geographic hotspots:**
- Pacific Ring of Fire (most active)
- Mid-Atlantic Ridge
- Himalayan region
- California

## File Formats

### Full Week Feed (earthquakes-week.geojson)
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "mag": 2.5,
        "place": "10km NE of San Francisco, CA",
        "time": 1699564800000,
        "depth": 8.2,
        "sig": 96,
        "gap": 45,
        "dmin": 0.123,
        "rms": 0.15,
        "nst": 24,
        ...
      },
      "geometry": {
        "coordinates": [-122.4194, 37.7749, 8.2]
      }
    }
  ]
}
```

### Sample (earthquakes-sample.json)
Same structure, 50 events for quick testing

## How to Use

1. **Quick Test**: Load `earthquakes-sample.json` (50 events)
2. **Try "Randomize All"** to hear different mappings
3. **Manual mapping suggestions**:
   - Start with `properties.mag` → Frequency
   - Add `properties.sig` → Volume
   - Add `geometry.coordinates[0]` → Pan (longitude)
   - Add `properties.depth` → Reverb

4. **For full experience**: Load `earthquakes-week.geojson` (1600+ events)
   - Adjust tempo to 100-300ms per event
   - Hear patterns: swarms, aftershocks, daily rhythms

## Live Data Updates

To get fresh data anytime:
```bash
# Last hour (most recent)
curl -o earthquakes-hour.geojson \
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"

# Last day
curl -o earthquakes-day.geojson \
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

# Last 30 days (larger file, ~10MB)
curl -o earthquakes-month.geojson \
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
```

## Why Sonify Earthquakes?

- **Pattern recognition**: Hear aftershock sequences, swarms, daily rhythms
- **Magnitude perception**: Feel the difference between 2.0 and 7.0
- **Network quality**: Understand seismic monitoring coverage
- **Real-time monitoring**: Keep audio feed running while working
- **Accessibility**: Make seismic data available to blind/low-vision users
- **Drama**: Earthquakes have natural narrative tension

## Notes

- Magnitude is logarithmic (5.0 is 10x stronger than 4.0)
- Negative magnitudes are possible (very tiny tremors)
- Most earthquakes are too small to feel (mag < 3.0)
- Depth matters: shallow quakes are more dangerous
- Gap > 180° means poor station coverage
- Updates every minute on USGS servers

