/**
 * DataEngine - Framework-Agnostic Data Processing
 * 
 * Handles data extraction, path analysis, and value retrieval.
 * This class has NO framework dependencies.
 */

import { DataPath } from '@/types/plugin';
import { Mapping, CurveType, DataRange } from '@/types/audio';

export class DataEngine {
    private data: any[] | null = null;
    private detectedPaths: DataPath[] = [];
    private numericPaths: DataPath[] = [];
    
    /**
     * Load and process data
     */
    loadData(rawData: any): void {
        // Handle different data structures
        let processedData = rawData;
        
        if (!Array.isArray(rawData) && typeof rawData === 'object') {
            // Look for array properties
            const arrayProps = Object.keys(rawData).filter(key => Array.isArray(rawData[key]));
            
            if (arrayProps.length > 0) {
                // Use first array found (common in GeoJSON)
                processedData = rawData[arrayProps[0]];
                console.log(`Found nested array at '${arrayProps[0]}' with ${processedData.length} items`);
            } else {
                // Single object - wrap in array
                processedData = [rawData];
            }
        }
        
        this.data = Array.isArray(processedData) ? processedData : [processedData];
        
        // Extract paths
        this.detectedPaths = this.extractPaths(this.data);
        this.numericPaths = this.detectedPaths.filter(p => p.type === 'number');
        
        console.log(`Data loaded: ${this.data.length} items, ${this.numericPaths.length} numeric paths`);
    }
    
    /**
     * Get current data
     */
    getData(): any[] {
        return this.data || [];
    }
    
    /**
     * Get numeric paths
     */
    getNumericPaths(): DataPath[] {
        return this.numericPaths;
    }
    
    /**
     * Get all detected paths
     */
    getAllPaths(): DataPath[] {
        return this.detectedPaths;
    }
    
    /**
     * Extract all paths from data structure
     */
    private extractPaths(data: any, prefix: string = '', depth: number = 0): DataPath[] {
        const paths: DataPath[] = [];
        const maxDepth = 5;
        
        if (depth > maxDepth) return paths;
        
        if (Array.isArray(data)) {
            if (data.length > 0) {
                const sample = data[0];
                if (typeof sample === 'object' && sample !== null) {
                    const subPaths = this.extractPaths(sample, prefix, depth + 1);
                    
                    // Verify paths exist across multiple items
                    const verifiedPaths = subPaths.map(pathObj => {
                        let count = 0;
                        const sampleSize = Math.min(20, data.length);
                        
                        for (let i = 0; i < sampleSize; i++) {
                            const val = this.getValueByPath(data[i], pathObj.path);
                            if (val !== undefined && val !== null) {
                                count++;
                            }
                        }
                        
                        return {
                            ...pathObj,
                            coverage: count / sampleSize
                        };
                    });
                    
                    // Only include paths with ≥10% coverage
                    paths.push(...verifiedPaths.filter(p => (p.coverage || 0) >= 0.1));
                }
            }
        } else if (typeof data === 'object' && data !== null) {
            for (const key in data) {
                const fullPath = prefix ? `${prefix}.${key}` : key;
                const value = data[key];
                
                if (Array.isArray(value)) {
                    paths.push(...this.extractPaths(value, fullPath, depth + 1));
                } else if (typeof value === 'object' && value !== null) {
                    paths.push(...this.extractPaths(value, fullPath, depth + 1));
                } else {
                    paths.push({
                        path: fullPath,
                        type: typeof value as 'number' | 'string',
                        coverage: 1.0
                    });
                }
            }
        }
        
        return paths;
    }
    
    /**
     * Get value by path (dot notation)
     */
    getValueByPath(obj: any, path: string): any {
        if (!obj || !path) return undefined;
        
        try {
            return path.split('.').reduce((curr, key) => {
                if (curr === null || curr === undefined) return undefined;
                return curr[key];
            }, obj);
        } catch (e) {
            return undefined;
        }
    }
    
    /**
     * Extract values from array for a given path
     */
    extractValues(path: string): any[] {
        if (!this.data) return [];
        
        return this.data
            .map(item => this.getValueByPath(item, path))
            .filter(v => v !== undefined);
    }
    
