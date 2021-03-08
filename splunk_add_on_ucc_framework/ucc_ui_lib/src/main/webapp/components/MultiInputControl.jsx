import React from 'react';
import PropTypes from 'prop-types';
import Multiselect from '@splunk/react-ui/Multiselect';

function MultiInputControl(props) {
    const { id, field, disabled = false, value, controlOptions, ...restProps } = props;
    const { items, placeholder, createSearchChoice, delimiter = ',' } = controlOptions;

    function handleChange(e, { values }) {
        restProps.handleChange(id, values.join(delimiter));
    }

    const valueList = value ? value.split(delimiter) : [];

    return (
        <Multiselect
            values={valueList}
            name={field}
            placeholder={placeholder}
            disabled={disabled}
            allowNewValues={createSearchChoice}
            onChange={handleChange}
        >
            {items.map((item) => (
                <Multiselect.Option label={item.label} value={item.value} key={item.value} />
            ))}
        </Multiselect>
    );
}

MultiInputControl.propTypes = {
    id: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    handleChange: PropTypes.func.isRequired,
    field: PropTypes.string,
    controlOptions: PropTypes.shape({
        delimiter: PropTypes.string,
        placeholder: PropTypes.string,
        createSearchChoice: PropTypes.bool,
        items: PropTypes.arrayOf(
            PropTypes.shape({
                label: PropTypes.string.isRequired,
                value: PropTypes.string.isRequired,
            })
        ).isRequired,
    }),
};

export default MultiInputControl;
