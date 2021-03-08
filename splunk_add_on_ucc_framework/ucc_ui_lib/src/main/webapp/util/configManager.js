import React, {Component} from "react";
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import styled from 'styled-components';
import * as _ from "lodash";

import { validateSchema } from './uccConfigurationValidators';
import { getFormattedMessage } from './messageUtil';
import { setMetaInfo, setUnifiedConfig } from './util';
import { loadGlobalConfig } from './script';
import ErrorModal from '../components/ErrorModal';

const WaitSpinnerWrapper = styled(WaitSpinner)`
    position: fixed;
    top: 50%;
    left: 50%;
`;

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
        this.setState({loading: true});
        loadGlobalConfig().then((val) => {
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
                    <WaitSpinnerWrapper size="large" /> : 
                    this.renderComponents()
                }
            </>
        );
    }
}

export default ConfigManager;
