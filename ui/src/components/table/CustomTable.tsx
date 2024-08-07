import React, { useCallback, useEffect, memo, useState, useMemo } from 'react';
import Table, { HeadCellSortHandler } from '@splunk/react-ui/Table';
import { _ } from '@splunk/ui-utils/i18n';
import { useSearchParams } from 'react-router-dom';
import { Mode, MODE_CLONE, MODE_CREATE, MODE_EDIT } from '../../constants/modes';
import { PAGE_CONF, PAGE_INPUT } from '../../constants/pages';
import { RowDataFields } from '../../context/TableContext';
import { getUnifiedConfigs } from '../../util/util';
import { getExpansionRow } from './TableExpansionRow';
import { STYLE_MODAL, STYLE_PAGE } from '../../constants/dialogStyles';
import CustomTableRow from './CustomTableRow';
import EntityModal from '../EntityModal/EntityModal';
import DeleteModal from '../DeleteModal/DeleteModal';
import { NoRecordsDiv } from './CustomTableStyle';
import { useTableContext } from '../../context/useTableContext';
import { isReadonlyRow } from './table.utils';
import { SortDirection } from './useTableSort';
import { GlobalConfig } from '../../types/globalConfig/globalConfig';
import { ITableConfig } from '../../types/globalConfig/pages';

interface CustomTableProps {
    page: string;
    serviceName?: string;
    data: RowDataFields[];
    handleToggleActionClick: (row: RowDataFields) => void;
    handleOpenPageStyleDialog: (row: RowDataFields, mode: Mode) => void;
    handleSort: HeadCellSortHandler;
    sortDir: SortDirection;
    sortKey?: string;
    tableConfig: ITableConfig;
}

const getServiceToStyleMap = (
    page: string,
    unifiedConfigs: GlobalConfig
): Record<string, string> => {
    const serviceToStyleMap: Record<string, typeof STYLE_PAGE | typeof STYLE_MODAL> = {};
    if (page === PAGE_INPUT) {
        const inputsPage = unifiedConfigs.pages.inputs;
        inputsPage?.services.forEach((x) => {
            serviceToStyleMap[x.name] = x.style === STYLE_PAGE ? STYLE_PAGE : STYLE_MODAL;
        });
    } else {
        unifiedConfigs.pages.configuration.tabs.forEach((x) => {
            serviceToStyleMap[x.name] = x.style === STYLE_PAGE ? STYLE_PAGE : STYLE_MODAL;
        });
    }
    return serviceToStyleMap;
};

