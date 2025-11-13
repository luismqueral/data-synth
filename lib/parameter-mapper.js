/**
 * MODULE: Parameter Mapper
 * 
 * Purpose: Map data fields to audio parameters using intelligent analysis
 * 
 * Key Exports:
 * - ParameterMapper class - Manages mappings between data and audio
 *   - getAudioParams() - Get parameter definitions (mode-specific)
 *   - intelligentMapping() - Analyze data and create optimal mappings
 *   - randomizeMappings() - Randomize which fields map to which parameters
 *   - randomizeRanges() - Randomize min/max values
 *   - randomizeAll() - Randomize everything
 * 
 * Dependencies:
 * - lib/data-processor.js (extractValues, analyzeDataVariance)
 * 
 * Used By:
 * - main.js (mapping configuration)
 * - json-mapper-v2.html (during migration)
 * 
 * Browser APIs Used:
 * - None (pure JavaScript)
 */

import { extractValues } from './data-processor.js';

/**
 * Parameter Mapper Class
 * 
 * This is a class because:
 * - Mappings state needs to persist
 * - Multiple methods operate on same mappings object
 * - Mode (synth vs sampler) affects parameter definitions
 * 
 * Usage:
 *   const mapper = new ParameterMapper();
 *   mapper.samplerMode = false;
 *   
 *   const params = mapper.getAudioParams();
 *   mapper.intelligentMapping(parsedData, numericPaths);
 *   
 *   // Access mappings
 *   console.log(mapper.mappings);
 */
export class ParameterMapper {
    constructor() {
        // Current mappings state
        // Format: { paramId: { path: 'data.field', min: 200, max: 2000, curve: 'linear', fixed: 440 } }
        this.mappings = {};
        
        // Mode affects which parameters are available
        this.samplerMode = false;
    }
    
    /**
     * Get audio parameter definitions based on current mode
     * 
     * Synthesizer mode: frequency-based parameters
     * Sampler mode: pitch/offset-based parameters
     * 
     * @returns {Array<Object>} Parameter definitions
     * 
     * Return format:
     * [
     *   { 
     *     id: 'frequency', 
     *     label: 'Frequency (Hz)', 
     *     min: 200, 
     *     max: 2000, 
     *     default: 440 
     *   },
     *   ...
     * ]
     */
    getAudioParams() {
        if (this.samplerMode) {
            // SAMPLER MODE: Pitch (playback rate), sample offset, duration
            return [
                { id: 'pitch', label: 'Pitch (Playback Rate)', min: 0.25, max: 4, default: 1 },
                { id: 'sampleOffset', label: 'Sample Start (0-1)', min: 0, max: 1, default: 0 },
                { id: 'duration', label: 'Duration (ms)', min: 50, max: 2000, default: 200 },
                { id: 'noteSpacing', label: 'Note Spacing (ms) - Rhythm', min: 50, max: 2000, default: 300 },
                { id: 'pan', label: 'Pan', min: -1, max: 1, default: 0 },
                { id: 'filterFreq', label: 'Filter Freq (Hz)', min: 200, max: 8000, default: 2000 },
                { id: 'filterQ', label: 'Filter Q', min: 0.1, max: 20, default: 1 },
                { id: 'delayTime', label: 'Delay Time (ms)', min: 50, max: 1000, default: 300 },
                { id: 'delayFeedback', label: 'Delay Feedback', min: 0.1, max: 0.85, default: 0.5 },
                { id: 'delayMix', label: 'Delay Mix', min: 0.1, max: 0.9, default: 0.5 },
                { id: 'reverbDecay', label: 'Reverb Decay (s)', min: 0.1, max: 10, default: 2 },
                { id: 'reverbMix', label: 'Reverb Mix', min: 0, max: 1, default: 0.3 },
                { id: 'attack', label: 'Attack (ms)', min: 1, max: 1000, default: 10 },
                { id: 'release', label: 'Release (ms)', min: 1, max: 2000, default: 100 }
            ];
        } else {
            // SYNTHESIZER MODE: Frequency-based parameters
            return [
                { id: 'frequency', label: 'Frequency (Hz)', min: 200, max: 2000, default: 440 },
                { id: 'duration', label: 'Duration (ms)', min: 50, max: 2000, default: 200 },
                { id: 'noteSpacing', label: 'Note Spacing (ms) - Rhythm', min: 50, max: 2000, default: 300 },
                { id: 'pan', label: 'Pan', min: -1, max: 1, default: 0 },
                { id: 'filterFreq', label: 'Filter Freq (Hz)', min: 200, max: 8000, default: 2000 },
                { id: 'filterQ', label: 'Filter Q', min: 0.1, max: 20, default: 1 },
                { id: 'delayTime', label: 'Delay Time (ms)', min: 50, max: 1000, default: 300 },
                { id: 'delayFeedback', label: 'Delay Feedback', min: 0.1, max: 0.85, default: 0.5 },
                { id: 'delayMix', label: 'Delay Mix', min: 0.1, max: 0.9, default: 0.5 },
                { id: 'reverbDecay', label: 'Reverb Decay (s)', min: 0.1, max: 10, default: 2 },
                { id: 'reverbMix', label: 'Reverb Mix', min: 0, max: 1, default: 0.3 },
                { id: 'attack', label: 'Attack (ms)', min: 1, max: 1000, default: 10 },
                { id: 'release', label: 'Release (ms)', min: 1, max: 2000, default: 100 }
            ];
        }
    }
    
