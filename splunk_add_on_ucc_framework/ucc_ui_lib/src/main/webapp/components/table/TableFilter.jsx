import React from 'react';
import Text from '@splunk/react-ui/Text';
import PropTypes from 'prop-types';

function TableFilter(props) {

    return (
        <>
            <Text
                appearance="search"
                placeholder="filter"
                onChange={props.handleChange}
            />
        </>
    )
}

TableFilter.propTypes = {
    handleChange: PropTypes.func
};

export default TableFilter;
