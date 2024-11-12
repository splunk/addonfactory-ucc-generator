import { render, screen } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';

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

    const allEditButtons = document.querySelectorAll('.editBtn');
    expect(allEditButtons.length).toEqual(9);

    const allDeleteBtns = document.querySelectorAll('.deleteBtn');
    expect(allDeleteBtns.length).toEqual(9);

    const allCloneButtons = document.querySelectorAll('.cloneBtn');
    expect(allCloneButtons.length).toEqual(9);

    const allSearchButtons = document.querySelectorAll('.searchBtn');
    expect(allSearchButtons.length).toEqual(9);
});

it('Correctly call action handlers for page dialog', async () => {
    await screen.findByRole('table');

    const editButton = document.querySelector('.editBtn'); // Clicking edit
    expect(editButton).toBeInTheDocument();

    await userEvent.click(editButton!);

    expect(handleOpenPageStyleDialog).toHaveBeenCalledWith(expect.objectContaining({}), 'edit');

    const cloneBtn = document.querySelector('.cloneBtn'); // Clicking clone
    expect(cloneBtn).toBeInTheDocument();

    await userEvent.click(cloneBtn!);

    expect(handleOpenPageStyleDialog).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({}),
        'clone'
    );
});

it('Correctly render modal for actions click', async () => {
    await screen.findByRole('table');

    const deleteBtn = document.querySelector('.deleteBtn'); // Clicking delete renders modal
    expect(deleteBtn).toBeInTheDocument();

    await userEvent.click(deleteBtn!);

    await screen.findByText('Delete Confirmation');
});

it('Correctly render status labels with default values', async () => {
    await screen.findByRole('table');

    const active = MockRowData.entry.find((entry) => entry.content.disabled === false);
    const activeRow = await screen.findByLabelText(`row-${active?.name}`);
    const activeRowDisabledCellText = activeRow.querySelector('[data-test="status"]');
    expect(activeRowDisabledCellText).toHaveTextContent('Active');

    const inactive = MockRowData.entry.find((entry) => entry.content.disabled === true);
    const inActiveRow = await screen.findByLabelText(`row-${inactive?.name}`);
    const inActiveRowDisabledCellText = inActiveRow.querySelector('[data-test="status"]');
    expect(inActiveRowDisabledCellText).toHaveTextContent('Inactive');
});
