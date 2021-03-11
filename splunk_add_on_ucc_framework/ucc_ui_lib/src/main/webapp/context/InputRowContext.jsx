import React, { createContext, useState } from "react";

const InputRowContext = createContext({
    rowData: {},
    setRowData: () => { },
});

export const InputRowContextProvider = ({ children }) => {

    const [rowData, setRowData] = useState({});

    return (
        <InputRowContext.Provider value={{ rowData, setRowData }}>
            {children}
        </InputRowContext.Provider>
    );
}

export default InputRowContext;
