import React, { useCallback, useEffect, memo, useState, useContext } from 'react';
import PropTypes from 'prop-types';

import Table from '@splunk/react-ui/Table';
import { _ } from '@splunk/ui-utils/i18n';

import useQuery from '../../hooks/useQuery';
import { MODE_CLONE, MODE_EDIT } from '../../constants/modes';
import { PAGE_INPUT } from '../../constants/pages';
import { getUnifiedConfigs } from '../../util/util';
import { getExpansionRow } from './TableExpansionRow';
import { STYLE_MODAL, STYLE_PAGE } from '../../constants/dialogStyles';
import CustomTableRow from './CustomTableRow';
import EntityModal from '../EntityModal';
import DeleteModal from '../DeleteModal';
import TableContext from '../../context/TableContext';
import { NoRecordsDiv } from './CustomTableStyle';

function CustomTable({
    page,
    serviceName,
    data,
    handleToggleActionClick,
    handleOpenPageStyleDialog,
    handleSort,
    sortDir,
    sortKey,
    tableConfig
}) {
    const unifiedConfigs = getUnifiedConfigs();
    const [entityModal, setEntityModal] = useState({ open: false });
    const [deleteModal, setDeleteModal] = useState({ open: false });

    const { rowData } = useContext(TableContext);

    const { moreInfo, header } = tableConfig;
    const headers = tableConfig.header;

    const headerMapping = {};
    header.forEach((x) => {
        headerMapping[x.field] = x.mapping;
    });

    const serviceToStyleMap = {};
    if (page === PAGE_INPUT) {
        unifiedConfigs.pages.inputs.services.forEach((x) => {
            serviceToStyleMap[x.name] = x.style === STYLE_PAGE ? STYLE_PAGE : STYLE_MODAL;
        });
    }

    const query = useQuery();

    // Run only once when component is mounted to load component based on initial query params
    // and when query params are updated
    useEffect(() => {
        // Only run when tab matches serviceName or if in input page where serviceName is undefined
        if (query && (query.get('tab') === serviceName || typeof serviceName === 'undefined')) {
            // Open modal when record is available in query params and modal is not open
            if (query.get('record') && !entityModal.open) {
                const serviceKey = Object.keys(rowData).find(
                    (x) => typeof rowData[x][query.get('record')] !== 'undefined'
                );
                if (serviceKey) {
                    const row = rowData[serviceKey][query.get('record')];
                    setEntityModal({
                        ...entityModal,
                        open: true,
                        serviceName: row.serviceName,
                        stanzaName: row.name,
                        mode: MODE_EDIT,
                    });
                }
            } else if (!query.get('record') && entityModal.open) {
                // Close modal if record query param is not available and modal is open
                // NOTE: This should only be executed in case of MODE_EDIT which is handled by
                // useEffect dependency which will only be changed in case of editing entity
                setEntityModal({ ...entityModal, open: false });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEntityClose = () => {
        setEntityModal({ ...entityModal, open: false });
    };

    const handleEditActionClick = useCallback(
        (selectedRow) => {
            if (serviceToStyleMap[selectedRow.serviceName] === 'page') {
                handleOpenPageStyleDialog(selectedRow, MODE_EDIT);
            } else {
                setEntityModal({
                    ...entityModal,
                    open: true,
                    serviceName: selectedRow.serviceName,
                    stanzaName: selectedRow.name,
                    mode: MODE_EDIT,
                });
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [entityModal]
    );

    const handleDeleteClose = () => {
        setDeleteModal({ ...deleteModal, open: false });
    };

    const handleCloneActionClick = useCallback(
        (selectedRow) => {
            if (serviceToStyleMap[selectedRow.serviceName] === 'page') {
                handleOpenPageStyleDialog(selectedRow, MODE_CLONE);
            } else {
                setEntityModal({
                    ...entityModal,
                    open: true,
                    serviceName: selectedRow.serviceName,
                    stanzaName: selectedRow.name,
                    mode: MODE_CLONE,
                });
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [entityModal]
    );

    const handleDeleteActionClick = useCallback(
        (selectedRow) => {
            setDeleteModal({
                ...deleteModal,
                open: true,
                stanzaName: selectedRow.name,
                serviceName: selectedRow.serviceName,
            });
        },
        [deleteModal]
    );

    const generateModalDialog = () => {
        if (entityModal.open) {
            let label;
            if (page === 'inputs') {
                const { services } = unifiedConfigs.pages?.inputs;
                label = services.find((x) => x.name === entityModal.serviceName)?.title;
            } else {
                const { tabs } = unifiedConfigs.pages?.configuration;
                label = tabs.find((x) => x.name === entityModal.serviceName)?.title;
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
        return (
            <DeleteModal
                page={page}
                open={deleteModal.open}
                handleRequestClose={handleDeleteClose}
                serviceName={deleteModal.serviceName}
                stanzaName={deleteModal.stanzaName}
            />
        );
    };

    const generateColumns = () => {
        const column = [];
        if (headers && headers.length) {
            headers.forEach((item) => {
                column.push({
                    ...item,
                    sortKey: item.field || null,
                    isCustomMapping: item.mapping ? true : false
                });
            });
        }
        column.push({ label: 'Actions', field: 'actions', sortKey: '' });
        return column;
    };

    const columns = generateColumns();

    const getTableHeaderCell = useCallback(() => {
        return (
            <Table.Head>
                {columns &&
                    columns.length &&
                    columns.map((headData) => (
                        <Table.HeadCell
                            key={headData.field}
                            onSort={(e) => headData.sortKey ? handleSort(e, headData) : null}
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
    }, [columns, handleSort, sortDir, sortKey]);

    const getTableBody = () => {
        return (
            <Table.Body>
                {data &&
                    data.length &&
                    data.map((row) => {
                        return (
                            <CustomTableRow // nosemgrep: typescript.react.best-practice.react-props-spreading.react-props-spreading
                                key={row.id}
                                row={row}
                                columns={columns}
                                headerMapping={headerMapping}
                                {...{
                                    handleEditActionClick,
                                    handleCloneActionClick,
                                    handleDeleteActionClick,
                                }}
                                handleToggleActionClick={handleToggleActionClick}
                                {...(moreInfo
                                    ? {
                                        expansionRow: getExpansionRow(
                                            columns.length,
                                            row,
                                            moreInfo
                                        ),
                                    }
                                    : {})}
                            />
                        );
                    })}
            </Table.Body>
        );
    };

    return (
        <>
            {columns && columns.length && (
                <Table // nosemgrep: typescript.react.best-practice.react-props-spreading.react-props-spreading
                    stripeRows
                    {...(moreInfo ? { rowExpansion: 'single' } : {})}
                >
                    {getTableHeaderCell()}
                    {getTableBody()}
                </Table>
            )}
            {!data.length ? <NoRecordsDiv>No records found</NoRecordsDiv> : null}
            {generateModalDialog()}
            {generateDeleteDialog()}
        </>
    );
}

CustomTable.propTypes = {
    page: PropTypes.string.isRequired,
    serviceName: PropTypes.string,
    data: PropTypes.array.isRequired,
    handleToggleActionClick: PropTypes.func,
    handleOpenPageStyleDialog: PropTypes.func,
    handleSort: PropTypes.func,
    sortDir: PropTypes.string,
    sortKey: PropTypes.string,
};

export default memo(CustomTable);
