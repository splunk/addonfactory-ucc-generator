import React, { useState, useContext, useEffect, memo } from 'react';
import update from 'immutability-helper';
import axios from 'axios';
import PropTypes from 'prop-types';
import { HeadCellSortHandler } from '@splunk/react-ui/Table';

import { WaitSpinnerWrapper } from './CustomTableStyle';
import { axiosCallWrapper } from '../../util/axiosCallWrapper';
import { getUnifiedConfigs, generateToast, isTrue } from '../../util/util';
import CustomTable from './CustomTable';
import TableHeader from './TableHeader';
import TableContext, { RowDataType, RowDataFields } from '../../context/TableContext';
import { PAGE_INPUT } from '../../constants/pages';
import { parseErrorMsg } from '../../util/messageUtil';
import { Mode } from '../../constants/modes';
import { GlobalConfig } from '../../types/globalConfig/globalConfig';
import { AcceptableFormValueOrNull } from '../../types/components/shareableTypes';

export interface ITableWrapperProps {
    page: string;
    serviceName: string;
    handleRequestModalOpen: () => void;
    handleOpenPageStyleDialog: (row: IRowData, mode: Mode) => void;
    displayActionBtnAllRows: boolean;
}

interface IRowData {}

const getTableConfigAndServices = (
    page: string,
    unifiedConfigs: GlobalConfig,
    serviceName: string
) => {
    const services =
        page === PAGE_INPUT
            ? unifiedConfigs.pages.inputs?.services
            : unifiedConfigs.pages.configuration.tabs.filter((x) => x.name === serviceName);

    if (page === PAGE_INPUT) {
        if (unifiedConfigs.pages.inputs && 'table' in unifiedConfigs.pages.inputs) {
            return { services, tableConfig: unifiedConfigs.pages.inputs.table };
        }

        const serviceWithTable = services?.find((x) => x.name === serviceName);
        const tableData = serviceWithTable && 'table' in serviceWithTable && serviceWithTable.table;

        return { services, tableConfig: tableData || {} };
    }

    const tableConfig =
        unifiedConfigs.pages.configuration.tabs.find((x) => x.name === serviceName)?.table || {};
    return {
        services,
        tableConfig,
    };
};

