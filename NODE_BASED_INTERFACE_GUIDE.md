# Node-Based Patching Interface Guide

## Current State vs. Node-Based Vision

### What You Have Now (Form-Based):
```
[Dropdown: Select Path] → Frequency
[Min] [Max] [Curve]
```

### What You Want (Node-Based):
```
┌─────────┐                  ┌──────────┐
│  Cost   ├──────────────────┤ Frequency│
└─────────┘                  └──────────┘
┌─────────┐     ┌────────┐   ┌──────────┐
│latitude ├─────┤ Scale  ├───┤   Pan    │
└─────────┘     └────────┘   └──────────┘
                   ^
                   └─ Click to edit range/curve
```

## Architecture Approaches

### Option 1: React Flow (Easiest, Most Polished)
**Library:** `reactflow` or `xyflow`
**Pros:**
- Pre-built draggable nodes
- Connection validation
- Auto-layout algorithms
- Beautiful UI out of box
- Active development

**Code Example:**
```jsx
const nodes = [
  { id: '1', type: 'input', data: { label: 'Cost' }, position: { x: 0, y: 0 } },
  { id: '2', type: 'output', data: { label: 'Frequency' }, position: { x: 400, y: 0 } }
];

const edges = [
  { id: 'e1-2', source: '1', target: '2', animated: true }
];
```

**Cons:** Requires React/framework

---

### Option 2: D3.js Force-Directed Graph (Pure JS, What You Have)
**Library:** D3.js (already included)
**Pros:**
- No framework needed
- Full control over visuals
- Physics-based layout
- Already in your stack

**Implementation:**
```javascript
const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2));

// Drag behavior
const drag = d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
```

**Cons:** More code to write for interactions

---

### Option 3: Svelte Flow (Modern, Reactive)
**Library:** `@xyflow/svelte`
**Pros:**
- Reactive updates
- Small bundle size
- Clean syntax
- Good for real-time audio

**Code:**
```svelte
<script>
  import { SvelteFlow } from '@xyflow/svelte';
  const nodes = $state([...]);
  const edges = $state([...]);
</script>

<SvelteFlow {nodes} {edges} />
```

**Cons:** Requires Svelte setup

---

### Option 4: Pure Canvas/WebGL (Max Performance)
**Library:** None or Pixi.js for rendering
**Pros:**
- Maximum control
- Best performance
- Can integrate with audio viz
- Brutalist aesthetic possible

**Cons:** Most work, lowest-level

---

## Recommended Approach for Your Project

### **Use D3.js + SVG (Enhance What You Have)**

You already have D3 and SVG. Here's how to make it node-based:

### 1. **Node Structure:**
```javascript
const dataNodes = [
  { id: 'cost', label: 'Cost', x: 100, y: 100, type: 'data' },
  { id: 'latitude', label: 'Latitude', x: 100, y: 200, type: 'data' }
];

const audioNodes = [
  { id: 'frequency', label: 'Frequency', x: 600, y: 100, type: 'audio' },
  { id: 'pan', label: 'Pan', x: 600, y: 200, type: 'audio' }
];

const connections = [
  { source: 'cost', target: 'frequency', curve: 'exponential' }
];
```

### 2. **Draggable Nodes:**
```javascript
svg.selectAll('.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x},${d.y})`)
    .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragging)
        .on('end', dragEnded)
    );
```

### 3. **Interactive Connections:**
```javascript
// Click data node → click audio node → creates connection
let connectionStart = null;

