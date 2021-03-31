import React, { Component } from 'react';
import * as _ from 'lodash';
import PropTypes from 'prop-types';

import { validateSchema } from './uccConfigurationValidators';
import { getFormattedMessage } from './messageUtil';
import { setMetaInfo, setUnifiedConfig } from './util';
import { loadGlobalConfig } from './script';
import ErrorModal from '../components/ErrorModal';

class ConfigManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            unifiedConfig: {},
            validationResult: {},
            appData: {},
            loading: true,
            syntaxError: false,
        };
    }

    componentDidMount() {
        this.setState({ loading: true });
        loadGlobalConfig()
            .then((val) => {
                // The configuration object should be attached to global object,
                // before executing the code below.
                // this.unifiedConfig = window.__globalConfig;
                this.attchPropertie(val);
            })
            .catch((err) => {
                if (err && err.name === 'SyntaxError') {
                    this.setState({ syntaxError: true, loading: false });
                } else {
                    // eslint-disable-next-line no-console
                    console.error('Error [configManager.js] [35]: ', err);
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
            stanzaPrefix: meta.restRoot,
        };

        setUnifiedConfig(unifiedConfig);
        setMetaInfo(appData);
        this.setState({
            appData,
            validationResult,
            unifiedConfig,
            loading: false,
        });
    }

    renderComponents() {
        if (this.state.validationResult.failed) {
            return (
                <ErrorModal
                    message={getFormattedMessage(110, [
                        _.unescape(this.state.validationResult.errors[0].stack),
                    ])}
                    open
                />
            );
        }
        if (this.state.syntaxError) {
            return (
                <ErrorModal message={getFormattedMessage(110, [getFormattedMessage(20)])} open />
            );
        }
        return this.props.children(this.state);
    }

    render() {
        return <>{!this.state.loading && this.renderComponents()}</>;
    }
}

ConfigManager.propTypes = {
    children: PropTypes.string,
};

export default ConfigManager;
