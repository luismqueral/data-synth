# Changelog

## 2025-11-09
- created p5.js live coding terminal version with fullscreen generative visuals - classic green-on-black CRT aesthetic with scanlines, expanding particle system triggered by data values, waveform visualization, keyboard controls (SPACE=pause, R=restart, arrows=tempo), terminal text overlay showing component info in real-time
- reduced dissonance by simplifying chord generation to only consonant intervals (root, major 3rd, perfect 5th, octave), removed 7th chords that were creating tension
- lowered vibrato depth from 30% to 8% max for subtler modulation that doesn't clash
- reduced delay feedback from 93% to 65% and wet mix from 40% to 35% to prevent excessive buildup of dissonant echoes
- added smooth ramping to filter and vibrato changes to avoid abrupt timbral shifts
- removed balance and depth meta-nodes from visualization for cleaner data flow diagram showing only direct category-to-audio mappings
- added three new data-to-audio mappings: token diversity (total unique tokens across all categories) controls filter brightness/cutoff frequency for timbral complexity, category balance (how imbalanced vs evenly distributed the refs are) controls vibrato depth where imbalanced components get wobble, path depth (folder nesting level) controls reverb room size where deeper paths create cathedral-like spaces
- expanded visualization to show new derived data sources (token diversity, category balance, path depth) as middle-layer nodes that flow to audio parameters (brightness, vibrato, room size)
- added dimming for inactive/null values in visualization - nodes and connections fade to gray when not in use, making it easy to focus on only the active sound parameters being generated at each moment
- added D3.js node-based visualization showing real-time data-to-audio parameter flow - left side shows data inputs (color/typography/spacing/other refs), right side shows audio outputs (root/3rd/5th/7th, pan, delay), connections highlight and thicken based on current component values
- inverted color scheme to white background with black text for better readability while maintaining brutalist aesthetic
- redesigned interface with minimal brutalist aesthetic using IBM Plex Mono font - black background, white borders, tight spacing for raw data-focused presentation
- increased delay feedback to 93% for near-infinite echo buildup across the entire composition
- added analog vs digital delay mode toggle - analog mode creates tape-style pitch-shifting when delay time changes, digital mode is clean
- implemented chord generation system where typography/spacing/other refs add harmonic intervals (3rd/5th/7th/octave) to root note
- switched to D Mixolydian scale for modal jazz character with characteristic flat 7th
- added tempo slider (50-3000ms) with real-time adjustment during playback
- improved volume normalization with cube-root compression for consistent loudness across all components
- mapped typography refs to delay time creating analog tape speed effects that pitch-shift the entire delay buffer
- shifted pitch range up one octave for brighter, more present sound
- mapped spacing refs to stereo panning for spatial movement
- mapped other refs to reverb wetness for ambient depth
- created multi-dimensional sonification mapping design system metrics to pitch/volume/pan/delay/reverb/chords
- initialized git repository and created brutalist-ui branch
- built initial HTML/Tone.js prototype for translating metrics.json component data into sound

