import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { getFormattedMessage } from './messageUtil';
import { setMetaInfo, setUnifiedConfig } from './util';
import { loadGlobalConfig } from './script';
import ErrorModal from '../components/ErrorModal';

class ConfigManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            unifiedConfig: {},
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
                } else if (err && err.response && err.response.status === 404) {
                    this.setState({ fileNotFoundError: true, loading: false });
                } else {
                    // eslint-disable-next-line no-console
                    console.error('Error [configManager.js] [35]: ', err);
                }
            });
    }

    attchPropertie(unifiedConfig) {
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
            unifiedConfig,
            loading: false,
        });
    }

    renderComponents() {
        if (this.state.syntaxError) {
            return (
                <ErrorModal message={getFormattedMessage(110, [getFormattedMessage(20)])} open />
            );
        }
        if (this.state.fileNotFoundError) {
            return (
                <ErrorModal message={getFormattedMessage(110, [getFormattedMessage(118)])} open />
            );
        }
        return this.props.children(this.state);
    }

    render() {
        return !this.state.loading && this.renderComponents();
    }
}

ConfigManager.propTypes = {
    children: PropTypes.any,
};

export default ConfigManager;
