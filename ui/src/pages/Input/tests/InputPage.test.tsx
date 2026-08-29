import * as React from 'react';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import userEvent from '@testing-library/user-event';
import InputPage from '../InputPage';

import { setUnifiedConfig } from '../../../util/util';
import { getBuildDirPath } from '../../../util/script';
import { server } from '../../../mocks/server';
import { INPUTS_UNAVAILABLE_MARKER } from '../../../constants/inputsAvailability';

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

it('click on menu item inside group should add input query to URL', async () => {
    setUnifiedConfig(mockUnifiedConfig);

    render(<InputPage />, { wrapper: BrowserRouter });

    await waitForElementToBeRemoved(() => screen.queryByTestId('wait-spinner'));

    await userEvent.click(screen.getByRole('button', { name: 'Create New Input' }));
    expect(mockNavigateFn).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('menuitem', { name: 'Billing' }));
    const submenuItem = await screen.findByRole('menuitem', {
        name: /Billing \(Cost and Usage Report\).*\(Recommended\)/,
    });
    await userEvent.click(submenuItem);

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

it('renders the Inputs Unavailable page when the library gate fires', async () => {
    setUnifiedConfig(mockUnifiedConfig);
    const warnText = `${INPUTS_UNAVAILABLE_MARKER}. Configure inputs on the IDM instead.`;
    server.use(
        http.get('/servicesNS/nobody/-/:endpointUrl', () =>
            HttpResponse.json({ entry: [], messages: [{ type: 'WARN', text: warnText }] })
        )
    );

    render(<InputPage />, { wrapper: BrowserRouter });

    const placeholder = await screen.findByTestId('inputs-unavailable');
    expect(placeholder).toBeInTheDocument();
    expect(screen.getByText(warnText)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create New Input' })).not.toBeInTheDocument();
});
