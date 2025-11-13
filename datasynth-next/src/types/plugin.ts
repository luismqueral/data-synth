// Plugin System Types
// Framework-agnostic interfaces for the plugin system

export enum PluginType {
    DATA_SOURCE = 'data-source',
    AUDIO_EFFECT = 'audio-effect',
    SYNTHESIZER = 'synthesizer',
    VISUALIZATION = 'visualization',
    MAPPER = 'mapper',
    EXPORTER = 'exporter'
}

export interface PluginAPI {
    audio: {
        getContext: () => AudioContext;
        scheduleNote: (params: any) => void;
    };
    data: {
        getCurrentData: () => any[];
        getDataPaths: () => DataPath[];
    };
    mapping: {
        getCurrentMappings: () => Record<string, any>;
        suggestMapping: (param: string, path: string) => void;
    };
    ui: {
        showNotification: (message: string, type: 'info' | 'success' | 'error') => void;
    };
    state: {
        get: <T>(key: string) => T;
        set: <T>(key: string, value: T) => void;
    };
}

export interface Plugin {
    id: string;
    name: string;
    version: string;
    type: PluginType;
    author: string;
    description: string;
    apiVersion: string;
    icon?: string;
    
    initialize?: (api: PluginAPI) => Promise<void> | void;
    activate?: () => Promise<void> | void;
    deactivate?: () => Promise<void> | void;
    cleanup?: () => Promise<void> | void;
    
    settings?: any;
    defaultSettings?: Record<string, any>;
    dependencies?: string[];
}

export interface DataSourcePlugin extends Plugin {
    type: PluginType.DATA_SOURCE;
    load: (options?: any) => Promise<DataSourceResult>;
    getSchema?: () => Promise<DataSchema>;
    getSample?: (count: number) => Promise<any[]>;
    supportsRealtime?: boolean;
    subscribe?: (callback: (data: any) => void) => () => void;
}

export interface DataSourceResult {
    data: any[];
    metadata?: {
        source?: string;
        count?: number;
        timestamp?: string;
        [key: string]: any;
    };
}

export interface DataSchema {
    fields: DataField[];
}

export interface DataField {
    name: string;
    type: 'number' | 'string' | 'boolean' | 'date';
    description?: string;
}

export interface DataPath {
    path: string;
    type: 'number' | 'string';
    coverage?: number;
    recommendedCurve?: string;
    variance?: number;
}

