import { render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import React from 'react';

import { BrowserRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
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
    (await screen.findAllByRole('button', { name: /edit/i }))[0].click();

    expect(handleOpenPageStyleDialog).toHaveBeenCalledWith(expect.objectContaining({}), 'edit');

    screen.getAllByRole('button', { name: /clone/i })[0].click();

    expect(handleOpenPageStyleDialog).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({}),
        'clone'
    );
});

it('Correctly render modal for delete action click', async () => {
    // Clicking delete renders modal
    (await screen.findAllByRole('button', { name: /delete/i }))[0].click();

    expect(await screen.findByRole('dialog')).toHaveTextContent('Delete Confirmation');
});

it('Correctly render status labels with default values', async () => {
    const active = MockRowData.entry.find((entry) => entry.content.disabled === false);
    const activeRow = await screen.findByLabelText(`row-${active?.name}`);
    const statusCell = within(activeRow).getByTestId('status');
    expect(statusCell).toHaveTextContent('Active');

    const inactive = MockRowData.entry.find((entry) => entry.content.disabled === true);
    const inactiveRow = await screen.findByLabelText(`row-${inactive?.name}`);
    const inactiveStatusCell = within(inactiveRow).getByTestId('status');
    expect(inactiveStatusCell).toHaveTextContent('Inactive');
});

it('check status is changed in moreinfo after toggle', async () => {
    // Wait for spinner to disappear
    await waitForElementToBeRemoved(() => document.querySelector('[data-test="wait-spinner"]'));

    const rows = await screen.findAllByTestId('row');
    const row = rows[1]; // Selecting a specific row (1st row in the list)

    // Expand the row if not already expanded
    const arrow = within(row).getByRole('cell', { name: /expandable/i });
    const isExpanded = arrow.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
        await userEvent.click(arrow); // Click the expand icon
    }
    // Wait until the row's state changes to expanded
    await waitFor(() => expect(arrow.getAttribute('aria-expanded')).not.toBe('false'));

    // Wait for loading to complete if present
    const loading = screen.queryByText('Loading...');
    if (loading) {
        await waitForElementToBeRemoved(loading);
    }

    const descriptionActive = await screen.findAllByTestId('description'); // This gets an array
    expect(descriptionActive[1]).toHaveTextContent('Active'); // Check the first element for 'Active'

    // const switchContainers = screen.getAllByTestId('switch');
    const switchButtons = screen.getAllByTestId('button'); // Locate all switch buttons

    const switchButton = switchButtons[0]; // Use the first switch for demonstration
    await userEvent.click(switchButton);
    await waitFor(() => expect(switchButton).toHaveAttribute('aria-checked', 'false')); // Wait for toggle

    // Additional checks for terms and descriptions
    const descriptionInactive = await screen.findAllByTestId('description'); // This gets an array
    expect(descriptionInactive[1]).toHaveTextContent('Inactive'); // Check the first element for 'Inactive'

    // screen.debug(undefined, 70000);
});
