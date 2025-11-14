/**
 * DataSynth v2.0 - Main Application (Clean Modular Implementation)
 * 
 * This is the clean version built from extracted modules.
 * No legacy code, no wrapper functions - just pure module coordination.
 * 
 * Architecture:
 * - Modules handle their responsibilities (data, audio, mapping, viz)
 * - main.js coordinates modules and handles UI events
 * - index.html provides structure and styling
 * 
 * ============================================================================
 * TABLE OF CONTENTS
 * ============================================================================
 * 
 * 1. IMPORT MODULES               - ES6 module imports
 * 2. CREATE MODULE INSTANCES      - AudioEngine, ParameterMapper, PatchViz
 * 3. APPLICATION STATE            - Global state variables
 * 4. INITIALIZATION               - Startup sequence
 * 5. EVENT LISTENERS              - Wire up UI event handlers
 *    - Data Loading               - Dataset selector, file drop
 *    - Playback Controls          - Play/stop, randomize
 *    - Global Settings            - Volume, pitch, speed
 *    - Mode Switching             - Synth ↔ Sampler
 *    - Sampler Controls           - Sample upload/clear
 *    - UI Interactions            - Drawers, toggles
 * 6. DATASET LOADING              - JSON/CSV/GeoJSON parsing
 * 7. FILE DROP ZONE               - Drag-and-drop file upload
 * 8. PLAYBACK CONTROL             - Main playback loop
 * 9. AUDIO PARAMETER CALCULATION  - Data → audio mapping pipeline
 * 10. AUDIO PLAYBACK              - Note creation and playback
 * 11. MUSICAL QUANTIZATION        - Pitch and rhythm quantization
 * 12. UI EVENT HANDLERS           - Control handlers and UI updates
 * 13. START APPLICATION           - Entry point
 * 
 * ============================================================================
 */

// ============================================================================
// IMPORT MODULES
// ============================================================================

import { 
    extractPaths, 
    extractValues,
    getValueByPath 
} from './lib/data-processor.js';

import { AudioEngine } from './lib/audio-engine.js';
import { ParameterMapper } from './lib/parameter-mapper.js';
import { PatchViz } from './lib/patch-viz.js';

console.log(`
╔═════════════════════════════════════════════════════╗
║                                                     ║
║   ██████╗  █████╗ ████████╗ █████╗                 ║
║   ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗                ║
║   ██║  ██║███████║   ██║   ███████║                ║
║   ██║  ██║██╔══██║   ██║   ██╔══██║                ║
║   ██████╔╝██║  ██║   ██║   ██║  ██║                ║
║   ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝                ║
║        ███████╗██╗   ██╗███╗   ██╗████████╗██╗  ██╗║
║        ██╔════╝╚██╗ ██╔╝████╗  ██║╚══██╔══╝██║  ██║║
║        ███████╗ ╚████╔╝ ██╔██╗ ██║   ██║   ███████║║
║        ╚════██║  ╚██╔╝  ██║╚██╗██║   ██║   ██╔══██║║
║        ███████║   ██║   ██║ ╚████║   ██║   ██║  ██║║
║        ╚══════╝   ╚═╝   ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝║
║                                                     ║
║          a sound toy by luis queral                 ║
║          www.queral.studio                          ║
║                                                     ║
╚═════════════════════════════════════════════════════╝
`);
console.log('✅ All modules loaded');

// ============================================================================
// CREATE MODULE INSTANCES
// ============================================================================

const audioEngine = new AudioEngine();
const parameterMapper = new ParameterMapper();
const patchViz = new PatchViz('patchViz');

console.log('✅ Module instances created');

// ============================================================================
// APPLICATION STATE
// ============================================================================

let parsedData = null;
let numericPaths = [];
let isPlaying = false;
let currentTimeout = null;

