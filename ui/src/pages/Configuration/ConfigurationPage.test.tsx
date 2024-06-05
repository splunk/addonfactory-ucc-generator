import * as React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { http, HttpResponse } from 'msw';
import ConfigurationPage from './ConfigurationPage';
import { getUnifiedConfigs } from '../../util/util';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { type meta as metaType } from '../../types/globalConfig/meta';
import { mockServerResponseWithContent } from '../../mocks/server-response';
import { server } from '../../mocks/server';

jest.mock('../../util/util');

const getUnifiedConfigsMock = getUnifiedConfigs as jest.Mock;

beforeEach(() => {
    server.use(
        http.get(`/servicesNS/nobody/-/:endpointUrl`, () =>
            HttpResponse.json(mockServerResponseWithContent)
        )
    );
});

function setup(meta: Partial<metaType>) {
    const globalConfigMock = getGlobalConfigMock();

    getUnifiedConfigsMock.mockImplementation(() => ({
        ...globalConfigMock,
        meta: {
            ...globalConfigMock.meta,
            ...meta,
        },
    }));
    return render(<ConfigurationPage />, { wrapper: BrowserRouter });
}

it('should show UCC label', async () => {
    const page = setup({
        _uccVersion: undefined,
    });

    const uccLink = page.getByRole('link', { name: /ucc/i });
    expect(uccLink).toBeInTheDocument();
    expect(uccLink.getAttribute('href')).toContain('github.io');
});

it('should not show UCC label', async () => {
    const page = setup({
        hideUCCVersion: true,
    });

    const uccLink = page.queryByRole('link', { name: /ucc/i });
    expect(uccLink).toBeNull();
});

it('should show UCC version', async () => {
    const uccVersion = '5.2221.2341';
    const page = setup({
        _uccVersion: uccVersion,
    });

    expect(page.getByTestId('ucc-credit')).toHaveTextContent(uccVersion);
});
