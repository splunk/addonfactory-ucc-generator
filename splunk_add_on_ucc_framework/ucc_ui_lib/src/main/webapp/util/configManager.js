import React, {Component} from "react";
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import * as _ from "lodash";

import { validateSchema } from './uccConfigurationValidators';
import { getFormattedMessage } from './messageUtil';
import { setMetaInfo, setUnifiedConfig } from './util';
import ErrorModal from '../components/ErrorModal';

class ConfigManager extends Component {

    constructor(props) {
        super(props);
        this.state = {
            unifiedConfig: {},
            validationResult: {},
            appData: {},
            loading: true,
            syntaxError: false
        }
    }

    componentWillMount() {
        this.loadGlobalConfig().then((val) => {
            // The configuration object should be attached to global object,
            // before executing the code below.
            // this.unifiedConfig = window.__globalConfig;
            this.attchPropertie(val);
        }).catch((err) => {
            if (err && err.name === 'SyntaxError') {
                this.setState({syntaxError: true, loading: false});
            } else {
                console.error("Error [configManager.js] [35]: ", err);
            }
        });
    }

    loadGlobalConfig() {
        // Get the configuraiton json file in sync mode
        this.setState({loading: true});
        return new Promise((resolve, reject) => {
            fetch(`${this.getBuildDirPath()}/globalConfig.json`).then((res) => {
                return res.json();     
            }).then((json) => {
                // window.__globalConfig = json;
                resolve(json);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    getBuildDirPath() {
        const scripts = document.getElementsByTagName('script');
        const scriptsCount = scripts.length;
        for (let i = 0; i < scriptsCount; i++) {
            const s = scripts[i];
            if(s.src && s.src.match(/js\/build/)) {
                const lastSlashIndex = s.src.lastIndexOf('/');
                return s.src.slice(0, lastSlashIndex);
            }
        }
        return '';
    }

    attchPropertie(unifiedConfig) {
        const validationResult = validateSchema(unifiedConfig);
        const { meta } = unifiedConfig;
        const appData = {
            app: meta.name,
            custom_rest: meta.restRoot,
            nullStr: 'NULL',
            stanzaPrefix: meta.restRoot
        };

        setUnifiedConfig(unifiedConfig);
        setMetaInfo(appData);
        this.setState({
            appData: appData,
            validationResult: validationResult,
            unifiedConfig: unifiedConfig,
            loading: false
        });
    }

    renderComponents() {
        if (this.state.validationResult.failed) {
            return (
                <ErrorModal message={getFormattedMessage(110, [_.unescape(this.state.validationResult.errors[0].stack)])} open={true} />
            );
        } else if (this.state.syntaxError) {
            return (
                <ErrorModal message={getFormattedMessage(110, [getFormattedMessage(20)])} open={true} />
            );
        } else {
            return (
                this.props.children(this.state)
            );
        }
    }

    render() {
        return (
            <>
                {
                    this.state.loading ? 
                    <WaitSpinner size="large" /> : 
                    this.renderComponents()
                }
            </>
        );
    }
}

export default ConfigManager;
