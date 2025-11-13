/**
 * MODULE: Data Processor
 * 
 * Purpose: Parse JSON/CSV data and extract numeric paths for sonification
 * 
 * Key Exports:
 * - getValueByPath() - Navigate nested objects using dot notation
 * - safeId() - Convert paths to CSS-safe identifiers
 * - extractPaths() - Find all field paths in nested data structures
 * - extractValues() - Extract values from array using path
 * - analyzeDataVariance() - Suggest optimal mapping curves based on data distribution
 * 
 * Dependencies:
 * - None (pure functions - no side effects, no external state)
 * 
 * Used By:
 * - main.js (when user loads a dataset)
 * - parameter-mapper.js (for value extraction during playback)
 * - json-mapper-v2.html (during migration)
 * 
 * Browser APIs Used:
 * - None (pure JavaScript)
 */

/**
 * Get value from nested object using dot notation
 * Pure function - no side effects, same input = same output
 * 
 * This is used throughout DataSynth to access nested data fields.
 * Example: earthquake data has fields like "properties.mag" and "geometry.coordinates[0]"
 * 
 * @param {Object} obj - The object to traverse
 * @param {string} path - Dot-notation path (e.g., "properties.mag", "user.name")
 * @returns {*} The value at the path, or undefined if not found
 * 
 * Examples:
 *   getValueByPath({properties: {mag: 4.5}}, 'properties.mag') → 4.5
 *   getValueByPath({user: {name: "Luis"}}, 'user.name') → "Luis"
 *   getValueByPath({user: {name: "Luis"}}, 'user.age') → undefined
 *   getValueByPath(null, 'any.path') → undefined
 */
export function getValueByPath(obj, path) {
    if (!obj || !path) return undefined;
    
    try {
        // Split path by dots and traverse object
        // Example: "properties.mag" → ["properties", "mag"]
        // Then: obj["properties"]["mag"]
        return path.split('.').reduce((curr, key) => {
            if (curr === null || curr === undefined) return undefined;
            return curr[key];
        }, obj);
    } catch (e) {
        console.warn(`Error accessing path ${path}:`, e);
        return undefined;
    }
}

/**
 * Convert path to CSS-safe ID
 * 
 * CSS selectors can't have dots, so we replace them with underscores.
 * This is used for DOM element IDs in the D3 visualization.
 * 
 * @param {string} path - Dot-notation path
 * @returns {string} CSS-safe identifier
 * 
 * Examples:
 *   safeId('properties.mag') → 'properties_mag'
 *   safeId('geometry.coordinates') → 'geometry_coordinates'
 *   safeId('user-name') → 'user_name' (also replaces special chars)
 */
