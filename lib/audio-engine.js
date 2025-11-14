/**
 * MODULE: Audio Engine
 * 
 * Purpose: Manage Web Audio API context, synthesis, effects chain, and visualization
 * 
 * Key Exports:
 * - AudioEngine class - Coordinates all audio processing
 *   - initEffects() - Set up delay and reverb effects chain
 *   - createCustomOscillator() - Generate oscillators, noise, FM, additive synthesis
 *   - createNoiseBuffer() - Generate white/pink/brown noise buffers
 *   - createReverbImpulse() - Generate reverb impulse response
 *   - setupVisualizer() - Initialize waveform canvas visualization
 *   - drawVisualizer() - Animate waveform display
 *   - cleanup() - Clean up audio resources
 * 
 * Dependencies:
 * - None (pure Web Audio API)
 * 
 * Used By:
 * - main.js (playback coordination)
 * - json-mapper-v2.html (during migration)
 * 
 * Browser APIs Used:
 * - Web Audio API (AudioContext, OscillatorNode, GainNode, etc.)
 * - Canvas API (for waveform visualization)
 * - requestAnimationFrame (for smooth animation)
 */

/**
 * Audio Engine Class
 * 
 * This is a class (not functions) because:
 * - AudioContext must persist across multiple note plays
 * - Effects nodes (delay, reverb) are shared globally
 * - Visualizer state needs to be tracked
 * - Sampler buffer needs to be stored
 * - Cleanup is required (close context to free memory)
 * 
 * Usage:
 *   const engine = new AudioEngine();
 *   engine.initEffects();
 *   
 *   // Synthesizer mode
 *   const osc = engine.createCustomOscillator(440, 'sine', 1000);
 *   
 *   // Sampler mode
 *   await engine.loadSample(audioFile);
 *   
 *   // Cleanup when done
 *   engine.cleanup();
 */
export class AudioEngine {
    constructor() {
        // Web Audio API context (created on first use due to user gesture requirement)
        this.audioContext = null;
        
        // Global effects nodes (shared across all notes)
        this.delayNode = null;
        this.delayFeedbackGain = null;
        this.delayWetGain = null;
        this.delayDryGain = null;
        this.reverbNode = null;
        this.reverbWetGain = null;
        this.reverbDryGain = null;
        
        // Delay pitch shifting state
        this.previousDelayTime = null;
        
        // Sampler state
        this.samplerMode = false;
        this.sampleBuffer = null;
        this.sampleFileName = '';
        this.sampleDuration = 0;
        
        // Visualizer state
        this.analyser = null;
        this.dataArray = null;
        this.animationId = null;
        this.visualizerCanvas = null;
        this.visualizerCtx = null;
    }
    
    /**
     * Initialize audio context and global effects chain
     * 
     * This sets up the effects routing:
     * Input → Reverb (wet/dry) → Delay (wet/dry/feedback) → Destination (speakers)
     * 
     * IMPORTANT: Must be called from user interaction (button click)
     * Browsers require user gesture before audio playback for security/UX
     */
    initEffects() {
        // Create audio context if it doesn't exist
        if (!this.audioContext) {
            // Use prefixed version for Safari compatibility
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('✅ AudioContext created (sample rate:', this.audioContext.sampleRate, 'Hz)');
        }
        
        // Resume if suspended (common on mobile Safari)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // ========================================================================
        // DELAY EFFECT SETUP
        // ========================================================================
        // Delay creates echo effect with feedback loop
        // Signal flow: Input → Delay → Feedback (back to delay) + Wet Mix → Output
        //                           → Dry Mix → Output
        
        this.delayNode = this.audioContext.createDelay(2.0); // Max 2 seconds delay
        this.delayFeedbackGain = this.audioContext.createGain();
        this.delayWetGain = this.audioContext.createGain();
        this.delayDryGain = this.audioContext.createGain();
        
        // Connect delay feedback loop
        this.delayNode.connect(this.delayFeedbackGain);
        this.delayFeedbackGain.connect(this.delayNode); // Creates repeating echo
        this.delayNode.connect(this.delayWetGain);
        
        // ========================================================================
        // REVERB EFFECT SETUP
        // ========================================================================
        // Reverb simulates acoustic space using convolution with impulse response
        // Signal flow: Input → Reverb → Wet Mix → Delay chain
        //                            → Dry Mix → Delay chain
        
        this.reverbNode = this.audioContext.createConvolver();
        this.reverbNode.buffer = this.createReverbImpulse(2, 2); // 2s duration, 2s decay
        this.reverbWetGain = this.audioContext.createGain();
        this.reverbDryGain = this.audioContext.createGain();
        
        this.reverbNode.connect(this.reverbWetGain);
        
        // ========================================================================
        // EFFECTS CHAIN ROUTING (Reverb → Delay)
        // ========================================================================
        // This order means: reverb happens first, THEN the reverbed signal gets delayed
        // Creates longer, more spacious delays with reverb tails that repeat
        
        this.reverbWetGain.connect(this.delayNode);
        this.reverbWetGain.connect(this.delayDryGain);
        this.reverbDryGain.connect(this.delayNode);
        this.reverbDryGain.connect(this.audioContext.destination);
        this.delayWetGain.connect(this.audioContext.destination);
        
        console.log('✅ Effects chain initialized (Reverb → Delay → Output)');
    }
    
