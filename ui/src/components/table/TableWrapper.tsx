import React, { useState, useEffect, memo, useCallback, useMemo, useRef } from 'react';
import update from 'immutability-helper';

import { WaitSpinnerWrapper } from './CustomTableStyle';
import { generateEndPointUrl, getRequest, postRequest } from '../../util/api';
import { getUnifiedConfigs, generateToast } from '../../util/util';
import CustomTable from './CustomTable';
import TableHeader from './TableHeader';
import { RowDataType, RowDataFields } from '../../context/TableContext';
import { PAGE_CONF, PAGE_INPUT } from '../../constants/pages';
import { parseErrorMsg } from '../../util/messageUtil';
import { Mode } from '../../constants/modes';
import { GlobalConfig } from '../../types/globalConfig/globalConfig';
import { useTableSort } from './useTableSort';
import { useTableContext } from '../../context/useTableContext';
import { isFalse, isTrue } from '../../util/considerFalseAndTruthy';
import { isReadonlyRow } from './table.utils';
import { ITableConfig } from '../../types/globalConfig/pages';
import { AcceptableFormValueOrNull, StandardPages } from '../../types/components/shareableTypes';

export interface ITableWrapperProps {
    page: typeof PAGE_INPUT | typeof PAGE_CONF;
    serviceName?: string;
    handleRequestModalOpen?: () => void;
    handleOpenPageStyleDialog: (row: RowDataFields, mode: Mode) => void;
    displayActionBtnAllRows?: boolean;
}

const defaultTableConfig: ITableConfig = {
    header: [],
    actions: [],
    moreInfo: [],
};

const getTableConfigAndServices = (
    page: StandardPages,
    unifiedConfigs: GlobalConfig,
    serviceName?: string
) => {
    const services =
        page === PAGE_INPUT
            ? unifiedConfigs.pages.inputs?.services
            : unifiedConfigs.pages.configuration?.tabs.filter((x) => x.name === serviceName);
    if (page === PAGE_INPUT) {
        if (unifiedConfigs.pages.inputs && 'table' in unifiedConfigs.pages.inputs) {
            return {
                services,
                tableConfig: unifiedConfigs.pages.inputs.table,
                readonlyFieldId: unifiedConfigs.pages.inputs.readonlyFieldId,
                hideFieldId: unifiedConfigs.pages.inputs.hideFieldId,
                useInputToggleConfirmation: unifiedConfigs.pages.inputs.useInputToggleConfirmation,
            };
        }
        const serviceWithTable = services?.find((x) => x.name === serviceName);
        const tableData = serviceWithTable && 'table' in serviceWithTable && serviceWithTable.table;

        return {
            services,
            tableConfig: {
                ...(tableData || defaultTableConfig),
            },
            readonlyFieldId: undefined,
            hideFieldId: undefined,
            useInputToggleConfirmation:
                serviceWithTable &&
                'useInputToggleConfirmation' in serviceWithTable &&
                Boolean(serviceWithTable.useInputToggleConfirmation),
        };
    }

    const tableConfig = unifiedConfigs.pages.configuration?.tabs.find(
        (x) => x.name === serviceName
    )?.table;

    return {
        services,
        tableConfig: {
            ...(tableConfig || defaultTableConfig),
        },
        readonlyFieldId: undefined,
        hideFieldId: undefined,
    };
};

export const getRowDataFromApiResponse = (
    services: ReturnType<typeof getTableConfigAndServices>['services'],
    apiData: Array<Array<{ name: string; content: Record<string, string>; id: string }>>
): RowDataType => {
    const obj: RowDataType = {};

    services?.forEach((service, index) => {
        if (service && service.name && apiData) {
            const tmpObj: Record<string, RowDataFields> = {};
            apiData[index].forEach((val) => {
                tmpObj[val.name] = {
                    ...val.content,
                    id: val.id,
                    name: val.name,
                    serviceName: service.name,
                    serviceTitle: service.title || '',
                };
            });
            obj[service.name] = tmpObj;
        }
    });

    return obj;
};