export function safeId(path) {
    return path.replace(/\./g, '_').replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Extract all paths from nested data structure
 * 
 * This recursively walks through objects and arrays to discover all field paths.
 * For arrays, it samples multiple items to verify field coverage (how consistently
 * a field appears across all items).
 * 
 * Why coverage matters:
 * If "temperature" only exists in 1 out of 100 items, it's probably not useful
 * for sonification. We filter out sparse fields (<10% coverage) to avoid null issues.
 * 
 * @param {Object|Array} obj - The data to analyze
 * @param {string} prefix - Current path prefix (used during recursion, usually empty to start)
 * @param {number} depth - Current recursion depth (prevents infinite loops, usually 0 to start)
 * @returns {Array<Object>} Array of path objects with metadata
 * 
 * Return format:
 * [
 *   {
 *     path: "properties.mag",      // Dot-notation path
 *     type: "number",               // Data type (number, string, boolean, object)
 *     isArray: true,                // Found in array context
 *     coverage: 0.95,               // 95% of items have this field
 *     sample: 4.5                   // Example value
 *   },
 *   ...
 * ]
 * 
 * Example:
 * const data = [
 *   { properties: { mag: 4.5, depth: 10 } },
 *   { properties: { mag: 3.2, depth: 15 } },
 *   { properties: { mag: 5.1 } }  // Note: no depth
 * ];
 * const paths = extractPaths(data);
 * // Returns:
 * // - properties.mag (coverage: 1.0, all items have it)
 * // - properties.depth (coverage: 0.67, only 2/3 items have it)
 */
export function extractPaths(obj, prefix = '', depth = 0) {
    const paths = [];
    const maxDepth = 5; // Prevent infinite recursion in circular structures
    
    if (depth > maxDepth) {
        return paths;
    }
    
    if (Array.isArray(obj)) {
        if (obj.length > 0) {
            // Sample first item to discover structure
            const sample = obj[0];
            if (typeof sample === 'object' && sample !== null) {
                const subPaths = extractPaths(sample, prefix, depth + 1);
                
                // Verify each path exists in multiple items (coverage check)
                // This prevents mapping to fields that only exist in a few items
                const verifiedPaths = subPaths.map(pathObj => {
                    // Count how many items have this path with a non-null value
                    let count = 0;
                    const sampleSize = Math.min(20, obj.length); // Sample up to 20 items
                    for (let i = 0; i < sampleSize; i++) {
                        const val = getValueByPath(obj[i], pathObj.path);
                        if (val !== undefined && val !== null) {
                            count++;
                        }
                    }
                    
                    return {
                        ...pathObj,
                        coverage: count / sampleSize // 0.0 to 1.0
                    };
                });
                
                // Log filtered paths for debugging
                const filtered = verifiedPaths.filter(p => p.coverage < 0.1);
                if (filtered.length > 0) {
                    console.log('Filtered out sparse paths (<10% coverage):', 
                        filtered.map(p => `${p.path} (${(p.coverage * 100).toFixed(0)}%)`));
                }
                
                // Only include paths that exist in at least 10% of sampled items
                paths.push(...verifiedPaths.filter(p => p.coverage >= 0.1));
            } else {
                // Array of primitives (numbers, strings, etc.)
                paths.push({
                    path: prefix || 'root',
                    type: typeof sample,
                    isArray: true,
                    sample: obj.slice(0, 3), // Show first 3 items as sample
                    coverage: 1.0
                });
            }
        }
    } else if (typeof obj === 'object' && obj !== null) {
        // Regular object - traverse all keys
        for (const key in obj) {
            const fullPath = prefix ? `${prefix}.${key}` : key;
            const value = obj[key];
            
            if (Array.isArray(value)) {
                // Nested array - recurse
                paths.push(...extractPaths(value, fullPath, depth + 1));
            } else if (typeof value === 'object' && value !== null) {
                // Nested object - recurse
                paths.push(...extractPaths(value, fullPath, depth + 1));
            } else {
                // Leaf value (number, string, boolean, etc.)
                paths.push({
                    path: fullPath,
                    type: typeof value,
                    isArray: false,
                    sample: value,
                    coverage: 1.0 // Single object, field always exists
                });
            }
        }
    }
    
    return paths;
}

/**
 * Extract values from array of objects using path
 * 
 * This is a convenience function to get all values for a specific field
 * across an array of items. Used for analyzing data ranges before mapping.
 * 
 * @param {Array|Object} data - Array of objects or single object
 * @param {string} path - Dot-notation path to extract
 * @returns {Array} Array of values (undefined values filtered out)
 * 
 * Example:
 * const data = [
 *   { properties: { mag: 4.5 } },
 *   { properties: { mag: 3.2 } },
 *   { properties: { mag: 5.1 } }
 * ];
 * extractValues(data, 'properties.mag') → [4.5, 3.2, 5.1]
 */
export function extractValues(data, path) {
    if (Array.isArray(data)) {
        return data.map(item => getValueByPath(item, path)).filter(v => v !== undefined);
    }
    return [getValueByPath(data, path)].filter(v => v !== undefined);
}

/**
 * Analyze data variance to suggest optimal mapping curve
 * 
 * Different data distributions benefit from different scaling curves:
 * - Linear: evenly distributed data (0-100)
 * - Logarithmic: data spanning orders of magnitude (0.01-1000)
 * - Exponential: emphasize larger values, compress small ones
 * - Cubic: for very subtle variations (99.1, 99.2, 99.3)
 * 
 * This function calculates the coefficient of variation (CV) to determine
 * how spread out the data is relative to its mean.
 * 
 * CV = (max - min) / |mean|
 * 
 * @param {Array} values - Array of numeric values
 * @returns {Object} Analysis result with recommended curve and coefficient
 * 
 * Return format:
 * {
 *   curve: 'linear' | 'exponential' | 'cubic' | 'logarithmic',
 *   coefficient: number (the coefficient of variation)
 * }
 * 
 * Example:
 * analyzeDataVariance([1, 2, 3, 4, 5]) → { curve: 'linear', coefficient: 0.8 }
 * analyzeDataVariance([0.01, 0.1, 1, 10, 100]) → { curve: 'logarithmic', coefficient: 19.8 }
 * analyzeDataVariance([99.1, 99.2, 99.3]) → { curve: 'cubic', coefficient: 0.002 }
 */
export function analyzeDataVariance(values) {
    if (!values || values.length === 0) return { curve: 'linear', coefficient: 0 };
    
    // Convert to numbers and filter out NaN
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (numericValues.length === 0) return { curve: 'linear', coefficient: 0 };
    
    // Calculate basic statistics
    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    const range = max - min;
    const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
    
    // Coefficient of variation (normalized variance)
    // High CV = data varies a lot relative to mean
    // Low CV = data is tightly clustered
    const coefficientOfVariation = Math.abs(mean) > 0 ? range / Math.abs(mean) : 0;
    
    let recommendedCurve = 'linear'; // Default for most data
    
    // Very low variance (e.g., latitude 39.28-39.29)
    // Use cubic curve to amplify tiny differences
    if (coefficientOfVariation < 0.01) {
        recommendedCurve = 'cubic';
    } 
    // Low variance (e.g., temperature 20-25°C)
    // Use exponential to make differences more audible
    else if (coefficientOfVariation < 0.1) {
        recommendedCurve = 'exponential';
    }
    // Very high variance (e.g., distances 0.01-1000 km)
    // Use logarithmic to compress extremes
    else if (coefficientOfVariation > 5) {
        recommendedCurve = 'logarithmic';
    }
    
    return { curve: recommendedCurve, coefficient: coefficientOfVariation };
}

