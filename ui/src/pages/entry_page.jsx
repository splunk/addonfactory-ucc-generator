import React, { Suspense } from 'react';
import layout from '@splunk/react-page';
import { BrowserRouter as Router } from 'react-router-dom';
import { SplunkThemeProvider } from '@splunk/themes';
import { getUserTheme } from '@splunk/splunk-utils/themes';
import { WaitSpinnerWrapper } from '../components/table/CustomTableStyle';

import { GlobalBodyStyle, StyledContainer } from './EntryPageStyle';
import { PAGE_CONF, PAGE_DASHBOARD, PAGE_INPUT } from '../constants/pages';
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
const DashboardPage = React.lazy(() =>
    import(/* webpackPrefetch: true */ './Dashboard/DashboardPage')
);

// Take in a component as argument WrappedComponent
function higherOrderComponent(WrappedComponent) {
    // And return another component
    // eslint-disable-next-line react/prefer-stateless-function
    class HOC extends React.Component {
        render() {
            return (
                <SplunkThemeProvider>
                    <GlobalBodyStyle />
                    <StyledContainer>
                        <Router>
                            <ConfigManager>
                                {({ loading, appData }) =>
                                    !loading &&
                                    appData && (
                                        <Suspense fallback={<WaitSpinnerWrapper size="medium" />}>
                                            <WrappedComponent // nosemgrep: typescript.react.best-practice.react-props-spreading.react-props-spreading
                                                {...this.props}
                                            />
                                        </Suspense>
                                    )
                                }
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
const DashboardPageComponent = higherOrderComponent(DashboardPage);

const url = window.location.pathname;
const urlParts = url.substring(1).split('/');
const page = urlParts[urlParts.length - 1];

// eslint-disable-next-line no-console
console.log(`
UCC Framework is here 👋 If you encounter any issues or have feedback, please report them to us.

For Splunkers, reach out via our Slack channel: #ucc-framework.
For external users, join us at: https://splunk-usergroups.slack.com/archives/C03SG3ZL4S1.

We appreciate your help in making UCC better! 🚀`);

getUserTheme().then((theme) => {
    switch (page) {
        case PAGE_INPUT:
            layout(<InputPageComponent />, {
                pageTitle: messageDict[116],
                theme,
            });
            break;
        case PAGE_CONF:
            layout(<ConfigurationPageComponent />, {
                pageTitle: messageDict[117],
                theme,
            });
            break;
        case PAGE_DASHBOARD:
            layout(<DashboardPageComponent />, { pageTitle: messageDict[119], theme });
            break;
        default:
    }
});
