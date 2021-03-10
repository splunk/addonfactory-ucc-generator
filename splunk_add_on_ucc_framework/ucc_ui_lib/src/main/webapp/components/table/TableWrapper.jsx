import React, { useState } from 'react';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import TableFilter from '../../components/table/TableFilter';
import Table from '../../components/table/Table';
import { TableCaptionComponent } from './TableStyle';
import Select from '@splunk/react-ui/Select';
import { getUnifiedConfigs } from '../../util/util';

import PropTypes from 'prop-types';
import { TableSelectBoxWrapper } from './TableStyle';

function TableWrapper({ isInput, serviceName, rowData }) {

    const [searchText, setSearchText] = useState("");
    const [searchType, setSearchType] = useState("all");

    /**
     * 
     * @param row {Object} row
     */
    const changeStatus = (row) => {
        // let oldData = rowData['sfdc_event_log'];
        // const index = oldData.findIndex((val) => { return val.id == row.id });
        // if (index != -1) {
        // oldData[3].disabled = !oldData[3].disabled;
        // }
        //setRowData(data => ([...oldData]));
    }

    const handleFilterChange = (e, { value }) => {
        setSearchText(value);
    }

    const handleChange = (e, { value }) => {
        setSearchType(value);
    };

    const getSearchTypeDropdown = () => {
        const unifiedConfigs = getUnifiedConfigs();
        const services = unifiedConfigs.pages.inputs.services;

        let arr = [];
        arr = services.map((service) => {
            return <Select.Option label={service.title} value={service.name} />
        });

        arr.unshift(<Select.Option label="All" value="all" />);
        return arr;
    }

    const findByMatchingValue = (data) => {
        let arr = [];
        data.forEach((val) => {
            let found = false;
            Object.keys(val).forEach((key) => {
                if (typeof val[key] == 'string' && val[key].toLowerCase().includes(searchText.toLowerCase())) {
                    if (!found) {
                        arr.push(val);
                        found = true;
                    }
                }
            })
        });
        return arr;
    }

    const getRowData = () => {
        if (searchType == "all") {
            let arr = [];
            Object.keys(rowData).forEach((key) => {
                let newArr = [];
                if (searchText && searchText.length) {
                    newArr = findByMatchingValue(rowData[key]);
                } else {
                    newArr = rowData[key];
                }
                arr = arr.concat(newArr);
            });
            return arr;
        } else {
            return findByMatchingValue(rowData[searchType]);
        }
    }

    const filteredData = getRowData();

    return (
        <>
            <ColumnLayout gutter={8}>
                <ColumnLayout.Row style={{
                    "borderTop": "1px solid #e1e6eb",
                    "padding": "5px"
                }}>
                    <ColumnLayout.Column span={4}>
                        <TableCaptionComponent>
                            <div>
                                {filteredData.length} Input{filteredData.length > 1 && <span>s</span>}
                                <TableSelectBoxWrapper>
                                    <Select value={searchType} onChange={handleChange}>
                                        {getSearchTypeDropdown()}
                                    </Select>
                                </TableSelectBoxWrapper>
                            </div>
                        </TableCaptionComponent>
                    </ColumnLayout.Column>
                    <ColumnLayout.Column span={4}>
                        <TableFilter handleChange={handleFilterChange} />
                    </ColumnLayout.Column>
                    <ColumnLayout.Column span={4}>

                    </ColumnLayout.Column>
                </ColumnLayout.Row>
            </ColumnLayout>

            <Table
                isInput={isInput}
                serviceName={serviceName}
                data={filteredData}
                handleToggleActionClick={(row) => changeStatus(row)}
            />
        </>
    )
}

TableWrapper.propTypes = {
    isInput: PropTypes.boolean,
    serviceName: PropTypes.string.isRequired
};

export default TableWrapper;
