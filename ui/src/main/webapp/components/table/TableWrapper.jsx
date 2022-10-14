import React, { useState, useContext, useEffect, memo } from 'react';
import update from 'immutability-helper';
import axios from 'axios';
import PropTypes from 'prop-types';

import { WaitSpinnerWrapper } from './CustomTableStyle';
import { axiosCallWrapper } from '../../util/axiosCallWrapper';
import { getUnifiedConfigs, generateToast, isTrue } from '../../util/util';
import CustomTable from './CustomTable';
import TableHeader from './TableHeader';
import TableContext from '../../context/TableContext';
import { PAGE_INPUT } from '../../constants/pages';

function TableWrapper({ page, serviceName, handleRequestModalOpen, handleOpenPageStyleDialog }) {
    const [sortKey, setSortKey] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [isCustomMapping, setCustomMappingStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { rowData, setRowData, pageSize, currentPage, searchText, searchType } = useContext(
        TableContext
    );

    const unifiedConfigs = getUnifiedConfigs();
    const tableConfig =
        page === PAGE_INPUT
            ? unifiedConfigs.pages.inputs.table
            : unifiedConfigs.pages.configuration.tabs.filter((x) => x.name === serviceName)[0]
                  .table;
    const headers = tableConfig.header;
    const { moreInfo } = tableConfig;
    const services =
        page === PAGE_INPUT
            ? unifiedConfigs.pages.inputs.services
            : unifiedConfigs.pages.configuration.tabs.filter((x) => x.name === serviceName);

    const modifyAPIResponse = (data) => {
        const obj = {};
        services.forEach((service, index) => {
            if (service && service.name && data) {
                const tmpObj = {};
                data[index].forEach((val) => {
                    tmpObj[val.name] = {
                        ...val.content,
                        id: val.id,
                        name: val.name,
                        serviceName: service.name,
                        serviceTitle: service.title || ''
                    };
                });
                obj[service.name] = tmpObj;
            }
        });
        setRowData(obj);
        setLoading(false);
    };

    const fetchInputs = () => {
        const requests = [];
        services.forEach((service) => {
            requests.push(
                axiosCallWrapper({
                    serviceName: service.name,
                    params: { count: -1 },
                })
            );
        });
        axios
            .all(requests)
            // eslint-disable-next-line no-shadow
            .catch((error) => {
                let message = '';
                let errorCode = '';
                if (error.response) {
                    // The request was made and the server responded with a status code
                    message = `Error received from server: ${error.response.data.messages[0].text}`;
                    errorCode = page === PAGE_INPUT ? 'ERR0001' : 'ERR0002';
                } else if (error.request) {
                    // The request was made but no response was received
                    message = `No response received while making request to ${page} services`;
                    errorCode = 'ERR0003';
                } else {
                    // Something happened in setting up the request that triggered an Error
                    message = `Error making request to ${page} services`;
                    errorCode = 'ERR0004';
                }
                // eslint-disable-next-line no-param-reassign
                error.uccErrorCode = errorCode;
                generateToast(message);
                setLoading(false);
                setError(error);
                return Promise.reject(error);
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
    const changeToggleStatus = (row) => {
        setRowData((currentRowData) => {
            return update(currentRowData, {
                [row.serviceName]: {
                    [row.name]: {
                        __toggleShowSpinner: { $set: true },
                    },
                },
            });
        });
        const body = new URLSearchParams();
        body.append('disabled', !row.disabled);
        axiosCallWrapper({
            serviceName: `${row.serviceName}/${row.name}`,
            body,
            customHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' },
            method: 'post',
            handleError: true,
            callbackOnError: () => {
                setRowData((currentRowData) => {
                    return update(currentRowData, {
                        [row.serviceName]: {
                            [row.name]: {
                                __toggleShowSpinner: { $set: false },
                            },
                        },
                    });
                });
            },
        }).then((response) => {
            setRowData((currentRowData) => {
                return update(currentRowData, {
                    [row.serviceName]: {
                        [row.name]: {
                            // ADDON-39125: isTrue required if splunktaucclib resthandlers' super() is not invoked
                            disabled: { $set: isTrue(response.data.entry[0].content.disabled) },
                            __toggleShowSpinner: { $set: false },
                        },
                    },
                });
            });
        });
    };

    const handleSort = (e, val) => {
        const prevSortKey = sortKey;
        const prevSortDir = prevSortKey === val.sortKey ? sortDir : 'none';
        const nextSortDir = prevSortDir === 'asc' ? 'desc' : 'asc';
        setSortDir(nextSortDir);
        setSortKey(val.sortKey);
        setCustomMappingStatus(val.isCustomMapping);
    };

    /**
     *
     * @param {Array} data
     * This function will iterate an arrray and match each key-value with the searchText
     * It will return a new array which will match with searchText
     */
    const findByMatchingValue = (data) => {
        const arr = [];
        const tableFields = [];

        headers.forEach((headData) => {
            tableFields.push(headData.field);
        });
        moreInfo?.forEach((moreInfoData) => {
            tableFields.push(moreInfoData.field);
        });

        Object.keys(data).forEach((v) => {
            let found = false;
            Object.keys(data[v]).forEach((vv) => {
                if (
                    tableFields.includes(vv) &&
                    typeof data[v][vv] === 'string' &&
                    data[v][vv].toLowerCase().includes(searchText.toLowerCase().trim()) &&
                    !found
                ) {
                    arr.push(data[v]);
                    found = true;
                }
            });
        });
        return arr;
    };

    const getRowData = () => {
        let arr = [];
        if (searchType === 'all') {
            Object.keys(rowData).forEach((key) => {
                let newArr = [];
                if (searchText && searchText.length) {
                    newArr = findByMatchingValue(rowData[key]);
                } else {
                    newArr = Object.keys(rowData[key]).map((val) => rowData[key][val]);
                }
                arr = arr.concat(newArr);
            });
        } else {
            arr = findByMatchingValue(rowData[searchType]);
        }

        const _sortKey = isCustomMapping ? 'serviceTitle' : sortKey;

        // Sort the array based on the sort value
        const sortedArr = arr.sort((rowA, rowB) => {
            if (sortDir === 'asc') {
                const rowAValue = rowA[_sortKey] === undefined ? '' : rowA[_sortKey];
                const rowBValue = rowB[_sortKey] === undefined ? '' : rowB[_sortKey];
                return rowAValue > rowBValue ? 1 : -1;
            }
            if (sortDir === 'desc') {
                const rowAValue = rowA[_sortKey] === undefined ? '' : rowA[_sortKey];
                const rowBValue = rowB[_sortKey] === undefined ? '' : rowB[_sortKey];
                return rowBValue > rowAValue ? 1 : -1;
            }
            return 0;
        });

        let updatedArr = sortedArr.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

        if (currentPage > 0 && !updatedArr.length) {
            updatedArr = sortedArr.slice((currentPage - 1) * pageSize, pageSize);
        }

        return [updatedArr, arr.length];
    };

    if (error?.uccErrorCode) {
        throw error;
    }

    if (loading) {
        return <WaitSpinnerWrapper />;
    }

    const [filteredData, totalElement] = getRowData();

    return (
        <>
            <TableHeader
                page={page}
                services={services}
                totalElement={totalElement}
                handleRequestModalOpen={handleRequestModalOpen}
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
            />
        </>
    );
}

TableWrapper.propTypes = {
    page: PropTypes.string,
    serviceName: PropTypes.string,
    handleRequestModalOpen: PropTypes.func,
    handleOpenPageStyleDialog: PropTypes.func,
};

export default memo(TableWrapper);
