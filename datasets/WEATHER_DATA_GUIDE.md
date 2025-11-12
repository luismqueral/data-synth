# Weather Data Guide (Open-Meteo)

## Overview
Hourly weather measurements from meteorological stations. Perfect for sonification because weather has natural temporal rhythms (day/night, storms, seasons) and multiple simultaneous measurements.

**Source:** https://open-meteo.com/

## Files Available
- `weather-sample.json` - 7 days of hourly Baltimore weather with 15 parameters

## Data Structure
Time-series JSON with parallel arrays:

```json
{
  "hourly": {
    "time": ["2024-11-04T00:00", "2024-11-04T01:00", ...],
    "temperature_2m": [12.5, 12.1, 11.8, ...],
    "relative_humidity_2m": [78, 79, 81, ...],
    "precipitation": [0.0, 0.0, 0.3, ...],
    "wind_speed_10m": [5.2, 4.8, 6.1, ...],
    ...
  }
}
```

## Available Parameters (15 fields)

### Temperature & Comfort
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **temperature_2m** | -40 to 50°C | Air temperature at 2m | **Frequency** - hot = high pitch, cold = low |
| **apparent_temperature** | -50 to 60°C | "Feels like" temperature | **Filter brightness** - comfortable = pleasant tone |
| **dew_point_2m** | -50 to 30°C | Dew point temperature | **Reverb wetness** - high dew point = wet reverb |

### Humidity & Precipitation
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **relative_humidity_2m** | 0 to 100% | Relative humidity | **Reverb mix** - humid = more reverb |
| **precipitation** | 0 to 50+ mm | Total precipitation | **White noise mix** - rain = noise burst |
| **rain** | 0 to 50+ mm | Liquid precipitation only | **High-pass filtered noise** - rain = sizzle |
| **snowfall** | 0 to 50+ cm | Snow amount | **Low-pass filtered noise** - snow = muffled |
| **snow_depth** | 0 to 500+ cm | Accumulated snow on ground | **Filter cutoff** - deep snow = darker tone |

### Atmospheric Pressure
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **pressure_msl** | 950 to 1050 hPa | Sea level pressure | **Volume** - high pressure = louder (clear days) |
| **surface_pressure** | 900 to 1050 hPa | Local surface pressure | **Bass presence** - low pressure = more bass |

### Cloud Cover
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **cloud_cover** | 0 to 100% | Total cloud cover | **Reverb size** - overcast = cathedral reverb |
| **weather_code** | 0 to 99 | WMO weather code | **Waveform selector** - different weather = different wave |

### Wind
| Field | Range | Description | Audio Mapping Ideas |
|-------|-------|-------------|---------------------|
| **wind_speed_10m** | 0 to 150+ km/h | Wind speed at 10m height | **White noise mix** - windy = more noise |
| **wind_direction_10m** | 0 to 360° | Wind direction | **Pan** - north = center, east = right, etc. |
| **wind_gusts_10m** | 0 to 200+ km/h | Wind gusts | **Random volume spikes** - gusts = sudden bursts |

## Weather Codes (WMO Standard)

| Code | Condition | Sonification Idea |
|------|-----------|-------------------|
| 0 | Clear sky | Sine wave (pure) |
| 1-3 | Partly cloudy | Sine + triangle |
| 45, 48 | Fog | Heavy low-pass filter |
| 51-55 | Drizzle | Gentle white noise |
| 61-65 | Rain | Moderate white noise |
| 71-75 | Snow | Low-passed white noise |
| 80-82 | Rain showers | Burst patterns |
| 95-99 | Thunderstorm | Distortion + random hits |

## Sonification Ideas

### Option 1: Daily Weather Journey
"Experience a week of weather in 2 minutes"
```
temperature_2m → Frequency (hear daily cycle)
precipitation → White noise mix (hear storms)
wind_speed_10m → High-pass filter resonance
cloud_cover → Reverb size
pressure_msl → Volume
time → Playback order (chronological)
```

### Option 2: Storm Detector
"Hear approaching weather systems"
```
pressure_msl → Frequency (dropping pressure = dropping pitch)
wind_gusts_10m → Random amplitude modulation
precipitation → Noise bursts
temperature_2m → Filter cutoff
cloud_cover → Reverb depth
relative_humidity_2m → Reverb wet/dry
```

### Option 3: Seasonal Comparison
"Compare summer vs winter soundscapes"
```
temperature_2m → Base frequency (seasonal range)
snow_depth → Low-pass filter (winter = muffled)
dew_point_2m → Reverb character
wind_speed_10m → Vibrato rate
cloud_cover → Harmonic complexity
apparent_temperature → Overall brightness
```

### Option 4: Comfort Index
"Hear human comfort vs. extremes"
```
apparent_temperature → Frequency (comfortable = consonant)
relative_humidity_2m → Distortion (uncomfortable = harsh)
wind_speed_10m → Tremolo depth
precipitation → Noise gate
pressure_msl → Volume
cloud_cover → Reverb
```

### Option 5: Multi-Layer Atmosphere
"All parameters playing simultaneously"
```
Layer 1: temperature_2m → Drone frequency
Layer 2: wind_speed_10m → White noise level
Layer 3: precipitation → Burst percussion
Layer 4: pressure_msl → Bass tone
Layer 5: cloud_cover → Pad/reverb wash
```

## Typical Ranges (Baltimore example)

### Temperature
- **Winter**: -10°C to 10°C
- **Spring/Fall**: 5°C to 20°C
- **Summer**: 20°C to 35°C
- **Record extremes**: -20°C to 42°C

