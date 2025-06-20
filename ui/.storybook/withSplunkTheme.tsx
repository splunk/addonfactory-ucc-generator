import React, { Suspense } from 'react';
import { createGlobalStyle } from 'styled-components';
import { Decorator } from '@storybook/react';
import { AnimationToggleProvider } from '@splunk/react-ui/AnimationToggle';
import { SplunkThemeProvider } from '@splunk/themes';
import { BrowserRouter as Router } from 'react-router-dom';
import { GlobalBodyStyle, MainContent, StyledContainer } from '../src/pages/GlobalStyles';
import { WaitSpinnerWrapper } from '../src/components/table/CustomTableStyle';
import fontDefinitions from './fontDefinitions';
import { PageContextProvider } from '../src/context/PageContext';

const TestStylesForConsistentScreenshots = createGlobalStyle`
    ${fontDefinitions}

    * {
        text-rendering: geometricPrecision;
        -webkit-font-smoothing: subpixel-antialiased;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
`;

export const withSplunkThemeToolbar: Decorator = (StoryFn, context) => {
    const { globals } = context;
    // vars from globalTypes of preview.tsx
    const { colorScheme, density, family } = globals;
    const isTestRunner = !!window?.navigator?.userAgent?.match(/StorybookTestRunner/);
    const animation = isTestRunner ? false : globals.animation;

    return (
        <AnimationToggleProvider enabled={animation}>
            <TestStylesForConsistentScreenshots />
            <SplunkThemeProvider family={family} density={density} colorScheme={colorScheme}>
                <PageContextProvider platform={undefined}>
                    <GlobalBodyStyle />
                    <StyledContainer>
                        <Router>
                            <Suspense fallback={<WaitSpinnerWrapper size="medium" />}>
                                <MainContent>
                                    <StoryFn />
                                </MainContent>
                            </Suspense>
                        </Router>
                    </StyledContainer>
                </PageContextProvider>
            </SplunkThemeProvider>
        </AnimationToggleProvider>
    );
};
