import React, { useState } from 'react';
import Table from '@splunk/react-ui/Table';
import Switch from '@splunk/react-ui/Switch';
import ButtonGroup from '@splunk/react-ui/ButtonGroup';
import Pencil from '@splunk/react-icons/Pencil';
import Clone from '@splunk/react-icons/Clone';
import Trash from '@splunk/react-icons/Trash';
import Tooltip from '@splunk/react-ui/Tooltip';
import { _ } from '@splunk/ui-utils/i18n';
import PropTypes from 'prop-types';

import { ActionButtonComponent } from './CustomTableStyle';
import { getUnifiedConfigs } from '../../util/util';
import { getExpansionRow } from './TableExpansionRow';

function CustomTable({ isInput, serviceName, data, handleToggleActionClick }) {

    const [sortKey, setSortKey] = useState('name');
    const [sortDir, setSortDir] = useState('asc');

    const generateColumns = () => {
        const unifiedConfigs = getUnifiedConfigs();
        const column = [];
        if (isInput) {
            const headers = unifiedConfigs.pages.inputs.table.header;
            if (headers && headers.length) {
                headers.forEach((header) => {
                    column.push({
                        ...header,
                        sortKey: header.field || null
                    });
                });
            }
            column.push({ label: 'Actions', field: 'actions', sortKey: '' });
            return column;
        }
    }

    const [columns, setColumns] = useState(() => generateColumns());

    const handleSort = (e, val) => {
        const prevSortKey = sortKey;
        const prevSortDir = prevSortKey === val.sortKey ? sortDir : 'none';
        const nextSortDir = prevSortDir === 'asc' ? 'desc' : 'asc';
        setSortDir(nextSortDir);
        setSortKey(val.sortKey);
    };

    const getTableHeaders = () => {
        return (
            <Table.Head>
                {columns && columns.length && columns.map((headData) => (
                    <Table.HeadCell
                        key={headData.field}
                        onSort={headData.sortKey ? handleSort : null}
                        sortKey={headData.sortKey ? headData.sortKey : null}
                        sortDir={headData.sortKey && headData.sortKey === sortKey ? sortDir : 'none'}
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
                        <ActionButtonComponent
                            appearance="flat"
                            icon={<Pencil screenReaderText={null} size={1} />}
                            onClick={() => handleEditActionClick(row)}
                        />
                    </Tooltip>
                    <Tooltip
                        content={_('Clone')}
                    >
                        <ActionButtonComponent
                            appearance="flat"
                            icon={<Clone screenReaderText={null} size={1} />}
                            onClick={() => handleCloneActionClick(row)}
                        />
                    </Tooltip>
                    <Tooltip
                        content={_('Delete')}
                    >
                        <ActionButtonComponent
                            appearance="destructive"
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
                {columns && columns.length && columns.map((header) => {
                    if (header.field === "disabled") {
                        return (
                            <Table.Cell key={header.field}>
                                <Switch
                                    key={row.name}
                                    value={row.disabled}
                                    onClick={() => handleToggleActionClick(row)}
                                    selected={!row.disabled}
                                    appearance="toggle"
                                >
                                    {row.disabled ? "Disabled" : "Enabled"}
                                </Switch>
                            </Table.Cell>
                        )
                    }
                    
                    if (header.field === "actions") {
                        return rowActionsPrimaryButton(row);
                    } 
                    
                    return (
                        <Table.Cell key={header.field}>
                            {row[header.field]}
                        </Table.Cell>
                    )
                    
                })}
            </Table.Row>
        );
    }

    const getTableBody = () => {
        return (
            <Table.Body>
                {data && data.length && data
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
            { columns && columns.length &&
                <Table key={columns.length} stripeRows rowExpansion="single">
                    {getTableHeaders()}
                    {getTableBody()}
                </Table>
            }
        </>
    );
}

CustomTable.propTypes = {
    isInput: PropTypes.bool,
    serviceName: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    handleToggleActionClick: PropTypes.func
};

export default CustomTable;
