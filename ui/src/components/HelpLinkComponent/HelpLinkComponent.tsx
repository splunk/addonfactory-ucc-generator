import React from 'react';
import Link from '@splunk/react-ui/Link';

interface Props {
    controlOptions: {
        text: string;
        link: string;
    };
}

function HelpLinkComponent(props: Props) {
    const { text, link } = props.controlOptions;

    return (
        <Link to={link} openInNewContext>
            {text}
        </Link>
    );
}

export default HelpLinkComponent;
