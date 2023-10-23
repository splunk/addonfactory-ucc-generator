import React, { useContext } from 'react';
import Text from '@splunk/react-ui/Text';
import PropTypes from 'prop-types';
import TableContext from '../../context/TableContext';

function TableFilter(props) {
    const { searchText } = useContext(TableContext);

    return <Text appearance="search" onChange={props.handleChange} value={searchText} />;
}

TableFilter.propTypes = {
    handleChange: PropTypes.func,
};

export default TableFilter;