// Playback ID system prevents race conditions when user rapidly clicks play/stop
// Each playback session gets a unique ID; loops check if their ID is still current
let currentPlaybackId = 0;

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
    console.log('Initializing DataSynth...');
    
    // Make settings panel visible now that CSS is loaded
    document.getElementById('settingsPanel').style.visibility = 'visible';
    
    // Wire up event listeners
    setupEventListeners();
    
    // Auto-load default dataset
    setTimeout(() => {
        const selector = document.getElementById('templateSelector');
        selector.value = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
        selector.dispatchEvent(new Event('change'));
    }, 100);
    
    console.log('✅ DataSynth initialized');
}

// ============================================================================
// EVENT LISTENERS
// Wire up all UI event handlers and user interactions
// ============================================================================

function setupEventListeners() {
    // ========================================================================
    // DATA LOADING
    // ========================================================================
    document.getElementById('templateSelector').addEventListener('change', handleDatasetSelection);
    setupFileDropZone(); // Drag-and-drop file upload
    
    // ========================================================================
    // PLAYBACK CONTROLS
    // ========================================================================
    document.getElementById('playDataBtn').addEventListener('click', handlePlay);
    document.getElementById('randomizeMappingsBtn').addEventListener('click', handleRandomize);
    
    // ========================================================================
    // GLOBAL SETTINGS (Volume, Pitch, Speed)
    // ========================================================================
    document.getElementById('masterVolume').addEventListener('input', handleVolumeChange);
    document.getElementById('pitchControl').addEventListener('input', handlePitchChange);
    document.getElementById('speedControl').addEventListener('input', handleSpeedChange);
    
    // ========================================================================
    // MODE SWITCHING (Synthesizer ↔ Sampler)
    // ========================================================================
    document.querySelectorAll('input[name="soundSource"]').forEach(radio => {
        radio.addEventListener('change', handleModeChange);
    });
    
    // ========================================================================
    // SAMPLER CONTROLS (Sample loading and management)
    // ========================================================================
    document.getElementById('sampleFileInput').addEventListener('change', handleSampleUpload);
    document.getElementById('clearSampleBtn').addEventListener('click', handleClearSample);
    
    // ========================================================================
    // UI INTERACTIONS (Slide-out panels, toggles, show/hide)
    // ========================================================================
    
    // Settings panel - slide out from left and push content
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsTrigger = document.getElementById('settingsTriggerBtn');
    
    // Toggle settings panel (button morphs from sliders to X)
    settingsTrigger.addEventListener('click', () => {
        const isOpen = settingsPanel.classList.contains('open');
        
        if (isOpen) {
            // Close panel
            settingsPanel.classList.remove('open');
            document.body.classList.remove('shifted');
            settingsTrigger.classList.remove('shifted');
            settingsTrigger.title = 'Settings';
        } else {
            // Open panel
            settingsPanel.classList.add('open');
            document.body.classList.add('shifted');
            settingsTrigger.classList.add('shifted');
            settingsTrigger.title = 'Close';
        }
        
        // Redraw patch visualization after panel animation completes (300ms)
        // This ensures the D3 viz responds to the new available width
        setTimeout(() => {
            if (parsedData && numericPaths && numericPaths.length > 0) {
                console.log('🔄 Settings panel toggled, redrawing patch visualization');
                patchViz.render(numericPaths, parameterMapper.mappings, parameterMapper, isPlaying);
            }
        }, 400);
    });
    
    // Pitch quantization toggle (show/hide scale selector)
    document.getElementById('pitchQuantization').addEventListener('change', (e) => {
        document.getElementById('scaleContainer').style.display = e.target.checked ? 'block' : 'none';
    });
    
    // Show scale selector if pitch quantization checked on load
    if (document.getElementById('pitchQuantization').checked) {
        document.getElementById('scaleContainer').style.display = 'block';
    }
    
    // ========================================================================
    // WINDOW RESIZE (Responsive D3 visualization)
    // ========================================================================
    
    // Debounced resize handler for D3 patch visualization
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Re-render D3 visualization if data is loaded
            if (numericPaths.length > 0) {
                console.log('↔️ Window resized, re-rendering patch visualization');
                patchViz.render(numericPaths, parameterMapper.mappings, parameterMapper, isPlaying);
            }
        }, 250); // 250ms debounce
    });
}

