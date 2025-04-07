import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { http, HttpResponse } from 'msw';
import { BrowserRouter } from 'react-router-dom';
import TableWrapper, { ITableWrapperProps } from '../TableWrapper';
import { server } from '../../../mocks/server';
import { TableContextProvider } from '../../../context/TableContext';
import { setUnifiedConfig } from '../../../util/util';
import { getMockServerResponseForInput } from '../../../mocks/server-response';
import { getBuildDirPath } from '../../../util/script';
import { CUSTOM_CELL_FILE_NAME, MOCK_CONFIG_CUSTOM_CELL } from './mocks';
import { CustomCellMock as MockCustomCell } from './mocks/CustomCellMock';

const inputName = 'example_input_one';
const intervalBase = 1;
const dataIterators = [0, 1, 2, 3, 4, 5];

const props = {
    page: 'inputs',
    serviceName: inputName,
    handleRequestModalOpen: jest.fn(),
    handleOpenPageStyleDialog: jest.fn(),
} satisfies ITableWrapperProps;

function renderTable() {
    jest.mock(`${getBuildDirPath()}/custom/${CUSTOM_CELL_FILE_NAME}.js`, () => MockCustomCell, {
        virtual: true,
    });

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
    renderTable();
    const nameRegexp = new RegExp(`example_input_one${interval}`, 'i');
    const row = await screen.findByRole('row', { name: nameRegexp });

    const customCell = within(row).getByText(expected);
    expect(customCell).toBeInTheDocument();
});
