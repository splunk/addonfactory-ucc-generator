import React from 'react';
import PropTypes from 'prop-types';
import ComboBox from '@splunk/react-ui/ComboBox';
import styled from 'styled-components';

const StyledDiv = styled.div`
    div:first-child {
        width: 320px !important;
    }
`;

function ComboBoxWrapper(props) {
    const { value, name, error, placeholder, disabled, labelValueMapping, ...restProps } = props;

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
        restProps.handleChange(e, { ...obj, value: effectiveValue });
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
