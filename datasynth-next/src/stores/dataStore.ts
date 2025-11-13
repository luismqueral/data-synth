/**
 * Data Store - State Management for Data System
 */

import { create } from 'zustand';
import { DataEngine } from '@/core/data/DataEngine';
import { DataPath } from '@/types/plugin';

interface DataState {
    // Data engine instance
    engine: DataEngine | null;
    
    // Current data
    data: any[] | null;
    numericPaths: DataPath[];
    allPaths: DataPath[];
    
    // Selected dataset
    selectedSource: string | null;
    
    // Actions
    initEngine: () => void;
    loadData: (rawData: any) => void;
    clearData: () => void;
    setSelectedSource: (source: string | null) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
    // Initial state
    engine: null,
    data: null,
    numericPaths: [],
    allPaths: [],
    selectedSource: null,
    
    // Actions
    initEngine: () => {
        if (!get().engine) {
            const engine = new DataEngine();
            set({ engine });
        }
    },
    
    loadData: (rawData) => {
        let { engine } = get();
        if (!engine) {
            get().initEngine();
            engine = get().engine;
        }
        
        engine!.loadData(rawData);
        
        set({
            data: engine!.getData(),
            numericPaths: engine!.getNumericPaths(),
            allPaths: engine!.getAllPaths()
        });
    },
    
    clearData: () => {
        set({
            data: null,
            numericPaths: [],
            allPaths: [],
            selectedSource: null
        });
    },
    
    setSelectedSource: (source) => set({ selectedSource: source })
}));

