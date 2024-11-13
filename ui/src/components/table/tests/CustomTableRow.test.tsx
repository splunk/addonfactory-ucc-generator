import { render, screen, within } from '@testing-library/react';
import React from 'react';

import { BrowserRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { TableContextProvider } from '../../../context/TableContext';
import { server } from '../../../mocks/server';
import { setUnifiedConfig } from '../../../util/util';
import { MockRowData } from '../stories/rowDataMockup';
import TableWrapper, { ITableWrapperProps } from '../TableWrapper';
import { getSimpleConfigStylePage } from '../stories/configMockups';

const handleRequestModalOpen = jest.fn();
const handleOpenPageStyleDialog = jest.fn();

beforeEach(() => {
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
});

it('Render action icons correctly', async () => {
    await screen.findByRole('table');
    const allEditButtons = screen.getAllByRole('button', { name: /edit/i });
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
    await screen.findByRole('table');

    screen.getAllByRole('button', { name: /edit/i })[0].click();

    expect(handleOpenPageStyleDialog).toHaveBeenCalledWith(expect.objectContaining({}), 'edit');

    screen.getAllByRole('button', { name: /clone/i })[0].click();

    expect(handleOpenPageStyleDialog).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({}),
        'clone'
    );
});

it('Correctly render modal for actions click', async () => {
    await screen.findByRole('table');

    // Clicking delete renders modal
    screen.getAllByRole('button', { name: /delete/i })[0].click();

    expect(await screen.findByRole('dialog')).toHaveTextContent('Delete Confirmation');
});

it('Correctly render status labels with default values', async () => {
    await screen.findByRole('table');

    const active = MockRowData.entry.find((entry) => entry.content.disabled === false);
    const activeRow = await screen.findByLabelText(`row-${active?.name}`);
    const statusCell = within(activeRow).getByTestId('status');
    expect(statusCell).toHaveTextContent('Active');

    const inactive = MockRowData.entry.find((entry) => entry.content.disabled === true);
    const inactiveRow = await screen.findByLabelText(`row-${inactive?.name}`);
    const inactiveStatusCell = within(inactiveRow).getByTestId('status');
    expect(inactiveStatusCell).toHaveTextContent('Inactive');
});
