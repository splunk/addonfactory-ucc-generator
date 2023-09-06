import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Text from '@splunk/react-ui/Text';
import { isFalse, isTrue } from '../util/util';
import { StyledColumnLayout, StyledSwitch } from './StyledComponent';

function CheckboxGroupsComponent(props) {
    const { field, label, value, checkboxTextFieldValue, handleChange } = props;

    const [isDisabled, setIsDisabled] = useState(!value);

    useEffect(() => {
        setIsDisabled(!value);
    }, [value]);

    const handleChangeCheckbox = () => {
        if (value && isTrue(value)) {
            handleChange(field, 0);
            setIsDisabled(true);
        } else {
            handleChange(field, 1);
            setIsDisabled(false);
        }
    };

    const handleChangeTextBox = (event) => {
        handleChange(field, event.target.value, 'checkboxGroups');
    };

    return (
        <StyledColumnLayout>
            <ColumnLayout.Row>
                <ColumnLayout.Column span={5}>
                    <StyledSwitch
                        key={field}
                        value={value}
                        onClick={handleChangeCheckbox}
                        selected={!(value ? isFalse(value) : true)}
                        appearance="checkbox"
                    >
                        {label}
                    </StyledSwitch>
                </ColumnLayout.Column>
                <ColumnLayout.Column span={2}>
                    <Text
                        inline
                        disabled={isDisabled}
                        value={checkboxTextFieldValue ? checkboxTextFieldValue.toString() : ''}
                        onChange={handleChangeTextBox}
                        type="text"
                    />
                </ColumnLayout.Column>
            </ColumnLayout.Row>
        </StyledColumnLayout>
    );
}

CheckboxGroupsComponent.propTypes = {
    value: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
    checkboxTextFieldValue: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.number,
        PropTypes.string,
    ]),
    handleChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    field: PropTypes.string,
};

export default CheckboxGroupsComponent;
