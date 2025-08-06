import React from 'react';
import DL, { Term as DT, Description as DD } from '@splunk/react-ui/DefinitionList';
import { _ } from '@splunk/ui-utils/i18n';

import { getTableCellValue } from './table.utils';

/**
 * Generates the definition list rows for the expansion view based on the provided row data and moreInfo configuration.
 *
 * @param {Object} row - The data object containing the row information.
 * @param {Array} moreInfo - An array of objects containing configuration for each field to display.
 * @returns {Array} - An array of React elements representing the definition list rows.
 */
export function getExpansionRowData(row, moreInfo) {
    const definitionLists =
        moreInfo?.reduce((definitionList, val) => {
            const label = _(val.label);
            const cellValue = getTableCellValue(row, val.field, val.mapping);

            // Remove extra rows which are empty in moreInfo and default value is not provided
            if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
                definitionList.push(<DT key={val.field}>{label}</DT>);
                definitionList.push(<DD key={`${val.field}_decr`}>{String(cellValue)}</DD>);
            }

            return definitionList;
        }, []) || [];

    return <DL>{definitionLists}</DL>;
}
