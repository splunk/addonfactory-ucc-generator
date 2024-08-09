import { useState, useCallback } from 'react';
import { HeadCellSortHandler } from '@splunk/react-ui/Table';

export type SortDirection = 'asc' | 'desc' | 'none';

export interface UseTableSortResult {
    sortKey: string;
    sortDir: SortDirection;
    handleSort: HeadCellSortHandler;
}

export const useTableSort = (initialSortKey: string = 'name'): UseTableSortResult => {
    const [sortKey, setSortKey] = useState<string>(initialSortKey);
    const [sortDir, setSortDir] = useState<SortDirection>('asc');

    const handleSort: HeadCellSortHandler = useCallback(
        (e, val) => {
            const prevSortKey = sortKey;
            const prevSortDir = prevSortKey === val.sortKey ? sortDir : 'none';
            const nextSortDir = prevSortDir === 'asc' ? 'desc' : 'asc';
            setSortDir(nextSortDir);
            if (val.sortKey) {
                setSortKey(val.sortKey);
            }
        },
        [sortKey, sortDir]
    );

    return { sortKey, sortDir, handleSort };
};
