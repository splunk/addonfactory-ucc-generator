import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from '@splunk/react-ui/Link';


const MarkdownWrapper = styled.div`
    color: ${props => props.color};
`;

function MarkDownMessage(props) {
    
    function flatMap(array, fn) {
        var markdownText = [];
        for (var i = 0; i < array.length; i++) {
          var mapping = fn(array[i]);
          markdownText = markdownText.concat(mapping);
        }
        return markdownText;
    }
    
    var markdownText = props.text;
    markdownText = flatMap(markdownText.split(props.token), function (part) {
      return [part, <Link data-test="msg-markdown" key= {part} to={props.link}>{props.linkText}</Link>];
    });
    
    markdownText.pop();
    
    return (
        <>
            {props.markdownType === 'link' ?
                <Link data-test="msg-markdown" to={props.link}>
                    {props.text}
                </Link>
                :
                props.markdownType === 'hybrid' ?
                    markdownText
                :
                <MarkdownWrapper color={props.color} data-test="msg-markdown">
                    {props.text}
                </MarkdownWrapper>
            }
        </>
    );
}


MarkDownMessage.propTypes = {
    text: PropTypes.string,
    link: PropTypes.string,
    color: PropTypes.string,
    markdownType: PropTypes.string,
    token: PropTypes.string,
    linkText: PropTypes.string
};

export default MarkDownMessage;
