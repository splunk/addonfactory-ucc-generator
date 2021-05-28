import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import Switch from '@splunk/react-ui/Switch';
import Table from '@splunk/react-ui/Table';
import ButtonGroup from '@splunk/react-ui/ButtonGroup';
import Tooltip from '@splunk/react-ui/Tooltip';
import Pencil from '@splunk/react-icons/Pencil';
import Clone from '@splunk/react-icons/Clone';
import Trash from '@splunk/react-icons/Trash';
import styled from 'styled-components';
import { _ } from '@splunk/ui-utils/i18n';

import CustomTableControl from './CustomTableControl';
import { ActionButtonComponent } from './CustomTableStyle';

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
        headerMapping,
        handleToggleActionClick,
        handleEditActionClick,
        handleCloneActionClick,
        handleDeleteActionClick,
    } = props;

    const getCustomCell = (customRow, header) => {
        return React.createElement(CustomTableControl, {
            serviceName: row.serviceName,
            field: header.field,
            row: customRow,
            fileName: header.customCell.src,
        });
    };

    const rowActionsPrimaryButton = useCallback(
        (selectedRow) => {
            return (
                <TableCellWrapper data-column="actions" key={selectedRow.id}>
                    <ButtonGroup>
                        <Tooltip content={_('Edit')}>
                            <ActionButtonComponent
                                appearance="flat"
                                icon={<Pencil screenReaderText={null} size={1} />}
                                onClick={() => handleEditActionClick(selectedRow)}
                                className="editBtn"
                            />
                        </Tooltip>
                        <Tooltip content={_('Clone')}>
                            <ActionButtonComponent
                                appearance="flat"
                                icon={<Clone screenReaderText={null} size={1} />}
                                onClick={() => handleCloneActionClick(selectedRow)}
                                className="cloneBtn"
                            />
                        </Tooltip>
                        <Tooltip content={_('Delete')}>
                            <ActionButtonComponent
                                appearance="destructive"
                                icon={<Trash screenReaderText={null} size={1} />}
                                onClick={() => handleDeleteActionClick(selectedRow)}
                                className="deleteBtn"
                            />
                        </Tooltip>
                    </ButtonGroup>
                </TableCellWrapper>
            );
        },
        [handleEditActionClick, handleCloneActionClick, handleDeleteActionClick]
    );

    let statusContent = 'Enabled';
    // eslint-disable-next-line no-underscore-dangle
    if (row.__toggleShowSpinner) {
        statusContent = <WaitSpinner />;
    } else if (row.disabled) {
        statusContent =
            headerMapping?.disabled && headerMapping.disabled[row.disabled]
                ? headerMapping.disabled[row.disabled]
                : 'Disabled';
    }

    // Fix set of props are passed to Table.Row element
    return (
        <>
            <Table.Row // nosemgrep: typescript.react.security.audit.react-props-injection.react-props-injection, typescript.react.best-practice.react-props-spreading.react-props-spreading
                key={row.id}
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
                                            disabled={row.__toggleShowSpinner}
                                            appearance="toggle"
                                            className="toggle_switch"
                                            selectedLabel={_(
                                                headerMapping?.disabled?.false
                                                    ? headerMapping.disabled.false
                                                    : 'Enabled'
                                            )}
                                            unselectedLabel={_(
                                                headerMapping?.disabled?.true
                                                    ? headerMapping.disabled.true
                                                    : 'Disabled'
                                            )}
                                        />
                                        <span data-test="status">{statusContent}</span>
                                    </SwitchWrapper>
                                </Table.Cell>
                            );
                        } else if (header.field === 'actions') {
                            cellHTML = rowActionsPrimaryButton(row);
                        } else {
                            cellHTML = (
                                <Table.Cell data-column={header.field} key={header.field}>
                                    {headerMapping[header.field] &&
                                    Object.prototype.hasOwnProperty.call(
                                        headerMapping[header.field],
                                        row[header.field]
                                    )
                                        ? headerMapping[header.field][row[header.field]]
                                        : row[header.field]}
                                </Table.Cell>
                            );
                        }
                        return cellHTML;
                    })}
            </Table.Row>
        </>
    );
}

CustomTableRow.propTypes = {
    row: PropTypes.any,
    columns: PropTypes.array,
    headerMapping: PropTypes.object,
    handleToggleActionClick: PropTypes.func,
    handleEditActionClick: PropTypes.func,
    handleCloneActionClick: PropTypes.func,
    handleDeleteActionClick: PropTypes.func,
};

export default React.memo(CustomTableRow);
