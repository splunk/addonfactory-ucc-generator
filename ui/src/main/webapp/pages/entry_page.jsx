import React, { Suspense } from 'react';
import layout from '@splunk/react-page';
import { BrowserRouter as Router } from 'react-router-dom';
import { SplunkThemeProvider } from '@splunk/themes';
import { WaitSpinnerWrapper } from '../components/table/CustomTableStyle';

import { StyledContainer, ThemeProviderSettings } from './EntryPageStyle';
import { PAGE_CONF, PAGE_INPUT } from '../constants/pages';
import ConfigManager from '../util/configManager';
import messageDict from '../constants/messageDict';
import { getBuildDirPath } from '../util/script';
import './style.css';

// eslint-disable-next-line no-undef,camelcase
__webpack_public_path__ = `${getBuildDirPath()}/`;

const InputPage = React.lazy(() => import(/* webpackPrefetch: true */ './Input/InputPage'));
const ConfigurationPage = React.lazy(() =>
    import(/* webpackPrefetch: true */ './Configuration/ConfigurationPage')
);

// Take in a component as argument WrappedComponent
function higherOrderComponent(WrappedComponent) {
    // And return another component
    // eslint-disable-next-line react/prefer-stateless-function
    class HOC extends React.Component {
        render() {
            return (
                <SplunkThemeProvider // nosemgrep: typescript.react.best-practice.react-props-spreading.react-props-spreading
                    {...ThemeProviderSettings}
                >
                    <StyledContainer>
                        <Router>
                            <ConfigManager>
                                {({ loading, appData }) => {
                                    return (
                                        !loading &&
                                        appData && (
                                            <Suspense fallback={<WaitSpinnerWrapper />}>
                                                <WrappedComponent // nosemgrep: typescript.react.best-practice.react-props-spreading.react-props-spreading
                                                    {...this.props}
                                                />
                                            </Suspense>
                                        )
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
