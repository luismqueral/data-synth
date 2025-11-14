/**
 * MODULE: Patch Visualization
 * 
 * Purpose: D3.js-based node graph showing data-to-audio parameter mappings
 * 
 * Key Exports:
 * - PatchViz class - Manages the patch cable visualization
 *   - render() - Draw/update entire visualization
 *   - updateNodeValues() - Update node values during playback
 *   - clearNodeValues() - Reset all node displays
 *   - updateConnections() - Redraw connection lines
 * 
 * Dependencies:
 * - D3.js (global from CDN)
 * - lib/data-processor.js (safeId, getValueByPath)
 * 
 * Used By:
 * - main.js (visualization coordination)
 * - json-mapper-v2.html (during migration)
 * 
 * Browser APIs Used:
 * - DOM API (for SVG manipulation via D3)
 * 
 * Required CSS (must be in HTML <style> tag):
 * - .node-rect - Node background styling
 * - .node-text - Node label text
 * - .node-value - Value display text
 * - .node.unmapped - Dimmed styling for unmapped nodes
 * - .node.hover-dimmed / .hover-highlight - Hover effects
 * - .connection-path - Black dashed line (stroke: #000, dasharray: 8,8)
 * - .connection-path-yellow - Yellow dashed overlay (stroke: #FFD700, dasharray: 8,8)
 * - .connection-path.active / .hover-active - Active state styling
 * - .port - Connection port circles
 * - .param-bar-bg / .param-bar-fill - Progress bar styling
 * 
 * Visual Design:
 * - Connection lines: Always yellow/black dashed pattern (patch cable aesthetic)
 * - All nodes: Same width (150-200px) for visual balance
 * - Data nodes: Left column with field names
 * - Audio nodes: Right column with progress bars at bottom
 * - Responsive: Adjusts sizing and spacing for mobile (<600px)
 */

import { safeId, getValueByPath } from './data-processor.js';

/**
 * Patch Visualization Class
 * 
 * This is a class because:
 * - D3 selections and state need to persist
 * - Multiple methods operate on the same SVG
 * - Node data is shared across methods
 * - Maintains reference to SVG container
 * 
 * Important: D3 directly manipulates SVG DOM
 * Don't try to update the same SVG with vanilla JS - let D3 own it
 * 
 * Usage:
 *   const viz = new PatchViz('patchViz');
 *   viz.render(numericPaths, mappings, parameterMapper, isPlaying);
 *   viz.updateNodeValues(currentItem, audioParams, mappings, isPlaying);
 *   viz.clearNodeValues();
 */
export class PatchViz {
    constructor(svgElementId) {
        // Store D3 selection (not raw DOM element)
        this.svg = d3.select(`#${svgElementId}`);
        
        // Node data (built during render)
        this.nodes = [];
        
        // Store element IDs for quick lookups
        this.svgElementId = svgElementId;
        
        // Debug flags (prevent log spam)
        this._loggedItemStructure = false;
        this._loggedMissingPaths = {};
        this._loggedMissingElements = {};
    }
    
    /**
     * Render the complete patch visualization
     * 
     * This clears and redraws the entire visualization.
     * Call this when:
     * - Data is loaded
     * - Mappings change
     * - Mode switches (synth ↔ sampler)
     * 
     * @param {Array} numericPaths - Detected numeric field paths
     * @param {Object} mappings - Current parameter mappings
     * @param {Object} parameterMapper - ParameterMapper instance for getAudioParams()
     * @param {boolean} isPlaying - Whether audio is currently playing
     */
    render(numericPaths, mappings, parameterMapper, isPlaying = false) {
        if (this.svg.empty()) {
            console.warn('patchViz SVG element not found');
            return;
        }
        
        // Clear everything
        this.svg.selectAll('*').remove();
        
        // Get actual rendered width from the SVG's parent container
        // This is more reliable than style('width') especially during CSS transitions
        const svgNode = this.svg.node();
        const containerWidth = svgNode ? svgNode.parentElement.getBoundingClientRect().width : 800;
        const width = containerWidth > 0 ? containerWidth : 800;
        
        if (numericPaths.length === 0) {
            // No data - show placeholder
            this.svg.attr('height', 200);
            this.svg.append('text')
                .attr('x', width / 2)
                .attr('y', 100)
                .attr('text-anchor', 'middle')
                .attr('class', 'node-text')
                .text('Parse JSON/CSV to see data nodes');
            return;
        }
        
        // Create nodes
        this.nodes = [];
        this._createNodes(numericPaths, parameterMapper, width);
        
        console.log(`Creating visualization with ${this.nodes.length} nodes`);
        
        // Calculate height based on number of nodes
        const nodeSpacing = 60; // Increased for better readability and breathing room
        const dataNodeCount = this.nodes.filter(n => n.type === 'data').length;
        const audioNodeCount = this.nodes.filter(n => n.type === 'audio').length;
        const maxNodes = Math.max(dataNodeCount, audioNodeCount);
        const dynamicHeight = 50 + (maxNodes * nodeSpacing) + 50;
        
        this.svg.attr('height', dynamicHeight);
        console.log(`SVG height set to ${dynamicHeight}px for ${maxNodes} nodes`);
        
        // Create main group
        const g = this.svg.append('g').attr('class', 'main-group');
        
        // Draw connections first (behind nodes)
        const connectionGroup = g.append('g').attr('class', 'connections');
        this._drawConnections(connectionGroup, mappings, width);
        
        // Draw nodes (pass mappings and isPlaying for interactivity)
        const nodeGroup = g.append('g').attr('class', 'nodes');
        this._drawNodes(nodeGroup, width, mappings, isPlaying);
    }
    
