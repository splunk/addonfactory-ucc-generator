import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { http, HttpResponse } from 'msw';
import { BrowserRouter } from 'react-router-dom';
import { MockRowData, MockRowDataForStatusCount } from '../stories/rowDataMockup';
import TableWrapper, { ITableWrapperProps } from '../TableWrapper';
import { server } from '../../../mocks/server';
import { TableContextProvider } from '../../../context/TableContext';
import { setUnifiedConfig } from '../../../util/util';
import {
    getCustomModalHeaderData,
    getSimpleConfig,
    getSimpleConfigStylePage,
    getSimpleConfigWithMapping,
    SIMPLE_NAME_TABLE_MOCK_DATA,
} from '../stories/configMockups';

const handleRequestModalOpen = jest.fn();
const handleOpenPageStyleDialog = jest.fn();

const props = {
    page: 'configuration',
    serviceName: 'account',
    handleRequestModalOpen,
    handleOpenPageStyleDialog,
    displayActionBtnAllRows: false,
} satisfies ITableWrapperProps;

const setup = () =>
    render(
        <TableContextProvider>
            <TableWrapper {...props} />
        </TableContextProvider>,
        { wrapper: BrowserRouter }
    );

describe('TableWrapper - Configuration Page', () => {
    beforeEach(() => {
        server.use(
            http.get('/servicesNS/nobody/-/splunk_ta_uccexample_account', () =>
                HttpResponse.json(MockRowData)
            )
        );
    });
    it('correct render table with all elements', async () => {
        setUnifiedConfig(SIMPLE_NAME_TABLE_MOCK_DATA);
        setup();

        const numberOfItems = await screen.findByText('9 Items');
        expect(numberOfItems).toBeInTheDocument();

        const headerNames = ['Name', 'Actions'];

        const tableHeader = screen.getAllByRole('columnheader');

        expect(tableHeader.length).toEqual(headerNames.length);

        headerNames.forEach((name) => {
            const thWithName = Array.from(tableHeader).find(
                (thElem: HTMLElement) => thElem.dataset.testLabel === name
            );
            expect(thWithName).toBeTruthy();
        });

        const currentTab = SIMPLE_NAME_TABLE_MOCK_DATA.pages.configuration.tabs.find(
            (tab) => tab.name === props.serviceName
        );

        currentTab?.entity.forEach((confEntity) =>
            expect(screen.getByText(confEntity.label)).toBeInTheDocument()
        );
    });

    it('sort items after filtering', async () => {
        setUnifiedConfig(getSimpleConfigWithMapping());
        setup();

        const numberOfItems = await screen.findByText('Custom Text');
        expect(numberOfItems).toBeInTheDocument();

        const customHeader = document.querySelector('[data-test-label="Custom Text"]');
        expect(customHeader).toBeInTheDocument();

        const defaultOrder = document.querySelectorAll('[data-column="custom_text"]');
        const mappedTextDefaultOrder = Array.from(defaultOrder).map((el: Node) => el.textContent);
        expect(mappedTextDefaultOrder).toMatchInlineSnapshot(`
        [
          "wxyz=a",
          "xyz=ab",
          "yz=abc",
          "z=abcd",
          "xyz=ab",
          "aaaaa",
          "two",
          "testsomethingelse",
          "222222",
        ]
    `);

        await userEvent.click(customHeader!);

        const allCustomTextsAsc = document.querySelectorAll('[data-column="custom_text"]');
        const mappedTextAsc = Array.from(allCustomTextsAsc).map((el: Node) => el.textContent);

        expect(mappedTextAsc).toMatchInlineSnapshot(`
        [
          "222222",
          "aaaaa",
          "testsomethingelse",
          "two",
          "wxyz=a",
          "xyz=ab",
          "xyz=ab",
          "yz=abc",
          "z=abcd",
        ]
    `);

        await userEvent.click(customHeader!);

        const allCustomTextsDesc = document.querySelectorAll('[data-column="custom_text"]');
        const mappedTextDesc = Array.from(allCustomTextsDesc).map((el: Node) => el.textContent);

        expect(mappedTextDesc).toMatchInlineSnapshot(`
        [
          "z=abcd",
          "yz=abc",
          "xyz=ab",
          "xyz=ab",
          "wxyz=a",
          "two",
          "testsomethingelse",
          "aaaaa",
          "222222",
        ]
    `);
    });

    it('Correctly render status labels with mapped values', async () => {
        setUnifiedConfig(getSimpleConfigWithMapping());
        setup();

        const active = MockRowData.entry.find((entry) => entry.content.disabled === false);
        const activeRow = await screen.findByLabelText(`row-${active?.name}`);
        const statusCell = within(activeRow).getByTestId('status');
        expect(statusCell).toHaveTextContent('Enabled Field');

        const inactive = MockRowData.entry.find((entry) => entry.content.disabled === true);
        const inActiveRow = await screen.findByLabelText(`row-${inactive?.name}`);
        const inActiveStatusCell = within(inActiveRow).getByTestId('status');
        expect(inActiveStatusCell).toHaveTextContent('Disabled Field');
    });

    it('Check modal correctly renders title', async () => {
        setUnifiedConfig(getSimpleConfig());
        setup();

        // check for custom header in edit modal
        const allEditButtons = await screen.findAllByRole('button', { name: /edit/i });
        await userEvent.click(allEditButtons[0]);
        expect(screen.getByRole('heading', { name: 'Update Account' })).toBeInTheDocument();
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await userEvent.click(cancelButton);

        // check for custom header in clone modal
        const allCloneButtons = await screen.findAllByRole('button', { name: /clone/i });
        await userEvent.click(allCloneButtons[0]);
        expect(screen.getByRole('heading', { name: 'Clone Account' })).toBeInTheDocument();
        await userEvent.click(cancelButton);

        // check for custom header in delete modal
        const allDeleteButtons = await screen.findAllByRole('button', { name: /delete/i });
        await userEvent.click(allDeleteButtons[0]);
        expect(screen.getByRole('heading', { name: 'Delete Confirmation' })).toBeInTheDocument();
    });

    it('Check modal correctly render custom header', async () => {
        setUnifiedConfig(getCustomModalHeaderData());
        setup();
        // check for custom header in edit modal
        const allEditButtons = await screen.findAllByRole('button', { name: /edit/i });
        await userEvent.click(allEditButtons[0]);
        expect(
            screen.getByRole('heading', { name: 'Update this is custom header' })
        ).toBeInTheDocument();

        // check for custom header in clone modal
        const allCloneButtons = await screen.findAllByRole('button', { name: /clone/i });
        await userEvent.click(allCloneButtons[0]);
        expect(
            screen.getByRole('heading', { name: 'Clone this is custom header' })
        ).toBeInTheDocument();
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await userEvent.click(cancelButton);

        // check for custom header in delete modal
        const allDeleteButtons = await screen.findAllByRole('button', { name: /delete/i });
        await userEvent.click(allDeleteButtons[0]);
        expect(
            screen.getByRole('heading', { name: 'Delete this is custom header' })
        ).toBeInTheDocument();
    });
});

describe('TableWrapper - Inputs Page', () => {
    it('Check inputs count is visible', async () => {
        const inputsProps = {
            ...props,
            page: 'inputs',
            serviceName: 'example_input_one',
        } satisfies ITableWrapperProps;

        server.use(
            http.get('/servicesNS/nobody/-/splunk_ta_uccexample_example_input_one', () =>
                HttpResponse.json(MockRowDataForStatusCount)
            )
        );

        setUnifiedConfig(getSimpleConfigStylePage());

        render(
            <TableContextProvider>
                <TableWrapper {...inputsProps} />
            </TableContextProvider>,
            { wrapper: BrowserRouter }
        );
        const statusCount = await screen.findByText('11 Inputs (7 of 11 enabled)');
        expect(statusCount).toBeInTheDocument();
    });
});
