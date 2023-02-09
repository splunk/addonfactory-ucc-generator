import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Select from '@splunk/react-ui/Select';
import Button from '@splunk/react-ui/Button';
import Paginator from '@splunk/react-ui/Paginator';
import styled from 'styled-components';
import { _ } from '@splunk/ui-utils/i18n';

import TableFilter from './TableFilter';
import TableContext from '../../context/TableContext';
import { TableSelectBoxWrapper } from './CustomTableStyle';
import { PAGE_INPUT } from '../../constants/pages';

const TableHeaderWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #ccc;
    padding-top: 5px;
    margin-bottom: 5px;
`;

const TableFilterWrapper = styled.div`
    max-width: 300px;
    width: 100%;
`;

function TableHeader({ page, isTabs, services, totalElement, handleRequestModalOpen }) {
    const {
        pageSize,
        currentPage,
        setCurrentPage,
        setPageSize,
        searchType,
        setSearchType,
        setSearchText,
    } = useContext(TableContext);

    const itemLabel = page === PAGE_INPUT ? 'Input' : 'Item';

    const getSearchTypeDropdown = () => {
        if (services.length < 2) {
            return null;
        }
        let arr = [];
        arr = services.map((service) => (
            <Select.Option key={service.name} label={service.title} value={service.name} />
        ));

        arr.unshift(<Select.Option key="all" label={_('All')} value="all" />);
        return (
            <Select
                value={searchType}
                className="dropdownInput"
                onChange={(e, { value }) => {
                    setCurrentPage(0);
                    setSearchType(value);
                }}
            >
                {arr}
            </Select>
        );
    };

    return (
        <TableHeaderWrapper>
            <div>
                <span className="inputNumber">
                    {totalElement}
                    {totalElement > 1 ? _(` ${itemLabel}s`) : _(` ${itemLabel}`)}
                </span>
                {page === PAGE_INPUT ? (
                    <TableSelectBoxWrapper>
                        <Select
                            value={pageSize}
                            className="dropdownPage"
                            onChange={(e, { value }) => {
                                setCurrentPage(0);
                                setPageSize(value);
                            }}
                        >
                            <Select.Option key="10" label={_('10 Per Page')} value={10} />
                            <Select.Option key="25" label={_('25 Per Page')} value={25} />
                            <Select.Option key="50" label={_('50 Per Page')} value={50} />
                        </Select>
                        {!isTabs && getSearchTypeDropdown()}
                    </TableSelectBoxWrapper>
                ) : null}
            </div>
            <TableFilterWrapper>
                <TableFilter
                    handleChange={(e, { value }) => {
                        setCurrentPage(0);
                        setSearchText(value);
                    }}
                />
            </TableFilterWrapper>
            <div>
                <Paginator
                    onChange={(e, { page: pageNumber }) => setCurrentPage(pageNumber - 1)}
                    current={currentPage + 1}
                    alwaysShowLastPageLink
                    totalPages={Math.ceil(totalElement / pageSize)}
                />
                {isTabs && (
                    <Button
                        label={_('Add')}
                        appearance="primary"
                        onClick={handleRequestModalOpen}
                    />
                )}
            </div>
        </TableHeaderWrapper>
    );
}

TableHeader.propTypes = {
    page: PropTypes.string,
    services: PropTypes.array,
    totalElement: PropTypes.number,
    isTabs: PropTypes.bool,
    handleRequestModalOpen: PropTypes.func,
};

export default TableHeader;
