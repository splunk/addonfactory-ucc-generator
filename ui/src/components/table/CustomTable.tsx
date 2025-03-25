import React, { useCallback, useEffect, memo, useState, useMemo } from 'react';
import Table, { HeadCellSortHandler } from '@splunk/react-ui/Table';
import { _ } from '@splunk/ui-utils/i18n';
import { useSearchParams } from 'react-router-dom';
import { Mode, MODE_CLONE, MODE_EDIT } from '../../constants/modes';
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
import { StandardPages } from '../../types/components/shareableTypes';
import { invariant } from '../../util/invariant';

interface CustomTableProps {
    page: StandardPages;
    serviceName?: string;
    data: RowDataFields[];
    handleToggleActionClick: (row: RowDataFields) => void;
    handleOpenPageStyleDialog: (row: RowDataFields, mode: Mode) => void;
    handleSort: HeadCellSortHandler;
    sortDir: SortDirection;
    sortKey?: string;
    tableConfig: ITableConfig;
    useInputToggleConfirmation?: boolean;
}

interface IEntityModal {
    serviceName?: string;
    open: boolean;
    stanzaName?: string;
    mode?: Mode;
    formTitle?: string;
}

const getServiceToStyleMap = (page: StandardPages, unifiedConfigs: GlobalConfig) => {
    const serviceToStyleMap: Record<string, typeof STYLE_PAGE | typeof STYLE_MODAL> = {};
    if (page === PAGE_INPUT) {
        const inputsPage = unifiedConfigs.pages.inputs;
        inputsPage?.services.forEach((x) => {
            serviceToStyleMap[x.name] = x.style === STYLE_PAGE ? STYLE_PAGE : STYLE_MODAL;
        });
    } else {
        unifiedConfigs.pages.configuration?.tabs.forEach((x) => {
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
    useInputToggleConfirmation,
}) => {
    const unifiedConfigs: GlobalConfig = getUnifiedConfigs();
    const [entityModal, setEntityModal] = useState<IEntityModal>({ open: false });
    const [deleteModal, setDeleteModal] = useState<IEntityModal>({ open: false });

    const { rowData } = useTableContext();
    const inputsPage = unifiedConfigs.pages.inputs;
    const readonlyFieldId =
        page === PAGE_INPUT && inputsPage && 'table' in inputsPage && inputsPage.readonlyFieldId
            ? inputsPage.readonlyFieldId
            : undefined;
    const { moreInfo, header: headers, actions } = tableConfig;

    const headerMapping: Record<string, Record<string, string> | undefined> = {};

    headers.forEach((x) => {
        headerMapping[x.field] = x.mapping;
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

    const getFormTitle = useCallback(
        (needDefaultTitle: boolean, serviceNameForTitle?: string) => {
            if (!serviceNameForTitle || !unifiedConfigs) {
                return undefined;
            }

            if (page === PAGE_INPUT) {
                const findService = unifiedConfigs.pages.inputs?.services.find(
                    (x) => x.name === serviceNameForTitle
                );
                return findService?.formTitle || (needDefaultTitle ? findService?.title : '');
            }
            if (page === PAGE_CONF) {
                invariant(
                    unifiedConfigs.pages.configuration,
                    'Configuration page not found in global config'
                );
                const findService = unifiedConfigs.pages.configuration.tabs.find(
                    (x) => x.name === serviceNameForTitle
                );
                return findService?.formTitle || (needDefaultTitle ? findService?.title : '');
            }

            return undefined;
        },
        [unifiedConfigs, page]
    );

    const handleDeleteActionClick = useCallback(
        (selectedRow: RowDataFields) => {
            setDeleteModal({
                ...deleteModal,
                open: true,
                stanzaName: selectedRow.name,
                serviceName: selectedRow.serviceName,
                formTitle: getFormTitle(false, selectedRow.serviceName),
            });
        },
        [deleteModal, getFormTitle]
    );

    const generateModalDialog = () => {
        if (entityModal.open) {
            const label = getFormTitle(true, entityModal.serviceName);

            // TODO: returnFocus ADDON-78884
            return entityModal.serviceName && entityModal.mode ? (
                <EntityModal
                    page={page}
                    open={entityModal.open}
                    handleRequestClose={handleEntityClose}
                    returnFocus={() => {}}
                    serviceName={entityModal.serviceName}
                    stanzaName={entityModal.stanzaName}
                    mode={entityModal.mode}
                    formLabel={
                        entityModal.mode === MODE_CLONE ? _(`Clone `) + label : _(`Update `) + label
                    }
                />
            ) : null;
        }
        return null;
    };

    // TODO: returnFocus ADDON-78884
    const generateDeleteDialog = () =>
        deleteModal.serviceName && deleteModal.stanzaName ? (
            <DeleteModal
                page={page}
                open={deleteModal.open}
                returnFocus={() => {}}
                handleRequestClose={handleDeleteClose}
                serviceName={deleteModal.serviceName}
                stanzaName={deleteModal.stanzaName}
                formTitle={deleteModal.formTitle}
            />
        ) : null;

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
                            data-test={headData.label}
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
                    <CustomTableRow
                        key={`${row.serviceName}-${row.name}-row`}
                        row={row}
                        columns={columns}
                        rowActions={actions}
                        headerMapping={headerMapping}
                        readonly={isReadonlyRow(readonlyFieldId, row)}
                        useInputToggleConfirmation={useInputToggleConfirmation}
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
                                      moreInfo,
                                      tableConfig?.customRow
                                  ),
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
