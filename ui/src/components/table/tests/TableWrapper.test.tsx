import { render, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
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
        const utils = userEvent.setup();

        const numberOfItems = await screen.findByText('Custom Text');
        expect(numberOfItems).toBeInTheDocument();

        const customHeader = screen.getByTestId('Custom Text');
        const customHeaderLabel = within(customHeader).getByText('Custom Text');
        expect(customHeaderLabel).toBeInTheDocument();

        const defaultOrder = screen.getAllByTestId('custom_text');
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

        await utils.click(customHeader!);

        const allCustomTextsAsc = screen.getAllByTestId('custom_text');
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

        await utils.click(customHeader!);

        const allCustomTextsDesc = screen.getAllByTestId('custom_text');
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

    const getHeaderTitleForAction = async (headingName: string, buttonName: RegExp) => {
        const allDeleteButtons = await screen.findAllByRole('button', { name: buttonName });
        await userEvent.click(allDeleteButtons[0]);
        return screen.getByRole('heading', { name: headingName });
    };
    const closeModal = async (user: UserEvent) => {
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await user.click(cancelButton);
    };

    it('Check modal correctly renders title', async () => {
        setUnifiedConfig(getSimpleConfig());
        setup();
        const utils = userEvent.setup();

        // check for custom header in edit modal
        const editHeader = await getHeaderTitleForAction('Update Account', /edit/i);
        expect(editHeader).toBeInTheDocument();
        await closeModal(utils);

        // check for custom header in clone modal
        const cloneHeader = await getHeaderTitleForAction('Clone Account', /clone/i);
        expect(cloneHeader).toBeInTheDocument();
        await closeModal(utils);

        // check for custom header in delete modal
        const deleteHeader = await getHeaderTitleForAction('Delete Confirmation', /delete/i);
        expect(deleteHeader).toBeInTheDocument();
        await closeModal(utils);
    });

    it('Check modal correctly render custom header', async () => {
        setUnifiedConfig(getCustomModalHeaderData());
        setup();
        const utils = userEvent.setup();

        // check for custom header in edit modal
        const editHeader = await getHeaderTitleForAction('Update this is custom header', /edit/i);
        expect(editHeader).toBeInTheDocument();
        await closeModal(utils);

        // check for custom header in clone modal
        const cloneHeader = await getHeaderTitleForAction('Clone this is custom header', /clone/i);
        expect(cloneHeader).toBeInTheDocument();
        await closeModal(utils);

        // check for custom header in delete modal
        const deleteHeader = await getHeaderTitleForAction(
            'Delete this is custom header',
            /delete/i
        );
        expect(deleteHeader).toBeInTheDocument();
        await closeModal(utils);
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
