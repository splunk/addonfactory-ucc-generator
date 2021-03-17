import React, { useState, useContext, useEffect, memo } from 'react';
import update from 'immutability-helper';
import axios from 'axios';
import PropTypes from 'prop-types';

import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Select from '@splunk/react-ui/Select';
import Paginator from '@splunk/react-ui/Paginator';
import { _ } from '@splunk/ui-utils/i18n';

import TableFilter from './TableFilter';
import CustomTable from './CustomTable';
import {
    TableCaptionComponent,
    TableSelectBoxWrapper,
    WaitSpinnerWrapper,
} from './CustomTableStyle';
import { getUnifiedConfigs, generateToast } from '../../util/util';
import InputRowContext from '../../context/InputRowContext';
import { axiosCallWrapper } from '../../util/axiosCallWrapper';

function TableWrapper({ isInput, serviceName, addButton }) {
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [error, setError] = useState(null);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const { rowData, setRowData } = useContext(InputRowContext);

    const unifiedConfigs = getUnifiedConfigs();
    const services = isInput
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

    const getSearchTypeDropdown = () => {
        let arr = [];
        arr = services.map((service) => {
            return <Select.Option key={service.name} label={service.title} value={service.name} />;
        });

        arr.unshift(<Select.Option key="all" label={_('All')} value="all" />);
        return arr;
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

    const tableHeaderComponent = () => {
        return isInput ? (
            <ColumnLayout gutter={8}>
                <ColumnLayout.Row
                    style={{
                        borderTop: '1px solid #e1e6eb',
                        padding: '5px 0px',
                        marginTop: '25px',
                    }}
                >
                    <ColumnLayout.Column span={4}>
                        <TableCaptionComponent>
                            <div>
                                {totalElement}
                                {totalElement > 1 ? _(' Inputs') : _(' Input')}
                                <TableSelectBoxWrapper>
                                    <Select
                                        value={pageSize}
                                        onChange={(e, { value }) => {
                                            setCurrentPage(0);
                                            setPageSize(value);
                                        }}
                                    >
                                        <Select.Option key="10" label="10 Per Page" value={10} />
                                        <Select.Option key="25" label="25 Per Page" value={25} />
                                        <Select.Option key="50" label="50 Per Page" value={50} />
                                    </Select>
                                    <Select
                                        value={searchType}
                                        onChange={(e, { value }) => {
                                            setCurrentPage(0);
                                            setSearchType(value);
                                        }}
                                    >
                                        {getSearchTypeDropdown()}
                                    </Select>
                                </TableSelectBoxWrapper>
                            </div>
                        </TableCaptionComponent>
                    </ColumnLayout.Column>
                    <ColumnLayout.Column span={4}>
                        <TableFilter
                            handleChange={(e, { value }) => {
                                setCurrentPage(0);
                                setSearchText(value);
                            }}
                        />
                    </ColumnLayout.Column>
                    <ColumnLayout.Column
                        span={4}
                        style={{
                            textAlign: 'right',
                        }}
                    >
                        <Paginator
                            onChange={(e, { page }) => setCurrentPage(page - 1)}
                            current={currentPage + 1}
                            alwaysShowLastPageLink
                            totalPages={Math.ceil(totalElement / pageSize)}
                            style={{
                                marginRight: '30px',
                            }}
                        />
                    </ColumnLayout.Column>
                </ColumnLayout.Row>
            </ColumnLayout>
        ) : (
            <ColumnLayout gutter={8}>
                <ColumnLayout.Row
                    style={{
                        padding: '5px 0px',
                    }}
                >
                    <ColumnLayout.Column span={4}>
                        <TableCaptionComponent>
                            <div>
                                {totalElement}
                                {totalElement > 1 ? _(' Items') : _(' Items')}
                            </div>
                        </TableCaptionComponent>
                    </ColumnLayout.Column>
                    <ColumnLayout.Column span={4}>
                        <TableFilter
                            handleChange={(e, { value }) => {
                                setCurrentPage(0);
                                setSearchText(value);
                            }}
                        />
                    </ColumnLayout.Column>
                    <ColumnLayout.Column
                        span={4}
                        style={{
                            textAlign: 'right',
                        }}
                    >
                        <Paginator
                            onChange={(e, { page }) => setCurrentPage(page - 1)}
                            current={currentPage + 1}
                            alwaysShowLastPageLink
                            totalPages={Math.ceil(totalElement / pageSize)}
                            style={{
                                marginRight: '30px',
                            }}
                        />
                        {addButton}
                    </ColumnLayout.Column>
                </ColumnLayout.Row>
            </ColumnLayout>
        );
    };

    return (
        <>
            {tableHeaderComponent()}
            <CustomTable
                isInput={isInput}
                serviceName={serviceName}
                data={filteredData}
                handleToggleActionClick={(row) => changeToggleStatus(row)}
            />
        </>
    );
}

TableWrapper.propTypes = {
    isInput: PropTypes.bool,
    serviceName: PropTypes.string,
};

export default memo(TableWrapper);