### Precipitation
- **Dry day**: 0 mm
- **Light rain**: 1-5 mm/hour
- **Moderate rain**: 5-10 mm/hour
- **Heavy rain**: 10-50 mm/hour
- **Extreme storm**: 50+ mm/hour

### Wind
- **Calm**: 0-5 km/h
- **Light breeze**: 5-15 km/h
- **Moderate wind**: 15-30 km/h
- **Strong wind**: 30-50 km/h
- **Storm**: 50+ km/h
- **Hurricane force**: 120+ km/h

### Pressure
- **Low (storm)**: 980-1000 hPa
- **Normal**: 1000-1020 hPa
- **High (clear)**: 1020-1040 hPa

## How to Use

### Quick Start
1. Load `weather-sample.json`
2. The data has 168 rows (7 days × 24 hours)
3. Try these mappings:
   - `hourly.temperature_2m[i]` → Frequency
   - `hourly.precipitation[i]` → White noise mix
   - `hourly.wind_speed_10m[i]` → Filter resonance
   - `hourly.cloud_cover[i]` → Reverb size

### Accessing Array Values
The weather data is structured as parallel arrays. In your JSON mapper, you'll need to:
1. Parse the `hourly` object
2. Iterate through indices: `i = 0 to 167`
3. Access each parameter at index `i`

**Example structure for sonification:**
```javascript
for (let i = 0; i < weatherData.hourly.time.length; i++) {
  const note = {
    frequency: mapValue(weatherData.hourly.temperature_2m[i], -10, 35, 200, 800),
    volume: mapValue(weatherData.hourly.pressure_msl[i], 990, 1030, 0.3, 0.8),
    pan: mapValue(weatherData.hourly.wind_direction_10m[i], 0, 360, -1, 1),
    // ... other params
  };
  playNote(note, i * 500); // 500ms per hour
}
```

### Temporal Patterns to Listen For
- **Daily cycle**: Temperature rises during day, drops at night
- **Weather fronts**: Pressure drops, wind picks up, then rain
- **Storm passage**: Pressure dip, wind spike, precipitation burst
- **Clear periods**: Stable pressure, low wind, no precipitation
- **Day/night wind**: Often calmer at night, picks up during day

## Get Custom Weather Data

Open-Meteo API is free and easy to use. Get weather for any location:

```bash
# Replace latitude/longitude with your location
# past_days: how many days of historical data (0-92)
# Parameters: choose from 50+ available

curl -o my-weather.json "https://api.open-meteo.com/v1/forecast?\
latitude=YOUR_LAT&\
longitude=YOUR_LON&\
hourly=temperature_2m,precipitation,wind_speed_10m,pressure_msl&\
past_days=7"
```

**Example locations:**
- New York: `latitude=40.71&longitude=-74.01`
- London: `latitude=51.51&longitude=-0.13`
- Tokyo: `latitude=35.68&longitude=139.76`
- Sydney: `latitude=-33.87&longitude=151.21`

### Available Parameters (50+)
Open-Meteo offers many more parameters:
- UV index
- Evapotranspiration
- Soil temperature (multiple depths)
- Visibility
- Cloud layers (low, mid, high)
- Weather phenomena codes
- Solar radiation
- And more...

## Why Sonify Weather?

- **Temporal patterns**: Weather has natural rhythms perfect for audio
- **Familiar**: Everyone understands weather
- **Real-time monitoring**: Run continuously as ambient sound
- **Pattern recognition**: Hear storms coming before they arrive
- **Multi-dimensional**: Many simultaneous measurements
- **Accessibility**: Weather info for blind/low-vision users
- **Aesthetic**: Weather as generative music/soundscape

## Sonification Best Practices

### Tempo Considerations
- **Real-time**: 1 hour = 1 second (2.4 min for 1 week)
- **Contemplative**: 1 hour = 5 seconds (12 min for 1 week)
- **Detailed**: 1 hour = 1 minute (7 hours for 1 week!)

### Mapping Philosophy
- **Temperature**: Intuitive frequency (hot = high)
- **Precipitation**: Match natural sound (rain = white noise)
- **Wind**: Continuous movement (LFO, tremolo)
- **Pressure**: Background drone (foundation)
- **Clouds**: Space/environment (reverb)

### Listen For
1. **Sunrise/sunset**: Temperature changes
2. **Storm approach**: Pressure drop, wind rise
3. **Clear skies**: Stable, consonant tones
4. **Weather fronts**: Dramatic shifts
5. **Seasonal character**: Overall tonal quality

## Fun Facts

- Barometric pressure drops before storms (you can "hear" them coming)
- Temperature lags solar noon by ~2 hours (thermal inertia)
- Wind often picks up during afternoon (thermal convection)
- Dew point more stable than temperature (shows moisture)
- Humidity usually highest at dawn (temperature-dependent)

## Data Quality Notes

- Hourly resolution (smoother than minute-by-minute)
- Model-based (interpolated from stations and satellites)
- Very reliable for temperature, pressure, wind
- Precipitation slightly less accurate (localized)
- Historical data only (for forecasts, use forecast endpoint)

## Integration Ideas

- **Live installation**: Update hourly, continuous playback
- **Weather comparison**: Multiple cities simultaneously
- **Climate study**: Compare same location across years
- **Extreme events**: Highlight hurricanes, blizzards
- **Personal weather diary**: Your city's sonic portrait

## Credits

Data from Open-Meteo API  
https://open-meteo.com/  
Free for non-commercial use