const TableWrapper: React.FC<ITableWrapperProps> = ({
    page,
    serviceName,
    handleRequestModalOpen,
    handleOpenPageStyleDialog,
    displayActionBtnAllRows,
}: ITableWrapperProps) => {
    const { sortKey, sortDir, handleSort } = useTableSort();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isComponentMounted = useRef(false);

    const { rowData, setRowData, pageSize, currentPage, searchText, searchType } =
        useTableContext()!;

    const unifiedConfigs = getUnifiedConfigs();
    const { services, tableConfig, readonlyFieldId, hideFieldId, useInputToggleConfirmation } =
        useMemo(
            () => getTableConfigAndServices(page, unifiedConfigs, serviceName),
            [page, unifiedConfigs, serviceName]
        );

    const moreInfo = tableConfig && 'moreInfo' in tableConfig ? tableConfig?.moreInfo : null;
    const headers = tableConfig && 'header' in tableConfig ? tableConfig?.header : null;
    const isTabs = !!serviceName;

    useEffect(() => {
        isComponentMounted.current = true;
        return () => {
            isComponentMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const abortController = new AbortController();

        function fetchInputs() {
            const requests =
                services?.map((service) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    getRequest<{ entry: [any] }>({
                        endpointUrl: generateEndPointUrl(encodeURIComponent(service.name)),
                        params: { count: -1 },
                        signal: abortController.signal,
                        handleError: false,
                    })
                ) || [];

            Promise.all(requests)
                .catch((caughtError) => {
                    if (abortController.signal.aborted) {
                        return;
                    }
                    const message = parseErrorMsg(caughtError);

                    generateToast(message, 'error');
                    setError(caughtError);
                })
                .then((responsesData) => {
                    if (!responsesData) {
                        return;
                    }
                    const data = getRowDataFromApiResponse(
                        services,
                        responsesData.map((responseData) => responseData.entry)
                    );
                    setRowData(data);
                })
                .finally(() => {
                    if (isComponentMounted.current) {
                        setLoading(false);
                    }
                });
        }

        fetchInputs();

        return () => {
            abortController.abort();
        };
    }, [services, setRowData]);

    /**
     *
     * @param row {Object} row
     */
    const changeToggleStatus = (row: RowDataFields) => {
        if (isReadonlyRow(readonlyFieldId, row)) {
            return;
        }
        setRowData((currentRowData: RowDataType) =>
            update(currentRowData, {
                [row.serviceName]: {
                    [row.name]: {
                        __toggleShowSpinner: { $set: true },
                    },
                },
            })
        );
        const body = new URLSearchParams();
        body.append('disabled', String(!row.disabled));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        postRequest<{ entry: [any] }>({
            endpointUrl: generateEndPointUrl(
                `${encodeURIComponent(row.serviceName)}/${encodeURIComponent(row.name)}`
            ),
            body,
            handleError: true,
            callbackOnError: () => {
                setRowData((currentRowData: RowDataType) =>
                    update(currentRowData, {
                        [row.serviceName]: {
                            [row.name]: {
                                __toggleShowSpinner: { $set: false },
                            },
                        },
                    })
                );
            },
        }).then((data) => {
            setRowData((currentRowData: RowDataType) =>
                update(currentRowData, {
                    [row.serviceName]: {
                        [row.name]: {
                            // ADDON-39125: isTrue required if splunktaucclib resthandlers' super() is not invoked
                            disabled: { $set: isTrue(data.entry[0].content.disabled) },
                            __toggleShowSpinner: { $set: false },
                        },
                    },
                })
            );
        });
    };

    /**
     *
     * @param {Array} serviceData data for single service
     * This function will iterate an array and match each key-value with the searchText
     * It will return a new array which will match with searchText
     */
    const findByMatchingValue = useCallback(
        (serviceData: Record<string, RowDataFields>) => {
            const matchedRows: RowDataFields[] = [];
            const searchableFields: string[] = [
                ...(headers?.map((headData) => headData.field) || []),
                ...(moreInfo?.map((moreInfoData) => moreInfoData.field) || []),
            ];

            Object.values(serviceData).forEach((_rowData) => {
                const found = Object.entries(_rowData).some(
                    ([key, value]) =>
                        searchableFields.includes(key) &&
                        typeof value === 'string' &&
                        value.toLowerCase().includes(searchText.toLowerCase().trim())
                );

                if (found) {
                    matchedRows.push(_rowData);
                }
            });

            return matchedRows;
        },
        [headers, moreInfo, searchText]
    );

    const getRowData = () => {
        let allRowsData: RowDataFields[] = [];
        services?.forEach((service) => {
            const extractedServiceName = service?.name;
            if (!extractedServiceName || !rowData?.[extractedServiceName]) {
                return;
            }

            rowData[extractedServiceName] = Object.fromEntries(
                Object.entries(rowData[extractedServiceName]).map(([key, row]) => [
                    key,
                    {
                        ...row,
                        serviceTitle: service.title || '',
                    },
                ])
            );
        });
        if (searchType === 'all') {
            Object.keys(rowData).forEach((key) => {
                const newArr = searchText
                    ? findByMatchingValue(rowData[key])
                    : Object.keys(rowData[key]).map((val) => rowData[key][val]);

                allRowsData = allRowsData.concat(newArr);
            });
        } else {
            allRowsData = findByMatchingValue(rowData[searchType]);
        }

        // For Inputs page, filter the data when tab change
        if (isTabs) {
            allRowsData = allRowsData.filter((v) => v.serviceName === serviceName);
        }
        if (hideFieldId) {
            allRowsData = allRowsData.filter((v) => isFalse(v[hideFieldId]));
        }

        const headerMapping =
            headers?.find((header: { field: string }) => header.field === sortKey)?.mapping || {};
        // Sort the array based on the sort value
        const sortedArr = allRowsData.sort((rowA, rowB) => {
            const rowAValue: AcceptableFormValueOrNull =
                rowA[sortKey] === undefined || rowA[sortKey] === null
                    ? ''
                    : headerMapping[String(rowA[sortKey])] || rowA[sortKey];

            const rowBValue =
                rowB[sortKey] === undefined || rowB[sortKey] === null
                    ? ''
                    : headerMapping[String(rowB[sortKey])] || rowB[sortKey];

            if (sortDir === 'asc') {
                return rowAValue > rowBValue ? 1 : -1;
            }
            if (sortDir === 'desc') {
                return rowBValue > rowAValue ? 1 : -1;
            }
            return 0;
        });

        let updatedArr = sortedArr.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

        if (currentPage > 0 && !updatedArr.length) {
            updatedArr = sortedArr.slice((currentPage - 1) * pageSize, pageSize);
        }

        return {
            filteredData: updatedArr,
            totalElement: allRowsData.length,
            allFilteredData: allRowsData,
        };
    };

    if (error) {
        throw error;
    }

    if (loading) {
        return <WaitSpinnerWrapper size="medium" />;
    }

    const { filteredData, totalElement, allFilteredData } = getRowData();

    return (
        <>
            <TableHeader
                page={page}
                services={services}
                totalElement={totalElement}
                handleRequestModalOpen={handleRequestModalOpen}
                changeToggleStatus={changeToggleStatus}
                isTabs={isTabs}
                allFilteredData={allFilteredData}
                displayActionBtnAllRows={displayActionBtnAllRows}
            />
            <CustomTable
                page={page}
                serviceName={serviceName}
                data={filteredData}
                handleToggleActionClick={(row) => changeToggleStatus(row)}
                handleSort={handleSort}
                sortDir={sortDir}
                sortKey={sortKey}
                handleOpenPageStyleDialog={handleOpenPageStyleDialog}
                tableConfig={tableConfig}
                useInputToggleConfirmation={useInputToggleConfirmation}
            />
        </>
    );
};

export default memo(TableWrapper);
