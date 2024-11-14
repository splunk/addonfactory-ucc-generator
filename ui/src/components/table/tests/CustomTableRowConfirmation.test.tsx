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
import { invariant } from '../../../util/invariant';

beforeEach(() => {
    const props = {
        page: 'inputs',
        serviceName: 'example_input_one',
        handleRequestModalOpen: jest.fn(),
        handleOpenPageStyleDialog: jest.fn(),
        displayActionBtnAllRows: false,
    } satisfies ITableWrapperProps;

    server.use(
        http.get('/servicesNS/nobody/-/splunk_ta_uccexample_example_input_one', () =>
            HttpResponse.json(MockRowData)
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

const getRowData = (isDisabled: boolean) => {
    const active = MockRowData.entry.find(
        (entry) => entry.content.disabled === isDisabled // api mocks are created for aaaaaa entity
    );
    return active;
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

const getRowElements = async (isDisabled: boolean) => {
    const activeRowData = getRowData(isDisabled);
    invariant(activeRowData, 'Active row not found');
    const activeRow = await screen.findByLabelText(`row-${activeRowData?.name}`);

    const statusCell = within(activeRow).getByTestId('status');

    const statusToggle = within(activeRow).getByRole('switch');

    return { activeRowData, activeRow, statusCell, statusToggle };
};

it('Status toggling with acceptance model - displayed correctly', async () => {
    const { activeRowData, statusToggle } = await getRowElements(false);

    statusToggle.click();

    const acceptModal = await screen.findByRole('dialog', { name: /Make input Inactive?/i });

    screen.getByText(`Do you want to make ${activeRowData?.name} input Inactive?`);

    screen.getByRole('button', { name: 'Yes' });
    const noBtn = screen.getByRole('button', { name: 'No' });

    await userEvent.click(noBtn);

    expect(acceptModal).not.toBeInTheDocument();
});

it('Status toggling with acceptance model - toggles state', async () => {
    const { activeRowData, statusCell, statusToggle } = await getRowElements(false);

    expect(statusCell).toHaveTextContent('Active');

    serverUseDisabledForEntity(activeRowData.name, true);

    statusToggle.click();

    await screen.findByRole('dialog', { name: 'Make input Inactive?' });

    const yesBtn = await screen.findByRole('button', { name: 'Yes' });
    await userEvent.click(yesBtn);

    expect(statusCell).toHaveTextContent('Inactive');

    serverUseDisabledForEntity(activeRowData.name, false);

    statusToggle.click();

    await screen.findByRole('dialog', { name: 'Make input Active?' });

    const yesBtn2 = await screen.findByRole('button', { name: 'Yes' });
    await userEvent.click(yesBtn2);

    expect(statusCell).toHaveTextContent('Active');
});

it('Status toggling with acceptance model - decline modal still Active', async () => {
    const { activeRowData, statusCell, statusToggle } = await getRowElements(false);

    expect(statusCell).toHaveTextContent('Active');

    serverUseDisabledForEntity(activeRowData.name, true);

    statusToggle.click();

    await screen.findByRole('dialog', { name: 'Make input Inactive?' });

    const noBtn = await screen.findByRole('button', { name: 'No' });
    await userEvent.click(noBtn);

    expect(statusCell).toHaveTextContent('Active');
});

it('Status toggling with acceptance model - decline modal still Inactive', async () => {
    const { activeRowData, statusCell, statusToggle } = await getRowElements(true);

    expect(statusCell).toHaveTextContent('Inactive');

    serverUseDisabledForEntity(activeRowData.name, true);

    statusToggle.click();

    await screen.findByRole('dialog', { name: 'Make input Active?' });

    const noBtn = await screen.findByRole('button', { name: 'No' });
    await userEvent.click(noBtn);

    expect(statusCell).toHaveTextContent('Inactive');
});