// ============================================================================
// DATASET LOADING
// Handle JSON/CSV/GeoJSON loading from URLs or file drop
// ============================================================================

async function handleDatasetSelection(e) {
    const filePath = e.target.value;
    if (!filePath) {
        document.getElementById('datasetSourceLink').style.display = 'none';
        return;
    }
    
    const parseStatus = document.getElementById('parseStatus');
    parseStatus.textContent = 'Loading...';
    parseStatus.style.color = '#666';
    
    // Show source link
    const sourceLink = document.getElementById('datasetSourceLink');
    sourceLink.href = filePath;
    sourceLink.style.display = 'inline';
    
    try {
        // Fetch with cache busting for APIs
        const isAPI = filePath.startsWith('http://') || filePath.startsWith('https://');
        const fetchURL = isAPI ? `${filePath}${filePath.includes('?') ? '&' : '?'}_t=${Date.now()}` : filePath;
        
        const response = await fetch(fetchURL, { cache: 'no-cache' });
        
        if (!response.ok) {
            throw new Error(`Failed to load: ${response.statusText}`);
        }
        
        const text = await response.text();
        let data;
        
        // Parse based on file type
        if (filePath.endsWith('.csv')) {
            data = parseCSV(text);
        } else {
            const json = JSON.parse(text);
            // Extract features from GeoJSON
            data = json.type === 'FeatureCollection' && json.features ? json.features : json;
            // Extract first array property if needed
            if (!Array.isArray(data) && typeof data === 'object') {
                const arrayProps = Object.keys(data).filter(key => Array.isArray(data[key]));
                if (arrayProps.length > 0) {
                    data = data[arrayProps[0]];
                } else {
                    data = [data]; // Wrap single object
                }
            }
        }
        
        processData(data);
        parseStatus.textContent = '';
        
    } catch (error) {
        console.error('Error loading dataset:', error);
        parseStatus.textContent = `✗ Error: ${error.message}`;
        parseStatus.style.color = '#cc0000';
    }
}

function parseCSV(text) {
    const parsed = d3.csvParse(text, d3.autoType);
    console.log(`Parsed ${parsed.length} rows from CSV`);
    return parsed;
}

function processData(data) {
    console.log('Processing data:', Array.isArray(data) ? `${data.length} items` : 'single object');
    
    parsedData = data;
    
    // Extract numeric paths
    const allPaths = extractPaths(data);
    numericPaths = allPaths.filter(p => p.type === 'number');
    
    console.log(`Detected ${numericPaths.length} numeric paths`);
    console.log('Sample paths:', numericPaths.slice(0, 5).map(p => p.path));
    
    if (numericPaths.length === 0) {
        console.warn('⚠️ No numeric paths found in dataset');
        return;
    }
    
    // Initialize parameter mapper with detected paths
    parameterMapper.initializeMappings();
    parameterMapper.intelligentMapping(parsedData, numericPaths);
    
    console.log('✅ Smart mapping applied');
    
    // Render patch visualization
    patchViz.render(numericPaths, parameterMapper.mappings, parameterMapper, isPlaying);
    
    // Enable controls
    document.getElementById('playDataBtn').disabled = false;
    document.getElementById('randomizeMappingsBtn').disabled = false;
}

// ============================================================================
// FILE DROP ZONE
// Drag-and-drop support for uploading local data files
// ============================================================================

