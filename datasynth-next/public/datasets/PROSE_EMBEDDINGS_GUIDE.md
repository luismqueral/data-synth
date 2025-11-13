# Prose Embeddings for Sonification

> **🚀 Quick Start:** Want to try it right now? Open [prose-embeddings-example.html](prose-embeddings-example.html) in your browser for a working demo with example texts!

## 🧠 What Are Embeddings?

Embeddings convert text into **high-dimensional numerical vectors** that capture semantic meaning. Instead of counting words or analyzing grammar, embeddings encode *what the text means* - allowing you to sonify the narrative arc, emotional journey, and conceptual shifts in prose.

**The Magic:**
```
"The ocean is vast and blue"  
↓ (embedding)  
[0.234, -0.891, 0.456, 0.123, -0.234, 0.678, ...] (384 numbers)

"The sea is enormous and azure"  
↓ (embedding)  
[0.241, -0.885, 0.461, 0.119, -0.229, 0.682, ...] (Very similar!)

"The stock market crashed today"  
↓ (embedding)  
[-0.567, 0.234, -0.891, 0.445, 0.123, -0.456, ...] (Totally different!)
```

Similar meanings → Similar embeddings → Similar sounds  
Different meanings → Different embeddings → Different sounds

---

## 🎵 Why Embeddings Are Perfect for Sonification

### **1. Semantic Distance = Sonic Distance**
- Sentences about the same topic produce coherent soundscapes
- Shifts in narrative theme create dramatic sonic transitions
- Creates musical "scenes" that mirror conceptual scenes

### **2. Multi-Dimensional Richness**
- 384+ dimensions per sentence (reducible to 8-20 for synth parameters)
- Each dimension can map to a different sound characteristic
- Captures nuance that word counts miss

### **3. Continuous, Smooth Values**
- No jarring jumps between sentences
- Natural transitions mirror narrative flow
- Perfect for melodic/harmonic progression

### **4. Context-Aware**
- "Bank" (river) vs "bank" (money) get different embeddings
- Understands metaphor, irony, emotion
- Same word in different contexts = different sounds

### **5. Similarity Detection**
- Easily measure "distance" between sentences
- Track thematic development through a text
- Identify callbacks, motifs, repetition

---

## 🛠️ Client-Side Implementation (Transformers.js)

### **Why Client-Side?**
✅ **No API keys required** - completely free  
✅ **Privacy** - text never leaves the browser  
✅ **Fast** - after initial model load (~30MB)  
✅ **Offline capable** - works without internet after first load  
✅ **No rate limits** - process unlimited text  

### **The Stack**

