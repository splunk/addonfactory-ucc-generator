import styled from 'styled-components';
import variables from '@splunk/themes/variables';
import { PartialStoryFn as StoryFunction, Renderer, StoryContext } from '@storybook/types';
import { AnimationToggleProvider } from '@splunk/react-ui/AnimationToggle';
import { SplunkThemeProvider } from '@splunk/themes';
import { BrowserRouter as Router } from 'react-router-dom';
import React, { Suspense } from 'react';
import { StyledContainer } from '../src/pages/EntryPageStyle';
import { WaitSpinnerWrapper } from '../src/components/table/CustomTableStyle';

// https://storybook.js.org/blog/how-to-add-a-theme-switcher-to-storybook/
// syncing storybook preview background with selected theme
const BackgroundBlock = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    bottom: 0;
    overflow: auto;
    padding: 1rem;
    background-color: ${variables.backgroundColorPage};
`;

export const withSplunkThemeToolbar = <TRenderer extends Renderer>(
    StoryFn: StoryFunction<TRenderer>,
    { globals }: StoryContext<TRenderer>
) => {
    // vars from globalTypes of preview.tsx
    const { colorScheme, density, family } = globals;
    const isTestRunner = !!window?.navigator?.userAgent?.match(/StorybookTestRunner/) ;

    const animation = isTestRunner ? false : globals.animation;

    return (
        <AnimationToggleProvider enabled={animation}>
            <SplunkThemeProvider family={family} density={density} colorScheme={colorScheme}>
                <BackgroundBlock>
                    <StyledContainer>
                        <Router>
                            <Suspense fallback={<WaitSpinnerWrapper size="medium" />}>
                                {StoryFn()}
                            </Suspense>
                        </Router>
                    </StyledContainer>
                </BackgroundBlock>
            </SplunkThemeProvider>
        </AnimationToggleProvider>
    );
};
