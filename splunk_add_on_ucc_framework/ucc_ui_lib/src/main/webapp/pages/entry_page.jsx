import React from 'react';
import layout from '@splunk/react-page';
import { SplunkThemeProvider } from '@splunk/themes';

import { StyledContainer, ThemeProviderSettings } from './EntryPageStyle';
import ConfigManager from '../util/configManager';
import InputPage from './Input/InputPage';
import ConfigurationPage from './Configuration/ConfigurationPage';

// Take in a component as argument WrappedComponent
function higherOrderComponent(WrappedComponent) {
    // And return another component
    // eslint-disable-next-line react/prefer-stateless-function
    class HOC extends React.Component {
        render() {
            return (
                <SplunkThemeProvider {...ThemeProviderSettings}>
                    <StyledContainer>
                        <ConfigManager>
                            {({ loading, appData }) => {
                                return !loading && appData && <WrappedComponent {...this.props} />;
                            }}
                        </ConfigManager>
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

if (page === 'inputs') {
    layout(<InputPageComponent />, { pageTitle: 'Inputs' });
} else if (page === 'configuration') {
    layout(<ConfigurationPageComponent />, { pageTitle: 'Configuration' });
}
