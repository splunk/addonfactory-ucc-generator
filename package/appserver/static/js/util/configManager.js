class ConfigManager {
    init(configData) {
        // TODO: validate config here
        this.unifiedConfig = configData;
    }
}

export const configManager = new ConfigManager();
