import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from '@splunk/react-ui/Link';


const MarkdownWrapper = styled.div`
    color: ${props => props.color};
`;

function MarkDownMessage(props) {
    return (
        <>
            {props.link !== '' ?
                <Link to={props.link} >
                    {props.text}
                </Link>
                :
                <MarkdownWrapper color={props.color}>{props.text}</MarkdownWrapper>
            }
        </>
    );
}


MarkDownMessage.propTypes = {
    text: PropTypes.string,
    link: PropTypes.string,
    color: PropTypes.string
};

export default MarkDownMessage;
