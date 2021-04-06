import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import layout from '@splunk/react-page';
import { SplunkThemeProvider } from '@splunk/themes';

import { StyledContainer, ThemeProviderSettings } from './EntryPageStyle';
import ConfigManager from '../util/configManager';
import InputPage from './Input/InputPage';
import ConfigurationPage from './Configuration/ConfigurationPage';
import { PAGE_CONF, PAGE_INPUT } from '../constants/pages';
import messageDict from '../constants/messageDict';

// Take in a component as argument WrappedComponent
function higherOrderComponent(WrappedComponent) {
    // And return another component
    // eslint-disable-next-line react/prefer-stateless-function
    class HOC extends React.Component {
        render() {
            return (
                <SplunkThemeProvider {...ThemeProviderSettings}>
                    <StyledContainer>
                        <Router>
                            <ConfigManager>
                                {({ loading, appData }) => {
                                    return (
                                        !loading && appData && <WrappedComponent {...this.props} />
                                    );
                                }}
                            </ConfigManager>
                        </Router>
                    </StyledContainer>
                </SplunkThemeProvider>
            );
        }
    }
    return HOC;
}

// Create a new component
const InputPageComponent = higherOrderComponent(InputPage);
const ConfigurationPageComponent = higherOrderComponent(ConfigurationPage);

const url = window.location.pathname;
const urlParts = url.substring(1).split('/');
const page = urlParts[urlParts.length - 1];

if (page === PAGE_INPUT) {
    layout(<InputPageComponent />, { pageTitle: messageDict[116] });
} else if (page === PAGE_CONF) {
    layout(<ConfigurationPageComponent />, { pageTitle: messageDict[117] });
}