function setupFileDropZone() {
    const body = document.body;
    
    body.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    body.addEventListener('drop', async (e) => {
        e.preventDefault();
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const fileName = file.name.toLowerCase();
            
            console.log('Dropped file:', file.name);
            
            try {
                const text = await file.text();
                let data;
                
                if (fileName.endsWith('.json') || fileName.endsWith('.geojson')) {
                    const json = JSON.parse(text);
                    data = json.type === 'FeatureCollection' && json.features ? json.features : json;
                } else if (fileName.endsWith('.csv')) {
                    data = parseCSV(text);
                } else {
                    data = JSON.parse(text); // Try as JSON
                }
                
                // Clear dropdown
                document.getElementById('templateSelector').value = '';
                document.getElementById('datasetSourceLink').style.display = 'none';
                
                processData(data);
            } catch (error) {
                console.error('Error reading file:', error);
                alert(`Error reading file: ${error.message}`);
            }
        }
    });
}

// ============================================================================
// PLAYBACK CONTROL
// Main playback loop with race condition protection
// Loops through data items, calculates audio params, plays notes
// ============================================================================

async function handlePlay() {
    if (!parsedData) {
        alert('Please load data first');
        return;
    }
    
    // Toggle play/stop
    if (isPlaying) {
        stopPlayback();
        return;
    }
    
    // Start playback with new unique ID
    // This prevents race conditions if user rapidly clicks play/stop/play
    isPlaying = true;
    currentPlaybackId++;
    const thisPlaybackId = currentPlaybackId;
    
    console.log(`🎵 Starting playback session #${thisPlaybackId}`);
    
    document.getElementById('playIcon').textContent = '⏹';
    document.getElementById('playText').textContent = 'Stop';
    document.getElementById('audioVisualizerContainer').style.display = 'block';
    
    // Initialize audio engine if needed
    if (!audioEngine.audioContext) {
        audioEngine.initEffects();
    }
    
    // Ensure effects chain is initialized (might not exist if audio context was created elsewhere)
    if (!audioEngine.delayNode || !audioEngine.reverbNode) {
        audioEngine.initEffects();
    }
    
    // Ensure visualizer is set up
    if (!audioEngine.analyser) {
        audioEngine.setupVisualizer(document.getElementById('audioVisualizer'));
    }
    
    // Start visualizer animation
    audioEngine.drawVisualizer(isPlaying);
    
    // Reset debug flags
    patchViz.resetDebugFlags();
    
    const itemsArray = Array.isArray(parsedData) ? parsedData : [parsedData];
    
    // Calculate data ranges for scaling
    const dataRanges = calculateDataRanges(itemsArray, parameterMapper.mappings);
    
    console.log('=== Playback Starting ===');
    console.log('Items:', itemsArray.length);
    console.log('Active mappings:', Object.values(parameterMapper.mappings).filter(m => m.path).length);
    
    // Playback loop
    // Exit if another playback session started (thisPlaybackId !== currentPlaybackId)
    while (isPlaying && thisPlaybackId === currentPlaybackId) {
        for (let i = 0; i < itemsArray.length && isPlaying && thisPlaybackId === currentPlaybackId; i++) {
            const item = itemsArray[i];
            
            // Calculate audio parameters from data
            const audioParams = calculateAudioParams(item, parameterMapper.mappings, dataRanges);
            
            // Update visualization
            patchViz.updateNodeValues(item, audioParams, parameterMapper.mappings, isPlaying);
            
            // Play note
            await playNote(audioParams);
            
            // Update item counter
            document.getElementById('itemValue').textContent = `${i + 1} / ${itemsArray.length}`;
            
            // Wait for next note
            const noteSpacing = audioParams.noteSpacing || 300;
            const speed = parseFloat(document.getElementById('speedControl').value) || 1;
            const actualDelay = noteSpacing / speed;
            
            // Apply rhythmic quantization if enabled
            const finalDelay = document.getElementById('rhythmicQuantization').checked ?
                quantizeRhythm(actualDelay) : actualDelay;
            
            await new Promise(resolve => {
                currentTimeout = setTimeout(resolve, finalDelay);
            });
            
            // Double-check we're still the current playback session
            if (thisPlaybackId !== currentPlaybackId) {
                console.log(`⏹ Playback session #${thisPlaybackId} superseded, exiting gracefully`);
                return; // Another playback started, exit this loop
            }
        }
    }
    
    // Playback ended naturally (not stopped by user)
    // Only update UI if we're still the current playback session
    if (thisPlaybackId === currentPlaybackId) {
        isPlaying = false;
        document.getElementById('playIcon').textContent = '▶';
        document.getElementById('playText').textContent = 'Play Data';
        document.getElementById('audioVisualizerContainer').style.display = 'none';
        audioEngine.stopVisualizer();
        patchViz.clearNodeValues();
        console.log(`✅ Playback session #${thisPlaybackId} completed`);
    }
}

