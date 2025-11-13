'use client';

import { useState } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import * as Slider from '@radix-ui/react-slider';

export default function GlobalSettings() {
  const [isOpen, setIsOpen] = useState(false);
  
  const masterVolume = useAudioStore(state => state.masterVolume);
  const setMasterVolume = useAudioStore(state => state.setMasterVolume);
  
  const masterPitch = useAudioStore(state => state.masterPitch);
  const setMasterPitch = useAudioStore(state => state.setMasterPitch);
  
  const speed = useAudioStore(state => state.speed);
  const setSpeed = useAudioStore(state => state.setSpeed);
  
  const samplerMode = useAudioStore(state => state.samplerMode);
  const setSamplerMode = useAudioStore(state => state.setSamplerMode);
  
  const waveform = useAudioStore(state => state.waveform);
  const setWaveform = useAudioStore(state => state.setWaveform);
  
  const filterType = useAudioStore(state => state.filterType);
  const setFilterType = useAudioStore(state => state.setFilterType);
  
  const pitchQuantization = useAudioStore(state => state.pitchQuantization);
  const setPitchQuantization = useAudioStore(state => state.setPitchQuantization);
  
  const rhythmicQuantization = useAudioStore(state => state.rhythmicQuantization);
  const setRhythmicQuantization = useAudioStore(state => state.setRhythmicQuantization);
  
  const adaptiveNormalization = useAudioStore(state => state.adaptiveNormalization);
  const setAdaptiveNormalization = useAudioStore(state => state.setAdaptiveNormalization);
  
  const randomChopMode = useAudioStore(state => state.randomChopMode);
  const setRandomChopMode = useAudioStore(state => state.setRandomChopMode);
  
  const fullNoteDuration = useAudioStore(state => state.fullNoteDuration);
  const setFullNoteDuration = useAudioStore(state => state.setFullNoteDuration);
  
  const sampleLoaded = useAudioStore(state => state.sampleLoaded);
  const sampleFileName = useAudioStore(state => state.sampleFileName);
  const sampleDuration = useAudioStore(state => state.sampleDuration);
  const loadSample = useAudioStore(state => state.loadSample);
  const clearSample = useAudioStore(state => state.clearSample);
  
  return (
    <div className="border border-gray-300 bg-gray-100 mb-5 font-mono">
      <div
        className="p-3 bg-white border-b border-gray-300 cursor-pointer flex items-center justify-between hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-base">Global Settings</span>
        <span className="text-sm transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
          ▼
        </span>
      </div>
      
      {isOpen && (
        <div className="p-5">
          {/* Volume Section */}
          <div className="mb-4 pb-3 border-b-2 border-gray-300">
            <div className="font-semibold mb-2 text-sm">Volume</div>
            
            <label className="block mb-3">
              <span className="block mb-1 text-sm">Master Volume:</span>
              <Slider.Root
                value={[masterVolume]}
                onValueChange={([value]) => setMasterVolume(value)}
                min={0}
                max={1}
                step={0.01}
                className="relative flex items-center w-full h-5"
              >
                <Slider.Track className="relative h-1 w-full bg-gray-300 rounded">
                  <Slider.Range className="absolute h-full bg-black rounded" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-black rounded-full focus:outline-none focus:ring-2 focus:ring-black" />
              </Slider.Root>
              <span className="text-sm">{masterVolume.toFixed(2)} ({(masterVolume * 100).toFixed(0)}%)</span>
            </label>
            
            <label className="block mb-3">
              <span className="block mb-1 text-sm">Master Pitch:</span>
              <Slider.Root
                value={[masterPitch]}
                onValueChange={([value]) => setMasterPitch(value)}
                min={-24}
                max={24}
                step={0.1}
                className="relative flex items-center w-full h-5"
              >
                <Slider.Track className="relative h-1 w-full bg-gray-300 rounded">
                  <Slider.Range className="absolute h-full bg-black rounded" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-black rounded-full focus:outline-none focus:ring-2 focus:ring-black" />
              </Slider.Root>
              <span className="text-sm">{masterPitch >= 0 ? '+' : ''}{masterPitch.toFixed(1)} semitones</span>
            </label>
            
            <label className="block mb-2">
              <span className="block mb-1 text-sm">Speed:</span>
              <Slider.Root
                value={[speed]}
                onValueChange={([value]) => setSpeed(value)}
                min={0.1}
                max={5}
                step={0.1}
                className="relative flex items-center w-full h-5"
              >
                <Slider.Track className="relative h-1 w-full bg-gray-300 rounded">
                  <Slider.Range className="absolute h-full bg-black rounded" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-black rounded-full focus:outline-none focus:ring-2 focus:ring-black" />
              </Slider.Root>
              <span className="text-sm">{speed.toFixed(1)}x</span>
            </label>
          </div>
          
          {/* Sound Source Section */}
          <div className="mb-4 pb-3 border-b-2 border-gray-300">
            <div className="font-semibold mb-2 text-sm">Sound Source</div>
            
            <label className="block mb-2 text-sm">
              <input
                type="radio"
                checked={!samplerMode}
                onChange={() => setSamplerMode(false)}
                className="mr-2"
              />
              <span>🎹 Synthesizer (Oscillators)</span>
            </label>
            
            <label className="block mb-2 text-sm">
              <input
                type="radio"
                checked={samplerMode}
                onChange={() => setSamplerMode(true)}
                className="mr-2"
              />
              <span>🎵 Sampler (Audio Files)</span>
            </label>
            
            {/* Sample Upload (Sampler Mode) */}
            {samplerMode && (
              <div className="mt-3 p-3 bg-gray-100 border border-gray-300 rounded">
                <label className="block mb-2">
                  <span className="block mb-1 text-xs font-semibold">Load Audio Sample:</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          await loadSample(file);
                        } catch (error) {
                          alert('Error loading sample: ' + (error as Error).message);
                        }
                      }
                    }}
                    className="text-sm w-full p-1"
                  />
                  <div className="text-xs mt-1 text-gray-600">
                    Best: WAV, MP3, OGG
                  </div>
                </label>
                
                {sampleLoaded && (
                  <div className="mt-2 p-2 bg-white border border-gray-300 rounded text-xs">
                    <div className="mb-1">
                      <span className="font-semibold">📄 File:</span> {sampleFileName}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">⏱ Duration:</span> {sampleDuration.toFixed(2)}s
                    </div>
                    
                    <div className="py-1 border-t border-gray-300 mb-2">
                      <label className="block text-xs mt-2">
                        <input
                          type="checkbox"
                          checked={randomChopMode}
                          onChange={(e) => setRandomChopMode(e.target.checked)}
                          className="mr-1"
                        />
                        <span className="font-semibold">🎲 Random Chop Mode</span>
                      </label>
                      <div className="text-xs mt-1 text-gray-600 leading-tight">
                        Plays 5-second chunks from random positions
                      </div>
                    </div>
                    
                    <div className="py-1 border-t border-gray-300 mb-2">
                      <label className="block text-xs mt-2">
                        <input
                          type="checkbox"
                          checked={fullNoteDuration}
                          onChange={(e) => setFullNoteDuration(e.target.checked)}
                          className="mr-1"
                        />
                        <span className="font-semibold">🎵 Full Note Duration</span>
                      </label>
                      <div className="text-xs mt-1 text-gray-600 leading-tight">
                        Sample plays for entire note duration
                      </div>
                    </div>
                    
                    <button
                      onClick={clearSample}
                      className="mt-1 px-2 py-1 text-xs border border-black bg-white hover:bg-black hover:text-white w-full"
                    >
                      Clear Sample
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Processing Section */}
          <div className="mb-4">
            <div className="font-semibold mb-2 text-sm">Processing</div>
            
            <label className="block mb-2 text-sm">
              <input
                type="checkbox"
                checked={adaptiveNormalization}
                onChange={(e) => setAdaptiveNormalization(e.target.checked)}
                className="mr-2"
              />
              <span>Adaptive Normalization</span>
            </label>
            <div className="text-xs ml-6 mb-2 text-gray-600 leading-tight" style={{ marginTop: '-6px' }}>
              Automatically balances data ranges
            </div>
            
            <label className="block mb-2 text-sm">
              <input
                type="checkbox"
                checked={rhythmicQuantization}
                onChange={(e) => setRhythmicQuantization(e.target.checked)}
                className="mr-2"
              />
              <span>Rhythmic Quantization</span>
            </label>
            <div className="text-xs ml-6 mb-2 text-gray-600 leading-tight" style={{ marginTop: '-6px' }}>
              Snaps note timings to a grid
            </div>
            
            <label className="block mb-2 text-sm">
              <input
                type="checkbox"
                checked={pitchQuantization}
                onChange={(e) => setPitchQuantization(e.target.checked)}
                className="mr-2"
              />
              <span>Pitch Quantization (Scale)</span>
            </label>
            <div className="text-xs ml-6 mb-2 text-gray-600 leading-tight" style={{ marginTop: '-6px' }}>
              Constrains pitches to musical scale
            </div>
          </div>
          
          {/* Waveform Section (Synthesizer Mode) */}
          {!samplerMode && (
            <div className="mb-4">
              <div className="font-semibold mb-2 text-sm">Waveform</div>
              
              <div className="mb-2 pb-2 border-b border-gray-300">
                <div className="text-xs mb-1 text-gray-600">Classic</div>
                {['sine', 'square', 'sawtooth', 'triangle'].map((type) => (
                  <label key={type} className="block mb-1 text-sm">
                    <input
                      type="radio"
                      checked={waveform === type}
                      onChange={() => setWaveform(type as any)}
                      className="mr-1"
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
              
              <div className="mb-2 pb-2 border-b border-gray-300">
                <div className="text-xs mb-1 text-gray-600">Noise</div>
                {['white-noise', 'pink-noise', 'brown-noise'].map((type) => (
                  <label key={type} className="block mb-1 text-sm">
                    <input
                      type="radio"
                      checked={waveform === type}
                      onChange={() => setWaveform(type as any)}
                      className="mr-1"
                    />
                    {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </label>
                ))}
              </div>
              
              <div>
                <div className="text-xs mb-1 text-gray-600">Synthesis</div>
                {['fm', 'additive', 'pwm'].map((type) => (
                  <label key={type} className="block mb-1 text-sm">
                    <input
                      type="radio"
                      checked={waveform === type}
                      onChange={() => setWaveform(type as any)}
                      className="mr-1"
                    />
                    {type === 'fm' ? 'FM Synthesis' : 
                     type === 'additive' ? 'Additive (Harmonics)' : 
                     'Pulse Width Mod'}
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* Filter Section (Synthesizer Mode) */}
          {!samplerMode && (
            <div className="mb-4">
              <div className="font-semibold mb-2 text-sm">Filter</div>
              {['lowpass', 'highpass', 'bandpass', 'notch'].map((type) => (
                <label key={type} className="block mb-1 text-sm">
                  <input
                    type="radio"
                    checked={filterType === type}
                    onChange={() => setFilterType(type as any)}
                    className="mr-1"
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

