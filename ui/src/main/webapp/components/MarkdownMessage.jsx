import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from '@splunk/react-ui/Link';

const MarkdownWrapper = styled.span`
    color: ${(props) => props.color};
`;

function MarkdownMessage(props) {
    // flatMap adds the link to the part of text that has been split from text
    // and returns a new array formed by applying a given function to each element of the array,
    // and then flattening the result by one level
    function flatMap(array, fn) {
        let markdownText = [];
        for (let i = 0; i < array.length; i += 1) {
            const mapping = fn(array[i]);
            markdownText = markdownText.concat(mapping);
        }
        return markdownText;
    }

    function getMarkdownText() {
        let markdownText = props.text;
        if (props.markdownType === 'link') {
            markdownText = <Link to={props.link}>{props.text}</Link>;
        } else if (props.markdownType === 'hybrid') {
            // markdownType hybrid is for support of both text and link
            markdownText = flatMap(markdownText.split(props.token), (part) => {
                return [
                    part,
                    <Link key={part} to={props.link}>
                        {props.linkText}
                    </Link>,
                ];
            });
            markdownText.pop();
        } else if (props.markdownType === 'text') {
            markdownText = <MarkdownWrapper color={props.color}>{props.text}</MarkdownWrapper>;
        }

        return markdownText;
    }

    return <div data-test="msg-markdown">{getMarkdownText()}</div>;
}

MarkdownMessage.propTypes = {
    text: PropTypes.string,
    link: PropTypes.string,
    color: PropTypes.string,
    markdownType: PropTypes.string,
    token: PropTypes.string,
    linkText: PropTypes.string,
};

export default React.memo(MarkdownMessage);
