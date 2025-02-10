import React from 'react';
import { render, screen } from '@testing-library/react';
import { mapTextToElements } from './textUtils';

type PropType = Parameters<typeof mapTextToElements>[0];
const mockProps = {
    text: 'This is a [[link]] to something.',
    links: [
        {
            slug: 'link',
            link: 'https://splunk.github.io/addonfactory-ucc-generator/',
            linkText: 'Example Link',
        },
    ],
} satisfies PropType;

const setup = (props: PropType = mockProps) => {
    return render(<>{mapTextToElements(props)}</>);
};

describe('mapTextToElements', () => {
    it('should return null if no text is provided', () => {
        const { container } = setup({ ...mockProps, text: '' });
        expect(container.innerHTML).toBe('<span></span>');
    });

    it('should render text without links correctly', () => {
        setup({ ...mockProps, text: 'Just some text.' });
        expect(screen.getByText('Just some text.')).toBeInTheDocument();
    });

    it('should render text with links correctly', () => {
        setup();
        const linkElement = screen.getByRole('link', { name: 'Example Link (Opens new window)' });
        expect(linkElement).toHaveAttribute(
            'href',
            'https://splunk.github.io/addonfactory-ucc-generator/'
        );
    });

    it.each([
        {
            wholeText: '[[link]] This is the beginning.',
            textWithoutLinks: ['This is the beginning.'],
        },
        {
            wholeText: 'This is the beginning. [[link]]',
            textWithoutLinks: ['This is the beginning.'],
        },
        {
            wholeText: 'This is the beginning. [[link]][[link]]',
            textWithoutLinks: ['This is the beginning.'],
        },
        {
            wholeText: 'First line.\nThis is a [[link]] to something.\nAnother line.',
            textWithoutLinks: ['First line.', 'Another line.'],
            notExactText: ['This is a', 'to something.'],
        },
        {
            wholeText: 'First line.\nThis is a \n[[link]]\n to something.\nAnother line.',
            textWithoutLinks: ['First line.', 'Another line.', 'This is a', 'to something.'],
        },
    ])(
        'should render text with a link correctly',
        ({ wholeText, textWithoutLinks, notExactText }) => {
            const propsWithLinkAtBeginning = {
                ...mockProps,
                text: wholeText,
            };
            setup(propsWithLinkAtBeginning);

            const linkElement = screen.getAllByRole('link', {
                name: 'Example Link (Opens new window)',
            });

            linkElement.forEach((l) => {
                expect(l).toHaveAttribute(
                    'href',
                    'https://splunk.github.io/addonfactory-ucc-generator/'
                );
            });

            textWithoutLinks.forEach((t) => {
                expect(screen.getByText(t)).toBeInTheDocument();
            });
            notExactText?.forEach((t) => {
                expect(screen.getByText(t, { exact: false })).toBeInTheDocument();
            });
        }
    );

    it('should render text with a single link correctly', () => {
        const singleLinkProps = {
            text: 'Some text that should be link',
            link: 'https://splunk.github.io/addonfactory-ucc-generator/',
        };
        setup(singleLinkProps);
        const linkElement = screen.getByRole('link', {
            name: `${singleLinkProps.text} (Opens new window)`,
        });
        expect(linkElement).toHaveAttribute(
            'href',
            'https://splunk.github.io/addonfactory-ucc-generator/'
        );
    });

    it('should render multiple links correctly', () => {
        const multipleLinksProps = {
            text: 'This is a [[link1]] and another [[link2]].',
            links: [
                {
                    slug: 'link1',
                    link: 'https://splunk.github.io/addonfactory-ucc-generator/commands/',
                    linkText: 'Example Link 1',
                },
                {
                    slug: 'link2',
                    link: 'https://splunk.github.io/addonfactory-ucc-generator/quickstart/',
                    linkText: 'Example Link 2',
                },
            ],
        };
        setup(multipleLinksProps);

        const linkElement1 = screen.getByRole('link', {
            name: 'Example Link 1 (Opens new window)',
        });
        const linkElement2 = screen.getByRole('link', {
            name: 'Example Link 2 (Opens new window)',
        });

        expect(linkElement1).toHaveAttribute(
            'href',
            'https://splunk.github.io/addonfactory-ucc-generator/commands/'
        );
        expect(linkElement2).toHaveAttribute(
            'href',
            'https://splunk.github.io/addonfactory-ucc-generator/quickstart/'
        );
    });

    it('should handle text with no matching links', () => {
        const noMatchingLinksProps = {
            text: 'This is a [[nonexistent]] link.',
            links: [
                {
                    slug: 'link',
                    link: 'https://splunk.github.io/addonfactory-ucc-generator/',
                    linkText: 'Example Link',
                },
            ],
        };
        setup(noMatchingLinksProps);

        expect(screen.getByText('This is a [[nonexistent]] link.')).toBeInTheDocument();
    });
});
