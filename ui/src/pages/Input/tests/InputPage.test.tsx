import * as React from 'react';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

import userEvent from '@testing-library/user-event';
import InputPage from '../InputPage';
import {
    getGlobalConfigMockWithCustomMenuStyleDialog,
    getGlobalConfigMockWithCustomMenuStylePage,
} from '../../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../../util/util';
import { getBuildDirPath } from '../../../util/script';
import mockCustomMenu from './mockCustomMenu';

// it is just configuration not a mock to be changed
// eslint-disable-next-line jest/no-mocks-import
import { mockUnifiedConfig } from '../../../util/__mocks__/mockUnifiedConfig';
import { GlobalConfig } from '../../../publicApi';

const mockNavigateFn = vi.fn();
vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: () => mockNavigateFn,
}));

beforeEach(() => {
    vi.doMock(`${getBuildDirPath()}/custom/Hook.js`, () => ({
        default: vi.fn(),
    }));
    setUnifiedConfig(mockUnifiedConfig);
});

const renderMockAndOpenCustomMenu = async (globalConfigMock: GlobalConfig) => {
    setUnifiedConfig(globalConfigMock);
    vi.doMock(`${getBuildDirPath()}/custom/CustomMenu.js`, () => ({
        default: mockCustomMenu,
    }));

    render(<InputPage />, { wrapper: BrowserRouter });

    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

    expect(mockNavigateFn).not.toHaveBeenCalled();

    const menu = screen.getByText('Click Me! I am a button for custom menu');
    await userEvent.click(menu);

    return {
        service: 'demo_input',
        action: 'create',
        input: 'demo_input',
    };
};

it.skip('custom menu should redirect user on menu click - mock menu page style', async () => {
    const globalConfigMock = getGlobalConfigMockWithCustomMenuStylePage();

    const { service, action, input } = await renderMockAndOpenCustomMenu(globalConfigMock);

    // check that InputPage redirects to correct URL according to callback
    await waitFor(() => {
        expect(mockNavigateFn).toHaveBeenCalledWith({
            search: `service=${service}&action=${action}&input=${input}`,
        });
    });
});

it.skip('custom menu should open input modal on menu click - mock menu page dialog', async () => {
    const globalConfigMock = getGlobalConfigMockWithCustomMenuStyleDialog();
    const { service } = await renderMockAndOpenCustomMenu(globalConfigMock);

    // check if custom menu correctly opens modal
    expect(screen.getByText(`Add ${service}`)).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
});

it('click on menu item inside group should add input query to URL', async () => {
    setUnifiedConfig(mockUnifiedConfig);

    render(<InputPage />, { wrapper: BrowserRouter });

    await waitForElementToBeRemoved(() => screen.queryByTestId('wait-spinner'));

    await userEvent.click(screen.getByRole('button', { name: 'Create New Input' }));
    expect(mockNavigateFn).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('menuitem', { name: 'Billing' }));
    await userEvent.click(
        screen.getByRole('menuitem', { name: 'Billing (Cost and Usage Report) (Recommended)' })
    );

    expect(mockNavigateFn).toHaveBeenCalledWith({
        search: `service=aws_billing_cur&action=create&input=aws_billing_menu`,
    });
});

it('click on root menu item should add input query to URL', async () => {
    setUnifiedConfig(mockUnifiedConfig);

    render(<InputPage />, { wrapper: BrowserRouter });

    await waitForElementToBeRemoved(() => screen.queryByTestId('wait-spinner'));

    await userEvent.click(screen.getByRole('button', { name: 'Create New Input' }));
    expect(mockNavigateFn).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('menuitem', { name: 'CloudWatch' }));

    expect(mockNavigateFn).toHaveBeenCalledWith({
        search: `service=aws_cloudwatch&action=create&input=aws_cloudwatch`,
    });
});