dataNode.on('click', function(event, d) {
    if (!connectionStart) {
        connectionStart = d;
        // Show visual feedback
    } else {
        createConnection(connectionStart, d);
        connectionStart = null;
    }
});
```

### 4. **Connection Editing:**
```javascript
// Right-click or double-click connection to edit
connection.on('click', function(event, d) {
    showConnectionEditor({
        curve: d.curve,
        min: d.min,
        max: d.max
    });
});
```

---

## Detailed Implementation Plan

### **Phase 1: Visual Nodes (Keep Forms for Now)**

1. **Draw nodes as rounded rectangles** instead of just dots
2. **Make nodes draggable** with D3 drag
3. **Show connections** with better curved paths
4. **Click nodes** to highlight their connections
5. Keep the form controls below for editing

### **Phase 2: Click-to-Connect**

1. **Click data node** → highlights it
2. **Click audio param node** → draws connection
3. **Connection appears** in the visualization
4. **Form updates** to reflect the connection

### **Phase 3: Connection Properties**

1. **Double-click connection** → show popup/modal
2. **Edit min/max/curve** for that connection
3. **Delete connection** with X button or right-click
4. Remove form controls entirely

### **Phase 4: Polish**

1. **Snap to grid** for clean layout
2. **Auto-layout** button to organize nodes
3. **Save/load patches** as JSON
4. **Color-code connections** by parameter type

---

## Code Example for D3 Interactive Nodes

```javascript
function createInteractiveNodes() {
    const svg = d3.select('#patchViz');
    const width = 1200, height = 400;
    
    // Create node groups
    const dataNodeGroup = svg.append('g').attr('class', 'data-nodes');
    const audioNodeGroup = svg.append('g').attr('class', 'audio-nodes');
    const connectionGroup = svg.append('g').attr('class', 'connections');
    
    // Data nodes (left side)
    const dataNodes = numericPaths.map((path, i) => ({
        id: `data_${path.path}`,
        label: path.path,
        x: 100,
        y: 50 + i * 60,
        type: 'data',
        path: path.path
    }));
    
    // Audio nodes (right side)
    const audioParams = ['frequency', 'pan', 'volume', 'filterFreq', ...];
    const audioNodes = audioParams.map((param, i) => ({
        id: `audio_${param}`,
        label: param,
        x: 900,
        y: 50 + i * 60,
        type: 'audio',
        param: param
    }));
    
    // Draw nodes
    const allNodes = [...dataNodes, ...audioNodes];
    
    const nodeGroups = svg.selectAll('.node')
        .data(allNodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .style('cursor', 'pointer');
    
    // Node background
    nodeGroups.append('rect')
        .attr('x', -60)
        .attr('y', -20)
        .attr('width', 120)
        .attr('height', 40)
        .attr('fill', d => d.type === 'data' ? '#f5f5f5' : '#e8e8e8')
        .attr('stroke', '#000')
        .attr('stroke-width', 2);
    
    // Node label
    nodeGroups.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 5)
        .text(d => d.label)
        .style('font-family', 'IBM Plex Mono')
        .style('font-size', '12px')
        .style('pointer-events', 'none');
    
    // Connection ports (dots on sides)
    nodeGroups.append('circle')
        .attr('cx', d => d.type === 'data' ? 60 : -60)
        .attr('cy', 0)
        .attr('r', 6)
        .attr('fill', '#000')
        .attr('class', 'port');
    
    // Click to connect
    let selectedSource = null;
    
    nodeGroups.on('click', function(event, d) {
        if (d.type === 'data' && !selectedSource) {
            // Select data node as source
            selectedSource = d;
            d3.select(this).select('rect').attr('stroke', '#00f');
        } else if (d.type === 'audio' && selectedSource) {
            // Connect to audio node
            createConnection(selectedSource, d);
            d3.select(`[data-id="${selectedSource.id}"]`).select('rect').attr('stroke', '#000');
            selectedSource = null;
            updateConnections();
        }
    });
}

function updateConnections() {
    const connectionGroup = d3.select('.connections');
    connectionGroup.selectAll('*').remove();
    
    // Draw each active connection
    Object.entries(mappings).forEach(([audioParam, mapping]) => {
        if (mapping.path) {
            const source = findNode('data', mapping.path);
            const target = findNode('audio', audioParam);
            
            if (source && target) {
                const path = connectionGroup.append('path')
                    .attr('class', 'connection')
                    .attr('d', createCurvePath(source, target))
                    .attr('stroke', '#000')
                    .attr('stroke-width', 2)
                    .attr('fill', 'none');
                
                // Click to edit
                path.on('click', () => editConnection(mapping));
            }
        }
    });
}
```

---

## Brutalist Node-Based UI Mockup

```
┌──────────────────────────────────────────────────────┐
│  JSON                    PATCH CONFIGURATION          │
└──────────────────────────────────────────────────────┘

     DATA                                    AUDIO
     
  ┏━━━━━━━━┓                            ┏━━━━━━━━━━┓
  ┃  Cost  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━●  Frequency┃
  ┗━━━━━━━━┛                            ┗━━━━━━━━━━┛
                                              ↑
  ┏━━━━━━━━━┓                          Click to edit
  ┃ latitude ●──┐                      min/max/curve
  ┗━━━━━━━━━┛  │
                │    ┏━━━━━━━━┓       ┏━━━━━━━━━┓
                └────●  Scale ●───────●   Pan   ┃
                     ┗━━━━━━━━┛       ┗━━━━━━━━━┛
                     
  ┏━━━━━━━━━━━┓                       ┏━━━━━━━━━┓
  ┃ longitude  ●━━━━━━━━━━━━━━━━━━━━━●  Volume ┃
  ┗━━━━━━━━━━━┛                       ┗━━━━━━━━━┛
  
  
  [Randomize Patch]  [Clear All]  [Auto Layout]
