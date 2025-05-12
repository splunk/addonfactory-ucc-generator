import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary, { getRestrictQueryByAllServices } from './ErrorBoundary';
import { setUnifiedConfig } from '../../util/util';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { consoleError } from '../../../test.setup';

const ErrorComponent = () => {
    throw new Error('Throw error from component');
};

const mockGlobalConfig = () => {
    setUnifiedConfig(getGlobalConfigMock());
};

it('should render children when no error occurs', () => {
    mockGlobalConfig();
    render(
        <ErrorBoundary>
            <div>Safe Component</div>
        </ErrorBoundary>
    );

    // Check if the child component is rendered
    expect(screen.getByText(/safe component/i)).toBeInTheDocument();
});

it('should render Error Boundary component when a child component throws an error', () => {
    mockGlobalConfig();
    const consoleHandler = vi.fn();
    // Mock console.error to suppress error messages in the test output
    consoleError.mockImplementation(consoleHandler);

    render(
        <ErrorBoundary>
            <ErrorComponent />
        </ErrorBoundary>
    );
    expect(consoleHandler).toHaveBeenCalled();

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});

it('should render Error Boundary with useful links', async () => {
    mockGlobalConfig();
    consoleError.mockImplementation(() => {});
    render(
        <ErrorBoundary>
            <ErrorComponent />
        </ErrorBoundary>
    );

    const detailedSearchLink = screen.getByRole('link', {
        name: 'Error Splunk Search (Opens new window)',
    });
    expect(detailedSearchLink).toBeInTheDocument();
    expect(detailedSearchLink).toHaveAttribute(
        'href',
        `${window.location.origin}/search?q=index+%3D+_internal+source%3D*splunkd*+%0A%28%0A++++%28component%3DModularInputs+stderr%29%0A++++OR+component%3DExecProcessor+%28scheme+IN+%28demo_input%29%29%0A%29+%0AOR+component%3D%22PersistentScript%22`
    );

    const link = screen.getByRole('link', {
        name: 'Troubleshooting (Opens new window)',
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
        'href',
        'https://splunk.github.io/addonfactory-ucc-generator/troubleshooting/'
    );

    const searchLink = screen.getByRole('link', {
        name: 'General Error Splunk Search (Opens new window)',
    });
    expect(searchLink).toBeInTheDocument();
    expect(searchLink).toHaveAttribute(
        'href',
        `${window.location.origin}/search?q=index+%3D+_internal+source%3D*splunkd*+ERROR`
    );
});

it('check query restriction for all services - services present', () => {
    mockGlobalConfig();

    const restrictQuery = getRestrictQueryByAllServices();
    expect(restrictQuery).toBe('(scheme IN (demo_input)');
});

it('check query restriction for all services returns correct string if no services', () => {
    const tempConfig = getGlobalConfigMock();
    tempConfig.pages.inputs!.services = [];
    setUnifiedConfig(tempConfig);

    const restrictQuery = getRestrictQueryByAllServices();
    expect(restrictQuery).toBe('');
});

it('check query restriction for all services returns correct string if no inputs', () => {
    const tempConfig = getGlobalConfigMock();
    delete tempConfig.pages.inputs;
    setUnifiedConfig(tempConfig);

    const restrictQuery = getRestrictQueryByAllServices();
    expect(restrictQuery).toBe('');
});
