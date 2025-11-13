/**
 * PluginRegistry - Framework-Agnostic Plugin Management
 * 
 * Manages plugin lifecycle: registration, activation, deactivation.
 * This class has NO framework dependencies.
 */

import { Plugin, PluginType, PluginAPI } from '@/types/plugin';

export class PluginRegistry {
    private plugins = new Map<string, Plugin>();
    private activePlugins = new Set<string>();
    private api: PluginAPI;
    private eventListeners = new Map<string, Set<Function>>();
    
    constructor(api: PluginAPI) {
        this.api = api;
    }
    
    /**
     * Register a plugin
     */
    async register(plugin: Plugin): Promise<void> {
        // Validate
        this.validatePlugin(plugin);
        
        // Check API compatibility
        if (!this.isCompatible(plugin.apiVersion)) {
            throw new Error(`Plugin ${plugin.id} requires API ${plugin.apiVersion}`);
        }
        
        // Check dependencies
        await this.checkDependencies(plugin);
        
        // Initialize
        if (plugin.initialize) {
            await plugin.initialize(this.api);
        }
        
        // Store
        this.plugins.set(plugin.id, plugin);
        
        console.log(`✅ Registered plugin: ${plugin.name} v${plugin.version}`);
        this.broadcast('plugin:registered', plugin);
    }
    
    /**
     * Activate a plugin
     */
    async activate(pluginId: string): Promise<void> {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) throw new Error(`Plugin ${pluginId} not found`);
        
        if (plugin.activate) {
            await plugin.activate();
        }
        
        this.activePlugins.add(pluginId);
        this.broadcast('plugin:activated', plugin);
        
        console.log(`✅ Activated plugin: ${plugin.name}`);
    }
    
    /**
     * Deactivate a plugin
     */
    async deactivate(pluginId: string): Promise<void> {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) throw new Error(`Plugin ${pluginId} not found`);
        
        if (plugin.deactivate) {
            await plugin.deactivate();
        }
        
        this.activePlugins.delete(pluginId);
        this.broadcast('plugin:deactivated', plugin);
        
        console.log(`✅ Deactivated plugin: ${plugin.name}`);
    }
    
    /**
     * Get all plugins
     */
    getAllPlugins(): Plugin[] {
        return Array.from(this.plugins.values());
    }
    
    /**
     * Get plugins by type
     */
    getPluginsByType(type: PluginType): Plugin[] {
        return Array.from(this.plugins.values()).filter(p => p.type === type);
    }
    
    /**
     * Get active plugins
     */
    getActivePlugins(): Plugin[] {
        return Array.from(this.activePlugins)
            .map(id => this.plugins.get(id)!)
            .filter(Boolean);
    }
    
    /**
     * Get plugin by ID
     */
    getPlugin(id: string): Plugin | undefined {
        return this.plugins.get(id);
    }
    
    /**
     * Check if plugin is active
     */
    isActive(id: string): boolean {
        return this.activePlugins.has(id);
    }
    
    /**
     * Broadcast event to all listeners
     */
    broadcast(event: string, data: any): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    
    /**
     * Listen to events
     */
    listen(event: string, callback: (data: any) => void): () => void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)!.add(callback);
        
        // Return unsubscribe function
        return () => {
            this.eventListeners.get(event)?.delete(callback);
        };
    }
    
    /**
     * Validate plugin structure
     */
    private validatePlugin(plugin: Plugin): void {
        if (!plugin.id) throw new Error('Plugin must have an id');
        if (!plugin.name) throw new Error('Plugin must have a name');
        if (!plugin.version) throw new Error('Plugin must have a version');
        if (!plugin.type) throw new Error('Plugin must have a type');
        if (!plugin.apiVersion) throw new Error('Plugin must have an apiVersion');
        
        if (this.plugins.has(plugin.id)) {
            throw new Error(`Plugin ${plugin.id} already registered`);
        }
    }
    
    /**
     * Check API compatibility
     */
    private isCompatible(requiredVersion: string): boolean {
        // Simple check for now - in production use semver library
        return requiredVersion.startsWith('1.');
    }
    
    /**
     * Check plugin dependencies
     */
    private async checkDependencies(plugin: Plugin): Promise<void> {
        if (!plugin.dependencies) return;
        
        for (const depId of plugin.dependencies) {
            if (!this.plugins.has(depId)) {
                throw new Error(
                    `Plugin ${plugin.id} requires ${depId} which is not installed`
                );
            }
        }
    }
    
    /**
     * Cleanup all plugins
     */
    async cleanup(): Promise<void> {
        for (const plugin of this.plugins.values()) {
            if (this.activePlugins.has(plugin.id)) {
                await this.deactivate(plugin.id);
            }
            if (plugin.cleanup) {
                await plugin.cleanup();
            }
        }
        
        this.plugins.clear();
        this.activePlugins.clear();
        this.eventListeners.clear();
    }
}

