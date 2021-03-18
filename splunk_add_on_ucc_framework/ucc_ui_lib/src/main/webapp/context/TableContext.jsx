import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const TableContext = createContext({
    rowData: {},
    setRowData: () => {},
});

export const TableContextProvider = ({ children }) => {
    const [rowData, setRowData] = useState({});
    const [searchText, setSearchText] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    return (
        <TableContext.Provider
            value={{
                rowData,
                setRowData,
                searchText,
                setSearchText,
                searchType,
                setSearchType,
                pageSize,
                setPageSize,
                currentPage,
                setCurrentPage,
            }}
        >
            {children}
        </TableContext.Provider>
    );
};

TableContextProvider.propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default TableContext;
