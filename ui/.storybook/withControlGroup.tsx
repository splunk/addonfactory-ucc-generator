import React from 'react';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import { Decorator } from '@storybook/react-vite';

export const withControlGroup: Decorator = (StoryFn, { name }) => {
    return (
        <ControlGroup label={name} labelWidth={260}>
            {StoryFn()}
        </ControlGroup>
    );
};
