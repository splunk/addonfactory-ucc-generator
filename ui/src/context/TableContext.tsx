import React, { createContext, ReactNode, useState } from 'react';
import PropTypes from 'prop-types';
import { AcceptableFormRecord } from '../types/components/shareableTypes';

export type RowDataFields = {
    name: string;
    serviceName: string;
    disabled?: boolean;
    id?: string;
    index?: string;
} & AcceptableFormRecord;

// serviceName > specificRowName > dataForRow
export type RowDataType = Record<string, Record<string, RowDataFields>>;

export type TableContextProviderType = {
    rowData: RowDataType;
    setRowData: React.Dispatch<React.SetStateAction<RowDataType>>;
    searchText: string;
    setSearchText: React.Dispatch<React.SetStateAction<string>>;
    searchType: string;
    setSearchType: React.Dispatch<React.SetStateAction<string>>;
    pageSize: number;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
};

const TableContext = createContext<TableContextProviderType | null>(null);

export function TableContextProvider({ children }: { children: ReactNode }) {
    const [rowData, setRowData] = useState<TableContextProviderType['rowData']>({});
    const [searchText, setSearchText] = useState<string>('');
    const [searchType, setSearchType] = useState<string>('all');
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(0);

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
}

TableContextProvider.propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default TableContext;
