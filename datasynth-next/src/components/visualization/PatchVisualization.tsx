'use client';

import { useEffect, useRef } from 'react';
import { useDataStore } from '@/stores/dataStore';
import { useMappingStore } from '@/stores/mappingStore';
import { useAudioStore } from '@/stores/audioStore';
import * as d3 from 'd3';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'data' | 'audio';
  dataPath?: string;
  audioParam?: string;
}

export default function PatchVisualization() {
  const svgRef = useRef<SVGSVGElement>(null);
  const numericPaths = useDataStore(state => state.numericPaths);
  const mappings = useMappingStore(state => state.mappings);
  const samplerMode = useAudioStore(state => state.samplerMode);
  const isPlaying = useAudioStore(state => state.isPlaying);
  
  useEffect(() => {
    if (!svgRef.current || numericPaths.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    const svgElement = svgRef.current;
    const width = svgElement.clientWidth || 800;
    
    // Create nodes
    const nodes: Node[] = [];
    const nodeSpacing = 45;
    const margin = width < 600 ? 40 : 100;
    const columnGap = (width - (2 * margin)) * 0.25;
    const leftX = margin + columnGap;
    const rightX = width - margin - columnGap;
    
    // Data nodes (left)
    numericPaths.forEach((path, i) => {
      nodes.push({
        id: `data_${path.path.replace(/\./g, '_')}`,
        label: path.path,
        x: leftX,
        y: 30 + i * nodeSpacing,
        type: 'data',
        dataPath: path.path
      });
    });
    
    // Audio parameter nodes (right)
    const audioParams = Object.keys(mappings);
    audioParams.forEach((param, i) => {
      nodes.push({
        id: `audio_${param}`,
        label: param,
        x: rightX,
        y: 30 + i * nodeSpacing,
        type: 'audio',
        audioParam: param
      });
    });
    
    // Calculate height
    const dataNodeCount = nodes.filter(n => n.type === 'data').length;
    const audioNodeCount = nodes.filter(n => n.type === 'audio').length;
    const maxNodes = Math.max(dataNodeCount, audioNodeCount);
    const height = 50 + (maxNodes * nodeSpacing) + 50;
    
    svg.attr('height', height);
    
    const g = svg.append('g');
    
    // Draw connections
    const connectionGroup = g.append('g').attr('class', 'connections');
    
    Object.entries(mappings).forEach(([audioParam, mapping]) => {
      if (mapping && mapping.path) {
        const sourceNode = nodes.find(n => n.dataPath === mapping.path);
        const targetNode = nodes.find(n => n.audioParam === audioParam);
        
        if (sourceNode && targetNode) {
          const dataNodeWidth = width < 600 ? 150 : 200;
          const audioNodeWidth = width < 600 ? 110 : 140;
          
          const sourceX = sourceNode.x + dataNodeWidth/2;
          const sourceY = sourceNode.y;
          const targetX = targetNode.x - audioNodeWidth/2;
          const targetY = targetNode.y;
          const midX = (sourceX + targetX) / 2;
          
          const pathData = `M ${sourceX},${sourceY} C ${midX},${sourceY} ${midX},${targetY} ${targetX},${targetY}`;
          
          // Yellow path (background)
          connectionGroup.append('path')
            .attr('class', 'connection-path-yellow')
            .attr('d', pathData)
            .attr('stroke', 'transparent')
            .attr('stroke-width', 3)
            .attr('fill', 'none')
            .attr('stroke-dasharray', '8,8')
            .classed('active', isPlaying);
          
          // Black path (foreground)
          connectionGroup.append('path')
            .attr('class', 'connection-path')
            .attr('d', pathData)
            .attr('stroke', isPlaying ? '#000' : '#999')
            .attr('stroke-width', 3)
            .attr('fill', 'none')
            .attr('stroke-dasharray', isPlaying ? '8,8' : 'none')
            .attr('cursor', 'pointer');
        }
      }
    });
    
    // Draw nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    
    const dataNodeWidth = width < 600 ? 150 : 200;
    const audioNodeWidth = width < 600 ? 110 : 140;
    const nodeHeight = width < 600 ? 36 : 40;
    
    const nodeGroups = nodeGroup.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`);
    
    // Node rectangles
    nodeGroups.append('rect')
      .attr('class', 'node-rect')
      .attr('x', d => {
        const w = d.type === 'data' ? dataNodeWidth : audioNodeWidth;
        return -w/2;
      })
      .attr('y', -nodeHeight/2)
      .attr('width', d => d.type === 'data' ? dataNodeWidth : audioNodeWidth)
      .attr('height', nodeHeight)
      .attr('rx', 2)
      .attr('fill', '#fff')
      .attr('stroke', 'none');
    
    // Node labels
    nodeGroups.append('text')
      .attr('class', 'node-text')
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'monospace')
      .attr('font-size', '11px')
      .attr('font-weight', 600)
      .text(d => {
        const maxChars = d.type === 'data' ? 28 : 20;
        return d.label.length > maxChars ? d.label.substring(0, maxChars - 1) + '…' : d.label;
      });
    
    // Connection ports
    nodeGroups.append('circle')
      .attr('class', 'port')
      .attr('cx', d => {
        const w = d.type === 'data' ? dataNodeWidth : audioNodeWidth;
        return d.type === 'data' ? w/2 : -w/2;
      })
      .attr('cy', 0)
      .attr('r', 4)
      .attr('fill', '#fff')
      .attr('stroke', '#000')
      .attr('stroke-width', 2);
      
  }, [numericPaths, mappings, samplerMode, isPlaying]);
  
  return (
    <div className="relative">
      <div className="relative h-5 mb-2">
        <div 
          className="absolute font-mono text-xs font-semibold uppercase tracking-wide text-gray-600"
          style={{ left: '15%', transform: 'translateX(-50%)' }}
        >
          Data Fields
        </div>
        <div 
          className="absolute font-mono text-xs font-semibold uppercase tracking-wide text-gray-600"
          style={{ left: '85%', transform: 'translateX(-50%)' }}
        >
          Audio Parameters
        </div>
      </div>
      <svg
        ref={svgRef}
        className="w-full bg-transparent"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}

