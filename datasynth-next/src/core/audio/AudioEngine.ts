/**
 * AudioEngine - Framework-Agnostic Audio System
 * 
 * Coordinates all Web Audio API operations.
 * This class has NO framework dependencies and can be used in any JavaScript environment.
 */

import { AudioParams, WaveformType, FilterType } from '@/types/audio';

export class AudioEngine {
    private context: AudioContext | null = null;
    private isInitialized = false;
    
    // Global effects (shared by all notes)
    private delayNode: DelayNode | null = null;
    private delayFeedbackGain: GainNode | null = null;
    private delayWetGain: GainNode | null = null;
    private delayDryGain: GainNode | null = null;
    private reverbNode: ConvolverNode | null = null;
    private reverbWetGain: GainNode | null = null;
    private reverbDryGain: GainNode | null = null;
    private previousDelayTime: number | null = null;
    
    // Visualization
    private analyser: AnalyserNode | null = null;
    
    // Sampler
    private sampleBuffer: AudioBuffer | null = null;
    
    constructor() {
        // Constructor is intentionally empty - initialization happens lazily
    }
    
    /**
     * Initialize audio context and effects chain
     */
    initialize(): void {
        if (this.isInitialized) return;
        
        this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.initEffects();
        this.setupAnalyser();
        this.isInitialized = true;
        
        console.log('✅ AudioEngine initialized');
    }
    
    /**
     * Get audio context (initializes if needed)
     */
    getContext(): AudioContext {
        if (!this.context) {
            this.initialize();
        }
        return this.context!;
    }
    
    /**
     * Get analyser node for visualization
     */
    getAnalyser(): AnalyserNode | null {
        return this.analyser;
    }
    
    /**
     * Load audio sample for sampler mode
     */
    async loadSample(file: File): Promise<{ duration: number; sampleRate: number; channels: number }> {
        if (!this.context) this.initialize();
        
        const arrayBuffer = await file.arrayBuffer();
        this.sampleBuffer = await this.context!.decodeAudioData(arrayBuffer);
        
        return {
            duration: this.sampleBuffer.duration,
            sampleRate: this.sampleBuffer.sampleRate,
            channels: this.sampleBuffer.numberOfChannels
        };
    }
    
    /**
     * Clear loaded sample
     */
    clearSample(): void {
        this.sampleBuffer = null;
    }
    
    /**
     * Get sample buffer
     */
    getSampleBuffer(): AudioBuffer | null {
        return this.sampleBuffer;
    }
    
    /**
     * Reset delay time tracking (call at start of new playback)
     */
    resetDelayTime(): void {
        this.previousDelayTime = null;
    }
    
    /**
     * Initialize global effects chain
     */
    private initEffects(): void {
        if (!this.context) return;
        
        // Delay setup
        this.delayNode = this.context.createDelay(2.0);
        this.delayFeedbackGain = this.context.createGain();
        this.delayWetGain = this.context.createGain();
        this.delayDryGain = this.context.createGain();
        
        // Delay feedback loop
        this.delayNode.connect(this.delayFeedbackGain);
        this.delayFeedbackGain.connect(this.delayNode);
        this.delayNode.connect(this.delayWetGain);
        
        // Reverb setup
        this.reverbNode = this.context.createConvolver();
        this.reverbNode.buffer = this.createReverbImpulse(2, 2);
        this.reverbWetGain = this.context.createGain();
        this.reverbDryGain = this.context.createGain();
        
        this.reverbNode.connect(this.reverbWetGain);
        
        // Connect effects chain: Reverb → Delay → Output
        this.reverbWetGain.connect(this.delayNode);
        this.reverbWetGain.connect(this.delayDryGain);
        this.reverbDryGain.connect(this.delayNode);
        this.reverbDryGain.connect(this.context.destination);
        this.delayWetGain.connect(this.context.destination);
    }
    
    /**
     * Setup analyser node for visualization
     */
    private setupAnalyser(): void {
        if (!this.context || !this.reverbWetGain) return;
        
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 256; // Low latency
        this.analyser.smoothingTimeConstant = 0; // Instant response
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;
        
        // Connect to effects chain output
        this.reverbWetGain.connect(this.analyser);
        this.analyser.connect(this.context.destination);
    }
    
