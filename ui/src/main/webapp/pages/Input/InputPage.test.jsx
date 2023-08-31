import * as React from 'react';
import { render, screen, waitForElementToBeRemoved, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import InputPage from './InputPage';
import { mockCustomMenu } from '../../tests/helpers';

const mockNavigateFn = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigateFn,
}));

jest.mock('../../util/util');

let mockCustomMenuInstance;

beforeEach(() => {
    mockCustomMenuInstance = mockCustomMenu().mockCustomMenuInstance;
});

it('should redirect user on menu click', async () => {
    render(<InputPage />, { wrapper: BrowserRouter });

    await waitForElementToBeRemoved(() => screen.queryByTestId('wait-spinner'));

    expect(mockNavigateFn).not.toHaveBeenCalled();

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

    // check that InputPage redirects to correct URL according to callback
    expect(mockNavigateFn).toHaveBeenCalledWith({
        search: `service=${service}&action=${action}`,
    });
});
