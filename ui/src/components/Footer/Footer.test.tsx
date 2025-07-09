import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import Footer from './Footer';
import * as utils from '../../pages/Dashboard/utils';
import * as configUtils from '../../util/util';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';

const mockBuildTime = 1720464960;
const setupConfig = (overrideMeta = {}) => {
    const mock = getGlobalConfigMock();
    mock.meta = {
        ...mock.meta,
        ...overrideMeta,
    };
    vi.spyOn(configUtils, 'getUnifiedConfigs').mockReturnValue(mock);
};
beforeEach(() => {
    // 🔧 Mock runSearchJob to return a mock build timestamp
    vi.spyOn(utils, 'runSearchJob').mockResolvedValue({
        fields: [{ name: 'build' }],
        init_offset: 0,
        messages: [],
        preview: false,
        post_process_count: 0,
        results: [
            {
                _raw: `{"build": "${mockBuildTime}"}`,
                splunk_server: 'localhost',
                index: 'main',
                build: `${mockBuildTime}`,
            },
        ],
    });
});

it('renders version and formatted UTC build time', async () => {
    setupConfig();
    render(<Footer />);

    // Check version is rendered
    await screen.findByText(/Add-on Version: 5.31.1R85f0e18e/i);
    // Check the UTC date format
    expect(screen.getByText(/UTC$/)).toHaveTextContent('Build Time: 8 Jul 2024, 18:56:00 UTC');
});

it('handles build error', async () => {
    setupConfig();
    vi.spyOn(utils, 'runSearchJob').mockRejectedValue(new Error('An unknown error occurred'));

    render(<Footer />);

    await screen.findByText(/Build Error:/i);
    expect(screen.getByText(/Build Error: An unknown error occurred/i)).toBeInTheDocument();
});

it('does not render Footer when showFooter is false', () => {
    setupConfig({ showFooter: false });

    render(<Footer />);
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
});