    /**
     * Create synthetic reverb impulse response
     */
    private createReverbImpulse(duration: number, decay: number): AudioBuffer {
        if (!this.context) throw new Error('Audio context not initialized');
        
        const sampleRate = this.context.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.context.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            }
        }
        
        return impulse;
    }
    
    /**
     * Update global effects parameters
     */
    updateEffects(params: {
        delayTime?: number;
        delayFeedback?: number;
        delayMix?: number;
        reverbDecay?: number;
        reverbMix?: number;
    }): void {
        if (!this.context) return;
        
        const now = this.context.currentTime;
        
        // Update delay
        if (params.delayTime !== undefined && this.delayNode) {
            let delayTime = params.delayTime;
            
            // Add subtle variation (±15%)
            const variation = 0.85 + (Math.random() * 0.3);
            delayTime = delayTime * variation;
            
            const newDelayTimeSeconds = Math.max(0.001, Math.min(2, delayTime / 1000));
            
            // Analog-style pitch shifting
            if (this.previousDelayTime !== null && Math.abs(newDelayTimeSeconds - this.previousDelayTime) > 0.005) {
                const rampTime = 0.05; // 50ms ramp creates pitch bend
                try {
                    this.delayNode.delayTime.cancelScheduledValues(now);
                    this.delayNode.delayTime.setValueAtTime(this.previousDelayTime, now);
                    this.delayNode.delayTime.linearRampToValueAtTime(newDelayTimeSeconds, now + rampTime);
                } catch (e) {
                    this.delayNode.delayTime.setValueAtTime(newDelayTimeSeconds, now);
                }
            } else {
                this.delayNode.delayTime.setValueAtTime(newDelayTimeSeconds, now);
            }
            this.previousDelayTime = newDelayTimeSeconds;
        }
        
        if (params.delayFeedback !== undefined && this.delayFeedbackGain) {
            const safeFeedback = Math.max(0, Math.min(0.9, params.delayFeedback));
            this.delayFeedbackGain.gain.setValueAtTime(safeFeedback, now);
        }
        
        if (params.delayMix !== undefined && this.delayWetGain && this.delayDryGain) {
            const safeMix = Math.max(0, Math.min(1, params.delayMix));
            this.delayWetGain.gain.setValueAtTime(safeMix, now);
            this.delayDryGain.gain.setValueAtTime(1 - safeMix, now);
        }
        
        // Update reverb
        if (params.reverbDecay !== undefined && this.reverbNode) {
            if (!this.reverbNode.buffer || Math.abs(this.reverbNode.buffer.duration - params.reverbDecay) > 0.5) {
                this.reverbNode.buffer = this.createReverbImpulse(params.reverbDecay, params.reverbDecay);
            }
        }
        
        if (params.reverbMix !== undefined && this.reverbWetGain && this.reverbDryGain) {
            const safeMix = Math.max(0, Math.min(1, params.reverbMix));
            this.reverbWetGain.gain.value = safeMix;
            this.reverbDryGain.gain.value = 1 - safeMix;
        }
    }
    
    /**
     * Create noise buffer
     */
    createNoiseBuffer(type: 'white-noise' | 'pink-noise' | 'brown-noise', duration: number): AudioBuffer {
        if (!this.context) throw new Error('Audio context not initialized');
        
        const bufferSize = this.context.sampleRate * (duration / 1000);
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        if (type === 'white-noise') {
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        } else if (type === 'pink-noise') {
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                b6 = white * 0.115926;
            }
        } else if (type === 'brown-noise') {
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5;
            }
        }
        
        return buffer;
    }
    
    /**
     * Create custom oscillator or buffer source
     */
    createSource(frequency: number, waveform: WaveformType, duration: number): OscillatorNode | AudioBufferSourceNode {
        if (!this.context) throw new Error('Audio context not initialized');
        
        if (waveform === 'white-noise' || waveform === 'pink-noise' || waveform === 'brown-noise') {
            const source = this.context.createBufferSource();
            source.buffer = this.createNoiseBuffer(waveform, duration);
            source.loop = false;
            return source;
        } else if (waveform === 'fm') {
            const carrier = this.context.createOscillator();
            const modulator = this.context.createOscillator();
            const modulatorGain = this.context.createGain();
            
            carrier.frequency.value = frequency;
            modulator.frequency.value = frequency * 2.5;
            modulatorGain.gain.value = frequency * 0.8;
            
            modulator.connect(modulatorGain);
            modulatorGain.connect(carrier.frequency);
            
            carrier.type = 'sine';
            modulator.type = 'sine';
            
            (carrier as any)._modulator = modulator;
            (carrier as any)._modulatorGain = modulatorGain;
            
            return carrier;
        } else if (waveform === 'additive') {
            const osc = this.context.createOscillator();
            osc.frequency.value = frequency;
            osc.type = 'sine';
            (osc as any)._isAdditive = true;
            return osc;
        } else if (waveform === 'pwm') {
            const osc = this.context.createOscillator();
            osc.frequency.value = frequency;
            osc.type = 'square';
            (osc as any)._isPWM = true;
            return osc;
        } else {
            const osc = this.context.createOscillator();
            osc.frequency.value = frequency;
            osc.type = waveform;
            return osc;
        }
    }
    
    /**
     * Play a note with full effects chain
     */
    playNote(params: {
        mode: 'synthesizer' | 'sampler';
        audioParams: AudioParams;
        volume: number;
        waveform?: WaveformType;
        filterType?: FilterType;
        pitchTranspose?: number;
        quantizePitch?: boolean;
        randomChopMode?: boolean;
        fullNoteDuration?: boolean;
    }): void {
        if (!this.context) this.initialize();
        
        const {
            mode,
            audioParams,
            volume,
            waveform = 'sine',
            filterType = 'lowpass',
            pitchTranspose = 0,
            quantizePitch = false,
            randomChopMode = false,
            fullNoteDuration = false
        } = params;
        
        const now = this.context!.currentTime;
        const duration = audioParams.duration || 200;
        const durationTime = duration / 1000;
        
        // Create per-note nodes
        const filter = this.context!.createBiquadFilter();
        const panner = this.context!.createStereoPanner();
        const envelope = this.context!.createGain();
        
        let source: OscillatorNode | AudioBufferSourceNode;
        
        if (mode === 'sampler' && this.sampleBuffer) {
            source = this.createSamplerSource(audioParams, pitchTranspose, randomChopMode, fullNoteDuration);
        } else {
            source = this.createSynthesizerSource(audioParams, waveform, pitchTranspose, quantizePitch, duration);
        }
        
        // Configure filter
        filter.type = filterType;
        filter.frequency.value = audioParams.filterFreq || 2000;
        filter.Q.value = audioParams.filterQ || 1;
        
        // Configure panner
        panner.pan.value = Math.max(-1, Math.min(1, audioParams.pan || 0));
        
        // Configure envelope with anti-click protection
        const minSmoothTime = mode === 'sampler' ? 0.003 : 0; // 3ms for samples
        const attackTime = Math.max(minSmoothTime, (audioParams.attack || 10) / 1000);
        const releaseTime = Math.max(minSmoothTime, (audioParams.release || 100) / 1000);
        
        envelope.gain.setValueAtTime(0.001, now);
        envelope.gain.exponentialRampToValueAtTime(volume, now + attackTime);
        envelope.gain.setValueAtTime(volume, now + Math.max(attackTime, durationTime - releaseTime));
        envelope.gain.exponentialRampToValueAtTime(0.001, now + durationTime);
        
        // Handle additive synthesis
        if (mode === 'synthesizer' && (source as any)._isAdditive) {
            this.connectAdditiveSynth(source as OscillatorNode, filter, audioParams.frequency || 440, pitchTranspose, durationTime);
        } else {
            source.connect(filter);
        }
        
        // Connect chain: Filter → Pan → Envelope → Reverb → Delay
        filter.connect(panner);
        panner.connect(envelope);
        envelope.connect(this.reverbNode!);
        envelope.connect(this.reverbDryGain!);
        
        // Start source
        if (mode === 'sampler' && (source as any)._offsetSeconds !== undefined) {
            (source as AudioBufferSourceNode).start(now, (source as any)._offsetSeconds, (source as any)._cropDuration);
        } else {
            source.start(now);
            source.stop(now + durationTime);
            
            if ((source as any)._modulator) {
                (source as any)._modulator.start(now);
                (source as any)._modulator.stop(now + durationTime);
            }
        }
    }
    
    /**
     * Create sampler source
     */
    private createSamplerSource(
        audioParams: AudioParams,
        pitchTranspose: number,
        randomChopMode: boolean,
        fullNoteDuration: boolean
    ): AudioBufferSourceNode {
        if (!this.context || !this.sampleBuffer) throw new Error('Sample not loaded');
        
        const source = this.context.createBufferSource();
        source.buffer = this.sampleBuffer;
        
        // Playback rate
        const pitchRate = audioParams.pitch ?? 1;
        const transposeSemitones = Math.pow(2, pitchTranspose / 12);
        source.playbackRate.value = pitchRate * transposeSemitones;
        
        // Sample offset
        let sampleOffsetSeconds: number;
        
        if (randomChopMode) {
            const chunkDuration = 5.0;
            const startIncrement = 1.0;
            const maxStartTime = Math.max(0, this.sampleBuffer.duration - chunkDuration);
            
            if (maxStartTime > 0) {
                const numPositions = Math.floor(maxStartTime / startIncrement) + 1;
                const randomPosition = Math.floor(Math.random() * numPositions);
                sampleOffsetSeconds = randomPosition * startIncrement;
            } else {
                sampleOffsetSeconds = 0;
            }
        } else {
            const sampleOffsetNorm = audioParams.sampleOffset ?? 0;
            sampleOffsetSeconds = sampleOffsetNorm * this.sampleBuffer.duration;
        }
        
        // Crop duration
        let cropDurationSeconds: number;
        if (randomChopMode) {
            cropDurationSeconds = 5.0;
        } else if (fullNoteDuration) {
            cropDurationSeconds = (audioParams.noteSpacing || 300) / 1000;
        } else {
            cropDurationSeconds = (audioParams.duration || 200) / 1000;
        }
        
        (source as any)._offsetSeconds = sampleOffsetSeconds;
        (source as any)._cropDuration = cropDurationSeconds;
        
        return source;
    }
    
    /**
     * Create synthesizer source
     */
    private createSynthesizerSource(
        audioParams: AudioParams,
        waveform: WaveformType,
        pitchTranspose: number,
        quantizePitch: boolean,
        duration: number
    ): OscillatorNode | AudioBufferSourceNode {
        let frequency = audioParams.frequency || 440;
        frequency = frequency * Math.pow(2, pitchTranspose / 12);
        
        if (quantizePitch) {
            frequency = this.quantizePitchToScale(frequency, 'pentatonic');
        }
        
        return this.createSource(frequency, waveform, duration);
    }
    
    /**
     * Connect additive synthesis harmonics
     */
    private connectAdditiveSynth(
        fundamental: OscillatorNode,
        filter: BiquadFilterNode,
        baseFrequency: number,
        pitchTranspose: number,
        durationTime: number
    ): void {
        if (!this.context) return;
        
        const harmonicGain = this.context.createGain();
        harmonicGain.gain.value = 0.6;
        fundamental.connect(harmonicGain);
        harmonicGain.connect(filter);
        
        const transposedFrequency = baseFrequency * Math.pow(2, pitchTranspose / 12);
        const now = this.context.currentTime;
        
        for (let h = 2; h <= 4; h++) {
            const harmonic = this.context.createOscillator();
            const hGain = this.context.createGain();
            harmonic.frequency.value = transposedFrequency * h;
            harmonic.type = 'sine';
            hGain.gain.value = 0.3 / h;
            harmonic.connect(hGain);
            hGain.connect(filter);
            harmonic.start(now);
            harmonic.stop(now + durationTime);
        }
    }
    
    /**
     * Quantize pitch to musical scale
     */
    private quantizePitchToScale(frequency: number, scaleType: string = 'pentatonic'): number {
        const scales: Record<string, number[]> = {
            pentatonic: [0, 2, 4, 7, 9],
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            dorian: [0, 2, 3, 5, 7, 9, 10],
            mixolydian: [0, 2, 4, 5, 7, 9, 10],
            chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        };
        
        const scale = scales[scaleType] || scales.pentatonic;
        const midiNote = 69 + 12 * Math.log2(frequency / 440);
        const octave = Math.floor(midiNote / 12);
        const noteInOctave = midiNote % 12;
        
        let closestScaleDegree = scale[0];
        let minDistance = Math.abs(noteInOctave - closestScaleDegree);
        
        for (const degree of scale) {
            const distance = Math.abs(noteInOctave - degree);
            if (distance < minDistance) {
                minDistance = distance;
                closestScaleDegree = degree;
            }
        }
        
        const quantizedMidi = octave * 12 + closestScaleDegree;
        return 440 * Math.pow(2, (quantizedMidi - 69) / 12);
    }
    
    /**
     * Cleanup and disconnect all nodes
     */
    cleanup(): void {
        if (this.delayNode) this.delayNode.disconnect();
        if (this.reverbNode) this.reverbNode.disconnect();
        if (this.analyser) this.analyser.disconnect();
        
        if (this.context && this.context.state !== 'closed') {
            this.context.close();
        }
        
        this.isInitialized = false;
    }
}

