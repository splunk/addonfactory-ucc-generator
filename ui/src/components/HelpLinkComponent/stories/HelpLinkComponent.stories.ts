import type { Meta, StoryObj } from '@storybook/react';
import HelpLinkComponent from '../HelpLinkComponent';

const meta = {
    component: HelpLinkComponent,
    title: 'HelpLinkComponent',
} satisfies Meta<typeof HelpLinkComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        controlOptions: {
            text: 'example text',
            link: 'example/reflink',
        },
    },
};

export const HelpAsTextWithLinks: Story = {
    args: {
        controlOptions: {
            text: 'Help as text with link assigned to [[here]] word',
            links: [
                {
                    slug: 'here',
                    link: 'https://splunk.github.io/addonfactory-ucc-generator/',
                    linkText: 'this',
                },
            ],
        },
    },
};

export const HelpNoLinksInManyLines: Story = {
    args: {
        controlOptions: {
            text: 'Help text \n displayed \n in many lines',
            links: [
                {
                    slug: 'here',
                    link: 'https://splunk.github.io/addonfactory-ucc-generator/',
                    linkText: 'this',
                },
            ],
        },
    },
};

export const HelpManyLinesAndLink: Story = {
    args: {
        controlOptions: {
            text: 'First Line\n Second Line \n[[link]]\n Last line',
            links: [
                {
                    slug: 'link',
                    link: 'https://splunk.github.io/addonfactory-ucc-generator/',
                    linkText: 'Link Line',
                },
            ],
        },
    },
};

export const OneLinkManyLines: Story = {
    args: {
        controlOptions: {
            text: 'First Line\n Second Line \n Last line',
            link: 'https://splunk.github.io/addonfactory-ucc-generator/',
        },
    },
};
