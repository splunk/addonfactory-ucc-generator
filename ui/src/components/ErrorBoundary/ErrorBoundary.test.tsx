import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary';
import { consoleError } from '../../../jest.setup';

const ErrorComponent = () => {
    throw new Error('Throw error from component');
};

it('should render children when no error occurs', () => {
    render(
        <ErrorBoundary>
            <div>Safe Component</div>
        </ErrorBoundary>
    );

    // Check if the child component is rendered
    expect(screen.getByText(/safe component/i)).toBeInTheDocument();
});

it('should render Error Boundary component when a child component throws an error', () => {
    const consoleHandler = jest.fn();
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
    consoleError.mockImplementation(() => {});
    render(
        <ErrorBoundary>
            <ErrorComponent />
        </ErrorBoundary>
    );

    const collapsiblePanel = screen.getByRole('button', {
        name: 'Useful Links',
    });
    expect(collapsiblePanel).toBeInTheDocument();
    await userEvent.click(collapsiblePanel);

    const link = screen.getByRole('link', {
        name: 'Troubleshooting (Opens new window)',
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
        'href',
        'https://splunk.github.io/addonfactory-ucc-generator/troubleshooting/'
    );

    const searchLink = screen.getByRole('link', {
        name: 'Splunk Search (Opens new window)',
    });
    expect(searchLink).toBeInTheDocument();
    expect(searchLink).toHaveAttribute(
        'href',
        `${window.location.origin}/search?q=index+%3D+_internal+source%3D*splunkd*+ERROR`
    );
});
