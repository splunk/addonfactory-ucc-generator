import React, { Suspense } from 'react';
import { SplunkThemeProvider } from '@splunk/themes';
import { BrowserRouter as Router } from 'react-router-dom';
import { GlobalBodyStyle, StyledContainer } from './GlobalStyles';
import ConfigManager from '../util/configManager';
import { WaitSpinnerWrapper } from '../components/table/CustomTableStyle';

export function AppProviders({ children }: { children: React.ReactNode }) {
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
                                    {children}
                                </Suspense>
                            )
                        }
                    </ConfigManager>
                </Router>
            </StyledContainer>
        </SplunkThemeProvider>
    );
}