    /**
     * Calculate data ranges for all mapped parameters
     */
    calculateDataRanges(mappings: Record<string, Mapping>): Record<string, DataRange> {
        const ranges: Record<string, DataRange> = {};
        
        if (!this.data) return ranges;
        
        Object.entries(mappings).forEach(([param, mapping]) => {
            if (mapping && mapping.path) {
                const values = this.data!
                    .map(item => this.getValueByPath(item, mapping.path))
                    .filter(v => v !== undefined && !isNaN(parseFloat(v)))
                    .map(v => parseFloat(v));
                
                if (values.length > 0) {
                    ranges[param] = {
                        min: Math.min(...values),
                        max: Math.max(...values)
                    };
                }
            }
        });
        
        return ranges;
    }
    
    /**
     * Analyze data variance for a path
     */
    analyzeVariance(path: string): { curve: CurveType; coefficient: number } {
        const values = this.extractValues(path)
            .map(v => parseFloat(v))
            .filter(v => !isNaN(v));
        
        if (values.length === 0) {
            return { curve: 'linear', coefficient: 0 };
        }
        
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const coefficientOfVariation = Math.abs(mean) > 0 ? range / Math.abs(mean) : 0;
        
        let curve: CurveType = 'linear';
        
        if (coefficientOfVariation < 0.01) {
            curve = 'cubic';
        } else if (coefficientOfVariation < 0.1) {
            curve = 'exponential';
        } else if (coefficientOfVariation > 5) {
            curve = 'logarithmic';
        }
        
        return { curve, coefficient: coefficientOfVariation };
    }
    
    /**
     * Intelligent auto-mapping based on data analysis
     */
    intelligentMapping(mode: 'synthesizer' | 'sampler'): Record<string, Partial<Mapping>> {
        if (!this.data || this.numericPaths.length === 0) {
            return {};
        }
        
        // Analyze all numeric paths
        const pathAnalysis = this.numericPaths.map(pathObj => {
            const values = this.extractValues(pathObj.path)
                .map(v => parseFloat(v))
                .filter(v => !isNaN(v));
            
            if (values.length === 0) return null;
            
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            const coefficientOfVariation = Math.abs(mean) > 0 ? stdDev / Math.abs(mean) : 0;
            const uniqueValues = new Set(values).size;
            const uniqueRatio = uniqueValues / values.length;
            const interestScore = coefficientOfVariation * uniqueRatio * Math.log10(range + 1);
            
            return {
                path: pathObj.path,
                coefficientOfVariation,
                interestScore
            };
        }).filter(x => x !== null) as Array<{ path: string; coefficientOfVariation: number; interestScore: number }>;
        
        // Sort by interest score
        pathAnalysis.sort((a, b) => b.interestScore - a.interestScore);
        
        // Priority parameters by mode
        const priorityParams = mode === 'sampler'
            ? ['noteSpacing', 'sampleOffset', 'duration', 'pitch', 'pan', 'delayTime']
            : ['noteSpacing', 'frequency', 'duration', 'pan', 'filterFreq', 'delayTime'];
        
        const mappings: Record<string, Partial<Mapping>> = {};
        
        priorityParams.forEach((param, i) => {
            if (pathAnalysis[i]) {
                const analysis = pathAnalysis[i];
                
                // Determine curve
                let curve: CurveType = 'linear';
                if (analysis.coefficientOfVariation < 0.01) {
                    curve = 'cubic';
                } else if (analysis.coefficientOfVariation < 0.1) {
                    curve = 'exponential';
                } else if (analysis.coefficientOfVariation > 5) {
                    curve = 'logarithmic';
                }
                
                mappings[param] = {
                    path: analysis.path,
                    curve
                };
            }
        });
        
        return mappings;
    }
    
    /**
     * Calculate mapped parameter value
     */
    calculateParamValue(
        item: any,
        mapping: Mapping,
        dataRanges: Record<string, DataRange>
    ): number {
        if (!mapping.path || !dataRanges[Object.keys(dataRanges)[0]]) {
            return mapping.fixed;
        }
        
        const rawValue = parseFloat(this.getValueByPath(item, mapping.path));
        if (isNaN(rawValue)) return mapping.fixed;
        
        // Find the range for this mapping
        const range = Object.values(dataRanges)[0]; // This is simplified, should be parameter-specific
        const dataMin = range.min;
        const dataMax = range.max;
        
        if (dataMax === dataMin) return mapping.min;
        
        // Normalize to 0-1
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
            case 'linear':
            default:
                curved = normalized;
                break;
        }
        
        // Scale to audio range
        return mapping.min + (curved * (mapping.max - mapping.min));
    }
}