function stopPlayback() {
    // Invalidate current playback session
    // Any running loops will check their ID and exit gracefully
    currentPlaybackId++;
    isPlaying = false;
    audioEngine.previousDelayTime = null;
    
    if (currentTimeout) clearTimeout(currentTimeout);
    
    audioEngine.stopVisualizer();
    patchViz.clearNodeValues();
    
    document.getElementById('playIcon').textContent = '▶';
    document.getElementById('playText').textContent = 'Play Data';
    document.getElementById('audioVisualizerContainer').style.display = 'none';
    document.getElementById('itemValue').textContent = '--';
    
    console.log(`⏹ Playback stopped, invalidated session (now at #${currentPlaybackId})`);
}

// ============================================================================
// AUDIO PARAMETER CALCULATION
// Extract data values, normalize, apply curves, scale to audio ranges
// Pre-calculate data ranges once for performance
// ============================================================================

function calculateDataRanges(itemsArray, mappings) {
    const dataRanges = {};
    
    Object.entries(mappings).forEach(([param, mapping]) => {
        if (mapping && mapping.path) {
            const values = extractValues(itemsArray, mapping.path)
                .map(v => parseFloat(v))
                .filter(v => !isNaN(v));
            
            if (values.length > 0) {
                dataRanges[param] = {
                    min: Math.min(...values),
                    max: Math.max(...values)
                };
            }
        }
    });
    
    return dataRanges;
}

function calculateAudioParams(item, mappings, dataRanges) {
    const audioParams = {};
    
    // Helper to calculate mapped parameter value with curve scaling
    const getParamValue = (paramName) => {
        const mapping = mappings[paramName];
        if (!mapping) return null;
        
        if (mapping.path && dataRanges[paramName]) {
            const rawValue = parseFloat(getValueByPath(item, mapping.path));
            if (isNaN(rawValue)) return mapping.fixed;
            
            // Scale from data range to audio parameter range
            const dataMin = dataRanges[paramName].min;
            const dataMax = dataRanges[paramName].max;
            
            if (dataMax === dataMin) return mapping.min;
            
            let normalized = (rawValue - dataMin) / (dataMax - dataMin);
            normalized = Math.max(0, Math.min(1, normalized));
            
            // Apply curve transformation
            let curved = normalized;
            switch (mapping.curve) {
                case 'exponential':
                    curved = Math.pow(normalized, 2);
                    break;
                case 'cubic':
                    curved = Math.pow(normalized, 3);
                    break;
                case 'logarithmic':
                    curved = normalized > 0 ? Math.log(1 + normalized * 9) / Math.log(10) : 0;
                    break;
                case 'inverse':
                    curved = 1 - normalized;
                    break;
                case 'linear':
                default:
                    curved = normalized;
                    break;
            }
            
            // Apply to audio range
            return mapping.min + (curved * (mapping.max - mapping.min));
        }
        return mapping.fixed;
    };
    
    // Calculate all parameters
    if (parameterMapper.samplerMode) {
        audioParams.pitch = getParamValue('pitch');
        audioParams.sampleOffset = getParamValue('sampleOffset');
    } else {
        audioParams.frequency = getParamValue('frequency');
    }
    
    audioParams.duration = getParamValue('duration');
    audioParams.noteSpacing = getParamValue('noteSpacing');
    audioParams.pan = getParamValue('pan');
    audioParams.filterFreq = getParamValue('filterFreq');
    audioParams.filterQ = getParamValue('filterQ');
    audioParams.delayTime = getParamValue('delayTime');
    audioParams.delayFeedback = getParamValue('delayFeedback');
    audioParams.delayMix = getParamValue('delayMix');
    audioParams.reverbDecay = getParamValue('reverbDecay');
    audioParams.reverbMix = getParamValue('reverbMix');
    audioParams.attack = getParamValue('attack');
    audioParams.release = getParamValue('release');
    
    return audioParams;
}

