/**
 * usePlayback Hook
 * Handles audio playback logic
 */

import { useCallback } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { useDataStore } from '@/stores/dataStore';
import { useMappingStore } from '@/stores/mappingStore';

export function usePlayback() {
    const engine = useAudioStore(state => state.engine);
    const data = useDataStore(state => state.data);
    const dataEngine = useDataStore(state => state.engine);
    const mappings = useMappingStore(state => state.mappings);
    const setIsPlaying = useAudioStore(state => state.setIsPlaying);
    const setCurrentIndex = useAudioStore(state => state.setCurrentIndex);
    
    const masterVolume = useAudioStore(state => state.masterVolume);
    const masterPitch = useAudioStore(state => state.masterPitch);
    const speed = useAudioStore(state => state.speed);
    const samplerMode = useAudioStore(state => state.samplerMode);
    const waveform = useAudioStore(state => state.waveform);
    const filterType = useAudioStore(state => state.filterType);
    const pitchQuantization = useAudioStore(state => state.pitchQuantization);
    const rhythmicQuantization = useAudioStore(state => state.rhythmicQuantization);
    const randomChopMode = useAudioStore(state => state.randomChopMode);
    const fullNoteDuration = useAudioStore(state => state.fullNoteDuration);
    
    const play = useCallback(async () => {
        if (!engine || !data || !dataEngine) {
            console.error('Engine or data not initialized');
            return;
        }
        
        setIsPlaying(true);
        engine.resetDelayTime();
        
        // Calculate data ranges once
        const dataRanges = dataEngine.calculateDataRanges(mappings);
        
        console.log('=== Playback Starting ===');
        console.log('Data items:', data.length);
        console.log('Active mappings:', Object.keys(mappings).filter(k => mappings[k].path));
        
        // Playback loop
        for (let i = 0; i < data.length; i++) {
            setCurrentIndex(i);
            const item = data[i];
            
            // Calculate audio parameters
            const audioParams: any = {};
            
            Object.entries(mappings).forEach(([param, mapping]) => {
                if (mapping.path && dataRanges[param]) {
                    const rawValue = parseFloat(dataEngine.getValueByPath(item, mapping.path));
                    if (!isNaN(rawValue)) {
                        const dataMin = dataRanges[param].min;
                        const dataMax = dataRanges[param].max;
                        
                        if (dataMax !== dataMin) {
                            let normalized = (rawValue - dataMin) / (dataMax - dataMin);
                            normalized = Math.max(0, Math.min(1, normalized));
                            
                            // Apply curve
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
                            }
                            
                            audioParams[param] = mapping.min + (curved * (mapping.max - mapping.min));
                        } else {
                            audioParams[param] = mapping.min;
                        }
                    } else {
                        audioParams[param] = mapping.fixed;
                    }
                } else {
                    audioParams[param] = mapping.fixed;
                }
            });
            
            // Update effects
            engine.updateEffects({
                delayTime: audioParams.delayTime || 200,
                delayFeedback: audioParams.delayFeedback ?? 0.3,
                delayMix: audioParams.delayMix ?? 0.3,
                reverbDecay: audioParams.reverbDecay || 2,
                reverbMix: audioParams.reverbMix ?? 0.3
            });
            
            // Play note
            engine.playNote({
                mode: samplerMode ? 'sampler' : 'synthesizer',
                audioParams,
                volume: masterVolume,
                waveform,
                filterType,
                pitchTranspose: masterPitch,
                quantizePitch: pitchQuantization,
                randomChopMode,
                fullNoteDuration
            });
            
            // Calculate note spacing
            let noteSpacing = audioParams.noteSpacing ?? (500 / speed);
            
            // Add variation if not mapped
            if (!mappings.noteSpacing?.path) {
                const variation = 0.2;
                const randomFactor = 1 + (Math.random() * variation * 2 - variation);
                noteSpacing = noteSpacing * randomFactor;
            }
            
            // Apply rhythmic quantization if enabled
            if (rhythmicQuantization) {
                noteSpacing = quantizeRhythm(noteSpacing);
            }
            
            // Wait for next note
            await new Promise(resolve => setTimeout(resolve, noteSpacing));
        }
        
        setIsPlaying(false);
        setCurrentIndex(0);
        
    }, [engine, data, dataEngine, mappings, setIsPlaying, setCurrentIndex, masterVolume, masterPitch, speed, samplerMode, waveform, filterType, pitchQuantization, rhythmicQuantization, randomChopMode, fullNoteDuration]);
    
    const stop = useCallback(() => {
        setIsPlaying(false);
        setCurrentIndex(0);
    }, [setIsPlaying, setCurrentIndex]);
    
    return { play, stop };
}

function quantizeRhythm(spacing: number): number {
    const rhythmGrid = [125, 250, 375, 500, 750, 1000, 1500, 2000];
    return rhythmGrid.reduce((prev, curr) => 
        Math.abs(curr - spacing) < Math.abs(prev - spacing) ? curr : prev
    );
}

