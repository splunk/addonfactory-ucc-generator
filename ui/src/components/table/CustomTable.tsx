import React, { useCallback, useEffect, memo, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

import Table, { HeadCellSortHandler } from '@splunk/react-ui/Table';
import { _ } from '@splunk/ui-utils/i18n';

import { useSearchParams } from 'react-router-dom';
import { TableSchema } from 'src/types/globalConfig/pages';
import { z } from 'zod';
import { Mode, MODE_CLONE, MODE_CREATE, MODE_EDIT } from '../../constants/modes';
import { PAGE_INPUT } from '../../constants/pages';
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

type ITableConfig = z.infer<typeof TableSchema>;

interface ICustomTableProps {
    page: string;
    serviceName?: string;
    data: RowDataFields[];
    handleToggleActionClick: (row: RowDataFields) => void;
    handleOpenPageStyleDialog: (row: RowDataFields, mode: Mode) => void;
    handleSort: HeadCellSortHandler;
    sortDir: 'none' | 'desc' | 'asc' | null;
    sortKey: 'none' | 'desc' | 'asc' | null;
    tableConfig;
}

interface IHeader {
    field: string;
    label: string;
    mapping?: string;
    customCell?: string;
}

interface IUnifiedConfigs {
    pages: {
        inputs: {
            services: { name: string; style: string; title: string }[];
            readonlyFieldId?: string;
        };
        configuration: {
            tabs: { name: string; style: string; title: string }[];
        };
    };
}

function getServiceToStyleMap(
    page: string,
    unifiedConfigs: IUnifiedConfigs
): { [key: string]: string } {
    const serviceToStyleMap: { [key: string]: string } = {};
    if (page === PAGE_INPUT) {
        unifiedConfigs.pages.inputs.services.forEach((x) => {
            serviceToStyleMap[x.name] = x.style === STYLE_PAGE ? STYLE_PAGE : STYLE_MODAL;
        });
    } else {
        unifiedConfigs.pages.configuration.tabs.forEach((x) => {
            serviceToStyleMap[x.name] = x.style === STYLE_PAGE ? STYLE_PAGE : STYLE_MODAL;
        });
    }
    return serviceToStyleMap;
}

const CustomTable: React.FC<ICustomTableProps> = ({
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
    const unifiedConfigs = getUnifiedConfigs() as IUnifiedConfigs;
    const [entityModal, setEntityModal] = useState<{
        open: boolean;
        serviceName: string;
        stanzaName?: string;
        mode: Mode;
    }>({ open: false, serviceName: '', mode: MODE_CREATE });
    const [deleteModal, setDeleteModal] = useState<{
        open: boolean;
        serviceName: string;
        stanzaName: string;
    }>({ open: false, serviceName: '', stanzaName: '' });

    const { rowData } = useTableContext();
    const readonlyFieldId =
        page === PAGE_INPUT && 'readonlyFieldId' in unifiedConfigs.pages.inputs
            ? unifiedConfigs.pages.inputs.readonlyFieldId
            : undefined;
    const { moreInfo, header: headers, actions } = tableConfig;

    const headerMapping: Record<string, string> = {};
    headers.forEach((x: IHeader) => {
        headerMapping[x.field] = x.mapping || '';
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
        if ((tab === serviceName || serviceName === undefined) && record && !entityModal.open) {
            const serviceKey = Object.keys(rowData).find(
                (x) => typeof rowData[x][record] !== 'undefined'
            );
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
        [entityModal, handleOpenPageStyleDialog, serviceToStyleMap]
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
                const { services } = unifiedConfigs.pages.inputs;
                label = services.find((x) => x.name === entityModal.serviceName)?.title;
            } else if (page === 'configuration') {
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
            headers.forEach((item: IHeader) =>
                column.push({
                    ...item,
                    sortKey: item.field || null,
                    label: '',
                })
            );
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
                            sortKey={
                                typeof headData.field === 'string' ? headData.field : undefined
                            }
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
                data.map((row: RowDataFields) => (
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

CustomTable.propTypes = {
    page: PropTypes.string.isRequired,
    serviceName: PropTypes.string,
    data: PropTypes.array.isRequired,
    handleToggleActionClick: PropTypes.func.isRequired,
    handleOpenPageStyleDialog: PropTypes.func.isRequired,
    handleSort: PropTypes.func.isRequired,
    sortDir: PropTypes.oneOf(['none', 'desc', 'asc', null]).isRequired,
    sortKey: PropTypes.oneOf(['none', 'desc', 'asc', null]).isRequired,
    tableConfig: PropTypes.object.isRequired,
};

export default memo(CustomTable);
