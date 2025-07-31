import React from 'react';
import { Decorator } from '@storybook/react';
import { ControlGroupWrapper } from '../src/components/ControlWrapper/ControlWrapper';

export const withControlGroup: Decorator = (StoryFn, { name }) => {
    return (
        <ControlGroupWrapper label={name} labelWidth={260} labelPosition="left">
            {StoryFn()}
        </ControlGroupWrapper>
    );
};
