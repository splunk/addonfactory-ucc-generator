import { it, vi, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import * as configUtils from '../../util/util';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';

const setupConfig = (overrideMeta = {}) => {
    const mock = getGlobalConfigMock();
    mock.meta = {
        ...mock.meta,
        ...overrideMeta,
    };
    vi.spyOn(configUtils, 'getUnifiedConfigs').mockReturnValue(mock);
};

beforeEach(() => {
    vi.clearAllMocks();
});

it('renders Footer by default when showFooter is undefined', async () => {
    setupConfig();

    render(<Footer />);
    await screen.findByText(/Addon Version: 5.31.1R85f0e18e/i);
});

it('renders Footer when showFooter is true', async () => {
    setupConfig({ showFooter: true });

    render(<Footer />);
    await screen.findByText(/Addon Version: 5.31.1R85f0e18e/i);
});

it('does not render Footer when showFooter is false', () => {
    setupConfig({ showFooter: false });

    const { container } = render(<Footer />);
    expect(container).toBeEmptyDOMElement();
});
