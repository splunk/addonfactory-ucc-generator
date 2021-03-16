import React from 'react';
import PropTypes from 'prop-types';
import Link from '@splunk/react-ui/Link';

function HelpLinkComponent(props) {
    const { text, link } = props.controlOptions;

    return (
        <Link to={link}>
            {text}
        </Link>
    );
}

HelpLinkComponent.propTypes = {
    field: PropTypes.string,
    controlOptions: PropTypes.object
};

export default HelpLinkComponent;
