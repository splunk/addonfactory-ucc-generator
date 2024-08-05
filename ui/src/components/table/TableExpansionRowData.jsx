import React from 'react';
import DL from '@splunk/react-ui/DefinitionList';
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
    return (
        moreInfo?.reduce((definitionLists, val) => {
            const label = _(val.label);
            const cellValue = getTableCellValue(row, val.field, val.mapping);
            // Remove extra rows which are empty in moreInfo and default value is not provided
            if (cellValue) {
                definitionLists.push(<DL.Term termWidth={250}>{label}</DL.Term>);
                definitionLists.push(<DL.Description termWidth={250}>{cellValue}</DL.Description>);
            }
            return definitionLists;
        }, []) || []
    );
}
