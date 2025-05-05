import * as React from 'react';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

import userEvent from '@testing-library/user-event';
import InputPage from '../InputPage';
import { getGlobalConfigMockWithCustomMenu } from '../../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../../util/util';
import { getBuildDirPath } from '../../../util/script';
import mockCustomMenu from './mockCustomMenu';

// it is just configuration not a mock to be changed
// eslint-disable-next-line jest/no-mocks-import
import { mockUnifiedConfig } from '../../../util/__mocks__/mockUnifiedConfig';

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

it('custom menu should redirect user on menu click', async () => {
    const globalConfigMock = getGlobalConfigMockWithCustomMenu();
    setUnifiedConfig(globalConfigMock);
    vi.doMock(`${getBuildDirPath()}/custom/CustomMenu.js`, () => ({
        default: mockCustomMenu,
    }));

    render(<InputPage />, { wrapper: BrowserRouter });

    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

    expect(mockNavigateFn).not.toHaveBeenCalled();

    const service = 'demo_input';
    const action = 'create';
    // it use service as input value when creating new input
    const input = 'demo_input';

    const menu = screen.getByText('Click Me! I am a button for custom menu');
    await userEvent.click(menu);

    // check that InputPage redirects to correct URL according to callback
    expect(mockNavigateFn).toHaveBeenCalledWith({
        search: `service=${service}&action=${action}&input=${input}`,
    });
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
