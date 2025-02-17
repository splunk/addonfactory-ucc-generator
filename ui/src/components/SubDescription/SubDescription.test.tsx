import React from 'react';

import { render, screen } from '@testing-library/react';
import SubDescription from './SubDescription';

it('Sub Description component - without links', async () => {
    const props = {
        text: `Some description without any break or changes`,
    };
    render(<SubDescription {...props} />);

    const subDesc = await screen.findByText(props.text);
    expect(subDesc).toBeInTheDocument();
});

it('Sub Description component - links', async () => {
    const props = {
        text: `Ingesting data from to Splunk Cloud?\nRead our [[blogPost]] to learn more about Data Manager and it's availability on your Splunk Cloud instance.`,
        links: [
            {
                slug: 'blogPost',
                link: 'https://splk.it/31oy2b2',
                linkText: 'blog post',
            },
        ],
    };
    render(<SubDescription {...props} />);

    // visual aspects are verified by storybook images

    screen.getByText('Ingesting data from to Splunk Cloud?', {
        exact: true,
    });

    screen.getByText('Read our ', { exact: false });

    screen.getByText(
        "to learn more about Data Manager and it's availability on your Splunk Cloud instance.",
        { exact: false }
    );

    const linkInsideDescription = screen.getByRole('link', {
        name: 'blog post (Opens new window)',
    });

    expect(linkInsideDescription).toHaveAttribute('href', 'https://splk.it/31oy2b2');
});
