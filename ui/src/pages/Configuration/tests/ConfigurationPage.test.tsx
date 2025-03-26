import { beforeEach, expect, it, MockInstance, vi } from 'vitest';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { http, HttpResponse } from 'msw';
import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { server } from '../../../mocks/server';
import { mockServerResponseWithContent } from '../../../mocks/server-response';
import { getUnifiedConfigs } from '../../../util/util';
import ConfigurationPage from '../ConfigurationPage';
import { type meta as metaType } from '../../../types/globalConfig/meta';
import { consoleError } from '../../../../test.setup.ts';

vi.mock('../../../util/util');

const getUnifiedConfigsMock = getUnifiedConfigs as unknown as MockInstance<
    typeof getUnifiedConfigs
>;

beforeEach(() => {
    server.use(
        http.get(`/servicesNS/nobody/-/:endpointUrl/:serviceName`, () =>
            HttpResponse.json(mockServerResponseWithContent)
        )
    );
});

function setup(meta: Partial<metaType>) {
    const globalConfigMock = getGlobalConfigMock();

    const newGlobalConfig = {
        ...globalConfigMock,
        meta: {
            ...globalConfigMock.meta,
            ...meta,
        },
    };
    getUnifiedConfigsMock.mockImplementation(() => newGlobalConfig);
    return render(<ConfigurationPage />, { wrapper: BrowserRouter });
}

it('should show UCC label', async () => {
    setup({ _uccVersion: undefined });

    const uccLink = await screen.findByRole('link', { name: /ucc/i });
    expect(uccLink).toBeInTheDocument();
    expect(uccLink).toHaveAttribute('href', 'https://splunk.github.io/addonfactory-ucc-generator/');
});

it('should not show UCC label', async () => {
    setup({ hideUCCVersion: true });

    const uccLink = screen.queryByRole('link', { name: /ucc/i });
    expect(uccLink).not.toBeInTheDocument();
});

it('should show UCC version', async () => {
    const expectedUccVersion = '5.2221.2341';
    setup({ _uccVersion: expectedUccVersion });

    const uccVersion = await screen.findByTestId('ucc-credit');
    expect(uccVersion).toHaveTextContent(expectedUccVersion);
});

it('should display error when server returns error', async () => {
    consoleError.mockImplementation(() => {});
    const errorMessage = 'Oopsie doopsie';
    server.use(
        http.get(`/servicesNS/nobody/-/:endpointUrl`, () =>
            HttpResponse.json(
                {
                    messages: [
                        {
                            text: errorMessage,
                        },
                    ],
                },
                { status: 500 }
            )
        )
    );

    setup({ _uccVersion: undefined });

    const errorText = await screen.findByText(errorMessage);
    expect(errorText).toBeInTheDocument();
});
