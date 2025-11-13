'use client';

import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/stores/audioStore';

export default function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useAudioStore(state => state.engine);
  const isPlaying = useAudioStore(state => state.isPlaying);
  
  useEffect(() => {
    if (!isPlaying || !engine || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const analyser = engine.getAnalyser();
    if (!analyser) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Set canvas resolution for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    let animationId: number;
    
    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      
      const width = rect.width;
      const height = rect.height;
      
      // Clear with light gray
      ctx.fillStyle = '#eee';
      ctx.fillRect(0, 0, width, height);
      
      // Show only first 60% of spectrum (musical content)
      const relevantBins = Math.floor(bufferLength * 0.6);
      
      // Draw frequency spectrum
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      
      const sliceWidth = width / relevantBins;
      const amplification = 2.0;
      
      for (let i = 0; i < relevantBins; i++) {
        const v = Math.min(1, (dataArray[i] / 255.0) * amplification);
        const y = height - (v * height);
        const x = i * sliceWidth;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      animationId = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      // Clear canvas
      if (ctx) {
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
    };
  }, [isPlaying, engine]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`w-full bg-gray-200 ${isPlaying ? 'block' : 'hidden'}`}
      style={{ height: '120px' }}
    />
  );
}