const CustomTable: React.FC<CustomTableProps> = ({
    page,
    serviceName,
    data,
    handleToggleActionClick,
    handleOpenPageStyleDialog,
    handleSort,
    sortDir,
    sortKey,
    tableConfig,
}) => {
    const unifiedConfigs: GlobalConfig = getUnifiedConfigs();
    const [entityModal, setEntityModal] = useState({
        open: false,
        serviceName: '',
        stanzaName: '',
        mode: MODE_CREATE as Mode,
    });
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        serviceName: '',
        stanzaName: '',
    });

    const { rowData } = useTableContext();
    const inputsPage = unifiedConfigs.pages.inputs;
    const readonlyFieldId =
        page === PAGE_INPUT && inputsPage?.type === 'table' && inputsPage.readonlyFieldId
            ? inputsPage.readonlyFieldId
            : undefined;
    const { moreInfo, header: headers, actions } = tableConfig;

    const headerMapping: Record<string, string> = {};

    headers.forEach((x) => {
        headerMapping[x.field] = typeof x.mapping === 'string' ? x.mapping : '';
    });

    const serviceToStyleMap = useMemo(
        () => getServiceToStyleMap(page, unifiedConfigs),
        [page, unifiedConfigs]
    );

    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab');
    const record = searchParams.get('record');

    // Run only once when component is mounted to load component based on initial query params
    // and when query params are updated
    useEffect(() => {
        // Only run when tab matches serviceName or if in input page where serviceName is undefined
        if ((tab === serviceName || !serviceName) && record && !entityModal.open) {
            const serviceKey = Object.keys(rowData).find((x) => rowData[x][record]);
            if (serviceKey) {
                const row = rowData[serviceKey][record];
                setEntityModal({
                    ...entityModal,
                    open: true,
                    serviceName: row.serviceName,
                    stanzaName: row.name,
                    mode: MODE_EDIT,
                });
            }
        }
    }, [tab, record, entityModal, rowData, serviceName]);

    const handleEntityClose = () => {
        if (searchParams.has('record')) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('record');
            setSearchParams(newSearchParams);
        }
        setEntityModal({ ...entityModal, open: false });
    };

    const handleEditActionClick = useCallback(
        (selectedRow: RowDataFields) => {
            if (serviceToStyleMap[selectedRow.serviceName] === STYLE_PAGE) {
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
        (selectedRow: RowDataFields) => {
            if (serviceToStyleMap[selectedRow.serviceName] === STYLE_PAGE) {
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
        [entityModal, handleOpenPageStyleDialog, serviceToStyleMap]
    );

    const handleDeleteActionClick = useCallback(
        (selectedRow: RowDataFields) => {
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
            let label: string | undefined;
            if (page === PAGE_INPUT) {
                const services = inputsPage?.services;
                label = services?.find((x) => x.name === entityModal.serviceName)?.title;
            } else if (page === PAGE_CONF) {
                const { tabs } = unifiedConfigs.pages.configuration;
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

    const generateDeleteDialog = () => (
        <DeleteModal
            page={page}
            open={deleteModal.open}
            handleRequestClose={handleDeleteClose}
            serviceName={deleteModal.serviceName}
            stanzaName={deleteModal.stanzaName}
        />
    );

    const generateColumns = () => {
        const column: Array<{ label: string; field: string; sortKey: string | null }> = [];

        if (headers && headers.length) {
            headers.forEach((item) => {
                column.push({
                    ...item,
                    sortKey: item.field || null,
                });
            });
        }

        if (actions && actions.length) {
            column.push({ label: 'Actions', field: 'actions', sortKey: '' });
        }

        return column;
    };

    const columns = generateColumns();

    const getTableHeaderCell = useCallback(
        () => (
            <Table.Head>
                {columns &&
                    columns.length &&
                    columns.map((headData) => (
                        <Table.HeadCell
                            key={headData.field}
                            onSort={headData.sortKey ? handleSort : undefined}
                            sortKey={headData.sortKey ?? undefined}
                            sortDir={
                                headData.sortKey && headData.sortKey === sortKey ? sortDir : 'none'
                            }
                        >
                            {headData.label}
                        </Table.HeadCell>
                    ))}
            </Table.Head>
        ),
        [columns, handleSort, sortDir, sortKey]
    );

    const getTableBody = () => (
        <Table.Body>
            {data &&
                data.length &&
                data.map((row) => (
                    <CustomTableRow // nosemgrep: typescript.react.best-practice.react-props-spreading.react-props-spreading
                        key={row.name || row.id}
                        row={row}
                        columns={columns}
                        rowActions={actions}
                        headerMapping={headerMapping}
                        readonly={isReadonlyRow(readonlyFieldId, row)}
                        {...{
                            handleEditActionClick,
                            handleCloneActionClick,
                            handleDeleteActionClick,
                        }}
                        handleToggleActionClick={handleToggleActionClick}
                        {...(moreInfo
                            ? {
                                  expansionRow: getExpansionRow(columns.length, row, moreInfo),
                              }
                            : {})}
                    />
                ))}
        </Table.Body>
    );

    return (
        <>
            {columns && columns.length && (
                <Table // nosemgrep: typescript.react.best-practice.react-props-spreading.react-props-spreading
                    stripeRows
                    headType="docked"
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
};

export default memo(CustomTable);
