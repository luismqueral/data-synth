# dataset inventory

comprehensive list of all available datasets organized by category. all filenames use lowercase with extensions visible.

---

## 🌍 earth stuff

### earthquakes
- **earthquakes-week.geojson** - usgs past 7 days, all magnitudes (~1600 events)
- **earthquakes-all-month.geojson** - usgs past 30 days, all magnitudes (~9000 events) 
- **earthquakes-major-month.geojson** - usgs past 30 days, M4.5+ only (~500 events)
- **earthquakes-significant-month.geojson** - usgs past 30 days, significant events only (~20 events)

### weather & climate
- **hurricanes-atlantic-2023.json** - 20 atlantic hurricanes from 2023 season
  - fields: name, category, wind speed, pressure, damage, fatalities, coordinates
  - sonify: map category → frequency, damage → volume, wind speed → filter

### disasters
- **wildfire-california-2020.json** - 16 major california wildfires from 2020 record season
  - fields: acres burned, structures destroyed, fatalities, duration, coordinates
  - sonify: acres → reverb size, duration → note length, structures → volume
  
- **volcanic-eruptions-recent.json** - 14 volcanic eruptions from 2018-2024
  - fields: vei (explosivity), ash height, lava flow, fatalities, population nearby
  - sonify: vei → frequency, ash height → filter, population → reverb

### environment
- **air-quality-global-cities.json** - 16 major cities worldwide air quality snapshot
  - fields: aqi, pm2.5, pm10, no2, o3, so2, co levels
  - sonify: aqi → frequency, pm2.5 → distortion, population → pan
  
- **ocean-buoy-measurements.json** - 15 noaa ocean buoys real-time measurements
  - fields: wave height, period, water/air temp, wind speed, pressure
  - sonify: wave height → amplitude, period → tempo, wind → white noise

---

## ⚾ baseball

- **baseball-home-runs-2024.json** - 25 mlb home run leaders 2024 season
  - fields: home runs, avg, rbi, ops, games, strikeouts, walks
  - sonify: home runs → frequency, avg → filter brightness, strikeouts → reverb

- **baseball-world-series-2024.json** - 5 games from dodgers vs yankees 2024
  - fields: scores, innings, attendance, duration, home runs, hits, errors
  - sonify: score difference → pitch bend, attendance → reverb, errors → noise

---

## 💰 money

### cryptocurrency
- **bitcoin-historical-2024.json** - 365 days of bitcoin price data (coingecko api)
  - fields: timestamp, price, market cap, volume
  - sonify: price → frequency, volume → amplitude, daily change → filter sweep

- **crypto-top-100.json** - top 100 cryptocurrencies by market cap (live snapshot)
  - fields: price, market cap, volume, 24h change, ath, atl
  - sonify: market cap → reverb size, 24h change → pitch bend, volume → amplitude

### stock market
- **stock-market-crashes.json** - 20 major market crash events 1929-2022
  - fields: dow change %, close price, volume, market cap loss
  - sonify: % change → frequency (crashes = low notes), volume → amplitude

---

## 🚀 space

### planets & moons
- **solar-system-planets.json** - 9 planets including pluto
  - fields: diameter, mass, orbit period, rotation, temp, distance, gravity
  - sonify: orbit period → tempo, distance → reverb, temp → filter, mass → volume

- **exoplanets.csv** - 6000+ confirmed exoplanets (nasa archive)
  - fields: 683 columns! mass, radius, temp, orbit, star properties, discovery year
  - sonify: radius → frequency, temp → filter brightness, distance → reverb

### asteroids & impacts
- **asteroid-close-approaches-2024.json** - 11 asteroids passing near earth in 2024
  - fields: miss distance, diameter, velocity, potentially hazardous flag
  - sonify: miss distance → frequency (closer = higher), velocity → tempo, hazardous → distortion

- **meteorite-landings.json** - 1000 recorded meteorite impacts (nasa)
  - fields: mass, year, location coordinates, classification
  - sonify: mass → volume, year → position in sequence, lat/lon → pan

### tracking
- **iss-location-tracking.json** - international space station current position
  - fields: latitude, longitude, timestamp
  - sonify: latitude → frequency, longitude → pan, velocity → tempo

---

## 🎲 misc

### demographics
- **world-population-countries.json** - 20 most populous countries 2024
  - fields: population, growth rate, density, urban %, median age, fertility, life expectancy, gdp
  - sonify: population → reverb size, growth rate → pitch bend, density → compression

### internet & technology
- **wikipedia-trending-2024.json** - 15 most viewed wikipedia articles 2024
  - fields: views (millions), peak date, category, edits, daily average
  - sonify: views → amplitude, edits → tempo, category → waveform type

- **github-languages-popularity.json** - 15 programming languages github stats
  - fields: repos, stars, contributors, pull requests, issues, growth rate
  - sonify: repos → reverb, stars → brightness, growth rate → pitch bend

### experiments (original sonic datasets)
- **aether-wave.json** - synthetic data for testing
- **nebula-cascade.json** - synthetic data for testing
- **pulsar-vortex.json** - synthetic data for testing
- **quantum-drift.json** - synthetic data for testing
- **temporal-flux.json** - synthetic data for testing

