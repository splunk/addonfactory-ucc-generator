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
import { SIMPLE_NAME_TABLE_MOCK_DATA } from '../stories/configMockups';

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

    setUnifiedConfig(SIMPLE_NAME_TABLE_MOCK_DATA);

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
