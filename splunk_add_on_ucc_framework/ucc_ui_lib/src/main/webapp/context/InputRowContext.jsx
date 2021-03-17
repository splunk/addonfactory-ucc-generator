import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const InputRowContext = createContext({
    rowData: {},
    setRowData: () => {},
});

export const InputRowContextProvider = ({ children }) => {
    const [rowData, setRowData] = useState({});

    return (
        <InputRowContext.Provider value={{ rowData, setRowData }}>
            {children}
        </InputRowContext.Provider>
    );
};

InputRowContextProvider.propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default InputRowContext;
