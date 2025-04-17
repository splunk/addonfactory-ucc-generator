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
import { invariant } from '../../../util/invariant';
import { MOCK_CONFIG } from './mocks';
import mockCustomInputRow from './mocks/CustomRowMock';
import mockCustomInputRowGetDLError from './mocks/CustomRowMockGetDLError';
import mockCustomInputRowRenderError from './mocks/CustomRowMockRenderError';
import mockCustomInputRowUnvalid from './mocks/CustomRowMockGetDLUnvalid';
import { consoleError } from '../../../../jest.setup';

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

const mockCustomRowInput = () => {
    jest.mock(`${getBuildDirPath()}/custom/${customRowFileName}.js`, () => mockCustomInputRow, {
        virtual: true,
    });
};

const mockCustomRowInputGetDLError = () => {
    jest.mock(
        `${getBuildDirPath()}/custom/${customRowFileName}.js`,
        () => mockCustomInputRowGetDLError,
        {
            virtual: true,
        }
    );
};

const mockCustomRowInputToUndefined = () => {
    jest.mock(`${getBuildDirPath()}/custom/${customRowFileName}.js`, () => undefined, {
        virtual: true,
    });
};

const mockCustomRowInputToUnvalidGetDL = () => {
    jest.mock(
        `${getBuildDirPath()}/custom/${customRowFileName}.js`,
        () => mockCustomInputRowUnvalid,
        {
            virtual: true,
        }
    );
};

const mockCustomRowInputRenderError = () => {
    jest.mock(
        `${getBuildDirPath()}/custom/${customRowFileName}.js`,
        () => mockCustomInputRowRenderError,
        {
            virtual: true,
        }
    );
};

const waitForRowAndExpand = async (rowName: string) => {
    const inputRow = await screen.findByRole('row', { name: `row-${rowName}` });

    const expandable = getExpandable(inputRow);

    await userEvent.click(expandable);
    await waitFor(() => expect(expandable.getAttribute('aria-expanded')).not.toBe('false'));
};

function setup() {
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

    const allDefinitions = screen.getAllByRole('definition').map((el) => el.textContent);

    expect(allDefinitions).toContain(`${expectedInterval} sec`);
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
    jest.resetModules();
    mockCustomRowInputGetDLError();

    const mockConsoleError = jest.fn();
    consoleError.mockImplementation(mockConsoleError);

    setup();
    await waitForRowAndExpand(inputName);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

    expect(mockConsoleError).toHaveBeenCalledWith(
        '[Custom Control] Something went wrong while calling getDLRows. Error: Error getDLRows method Error during execution'
    ); // to be changed to Custom Cell

    // message should be different but thats the current state
    const errorMessage = screen.queryByText(
        'At least "render" either "getDLRows" method should be present.'
    );
    expect(errorMessage).toBeInTheDocument();
});

it('Should display error message as render throws Error', async () => {
    jest.resetModules();
    mockCustomRowInputRenderError();

    const mockConsoleError = jest.fn();
    consoleError.mockImplementation(mockConsoleError);

    setup();
    await waitForRowAndExpand(inputName);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

    expect(mockConsoleError).toHaveBeenCalledWith(
        '[Custom Control] Something went wrong while calling render. Error: Error render method Error during execution'
    ); // to be changed to Custom Cell

    const expandedRow = (await screen.findAllByRole('row')).find((row) => {
        return row.getAttribute('data-expansion-row') === `true`;
    });

    expect(expandedRow).toBeInTheDocument();
    // empty row as render method throws error
    expect(expandedRow?.textContent).toBe('');
});

it('Should display error message as module not correct', async () => {
    jest.resetModules();
    mockCustomRowInputToUndefined();

    setup();
    await waitForRowAndExpand(inputName);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

    const errorMessage = screen.queryByText('Loaded module is not a constructor function');
    expect(errorMessage).toBeInTheDocument();
});

it('Should display error message as getDLRows return number', async () => {
    jest.resetModules();
    mockCustomRowInputToUnvalidGetDL();

    setup();
    await waitForRowAndExpand(inputName);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

    const errorMessage = screen.queryByText('getDLRows method did not return a valid object');
    expect(errorMessage).toBeInTheDocument();
});
