import CONFIGURATION_PAGE_MAP from 'app/constants/configurationPageMap';
import $C from 'splunk.config';
import SplunkBaseModel from 'models/Base';
import {loadGlobalConfig} from 'app/util/script';

class ConfigManager {
    init(next) {
        if (__CONFIG_FROM_FILE__) {
            this.unifiedConfig = require('app/config/globalConfig');
            attchPropertie();
        } else {
            loadGlobalConfig(() => {
                this.unifiedConfig = window.__globalConfig;
                attchPropertie();
            });
        }

        const attchPropertie = () => {
            // TODO: validate config
            this.configurationMap = parseConfigurationMap(this.unifiedConfig);
            const {meta} = this.unifiedConfig;

            this.generateEndPointUrl = name => `${meta.restRoot}/${name}`;

            this.generateAppData(meta);
            this.getAppData = () => this.appData;

            next && next();
        };
    }

    generateAppData(meta) {
        const AppDataModel = SplunkBaseModel.extend({
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

        this.appData = new AppDataModel({});
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
