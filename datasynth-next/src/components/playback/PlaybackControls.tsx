'use client';

import { useAudioStore } from '@/stores/audioStore';
import { useDataStore } from '@/stores/dataStore';
import { useMappingStore } from '@/stores/mappingStore';
import { usePlayback } from '@/hooks/usePlayback';

export default function PlaybackControls() {
  const isPlaying = useAudioStore(state => state.isPlaying);
  const data = useDataStore(state => state.data);
  const currentIndex = useAudioStore(state => state.currentIndex);
  const { play, stop } = usePlayback();
  
  const handlePlayStop = () => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  };
  
  const handleRandomize = () => {
    // TODO: Implement randomize mappings
    console.log('Randomize clicked');
  };
  
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={handlePlayStop}
        disabled={!data || data.length === 0}
        className="border border-black bg-black text-white hover:bg-white hover:text-black disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors font-mono"
        style={{ width: '240px', padding: '16px 24px', fontSize: '24px', height: '64px' }}
      >
        <span className="mr-2 text-2xl">{isPlaying ? '⏹' : '▶'}</span>
        <span>{isPlaying ? 'Stop' : 'Play Data'}</span>
      </button>
      
      <div 
        className="border border-gray-300 bg-gray-100 flex items-center justify-center font-mono"
        style={{ padding: '16px 24px', minWidth: '120px', height: '64px' }}
      >
        <div className="text-center">
          <div style={{ fontSize: '9px', color: '#999', letterSpacing: '0.5px', marginBottom: '2px' }}>
            ITEM
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#000' }}>
            {isPlaying && data ? `${currentIndex + 1} / ${data.length}` : '--'}
          </div>
        </div>
      </div>
      
      <button
        onClick={handleRandomize}
        disabled={!data || data.length === 0}
        className="border border-black bg-white hover:bg-black hover:text-white disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors font-mono"
        style={{ padding: '16px 24px', fontSize: '16px', minWidth: '180px', height: '64px' }}
      >
        <span className="mr-1">🔀</span>Randomize Patch
      </button>
    </div>
  );
}

