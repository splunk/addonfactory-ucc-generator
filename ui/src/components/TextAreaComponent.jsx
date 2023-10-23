import React from 'react';
import PropTypes from 'prop-types';
import TextArea from '@splunk/react-ui/TextArea';
import styled from 'styled-components';

const TextWrapper = styled(TextArea)`
    width: 320px !important;
`;

function TextAreaComponent(props) {
    const handleChange = (e, { value }) => {
        props.handleChange(props.field, value);
    };

    return (
        <TextWrapper
            inline
            canClear
            error={props.error}
            className={props.field}
            disabled={props.disabled}
            value={props.value?.toString() || ''}
            onChange={handleChange}
            rowsMax={props?.controlOptions?.rowsMax ? props?.controlOptions?.rowsMax : 12}
            rowsMin={props?.controlOptions?.rowsMin ? props?.controlOptions?.rowsMin : 8}
        />
    );
}

TextAreaComponent.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    handleChange: PropTypes.func.isRequired,
    field: PropTypes.string,
    error: PropTypes.bool,
    controlOptions: PropTypes.object,
    disabled: PropTypes.bool,
};

export default TextAreaComponent;
