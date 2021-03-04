import React, { useState, useEffect } from 'react';
import DL from '@splunk/react-ui/DefinitionList';
import Table from '@splunk/react-ui/Table';
import Switch from '@splunk/react-ui/Switch';
import ButtonGroup from '@splunk/react-ui/ButtonGroup';
import Pencil from '@splunk/react-icons/Pencil';
import Clone from '@splunk/react-icons/Clone';
import Trash from '@splunk/react-icons/Trash';
import Tooltip from '@splunk/react-ui/Tooltip';
import { _ } from '@splunk/ui-utils/i18n';
import { ButtonComponent, TitleComponent, SubTitleComponent, TableCaptionComponent } from './InputTableStyle';

function getExpansionRow(colSpan, row) {
    return (
        <Table.Row key={`${row.email}-expansion`}>
            <Table.Cell style={{ borderTop: 'none' }} colSpan={colSpan}>
                <DL>
                    <DL.Term>Name</DL.Term>
                    <DL.Description>{row.name}</DL.Description>
                    <DL.Term>Interval</DL.Term>
                    <DL.Description>{row.interval}</DL.Description>
                    <DL.Term>Index</DL.Term>
                    <DL.Description>{row.index}</DL.Description>
                    <DL.Term>Status</DL.Term>
                    <DL.Description>{String(row.status) ? "Enabled": "Disabled"}</DL.Description>
                    <DL.Term>Object</DL.Term>
                    <DL.Description>{row.object}</DL.Description>
                    <DL.Term>Object Fields</DL.Term>
                    <DL.Description>{row.object_fields}</DL.Description>
                    <DL.Term>Order By</DL.Term>
                    <DL.Description>{row.order_by}</DL.Description>
                    <DL.Term>Limit</DL.Term>
                    <DL.Description>{row.limit}</DL.Description>
                </DL>
            </Table.Cell>
        </Table.Row>
    );
}

function InputTable({ data, columns, handleToggleActionClick }) {

    const [sortKey, setSortKey] = useState('name');
    const [sortDir, setSortDir] = useState('asc');

    const handleSort = (e, val) => {
        const prevSortKey = sortKey;
        const prevSortDir = prevSortKey === val.sortKey ? sortDir : 'none';
        const nextSortDir = prevSortDir === 'asc' ? 'desc' : 'asc';
        setSortDir(nextSortDir);
        setSortKey(val.sortKey);
    };

    const modifyRowData = () => {
        let rows = []
        data && data.length && data.forEach((entry) => {
            let row = {
                "id": entry.id,
                "name": entry.name,
                "account": entry.content.account,
                "interval": entry.content.interval,
                "index": entry.content.index,
                "status": entry.content.disabled,
                "object": entry.content.object,
                "object_fields": entry.content.object_fields,
                "order_by": entry.content.order_by,
                "limit": entry.content.limit,
            }
            rows.push(row)
        });
        return rows;
    }

    const getTableHeaders = () => {
        return (
            <Table.Head>
                {columns && columns.length && columns.map((headData) => (
                    headData.visible && <Table.HeadCell
                        key={headData.key}
                        onSort={headData.sortKey ? handleSort: null}
                        sortKey={headData.sortKey ? headData.sortKey: null}
                        sortDir={headData.sortKey ? headData.sortKey === sortKey ? sortDir : 'none': null}
                    >
                        {headData.label}
                    </Table.HeadCell>
                ))}
            </Table.Head>
        )
    }

    const handleEditActionClick = () => {

    }

    const handleCloneActionClick = () => {

    }

    const handleDeleteActionClick = () => {

    }

    const rowActionsPrimaryButton = (row) => {
        return (
            <Table.Cell key={row.id}>
                <ButtonGroup>
                    <Tooltip
                        content={_('Edit')}
                    >
                        <ButtonComponent
                            appearance="primary"
                            icon={<Pencil screenReaderText={null} size={1} />}
                            onClick={() => handleEditActionClick(row)}
                        />
                    </Tooltip>
                    <Tooltip
                        content={_('Clone')}
                    >
                        <ButtonComponent
                            appearance="primary"
                            icon={<Clone screenReaderText={null} size={1} />}
                            onClick={() => handleCloneActionClick(row)}
                        />
                    </Tooltip>
                    <Tooltip
                        content={_('Delete')}
                    >
                        <ButtonComponent
                            appearance="primary"
                            icon={<Trash screenReaderText={null} size={1} />}
                            onClick={() => handleDeleteActionClick(row)}
                        />
                    </Tooltip>
                </ButtonGroup>
            </Table.Cell>
        )
    }

    const getTableRow = (row) => {
        return (
            <Table.Row 
                key={row.id} 
                expansionRow={getExpansionRow(columns.length, row)}
            >
                {columns && columns.length && columns.map(
                    (header) => {
                        if(header.visible) {
                            if(header.key === "status") {
                                return (
                                    <Table.Cell key={header.key}>
                                        <Switch
                                            key={row.name}
                                            value={row.status}
                                            onClick={() => handleToggleActionClick(row)}
                                            selected={!row.status}
                                            appearance="toggle"
                                        >
                                            { row.status ? "Disabled": "Enabled"}
                                        </Switch>
                                    </Table.Cell>
                                )
                            } else if (header.key == "actions") {
                                return rowActionsPrimaryButton(row);
                            } else {
                                return (
                                    <Table.Cell key={header.key}>
                                        {row[header.key]}
                                    </Table.Cell>
                                )
                            }
                        }
                    }
                )}
            </Table.Row>
        );
    }

    const getTableBody = () => {
        const rows = modifyRowData();
        return (
            <Table.Body key={rows}>
                {rows && rows.length && rows
                    .sort((rowA, rowB) => {
                        if (sortDir === 'asc') {
                            return rowA[sortKey] > rowB[sortKey] ? 1 : -1;
                        }
                        if (sortDir === 'desc') {
                            return rowB[sortKey] > rowA[sortKey] ? 1 : -1;
                        }
                        return 0;
                    })
                    .map((row) => (
                        getTableRow(row)
                    ))
                }
            </Table.Body>
        );
    }

    return (
        <>
            <TitleComponent>Inputs</TitleComponent>
            <SubTitleComponent>Manage your data inputs</SubTitleComponent>
            <hr />
            { data &&
                <>
                    <TableCaptionComponent>
                        <div className="table-caption-inner">
                            {data.length} Input {data.legnth > 1 && <span>s</span>}
                        </div>
                    </TableCaptionComponent>
                    <Table stripeRows rowExpansion="single">
                        {getTableHeaders()}
                        {getTableBody()}
                    </Table>
                </>
            }
        </>
    );
}

export default InputTable;
