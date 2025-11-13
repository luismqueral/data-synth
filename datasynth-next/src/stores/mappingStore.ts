/**
 * Mapping Store - State Management for Parameter Mappings
 */

import { create } from 'zustand';
import { Mapping, AudioParams } from '@/types/audio';

interface MappingState {
    // Current mappings
    mappings: Record<string, Mapping>;
    
    // Actions
    setMapping: (param: string, mapping: Partial<Mapping>) => void;
    updateMapping: (param: string, updates: Partial<Mapping>) => void;
    clearMapping: (param: string) => void;
    clearAllMappings: () => void;
    setAllMappings: (mappings: Record<string, Mapping>) => void;
    initializeMappings: (mode: 'synthesizer' | 'sampler') => void;
}

// Default parameter configurations
const SYNTH_PARAMS = [
    { id: 'frequency', min: 200, max: 2000, default: 440 },
    { id: 'duration', min: 50, max: 2000, default: 200 },
    { id: 'noteSpacing', min: 50, max: 2000, default: 300 },
    { id: 'pan', min: -1, max: 1, default: 0 },
    { id: 'filterFreq', min: 200, max: 8000, default: 2000 },
    { id: 'filterQ', min: 0.1, max: 20, default: 1 },
    { id: 'delayTime', min: 50, max: 1000, default: 300 },
    { id: 'delayFeedback', min: 0.1, max: 0.85, default: 0.5 },
    { id: 'delayMix', min: 0.1, max: 0.9, default: 0.5 },
    { id: 'reverbDecay', min: 0.1, max: 10, default: 2 },
    { id: 'reverbMix', min: 0, max: 1, default: 0.3 },
    { id: 'attack', min: 1, max: 1000, default: 10 },
    { id: 'release', min: 1, max: 2000, default: 100 }
];

const SAMPLER_PARAMS = [
    { id: 'pitch', min: 0.25, max: 4, default: 1 },
    { id: 'sampleOffset', min: 0, max: 1, default: 0 },
    ...SYNTH_PARAMS.slice(1) // All except frequency
];

export const useMappingStore = create<MappingState>((set, get) => ({
    // Initial state
    mappings: {},
    
    // Actions
    setMapping: (param, mapping) => {
        set(state => ({
            mappings: {
                ...state.mappings,
                [param]: {
                    path: '',
                    fixed: 0,
                    min: 0,
                    max: 100,
                    curve: 'linear',
                    ...mapping
                }
            }
        }));
    },
    
    updateMapping: (param, updates) => {
        set(state => ({
            mappings: {
                ...state.mappings,
                [param]: {
                    ...state.mappings[param],
                    ...updates
                }
            }
        }));
    },
    
    clearMapping: (param) => {
        set(state => ({
            mappings: {
                ...state.mappings,
                [param]: {
                    ...state.mappings[param],
                    path: ''
                }
            }
        }));
    },
    
    clearAllMappings: () => {
        const clearedMappings: Record<string, Mapping> = {};
        Object.entries(get().mappings).forEach(([param, mapping]) => {
            clearedMappings[param] = {
                ...mapping,
                path: ''
            };
        });
        set({ mappings: clearedMappings });
    },
    
    setAllMappings: (mappings) => set({ mappings }),
    
    initializeMappings: (mode) => {
        const params = mode === 'sampler' ? SAMPLER_PARAMS : SYNTH_PARAMS;
        const newMappings: Record<string, Mapping> = {};
        
        params.forEach(param => {
            newMappings[param.id] = {
                path: '',
                fixed: param.default,
                min: param.min,
                max: param.max,
                curve: 'linear'
            };
        });
        
        set({ mappings: newMappings });
    }
}));

