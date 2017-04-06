import _ from 'lodash';
import $C from 'splunk.config';
import SplunkBaseModel from 'models/Base';
import {loadGlobalConfig} from 'app/util/script';
import {validateSchema} from './uccConfigurationValidators';
import $ from 'jquery';
import ErrorDialog from 'app/views/component/Error';
import {getFormattedMessage} from 'app/util/messageUtil';

class ConfigManager {
    init(next) {
        const attchPropertie = () => {
            // TODO: display error message when validation failed
            const validationResult = validateSchema(this.unifiedConfig);
            if (validationResult.failed) {
                // TODO: display multiple errors in the popup window,
                // Currently, the ErrorDialog seems not support \n, that's why just display single error here.
                new ErrorDialog({
                    el: $('.dialog-placeholder'),
                    msg: getFormattedMessage(110, validationResult.errors[0])
                }).render().modal();
                return;
            }
            const {meta} = this.unifiedConfig;

            this.generateEndPointUrl = name => `${meta.restRoot}/${name}`;

            this.generateAppData(meta);
            this.getAppData = () => this.appData;

            next && next();
        };

        if (__CONFIG_FROM_FILE__) {
            this.unifiedConfig = require('repoBaseDir/globalConfig.json');
            attchPropertie();
        } else {
            loadGlobalConfig(() => {
                // The configuration object should be attached to global object,
                // before executing the code below.
                this.unifiedConfig = window.__globalConfig;
                attchPropertie();
            });
        }
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
            id: 'appData',
            sync: function (method) {
                throw new Error('invalid method: ' + method);
            }
        });

        this.appData = new AppDataModel({});
    }
}

export const configManager = new ConfigManager();