    /**
     * Intelligent mapping algorithm
     * 
     * Analyzes data to find "interesting" fields (high variance, unique values)
     * and maps them to perceptually important audio parameters.
     * 
     * Algorithm:
     * 1. Calculate "interest score" for each numeric field
     *    - Interest = variance × uniqueness × log(range)
     * 2. Sort fields by interest (most interesting first)
     * 3. Map top fields to "critical" parameters (rhythm, pitch)
     * 4. Map next fields to "important" parameters (pan, filter, delay)
     * 5. Map remaining to "subtle" parameters (reverb, envelope)
     * 
     * @param {Array} parsedData - Array of data items
     * @param {Array} numericPaths - Detected numeric field paths
     */
    intelligentMapping(parsedData, numericPaths) {
        if (Object.keys(this.mappings).length === 0 || numericPaths.length === 0) {
            console.warn('No mappings or paths available');
            return;
        }
        
        console.log('=== Smart Mapping ===');
        
        const itemsArray = Array.isArray(parsedData) ? parsedData : [parsedData];
        
        // ====================================================================
        // STEP 1: Analyze each path for "interestingness"
        // ====================================================================
        // We want to map the most interesting data to the most important parameters
        // "Interesting" = varies a lot + has unique values + spans wide range
        
        const pathAnalysis = numericPaths.map(pathObj => {
            const values = extractValues(itemsArray, pathObj.path);
            const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
            
            if (numericValues.length === 0) return null;
            
            // Calculate statistics
            const min = Math.min(...numericValues);
            const max = Math.max(...numericValues);
            const range = max - min;
            const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
            const variance = numericValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / numericValues.length;
            const stdDev = Math.sqrt(variance);
            
            // Coefficient of variation (normalized variance)
            const coefficientOfVariation = Math.abs(mean) > 0 ? stdDev / Math.abs(mean) : 0;
            
            // Unique value ratio (how varied the data is)
            const uniqueValues = new Set(numericValues).size;
            const uniqueRatio = uniqueValues / numericValues.length;
            
            // Interest score: combines variance, uniqueness, and range
            // Higher score = more musically interesting to sonify
            const interestScore = coefficientOfVariation * uniqueRatio * Math.log10(range + 1);
            
            return {
                path: pathObj.path,
                min,
                max,
                range,
                coefficientOfVariation,
                uniqueRatio,
                interestScore,
                values: numericValues
            };
        }).filter(x => x !== null);
        
        // ====================================================================
        // STEP 2: Sort by interest score
        // ====================================================================
        pathAnalysis.sort((a, b) => b.interestScore - a.interestScore);
        
        console.log('Path analysis (sorted by interest):');
        pathAnalysis.forEach(p => {
            console.log(`  ${p.path}: score=${p.interestScore.toFixed(3)}, CV=${p.coefficientOfVariation.toFixed(3)}, unique=${(p.uniqueRatio*100).toFixed(0)}%`);
        });
        
        // ====================================================================
        // STEP 3: Define parameter importance tiers (mode-specific)
        // ====================================================================
        const parameterTiers = this.samplerMode ? {
            // Sampler mode: Sample position and rhythm most important
            critical: ['noteSpacing', 'sampleOffset', 'duration'],
            important: ['pitch', 'pan', 'delayTime', 'delayFeedback', 'delayMix', 'attack', 'release'],
            subtle: ['filterFreq', 'filterQ', 'reverbDecay', 'reverbMix']
        } : {
            // Synthesizer mode: Rhythm and frequency most important
            critical: ['noteSpacing', 'frequency', 'duration'],
            important: ['pan', 'filterFreq', 'delayTime', 'delayFeedback', 'delayMix', 'attack', 'release'],
            subtle: ['filterQ', 'reverbDecay', 'reverbMix']
        };
        
        // ====================================================================
        // STEP 4: Clear all existing mappings
        // ====================================================================
        Object.keys(this.mappings).forEach(param => {
            this.mappings[param].path = '';
        });
        
        let pathIndex = 0;
        
        // ====================================================================
        // STEP 5: Map most interesting data to CRITICAL parameters
        // ====================================================================
        parameterTiers.critical.forEach(param => {
            if (pathIndex < pathAnalysis.length && this.mappings[param]) {
                const pathData = pathAnalysis[pathIndex];
                this.mappings[param].path = pathData.path;
                
                // Set musically interesting ranges for each parameter
                if (param === 'frequency') {
                    // Use pentatonic scale frequencies for guaranteed consonance
                    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
                    this.mappings[param].min = pentatonic[0];
                    this.mappings[param].max = pentatonic[pentatonic.length - 1];
                } else if (param === 'duration') {
                    this.mappings[param].min = 100;
                    this.mappings[param].max = 600;
                } else if (param === 'noteSpacing') {
                    // Wide range for dramatic rhythmic variation
                    this.mappings[param].min = 80;   // Rapid-fire
                    this.mappings[param].max = 1200; // Spacious
                }
                
                // Apply curve based on data variance
                if (param === 'noteSpacing') {
                    // Rhythm gets special curve handling
                    if (pathData.coefficientOfVariation < 0.01) {
                        this.mappings[param].curve = 'cubic';
                    } else if (pathData.coefficientOfVariation < 0.5) {
                        this.mappings[param].curve = 'exponential';
                    } else if (pathData.coefficientOfVariation > 3) {
                        this.mappings[param].curve = 'logarithmic';
                    } else {
                        this.mappings[param].curve = 'exponential';
                    }
                } else if (pathData.coefficientOfVariation < 0.01) {
                    this.mappings[param].curve = 'cubic';
                } else if (pathData.coefficientOfVariation < 0.1) {
                    this.mappings[param].curve = 'exponential';
                } else if (pathData.coefficientOfVariation > 5) {
                    this.mappings[param].curve = 'logarithmic';
                } else {
                    this.mappings[param].curve = 'linear';
                }
                
                if (param === 'noteSpacing') {
                    console.log(`🎵 Mapped ${pathData.path} → ${param} (${this.mappings[param].curve}) [RHYTHM: ${this.mappings[param].min}-${this.mappings[param].max}ms]`);
                } else {
                    console.log(`✓ Mapped ${pathData.path} → ${param} (${this.mappings[param].curve})`);
                }
                pathIndex++;
            }
        });
        
        // ====================================================================
        // STEP 6: Map next interesting data to IMPORTANT parameters
        // ====================================================================
        parameterTiers.important.forEach(param => {
            if (pathIndex < pathAnalysis.length && this.mappings[param]) {
                const pathData = pathAnalysis[pathIndex];
                this.mappings[param].path = pathData.path;
                
                // Set ranges for maximum impact
                if (param === 'pan') {
                    this.mappings[param].min = -1;
                    this.mappings[param].max = 1;
                } else if (param === 'filterFreq') {
                    this.mappings[param].min = 400;
                    this.mappings[param].max = 8000;
                } else if (param === 'attack') {
                    this.mappings[param].min = 5;
                    this.mappings[param].max = 300;
                } else if (param === 'release') {
                    this.mappings[param].min = 50;
                    this.mappings[param].max = 800;
                }
                
                // Smart curve selection
                if (pathData.coefficientOfVariation < 0.05) {
                    this.mappings[param].curve = 'exponential';
                } else {
                    this.mappings[param].curve = 'linear';
                }
                
                console.log(`✓ Mapped ${pathData.path} → ${param} (${this.mappings[param].curve})`);
                pathIndex++;
            }
        });
        
        // ====================================================================
        // STEP 7: Map remaining data to delay parameters (for sonic variation)
        // ====================================================================
        const extraPaths = pathAnalysis.slice(pathIndex);
        if (extraPaths.length > 0) {
            const delayParams = [
                { 
                    id: 'delayTime', 
                    min: 50,
                    max: 800,
                    curve: 'linear',
                    description: 'wide timing variation'
                },
                { 
                    id: 'delayFeedback', 
                    min: 0.1,
                    max: 0.8,
                    curve: 'exponential',
                    description: 'feedback dynamics'
                },
                { 
                    id: 'delayMix', 
                    min: 0.2,
                    max: 0.8,
                    curve: 'linear',
                    description: 'wet/dry balance'
                }
            ];
            
            delayParams.forEach((delayParam, idx) => {
                if (extraPaths.length > idx && this.mappings[delayParam.id]) {
                    const pathData = extraPaths[idx];
                    this.mappings[delayParam.id].path = pathData.path;
                    this.mappings[delayParam.id].min = delayParam.min;
                    this.mappings[delayParam.id].max = delayParam.max;
                    this.mappings[delayParam.id].curve = delayParam.curve;
                    
                    console.log(`✓ Mapped ${pathData.path} → ${delayParam.id} (${delayParam.description})`);
                }
            });
        }
        
        // Verify noteSpacing is mapped (important for rhythm)
        if (!this.mappings['noteSpacing']?.path) {
            console.warn('⚠️ NOTE SPACING NOT MAPPED - Will use automatic variation (±20% random)');
            console.warn('   For best results, map noteSpacing to a data field for rhythmic patterns');
        } else {
            console.log('✅ Note spacing mapped to data - rhythmic variation enabled');
        }
        
        console.log('=== Smart Mapping Complete ===');
    }
    
