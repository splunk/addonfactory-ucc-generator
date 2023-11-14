import React from 'react';
import StaticContent from '@splunk/react-ui/StaticContent';

interface PlaceholderComponentProps {
    controlOptions: {
        defaultValue: string;
    };
}

function PlaceholderComponent(props: PlaceholderComponentProps) {
    const { defaultValue } = props.controlOptions;

    return <StaticContent>{defaultValue}</StaticContent>;
}

export default PlaceholderComponent;