    /**
     * Create node data structures
     * @private
     */
    _createNodes(numericPaths, parameterMapper, svgWidth) {
        const nodeSpacing = 60; // Match spacing used in height calculation
        
        // Responsive margins and column positioning
        const margin = svgWidth < 600 ? 40 : 100;
        const columnGap = (svgWidth - (2 * margin)) * 0.27; // Fine-tuned for optimal cable length
        const leftX = margin + columnGap;
        const rightX = svgWidth - margin - columnGap;
        
        console.log(`Node layout: width=${svgWidth}, margin=${margin}, gap=${columnGap.toFixed(0)}, leftX=${leftX.toFixed(0)}, rightX=${rightX.toFixed(0)}`);
        
        // Update column headers
        const leftHeaderEl = document.getElementById('leftHeader');
        const rightHeaderEl = document.getElementById('rightHeader');
        if (leftHeaderEl) leftHeaderEl.style.left = `${leftX}px`;
        if (rightHeaderEl) rightHeaderEl.style.left = `${rightX}px`;
        
        // Data nodes (left side)
        numericPaths.forEach((path, i) => {
            this.nodes.push({
                id: `data_${safeId(path.path)}`,
                label: path.path,
                x: leftX,
                y: 30 + i * nodeSpacing,
                type: 'data',
                dataPath: path.path
            });
        });
        
        // Audio parameter nodes (right side)
        const audioParamsConfig = parameterMapper.getAudioParams();
        const audioParams = audioParamsConfig.map(p => p.id);
        
        audioParams.forEach((param, i) => {
            this.nodes.push({
                id: `audio_${param}`,
                label: param,
                x: rightX,
                y: 30 + i * nodeSpacing,
                type: 'audio',
                audioParam: param
            });
        });
    }
    
    /**
     * Draw nodes with D3
     * @private
     */
    _drawNodes(container, svgWidth, mappings, isPlaying) {
        // Responsive node sizing - all nodes same width for visual balance
        const nodeWidth = svgWidth < 600 ? 150 : 200;
        const audioNodeWidth = nodeWidth;
        const dataNodeWidth = nodeWidth;
        const nodeHeight = svgWidth < 600 ? 44 : 50; // Increased for more padding
        
        // Helper to truncate text
        const truncateText = (text, maxLength) => {
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength - 1) + '…';
        };
        