```

---

## Alternative: Minimal Cable-Style Interface

Inspired by modular synths (Moog, Buchla):

```
DATA OUTPUTS          AUDIO INPUTS

Cost         ●───────● Frequency
             │
latitude     ●───┐   ● Pan
                 │
longitude    ●   └───● Filter Freq
             │
District     ●───────● Volume

Click output → Click input to patch
Click cable to delete
```

---

## Libraries to Consider

### For Pure D3 Enhancement:
- **D3-drag** (already in D3) - Draggable nodes
- **D3-zoom** (already in D3) - Pan and zoom canvas
- **D3-force** - Auto-layout with physics

### For Full Node Editor:
- **Rete.js** - Pure JS node editor, no framework required
- **Litegraph.js** - Lightweight, audio-focused
- **Butterfly** - Minimal, brutalist aesthetic

### Brutalist/Minimal:
- **Custom D3 implementation** - Full control
- Black rectangles, white background
- Straight lines instead of curves
- Grid snap
- Monospace labels

---

## Recommended Next Steps

### **Option A: Enhance Current D3 (Incremental)**
1. Make nodes rectangular boxes instead of dots
2. Add drag behavior to nodes
3. Add click-to-connect between nodes
4. Keep forms below as "inspector" for selected connection
5. Takes 2-3 hours to implement

### **Option B: Use Rete.js (Fast & Professional)**
1. Install Rete.js (CDN or npm)
2. Define node types (data source, audio param, modifier)
3. Implement connection logic
4. Custom styling for brutalist look
5. Takes 3-4 hours to implement fully

### **Option C: Build Custom Canvas-Based (Most Control)**
1. Use Canvas instead of SVG for performance
2. Custom node rendering (rectangles, text)
3. Custom connection drawing
4. Manual drag/drop logic
5. Takes 5-7 hours to implement

---

## Quick Win: Enhance Your Current D3 Viz

I can make your current visualization interactive right now:

1. **Make nodes bigger boxes** (not tiny dots)
2. **Add click-to-connect** between left and right nodes
3. **Edit connection on click** - shows min/max/curve modal
4. **Hide form controls** - use node interface only
5. **Auto-layout button** - organizes nodes cleanly

This would give you 70% of a node-based interface using what you already have!

---

## Code Snippet: Quick D3 Enhancement

```javascript
// Make nodes draggable rectangles
const nodeWidth = 100, nodeHeight = 40;

const node = svg.selectAll('.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .call(d3.drag()
        .on('start', (e, d) => { d.fx = d.x; d.fy = d.y; })
        .on('drag', (e, d) => { 
            d.fx = e.x; 
            d.fy = e.y;
            updateNodePosition(d);
            updateConnections();
        })
        .on('end', (e, d) => { d.fx = null; d.fy = null; })
    );

// Draw node as rectangle
node.append('rect')
    .attr('x', -nodeWidth/2)
    .attr('y', -nodeHeight/2)
    .attr('width', nodeWidth)
    .attr('height', nodeHeight)
    .attr('fill', '#f5f5f5')
    .attr('stroke', '#000')
    .attr('stroke-width', 2);

// Node label
node.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', 5)
    .text(d => d.label);
```

---

## My Recommendation

**Start with D3 Enhancement** because:
1. ✅ You already have D3 loaded
2. ✅ No framework overhead
3. ✅ Fits brutalist aesthetic
4. ✅ Incremental - can build piece by piece
5. ✅ Full control over visuals

**Want me to implement it?** I can:
- Convert your current viz to draggable rectangular nodes
- Add click-to-connect functionality
- Create a connection editor modal
- Make it fully interactive

This would replace the form-based controls with a true node-based patching system!