// ============================================================================
// AUDIO PLAYBACK
// Create and play notes using AudioEngine
// Per-note chain: source → filter → panner → envelope → effects → speakers
// ============================================================================

async function playNote(audioParams) {
    const volume = parseFloat(document.getElementById('masterVolume').value) || 0.2;
    const duration = audioParams.duration || 200;
    const pan = audioParams.pan || 0;
    const filterFreq = audioParams.filterFreq || 2000;
    const filterQ = audioParams.filterQ || 1;
    const attack = audioParams.attack || 10;
    const release = audioParams.release || 100;
    
    // Update delay parameters
    updateDelayParameters(audioParams);
    
    // Update reverb parameters
    updateReverbParameters(audioParams);
    
    // Create audio nodes
    const filter = audioEngine.audioContext.createBiquadFilter();
    const panner = audioEngine.audioContext.createStereoPanner();
    const envelope = audioEngine.audioContext.createGain();
    
    let source;
    
    if (parameterMapper.samplerMode && audioEngine.sampleBuffer) {
        // SAMPLER MODE
        source = audioEngine.audioContext.createBufferSource();
        source.buffer = audioEngine.sampleBuffer;
        
        const pitchRate = audioParams.pitch !== null && audioParams.pitch !== undefined ? audioParams.pitch : 1;
        const pitchTranspose = parseFloat(document.getElementById('pitchControl').value) || 0;
        const transposeSemitones = Math.pow(2, pitchTranspose / 12);
        source.playbackRate.value = pitchRate * transposeSemitones;
        
        const sampleOffset = (audioParams.sampleOffset || 0) * audioEngine.sampleBuffer.duration;
        const cropDuration = duration / 1000;
        
        source.start(audioEngine.audioContext.currentTime, sampleOffset, cropDuration);
        
    } else {
        // SYNTHESIZER MODE
        let frequency = audioParams.frequency || 440;
        
        // Apply pitch transpose
        const pitchTranspose = parseFloat(document.getElementById('pitchControl').value) || 0;
        frequency = frequency * Math.pow(2, pitchTranspose / 12);
        
        // Apply pitch quantization if enabled
        if (document.getElementById('pitchQuantization').checked) {
            frequency = quantizePitch(frequency);
        }
        
        const waveformType = document.querySelector('input[name="waveform"]:checked')?.value || 'sine';
        source = audioEngine.createCustomOscillator(frequency, waveformType, duration);
        
        source.start(audioEngine.audioContext.currentTime);
        source.stop(audioEngine.audioContext.currentTime + duration / 1000);
        
        // Start FM modulator if present
        if (source._modulator) {
            source._modulator.start(audioEngine.audioContext.currentTime);
            source._modulator.stop(audioEngine.audioContext.currentTime + duration / 1000);
        }
    }
    
    // Configure filter
    filter.type = document.querySelector('input[name="filterType"]:checked')?.value || 'lowpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = filterQ;
    
    // Configure panner
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    
    // Configure envelope
    const now = audioEngine.audioContext.currentTime;
    const minSmoothTime = parameterMapper.samplerMode ? 0.003 : 0;
    const attackTime = Math.max(minSmoothTime, attack / 1000);
    const releaseTime = Math.max(minSmoothTime, release / 1000);
    const durationTime = duration / 1000;
    
    envelope.gain.setValueAtTime(0.001, now);
    envelope.gain.exponentialRampToValueAtTime(volume, now + attackTime);
    envelope.gain.setValueAtTime(volume, now + Math.max(attackTime, durationTime - releaseTime));
    envelope.gain.exponentialRampToValueAtTime(0.001, now + durationTime);
    
    // Connect audio chain
    source.connect(filter);
    filter.connect(panner);
    panner.connect(envelope);
    
    // Connect to effects chain if available, otherwise directly to destination
    if (audioEngine.reverbNode && audioEngine.reverbDryGain) {
        envelope.connect(audioEngine.reverbNode);
        envelope.connect(audioEngine.reverbDryGain);
    } else {
        // No effects chain - connect directly to destination
        envelope.connect(audioEngine.audioContext.destination);
    }
}

