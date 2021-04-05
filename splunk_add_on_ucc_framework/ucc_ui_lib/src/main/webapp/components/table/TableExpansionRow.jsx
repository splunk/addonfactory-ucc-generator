import React from 'react';
import DL from '@splunk/react-ui/DefinitionList';
import Table from '@splunk/react-ui/Table';
import { _ } from '@splunk/ui-utils/i18n';

import CustomTableControl from './CustomTableControl';
import { getUnifiedConfigs } from '../../util/util';

function getExpansionRowData(row, moreInfo) {
    const DefinitionLists = [];

    if (moreInfo?.length) {
        moreInfo.forEach((val) => {
            const label = _(val.label);
            if (val.field in row) {
                DefinitionLists.push(<DL.Term key={val.field}>{label}</DL.Term>);
                DefinitionLists.push(
                    <DL.Description key={`${val.field}_decr`}>
                        {val.mapping && val.mapping[row[val.field]]
                            ? val.mapping[row[val.field]]
                            : row[val.field]}
                    </DL.Description>
                );
            }
        });
    }
    return DefinitionLists;
}

export function getExpansionRow(colSpan, row, moreInfo) {
    const { customRow } = getUnifiedConfigs().pages.inputs.table;

    return (
        <Table.Row key={`${row.id}-expansion`}>
            <Table.Cell style={{ borderTop: 'none' }} colSpan={colSpan}>
                {customRow && customRow.src ? (
                    <>
                        {React.createElement(CustomTableControl, {
                            serviceName: row.serviceName,
                            row,
                            fileName: customRow.src,
                        })}
                    </>
                ) : (
                    <DL termWidth={250}>{getExpansionRowData(row, moreInfo)}</DL>
                )}
            </Table.Cell>
        </Table.Row>
    );
}
