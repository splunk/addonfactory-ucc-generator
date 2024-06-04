import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import './mockJs';
import DashboardPage from '../DashboardPage';
import { server } from '../../../mocks/server';

it('dashboard page renders waiting spinner', async () => {
    server.use(http.get('/custom/panels_to_display.json', () => HttpResponse.json({})));

    render(<DashboardPage />);

    const waitingSpinner = await screen.findByTestId('wait-spinner');
    expect(waitingSpinner).toBeInTheDocument();
});
