/**
 * Earthquakes Data Source Plugin
 * Loads real-time earthquake data from USGS
 */

import { DataSourcePlugin, PluginType } from '@/types/plugin';

const EarthquakesPlugin: DataSourcePlugin = {
    id: 'earthquakes-usgs',
    name: 'USGS Earthquakes',
    version: '1.0.0',
    type: PluginType.DATA_SOURCE,
    author: 'DataSynth Core',
    description: 'Real-time earthquake data from USGS with 16 different feeds',
    apiVersion: '1.0.0',
    icon: '🌍',
    
    defaultSettings: {
        feed: 'all_day'
    },
    
    async initialize(api) {
        console.log('Initializing USGS Earthquakes plugin');
    },
    
    async load(options = {}) {
        const feed = options.feed || 'all_day';
        const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${feed}.geojson`;
        
        try {
            const response = await fetch(url, {
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load earthquakes: ${response.statusText}`);
            }
            
            const geojson = await response.json();
            
            // Transform GeoJSON features to flat structure
            const data = geojson.features.map((feature: any) => ({
                ...feature.properties,
                longitude: feature.geometry.coordinates[0],
                latitude: feature.geometry.coordinates[1],
                depth: feature.geometry.coordinates[2]
            }));
            
            return {
                data,
                metadata: {
                    source: 'USGS',
                    feed,
                    count: data.length,
                    updated: geojson.metadata?.generated,
                    title: geojson.metadata?.title
                }
            };
        } catch (error) {
            console.error('Error loading earthquakes:', error);
            throw error;
        }
    },
    
    async getSchema() {
        return {
            fields: [
                { name: 'mag', type: 'number' as const, description: 'Magnitude' },
                { name: 'depth', type: 'number' as const, description: 'Depth in km' },
                { name: 'latitude', type: 'number' as const, description: 'Latitude' },
                { name: 'longitude', type: 'number' as const, description: 'Longitude' },
                { name: 'time', type: 'number' as const, description: 'Unix timestamp' },
                { name: 'sig', type: 'number' as const, description: 'Significance score' },
                { name: 'gap', type: 'number' as const, description: 'Azimuthal gap' },
                { name: 'dmin', type: 'number' as const, description: 'Distance to nearest station' },
                { name: 'rms', type: 'number' as const, description: 'RMS travel time residual' },
                { name: 'nst', type: 'number' as const, description: 'Number of stations' },
                { name: 'felt', type: 'number' as const, description: 'Number of felt reports' },
                { name: 'cdi', type: 'number' as const, description: 'Maximum reported intensity' },
                { name: 'mmi', type: 'number' as const, description: 'Maximum estimated intensity' },
                { name: 'tsunami', type: 'number' as const, description: 'Tsunami flag (0 or 1)' }
            ]
        };
    },
    
    supportsRealtime: true,
    
    subscribe(callback) {
        // Poll every minute for updates
        const interval = setInterval(async () => {
            try {
                const result = await this.load();
                callback(result.data);
            } catch (error) {
                console.error('Error fetching earthquake updates:', error);
            }
        }, 60000);
        
        return () => clearInterval(interval);
    }
};

export default EarthquakesPlugin;

