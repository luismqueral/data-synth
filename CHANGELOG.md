# Changelog

## 2025-11-09
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

