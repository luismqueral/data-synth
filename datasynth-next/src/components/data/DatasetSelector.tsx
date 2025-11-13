'use client';

import { useState } from 'react';
import { useDataStore } from '@/stores/dataStore';
import * as d3 from 'd3';

export default function DatasetSelector() {
  const [selectedUrl, setSelectedUrl] = useState('');
  const [status, setStatus] = useState('');
  const [statusColor, setStatusColor] = useState('');
  const loadData = useDataStore(state => state.loadData);
  const setSelectedSource = useDataStore(state => state.setSelectedSource);
  
  const handleDatasetChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filePath = e.target.value;
    setSelectedUrl(filePath);
    
    if (!filePath) {
      setSelectedSource(null);
      return;
    }
    
    setStatus('Loading...');
    setStatusColor('text-gray-600');
    setSelectedSource(filePath);
    
    try {
      const isAPI = filePath.startsWith('http://') || filePath.startsWith('https://');
      const fetchURL = isAPI ? `${filePath}${filePath.includes('?') ? '&' : '?'}_t=${Date.now()}` : filePath;
      
      const response = await fetch(fetchURL, {
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load: ${response.statusText}`);
      }
      
      const text = await response.text();
      let parsedData;
      
      if (filePath.endsWith('.csv')) {
        parsedData = d3.csvParse(text, d3.autoType);
        setStatus(`✓ Parsed ${parsedData.length} rows from CSV`);
        setStatusColor('text-green-600');
      } else {
        parsedData = JSON.parse(text);
        setStatus('');
      }
      
      loadData(parsedData);
      
    } catch (error) {
      console.error('Error loading dataset:', error);
      setStatus(`✗ Error: ${(error as Error).message}`);
      setStatusColor('text-red-600');
    }
  };
  
  return (
    <>
      <div className="text-center mb-2">
        <select
          value={selectedUrl}
          onChange={handleDatasetChange}
          className="px-2 py-2 border border-black text-sm font-mono w-[600px] max-w-[90%]"
        >
          <option value="">-- Select Dataset --</option>
          
          <optgroup label="🌍 Earthquakes - All Magnitudes (USGS Live)">
            <option value="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson">
              All Earthquakes: Past Hour (Real-time)
            </option>
            <option value="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson">
              All Earthquakes: Past Day
            </option>
            <option value="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson">
              All Earthquakes: Past Week
            </option>
            <option value="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson">
              All Earthquakes: Past Month
            </option>
          </optgroup>
          
          <optgroup label="🔴 Earthquakes - Magnitude 4.5+ (USGS Live)">
            <option value="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_hour.geojson">
              M4.5+: Past Hour
            </option>
            <option value="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson">
              M4.5+: Past Day
            </option>
            <option value="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson">
              M4.5+: Past Week
            </option>
            <option value="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson">
              M4.5+: Past Month
            </option>
          </optgroup>
          
          <optgroup label="🟠 Earthquakes - Magnitude 2.5+ (USGS Live)">
            <option value="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson">
              M2.5+: Past Day
            </option>
            <option value="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson">
              M2.5+: Past Week
            </option>
          </optgroup>
          
          <optgroup label="⚠️ Earthquakes - Significant Only (USGS Live)">
            <option value="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson">
              Significant: Past Day
            </option>
            <option value="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson">
              Significant: Past Week
            </option>
          </optgroup>
          
          <optgroup label="📦 Earthquakes - Archived">
            <option value="/datasets/earthquakes-week.geojson">
              Local Archive: Weekly Snapshot
            </option>
          </optgroup>
          
          <optgroup label="🌌 Space">
            <option value="/datasets/exoplanets.csv">
              NASA Exoplanets (6000+ planets)
            </option>
          </optgroup>
        </select>
      </div>
      
      <div className="text-center text-sm text-gray-600 mb-2">
        Copy/paste or drag-and-drop dataset to upload your own
      </div>
      
      {status && (
        <div className={`text-center text-sm ${statusColor}`}>
          {status}
        </div>
      )}
    </>
  );
}