**Primary Library:** [Transformers.js](https://huggingface.co/docs/transformers.js)
- Browser-compatible version of Hugging Face Transformers
- Runs models using ONNX Runtime (optimized for web)
- Supports dozens of models

**Recommended Model:** `Xenova/all-MiniLM-L6-v2`
- 384 dimensions per sentence
- 22M parameters
- Excellent quality/speed balance
- Most popular sentence embedding model

**Dimensionality Reduction:** UMAP.js
- Reduces 384 dimensions → 8-20 dimensions
- Preserves semantic relationships
- Creates mappable synth parameters

---

## 📦 Installation

### **Option 1: ES Module (Recommended)**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Prose Sonification</title>
</head>
<body>
    <script type="module">
        // Import Transformers.js
        import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';
        
        // Import UMAP for dimensionality reduction
        import { UMAP } from 'https://cdn.jsdelivr.net/npm/umap-js@1.4.0/+esm';
        
        // Your code here...
    </script>
</body>
</html>
```

### **Option 2: NPM (If using build system)**

```bash
npm install @xenova/transformers umap-js
```

```javascript
import { pipeline } from '@xenova/transformers';
import { UMAP } from 'umap-js';
```

---

## 🚀 Complete Implementation

### **Step 1: Initialize Embedding Model**

```javascript
class ProseToSound {
    constructor() {
        this.embedder = null;
        this.isReady = false;
    }
    
    async initialize() {
        console.log('Loading embedding model...');
        const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1');
        
        // Load sentence embedding model
        this.embedder = await pipeline(
            'feature-extraction',
            'Xenova/all-MiniLM-L6-v2'
        );
        
        this.isReady = true;
        console.log('Model ready! (~30MB downloaded on first load)');
    }
}
```

### **Step 2: Process Text to Embeddings**

```javascript
// Split text into sentences
splitIntoSentences(text) {
    // Handle multiple punctuation marks
    return text
        .match(/[^.!?]+[.!?]+/g)
        ?.map(s => s.trim())
        .filter(s => s.length > 0) || [text];
}

// Get embedding for each sentence
async getEmbeddings(text) {
    const sentences = this.splitIntoSentences(text);
    const embeddings = [];
    
    console.log(`Processing ${sentences.length} sentences...`);
    
    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        
        // Generate embedding
        const output = await this.embedder(sentence, {
            pooling: 'mean',      // Average token embeddings
            normalize: true        // Normalize to unit vector
        });
        
        // Convert to regular array
        const embedding = Array.from(output.data);
        embeddings.push(embedding);
        
        // Progress feedback
        if ((i + 1) % 10 === 0) {
            console.log(`  Processed ${i + 1}/${sentences.length}`);
        }
    }
    
    return { sentences, embeddings };
}
```

### **Step 3: Reduce Dimensions**

```javascript
reduceDimensions(embeddings, targetDims = 8) {
    console.log(`Reducing ${embeddings[0].length} dimensions → ${targetDims}...`);
    
    const { UMAP } = window; // If loaded via CDN
    
    const umap = new UMAP({
        nComponents: targetDims,
        nNeighbors: Math.min(15, embeddings.length - 1),
        minDist: 0.1,
        spread: 1.0,
        random: Math.random // For reproducibility, use seeded random
    });
    
    const reduced = umap.fit(embeddings);
    console.log('Dimensionality reduction complete!');
    
    return reduced;
}
```

### **Step 4: Map to Synth Parameters**

```javascript
embeddingsToSynthData(reducedEmbeddings, sentences) {
    return reducedEmbeddings.map((dims, i) => {
        // Normalize from embedding space (roughly -3 to +3) to parameter ranges
        return {
            index: i,
            sentence: sentences[i],
            
            // PITCH/FREQUENCY
            // Map first dimension to base frequency
            frequency: this.normalize(dims[0], -3, 3, 200, 2000), // Hz
            
            // TIMBRE/FILTER
            // Map second dimension to filter cutoff
            filter_cutoff: this.normalize(dims[1], -3, 3, 500, 8000), // Hz
            filter_resonance: this.normalize(dims[2], -3, 3, 0, 15), // Q
            
            // SPACE/REVERB
            // Map third dimension to reverb characteristics
            reverb_mix: this.normalize(dims[3], -3, 3, 0, 0.7), // 0-1
            reverb_decay: this.normalize(dims[4], -3, 3, 0.5, 4), // seconds
            
            // STEREO/POSITION
            // Map to stereo field
            pan: this.normalize(dims[5], -3, 3, -0.9, 0.9), // -1 to 1
            
            // ENVELOPE
            // Map to ADSR characteristics
            attack: this.normalize(dims[6], -3, 3, 0.005, 0.3), // seconds
            release: this.normalize(dims[7], -3, 3, 0.1, 2.0), // seconds
            
            // Optional: keep raw values for visualization
            raw_dimensions: dims
        };
    });
}

