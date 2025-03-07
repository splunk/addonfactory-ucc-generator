import { expect, vi, beforeEach, it } from 'vitest';
import * as React from 'react';
import { render, screen, waitForElementToBeRemoved, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import userEvent from '@testing-library/user-event';
import InputPage from '../InputPage';
import { mockCustomMenu } from '../../../tests/helpers';

const mockedReactRouterDom = vi.hoisted(() => ({
    useNavigate: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const originalModule = await importOriginal<typeof import('react-router-dom')>(
        'react-router-dom'
    );
    return {
        ...originalModule,
        useNavigate: mockedReactRouterDom.useNavigate,
    };
});
vi.mock('../../../util/util');

it('custom menu should redirect user on menu click', async () => {
    const { mockCustomMenuInstance } = mockCustomMenu();
    render(<InputPage />, { wrapper: BrowserRouter });

    await waitForElementToBeRemoved(() => screen.queryByTestId('wait-spinner'));

    // expect(mockedReactRouterDom.useNavigate).not.toHaveBeenCalled();

    const service = 'aws_billing_cur';
    const action = 'create';
    const input = 'test-input';
    act(() =>
        // emulate user click on third-party menu component
        mockCustomMenuInstance.navigator({
            service,
            action,
            input,
        })
    );
    // await screen.findByTestId('wait-spinner');

    // check that InputPage redirects to correct URL according to callback
    expect(mockedReactRouterDom.useNavigate).toHaveBeenCalledWith({
        search: `service=${service}&action=${action}&input=${input}`,
    });
});

it('click on menu item inside group should add input query to URL', async () => {
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
    render(<InputPage />, { wrapper: BrowserRouter });

    await waitForElementToBeRemoved(() => screen.queryByTestId('wait-spinner'));

    await userEvent.click(screen.getByRole('button', { name: 'Create New Input' }));
    expect(mockNavigateFn).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('menuitem', { name: 'CloudWatch' }));

    expect(mockNavigateFn).toHaveBeenCalledWith({
        search: `service=aws_cloudwatch&action=create&input=aws_cloudwatch`,
    });
});