function updateDelayParameters(audioParams) {
    // Check if delay nodes are initialized
    if (!audioEngine.delayNode || !audioEngine.delayFeedbackGain || !audioEngine.delayWetGain || !audioEngine.delayDryGain) {
        console.warn('⚠️ Delay nodes not initialized - skipping delay parameter update');
        return;
    }
    
    const delayTime = (audioParams.delayTime || 200) / 1000;
    const delayFeedback = audioParams.delayFeedback !== null && audioParams.delayFeedback !== undefined ? 
        audioParams.delayFeedback : 0.3;
    const delayMix = audioParams.delayMix !== null && audioParams.delayMix !== undefined ? 
        audioParams.delayMix : 0.3;
    
    const now = audioEngine.audioContext.currentTime;
    
    // Analog-style delay time ramping for pitch shifting
    if (audioEngine.previousDelayTime !== null && Math.abs(delayTime - audioEngine.previousDelayTime) > 0.005) {
        audioEngine.delayNode.delayTime.linearRampToValueAtTime(delayTime, now + 0.05);
    } else {
        audioEngine.delayNode.delayTime.setValueAtTime(delayTime, now);
    }
    audioEngine.previousDelayTime = delayTime;
    
    audioEngine.delayFeedbackGain.gain.setValueAtTime(Math.max(0, Math.min(0.9, delayFeedback)), now);
    audioEngine.delayWetGain.gain.setValueAtTime(Math.max(0, Math.min(1, delayMix)), now);
    audioEngine.delayDryGain.gain.setValueAtTime(1 - delayMix, now);
}

function updateReverbParameters(audioParams) {
    // Check if reverb nodes are initialized
    if (!audioEngine.reverbNode || !audioEngine.reverbWetGain || !audioEngine.reverbDryGain) {
        console.warn('⚠️ Reverb nodes not initialized - skipping reverb parameter update');
        return;
    }
    
    const reverbDecay = audioParams.reverbDecay || 2;
    const reverbMix = audioParams.reverbMix !== null && audioParams.reverbMix !== undefined ? 
        audioParams.reverbMix : 0.3;
    
    // Update reverb buffer if decay changed significantly
    if (!audioEngine.reverbNode.buffer || Math.abs(audioEngine.reverbNode.buffer.duration - reverbDecay) > 0.5) {
        audioEngine.reverbNode.buffer = audioEngine.createReverbImpulse(reverbDecay, reverbDecay);
    }
    
    audioEngine.reverbWetGain.gain.value = Math.max(0, Math.min(1, reverbMix));
    audioEngine.reverbDryGain.gain.value = 1 - reverbMix;
}

// ============================================================================
// MUSICAL QUANTIZATION
// Snap pitches to scales and rhythms to musical time divisions
// Optional features for more structured/musical output
// ============================================================================

