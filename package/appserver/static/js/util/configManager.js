import configurationPageMap from 'app/constants/configurationPageMap';

const ALLOWED_CONFIGURATION_PAGE_TYPE_MAP = {
    'account': true,
    'logging': true,
    'proxy': true
}

class ConfigManager {
    init(configData) {
        // TODO: validate config here
        this.unifiedConfig = configData;
        this.configurationMap = parseConfigurationMap(configData);
    }
}

function parseConfigurationMap(unifiedConfig) {
    const header = {
        title: '',
        description: '',
        enableButton: false,
        enableHr: false
    };
    const allTabs = [];

    const {pages: {configuration: {title, description, tabs}}} = unifiedConfig;

    // Parse header
    if(title) header.title = title;
    if(description) header.description = description;

    // Parse tabs
    tabs.forEach((d, i) => {
        if(ALLOWED_CONFIGURATION_PAGE_TYPE_MAP[d.name]) {
            const page = {
                view: configurationPageMap[d.name],
                active: i === 0,
                title: d.title
            };

            allTabs.push(page);
        }
    });

    return {configuration: {header, allTabs}};
}

export const configManager = new ConfigManager();
