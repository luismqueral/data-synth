'use client';

import { useEffect } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { useDataStore } from '@/stores/dataStore';
import { useMappingStore } from '@/stores/mappingStore';
import DatasetSelector from '@/components/data/DatasetSelector';
import PlaybackControls from '@/components/playback/PlaybackControls';
import GlobalSettings from '@/components/audio/GlobalSettings';
import PatchVisualization from '@/components/visualization/PatchVisualization';
import AudioVisualizer from '@/components/visualization/AudioVisualizer';

export default function Home() {
  const initAudioEngine = useAudioStore(state => state.initEngine);
  const initDataEngine = useDataStore(state => state.initEngine);
  const initializeMappings = useMappingStore(state => state.initializeMappings);
  const samplerMode = useAudioStore(state => state.samplerMode);
  
  useEffect(() => {
    // Initialize engines on mount
    initAudioEngine();
    initDataEngine();
    initializeMappings('synthesizer');
  }, [initAudioEngine, initDataEngine, initializeMappings]);
  
  useEffect(() => {
    // Reinitialize mappings when mode changes
    initializeMappings(samplerMode ? 'sampler' : 'synthesizer');
  }, [samplerMode, initializeMappings]);
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1100px] mx-auto p-4">
        {/* Header */}
        <h1 className="text-5xl text-center mb-2 mt-0 font-normal" style={{ fontFamily: 'serif' }}>
          DataSynth
        </h1>
        <p className="text-center text-sm text-gray-600 mb-6 max-w-[600px] mx-auto">
          Turn any dataset into sound.{' '}
          <a 
            href="https://github.com/luismqueral/data-2-sound" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-black underline"
          >
            Learn More
          </a>
        </p>
        
        {/* Dataset Selection */}
        <div className="mb-8">
          <DatasetSelector />
        </div>
        
        {/* Playback Controls */}
        <div className="mb-4">
          <PlaybackControls />
        </div>
        
        {/* Audio Visualizer */}
        <div className="mb-6">
          <AudioVisualizer />
        </div>
        
        {/* Global Settings */}
        <div className="mb-6">
          <GlobalSettings />
        </div>
        
        {/* Patch Visualization */}
        <div className="bg-gray-100 p-5 border border-gray-300 mb-6">
          <h3 className="text-base font-semibold mt-0 mb-4">Patch View</h3>
          <PatchVisualization />
        </div>
        
        {/* Dataset Source Link */}
        <div className="text-center mb-8">
          <a 
            id="datasetSourceLink" 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-gray-600 underline hidden"
          >
            View dataset source →
          </a>
        </div>
      </div>
    </div>
  );
}
