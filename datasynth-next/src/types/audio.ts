// Audio System Types

export type WaveformType = 
    | 'sine' | 'square' | 'sawtooth' | 'triangle'
    | 'white-noise' | 'pink-noise' | 'brown-noise'
    | 'fm' | 'additive' | 'pwm';

export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';

export type CurveType = 'linear' | 'exponential' | 'cubic' | 'logarithmic' | 'inverse';

export interface AudioParams {
    // Synthesizer
    frequency?: number;
    
    // Sampler
    pitch?: number;
    sampleOffset?: number;
    
    // Common
    duration: number;
    noteSpacing: number;
    pan: number;
    filterFreq: number;
    filterQ: number;
    delayTime: number;
    delayFeedback: number;
    delayMix: number;
    reverbDecay: number;
    reverbMix: number;
    attack: number;
    release: number;
}

export interface Mapping {
    path: string;
    fixed: number;
    min: number;
    max: number;
    curve: CurveType;
}

export interface AudioParamConfig {
    id: keyof AudioParams;
    label: string;
    min: number;
    max: number;
    default: number;
    unit?: string;
}

export interface DataRange {
    min: number;
    max: number;
}

