import React from 'react';
import DL from '@splunk/react-ui/DefinitionList';
import Table from '@splunk/react-ui/Table';
import styled from 'styled-components';

import CustomTableControl from './CustomTableControl';
import { getExpansionRowData } from './TableExpansionRowData';

const TableCellWrapper = styled(Table.Cell)`
    border-top: none;
`;
export function getExpansionRow(colSpan, row, moreInfo, customRow, customComponentContext) {
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
                            customComponentContext,
                        })}
                    </>
                ) : (
                    <DL termWidth={250}>{getExpansionRowData(row, moreInfo)}</DL>
                )}
            </TableCellWrapper>
        </Table.Row>
    );
}
