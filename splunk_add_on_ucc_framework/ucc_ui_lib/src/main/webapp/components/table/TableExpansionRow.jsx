import React from 'react';
import DL from '@splunk/react-ui/DefinitionList';
import Table from '@splunk/react-ui/Table';
import { _ } from '@splunk/ui-utils/i18n';

function getExpansionRowData(row, moreInfo) {
    return (
        moreInfo &&
        moreInfo.length &&
        moreInfo.map((val) => {
            const label = _(val.label);
            return (
                <>
                    {row[val.field] && (
                        <>
                            <DL.Term>{label}</DL.Term>
                            <DL.Description>
                                {val.field === 'disabled'
                                    ? val.mapping[row[val.field]]
                                    : `${row[val.field]}`}
                            </DL.Description>
                        </>
                    )}
                </>
            );
        })
    );
}

export function getExpansionRow(colSpan, row, moreInfo) {
    return (
        <Table.Row key={`${row.id}-expansion`}>
            <Table.Cell style={{ borderTop: 'none' }} colSpan={colSpan}>
                <DL>{getExpansionRowData(row, moreInfo)}</DL>
            </Table.Cell>
        </Table.Row>
    );
}
