import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ControlWrapper, { ControlWrapperProps } from '../ControlWrapper';

const renderControlWrapper = (props: Partial<ControlWrapperProps>) => {
    render(
        <ControlWrapper
            mode="create"
            utilityFuncts={{
                utilCustomFunctions: {
                    setState: () => {},
                    setErrorFieldMsg: () => {},
                    clearAllErrorMsg: (state) => state,
                    setErrorMsg: () => {},
                },
                handleChange: () => {},
                addCustomValidator: () => {},
            }}
            value=""
            display
            error={false}
            disabled={false}
            serviceName="testServiceName"
            dependencyValues={undefined}
            entity={{
                field: 'url',
                label: 'URL',
                type: 'text',
                help: 'Enter the URL, for example',
                required: true,
                validators: [
                    {
                        errorMsg:
                            "Invalid URL provided. URL should start with 'https' as only secure URLs are supported. Provide URL in this format",
                        type: 'regex',
                        pattern: '^(https://)[^/]+/?$',
                    },
                ],
                encrypted: false,
            }}
            {...props}
        />
    );
};

it('check if required star displayed correctly', () => {
    renderControlWrapper({});
    const requiredStar = screen.queryByText('*');
    expect(requiredStar).toBeInTheDocument();
});

it('check if required star not displayed', () => {
    renderControlWrapper({
        entity: {
            field: 'url',
            label: 'URL',
            type: 'text',
            required: false,
        },
    });
    const requiredStar = screen.queryByText('*');
    expect(requiredStar).not.toBeInTheDocument();
});

it('check if required star displayed correctly from modifiedEntitiesData', () => {
    renderControlWrapper({
        entity: {
            field: 'url',
            label: 'URL',
            type: 'text',
            required: false,
        },
        modifiedEntitiesData: { required: true },
    });
    const requiredStar = screen.queryByText('*');
    expect(requiredStar).toBeInTheDocument();
});

it('check if required star not displayed due to modifiedEntitiesData', () => {
    renderControlWrapper({
        entity: {
            field: 'url',
            label: 'URL',
            type: 'text',
            required: true,
        },
        modifiedEntitiesData: { required: false },
    });

    const requiredStar = screen.queryByText('*');
    expect(requiredStar).not.toBeInTheDocument();
});

it('check if label and help updated due to modifiedEntitiesData', () => {
    const modifications = { required: false, label: 'Modified URL', help: 'Modified help' };
    renderControlWrapper({
        entity: {
            field: 'url',
            label: 'URL',
            help: 'Enter the URL, for example',
            type: 'text',
            required: true,
        },
        modifiedEntitiesData: modifications,
    });

    const label = screen.getByTestId('label'); // label replaced
    expect(label).toHaveTextContent(modifications.label);

    const help = screen.getByTestId('help'); // help replaced
    expect(help).toHaveTextContent(modifications.help);
});

