import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import HelpLinkComponent from '../HelpLinkComponent';

it('Render simpliest link', () => {
    render(
        <HelpLinkComponent
            controlOptions={{
                text: 'example text',
                link: 'example/reflink',
            }}
        />
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'example/reflink');
    expect(link).toHaveTextContent('example text');
});

it('Render text with one word link', () => {
    render(
        <HelpLinkComponent
            controlOptions={{
                text: 'Help as text with link assigned to [[here]] word',
                links: [
                    {
                        slug: 'here',
                        link: 'https://splunk.github.io/addonfactory-ucc-generator/',
                        linkText: 'this',
                    },
                ],
            }}
        />
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://splunk.github.io/addonfactory-ucc-generator/');
    expect(link).toHaveTextContent('this');
});

it('Render in many lines with one as link', () => {
    render(
        <HelpLinkComponent
            controlOptions={{
                text: 'First Line\n Second Line \n[[link]]\n Last line',
                links: [
                    {
                        slug: 'link',
                        link: 'https://splunk.github.io/addonfactory-ucc-generator/',
                        linkText: 'Link Line',
                    },
                ],
            }}
        />
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://splunk.github.io/addonfactory-ucc-generator/');
    expect(link).toHaveTextContent('Link Line');

    const firstLine = screen.getByText('First Line', { exact: true });
    expect(firstLine).toBeInTheDocument();
    const secondLine = screen.getByText('Second Line', { exact: true });
    expect(secondLine).toBeInTheDocument();
    const lastLine = screen.getByText('Last line', { exact: true });
    expect(lastLine).toBeInTheDocument();
});

it('Render one link in many lines', () => {
    render(
        <HelpLinkComponent
            controlOptions={{
                text: 'First Line\n Second Line \n Last line',
                link: 'https://splunk.github.io/addonfactory-ucc-generator/',
            }}
        />
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://splunk.github.io/addonfactory-ucc-generator/');
    expect(link).toHaveTextContent('First Line Second Line Last line(Opens new window)');
});
