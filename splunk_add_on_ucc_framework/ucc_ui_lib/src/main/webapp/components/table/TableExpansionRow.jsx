import React from 'react';
import DL from '@splunk/react-ui/DefinitionList';
import Table from '@splunk/react-ui/Table';
import { _ } from '@splunk/ui-utils/i18n';

function getExpansionRowData(row, moreInfo) {
    const DefinitionLists = [];
    if (moreInfo?.length) {
        moreInfo.map((val) => {
            const label = _(val.label);
            if (val.field in row) {
                DefinitionLists.push(<DL.Term>{label}</DL.Term>);
                DefinitionLists.push(
                    <DL.Description>
                        {val.mapping
                            ? val.mapping[row[val.field]]
                                ? val.mapping[row[val.field]]
                                : row[val.field]
                            : row[val.field]}
                    </DL.Description>
                );
            }
        });
    }
    return DefinitionLists;
}

export function getExpansionRow(colSpan, row, moreInfo) {
    return (
        <Table.Row key={`${row.id}-expansion`}>
            <Table.Cell style={{ borderTop: 'none' }} colSpan={colSpan}>
                <DL termWidth={250}>{getExpansionRowData(row, moreInfo)}</DL>
            </Table.Cell>
        </Table.Row>
    );
}
