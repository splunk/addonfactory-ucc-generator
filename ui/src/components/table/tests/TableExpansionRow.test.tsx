import { vi } from 'vitest';
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
import mockCustomInputRowGetDLError from './mocks/CustomRowMockGetDLError';
import mockCustomInputRowRenderError from './mocks/CustomRowMockRenderError';
import mockCustomInputRowUnvalid from './mocks/CustomRowMockGetDLUnvalid';
import mockCustomInputRow from './mocks/CustomRowMock';
import { invariant } from '../../../util/invariant';
import { MOCK_CONFIG } from './mocks';
import { GlobalConfig } from '../../../publicApi';
import { consoleError } from '../../../../test.setup';

const inputName = 'example_input_one';
const interval = 7766;
const updatedInterval = 7788;

const props = {
    page: 'inputs',
    serviceName: inputName,
    handleRequestModalOpen: vi.fn(),
    handleOpenPageStyleDialog: vi.fn(),
} satisfies ITableWrapperProps;

const customRowFileName = 'CustomInputRow';

const mockCustomRowInput = () => {
    vi.doMock(`${getBuildDirPath()}/custom/${customRowFileName}.js`, () => ({
        default: mockCustomInputRow,
    }));
};

const mockCustomRowInputGetDLError = () => {
    vi.doMock(`${getBuildDirPath()}/custom/${customRowFileName}.js`, () => ({
        default: mockCustomInputRowGetDLError,
    }));
};

const mockCustomRowInputToUndefined = () => {
    vi.doMock(`${getBuildDirPath()}/custom/${customRowFileName}.js`, () => ({
        default: undefined,
    }));
};

const mockCustomRowInputToUnvalidGetDL = () => {
    vi.doMock(`${getBuildDirPath()}/custom/${customRowFileName}.js`, () => ({
        default: mockCustomInputRowUnvalid,
    }));
};

const mockCustomRowInputRenderError = () => {
    vi.doMock(`${getBuildDirPath()}/custom/${customRowFileName}.js`, () => ({
        default: mockCustomInputRowRenderError,
    }));
};

const waitForRowAndExpand = async (rowName: string) => {
    const inputRow = await screen.findByRole('row', { name: `row-${rowName}` });

    const expandable = getExpandable(inputRow);

    await userEvent.click(expandable);
    await waitFor(() => expect(expandable.getAttribute('aria-expanded')).not.toBe('false'));
};

function setup() {
    const headers = [
        {
            label: 'Name',
            field: 'name',
        },
        {
            label: 'Interval',
            field: 'interval',
        },
    ];
    setUnifiedConfig({
        ...MOCK_CONFIG,
        pages: {
            ...MOCK_CONFIG.pages,
            inputs: {
                title: inputName,
                services: [
                    {
                        title: inputName,
                        name: inputName,
                        entity: [
                            {
                                label: 'Name',
                                field: 'name',
                                type: 'text',
                            },
                            {
                                label: 'Interval',
                                field: 'interval',
                                type: 'text',
                            },
                        ],
                    },
                ],
                table: {
                    actions: ['edit'],
                    header: headers,
                    moreInfo: headers,
                    customRow: {
                        src: customRowFileName,
                        type: 'external',
                    },
                },
            },
        },
    } satisfies GlobalConfig);

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

const getExpandable = (inputRow: HTMLElement) => {
    const expandableCell = within(inputRow).getByTestId('expand');
    invariant(expandableCell, 'Expandable cell not found');
    const expandable = within(expandableCell).getByRole('button');
    invariant(expandable, 'Expandable button not found');

    return expandable;
};

async function expectIntervalInExpandedRow(inputRow: HTMLElement, expectedInterval: number) {
    mockCustomRowInput();
    const expandable = getExpandable(inputRow);
    if (expandable.getAttribute('aria-expanded') === 'false') {
        await userEvent.click(expandable);
        await waitFor(() => expect(expandable.getAttribute('aria-expanded')).not.toBe('false'));
    }
    const loading = screen.queryByText('Loading...');
    if (loading) {
        await waitForElementToBeRemoved(loading);
    }

    await waitFor(async () => {
        const allDefinitions = (await screen.findAllByRole('definition')).map(
            (el) => el.textContent
        );

        expect(allDefinitions).toContain(`${expectedInterval} sec`);
    });
}

it('should update custom Expansion Row when Input has changed', async () => {
    mockCustomRowInput();
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

it('Should display error message as getDLRows throws Error', async () => {
    mockCustomRowInputGetDLError();

    const mockConsoleError = vi.fn();
    consoleError.mockImplementation(mockConsoleError);

    setup();
    await waitForRowAndExpand(inputName);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

    await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
            '[Custom Control] Something went wrong while calling getDLRows. Error: Error getDLRows method Error during execution'
        ); // to be changed to Custom Cell
    });

    await waitFor(() => {
        // message should be different but thats the current state
        const errorMessage = screen.queryByText(
            'At least "render" either "getDLRows" method should be present.'
        );
        expect(errorMessage).toBeInTheDocument();
    });
});

it('Should display error message as render throws Error', async () => {
    mockCustomRowInputRenderError();

    const mockConsoleError = vi.fn();
    consoleError.mockImplementation(mockConsoleError);

    setup();
    await waitForRowAndExpand(inputName);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

    await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
            '[Custom Control] Something went wrong while calling render. Error: Error render method Error during execution'
        ); // to be changed to Custom Cell
    });

    const expandedRow = (await screen.findAllByRole('row')).find((row) => {
        return row.getAttribute('data-expansion-row') === `true`;
    });

    expect(expandedRow).toBeInTheDocument();
    // empty row as render method throws error
    expect(expandedRow?.textContent).toBe('');
});

it('Should display error message as module not correct', async () => {
    mockCustomRowInputToUndefined();

    setup();
    await waitForRowAndExpand(inputName);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    await waitFor(() => {
        const errorMessage = screen.queryByText('Loaded module is not a constructor function');
        expect(errorMessage).toBeInTheDocument();
    });
});

it('Should display error message as getDLRows return number', async () => {
    mockCustomRowInputToUnvalidGetDL();

    setup();
    await waitForRowAndExpand(inputName);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    await waitFor(() => {
        const errorMessage = screen.getByText('getDLRows method did not return a valid object');
        expect(errorMessage).toBeInTheDocument();
    });
});
