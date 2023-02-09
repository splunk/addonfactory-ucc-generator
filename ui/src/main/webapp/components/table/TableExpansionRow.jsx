import React from 'react';
import DL from '@splunk/react-ui/DefinitionList';
import Table from '@splunk/react-ui/Table';
import styled from 'styled-components';
import { _ } from '@splunk/ui-utils/i18n';

import CustomTableControl from './CustomTableControl';
import { getUnifiedConfigs } from '../../util/util';

const TableCellWrapper = styled(Table.Cell)`
    border-top: none;
`;

function getExpansionRowData(row, moreInfo) {
    const DefinitionLists = [];

    if (moreInfo?.length) {
        moreInfo.forEach((val) => {
            const label = _(val.label);
            // remove extra rows which are empty in moreInfo
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

export function getExpansionRow(colSpan, row, moreInfo) {
    const inputs = getUnifiedConfigs().pages?.inputs;

    const customRow = inputs?.table
        ? inputs.table.customRow
        : inputs.services.find((service) => service.name === row.serviceName).table?.customRow;

    return (
        <Table.Row key={`${row.id}-expansion`} style={{ wordBreak: 'break-word' }}>
            <TableCellWrapper colSpan={colSpan}>
                {customRow && customRow.src ? (
                    <>
                        {React.createElement(CustomTableControl, {
                            serviceName: row.serviceName,
                            row,
                            fileName: customRow.src,
                            type: customRow.type,
                        })}
                    </>
                ) : (
                    <DL termWidth={250}>{getExpansionRowData(row, moreInfo)}</DL>
                )}
            </TableCellWrapper>
        </Table.Row>
    );
}