---

## 📊 dataset statistics

| category | datasets | total records | smallest | largest |
|----------|----------|---------------|----------|---------|
| 🌍 earth stuff | 10 | ~11,000 | 14 (volcanoes) | 9000 (earthquakes) |
| ⚾ baseball | 2 | 30 | 5 (world series) | 25 (home runs) |
| 💰 money | 3 | ~485 | 20 (crashes) | 365 (bitcoin) |
| 🚀 space | 5 | ~7,000 | 9 (planets) | 6000 (exoplanets) |
| 🎲 misc | 8 | ~80 | 15 (languages) | 20 (countries) |
| **total** | **28** | **~18,600** | | |

---

## 🎵 sonification tips by category

### earth stuff
best for: **drama, tension, natural patterns**
- map magnitude/intensity to frequency (bigger = louder/lower)
- use coordinates for stereo panning
- duration/size for reverb depth
- fatalities/damage for distortion (careful with this!)

### baseball  
best for: **rhythm, competition, human performance**
- map stats to frequency (higher stats = higher notes)
- errors/strikeouts add noise/distortion
- game progression creates natural tempo
- attendance/crowds affect reverb size

### money
best for: **volatility, cycles, exponential growth**
- price changes map well to pitch bends
- volume creates natural dynamics
- crashes are dramatic low-frequency events
- use logarithmic mapping for price (spans orders of magnitude)

### space
best for: **scale, distance, cosmic wonder**
- distance/size maps to reverb (farther = more space)
- temperature maps to filter brightness
- orbital periods create natural tempo
- mass affects volume/weight of sound

### misc
best for: **exploration, comparison, unexpected patterns**
- great for finding surprising correlations
- population/size metrics map to reverb
- growth rates map to pitch bend
- categorical data can switch waveforms

---

## 🚀 quick start recommendations

**first time users:**
1. `solar-system-planets.json` - 9 planets, easy to understand
2. `baseball-world-series-2024.json` - 5 games, clear narrative
3. `hurricanes-atlantic-2023.json` - 20 storms, dramatic data

**advanced sonification:**
1. `exoplanets.csv` - 683 fields, endless possibilities
2. `earthquakes-all-month.geojson` - 9000 events, real-time patterns
3. `crypto-top-100.json` - volatile markets, financial drama

**geographic mapping:**
1. `earthquakes-major-month.geojson` - coordinates for panning
2. `air-quality-global-cities.json` - worldwide comparison
3. `wildfire-california-2020.json` - regional disaster mapping

**temporal sequences:**
1. `bitcoin-historical-2024.json` - daily progression over 1 year
2. `stock-market-crashes.json` - historical events 1929-2022
3. `volcanic-eruptions-recent.json` - timeline of eruptions

---

## 📝 file naming convention

all datasets follow this pattern:
- **lowercase only** - no capitals
- **hyphens for spaces** - `ocean-buoy` not `ocean_buoy`
- **descriptive names** - what it is, not codes
- **include extension** - `.json`, `.geojson`, `.csv` visible
- **year if relevant** - `wildfire-california-2020.json`
- **specificity** - `earthquakes-major-month` not just `earthquakes`

examples:
- ✅ `hurricanes-atlantic-2023.json`
- ✅ `baseball-world-series-2024.json`
- ✅ `air-quality-global-cities.json`
- ❌ `Hurricane_Data.JSON`
- ❌ `baseball.json`
- ❌ `aq.json`

---

## 🔄 updating datasets

### live api datasets (can refresh anytime):
- earthquakes (usgs updates every 1-5 minutes)
- crypto prices (coingecko updates constantly)
- iss location (updates every second)

### static snapshots (archived at specific date):
- baseball stats (end of 2024 season)
- hurricanes (2023 season complete)
- wildfires (2020 season archived)
- crashes (historical through 2022)

### how to refresh earthquake data:
```bash
cd datasets
curl -o "earthquakes-all-month.geojson" \
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
```

### how to refresh crypto data:
```bash
curl -o "crypto-top-100.json" \
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100"
```

---

## 💡 tips for finding more datasets

### what makes a great sonification dataset?
1. **8-20 numeric fields** - enough variety, not overwhelming
2. **20-10,000 records** - enough for patterns, not too slow
3. **wide value ranges** - 2-3 orders of magnitude creates drama
4. **natural narrative** - time series, spatial, or categorical structure
5. **clean json/csv** - easy to parse
6. **interesting subject** - you'll spend time with this data!

### where to look:
- **data.gov** - us government open data
- **kaggle.com** - machine learning datasets
- **openaq.org** - air quality worldwide
- **nasa.gov/open** - space science data
- **baseball-reference.com** - sports statistics
- **noaa.gov** - weather, ocean, climate
- **github.com/datasets** - curated data collections

---

## 🎧 happy sonifying!

each dataset here has been chosen or created for maximum sonic potential. remember:
- **start simple** - map 2-3 parameters first
- **use randomize** - discover unexpected combinations
- **respect scale** - use log mapping for magnitude, temperature, price
- **tell stories** - choose playback order thoughtfully
- **embrace chaos** - outliers create the most memorable moments

the sound of data is waiting to be discovered. 🎵✨