// Utility: normalize value from one range to another
normalize(value, inMin, inMax, outMin, outMax) {
    // Clamp input
    value = Math.max(inMin, Math.min(inMax, value));
    
    // Normalize to 0-1
    const normalized = (value - inMin) / (inMax - inMin);
    
    // Scale to output range
    return normalized * (outMax - outMin) + outMin;
}
```

### **Step 5: Complete Pipeline**

```javascript
async convertProseToSynthData(text, options = {}) {
    if (!this.isReady) {
        throw new Error('Model not initialized. Call initialize() first.');
    }
    
    const {
        targetDimensions = 8,
        includeMetadata = true
    } = options;
    
    // Step 1: Get embeddings
    console.log('Step 1/3: Generating embeddings...');
    const { sentences, embeddings } = await this.getEmbeddings(text);
    
    // Step 2: Reduce dimensions
    console.log('Step 2/3: Reducing dimensions...');
    const reduced = this.reduceDimensions(embeddings, targetDimensions);
    
    // Step 3: Map to synth parameters
    console.log('Step 3/3: Mapping to synth parameters...');
    const synthData = this.embeddingsToSynthData(reduced, sentences);
    
    // Optional: Add metadata
    if (includeMetadata) {
        return {
            metadata: {
                source: 'prose-embeddings',
                model: 'all-MiniLM-L6-v2',
                sentence_count: sentences.length,
                original_dimensions: embeddings[0].length,
                reduced_dimensions: targetDimensions,
                timestamp: new Date().toISOString()
            },
            data: synthData
        };
    }
    
    return synthData;
}
```

---

## 💻 Complete Usage Example

```javascript
// FULL EXAMPLE
(async () => {
    // Initialize
    const converter = new ProseToSound();
    await converter.initialize();
    
    // Your prose
    const mobyDick = `
        Call me Ishmael. Some years ago—never mind how long precisely—having 
        little or no money in my purse, and nothing particular to interest me 
        on shore, I thought I would sail about a little and see the watery 
        part of the world. It is a way I have of driving off the spleen and 
        regulating the circulation.
    `;
    
    // Convert to synth data
    const result = await converter.convertProseToSynthData(mobyDick);
    
    // Output JSON
    console.log(JSON.stringify(result, null, 2));
    
    // Use with your synth
    loadIntoSynth(result.data);
})();
```

**Output:**
```json
{
  "metadata": {
    "source": "prose-embeddings",
    "model": "all-MiniLM-L6-v2",
    "sentence_count": 3,
    "original_dimensions": 384,
    "reduced_dimensions": 8,
    "timestamp": "2025-11-12T10:30:00.000Z"
  },
  "data": [
    {
      "index": 0,
      "sentence": "Call me Ishmael.",
      "frequency": 523.25,
      "filter_cutoff": 3200,
      "filter_resonance": 4.5,
      "reverb_mix": 0.3,
      "reverb_decay": 1.8,
      "pan": -0.2,
      "attack": 0.05,
      "release": 0.8
    },
    {
      "index": 1,
      "sentence": "Some years ago—never mind how long precisely...",
      "frequency": 698.46,
      "filter_cutoff": 5200,
      "filter_resonance": 8.2,
      "reverb_mix": 0.5,
      "reverb_decay": 2.4,
      "pan": 0.4,
      "attack": 0.12,
      "release": 1.2
    }
  ]
}
```

---

## 📊 Advanced: Semantic Analysis

### **Calculate Semantic Distance**

Track how much meaning changes between sentences:

```javascript
// Cosine similarity (0 = opposite, 1 = identical)
cosineSimilarity(embedding1, embedding2) {
    const dotProduct = embedding1.reduce((sum, val, i) => 
        sum + val * embedding2[i], 0);
    return dotProduct; // Already normalized if embeddings are unit vectors
}

// Semantic distance (0 = identical, 2 = opposite)
semanticDistance(embedding1, embedding2) {
    return 1 - this.cosineSimilarity(embedding1, embedding2);
}

// Analyze narrative flow
analyzeNarrativeFlow(embeddings) {
    const flow = [];
    
    for (let i = 1; i < embeddings.length; i++) {
        const distance = this.semanticDistance(embeddings[i-1], embeddings[i]);
        
        flow.push({
            from_index: i - 1,
            to_index: i,
            semantic_change: distance,
            change_type: this.classifyChange(distance)
        });
    }
    
    return flow;
}

classifyChange(distance) {
    if (distance < 0.1) return 'continuation';      // Same topic
    if (distance < 0.3) return 'development';       // Related topic
    if (distance < 0.5) return 'shift';             // Topic change
    return 'dramatic_shift';                        // Completely different
}
```

**Sonification Use:**
- `continuation` → Smooth transitions, maintain key
- `development` → Gradual modulation
- `shift` → Key change, filter sweep
- `dramatic_shift` → Percussive hit, dramatic pause

### **Find Thematic Clusters**

Group sentences by similarity:

```javascript
// Simple clustering
findThematicClusters(embeddings, sentences, threshold = 0.3) {
    const clusters = [];
    const visited = new Set();
    
    for (let i = 0; i < embeddings.length; i++) {
        if (visited.has(i)) continue;
        
        const cluster = {
            representative: sentences[i],
            members: [i],
            sentences: [sentences[i]]
        };
        
        // Find similar sentences
        for (let j = i + 1; j < embeddings.length; j++) {
            if (visited.has(j)) continue;
            
            const similarity = this.cosineSimilarity(embeddings[i], embeddings[j]);
            
            if (similarity > (1 - threshold)) {
                cluster.members.push(j);
                cluster.sentences.push(sentences[j]);
                visited.add(j);
            }
        }
        
        visited.add(i);
        clusters.push(cluster);
    }
    
    return clusters;
}
```

**Sonification Use:**
- Each cluster → Different instrument/timbre
- Cluster size → Volume/prominence
- Return to cluster → Callback to previous motif

---

## 🎨 Creative Sonification Strategies

### **Strategy 1: Narrative Arc**

Map the "journey" through semantic space:

```javascript
// Calculate cumulative semantic distance
const narrativeArc = embeddings.map((emb, i) => {
    if (i === 0) return 0;
    
    const distance = this.semanticDistance(embeddings[0], emb);
    return distance;
});

