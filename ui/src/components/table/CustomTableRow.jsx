import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import Switch from '@splunk/react-ui/Switch';
import Table from '@splunk/react-ui/Table';
import ButtonGroup from '@splunk/react-ui/ButtonGroup';
import Tooltip from '@splunk/react-ui/Tooltip';
import Pencil from '@splunk/react-icons/Pencil';
import Magnifier from '@splunk/react-icons/Magnifier';
import Clone from '@splunk/react-icons/enterprise/Clone';
import Trash from '@splunk/react-icons/enterprise/Trash';
import styled from 'styled-components';
import { _ } from '@splunk/ui-utils/i18n';

import CustomTableControl from './CustomTableControl';
import { ActionButtonComponent } from './CustomTableStyle';
import { getTableCellValue } from './table.utils';

const TableCellWrapper = styled(Table.Cell)`
    padding: 2px;
`;

const SwitchWrapper = styled.div`
    display: flex;

    .toggle_switch {
        padding: 0;
        margin-right: 10px;
    }
`;

function CustomTableRow(props) {
    const {
        row,
        columns,
        rowActions,
        headerMapping,
        handleToggleActionClick,
        handleEditActionClick,
        handleCloneActionClick,
        handleDeleteActionClick,
    } = props;

    const getCustomCell = (customRow, header) =>
        React.createElement(CustomTableControl, {
            serviceName: row.serviceName,
            field: header.field,
            row: customRow,
            fileName: header.customCell.src,
            type: header.customCell.type,
        });

    const rowActionsPrimaryButton = useCallback(
        (selectedRow, header) => (
            <TableCellWrapper data-column="actions" key={header.field}>
                <ButtonGroup>
                    {!props.readonly && rowActions.includes('edit') && (
                        <Tooltip content={_('Edit')}>
                            <ActionButtonComponent
                                appearance="flat"
                                icon={<Pencil screenReaderText={null} size={1} />}
                                onClick={() => handleEditActionClick(selectedRow)}
                                className="editBtn"
                            />
                        </Tooltip>
                    )}
                    {rowActions.includes('clone') && (
                        <Tooltip content={_('Clone')}>
                            <ActionButtonComponent
                                appearance="flat"
                                icon={<Clone screenReaderText={null} size={1} />}
                                onClick={() => handleCloneActionClick(selectedRow)}
                                className="cloneBtn"
                            />
                        </Tooltip>
                    )}
                    {rowActions.includes('search') && (
                        <Tooltip
                            content={_(
                                `Go to search for events associated with ${selectedRow.name}`
                            )}
                        >
                            <ActionButtonComponent
                                appearance="flat"
                                icon={<Magnifier screenReaderText={null} size={1} />}
                                to={`/app/search/search?q=search%20index%3D_internal%20source%3D*${selectedRow.name}*`}
                                className="searchBtn"
                                inline={false}
                                target="_blank"
                            />
                        </Tooltip>
                    )}
                    {!props.readonly && rowActions.includes('delete') && (
                        <Tooltip content={_('Delete')}>
                            <ActionButtonComponent
                                appearance="flat"
                                icon={<Trash screenReaderText={null} size={1} />}
                                onClick={() => handleDeleteActionClick(selectedRow)}
                                className="deleteBtn"
                            />
                        </Tooltip>
                    )}
                </ButtonGroup>
            </TableCellWrapper>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [handleEditActionClick, handleCloneActionClick, handleDeleteActionClick]
    );

    let statusContent = 'Active';
    // eslint-disable-next-line no-underscore-dangle
    if (row.__toggleShowSpinner) {
        statusContent = <WaitSpinner />;
    } else if (row.disabled) {
        statusContent =
            headerMapping?.disabled && headerMapping.disabled[row.disabled]
                ? headerMapping.disabled[row.disabled]
                : 'Inactive';
    }

    // Fix set of props are passed to Table.Row element
    return (
        <Table.Row // nosemgrep: typescript.react.security.audit.react-props-injection.react-props-injection, typescript.react.best-practice.react-props-spreading.react-props-spreading
            key={row.name || row.id}
            {...props}
        >
            {columns &&
                columns.length &&
                columns.map((header) => {
                    let cellHTML = '';
                    if (header.customCell && header.customCell.src) {
                        cellHTML = (
                            <Table.Cell data-column={header.field} key={header.field}>
                                {getCustomCell(row, header)}
                            </Table.Cell>
                        );
                    } else if (header.field === 'disabled') {
                        cellHTML = (
                            <Table.Cell data-column={header.field} key={header.field}>
                                <SwitchWrapper>
                                    <Switch
                                        key={row.name}
                                        value={row.disabled}
                                        onClick={() => handleToggleActionClick(row)}
                                        selected={!row.disabled}
                                        // eslint-disable-next-line no-underscore-dangle
                                        disabled={row.__toggleShowSpinner || props.readonly}
                                        appearance="toggle"
                                        className="toggle_switch"
                                        selectedLabel={_(
                                            headerMapping?.disabled?.false
                                                ? headerMapping.disabled.false
                                                : 'Active'
                                        )}
                                        unselectedLabel={_(
                                            headerMapping?.disabled?.true
                                                ? headerMapping.disabled.true
                                                : 'Inactive'
                                        )}
                                    />
                                    <span data-test="status">{statusContent}</span>
                                </SwitchWrapper>
                            </Table.Cell>
                        );
                    } else if (header.field === 'actions') {
                        cellHTML = rowActionsPrimaryButton(row, header);
                    } else {
                        cellHTML = (
                            <Table.Cell
                                style={{ wordBreak: 'break-word' }}
                                data-column={header.field}
                                key={header.field}
                            >
                                {getTableCellValue(row, header.field, headerMapping[header.field])}
                            </Table.Cell>
                        );
                    }
                    return cellHTML;
                })}
        </Table.Row>
    );
}

CustomTableRow.propTypes = {
    row: PropTypes.any,
    readonly: PropTypes.bool,
    columns: PropTypes.array,
    rowActions: PropTypes.array,
    headerMapping: PropTypes.object,
    handleToggleActionClick: PropTypes.func,
    handleEditActionClick: PropTypes.func,
    handleCloneActionClick: PropTypes.func,
    handleDeleteActionClick: PropTypes.func,
};

export default React.memo(CustomTableRow);
