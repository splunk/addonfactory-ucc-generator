import React from 'react';
import DL from '@splunk/react-ui/DefinitionList';
import Table from '@splunk/react-ui/Table';
import { _ } from '@splunk/ui-utils/i18n';

import { getUnifiedConfigs } from '../../util/util';

function getExpansionRowData(row) {
    const unifiedConfigs = getUnifiedConfigs();
    let moreInfo = unifiedConfigs.pages.inputs.table.moreInfo;
    return (
        moreInfo &&
        moreInfo.length &&
        moreInfo.map((val) => {
            const label = _(val.label);
            return (
                <>
                    {(row[val.field] || val.label == 'Status') && (
                        <>
                            <DL.Term>{label}</DL.Term>
                            <DL.Description>
                                {val.label == 'Status'
                                    ? row[val.field]
                                        ? 'Disabled'
                                        : 'Enabled'
                                    : `${row[val.field]}`}
                            </DL.Description>
                        </>
                    )}
                </>
            );
        })
    );
}

export function getExpansionRow(colSpan, row) {
    return (
        <Table.Row key={`${row.id}-expansion`}>
            <Table.Cell style={{ borderTop: 'none' }} colSpan={colSpan}>
                <DL>{getExpansionRowData(row)}</DL>
            </Table.Cell>
        </Table.Row>
    );
}
