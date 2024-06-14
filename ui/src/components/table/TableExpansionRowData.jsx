import React from 'react';
import DL from '@splunk/react-ui/DefinitionList';
import { _ } from '@splunk/ui-utils/i18n';

/**
 * Generates the definition list rows for the expansion view based on the provided row data and moreInfo configuration.
 *
 * @param {Object} row - The data object containing the row information.
 * @param {Array} moreInfo - An array of objects containing configuration for each field to display.
 * @returns {Array} - An array of React elements representing the definition list rows.
 */
export function getExpansionRowData(row, moreInfo) {
    const DefinitionLists = [];

    if (moreInfo?.length) {
        moreInfo.forEach((val) => {
            const label = _(val.label);
            // Remove extra rows which are empty in moreInfo
            if (val.field in row && row[val.field] !== null && row[val.field] !== '') {
                DefinitionLists.push(<DL.Term key={val.field}>{label}</DL.Term>);
                DefinitionLists.push(
                    <DL.Description key={`${val.field}_decr`}>
                        {val.mapping && val.mapping[row[val.field]]
                            ? val.mapping[row[val.field]]
                            : String(row[val.field])}
                    </DL.Description>
                );
            }
        });
    }
    return DefinitionLists;
}