function TableWrapper({
    page,
    serviceName,
    handleRequestModalOpen,
    handleOpenPageStyleDialog,
    displayActionBtnAllRows,
}: ITableWrapperProps) {
    const [sortKey, setSortKey] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { rowData, setRowData, pageSize, currentPage, searchText, searchType } =
        useContext(TableContext)!;

    const unifiedConfigs = getUnifiedConfigs();
    const { services, tableConfig } = getTableConfigAndServices(page, unifiedConfigs, serviceName);

    const moreInfo = tableConfig && 'moreInfo' in tableConfig ? tableConfig?.moreInfo : null;
    const headers = tableConfig && 'header' in tableConfig ? tableConfig?.header : null;
    const isTabs = !!serviceName;

    const modifyAPIResponse = (
        apiData: Array<Array<{ name: string; content: Record<string, string>; id: string }>>
    ) => {
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

        setRowData(obj);
        setLoading(false);
    };

    const fetchInputs = () => {
        const requests =
            services?.map((service) =>
                axiosCallWrapper({
                    serviceName: service.name,
                    params: { count: -1 },
                })
            ) || [];

        axios
            .all(requests)
            .catch((caughtError) => {
                const message = parseErrorMsg(caughtError);

                generateToast(message, 'error');
                setLoading(false);
                setError(caughtError);
                return Promise.reject(caughtError);
            })
            .then((response) => {
                modifyAPIResponse(response.map((res) => res.data.entry));
            });
    };

    useEffect(() => {
        fetchInputs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     *
     * @param row {Object} row
     */
    const changeToggleStatus = (row: RowDataFields) => {
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
        axiosCallWrapper({
            serviceName: `${row.serviceName}/${row.name}`,
            body,
            customHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' },
            method: 'post',
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
        }).then((response) => {
            setRowData((currentRowData: RowDataType) =>
                update(currentRowData, {
                    [row.serviceName]: {
                        [row.name]: {
                            // ADDON-39125: isTrue required if splunktaucclib resthandlers' super() is not invoked
                            disabled: { $set: isTrue(response.data.entry[0].content.disabled) },
                            __toggleShowSpinner: { $set: false },
                        },
                    },
                })
            );
        });
    };

    const handleSort: HeadCellSortHandler = (e, val) => {
        const prevSortKey = sortKey;
        const prevSortDir = prevSortKey === val.sortKey ? sortDir : 'none';
        const nextSortDir = prevSortDir === 'asc' ? 'desc' : 'asc';
        setSortDir(nextSortDir);
        if (val.sortKey) {
            setSortKey(val.sortKey);
        }
    };

    /**
     *
     * @param {Array} serviceData data for single service
     * This function will iterate an arrray and match each key-value with the searchText
     * It will return a new array which will match with searchText
     */
    const findByMatchingValue = (serviceData: Record<string, RowDataFields>) => {
        const matchedRows: Record<string, AcceptableFormValueOrNull>[] = [];
        const searchableFields: string[] = [];

        headers?.forEach((headData: { field: string }) => {
            searchableFields.push(headData.field);
        });
        moreInfo?.forEach((moreInfoData: { field: string }) => {
            searchableFields.push(moreInfoData.field);
        });

        Object.keys(serviceData).forEach((v) => {
            let found = false;
            Object.keys(serviceData[v]).forEach((vv) => {
                const formValue = serviceData[v][vv];
                if (
                    searchableFields.includes(vv) &&
                    typeof formValue === 'string' &&
                    formValue.toLowerCase().includes(searchText.toLowerCase().trim()) &&
                    !found
                ) {
                    matchedRows.push(serviceData[v]);
                    found = true;
                }
            });
        });
        return matchedRows;
    };

    const getRowData = () => {
        let allRowsData: Array<Record<string, AcceptableFormValueOrNull>> = [];
        if (searchType === 'all') {
            Object.keys(rowData).forEach((key) => {
                let newArr = [];
                if (searchText && searchText.length) {
                    newArr = findByMatchingValue(rowData[key]);
                } else {
                    newArr = Object.keys(rowData[key]).map((val) => rowData[key][val]);
                }
                allRowsData = allRowsData.concat(newArr);
            });
        } else {
            allRowsData = findByMatchingValue(rowData[searchType]);
        }

        // For Inputs page, filter the data when tab change
        if (isTabs) {
            allRowsData = allRowsData.filter((v) => v.serviceName === serviceName);
        }

        const headerMapping =
            headers?.find((header: { field: string }) => header.field === sortKey)?.mapping || {};
        // Sort the array based on the sort value
        const sortedArr = allRowsData.sort((rowA, rowB) => {
            if (sortDir === 'asc') {
                const rowAValue =
                    rowA[sortKey] === undefined
                        ? ''
                        : headerMapping[String(rowA[sortKey])] || rowA[sortKey];
                const rowBValue =
                    rowB[sortKey] === undefined
                        ? ''
                        : headerMapping[String(rowB[sortKey])] || rowB[sortKey];
                return rowAValue > rowBValue ? 1 : -1;
            }
            if (sortDir === 'desc') {
                const rowAValue =
                    rowA[sortKey] === undefined
                        ? ''
                        : headerMapping[String(rowA[sortKey])] || rowA[sortKey];
                const rowBValue =
                    rowB[sortKey] === undefined
                        ? ''
                        : headerMapping[String(rowB[sortKey])] || rowB[sortKey];

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
            />
        </>
    );
}

TableWrapper.propTypes = {
    page: PropTypes.string,
    serviceName: PropTypes.string,
    handleRequestModalOpen: PropTypes.func,
    handleOpenPageStyleDialog: PropTypes.func,
    displayActionBtnAllRows: PropTypes.bool,
};

export default memo(TableWrapper);