// Map to tension curve
synthData.forEach((item, i) => {
    item.tension = narrativeArc[i];
    item.dissonance = narrativeArc[i] * 12; // Semitones of dissonance
});
```

### **Strategy 2: Emotional Valence**

Use specific dimensions for emotion (discovered empirically):

```javascript
// Dimensions often correlate with:
// - Positive/negative sentiment
// - Abstract/concrete concepts
// - Action/description

const emotionalMapping = reducedEmbeddings.map(dims => ({
    valence: dims[0],        // Often correlates with pos/neg
    arousal: dims[1],        // Often correlates with energy
    dominance: dims[2],      // Often correlates with power
    
    // Map to sound
    major_minor: dims[0] > 0 ? 'major' : 'minor',
    tempo_multiplier: 0.5 + dims[1] * 0.5,
    volume: -20 + dims[2] * 15
}));
```

### **Strategy 3: Motif Detection**

Find recurring themes by similarity:

```javascript
// Find sentences similar to opening
const openingEmbedding = embeddings[0];
const callbacks = embeddings.map((emb, i) => ({
    index: i,
    similarity: this.cosineSimilarity(openingEmbedding, emb)
})).filter(item => item.similarity > 0.7 && item.index > 0);

// Sonify callbacks with similar timbre to opening
callbacks.forEach(callback => {
    synthData[callback.index].timbre = 'opening_theme';
    synthData[callback.index].callback_strength = callback.similarity;
});
```

---

## 📚 Example Literary Datasets

### **Short Texts (Perfect for Testing)**

#### **Hemingway - "For Sale: Baby Shoes"**
```
For sale: baby shoes, never worn.
```
- 1 sentence
- Maximum emotional impact in minimal words
- Perfect for testing single-sentence embedding

#### **Poe - Opening of "The Raven"**
```
Once upon a midnight dreary, while I pondered, weak and weary,
Over many a quaint and curious volume of forgotten lore—
While I nodded, nearly napping, suddenly there came a tapping,
As of some one gently rapping, rapping at my chamber door.
```
- 4 sentences
- Rich phonetic patterns
- Builds suspense

#### **Dickinson - "Hope"**
```
Hope is the thing with feathers
That perches in the soul,
And sings the tune without the words,
And never stops at all.
```
- 4 lines/phrases
- Metaphorical language
- Gentle progression

### **Medium Texts (Great for Exploration)**

#### **"I Have a Dream" - Martin Luther King Jr.**
- ~1800 words, ~100 sentences
- Clear rhetorical structure
- Repetition and callbacks ("I have a dream...")
- Builds to emotional climax

#### **"Gettysburg Address" - Abraham Lincoln**
- 272 words, 10 sentences
- Balanced structure
- Historical gravitas

### **Long Texts (Epic Narratives)**

#### **"Call me Ishmael" - Moby Dick Opening**
- First chapter (~3000 words)
- Introduces narrator
- Sets tone for epic journey

#### **Shakespeare Soliloquies**
- "To be or not to be" (Hamlet)
- "All the world's a stage" (As You Like It)
- Philosophical depth
- Dramatic tension

---

## 🔬 Performance & Optimization

### **Model Loading**

**First load:** ~30MB download (30-60 seconds on average connection)  
**Subsequent loads:** Instant (cached in browser)  
**Cache location:** Browser's Cache API / IndexedDB

```javascript
// Show loading progress
this.embedder = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
    {
        progress_callback: (progress) => {
            if (progress.status === 'downloading') {
                console.log(`Downloading: ${progress.progress}%`);
            }
        }
    }
);
```

### **Processing Speed**

**Embedding generation:**
- ~50-100ms per sentence (CPU)
- ~10-20ms per sentence (GPU/WebGPU if available)

**Dimensionality reduction (UMAP):**
- ~100-500ms for 10-100 sentences
- Scales roughly O(n log n)

**Total:**
- 10 sentences: ~2-3 seconds
- 100 sentences: ~10-15 seconds
- 1000 sentences: ~2-3 minutes

### **Optimization Tips**

```javascript
// 1. Batch processing for long texts
async processBatch(sentences, batchSize = 10) {
    const embeddings = [];
    
    for (let i = 0; i < sentences.length; i += batchSize) {
        const batch = sentences.slice(i, i + batchSize);
        const batchEmbeddings = await Promise.all(
            batch.map(s => this.embedder(s, { pooling: 'mean', normalize: true }))
        );
        embeddings.push(...batchEmbeddings.map(e => Array.from(e.data)));
        
        // Progress update
        console.log(`Processed ${Math.min(i + batchSize, sentences.length)}/${sentences.length}`);
    }
    
    return embeddings;
}

