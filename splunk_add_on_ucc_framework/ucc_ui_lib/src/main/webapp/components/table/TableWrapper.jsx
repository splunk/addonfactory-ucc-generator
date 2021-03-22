import React, { useState, useContext, useEffect, memo } from 'react';
import update from 'immutability-helper';
import axios from 'axios';
import PropTypes from 'prop-types';

import { _ } from '@splunk/ui-utils/i18n';

import CustomTable from './CustomTable';
import { WaitSpinnerWrapper } from './CustomTableStyle';
import { getUnifiedConfigs, generateToast } from '../../util/util';
import TableContext from '../../context/TableContext';
import { axiosCallWrapper } from '../../util/axiosCallWrapper';
import TableHeader from './TableHeader';

function TableWrapper({ page, serviceName, handleRequestModalOpen }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { rowData, setRowData, pageSize, currentPage, searchText, searchType } = useContext(
        TableContext
    );

    const unifiedConfigs = getUnifiedConfigs();
    const services =
        page === 'inputs'
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
                    };
                });
                obj[service.name] = tmpObj;
            }
        });
        setRowData(obj);
        setLoading(false);
    };

    const fetchInputs = () => {
        setLoading(true);
        const requests = [];
        services.forEach((service) => {
            requests.push(
                axiosCallWrapper({
                    serviceName: service.name,
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
                    errorCode = 'ERR0001';
                } else if (error.request) {
                    // The request was made but no response was received
                    message = `No response received while making request to input services`;
                    errorCode = 'ERR0002';
                } else {
                    // Something happened in setting up the request that triggered an Error
                    message = `Error making request to input services`;
                    errorCode = 'ERR0003';
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
                    [row.name]: { __toggleDisable: { $set: true } },
                },
            });
        });
        const params = new URLSearchParams();
        params.append('disabled', !row.disabled);

        axiosCallWrapper({
            serviceName: `${row.serviceName}/${row.name}`,
            params,
            customHeaders: { 'Content-Type': 'application/x-www-form-urlencoded' },
            method: 'post',
            handleError: true,
            callbackOnError: () => {
                setRowData((currentRowData) => {
                    return update(currentRowData, {
                        [row.serviceName]: {
                            [row.name]: { __toggleDisable: { $set: false } },
                        },
                    });
                });
            },
        }).then((response) => {
            setRowData((currentRowData) => {
                return update(currentRowData, {
                    [row.serviceName]: {
                        [row.name]: {
                            disabled: { $set: response.data.entry[0].content.disabled },
                            __toggleDisable: { $set: false },
                        },
                    },
                });
            });
        });
    };

    /**
     *
     * @param {Array} data
     * This function will iterate an arrray and match each key-value with the searchText
     * It will return a new array which will match with searchText
     */
    const findByMatchingValue = (data) => {
        const arr = [];
        Object.keys(data).forEach((v) => {
            let found = false;
            Object.keys(data[v]).forEach((vv) => {
                if (
                    typeof data[v][vv] === 'string' &&
                    data[v][vv].toLowerCase().includes(searchText.toLowerCase())
                ) {
                    if (!found) {
                        arr.push(data[v]);
                        found = true;
                    }
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
        return [arr.slice(currentPage * pageSize, (currentPage + 1) * pageSize), arr.length];
    };

    if (error?.uccErrorCode) {
        throw error;
    }
    if (loading) {
        return <WaitSpinnerWrapper size="large" />;
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
            />
        </>
    );
}

TableWrapper.propTypes = {
    page: PropTypes.string,
    serviceName: PropTypes.string,
    handleRequestModalOpen: PropTypes.func,
};

export default memo(TableWrapper);