    /**
     * Randomize which data fields map to which audio parameters
     * 
     * @param {Array} numericPaths - Available numeric paths to choose from
     */
    randomizeMappings(numericPaths) {
        if (Object.keys(this.mappings).length === 0) {
            console.warn('No mappings to randomize');
            return;
        }
        
        console.log('Randomizing mappings...');
        
        const curves = ['linear', 'exponential', 'cubic', 'logarithmic', 'inverse'];
        let mappedCount = 0;
        
        Object.keys(this.mappings).forEach(paramId => {
            // noteSpacing always gets mapped for rhythmic interest; others 70% of the time
            const shouldMap = paramId === 'noteSpacing' ? true : (Math.random() > 0.3);
            
            if (shouldMap && numericPaths.length > 0) {
                const randomPath = this._randomElement(numericPaths).path;
                this.mappings[paramId].path = randomPath;
                
                // noteSpacing favors exponential curves for dramatic rhythm
                let randomCurve;
                if (paramId === 'noteSpacing') {
                    randomCurve = Math.random() < 0.6 ? 'exponential' : this._randomElement(curves);
                } else {
                    randomCurve = Math.random() < 0.5 ? 'linear' : this._randomElement(curves);
                }
                
                this.mappings[paramId].curve = randomCurve;
                mappedCount++;
            } else {
                this.mappings[paramId].path = '';
            }
        });
        
        console.log(`Mapped ${mappedCount} parameters`);
    }
    
