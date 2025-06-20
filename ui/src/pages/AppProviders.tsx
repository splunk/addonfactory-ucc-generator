import React, { Suspense } from 'react';
import SplunkThemeProvider from '@splunk/themes/SplunkThemeProvider';
import { BrowserRouter as Router } from 'react-router-dom';
import { GlobalBodyStyle, MainContent, StyledContainer } from './GlobalStyles';
import ConfigManager from '../util/configManager';
import { WaitSpinnerWrapper } from '../components/table/CustomTableStyle';
import Footer from './Footer';

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
                                    <MainContent>{children}</MainContent>
                                    <Footer />
                                </Suspense>
                            )
                        }
                    </ConfigManager>
                </Router>
            </StyledContainer>
        </SplunkThemeProvider>
    );
}
