import { render, screen, within } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';

import { BrowserRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { TableContextProvider } from '../../../context/TableContext';
import { server } from '../../../mocks/server';
import { setUnifiedConfig } from '../../../util/util';
import { SIMPLE_NAME_TABLE_MOCK_DATA_WITH_STATUS_TOGGLE_CONFIRMATION } from '../stories/configMockups';
import {
    MockRowData,
    MockRowDataTogglingResponseDisableFalse,
    MockRowDataTogglingResponseDisableTrue,
} from '../stories/rowDataMockup';
import TableWrapper, { ITableWrapperProps } from '../TableWrapper';

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
        ),
        http.post('/servicesNS/nobody/-/splunk_ta_uccexample_example_input_one/aaaaaa', () =>
            HttpResponse.json(MockRowDataTogglingResponseDisableTrue)
        )
    );

    setUnifiedConfig(SIMPLE_NAME_TABLE_MOCK_DATA_WITH_STATUS_TOGGLE_CONFIRMATION);

    render(
        <TableContextProvider>
            <TableWrapper {...props} />
        </TableContextProvider>,
        { wrapper: BrowserRouter }
    );
});

it('Status toggling with acceptance model displayed correctly', async () => {
    const inputSwitches = await screen.findAllByRole('switch');

    // open accept modal for first switch
    await userEvent.click(inputSwitches[0]);

    const acceptModal = await screen.findByRole('dialog');

    expect(acceptModal).toBeInTheDocument();

    const headerText = screen.getByText('Make input Inactive?');
    expect(headerText).toBeInTheDocument();

    const warningMessage = screen.getByText('Do you want to make input Inactive?');
    expect(warningMessage).toBeInTheDocument();

    const noBtn = screen.getByRole('button', { name: 'No' });
    expect(noBtn).toBeInTheDocument();

    const yesBtn = await screen.findByRole('button', { name: 'Yes' });
    expect(yesBtn).toBeInTheDocument();

    await userEvent.click(noBtn);

    expect(acceptModal).not.toBeInTheDocument();
});

it('Status toggling with acceptance model toggles state', async () => {
    const active = MockRowData.entry.find(
        (entry) => entry.content.disabled === false && entry.name === 'aaaaaa' // api mocks are created for aaaaaa entity
    );
    const activeRow = await screen.findByLabelText(`row-${active?.name}`);
    const statusToggle = await within(activeRow).findByRole('switch');

    const statusCell = within(activeRow).getByTestId('status');
    expect(statusCell).toHaveTextContent('Active');

    statusToggle.click();

    const acceptModal = await screen.findByRole('dialog');
    expect(acceptModal).toBeInTheDocument();

    const yesBtn = await screen.findByRole('button', { name: 'Yes' });
    expect(yesBtn).toBeInTheDocument();

    await userEvent.click(yesBtn);

    expect(statusCell).toHaveTextContent('Inactive');

    server.use(
        http.post('/servicesNS/nobody/-/splunk_ta_uccexample_example_input_one/aaaaaa', () =>
            HttpResponse.json(MockRowDataTogglingResponseDisableFalse)
        )
    );

    statusToggle.click();
    const yesBtn2 = await screen.findByRole('button', { name: 'Yes' });
    await userEvent.click(yesBtn2);

    expect(statusCell).toHaveTextContent('Active');
});
