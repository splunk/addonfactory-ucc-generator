import { render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

import TableWrapper, { ITableWrapperProps } from '../TableWrapper';
import { server } from '../../../mocks/server';
import { TableContextProvider } from '../../../context/TableContext';
import { setUnifiedConfig } from '../../../util/util';
import { getConfigWithHeadersManyServices } from './mocks';
import { MockRowData } from '../stories/rowDataMockup';
import { invariant } from '../../../util/invariant';

const inputName = 'example_input_one';

const props = {
    page: 'inputs',
    handleRequestModalOpen: vi.fn(),
    handleOpenPageStyleDialog: vi.fn(),
} satisfies ITableWrapperProps;

const headers = [
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
];

function mocksDataAndRenderTable() {
    server.use(
        http.get(`/servicesNS/nobody/-/splunk_ta_uccexample_${inputName}0`, () =>
            HttpResponse.json(MockRowData)
        )
    );

    render(
        <TableContextProvider>
            <TableWrapper {...props} />
        </TableContextProvider>,
        { wrapper: BrowserRouter }
    );
}
/**
 * max rowNumber is 11 (10 data rows + header row)
 *
 * rowNumber is the number of rows that should be displayed + header row
 *
 * for example, if there are 9 data rows, rowNumber should be 10
 */
const verifyLengthOfDisplayedRows = (rowNumber: number) => {
    const allDisplayedRowsAfterClear = screen.getAllByRole('row');
    expect(allDisplayedRowsAfterClear.length).toEqual(rowNumber);
};

it('correctly renders the table headers', async () => {
    setUnifiedConfig(getConfigWithHeadersManyServices(headers, 1));

    mocksDataAndRenderTable();

    const tableHeaderColumns = await screen.findAllByRole('columnheader');
    expect(tableHeaderColumns.length).toEqual(headers.length + 2); // +2 for actions and more info
});

it('All services filter button render as 3 services', async () => {
    setUnifiedConfig(getConfigWithHeadersManyServices(headers, 3));
    mocksDataAndRenderTable();

    await screen.findByRole('table');

    const serviceFilter = screen.getByRole('combobox', { name: 'All' });
    expect(serviceFilter).toBeInTheDocument();
});

it('All services filter button not render as 1 service', async () => {
    setUnifiedConfig(getConfigWithHeadersManyServices(headers, 1));
    mocksDataAndRenderTable();

    await screen.findByRole('table');

    const serviceFilter = screen.queryByRole('combobox', { name: 'All' });
    expect(serviceFilter).not.toBeInTheDocument();
});

it('All services filter button lists all services', async () => {
    setUnifiedConfig(getConfigWithHeadersManyServices(headers, 5));
    mocksDataAndRenderTable();

    const user = userEvent.setup();

    await screen.findByRole('table');

    const serviceFilter = screen.getByRole('combobox', { name: 'All' });
    expect(serviceFilter).toBeInTheDocument();

    await user.click(serviceFilter);

    const popoverId = serviceFilter.getAttribute('aria-controls');
    invariant(popoverId, 'Popover ID not found');

    const popover = await screen.findByTestId('popover');
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveAttribute('id', popoverId);

    const serviceOptions = await screen.findAllByRole('option');
    expect(serviceOptions.length).toEqual(6);
    expect(serviceOptions[0]).toHaveTextContent('All');
    expect(serviceOptions[1]).toHaveTextContent('example_input_one0');
    expect(serviceOptions[2]).toHaveTextContent('example_input_one1');
    expect(serviceOptions[3]).toHaveTextContent('example_input_one2');
    expect(serviceOptions[4]).toHaveTextContent('example_input_one3');
    expect(serviceOptions[5]).toHaveTextContent('example_input_one4');

    await user.click(serviceOptions[2]);

    await waitFor(() => {
        const popoverAfterSelect = screen.queryByTestId('popover');
        expect(popoverAfterSelect).not.toBeInTheDocument();
    });

    expect(serviceFilter).toHaveTextContent('example_input_one1');
    expect(serviceFilter).not.toHaveTextContent('All');
    expect(serviceFilter).toHaveAttribute('aria-expanded', 'false');
});

it('Services paginator works properly', async () => {
    setUnifiedConfig(getConfigWithHeadersManyServices(headers, 5));
    mocksDataAndRenderTable();

    const user = userEvent.setup();

    await screen.findByRole('table');

    const paginator = screen.getByRole('combobox', { name: '10 Per Page' });
    expect(paginator).toBeInTheDocument();

    await user.click(paginator);

    const popoverId = paginator.getAttribute('aria-controls');
    invariant(popoverId, 'Popover ID not found');

    const popover = await screen.findByTestId('popover');
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveAttribute('id', popoverId);

    const serviceOptions = await screen.findAllByRole('option');
    expect(serviceOptions.length).toEqual(3);
    expect(serviceOptions[0]).toHaveTextContent('10 Per Page');
    expect(serviceOptions[1]).toHaveTextContent('25 Per Page');
    expect(serviceOptions[2]).toHaveTextContent('50 Per Page');

    await user.click(serviceOptions[1]);

    await waitFor(() => {
        const popoverAfterSelect = screen.queryByTestId('popover');
        expect(popoverAfterSelect).not.toBeInTheDocument();
    });

    expect(paginator).toHaveTextContent('25 Per Page');
    expect(paginator).not.toHaveTextContent('10 Per Page');
    expect(paginator).toHaveAttribute('aria-expanded', 'false');
});

it('Services filkters works properly', async () => {
    setUnifiedConfig(getConfigWithHeadersManyServices(headers, 5));
    mocksDataAndRenderTable();

    const user = userEvent.setup();

    await screen.findByRole('table');

    const filter = screen.getByRole('searchbox');
    expect(filter).toBeInTheDocument();

    verifyLengthOfDisplayedRows(10);
    await user.type(filter, 'test');

    const allDisplayedRowsWithTest = screen.getAllByRole('row');
    expect(allDisplayedRowsWithTest.length).toEqual(6); // 5 data rows contain test in name + header
    verifyLengthOfDisplayedRows(6);

    const clearBtn = screen.getByTestId('clear');
    expect(clearBtn).toBeInTheDocument();

    await user.click(clearBtn);

    verifyLengthOfDisplayedRows(10);
});

it('Pagination works as expected', async () => {
    server.use(
        http.get(`/servicesNS/nobody/-/splunk_ta_uccexample_${inputName}1`, () =>
            HttpResponse.json(MockRowData)
        )
    );
    server.use(
        http.get(`/servicesNS/nobody/-/splunk_ta_uccexample_${inputName}2`, () =>
            HttpResponse.json(MockRowData)
        )
    );
    setUnifiedConfig(getConfigWithHeadersManyServices(headers, 5));
    mocksDataAndRenderTable();

    const user = userEvent.setup();

    await screen.findByRole('table');

    const resultsNumber = screen.getByTestId('typography');
    expect(resultsNumber).toBeInTheDocument();
    expect(resultsNumber.textContent).toContain('27 Inputs');
    expect(resultsNumber.textContent).toContain('(21 of 27 enabled)');

    const paginator = screen.getByRole('navigation');
    expect(paginator).toBeInTheDocument();

    const previousButton = within(paginator).getByRole('button', { name: 'Go to previous page' });
    expect(previousButton).toBeInTheDocument();
    const nextButton = within(paginator).getByRole('button', { name: 'Go to next page' });
    expect(nextButton).toBeInTheDocument();
    const pageNumber1 = within(paginator).getByRole('button', { name: 'Page 1' });
    expect(pageNumber1).toBeInTheDocument();
    const pageNumber2 = within(paginator).getByRole('button', { name: 'Page 2' });
    expect(pageNumber2).toBeInTheDocument();
    const pageNumber3 = within(paginator).getByRole('button', { name: 'Page 3' });
    expect(pageNumber3).toBeInTheDocument();

    await user.click(pageNumber2);
    verifyLengthOfDisplayedRows(11);

    await user.click(pageNumber1);
    verifyLengthOfDisplayedRows(11);

    await user.click(pageNumber3);
    verifyLengthOfDisplayedRows(8);

    await user.click(previousButton);
    verifyLengthOfDisplayedRows(11);

    await user.click(nextButton);
    verifyLengthOfDisplayedRows(8);
});
