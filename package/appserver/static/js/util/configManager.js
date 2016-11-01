import {generateTabView} from './configurationTabs';
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
                // The configuration object should be attached to global object,
                // before executing the code below.
                this.unifiedConfig = window.globalConfig;
                attchPropertie();
            });
        }

        const attchPropertie = () => {
            // TODO: validate config
            const {meta} = this.unifiedConfig;

            this.generateEndPointUrl = name => `${meta.restRoot}/${name}`;

            this.generateAppData(meta);
            this.getAppData = () => this.appData;

            this.configurationMap = parseConfigurationMap(this.unifiedConfig);
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
        const {title} = d,
            token = title.toLowerCase().replace(/\s/g, '-'),
            viewType = generateTabView(d);

        if(viewType) {
            const view = new viewType({
                containerId: `#${token}-tab`,
                props: d
            });
            const page = {
                active: i === 0,
                title,
                token,
                view
            };

            allTabs.push(page);
        }
    });

    return {configuration: {header, allTabs}};
}

export const configManager = new ConfigManager();
