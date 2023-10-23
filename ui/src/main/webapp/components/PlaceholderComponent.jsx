import React from 'react';
import PropTypes from 'prop-types';
import StaticContent from '@splunk/react-ui/StaticContent';

function PlaceholderComponent(props) {
    const { defaultValue } = props.controlOptions;

    return <StaticContent>{defaultValue}</StaticContent>;
}

PlaceholderComponent.propTypes = {
    controlOptions: PropTypes.object,
};

export default PlaceholderComponent;
