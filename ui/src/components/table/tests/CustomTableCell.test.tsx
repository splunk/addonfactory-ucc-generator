import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { http, HttpResponse } from 'msw';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

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
    handleRequestModalOpen: jest.fn(),
    handleOpenPageStyleDialog: jest.fn(),
} satisfies ITableWrapperProps;

const mockCustomCell = () => {
    jest.resetModules();
    jest.mock(`${getBuildDirPath()}/custom/${CUSTOM_CELL_FILE_NAME}.js`, () => MockCustomCell, {
        virtual: true,
    });
};

const mockCustomCellError = () => {
    jest.resetModules();
    jest.mock(
        `${getBuildDirPath()}/custom/${CUSTOM_CELL_FILE_NAME}.js`,
        () => MockCustomCellError,
        {
            virtual: true,
        }
    );
};

const mockCustomCellWithoutRender = () => {
    jest.resetModules();
    jest.mock(
        `${getBuildDirPath()}/custom/${CUSTOM_CELL_FILE_NAME}.js`,
        () => MockCustomCellNoRender,
        {
            virtual: true,
        }
    );
};
const mockCustomCellToUndefined = () => {
    jest.resetModules();
    jest.mock(`${getBuildDirPath()}/custom/${CUSTOM_CELL_FILE_NAME}.js`, () => undefined, {
        virtual: true,
    });
};

const waitForRow = async () => {
    const nameRegexp = new RegExp(`example_input_one${intervalBase}0`, 'i');
    // wait for the first row to be rendered
    const row = await screen.findByRole('row', { name: nameRegexp });

    expect(row).toBeInTheDocument();
    return row;
};

function mocksAndRenderTable() {
    setUnifiedConfig(MOCK_CONFIG_CUSTOM_CELL);

    const data = dataIterators.map((iter) => ({
        name: `${inputName}${intervalBase}${iter}`,
        content: {
            interval: Number(`${intervalBase}${iter}`),
        },
    }));

    server.use(
        http.get(`/servicesNS/nobody/-/splunk_ta_uccexample_${inputName}`, () =>
            HttpResponse.json(getMockServerResponseForInput(data))
        )
    );

    render(
        <TableContextProvider>
            <TableWrapper {...props} />
        </TableContextProvider>,
        { wrapper: BrowserRouter }
    );
}

it.each([
    { interval: 10, expected: 'Ten seconds' },
    { interval: 11, expected: 'Eleven seconds' },
    { interval: 12, expected: 'Twelve seconds' },
    { interval: 13, expected: '13' },
    { interval: 14, expected: '14' },
    { interval: 15, expected: '15' },
])('Render custom cell correctly for interval $interval', async ({ interval, expected }) => {
    mockCustomCell();
    mocksAndRenderTable();
    const nameRegexp = new RegExp(`example_input_one${interval}`, 'i');
    const row = await screen.findByRole('row', { name: nameRegexp });

    const customCell = within(row).getByText(expected);
    expect(customCell).toBeInTheDocument();

    const nameCell = within(row).getByText(`example_input_one${interval}`);
    expect(nameCell).toBeInTheDocument();
});

it('Render custom cell with Error message', async () => {
    mockCustomCellError();
    const mockConsoleError = jest.fn();
    consoleError.mockImplementation(mockConsoleError);
    mocksAndRenderTable();

    const row = await waitForRow();

    expect(mockConsoleError).toHaveBeenCalledWith(
        '[Custom Cell] Something went wrong while calling render. Error: Error Custom cell render error'
    );

    // Interval cell should be empty because of the error
    const emptyCells = within(row).getAllByRole('cell', { name: '' });
    const isIntervalInEmptyCell = emptyCells.some((cell) => cell.dataset.column === 'interval');
    expect(isIntervalInEmptyCell).toBe(true);
});

it('Error as custom cell without render method', async () => {
    mockCustomCellWithoutRender();
    mocksAndRenderTable();

    const row = await waitForRow();

    const errorMessage = within(row).queryByText('"Render" method should be present.');
    expect(errorMessage).toBeInTheDocument();
});

it('Error as custom cell file is undefined', async () => {
    mockCustomCellToUndefined();
    mocksAndRenderTable();

    const row = await waitForRow();

    const errorMessage = within(row).queryByText('Loaded module is not a constructor function');
    expect(errorMessage).toBeInTheDocument();
});

it('should update custom Cell Row when Input has changed', async () => {
    mockCustomCell();
    mocksAndRenderTable();

    // get first row
    const inputRow = await screen.findByRole('row', { name: /example_input_one10/i });

    // simulate the server response for the post request
    server.use(
        http.post(
            `/servicesNS/nobody/-/splunk_ta_uccexample_${inputName}/${inputName}${intervalBase}${0}`,
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
                            name: `${inputName}${intervalBase}${0}`,
                            content: formDataObject,
                        },
                    ])
                );
            }
        )
    );

    const customCell = within(inputRow).getByText('Ten seconds');
    expect(customCell).toBeInTheDocument();

    await userEvent.click(within(inputRow).getByRole('button', { name: /edit/i }));
    const dialog = await screen.findByRole('dialog');

    const textBoxes = within(dialog).getAllByRole('textbox');
    expect(textBoxes).toHaveLength(2);

    const intervalInput = textBoxes[1];
    expect(intervalInput).toHaveValue('10');

    await userEvent.clear(intervalInput);
    await userEvent.type(intervalInput, '8765675');
    await userEvent.click(screen.getByRole('button', { name: /update/i }));

    const inputRowAfterChange = await screen.findByRole('row', { name: /example_input_one10/i });
    const customCellAfterChange = within(inputRowAfterChange).getByText('8765675');
    expect(customCellAfterChange).toBeInTheDocument();
});
