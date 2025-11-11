# Baltimore Housing & Building Permits Data Guide

## Sample Data Structure

Your GeoJSON has 265,550 building permit records from Baltimore. Each feature contains:

### Available Numeric Fields for Sonification:

1. **OBJECTID** (1-265550+)
   - Unique identifier for each permit
   - Audio idea: Could map to note spacing for sequential rhythm

2. **Cost** (varies, $0-$1M+) 
   - **Best for:** Frequency, Volume, Duration
   - Higher cost = higher pitch or louder volume
   - Creates dramatic variation

3. **Council_District** (1-14)
   - **Best for:** Filter frequency, Pan position
   - Each district could have its own sonic "character"
   - Lower districts = left pan, higher = right pan

4. **IsPermitModification** (0 or 1)
   - **Best for:** Waveform switcher (sine vs square)
   - Could trigger different sound qualities

5. **latitude** (39.25-39.37)
   - **Best for:** Filter cutoff, Reverb
   - North/South movement creates timbral shifts

6. **longitude** (-76.70 to -76.52)
   - **Best for:** Stereo panning
   - East/West movement = left/right stereo field
   - Creates spatial mapping

## Interesting Sonification Ideas:

### Option 1: Geographic Soundscape
- **Longitude → Pan**: West to East = Left to Right
- **Latitude → Filter**: North = Brighter, South = Darker  
- **Cost → Volume**: Expensive permits = louder
- **Council District → Note Spacing**: Create rhythmic patterns by district

### Option 2: Economic Story
- **Cost → Frequency**: Low to High pitch follows construction costs
- **Council District → Pan**: Spread districts across stereo field
- **IsPermitModification → Delay Mix**: Modified permits have more echo
- **OBJECTID → Note Spacing**: Play permits in chronological order

### Option 3: Texture Map
- **Cost → Filter Resonance**: Expensive = more resonant/metallic
- **Latitude → Reverb Decay**: North = longer reverb (cathedral-like)
- **Longitude → Delay Time**: East/West = different echo patterns
- **Council District → Waveform**: Each district = different wave type

## File Sizes:

- **Full file**: 265,550 records (~265MB) - Too large for browser
- **Sample file**: 20 records (`housing-sample.json`) - Ready to test!

## How to Use:

1. Open `json-mapper.html` in your browser
2. Load `datasets/housing-sample.json` (or paste the data)
3. Click "Parse JSON"
4. Try "Randomize All" a few times
5. Or manually map:
   - `Cost` → Frequency (hear expensive vs cheap permits)
   - `Council_District` → Pan (hear geographic spread)
   - `latitude` or `longitude` → Filter (hear spatial movement)

## Next Steps:

For the full dataset, you might want to:
1. Filter to a specific district or date range
2. Sample every Nth record (e.g., every 100th)
3. Use geographic boundaries
4. Add a data visualization that updates in sync with audio


