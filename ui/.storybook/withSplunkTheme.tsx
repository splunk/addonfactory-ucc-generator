import { createGlobalStyle } from 'styled-components';
import { PartialStoryFn as StoryFunction, Renderer, StoryContext } from '@storybook/types';
import { AnimationToggleProvider } from '@splunk/react-ui/AnimationToggle';
import { SplunkThemeProvider } from '@splunk/themes';
import { BrowserRouter as Router } from 'react-router-dom';
import React, { Suspense } from 'react';
import { StyledContainer } from '../src/pages/EntryPageStyle';
import { WaitSpinnerWrapper } from '../src/components/table/CustomTableStyle';
import { GlobalStyle } from '../src/pages/entry_page';
import fontDefinitions from './fontDefinitions';

const TestStylesForConsistentScreenshots = createGlobalStyle`
    ${fontDefinitions}

    * {
        text-rendering: geometricPrecision;
        -webkit-font-smoothing: subpixel-antialiased;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
`;

export const withSplunkThemeToolbar = <TRenderer extends Renderer>(
    StoryFn: StoryFunction<TRenderer>,
    { globals }: StoryContext<TRenderer>
) => {
    // vars from globalTypes of preview.tsx
    const { colorScheme, density, family } = globals;
    const isTestRunner = !!window?.navigator?.userAgent?.match(/StorybookTestRunner/);

    const animation = isTestRunner ? false : globals.animation;

    return (
        <AnimationToggleProvider enabled={animation}>
            <TestStylesForConsistentScreenshots />
            <SplunkThemeProvider family={family} density={density} colorScheme={colorScheme}>
                <GlobalStyle />
                <StyledContainer>
                    <Router>
                        <Suspense fallback={<WaitSpinnerWrapper size="medium" />}>
                            {StoryFn()}
                        </Suspense>
                    </Router>
                </StyledContainer>
            </SplunkThemeProvider>
        </AnimationToggleProvider>
    );
};