    /**
     * Create reverb impulse response
     * 
     * Convolution reverb works by convolving audio with an impulse response.
     * We generate a synthetic impulse (decaying white noise) to simulate room reverb.
     * 
     * How it works:
     * - Create buffer of white noise (random values -1 to 1)
     * - Apply decay envelope (exponential fade out)
     * - Longer duration = larger room sound
     * - Higher decay = more reflections/longer tail
     * 
     * @param {number} duration - Length in seconds (2-10s typical)
     * @param {number} decay - Decay rate (higher = longer tail, 1-10 typical)
     * @returns {AudioBuffer} Impulse response buffer for ConvolverNode
     */
    createReverbImpulse(duration, decay) {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate); // Stereo
        
        // Fill both channels with decaying noise
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                // White noise: random value -1 to 1
                const noise = Math.random() * 2 - 1;
                
                // Apply exponential decay envelope
                // Math.pow(1 - i/length, decay) creates exponential fade
                // At i=0: full volume (1.0)
                // At i=length: silent (0.0)
                const envelope = Math.pow(1 - i / length, decay);
                
                channelData[i] = noise * envelope;
            }
        }
        
        return impulse;
    }
    
    /**
     * Create noise buffer for noise-based synthesis
     * 
     * Three types of noise with different frequency characteristics:
     * - White: Equal power at all frequencies (harsh, bright)
     * - Pink: 1/f spectrum (more natural, balanced)
     * - Brown: 1/f² spectrum (warm, bassy, like waterfall)
     * 
     * @param {string} type - 'white-noise', 'pink-noise', or 'brown-noise'
     * @param {number} duration - Length in milliseconds
     * @returns {AudioBuffer} Buffer containing generated noise
     */
    createNoiseBuffer(type, duration) {
        if (!this.audioContext) return null;
        
        const bufferSize = this.audioContext.sampleRate * (duration / 1000);
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        if (type === 'white-noise') {
            // White noise: equal power across all frequencies
            // Simplest - just random values
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1; // Range: -1 to 1
            }
        } else if (type === 'pink-noise') {
            // Pink noise: 1/f power spectrum (more bass than white)
            // Uses Paul Kellett's algorithm with 7 filters
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                
                // Apply 7 cascaded filters to shape spectrum
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                
                // Sum all filter outputs
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                b6 = white * 0.115926;
            }
        } else if (type === 'brown-noise') {
            // Brown noise: 1/f² power spectrum (even more bass)
            // Uses simple integration (each sample depends on previous)
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                
                // Leaky integrator - smooths out white noise
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5; // Compensate for volume loss
            }
        }
        
        return buffer;
    }
    
    /**
     * Create custom oscillator or sound source
     * 
     * Supports multiple synthesis types:
     * - Standard: sine, square, sawtooth, triangle
     * - Noise: white, pink, brown
     * - FM: frequency modulation synthesis
     * - Additive: harmonic series
     * - PWM: pulse width modulation
     * 
     * @param {number} frequency - Base frequency in Hz
     * @param {string} type - Synthesis type (see above)
     * @param {number} duration - Length in milliseconds
     * @returns {AudioNode} OscillatorNode or AudioBufferSourceNode
     */
    createCustomOscillator(frequency, type, duration) {
        if (!this.audioContext) {
            console.error('AudioContext not initialized. Call initEffects() first.');
            return null;
        }
        
        // ========================================================================
        // NOISE SYNTHESIS
        // ========================================================================
        if (type === 'white-noise' || type === 'pink-noise' || type === 'brown-noise') {
            // Use buffer source for noise (can't use oscillator)
            const source = this.audioContext.createBufferSource();
            source.buffer = this.createNoiseBuffer(type, duration);
            source.loop = false; // Play once
            return source;
        } 
        
        // ========================================================================
        // FM SYNTHESIS (Frequency Modulation)
        // ========================================================================
        else if (type === 'fm') {
            // FM synthesis: one oscillator (modulator) modulates the frequency of another (carrier)
            // Creates complex, metallic, bell-like tones
            
            const carrier = this.audioContext.createOscillator();
            const modulator = this.audioContext.createOscillator();
            const modulatorGain = this.audioContext.createGain();
            
            // Carrier = main frequency we hear
            carrier.frequency.value = frequency;
            
            // Modulator = wobbles the carrier's frequency
            modulator.frequency.value = frequency * 2.5; // Harmonic ratio (experiment with this!)
            modulatorGain.gain.value = frequency * 0.8;  // Modulation depth (how much wobble)
            
            // Connect modulator to carrier's frequency parameter
            modulator.connect(modulatorGain);
            modulatorGain.connect(carrier.frequency);
            
            carrier.type = 'sine';
            modulator.type = 'sine';
            
            // Store modulator reference so we can start/stop it together with carrier
            carrier._modulator = modulator;
            carrier._modulatorGain = modulatorGain;
            
            return carrier;
        } 
        
        // ========================================================================
        // ADDITIVE SYNTHESIS
        // ========================================================================
        else if (type === 'additive') {
            // Additive synthesis: combine multiple harmonics (1x, 2x, 3x, 4x frequency)
            // Creates rich, organ-like tones
            // Note: Harmonics are added in the playback code, we just flag it here
            const osc = this.audioContext.createOscillator();
            osc.frequency.value = frequency;
            osc.type = 'sine';
            osc._isAdditive = true; // Flag for special handling later
            return osc;
        } 
        
        // ========================================================================
        // PULSE WIDTH MODULATION
        // ========================================================================
        else if (type === 'pwm') {
            // PWM: square wave with varying duty cycle
            // Creates pulsing, rhythmic tones
            const osc = this.audioContext.createOscillator();
            osc.frequency.value = frequency;
            osc.type = 'square';
            osc._isPWM = true; // Flag for future PWM implementation
            return osc;
        } 
        
        // ========================================================================
        // STANDARD WAVEFORMS
        // ========================================================================
        else {
            // Standard oscillator types: sine, square, sawtooth, triangle
            const osc = this.audioContext.createOscillator();
            osc.frequency.value = frequency;
            osc.type = type; // Browser validates this (throws error if invalid)
            return osc;
        }
    }
    
    /**
     * Load audio sample for sampler mode
     * 
     * Decodes audio file into AudioBuffer for playback with pitch shifting
     * and offset control.
     * 
     * @param {File} audioFile - Audio file from file input
     * @returns {Promise<Object>} Sample info (duration, channels, sample rate)
     */
    async loadSample(audioFile) {
        // Initialize audio context if needed
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Check file format
        const fileExt = audioFile.name.split('.').pop().toLowerCase();
        const isM4A = fileExt === 'm4a' || audioFile.type === 'audio/x-m4a' || audioFile.type === 'audio/mp4';
        
        if (isM4A) {
            console.warn('⚠️ M4A format detected - browser support varies. If loading fails, convert to WAV/MP3/OGG.');
        }
        
        try {
            // Read file as ArrayBuffer
            const arrayBuffer = await audioFile.arrayBuffer();
            
            // Decode audio data (async operation)
            this.sampleBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sampleFileName = audioFile.name;
            this.sampleDuration = this.sampleBuffer.duration;
            
            console.log(`✅ Sample loaded: ${this.sampleDuration.toFixed(2)}s, ${this.sampleBuffer.numberOfChannels}ch, ${this.sampleBuffer.sampleRate}Hz`);
            
            return {
                fileName: this.sampleFileName,
                duration: this.sampleDuration,
                channels: this.sampleBuffer.numberOfChannels,
                sampleRate: this.sampleBuffer.sampleRate
            };
        } catch (error) {
            console.error('❌ Error loading sample:', error);
            
            // Provide helpful error message for M4A
            if (isM4A) {
                throw new Error('M4A format not supported by your browser. Please convert to WAV, MP3, or OGG.');
            } else {
                throw new Error(`Failed to decode audio: ${error.message}`);
            }
        }
    }
    
    /**
     * Clear loaded sample
     */
    clearSample() {
        this.sampleBuffer = null;
        this.sampleFileName = '';
        this.sampleDuration = 0;
        console.log('🗑️ Sample cleared');
    }
    
    /**
     * Setup audio visualizer
     * 
     * Creates an AnalyserNode and connects it to the effects chain.
     * The analyser provides frequency data for waveform visualization.
     * 
     * @param {HTMLCanvasElement} canvas - Canvas element for visualization
     */
    setupVisualizer(canvas) {
        if (!this.audioContext) {
            console.error('AudioContext not initialized');
            return;
        }
        
        this.visualizerCanvas = canvas;
        this.visualizerCtx = canvas.getContext('2d');
        
        // Create analyser node
        this.analyser = this.audioContext.createAnalyser();
        
        // Configure for low latency and instant response
        this.analyser.fftSize = 256; // Smaller FFT = lower latency
        this.analyser.smoothingTimeConstant = 0; // No smoothing = instant response
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;
        
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        
        console.log('✅ Visualizer: LOW LATENCY mode, buffer =', bufferLength);
        
        // Connect analyser to the end of effects chain (after reverb wet)
        // Only connect if effects chain is initialized
        if (this.reverbWetGain) {
            // Disconnect reverb from destination first
            try {
                this.reverbWetGain.disconnect();
            } catch (e) {
                // Ignore if not connected yet
            }
            
            // Insert analyser between reverb and destination
            this.reverbWetGain.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        } else {
            // If effects not initialized yet, just connect analyser to destination
            this.analyser.connect(this.audioContext.destination);
            console.warn('⚠️ Effects chain not initialized yet - visualizer connected directly');
        }
        
        // Set canvas resolution to match display size for crisp rendering
        // Important: Use devicePixelRatio for retina displays
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        // Handle hidden canvas (getBoundingClientRect returns 0 for hidden elements)
        // Use explicit dimensions or offsetWidth/Height as fallback
        const displayWidth = rect.width > 0 ? rect.width : (canvas.offsetWidth || 800);
        const displayHeight = rect.height > 0 ? rect.height : (canvas.offsetHeight || 120);
        
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        this.visualizerCtx.scale(dpr, dpr);
        
        console.log('✅ Canvas:', displayWidth, 'x', displayHeight, 'px at', dpr + 'x DPR');
    }
    
    /**
     * Draw waveform visualizer (call in animation loop)
     * 
     * Displays frequency spectrum as a line graph.
     * Uses requestAnimationFrame for smooth 60fps animation.
     * 
     * @param {boolean} isPlaying - Whether audio is currently playing
     * @returns {number} Animation frame ID (for canceling later)
     */
    drawVisualizer(isPlaying) {
        if (!isPlaying) return null;
        
        // Check if analyser is ready before continuing
        if (!this.analyser || !this.dataArray) {
            // Don't schedule next frame - stop the loop
            return null;
        }
        
        // Schedule next frame
        this.animationId = requestAnimationFrame(() => this.drawVisualizer(isPlaying));
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Get canvas dimensions (logical pixels, after DPR scaling)
        const rect = this.visualizerCanvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        // Clear canvas with black background (oscilloscope style)
        this.visualizerCtx.fillStyle = '#000';
        this.visualizerCtx.fillRect(0, 0, width, height);
        
        // Only show first 60% of spectrum (where musical content is)
        // Higher frequencies are usually just noise
        const relevantBins = Math.floor(this.dataArray.length * 0.6);
        
        // Draw frequency spectrum as line graph (oscilloscope green)
        this.visualizerCtx.lineWidth = 2;
        this.visualizerCtx.strokeStyle = '#00ff00'; // Bright oscilloscope green
        this.visualizerCtx.shadowColor = '#00ff00';
        this.visualizerCtx.shadowBlur = 4;
        this.visualizerCtx.lineCap = 'round';
        this.visualizerCtx.lineJoin = 'round';
        this.visualizerCtx.beginPath();
        
        const sliceWidth = width / relevantBins;
        let x = 0;
        
        // Amplification for more dramatic visual movement
        const amplification = 2.0;
        
        for (let i = 0; i < relevantBins; i++) {
            // Normalize to 0-1
            let v = this.dataArray[i] / 255.0;
            
            // Amplify (but clamp to prevent overflow)
            v = Math.min(1, v * amplification);
            
            // Convert to y position (invert so high frequencies are at top)
            const y = height - (v * height);
            
            if (i === 0) {
                this.visualizerCtx.moveTo(x, y);
            } else {
                this.visualizerCtx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.visualizerCtx.stroke();
        
        return this.animationId;
    }
    
    /**
     * Stop visualizer animation
     */
    stopVisualizer() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clear canvas
        if (this.visualizerCanvas && this.visualizerCtx) {
            const rect = this.visualizerCanvas.getBoundingClientRect();
            // Clear with black (oscilloscope off)
            this.visualizerCtx.fillStyle = '#000';
            this.visualizerCtx.fillRect(0, 0, rect.width, rect.height);
        }
    }
    
    /**
     * Clean up audio resources
     * 
     * Important: Web Audio nodes can leak memory if not properly disposed.
     * Call this when shutting down the application.
     */
    cleanup() {
        // Stop visualizer
        this.stopVisualizer();
        
        // Close audio context to free resources
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        // Clear references
        this.delayNode = null;
        this.delayFeedbackGain = null;
        this.delayWetGain = null;
        this.delayDryGain = null;
        this.reverbNode = null;
        this.reverbWetGain = null;
        this.reverbDryGain = null;
        this.analyser = null;
        this.dataArray = null;
        this.sampleBuffer = null;
        
        console.log('✅ Audio engine cleaned up');
    }
}

