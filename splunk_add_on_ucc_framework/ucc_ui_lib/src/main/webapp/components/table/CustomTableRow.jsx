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
import { _ } from '@splunk/ui-utils/i18n';

import CustomTableControl from './CustomTableControl';
import { ActionButtonComponent } from './CustomTableStyle';

function CustomTableRow(props) {
    const {
        row,
        columns,
        statusMapping,
        handleToggleActionClick,
        handleEditActionClick,
        handleCloneActionClick,
        handleDeleteActionClick,
    } = props;

    const getCustomCell = (customRow, header) => {
        return React.createElement(CustomTableControl, {
            serviceName: row.serviceName,
            field: row.name,
            row: customRow,
            fileName: header.customCell.src,
        });
    };

    const rowActionsPrimaryButton = useCallback(
        (selectedRow) => {
            return (
                <Table.Cell key={selectedRow.id} style={{ padding: '2px' }}>
                    <ButtonGroup>
                        <Tooltip content={_('Edit')}>
                            <ActionButtonComponent
                                appearance="flat"
                                icon={<Pencil screenReaderText={null} size={1} />}
                                onClick={() => handleEditActionClick(selectedRow)}
                            />
                        </Tooltip>
                        <Tooltip content={_('Clone')}>
                            <ActionButtonComponent
                                appearance="flat"
                                icon={<Clone screenReaderText={null} size={1} />}
                                onClick={() => handleCloneActionClick(selectedRow)}
                            />
                        </Tooltip>
                        <Tooltip content={_('Delete')}>
                            <ActionButtonComponent
                                appearance="destructive"
                                icon={<Trash screenReaderText={null} size={1} />}
                                onClick={() => handleDeleteActionClick(selectedRow)}
                            />
                        </Tooltip>
                    </ButtonGroup>
                </Table.Cell>
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
            statusMapping[0] && statusMapping[0].mapping[row.disabled]
                ? statusMapping[0].mapping[row.disabled]
                : 'Disabled';
    }

    return (
        <>
            <Table.Row key={row.id} {...props}>
                {columns &&
                    columns.length &&
                    columns.map((header) => {
                        let cellHTML = '';

                        if (header.customCell && header.customCell.src) {
                            cellHTML = (
                                <Table.Cell key={header.field}>
                                    {getCustomCell(row, header)}
                                </Table.Cell>
                            );
                        } else if (header.field === 'disabled') {
                            cellHTML = (
                                <Table.Cell key={header.field}>
                                    <div style={{ display: 'flex' }}>
                                        <Switch
                                            key={row.name}
                                            value={row.disabled}
                                            onClick={() => handleToggleActionClick(row)}
                                            selected={!row.disabled}
                                            // eslint-disable-next-line no-underscore-dangle
                                            disabled={row.__toggleShowSpinner}
                                            appearance="toggle"
                                            style={{ padding: 0, marginRight: '10px' }}
                                            selectedLabel={_(
                                                statusMapping[0].mapping &&
                                                    statusMapping[0].mapping.false
                                                    ? statusMapping[0].mapping.false
                                                    : 'Enabled'
                                            )}
                                            unselectedLabel={_(
                                                statusMapping[0].mapping &&
                                                    statusMapping[0].mapping.true
                                                    ? statusMapping[0].mapping.true
                                                    : 'Disabled'
                                            )}
                                        />
                                        {statusContent}
                                    </div>
                                </Table.Cell>
                            );
                        } else if (header.field === 'actions') {
                            cellHTML = rowActionsPrimaryButton(row);
                        } else {
                            cellHTML = (
                                <Table.Cell key={header.field}>{row[header.field]}</Table.Cell>
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
    statusMapping: PropTypes.array,
    handleToggleActionClick: PropTypes.func,
    handleEditActionClick: PropTypes.func,
    handleCloneActionClick: PropTypes.func,
    handleDeleteActionClick: PropTypes.func,
};

export default React.memo(CustomTableRow);
