// import CONFIGURATION_PAGE_MAP from 'app/constants/configurationPageMap';
import $C from 'splunk.config';
import SplunkBaseModel from 'models/Base'

class ConfigManager {
    init(configData) {
        // TODO: validate config here
        this.unifiedConfig = configData;
        // this.configurationMap = parseConfigurationMap(configData);
        this.generateEndPointUrl = name => `${configData.meta.restRoot}/${name}`;
        this.getAppData = () => {
            const meta = this.unifiedConfig.meta;
            const model = SplunkBaseModel.extend({
                defaults: {
                    owner: $C.USERNAME,
                    app: meta.name,
                    custom_rest: meta.restRoot,
                    nullStr: 'NULL',
                    stanzaPrefix: meta.restRoot
                },
                id: "appData",
                sync: function (method) {
                    throw new Error('invalid method: ' + method);
                }
            });
            return new model({});
        }
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
        const view = CONFIGURATION_PAGE_MAP[d.name];
        if(view) {
            const page = {
                active: i === 0,
                title: d.title,
                view
            };

            allTabs.push(page);
        }
    });

    return {configuration: {header, allTabs}};
}

export const configManager = new ConfigManager();
