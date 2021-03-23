import React, { useState, memo } from 'react';
import Table from '@splunk/react-ui/Table';
import Switch from '@splunk/react-ui/Switch';
import ButtonGroup from '@splunk/react-ui/ButtonGroup';
import Pencil from '@splunk/react-icons/Pencil';
import Clone from '@splunk/react-icons/Clone';
import Trash from '@splunk/react-icons/Trash';
import Tooltip from '@splunk/react-ui/Tooltip';
import { _ } from '@splunk/ui-utils/i18n';
import PropTypes from 'prop-types';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';

import { MODE_CLONE, MODE_EDIT } from '../../constants/modes';
import { ActionButtonComponent } from './CustomTableStyle';
import { getUnifiedConfigs } from '../../util/util';
import { getExpansionRow } from './TableExpansionRow';
import EntityModal from '../EntityModal';
import DeleteModal from '../DeleteModal';
import CustomCell from '../CustomCell';

function CustomTable({
    page,
    serviceName,
    data,
    handleToggleActionClick,
    handleSort,
    sortDir,
    sortKey,
}) {
    const [entityModal, setEntityModal] = useState({ open: false });
    const [deleteModal, setDeleteModal] = useState({ open: false });

    const unifiedConfigs = getUnifiedConfigs();
    const tableConfig =
        page === 'inputs'
            ? unifiedConfigs.pages.inputs.table
            : unifiedConfigs.pages.configuration.tabs.filter((x) => x.name === serviceName)[0]
                  .table;
    const { moreInfo } = tableConfig;
    const headers = tableConfig.header;
    // TODO: add multi field mapping support
    const statusMapping = moreInfo?.filter((a) => a.mapping);

    const generateColumns = () => {
        const column = [];
        if (headers && headers.length) {
            headers.forEach((header) => {
                column.push({
                    ...header,
                    sortKey: header.field || null,
                });
            });
        }
        column.push({ label: 'Actions', field: 'actions', sortKey: '' });
        return column;
    };

    const handleEntityClose = () => {
        setEntityModal({ ...entityModal, open: false });
    };

    const handleDeleteClose = () => {
        setDeleteModal({ ...deleteModal, open: false });
    };

    const generateModalDialog = () => {
        if (entityModal.open) {
            let label;
            if (page === 'inputs') {
                const { services } = unifiedConfigs.pages?.inputs;
                label =
                    services[services.findIndex((x) => x.name === entityModal.serviceName)]?.title;
            } else {
                const { tabs } = unifiedConfigs.pages?.configuration;
                label = tabs[tabs.findIndex((x) => x.name === entityModal.serviceName)]?.title;
            }
            return (
                <EntityModal
                    page={page}
                    open={entityModal.open}
                    handleRequestClose={handleEntityClose}
                    serviceName={entityModal.serviceName}
                    stanzaName={entityModal.stanzaName}
                    mode={entityModal.mode}
                    formLabel={
                        entityModal.mode === MODE_CLONE ? _(`Clone `) + label : _(`Update `) + label
                    }
                />
            );
        }
        return null;
    };

    const generateDeleteDialog = () => {
        if (deleteModal.open) {
            return (
                <DeleteModal
                    isInput
                    open={deleteModal.open}
                    handleRequestClose={handleDeleteClose}
                    serviceName={deleteModal.serviceName}
                    stanzaName={deleteModal.stanzaName}
                />
            );
        }
        return null;
    };

    const columns = generateColumns();

    const getTableHeaders = () => {
        return (
            <Table.Head>
                {columns &&
                    columns.length &&
                    columns.map((headData) => (
                        <Table.HeadCell
                            key={headData.field}
                            onSort={headData.sortKey ? handleSort : null}
                            sortKey={headData.sortKey ? headData.sortKey : null}
                            sortDir={
                                headData.sortKey && headData.sortKey === sortKey ? sortDir : 'none'
                            }
                        >
                            {headData.label}
                        </Table.HeadCell>
                    ))}
            </Table.Head>
        );
    };

    const handleEditActionClick = (row) => {
        setEntityModal({
            ...entityModal,
            open: true,
            serviceName: row.serviceName,
            stanzaName: row.name,
            mode: MODE_EDIT,
        });
    };

    const handleCloneActionClick = (row) => {
        setEntityModal({
            ...entityModal,
            open: true,
            serviceName: row.serviceName,
            stanzaName: row.name,
            mode: MODE_CLONE,
        });
    };

    const handleDeleteActionClick = (row) => {
        setDeleteModal({
            ...deleteModal,
            open: true,
            stanzaName: row.name,
            serviceName: row.serviceName,
        });
    };

    const rowActionsPrimaryButton = (row) => {
        return (
            <Table.Cell key={row.id} style={{ padding: '2px' }}>
                <ButtonGroup>
                    <Tooltip content={_('Edit')}>
                        <ActionButtonComponent
                            appearance="flat"
                            icon={<Pencil screenReaderText={null} size={1} />}
                            onClick={() => handleEditActionClick(row)}
                        />
                    </Tooltip>
                    <Tooltip content={_('Clone')}>
                        <ActionButtonComponent
                            appearance="flat"
                            icon={<Clone screenReaderText={null} size={1} />}
                            onClick={() => handleCloneActionClick(row)}
                        />
                    </Tooltip>
                    <Tooltip content={_('Delete')}>
                        <ActionButtonComponent
                            appearance="destructive"
                            icon={<Trash screenReaderText={null} size={1} />}
                            onClick={() => handleDeleteActionClick(row)}
                        />
                    </Tooltip>
                </ButtonGroup>
            </Table.Cell>
        );
    };

    const getCustomCell = (row, header) => {
        return React.createElement(CustomCell, {
            serviceName: row.serviceName,
            field: row.name,
            row,
            fileName: header.customCell.src,
        });
    };

    const getTableRow = (row) => {
        let statusContent = '';
        // eslint-disable-next-line no-underscore-dangle
        if (!row.__toggleDisable) {
            if (row.disabled) {
                statusContent = statusMapping[0].mapping[row.disabled];
            } else {
                statusContent = row.disabled ? 'Disabled' : 'Enabled';
            }
        } else {
            statusContent = <WaitSpinner />;
        }

        return (
            <Table.Row
                key={row.id}
                {...(moreInfo
                    ? { expansionRow: getExpansionRow(columns.length, row, moreInfo) }
                    : {})}
            >
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
                                    <Switch
                                        key={row.name}
                                        value={row.disabled}
                                        onClick={() => handleToggleActionClick(row)}
                                        selected={!row.disabled}
                                        // eslint-disable-next-line no-underscore-dangle
                                        disabled={row.__toggleDisable}
                                        appearance="toggle"
                                        style={{ padding: 0 }}
                                        selectedLabel={_(
                                            statusMapping
                                                ? statusMapping[0].mapping.false
                                                : 'Enabled'
                                        )}
                                        unselectedLabel={_(
                                            statusMapping
                                                ? statusMapping[0].mapping.true
                                                : 'Disabled'
                                        )}
                                    >
                                        {statusContent}
                                    </Switch>
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
        );
    };

    const getTableBody = () => {
        return (
            <Table.Body>{data && data.length && data.map((row) => getTableRow(row))}</Table.Body>
        );
    };

    return (
        <>
            {columns && columns.length && (
                <Table stripeRows {...(moreInfo ? { rowExpansion: 'single' } : {})}>
                    {getTableHeaders()}
                    {getTableBody()}
                </Table>
            )}
            {generateModalDialog()}
            {generateDeleteDialog()}
        </>
    );
}

CustomTable.propTypes = {
    page: PropTypes.string.isRequired,
    serviceName: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    handleToggleActionClick: PropTypes.func,
    handleSort: PropTypes.func,
    sortDir: PropTypes.string,
    sortKey: PropTypes.string,
};

export default memo(CustomTable);