// 2. Cache embeddings for repeated use
const embeddingCache = new Map();

async getEmbeddingCached(sentence) {
    if (embeddingCache.has(sentence)) {
        return embeddingCache.get(sentence);
    }
    
    const output = await this.embedder(sentence, { 
        pooling: 'mean', 
        normalize: true 
    });
    const embedding = Array.from(output.data);
    
    embeddingCache.set(sentence, embedding);
    return embedding;
}

// 3. Reduce dimensions early if processing many texts
// (Skip full 384-dim storage)
```

---

## 🎯 Integration with Existing Synth

### **JSON Output Format**

Your synth expects this structure:

```javascript
// Convert to your synth's expected format
function formatForSynth(synthData) {
    return synthData.map(item => ({
        // Required fields
        index: item.index,
        
        // Map reduced dimensions to your synth's parameters
        // Adjust these based on your actual parameter names
        frequency: item.frequency,
        filter: item.filter_cutoff,
        resonance: item.filter_resonance,
        reverb: item.reverb_mix,
        pan: item.pan,
        attack: item.attack,
        release: item.release,
        
        // Optional: include sentence for display
        _meta: {
            sentence: item.sentence
        }
    }));
}
```

### **Loading Into Synth**

```javascript
// After generating embeddings
const synthData = await converter.convertProseToSynthData(proseText);

// Format for your synth
const formatted = formatForSynth(synthData.data);

// Load into your existing data structure
// (Assuming your synth has a loadData function)
yourSynth.loadData(formatted);

// Or trigger playback directly
yourSynth.play(formatted);
```

---

## 🐛 Troubleshooting

### **"Model failed to load"**
- Check internet connection (first load only)
- Clear browser cache and reload
- Try a different browser (Chrome/Edge recommended)

### **"Out of memory"**
- Process text in smaller chunks
- Reduce target dimensions (8 → 6 or 4)
- Avoid processing very long texts (>1000 sentences) at once

### **"Embeddings too similar"**
- Text might be too repetitive
- Try longer, more varied passages
- Increase UMAP `minDist` parameter for more spread

### **"Processing too slow"**
- Expected on first load (model download)
- Use batching for long texts
- Consider using Web Workers for background processing

---

## 🚀 Next Steps

### **Enhance Mapping**
- Experiment with different dimension assignments
- Add non-linear scaling (logarithmic, exponential)
- Layer multiple dimensions onto single parameters

### **Advanced Features**
- **Real-time processing:** Analyze text as user types
- **Comparison mode:** Compare two texts sonically
- **Interactive exploration:** Click sentences to hear them
- **Visualization:** Plot embeddings in 2D/3D space

### **Alternative Models**
- `Xenova/all-mpnet-base-v2` (768 dimensions, higher quality)
- `Xenova/paraphrase-MiniLM-L6-v2` (optimized for similarity)
- Multilingual models for non-English text

---

## 📖 Further Reading

- [Transformers.js Documentation](https://huggingface.co/docs/transformers.js)
- [SBERT Paper](https://arxiv.org/abs/1908.10084) - Sentence-BERT methodology
- [UMAP Paper](https://arxiv.org/abs/1802.03426) - Dimensionality reduction
- [Sonification Handbook](https://sonification.de/handbook/)

---

## 💡 Example Use Cases

### **Literary Analysis Through Sound**
- Compare writing styles of different authors
- Track character development through semantic distance
- Identify narrative structure (exposition, climax, resolution)

### **Accessibility**
- Audio representation of text structure
- Pattern detection through sound
- Alternative reading experience

### **Creative Writing**
- Compositional tool for writers
- Hear the "rhythm" of your prose
- Identify repetitive passages

### **Education**
- Teaching literary concepts through sound
- Analyzing rhetorical devices
- Comparing translations of same text

---

**Happy Sonifying! 🎵📚✨**

Embeddings open up a whole new world of text sonification. The semantic understanding they provide creates more meaningful, coherent sonic experiences than traditional metrics. Start with short texts, experiment with different dimension mappings, and discover the sound of meaning itself.

