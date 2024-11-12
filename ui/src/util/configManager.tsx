import React, { Component, ReactNode } from 'react';

import { getFormattedMessage } from './messageUtil';
import { setMetaInfo, setUnifiedConfig } from './util';
import { loadGlobalConfig } from './script';
import ErrorModal from '../components/ErrorModal/ErrorModal';
import { GlobalConfig } from '../types/globalConfig/globalConfig';

interface ConfigManagerProps {
    children: (state: ConfigManagerState) => ReactNode;
}

interface ConfigManagerState {
    unifiedConfig?: GlobalConfig;
    appData: IAppData;
    loading: boolean;
    syntaxError: boolean;
    fileNotFoundError?: boolean;
}

interface IAppData {
    app: string;
    custom_rest: string;
    nullStr: 'NULL';
    stanzaPrefix: string;
}

class ConfigManager extends Component<ConfigManagerProps, ConfigManagerState> {
    constructor(props: ConfigManagerProps) {
        super(props);
        this.state = {
            appData: {
                app: '',
                custom_rest: '',
                nullStr: 'NULL',
                stanzaPrefix: '',
            },
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
                this.attachProperties(val);
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

    attachProperties(unifiedConfig: GlobalConfig) {
        const { meta } = unifiedConfig;
        const appData: IAppData = {
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

export default ConfigManager;
