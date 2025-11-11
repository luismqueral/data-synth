# NASA Exoplanet Archive Data Guide

## Overview
Confirmed exoplanets (planets orbiting stars other than our Sun) with extensive physical and orbital properties. One of the richest datasets available for sonification.

**Source:** https://exoplanetarchive.ipac.caltech.edu/

## Files Available
- `exoplanets.csv` - Complete dataset (~5,500 planets, 683 columns, 73MB)
- `exoplanets-sample.json` - 100 planet sample with 22 key fields (for testing)

## Sample Data Structure
Simplified JSON with the most interesting fields for sonification:

```json
[
  {
    "pl_name": "Kepler-186 f",
    "hostname": "Kepler-186",
    "disc_year": "2014",
    "pl_orbper": "129.9441",
    "pl_rade": "1.17",
    "pl_masse": "1.44",
    "st_teff": "3755",
    "sy_dist": "151.37",
    ...
  }
]
```

## Key Numeric Fields for Sonification (22 in sample, 200+ in full dataset)

### Planet Physical Properties
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **pl_rade** | 0.3 to 30+ | Planet radius (Earth radii) | **Frequency** - size = pitch (0.3 = tiny, 30 = Jupiter++) |
| **pl_masse** | 0.1 to 4000+ | Planet mass (Earth masses) | **Volume** - heavier = louder |
| **pl_dens** | 0.1 to 20+ | Planet density (g/cm³) | **Filter resonance** - dense = sharp/metallic |
| **pl_radj** | 0.03 to 3+ | Planet radius (Jupiter radii) | Alternative to pl_rade |
| **pl_massj** | 0.0003 to 13+ | Planet mass (Jupiter masses) | Alternative to pl_masse |

### Orbital Properties
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **pl_orbper** | 0.09 to 730,000+ days | Orbital period | **Note duration/tempo** - fast orbit = quick notes |
| **pl_orbsmax** | 0.01 to 2700+ AU | Semi-major axis (distance from star) | **Reverb size** - far = spacious |
| **pl_orbeccen** | 0.0 to 0.97 | Orbit eccentricity (circularity) | **LFO amount** - eccentric = wobble |
| **pl_orbincl** | 0° to 180° | Orbital inclination | **Pan** - edge-on vs face-on |

### Planet Environment
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **pl_eqt** | 50 to 4000+ K | Equilibrium temperature | **Filter brightness** - hot = bright/harsh, cold = dark |

### Star Properties
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **st_teff** | 2600 to 40,000+ K | Stellar temperature | **Harmonic content** - hot star = more harmonics |
| **st_rad** | 0.08 to 300+ | Star radius (solar radii) | **Chorus width** - big star = wide |
| **st_mass** | 0.08 to 100+ | Star mass (solar masses) | **Bass presence** - massive star = more bass |
| **st_age** | 0.01 to 13+ Gyr | Star age | **Envelope decay** - old = slower decay |
| **st_lum** | 0.00001 to 1,000,000+ | Stellar luminosity (solar units) | **Volume multiplier** - bright star = louder |

### System Properties
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **sy_dist** | 4 to 28,000+ parsecs | Distance from Earth | **Reverb depth** - far = more reverb/echo |
| **sy_plx** | 0.03 to 200+ mas | Parallax (distance measurement) | Inverse of distance |

### Discovery
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **disc_year** | 1989 to 2024 | Year discovered | **Chronological playback** - hear discovery history |

### Celestial Position
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **ra** | 0° to 360° | Right ascension | **Pan** - position in sky |
| **dec** | -90° to 90° | Declination | **Filter sweep** - celestial hemisphere |

## Sonification Ideas

### Option 1: Cosmic Tour
"Journey through alien worlds by size and temperature"
```
pl_rade → Frequency (small = high pitch, large = low)
pl_eqt → Filter brightness (hot = bright, cold = dark)
sy_dist → Reverb size (far away = spacious)
pl_masse → Volume (heavy = loud)
st_teff → Harmonic richness (hot stars = complex)
pl_orbper → Note duration (fast orbit = quick)
```

### Option 2: Habitability Explorer
"Hear Earth-like vs. extreme planets"
```
pl_eqt → Frequency (273-373K = sweet spot, harmonious)
pl_rade → Filter Q (Earth-size = resonant peak)
pl_orbsmax → Reverb (habitable zone = moderate)
pl_dens → Waveform (rocky = square, gas = sine)
sy_dist → Volume (nearby = louder)
st_teff → Color noise (Sun-like = pink noise)
```

### Option 3: Discovery Timeline
"Hear the history of exoplanet discovery"
```
disc_year → Playback order (1989 to present)
pl_masse → Frequency (early: only gas giants found)
pl_rade → Volume (progression to smaller planets)
sy_dist → Reverb (technology improves = find farther)
pl_orbper → Tempo (hot Jupiters → longer periods)
```

### Option 4: Stellar Family Portrait
"Compare planets grouped by their star"
```
Group by hostname (play all planets of same star together)
st_teff → Base tone (star = drone)
pl_rade → Overtones (planets = harmonics)
pl_orbper → Rhythm (orbital resonances)
pl_orbsmax → Pan (inner to outer system)
```