describe('Help message', () => {
    const verifyLink = ({ link, linkText }: { link: string; linkText: string }) => {
        const linkElem = screen.getByRole('link', {
            name: `${linkText} (Opens new window)`,
        });

        expect(linkElem).toBeInTheDocument();
        expect(linkElem).toHaveAttribute('href', link);
        expect(linkElem).toHaveTextContent(`${linkText}(Opens new window)`);
    };

    it('check if help added due to modifiedEntitiesData', () => {
        const modifications = { help: 'Modified help' };

        renderControlWrapper({
            entity: {
                field: 'url',
                label: 'URL',
                type: 'text',
                required: true,
            },
            modifiedEntitiesData: modifications,
        });

        const help = screen.getByTestId('help');
        expect(help).toHaveTextContent(modifications.help);
    });

    it('Check if help with many lines displayed', () => {
        const helpText =
            'First line \n Second Line \n some more longer text that is used as a third line \n last line';

        renderControlWrapper({
            entity: {
                field: 'url',
                label: 'URL',
                type: 'text',
                required: true,
                help: helpText,
            },
        });

        const help = screen.getByTestId('help');

        const splitedMessages = helpText.split('\n').map((s) => s.trim());

        // verify if text is displayed at all
        // visual correctnes of display is checked via storybook images
        splitedMessages.forEach((msg) => {
            expect(help.textContent).toContain(msg);
        });
    });

    it('Check if help with links displayed', () => {
        const helpDef = {
            text: 'Some line that contains link [[here]] to documentation',
            links: [
                {
                    slug: 'here',
                    link: 'https://splunk.github.io/addonfactory-ucc-generator/',
                    linkText: 'reference',
                },
            ],
        };

        renderControlWrapper({
            entity: {
                field: 'url',
                label: 'URL',
                type: 'text',
                required: true,
                help: helpDef,
            },
        });

        const help = screen.getByTestId('help');

        // verify if elements are displayed at all
        // visual correctnes of display is checked via storybook images
        verifyLink(helpDef.links[0]);

        expect(help).toHaveTextContent(
            'Some line that contains link reference(Opens new window) to documentation'
        );
        // include rest of text
        expect(help).toHaveTextContent('Some line that contains link');
        expect(help).toHaveTextContent('to documentation');
    });

    it('Check if help rendered twice', () => {
        const helpDef = {
            text: 'Some line that contains link [[here]] to documentation ([[here]])',
            links: [
                {
                    slug: 'here',
                    link: 'https://splunk.github.io/addonfactory-ucc-generator/',
                    linkText: 'reference',
                },
            ],
        };

        renderControlWrapper({
            entity: {
                field: 'url',
                label: 'URL',
                type: 'text',
                required: true,
                help: helpDef,
            },
        });

        // verify if elements are displayed at all
        // visual correctnes of display is checked via storybook images

        const linkElems = screen.getAllByRole('link', {
            name: `${helpDef.links[0].linkText} (Opens new window)`,
        });
        expect(linkElems).toHaveLength(2);
    });

    it('Check if help with many links displayed', () => {
        const helpDef = {
            text: 'Some line that contains link [[thisLink]] to documentation or you can use [[thatLink]]',
            links: [
                {
                    slug: 'thisLink',
                    link: 'https://splunk.github.io/addonfactory-ucc-generator/',
                    linkText: 'reference',
                },
                {
                    slug: 'thatLink',
                    link: 'https://splunk.github.io/addonfactory-ucc-generator/quickstart/',
                    linkText: 'UCC Reference',
                },
            ],
        };

        renderControlWrapper({
            entity: {
                field: 'url',
                label: 'URL',
                type: 'text',
                required: true,
                help: helpDef,
            },
        });

        // verify if elements are displayed at all
        // visual correctnes of display is checked via storybook images

        verifyLink(helpDef.links[0]);
        verifyLink(helpDef.links[1]);

        const help = screen.getByTestId('help');

        // include rest of text
        expect(help).toHaveTextContent('Some line that contains link');
        expect(help).toHaveTextContent(
            'to documentation or you can use UCC Reference(Opens new window)'
        );
    });

    it('Check if help with many lines after modifiedEntitiesData', () => {
        const helpText =
            'First line \n Second Line \n some more longer text that is used as a third line \n last line';

        renderControlWrapper({
            modifiedEntitiesData: { help: helpText },
        });

        const help = screen.getByTestId('help');

        const splitedMessages = helpText.split('\n').map((s) => s.trim());

        // verify if text is displayed at all
        // visual correctnes of display is checked via storybook images
        splitedMessages.forEach((msg) => {
            expect(help.textContent).toContain(msg);
        });
    });

    it('Check if help with links after modifiedEntitiesData', () => {
        const helpDef = {
            text: 'Some line that contains link [[thisLink]] to documentation or you can use [[thatLink]]',
            links: [
                {
                    slug: 'thisLink',
                    link: 'https://splunk.github.io/addonfactory-ucc-generator/',
                    linkText: 'reference',
                },
                {
                    slug: 'thatLink',
                    link: 'https://splunk.github.io/addonfactory-ucc-generator/quickstart/',
                    linkText: 'UCC Reference',
                },
            ],
        };

        renderControlWrapper({
            modifiedEntitiesData: { help: helpDef },
        });

        // verify if elements are displayed at all
        // visual correctnes of display is checked via storybook images

        verifyLink(helpDef.links[0]);
        verifyLink(helpDef.links[1]);

        const help = screen.getByTestId('help');

        // include rest of text
        expect(help).toHaveTextContent('Some line that contains link');
        expect(help).toHaveTextContent(
            'to documentation or you can use UCC Reference(Opens new window)'
        );
    });

    it('Check if only correct references replaced', () => {
        const helpDef = {
            text: 'Some line that contains link [[unexisting]] to documentation ([[unexsting]])',
            links: [
                {
                    slug: 'here',
                    link: 'https://splunk.github.io/addonfactory-ucc-generator/',
                    linkText: 'reference',
                },
            ],
        };

        renderControlWrapper({
            entity: {
                field: 'url',
                label: 'URL',
                type: 'text',
                required: true,
                help: helpDef,
            },
        });

        // verify if elements are displayed at all
        // visual correctnes of display is checked via storybook images

        const linkElem = screen.queryByRole('link');
        expect(linkElem).toBeNull();

        const help = screen.getByTestId('help');
        expect(help).toHaveTextContent(helpDef.text);
    });

    it('Check if correctly rendered as one link', () => {
        const helpDef = {
            text: 'Some line that contains link [[unexisting]] to documentation ([[unexsting]])',
            link: 'https://splunk.github.io/addonfactory-ucc-generator/',
        };

        renderControlWrapper({
            entity: {
                field: 'url',
                label: 'URL',
                type: 'text',
                required: true,
                help: helpDef,
            },
        });

        // verify if elements are displayed at all
        // visual correctnes of display is checked via storybook images

        const linkElem = screen.queryByRole('link');
        expect(linkElem).toHaveTextContent(helpDef.text);
    });
});
