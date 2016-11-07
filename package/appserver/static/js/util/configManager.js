import {generateTabView} from './configurationTabs';
import $C from 'splunk.config';
import SplunkBaseModel from 'models/Base';
import {loadGlobalConfig} from 'app/util/script';
import {Validator} from 'jsonschema';

class ConfigManager {
    init(next) {
        if (__CONFIG_FROM_FILE__) {
            this.unifiedConfig = require('app/config/globalConfig');
            attchPropertie();
        } else {
            loadGlobalConfig(() => {
                // The configuration object should be attached to global object,
                // before executing the code below.
                this.unifiedConfig = window.__globalConfig;
                attchPropertie();
            });
        }

        const attchPropertie = () => {
            // TODO: display error message when validation failed
            const validationResult = validateSchema(this.unifiedConfig);
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

export const configManager = new ConfigManager();