    /**
     * Randomize min/max ranges for all parameters
     * Keeps current mappings but varies the ranges
     */
    randomizeRanges() {
        Object.keys(this.mappings).forEach(paramId => {
            const mapping = this.mappings[paramId];
            if (!mapping) return;
            
            const range = mapping.max - mapping.min;
            const newMin = mapping.min + (Math.random() - 0.1) * range * 0.3;
            const newMax = mapping.max + (Math.random() - 0.1) * range * 0.5;
            
            // Ensure min < max
            const actualMin = Math.min(newMin, newMax);
            const actualMax = Math.max(newMin, newMax);
            
            this.mappings[paramId].min = actualMin;
            this.mappings[paramId].max = actualMax;
        });
    }
    
    /**
     * Randomize both mappings and ranges
     * 
     * @param {Array} numericPaths - Available numeric paths
     */
    randomizeAll(numericPaths) {
        this.randomizeMappings(numericPaths);
        this.randomizeRanges();
    }
    
    /**
     * Initialize mappings with default values
     * Call this after getting audio params
     */
    initializeMappings() {
        const audioParams = this.getAudioParams();
        
        audioParams.forEach(param => {
            this.mappings[param.id] = {
                path: '',
                fixed: param.default,
                min: param.min,
                max: param.max,
                curve: 'linear'
            };
        });
    }
    
    /**
     * Helper: Get random element from array
     * @private
     */
    _randomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}

