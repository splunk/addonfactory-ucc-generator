import React from 'react';
import PropTypes from 'prop-types';
import Search from '@splunk/react-ui/Search';
import { useTableContext } from '../../context/useTableContext';

function TableFilter(props) {
    const { searchText } = useTableContext();

    return <Search onChange={props.handleChange} value={searchText} />;
}

TableFilter.propTypes = {
    handleChange: PropTypes.func,
};

export default TableFilter;
