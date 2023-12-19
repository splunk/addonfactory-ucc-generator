import type { Meta, StoryObj } from '@storybook/react';
import SubDescription from './SubDescription';

const meta = {
    component: SubDescription,
    title: 'Components/SubDescription',
} satisfies Meta<typeof SubDescription>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        text: `Configuration page - Ingesting data from to Splunk Cloud? Have you tried the new Splunk Data Manager yet?</br>Data Manager makes AWS data ingestion simpler, more automated and centrally managed for you, while [blogPost2][[blogPost2]] co-existing with AWS and/or Kinesis TAs.</br>Read our [[blogPost]][blogPost2] to learn more about Data Manager and it's availability on your Splunk Cloud instance.`,
        links: [
            {
                slug: 'blogPost',
                link: 'https://splk.it/31oy2b2',
                linkText: 'blog post',
            },
            {
                slug: 'blogPost2',
                link: 'https://splk.it/31oy2b2',
                linkText: 'blog post 2',
            },
        ],
    },
};
