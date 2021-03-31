import React, { memo, useCallback } from 'react';
import Table from '@splunk/react-ui/Table';
import PropTypes from 'prop-types';

import { getUnifiedConfigs } from '../../util/util';
import { getExpansionRow } from './TableExpansionRow';
import CustomTableRow from './CustomTableRow';

function CustomTable({
    page,
    serviceName,
    data,
    handleToggleActionClick,
    handleSort,
    sortDir,
    sortKey,
}) {
    const unifiedConfigs = getUnifiedConfigs();

    const tableConfig =
        page === 'inputs'
            ? unifiedConfigs.pages.inputs.table
            : unifiedConfigs.pages.configuration.tabs.filter((x) => x.name === serviceName)[0]
                  .table;
    const { moreInfo } = tableConfig;
    const headers = tableConfig.header;

    // TODO: add multi field mapping support
    const statusMapping = moreInfo?.filter((a) => a.mapping);

    const generateColumns = () => {
        const column = [];
        if (headers && headers.length) {
            headers.forEach((header) => {
                column.push({
                    ...header,
                    sortKey: header.field || null,
                });
            });
        }
        column.push({ label: 'Actions', field: 'actions', sortKey: '' });
        return column;
    };

    const columns = generateColumns();

    const getTableHeaderCell = useCallback(() => {
        return (
            <Table.Head>
                {columns &&
                    columns.length &&
                    columns.map((headData) => (
                        <Table.HeadCell
                            key={headData.field}
                            onSort={headData.sortKey ? handleSort : null}
                            sortKey={headData.sortKey ? headData.sortKey : null}
                            sortDir={
                                headData.sortKey && headData.sortKey === sortKey ? sortDir : 'none'
                            }
                        >
                            {headData.label}
                        </Table.HeadCell>
                    ))}
            </Table.Head>
        );
    }, [columns, handleSort, sortDir, sortKey]);

    const getTableBody = () => {
        return (
            <Table.Body>
                {data &&
                    data.length &&
                    data.map((row) => {
                        return (
                            <CustomTableRow
                                key={row.id}
                                row={row}
                                columns={columns}
                                statusMapping={statusMapping}
                                unifiedConfigs={unifiedConfigs}
                                page={page}
                                handleToggleActionClick={handleToggleActionClick}
                                {...(moreInfo
                                    ? {
                                          expansionRow: getExpansionRow(
                                              columns.length,
                                              row,
                                              moreInfo
                                          ),
                                      }
                                    : {})}
                            />
                        );
                    })}
            </Table.Body>
        );
    };

    return (
        <>
            {columns && columns.length && (
                <Table stripeRows {...(moreInfo ? { rowExpansion: 'single' } : {})}>
                    {getTableHeaderCell()}
                    {getTableBody()}
                </Table>
            )}
        </>
    );
}

CustomTable.propTypes = {
    page: PropTypes.string.isRequired,
    serviceName: PropTypes.string,
    data: PropTypes.array.isRequired,
    handleToggleActionClick: PropTypes.func,
    handleSort: PropTypes.func,
    sortDir: PropTypes.string,
    sortKey: PropTypes.string,
};

export default memo(CustomTable);