### Option 5: Physical Extremes
"Hear the most bizarre exoplanets"
```
pl_dens → Frequency (ultra-dense vs. puffy)
pl_eqt → Distortion (extreme temp = extreme sound)
pl_orbeccen → LFO rate (eccentric = wild vibrato)
sy_dist → Delay (light-years = delay time)
st_age → Envelope (young = sharp, old = slow)
```

## Data Ranges & Notable Examples

### Planet Size Extremes
- **Smallest**: ~0.3 Earth radii (Mercury-sized)
- **Earth-size**: ~1.0 Earth radii (rare!)
- **Neptune-size**: ~4 Earth radii (ice giants)
- **Jupiter-size**: ~11 Earth radii (gas giants)
- **Largest**: ~30 Earth radii (inflated hot Jupiters)

### Temperature Extremes
- **Coldest**: ~50 K (-223°C) - frozen methane worlds
- **Earth-like**: ~288 K (15°C) - potentially habitable
- **Hot Jupiters**: 1000-2000 K (727-1727°C)
- **Ultra-hot**: 4000+ K (3727°C) - molten iron rain

### Distance from Earth
- **Nearest**: Proxima Centauri b at 1.3 parsecs (4.2 light-years)
- **Most**: 30-1000 parsecs away
- **Farthest**: 28,000 parsecs (91,000 light-years!)

### Orbital Periods
- **Fastest**: 0.09 days (2 hours!) - ultra-hot Jupiters
- **Earth-like**: ~365 days
- **Longest**: 730,000 days (2000 years) - distant giants

## Full Dataset Structure (683 columns!)

The complete CSV includes:
- **Planet measurements**: 200+ columns (radius, mass, density, transit depth, RV amplitude...)
- **Orbital elements**: 50+ columns (period, semi-major axis, eccentricity, inclination...)
- **Star properties**: 100+ columns (temperature, mass, radius, age, metallicity...)
- **System properties**: 50+ columns (distance, proper motion, parallax...)
- **Photometry**: 150+ columns (magnitudes in different wavelength bands)
- **Discovery metadata**: 50+ columns (year, method, facility, telescope...)
- **Error estimates**: Each measurement has error columns (err1, err2, symerr)
- **Flags**: Binary indicators (transit, RV, TTV, imaging detection...)

## How to Use

### Quick Start (Sample)
1. Load `exoplanets-sample.json` (100 planets, 22 fields)
2. Try "Randomize All" to explore
3. Manual suggestions:
   - `pl_rade` → Frequency (hear size)
   - `pl_eqt` → Filter cutoff (hear temperature)
   - `sy_dist` → Reverb (hear distance)
   - `pl_masse` → Volume (hear mass)

### Advanced (Full Dataset)
The full CSV has 683 columns! To use it:
```python
import pandas as pd
df = pd.read_csv('exoplanets.csv')

# Filter to planets with key data
df = df.dropna(subset=['pl_rade', 'pl_masse', 'pl_eqt'])

# Select columns of interest
columns = ['pl_name', 'pl_rade', 'pl_masse', 'pl_eqt', 'st_teff', 'sy_dist']
df_filtered = df[columns]

# Export to JSON
df_filtered.to_json('my_exoplanets.json', orient='records', indent=2)
```

## Why Sonify Exoplanets?

- **Scale comprehension**: Human brain can't visualize these scales - but can hear them
- **Pattern discovery**: Orbital resonances, stellar types, discovery biases
- **Aesthetic beauty**: Cosmic data as generative music
- **Education**: Make astrophysics tangible through sound
- **Data exploration**: 683 dimensions impossible to visualize
- **Inspiration**: Literally the sound of alien worlds

## Fun Facts

- Most exoplanets are "hot Jupiters" (detection bias - they're easiest to find)
- Earth-sized planets in habitable zones are rare in the data (~50 known)
- Some planets orbit binary star systems (like Tatooine!)
- We've discovered planets with glass rain, molten iron clouds, and diamond layers
- The field exploded in 2009 with Kepler mission (most discoveries)
- Sound of exoplanets travels through their atmospheres - but we can't hear it from Earth!

## Data Quality Notes

- Many fields have missing data (not all measurements possible for all planets)
- Error columns exist for most measurements (uncertainty)
- Transit planets have more data than RV-detected planets
- Bias towards large, close-in planets (detection methods favor these)
- Sample file pre-filters for planets with radius/mass data

## Update Frequency

NASA updates this archive continuously as:
- New planets are confirmed
- Better measurements become available
- Published papers add new data

To get latest data:
```bash
curl -o exoplanets-latest.csv \
  "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+*+from+pscomppars&format=csv"
```

## Recommended Mappings Priority

**Start with these fields** (most complete data, most interesting):
1. `pl_rade` - Planet radius (size)
2. `pl_eqt` - Temperature (habitability)
3. `sy_dist` - Distance from Earth (scale)
4. `pl_orbper` - Orbital period (rhythm)
5. `st_teff` - Star temperature (timbre)

**Then explore**:
- `pl_dens` - Planet density (composition)
- `pl_orbeccen` - Orbital eccentricity (drama)
- `st_age` - Star age (evolution)
- `disc_year` - Discovery timeline (history)

## Credits

Data from NASA Exoplanet Archive  
https://exoplanetarchive.ipac.caltech.edu/  
Operated by Caltech under NASA

