import { useContext } from 'react';
import TableContext from './TableContext';

export function useTableContext() {
    const tableContext = useContext(TableContext);
    if (!tableContext) {
        throw new Error('useTableContext must be used within <TableContextProvider />');
    }
    return tableContext;
}
