import { expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { BrowserRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { TableContextProvider } from '../../../context/TableContext';
import { server } from '../../../mocks/server';
import { setUnifiedConfig } from '../../../util/util';
import { MockRowData } from '../stories/rowDataMockup';
import TableWrapper, { ITableWrapperProps } from '../TableWrapper';
import { getSimpleConfigStylePage } from '../stories/configMockups';

const handleRequestModalOpen = vi.fn();
const handleOpenPageStyleDialog = vi.fn();

const renderTable = () => {
    const props = {
        page: 'inputs',
        serviceName: 'example_input_one',
        handleRequestModalOpen,
        handleOpenPageStyleDialog,
        displayActionBtnAllRows: false,
    } satisfies ITableWrapperProps;

    server.use(
        http.get('/servicesNS/nobody/-/splunk_ta_uccexample_example_input_one', () =>
            HttpResponse.json(MockRowData)
        )
    );

    setUnifiedConfig(getSimpleConfigStylePage());

    render(
        <TableContextProvider>
            <TableWrapper {...props} />
        </TableContextProvider>,
        { wrapper: BrowserRouter }
    );
};

it('Render action icons correctly', async () => {
    renderTable();

    const allEditButtons = await screen.findAllByRole('button', { name: /edit/i });
    expect(allEditButtons).toHaveLength(9);
    const allDeleteBtns = screen.getAllByRole('button', { name: /delete/i });
    expect(allDeleteBtns).toHaveLength(9);
    const allCloneButtons = screen.getAllByRole('button', { name: /clone/i });
    expect(allCloneButtons).toHaveLength(9);
    const allSearchButtons = screen.getAllByRole('link', {
        name: /Go to search for events associated with/i,
    });
    expect(allSearchButtons).toHaveLength(9);
});

it('Correctly call action handlers for page dialog', async () => {
    renderTable();

    const user = userEvent.setup();
    await user.click((await screen.findAllByRole('button', { name: /edit/i }))[0]);

    expect(handleOpenPageStyleDialog).toHaveBeenCalledWith(expect.objectContaining({}), 'edit');

    screen.getAllByRole('button', { name: /clone/i })[0].click();

    expect(handleOpenPageStyleDialog).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({}),
        'clone'
    );
});

it('Correctly render modal for delete action click', async () => {
    renderTable();

    const user = userEvent.setup();
    // Clicking delete renders modal
    await user.click((await screen.findAllByRole('button', { name: /delete/i }))[0]);

    expect(await screen.findByRole('dialog')).toHaveTextContent('Delete Confirmation');
});

it('Correctly render status labels with default values', async () => {
    renderTable();

    const active = MockRowData.entry.find((entry) => entry.content.disabled === false);
    const activeRow = await screen.findByLabelText(`row-${active?.name}`);
    const statusCell = within(activeRow).getByTestId('status');
    expect(statusCell).toHaveTextContent('Active');

    const inactive = MockRowData.entry.find((entry) => entry.content.disabled === true);
    const inactiveRow = await screen.findByLabelText(`row-${inactive?.name}`);
    const inactiveStatusCell = within(inactiveRow).getByTestId('status');
    expect(inactiveStatusCell).toHaveTextContent('Inactive');
});

it('Correctly render number of table rows', async () => {
    renderTable();
    const rows = await screen.findAllByRole('row');
    expect(rows).toHaveLength(10); // 9 data rows + 1 header row
});

it.each(MockRowData.entry)('Correctly render row with name %s', async (row) => {
    renderTable();

    const verifyCellExistance = (field: string, rowElem: HTMLElement) => {
        const cell = within(rowElem).getByText(field);
        expect(cell).toBeInTheDocument();
    };
    const { name, content } = row;
    const firstRow = await screen.findByLabelText(`row-${name}`);
    expect(firstRow).toBeInTheDocument();

    verifyCellExistance(name, firstRow);
    verifyCellExistance(content.account_radio, firstRow);
    verifyCellExistance(content.custom_endpoint, firstRow);
    verifyCellExistance(content.custom_text, firstRow);
    verifyCellExistance(content.username, firstRow);
    verifyCellExistance(content.account_multiple_select, firstRow);
});
