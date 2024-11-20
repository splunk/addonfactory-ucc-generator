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

const MockRowDataTogglingResponseDisableTrue = {
    entry: [{ content: { disabled: true } }],
};

const MockRowDataTogglingResponseDisableFalse = {
    entry: [{ content: { disabled: false } }],
};

const serverUseDisabledForEntity = (entity: string, isDisabledTrue: boolean) => {
    server.use(
        http.post(`/servicesNS/nobody/-/splunk_ta_uccexample_example_input_one/${entity}`, () =>
            HttpResponse.json(
                isDisabledTrue
                    ? MockRowDataTogglingResponseDisableTrue
                    : MockRowDataTogglingResponseDisableFalse
            )
        )
    );
};

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

it('toggles the switch row and verifies status change in more info', async () => {
    // Wait for loading spinner to disappear
    await waitForElementToBeRemoved(() => document.querySelector('[data-test="wait-spinner"]'));

    // Locate the specific row using the aria-label
    const activeRowDataName = { name: MockRowData.entry[0].name };
    const selectedRow = await screen.findByLabelText(`row-${activeRowDataName?.name}`);

    // Check if the row is collapsed and expand it if necessary
    const arrow = within(selectedRow).getByRole('cell', { name: /expandable/i });
    const isExpanded = arrow.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
        await userEvent.click(arrow); // Click the expand icon to expand the row
    }
    // Verify the row is expanded
    expect(arrow).toHaveAttribute('aria-expanded', 'true');

    // Wait for any "Loading..." indicator to disappear if it's displayed
    const loading = screen.queryByText('Loading...');
    if (loading) {
        await waitForElementToBeRemoved(loading);
    }

    // Check that the initial status in the description is "Active"
    const descriptionActive = await screen.findAllByTestId('description'); // Locate all description elements
    expect(descriptionActive[1]).toHaveTextContent('Active'); // Verify the description is "Active"

    // Simulate disabling the server entity
    serverUseDisabledForEntity('aaaaaa', true);

    // Locate the toggle switch button within the row
    const switchButton = await within(selectedRow).findByRole('switch');
    // Toggle the switch
    await userEvent.click(switchButton);

    // Verify the switch's state has changed to unchecked (disabled)
    await waitFor(() => expect(switchButton).toHaveAttribute('aria-checked', 'false'));

    // Check that the updated status in the description is "Inactive"
    const descriptionInactive = await screen.findAllByTestId('description');
    expect(descriptionInactive[1]).toHaveTextContent('Inactive'); // Verify the description is "Inactive"
});
