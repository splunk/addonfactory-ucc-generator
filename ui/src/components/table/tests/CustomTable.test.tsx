import React, { useState } from 'react';
import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import Button from '@splunk/react-ui/Button';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import CustomTable from '../CustomTable';
import { setUnifiedConfig } from '../../../util/util';
import { ITableConfig } from '../../../types/globalConfig/pages';
import { TableContextProvider } from '../../../context/TableContext';
import { getBuildDirPath } from '../../../util/script';
import { MOCK_CONFIG } from './mocks';
import { invariant } from '../../../util/invariant';
import mockCustomControlMockForTest from './mocks/CustomInputRowMock';
import {
    CustomComponentContextType,
    CustomComponentContextProvider,
} from '../../../context/CustomComponentContext';
import { CustomRowConstructor } from '../CustomRowBase';

const handleToggleActionClick = vi.fn();
const handleOpenPageStyleDialog = vi.fn();
const handleSort = vi.fn();

const customRowFileName = 'CustomInputRow';

const buttonTestId = 'button-adding-row';

const serviceName = 'example_input_one';

const serviceTitle = 'Example Input One';

const exampleProps = {
    page: 'inputs' as const,
    data: [
        {
            disabled: false,
            interval: '321321',
            name: 'test',
            serviceName,
            serviceTitle,
        },
        {
            disabled: false,
            interval: '321321',
            name: 'test1',
            serviceName,
            serviceTitle,
        },
        {
            disabled: false,
            interval: '321321',
            name: 'test2',
            serviceName,
            serviceTitle,
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
                            serviceTitle,
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
    vi.doMock(`${getBuildDirPath()}/custom/${customRowFileName}.js`, () => ({
        default: mockCustomControlMockForTest,
    }));

    setUnifiedConfig(MOCK_CONFIG);

    render(<SimpleComponentToUpdateCustomTable />, { wrapper: BrowserRouter });
}

function setupComponentContext() {
    const compContext: CustomComponentContextType = {
        [customRowFileName]: {
            component: mockCustomControlMockForTest as CustomRowConstructor,
            type: 'row',
        },
    };

    setUnifiedConfig(MOCK_CONFIG);

    render(
        <CustomComponentContextProvider customComponents={compContext}>
            <SimpleComponentToUpdateCustomTable />
        </CustomComponentContextProvider>,
        { wrapper: BrowserRouter }
    );
}

const getCollapsIcon = (inputRow: HTMLElement) => {
    const expandableCell = within(inputRow).getByTestId('expand');
    invariant(expandableCell, 'Expandable cell not found');
    const expandable = within(expandableCell).getByRole('button');
    invariant(expandable, 'Expandable button not found');

    return expandable;
};

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
    const allDefinitions = (await screen.findAllByRole('definition')).map((el) => el.textContent);
    expect(allDefinitions).toContain(name);
    await collapseRow(inputRow);
};

it.each([setup, setupComponentContext])(
    'should correctly display expanded row section for freshly added row',
    async (setupFnc) => {
        setupFnc();
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
    }
);
