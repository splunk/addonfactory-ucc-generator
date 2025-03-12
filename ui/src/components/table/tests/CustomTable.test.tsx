import React, { useState } from 'react';
import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import Button from '@splunk/react-ui/Button';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import CustomTable from '../CustomTable';
import { setUnifiedConfig } from '../../../util/util';
import { ITableConfig } from '../../../types/globalConfig/pages';
import { TableContextProvider } from '../../../context/TableContext';
import mockCustomInputRow from '../../../../../tests/testdata/test_addons/package_global_config_everything/package/appserver/static/js/build/custom/custom_input_row';
import { getBuildDirPath } from '../../../util/script';
import { MOCK_CONFIG } from './mocks';

const handleToggleActionClick = jest.fn();
const handleOpenPageStyleDialog = jest.fn();
const handleSort = jest.fn();

const customRowFileName = 'CustomInputRow';

const buttonTestId = 'button-adding-row';

const serviceName = 'example_input_one';

const exampleProps = {
    page: 'inputs' as const,
    data: [
        {
            disabled: false,
            interval: '321321',
            name: 'test',
            serviceName,
        },
        {
            disabled: false,
            interval: '321321',
            name: 'test1',
            serviceName,
        },
        {
            disabled: false,
            interval: '321321',
            name: 'test2',
            serviceName,
        },
    ],
    sortDir: 'asc' as const,
    sortKey: 'name',
    tableConfig: {
        actions: ['edit', 'delete', 'clone', 'search'],
        header: [
            {
                label: 'Name',
                field: 'name',
            },
            {
                label: 'Interval',
                field: 'interval',
            },
            {
                label: 'Status',
                field: 'disabled',
            },
        ],
        customRow: {
            src: customRowFileName,
            type: 'external',
        },
        moreInfo: [
            {
                label: 'Name',
                field: 'name',
            },
            {
                label: 'Interval',
                field: 'interval',
            },
            {
                label: 'Status',
                field: 'disabled',
                mapping: {
                    true: 'Inactive',
                    false: 'Active',
                },
            },
        ],
    } satisfies ITableConfig,
};

const SimpleComponentToUpdateCustomTable = () => {
    const [rowsData, setRowsData] = useState(exampleProps.data);

    return (
        <TableContextProvider>
            <CustomTable
                handleToggleActionClick={handleToggleActionClick}
                handleOpenPageStyleDialog={handleOpenPageStyleDialog}
                handleSort={handleSort}
                page={exampleProps.page}
                data={rowsData}
                sortDir={exampleProps.sortDir}
                tableConfig={exampleProps.tableConfig}
            />
            <Button
                data-test={buttonTestId}
                onClick={() => {
                    setRowsData([
                        ...rowsData,
                        {
                            disabled: false,
                            interval: '123123123',
                            name: `Additional Name ${rowsData.length}`,
                            serviceName,
                        },
                    ]);
                }}
            >
                Add Row
            </Button>
        </TableContextProvider>
    );
};

function setup() {
    jest.mock(`${getBuildDirPath()}/custom/${customRowFileName}.js`, () => mockCustomInputRow, {
        virtual: true,
    });

    setUnifiedConfig(MOCK_CONFIG);

    render(<SimpleComponentToUpdateCustomTable />, { wrapper: BrowserRouter });
}

const getCollapsIcon = (inputRow: HTMLElement) =>
    within(inputRow).getByRole('cell', { name: /expand/i });

const expandRow = async (inputRow: HTMLElement) => {
    const expandable = getCollapsIcon(inputRow);
    expect(expandable).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(expandable);
};
const collapseRow = async (inputRow: HTMLElement) => {
    const expandable = getCollapsIcon(inputRow);
    expect(expandable).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(expandable);
};

const moreInfoToContainName = async (inputRow: HTMLElement, name: string) => {
    await expandRow(inputRow);

    const loading = screen.queryByText('Loading...');
    if (loading) {
        await waitForElementToBeRemoved(loading);
    }
    const allDefinitions = screen.getAllByRole('definition').map((el) => el.textContent);
    expect(allDefinitions).toContain(name);
    await collapseRow(inputRow);
};

it('should correctly display expanded row section for freshly added row', async () => {
    setup();
    const allRows = screen.getAllByRole('row');
    // 3 rows + header
    expect(allRows.length).toBe(exampleProps.data.length + 1);
    await moreInfoToContainName(allRows[1], exampleProps.data[0].name); // first row after header
    await moreInfoToContainName(allRows[3], exampleProps.data[2].name); // last row
    const btnAddRow = screen.getByTestId(buttonTestId);
    await userEvent.click(btnAddRow);
    const updatedAllRows = screen.getAllByRole('row');
    expect(updatedAllRows.length).toBe(exampleProps.data.length + 2); // 3 rows + header + added row
    await moreInfoToContainName(updatedAllRows[4], `Additional Name 3`); // added row
});
