import React from 'react';
import PropTypes from 'prop-types';
import ComboBox from '@splunk/react-ui/ComboBox';
import styled from 'styled-components';

const StyledDiv = styled.div`
    div:first-child {
        width: 300px !important;
    }
`;

function ComboBoxWrapper(props) {
    const {
        value,
        name,
        error,
        placeholder,
        disabled,
        labelValueMapping,
        // isGroup,
        ...restProps
    } = props;

    // function getHeadingElement(elem) {
    //     // Get the next sibling element
    //     let sibling = elem.previousElementSibling;

    //     // If the sibling matches our selector, use it
    //     // If not, jump to the next sibling and continue the loop
    //     while (sibling) {
    //         if (!sibling.matches('[data-test="option"]')) {
    //             return sibling.querySelector('[data-test="heading"]');
    //         }
    //         sibling = sibling.previousElementSibling;
    //     }
    //     return null;
    // }

    function handleChange(e, obj) {
        let effectiveValue = obj.value;
        if (e.target.getAttribute('role') === 'textbox') {
            const entry = Array.from(labelValueMapping.entries()).find(([k, v]) => {
                if (v instanceof Map) {
                    return v.get(obj.value);
                }
                return k === obj.value;
            });
            if (entry) {
                effectiveValue = entry[1] instanceof Map ? entry[1].get(obj.value) : entry[1];
            }
        }
        // else if (isGroup) {
        //     const target = e.target.closest('button[data-test="option"]');
        //     const groupName = getHeadingElement(target).innerText.toUpperCase();
        //     effectiveValue = labelValueMapping.get(groupName).get(obj.value);
        // } else {
        //     effectiveValue = labelValueMapping.get(obj.value);
        // }
        restProps.handleChange(e, { ...obj, value: effectiveValue });
        // restProps.handleChange(e, obj);
    }

    return (
        <StyledDiv>
            <ComboBox
                value={value}
                name={name}
                error={error}
                placeholder={placeholder}
                disabled={disabled}
                onChange={handleChange}
                inline
            >
                {restProps.children}
            </ComboBox>
        </StyledDiv>
    );
}

ComboBoxWrapper.propTypes = {
    value: PropTypes.string,
    name: PropTypes.string,
    error: PropTypes.bool,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    labelValueMapping: PropTypes.instanceOf(Map),
    isGroup: PropTypes.bool,
    handleChange: PropTypes.func.isRequired,
};

export default ComboBoxWrapper;
