import _ from 'lodash';
import $C from 'splunk.config';
import SplunkBaseModel from 'models/Base';
import {loadGlobalConfig, getBuildDirPath} from 'app/util/script';
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
        //TODO: Load custom components according to globalConfig
        const loadCustomComponent = () => {
            let customComponents = [];
            let componentDefinitions = this.unifiedConfig.pages.inputs.services
                .concat(this.unifiedConfig.pages.configuration.tabs);
            _.each(componentDefinitions, (component) => {
                _.each(component.entity, (e) => {
                    if (e.type === 'custom') {
                        customComponents.push(e.options.src);
                    }
                });
            });
            console.log(customComponents);
            console.log(getBuildDirPath());
            // requirejs.config({
            //     baseUrl: getBuildDirPath()
            // });
            // _.each(customComponents, (component) => {
            //     requirejs([`${getBuildDirPath()}/${component}`], function(CustomControl) {
            //         console.log('loading done');
            //     });
            // });
            // _.each(customComponents, (component) => {
            //     console.log(component);
            //     $.getScript(`${getBuildDirPath()}/${component}`).done(() => {
            //         console.log('loading done');
            //     });
            // });
        }

        if (__CONFIG_FROM_FILE__) {
            this.unifiedConfig = require('repoBaseDir/globalConfig.json');
            attchPropertie();
        } else {
            loadGlobalConfig(() => {
                // The configuration object should be attached to global object,
                // before executing the code below.
                this.unifiedConfig = window.__globalConfig;
                attchPropertie();
                loadCustomComponent();
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