        const nodeGroups = container.selectAll('.node')
            .data(this.nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x},${d.y})`);
        
        // Node rectangle
        nodeGroups.append('rect')
            .attr('class', 'node-rect')
            .attr('x', d => {
                const width = d.type === 'data' ? dataNodeWidth : audioNodeWidth;
                return -width/2;
            })
            .attr('y', -nodeHeight/2)
            .attr('width', d => d.type === 'data' ? dataNodeWidth : audioNodeWidth)
            .attr('height', nodeHeight)
            .attr('rx', 2)
            .attr('data-node-id', d => d.id);
        
        // Node label
        nodeGroups.append('text')
            .attr('class', 'node-text')
            .attr('y', 0)
            .text(d => {
                const maxChars = d.type === 'data' ? 28 : 20;
                return truncateText(d.label, maxChars);
            });
        
        // Value display (below label)
        nodeGroups.append('text')
            .attr('class', 'node-value')
            .attr('id', d => `value_${d.id}`)
            .attr('y', 15) // Increased spacing between label and value
            .attr('text-anchor', 'middle')
            .text('--');
        
        // Connection ports
        nodeGroups.append('circle')
            .attr('class', 'port')
            .attr('cx', d => {
                const width = d.type === 'data' ? dataNodeWidth : audioNodeWidth;
                return d.type === 'data' ? width/2 : -width/2;
            })
            .attr('cy', 0)
            .attr('r', 4);
        
        // Progress bars for audio parameters only
        nodeGroups.filter(d => d.type === 'audio').each(function(d) {
            const nodeGroup = d3.select(this);
            const width = audioNodeWidth;
            const barHeight = 4;
            const barY = nodeHeight/2 - barHeight;
            
            // Background bar
            nodeGroup.append('rect')
                .attr('class', 'param-bar-bg')
                .attr('x', -width/2)
                .attr('y', barY)
                .attr('width', width)
                .attr('height', barHeight)
                .attr('rx', 0)
                .attr('fill', '#e0e0e0');
            
            // Progress fill
            nodeGroup.append('rect')
                .attr('class', 'param-bar-fill')
                .attr('id', `bar_${d.id}`)
                .attr('x', -width/2)
                .attr('y', barY)
                .attr('width', 0)
                .attr('height', barHeight)
                .attr('rx', 0)
                .attr('fill', '#007bff');
        });
        
        // Apply unmapped dimming and hover effects
        this._applyNodeInteractivity(nodeGroups, mappings, isPlaying);
    }
    
    /**
     * Apply hover effects and unmapped dimming
     * @private
     */
    _applyNodeInteractivity(nodeGroups, mappings, isPlaying) {
        // Capture reference to nodes array (inside .each(), 'this' refers to DOM element)
        const nodes = this.nodes;
        
        nodeGroups.each(function(d) {
            const nodeGroup = d3.select(this);
            
            // Check if node is connected
            let isConnected = false;
            let connectedNodeIds = [];
            
            if (d.type === 'data') {
                // Check if any audio param uses this data path
                Object.entries(mappings).forEach(([param, mapping]) => {
                    if (mapping && mapping.path === d.dataPath) {
                        connectedNodeIds.push(`audio_${param}`);
                        isConnected = true;
                    }
                });
            } else if (d.type === 'audio') {
                // Check if this audio param has a mapping
                const mapping = mappings[d.audioParam];
                if (mapping && mapping.path) {
                    const dataNode = nodes.find(n => n.type === 'data' && n.dataPath === mapping.path);
                    if (dataNode) {
                        connectedNodeIds.push(dataNode.id);
                        isConnected = true;
                    }
                }
            }
            
            // Dim unmapped nodes
            if (!isConnected) {
                nodeGroup.classed('unmapped', true);
            }
            
            // Hover handlers for visual feedback
            nodeGroup
                .on('mouseenter', function() {
                    d3.select(this).classed('hover-highlight', true);
                    
                    // Dim non-connected nodes
                    d3.selectAll('.node').each(function(otherNode) {
                        const otherId = otherNode.id;
                        const isThisNode = otherId === d.id;
                        const isConnectedToThis = connectedNodeIds.includes(otherId);
                        
                        if (!isThisNode && !isConnectedToThis) {
                            d3.select(this).classed('hover-dimmed', true);
                        } else if (isConnectedToThis) {
                            d3.select(this).classed('hover-highlight', true);
                        }
                    });
                    
                    // Highlight related connections
                    const relatedParams = [];
                    if (d.type === 'data') {
                        Object.entries(mappings).forEach(([param, mapping]) => {
                            if (mapping && mapping.path === d.dataPath) {
                                relatedParams.push(param);
                            }
                        });
                    } else if (d.type === 'audio') {
                        const mapping = mappings[d.audioParam];
                        if (mapping && mapping.path) {
                            relatedParams.push(d.audioParam);
                        }
                    }
                    
                    // Style connections based on playback state
                    d3.selectAll('[data-target]').each(function() {
                        const target = d3.select(this).attr('data-target');
                        const isRelated = relatedParams.includes(target);
                        
                        if (!isPlaying) {
                            if (isRelated) {
                                d3.select(this).classed('hover-active', true);
                                // Bring active connections to front (z-order)
                                d3.select(this).raise();
                            } else {
                                d3.select(this).classed('hover-dimmed', true);
                            }
                        } else {
                            if (!isRelated) {
                                d3.select(this).classed('active', false).classed('hover-dimmed', true);
                            } else {
                                // Bring active connections to front (z-order)
                                d3.select(this).raise();
                            }
                        }
                    });
                })
                .on('mouseleave', function() {
                    // Clear hover effects
                    d3.selectAll('.node').classed('hover-dimmed', false);
                    d3.selectAll('.node').classed('hover-highlight', false);
                    d3.selectAll('[data-target]').classed('hover-dimmed', false);
                    d3.selectAll('[data-target]').classed('hover-active', false);
                    
                    // Restore active connections when playing
                    if (isPlaying) {
                        Object.entries(mappings).forEach(([param, mapping]) => {
                            if (mapping && mapping.path) {
                                d3.selectAll(`[data-target="${param}"]`).classed('active', true);
                            }
                        });
                    }
                });
        });
    }
    
    /**
     * Draw connection lines between mapped data and audio parameters
     * @private
     */
    _drawConnections(container, mappings, svgWidth) {
        if (!container) {
            console.warn('updateConnections: container is null');
            return;
        }
        
        container.selectAll('*').remove();
        
        const nodeWidth = svgWidth < 600 ? 150 : 200;
        const audioNodeWidth = nodeWidth;
        const dataNodeWidth = nodeWidth;
        let connectionCount = 0;
        
        // Draw each active mapping
        Object.entries(mappings).forEach(([audioParam, mapping]) => {
            if (mapping && mapping.path) {
                const sourceNode = this.nodes.find(n => n.dataPath === mapping.path);
                const targetNode = this.nodes.find(n => n.audioParam === audioParam);
                
                if (sourceNode && targetNode) {
                    // Calculate connection path (cubic bezier curve)
                    const sourceX = sourceNode.x + dataNodeWidth/2;
                    const sourceY = sourceNode.y;
                    const targetX = targetNode.x - audioNodeWidth/2;
                    const targetY = targetNode.y;
                    const midX = (sourceX + targetX) / 2;
                    const pathData = `M ${sourceX},${sourceY} C ${midX},${sourceY} ${midX},${targetY} ${targetX},${targetY}`;
                    
                    // Draw yellow background path (for alternating dashed effect)
                    container.append('path')
                        .attr('class', 'connection-path-yellow')
                        .attr('d', pathData)
                        .attr('data-target', audioParam);
                    
                    // Draw black foreground path
                    container.append('path')
                        .attr('class', 'connection-path')
                        .attr('d', pathData)
                        .attr('data-target', audioParam)
                        .datum({ source: mapping.path, target: audioParam });
                    
                    connectionCount++;
                } else {
                    console.warn(`Connection ${audioParam} → ${mapping.path}: missing nodes`, {
                        sourceFound: !!sourceNode,
                        targetFound: !!targetNode
                    });
                }
            }
        });
        
        console.log(`Drew ${connectionCount} connections`);
    }
    
    /**
     * Update connections (call this when mappings change)
     * 
     * @param {Object} mappings - Current parameter mappings
     */
    updateConnections(mappings) {
        const connectionGroup = d3.select('.connections');
        if (!connectionGroup.empty()) {
            // Get actual rendered width from container
            const svgNode = this.svg.node();
            const containerWidth = svgNode ? svgNode.parentElement.getBoundingClientRect().width : 800;
            const width = containerWidth > 0 ? containerWidth : 800;
            this._drawConnections(connectionGroup, mappings, width);
        }
    }
    
    /**
     * Update node values during playback
     * 
     * This updates the small text below each node showing current values.
     * Also highlights active nodes and connections.
     * 
     * @param {Object} currentItem - Current data item being played
     * @param {Object} calculatedAudioParams - Calculated audio parameters for this item
     * @param {Object} mappings - Current parameter mappings
     * @param {boolean} isPlaying - Whether playback is active
     */
    updateNodeValues(currentItem, calculatedAudioParams, mappings, isPlaying) {
        // Clear previous highlights
        d3.selectAll('.node-rect').classed('playing', false);
        d3.selectAll('.connection-path').classed('active', false);
        d3.selectAll('.connection-path-yellow').classed('active', false);
        
        // Debug: log current item structure once
        if (!this._loggedItemStructure) {
            console.log('=== Current Item Structure ===');
            console.log('Item:', currentItem);
            console.log('Item keys:', Object.keys(currentItem || {}));
            console.log('=== Node IDs for debugging ===');
            this.nodes.filter(n => n.type === 'data').slice(0, 3).forEach(n => {
                console.log(`  ${n.label} → ID: ${n.id} → Element: #value_${n.id}`);
            });
            this._loggedItemStructure = true;
        }
        
        // Update data node values (left side)
        this.nodes.forEach(node => {
            if (node.type === 'data') {
                const value = getValueByPath(currentItem, node.dataPath);
                const valueEl = document.getElementById(`value_${node.id}`);
                
                if (valueEl) {
                    if (value !== undefined && value !== null) {
                        const displayValue = typeof value === 'number' ? 
                            (Math.abs(value) < 0.01 ? value.toExponential(1) : value.toFixed(2)) : 
                            (String(value).length > 12 ? String(value).substring(0, 12) + '...' : value);
                        valueEl.textContent = displayValue;
                    } else {
                        valueEl.textContent = '--';
                        // Debug: log missing values (once per path)
                        if (!this._loggedMissingPaths[node.dataPath]) {
                            console.warn(`Cannot find value for path: ${node.dataPath} in item:`, currentItem);
                            this._loggedMissingPaths[node.dataPath] = true;
                        }
                    }
                    
                    // Highlight if mapped
                    const isActive = Object.values(mappings).some(m => m.path === node.dataPath);
                    if (isActive) {
                        d3.select(`[data-node-id="${node.id}"]`).classed('playing', true);
                    }
                } else {
                    if (!this._loggedMissingElements[node.id]) {
                        console.error(`Cannot find DOM element for node ID: ${node.id} (path: ${node.dataPath})`);
                        this._loggedMissingElements[node.id] = true;
                    }
                }
            }
        });
        
        // Update audio param values (right side)
        Object.entries(calculatedAudioParams).forEach(([param, value]) => {
            const node = this.nodes.find(n => n.audioParam === param);
            if (node && value !== undefined && value !== null) {
                const displayValue = typeof value === 'number' ? 
                    (Math.abs(value) < 0.01 ? value.toExponential(1) : value.toFixed(2)) : 
                    (String(value).length > 12 ? String(value).substring(0, 12) + '...' : value);
                
                const valueEl = document.getElementById(`value_${node.id}`);
                if (valueEl) {
                    valueEl.textContent = displayValue;
                }
                
                // Update progress bar
                const barEl = d3.select(`#bar_${node.id}`);
                if (!barEl.empty() && typeof value === 'number') {
                    const mapping = mappings[param];
                    if (mapping) {
                        const min = mapping.min;
                        const max = mapping.max;
                        const svg = d3.select(`#${this.svgElementId}`);
                        const svgNode = svg.node();
                        const containerWidth = svgNode ? svgNode.parentElement.getBoundingClientRect().width : 800;
                        const svgWidth = containerWidth > 0 ? containerWidth : 600;
                        const nodeWidth = svgWidth < 600 ? 150 : 200;
                        const barMaxWidth = nodeWidth;
                        
                        if (param === 'pan') {
                            // Pan: center at 0, goes -1 to +1
                            const normalizedPan = (value + 1) / 2;
                            const fillWidth = normalizedPan * barMaxWidth;
                            barEl.attr('width', fillWidth);
                        } else {
                            // Normal parameters: 0-100%
                            const normalized = (value - min) / (max - min);
                            const fillWidth = Math.max(0, Math.min(1, normalized)) * barMaxWidth;
                            barEl.attr('width', fillWidth);
                        }
                    }
                }
                
                // Highlight if mapped
                if (mappings[param]?.path) {
                    d3.select(`[data-node-id="${node.id}"]`).classed('playing', true);
                    d3.selectAll(`[data-target="${param}"]`).classed('active', true);
                }
            }
        });
    }
    
    /**
     * Clear all node values (reset visualization)
     * Call this when playback stops
     */
    clearNodeValues() {
        d3.selectAll('.node-value').text('--');
        d3.selectAll('.node-rect').classed('playing', false);
        d3.selectAll('.connection-path').classed('active', false);
        d3.selectAll('.connection-path-yellow').classed('active', false);
        d3.selectAll('.param-bar-fill').attr('width', 0);
    }
    
    /**
     * Reset debug flags (call at start of new playback)
     */
    resetDebugFlags() {
        this._loggedItemStructure = false;
        this._loggedMissingPaths = {};
        this._loggedMissingElements = {};
    }
}