function quantizeRhythm(spacing) {
    const rhythmGrid = [125, 250, 375, 500, 750, 1000, 1500, 2000]; // Musical divisions at 120 BPM
    return rhythmGrid.reduce((prev, curr) => 
        Math.abs(curr - spacing) < Math.abs(prev - spacing) ? curr : prev
    );
}

function quantizePitch(frequency) {
    const scaleType = document.getElementById('scaleSelector')?.value || 'pentatonic';
    
    const scales = {
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

// ============================================================================
// UI EVENT HANDLERS
// Handle user interactions with controls and settings
// Update UI feedback and coordinate module state
// ============================================================================

function handleRandomize() {
    if (!numericPaths.length) return;
    
    parameterMapper.randomizeMappings(numericPaths);
    patchViz.render(numericPaths, parameterMapper.mappings, parameterMapper, isPlaying);
    
    // Randomize waveform and filter too
    const waveforms = ['sine', 'square', 'sawtooth', 'triangle'];
    const randomWaveform = waveforms[Math.floor(Math.random() * waveforms.length)];
    document.querySelector(`input[name="waveform"][value="${randomWaveform}"]`).checked = true;
    
    const filterTypes = ['lowpass', 'highpass', 'bandpass', 'notch'];
    const randomFilter = filterTypes[Math.floor(Math.random() * filterTypes.length)];
    document.querySelector(`input[name="filterType"][value="${randomFilter}"]`).checked = true;
}

function handleVolumeChange(e) {
    const vol = parseFloat(e.target.value);
    document.getElementById('masterVolumeValue').textContent = `${vol.toFixed(2)} (${(vol * 100).toFixed(0)}%)`;
}

function handlePitchChange(e) {
    const semitones = parseFloat(e.target.value);
    const sign = semitones >= 0 ? '+' : '';
    document.getElementById('pitchValue').textContent = `${sign}${semitones.toFixed(1)} semitones`;
}

function handleSpeedChange(e) {
    document.getElementById('speedValue').textContent = `${e.target.value}x`;
}

function handleModeChange(e) {
    const samplerMode = e.target.value === 'sampler';
    
    // Sync mode across modules
    audioEngine.samplerMode = samplerMode;
    parameterMapper.samplerMode = samplerMode;
    
    // Show/hide relevant sections
    document.getElementById('sampleUploadSection').style.display = samplerMode ? 'block' : 'none';
    document.getElementById('waveformSection').style.display = samplerMode ? 'none' : 'block';
    document.getElementById('filterSection').style.display = samplerMode ? 'none' : 'block';
    
    console.log(`🎛️ Switched to ${samplerMode ? 'SAMPLER' : 'SYNTHESIZER'} mode`);
    
    // Rebuild visualization with new parameters
    if (numericPaths.length > 0) {
        patchViz.render(numericPaths, parameterMapper.mappings, parameterMapper, isPlaying);
    }
}

async function handleSampleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log(`📂 Loading sample: ${file.name}`);
    
    document.getElementById('sampleLoadError').style.display = 'none';
    document.getElementById('sampleInfo').style.display = 'none';
    
    try {
        const sampleInfo = await audioEngine.loadSample(file);
        
        // Display sample info
        document.getElementById('sampleFileName').textContent = sampleInfo.fileName;
        document.getElementById('sampleDuration').textContent = `${sampleInfo.duration.toFixed(2)}s`;
        document.getElementById('sampleFormat').textContent = 
            `${sampleInfo.channels} ch, ${(sampleInfo.sampleRate / 1000).toFixed(1)} kHz`;
        document.getElementById('sampleInfo').style.display = 'block';
        
    } catch (error) {
        console.error('❌ Error loading sample:', error);
        document.getElementById('sampleLoadError').textContent = error.message;
        document.getElementById('sampleLoadError').style.display = 'block';
    }
}

function handleClearSample() {
    audioEngine.clearSample();
    document.getElementById('sampleFileInput').value = '';
    document.getElementById('sampleInfo').style.display = 'none';
}

// ============================================================================
// START APPLICATION
// ============================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
