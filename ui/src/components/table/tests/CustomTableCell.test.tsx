import { render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { http, HttpResponse } from 'msw';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import TableWrapper, { ITableWrapperProps } from '../TableWrapper';
import { server } from '../../../mocks/server';
import { TableContextProvider } from '../../../context/TableContext';
import { setUnifiedConfig } from '../../../util/util';
import { getMockServerResponseForInput } from '../../../mocks/server-response';
import { getBuildDirPath } from '../../../util/script';
import { CUSTOM_CELL_FILE_NAME, MOCK_CONFIG_CUSTOM_CELL } from './mocks';
import { CustomCellMock as MockCustomCell } from './mocks/CustomCellMock';
import { CustomCellMockError as MockCustomCellError } from './mocks/CustomCellMockError';
import { CustomCellMockNoRender as MockCustomCellNoRender } from './mocks/CustomCellMockNoRender';
import { consoleError } from '../../../../test.setup';

const inputName = 'example_input_one';
const intervalBase = 1;
const dataIterators = [0, 1, 2, 3, 4, 5];

const props = {
    page: 'inputs',
    serviceName: inputName,
    handleRequestModalOpen: vi.fn(),
    handleOpenPageStyleDialog: vi.fn(),
} satisfies ITableWrapperProps;

const mockCustomCell = () => {
    vi.doMock(`${getBuildDirPath()}/custom/${CUSTOM_CELL_FILE_NAME}.js`, () => ({
        default: MockCustomCell,
    }));
};

const mockCustomCellError = () => {
    vi.doMock(`${getBuildDirPath()}/custom/${CUSTOM_CELL_FILE_NAME}.js`, () => ({
        default: MockCustomCellError,
    }));
};

const mockCustomCellWithoutRender = () => {
    vi.doMock(`${getBuildDirPath()}/custom/${CUSTOM_CELL_FILE_NAME}.js`, () => ({
        default: MockCustomCellNoRender,
    }));
};
const mockCustomCellToUndefined = () => {
    vi.doMock(`${getBuildDirPath()}/custom/${CUSTOM_CELL_FILE_NAME}.js`, () => ({
        default: undefined,
    }));
};

const waitForRow = async () => {
    const nameRegexp = new RegExp(`example_input_one${intervalBase}0`, 'i');
    // wait for the first row to be rendered
    const row = await screen.findByRole('row', { name: nameRegexp });

    return row;
};

function mocksAndRenderTable(useOnlyThisInterval?: number) {
    setUnifiedConfig(MOCK_CONFIG_CUSTOM_CELL);

    const data = dataIterators.map((iter) => ({
        name: `${inputName}${intervalBase}${iter}`,
        content: {
            interval: Number(`${intervalBase}${iter}`),
        },
    }));

    const filteredData = useOnlyThisInterval
        ? data.filter((item) => item.content.interval === useOnlyThisInterval)
        : data;
    server.use(
        http.get(`/servicesNS/nobody/-/splunk_ta_uccexample_${inputName}`, () =>
            HttpResponse.json(getMockServerResponseForInput(filteredData))
        )
    );

    render(
        <TableContextProvider>
            <TableWrapper {...props} />
        </TableContextProvider>,
        { wrapper: BrowserRouter }
    );
}

test.each([
    { interval: 10, expected: 'Ten seconds' },
    { interval: 11, expected: 'Eleven seconds' },
    { interval: 12, expected: 'Twelve seconds' },
    { interval: 13, expected: '13' },
    { interval: 14, expected: '14' },
    { interval: 15, expected: '15' },
])('Render custom cell correctly for interval $interval', async ({ interval, expected }) => {
    mockCustomCell();
    // render only one row as mock for custom cell work just for the first time
    // so we need to render only one row
    mocksAndRenderTable(interval);
    const nameRegexp = new RegExp(`example_input_one${interval}`, 'i');
    const row = await screen.findByRole('row', { name: nameRegexp });

    const customCell = await within(row).findByText(expected);
    expect(customCell).toBeInTheDocument();

    const nameCell = screen.getByText(`example_input_one${interval}`);
    expect(nameCell).toBeInTheDocument();
});

test('Render custom cell with Error message', async () => {
    mockCustomCellError();
    const mockConsoleError = vi.fn();
    consoleError.mockImplementation(mockConsoleError);
    mocksAndRenderTable(10);

    const row = await waitForRow();
    expect(row).toBeInTheDocument();

    await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
            '[Custom Cell] Something went wrong while calling render. Error: Error Custom cell render error'
        );
    });

    // Interval cell should be empty because of the error
    const emptyCells = within(row).getAllByRole('cell', { name: '' });
    const isIntervalInEmptyCell = emptyCells.some((cell) => cell.dataset.column === 'interval');
    expect(isIntervalInEmptyCell).toBe(true);
});

test('Error as custom cell without render method', async () => {
    mockCustomCellWithoutRender();
    mocksAndRenderTable();

    const row = await waitForRow();
    expect(row).toBeInTheDocument();

    await waitFor(() => {
        const errorMessage = within(row).queryByText('"Render" method should be present.');
        expect(errorMessage).toBeInTheDocument();
    });
});

test('Error as custom cell file is undefined', async () => {
    consoleError.mockImplementation(() => {});
    mockCustomCellToUndefined();
    mocksAndRenderTable();

    const row = await waitForRow();
    expect(row).toBeInTheDocument();

    await waitFor(() => {
        const errorMessage = within(row).queryByText('Loaded module is not a constructor function');
        expect(errorMessage).toBeInTheDocument();
    });
});

test('should update custom Cell Row when Input has changed', async () => {
    mockCustomCell();
    // render only one row as mock for custom cell work just for the first time
    mocksAndRenderTable(11);

    // get first and only row
    const inputRow = await screen.findByRole('row', { name: /example_input_one11/i });

    // simulate the server response for the post request
    server.use(
        http.post(
            `/servicesNS/nobody/-/splunk_ta_uccexample_${inputName}/${inputName}${intervalBase}${1}`,
            async ({ request }) => {
                const formData = await request.formData();
                const formDataObject: Record<string, string> = {};
                formData.forEach((value, key) => {
                    if (typeof value === 'string') {
                        formDataObject[key] = value;
                    }
                });
                return HttpResponse.json(
                    getMockServerResponseForInput([
                        {
                            name: `${inputName}${intervalBase}${1}`,
                            content: formDataObject,
                        },
                    ])
                );
            }
        )
    );

    await screen.findByText('Eleven seconds');

    await userEvent.click(within(inputRow).getByRole('button', { name: /edit/i }));
    const dialog = await screen.findByRole('dialog');
    const textBoxes = within(dialog).getAllByRole('textbox');
    expect(textBoxes).toHaveLength(2);
    const intervalInput = textBoxes[1];
    expect(intervalInput).toHaveValue('11');

    await userEvent.clear(intervalInput);
    await userEvent.type(intervalInput, '8765675');
    await userEvent.click(screen.getByRole('button', { name: /update/i }));

    const inputRowAfterChange = await screen.findByRole('row', {
        name: /example_input_one11/i,
    });
    const customCellAfterChange = within(inputRowAfterChange).getByText('8765675');
    expect(customCellAfterChange).toBeInTheDocument();
});
