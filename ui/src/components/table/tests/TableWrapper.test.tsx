import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { MockRowData } from '../stories/rowDataMockup';
import TableWrapper from '../TableWrapper';
import { server } from '../../../mocks/server';
import { TableContextProvider } from '../../../context/TableContext';
import { setUnifiedConfig } from '../../../util/util';
import { SIMPLE_NAME_TABLE_MOCK_DATA, TABLE_CONFIG_WITH_MAPPING } from '../stories/configMockups';

jest.mock('immutability-helper');

const handleRequestModalOpen = jest.fn();
const handleOpenPageStyleDialog = jest.fn();

it('correct render table with all elements', async () => {
    const props = {
        page: 'configuration',
        serviceName: 'account',
        handleRequestModalOpen,
        handleOpenPageStyleDialog,
        displayActionBtnAllRows: false,
    };

    server.use(
        http.get('/servicesNS/nobody/-/splunk_ta_uccexample_account', () =>
            HttpResponse.json(MockRowData)
        )
    );

    setUnifiedConfig(SIMPLE_NAME_TABLE_MOCK_DATA);

    render(
        <Router>
            <TableContextProvider>
                {(<TableWrapper {...props} />) as unknown as Node}
            </TableContextProvider>
        </Router>
    );

    const numberOfItems = await screen.findByText('9 Items');
    expect(numberOfItems).toBeInTheDocument();

    const headerNames = ['Name', 'Actions'];

    const tableHeader = document.querySelectorAll('th');

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
    const props = {
        page: 'configuration',
        serviceName: 'account',
        handleRequestModalOpen,
        handleOpenPageStyleDialog,
        displayActionBtnAllRows: false,
    };

    server.use(
        http.get('/servicesNS/nobody/-/splunk_ta_uccexample_account', () =>
            HttpResponse.json(MockRowData)
        )
    );

    setUnifiedConfig(TABLE_CONFIG_WITH_MAPPING);

    render(
        <Router>
            <TableContextProvider>
                {(<TableWrapper {...props} />) as unknown as Node}
            </TableContextProvider>
        </Router>
    );

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
