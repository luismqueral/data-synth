/**
 * Audio Store - React State Management for Audio System
 * Uses Zustand for lightweight state management
 */

import { create } from 'zustand';
import { AudioEngine } from '@/core/audio/AudioEngine';
import { WaveformType, FilterType } from '@/types/audio';

interface AudioState {
    // Audio engine instance
    engine: AudioEngine | null;
    
    // Playback state
    isPlaying: boolean;
    isPaused: boolean;
    currentIndex: number;
    
    // Mode
    samplerMode: boolean;
    
    // Sample info
    sampleLoaded: boolean;
    sampleDuration: number;
    sampleFileName: string;
    
    // Global settings
    masterVolume: number;
    masterPitch: number;
    speed: number;
    
    // Synth settings
    waveform: WaveformType;
    filterType: FilterType;
    
    // Processing flags
    pitchQuantization: boolean;
    rhythmicQuantization: boolean;
    adaptiveNormalization: boolean;
    
    // Sampler special modes
    randomChopMode: boolean;
    fullNoteDuration: boolean;
    
    // Actions
    initEngine: () => void;
    setIsPlaying: (playing: boolean) => void;
    setIsPaused: (paused: boolean) => void;
    setCurrentIndex: (index: number) => void;
    setSamplerMode: (mode: boolean) => void;
    setMasterVolume: (volume: number) => void;
    setMasterPitch: (pitch: number) => void;
    setSpeed: (speed: number) => void;
    setWaveform: (waveform: WaveformType) => void;
    setFilterType: (filterType: FilterType) => void;
    setPitchQuantization: (enabled: boolean) => void;
    setRhythmicQuantization: (enabled: boolean) => void;
    setAdaptiveNormalization: (enabled: boolean) => void;
    setRandomChopMode: (enabled: boolean) => void;
    setFullNoteDuration: (enabled: boolean) => void;
    loadSample: (file: File) => Promise<void>;
    clearSample: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
    // Initial state
    engine: null,
    isPlaying: false,
    isPaused: false,
    currentIndex: 0,
    samplerMode: false,
    sampleLoaded: false,
    sampleDuration: 0,
    sampleFileName: '',
    masterVolume: 0.2,
    masterPitch: 0,
    speed: 1,
    waveform: 'sine',
    filterType: 'lowpass',
    pitchQuantization: true,
    rhythmicQuantization: false,
    adaptiveNormalization: true,
    randomChopMode: false,
    fullNoteDuration: false,
    
    // Actions
    initEngine: () => {
        if (!get().engine) {
            const engine = new AudioEngine();
            engine.initialize();
            set({ engine });
        }
    },
    
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    setIsPaused: (paused) => set({ isPaused: paused }),
    setCurrentIndex: (index) => set({ currentIndex: index }),
    setSamplerMode: (mode) => set({ samplerMode: mode }),
    setMasterVolume: (volume) => set({ masterVolume: volume }),
    setMasterPitch: (pitch) => set({ masterPitch: pitch }),
    setSpeed: (speed) => set({ speed: speed }),
    setWaveform: (waveform) => set({ waveform }),
    setFilterType: (filterType) => set({ filterType }),
    setPitchQuantization: (enabled) => set({ pitchQuantization: enabled }),
    setRhythmicQuantization: (enabled) => set({ rhythmicQuantization: enabled }),
    setAdaptiveNormalization: (enabled) => set({ adaptiveNormalization: enabled }),
    setRandomChopMode: (enabled) => set({ randomChopMode: enabled }),
    setFullNoteDuration: (enabled) => set({ fullNoteDuration: enabled }),
    
    loadSample: async (file) => {
        const { engine } = get();
        if (!engine) {
            get().initEngine();
        }
        
        try {
            const info = await get().engine!.loadSample(file);
            set({
                sampleLoaded: true,
                sampleDuration: info.duration,
                sampleFileName: file.name
            });
        } catch (error) {
            console.error('Error loading sample:', error);
            throw error;
        }
    },
    
    clearSample: () => {
        const { engine } = get();
        engine?.clearSample();
        set({
            sampleLoaded: false,
            sampleDuration: 0,
            sampleFileName: ''
        });
    }
}));

