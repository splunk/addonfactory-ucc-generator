import { render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { http, HttpResponse } from 'msw';
import { BrowserRouter } from 'react-router-dom';
import TableWrapper, { ITableWrapperProps } from '../TableWrapper';
import { server } from '../../../mocks/server';
import { TableContextProvider } from '../../../context/TableContext';
import { setUnifiedConfig } from '../../../util/util';
import { getMockServerResponseForInput } from '../../../mocks/server-response';
import { getBuildDirPath } from '../../../util/script';
import mockCustomInputRow from '../../../../../tests/testdata/test_addons/package_global_config_everything/package/appserver/static/js/build/custom/custom_input_row';
import { invariant } from '../../../util/invariant';
import { MOCK_CONFIG } from './mocks';

const inputName = 'example_input_one';
const interval = 7766;
const updatedInterval = 7788;

const props = {
    page: 'inputs',
    serviceName: inputName,
    handleRequestModalOpen: jest.fn(),
    handleOpenPageStyleDialog: jest.fn(),
} satisfies ITableWrapperProps;

const customRowFileName = 'CustomInputRow';

function setup() {
    jest.mock(`${getBuildDirPath()}/custom/${customRowFileName}.js`, () => mockCustomInputRow, {
        virtual: true,
    });

    setUnifiedConfig(MOCK_CONFIG);

    server.use(
        http.get(`/servicesNS/nobody/-/splunk_ta_uccexample_${inputName}`, () =>
            HttpResponse.json(
                getMockServerResponseForInput([
                    {
                        name: inputName,
                        content: {
                            interval,
                        },
                    },
                ])
            )
        )
    );

    render(
        <TableContextProvider>
            <TableWrapper {...props} />
        </TableContextProvider>,
        { wrapper: BrowserRouter }
    );
}

async function expectIntervalInExpandedRow(inputRow: HTMLElement, expectedInterval: number) {
    const expandable = within(inputRow).queryByRole('cell', { name: /expand/i });
    invariant(expandable);
    if (expandable.getAttribute('aria-expanded') === 'false') {
        await userEvent.click(expandable);
        await waitFor(() => expect(expandable.getAttribute('aria-expanded')).not.toBe('false'));
    }
    const loading = screen.queryByText('Loading...');
    if (loading) {
        await waitForElementToBeRemoved(loading);
    }

    const allDefinitions = screen.getAllByRole('definition').map((el) => el.textContent);

    expect(allDefinitions).toContain(`${expectedInterval} sec`);
}

it('should update custom Expansion Row when Input has changed', async () => {
    setup();
    const inputRow = await screen.findByRole('row', { name: `row-${inputName}` });

    // simulate the server response for the post request
    server.use(
        http.post(
            `/servicesNS/nobody/-/splunk_ta_uccexample_${inputName}/${inputName}`,
            async ({ request }) => {
                const formData = await request.formData();
                const formDataObject: Record<string, string> = {};
                formData.forEach((value, key) => {
                    if (typeof value === 'string') {
                        formDataObject[key] = value;
                    }
                });
                return HttpResponse.json(
                    getMockServerResponseForInput([
                        {
                            name: inputName,
                            content: formDataObject,
                        },
                    ])
                );
            }
        )
    );

    await expectIntervalInExpandedRow(
        await screen.findByRole('row', { name: `row-${inputName}` }),
        interval
    );

    await userEvent.click(within(inputRow).getByRole('button', { name: /edit/i }));
    const dialog = await screen.findByRole('dialog');

    const textBoxes = within(dialog).getAllByRole('textbox');
    expect(textBoxes).toHaveLength(2);
    const intervalInput = textBoxes[1];
    expect(intervalInput).toHaveValue(interval.toString());
    await userEvent.clear(intervalInput);
    await userEvent.type(intervalInput, updatedInterval.toString());
    await userEvent.click(screen.getByRole('button', { name: /update/i }));

    await screen.findByRole('cell', { name: updatedInterval.toString() });

    await expectIntervalInExpandedRow(
        await screen.findByRole('row', { name: `row-${inputName}` }),
        updatedInterval
    );
});
