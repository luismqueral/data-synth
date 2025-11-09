# newsreader.json

Data sonification for design system metrics. Translates JSON structure into multi-dimensional sound.

## Run

```bash
python3 -m http.server 5555
```

Open `http://localhost:5555`

## Mappings

- Color refs → Root note (D Mixolydian)
- Typography refs → Chord 3rd
- Spacing refs → Chord 5th + Stereo pan
- Other refs → Chord 7th/Octave + Reverb
- Total refs → Volume
- Dominant category → Instrument timbre

## Controls

- Tempo slider: 50ms-3000ms per note
- Delay mode: Analog (pitch-shift) / Digital (clean)
- Playback: Play/Pause/Stop

## Tech

- Tone.js for audio synthesis
- Pure HTML/JS, no build step

