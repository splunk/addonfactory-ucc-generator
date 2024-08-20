import React from 'react';
import DL from '@splunk/react-ui/DefinitionList';
import Table from '@splunk/react-ui/Table';
import styled from 'styled-components';

import CustomTableControl from './CustomTableControl';
import { getUnifiedConfigs } from '../../util/util';
import { getExpansionRowData } from './TableExpansionRowData';

const TableCellWrapper = styled(Table.Cell)`
    border-top: none;
`;

export function getExpansionRow(colSpan, row, moreInfo) {
    const inputs = getUnifiedConfigs().pages?.inputs;

    const customRow = inputs?.table
        ? inputs.table.customRow
        : inputs.services.find((service) => service.name === row.serviceName).table?.customRow;

    console.log('row getExpansionRow', { row, moreInfo });

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
                            moreInfo,
                        })}
                    </>
                ) : (
                    <DL termWidth={250}>{getExpansionRowData(row, moreInfo)}</DL>
                )}
            </TableCellWrapper>
        </Table.Row>
    );
}
