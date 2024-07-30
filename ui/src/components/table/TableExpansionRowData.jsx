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
    return (
        moreInfo?.reduce((definitionLists, val) => {
            const label = _(val.label);
            const isNotEmpty = val.field in row && row[val.field] !== null && row[val.field] !== '';

            // Remove extra rows which are empty in moreInfo and default value is not provided
            if (val.mapping?.['[[default]]'] || isNotEmpty) {
                definitionLists.push(
                    <React.Fragment key={`DL-${val.field}`}>
                        <DL.Term>{label}</DL.Term>
                        <DL.Description>
                            {val.mapping?.[isNotEmpty ? row[val.field] : '[[default]]'] ||
                                String(row[val.field])}
                        </DL.Description>
                    </React.Fragment>
                );
            }
            return definitionLists;
        }, []) || []
    );
}
