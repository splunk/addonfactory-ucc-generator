import React from 'react';
import PropTypes from 'prop-types';
import Select from '@splunk/react-ui/Select';

function SingleInputComponent(props) {
    const { field, disabled = false, value, controlOptions, ...restProps } = props;
    const { autoCompleteFields=[] } = controlOptions;

    function handleChange(e, { value }) {
        restProps.handleChange(field, value);
    }

    function generateOptions() {
        const data = [];
        autoCompleteFields.forEach((item) => {
            if (item.value && item.label) {
                data.push(<Select.Option label={item.label} value={item.value} key={item.value} />);
            }
            if (item.children && item.label) {
                data.push(<Select.Heading key={item.label}>{item.label}</Select.Heading>);
                item.children.forEach((child) => {
                    data.push(
                        <Select.Option label={child.label} value={child.value} key={child.value} />
                    );
                });
            }
        });
        return data;
    }

    return (
        <Select value={value} name={field} disabled={disabled} onChange={handleChange} style={{ "minWidth": "200px" }}>
            {generateOptions()}
        </Select>
    );
}

SingleInputComponent.propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    handleChange: PropTypes.func.isRequired,
    field: PropTypes.string,
    controlOptions: PropTypes.shape({
        autoCompleteFields: PropTypes.array.isRequired,
    }),
};

export default SingleInputComponent;
