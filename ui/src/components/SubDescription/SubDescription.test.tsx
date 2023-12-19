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
        text: `Ingesting data from to Splunk Cloud?</br>Read our [[blogPost]] to learn more about Data Manager and it's availability on your Splunk Cloud instance.`,
        links: [
            {
                slug: 'blogPost',
                link: 'https://splk.it/31oy2b2',
                linkText: 'blog post',
            },
        ],
    };
    render(<SubDescription {...props} />);

    const firstParagraph = await screen.findByText('Ingesting data from to Splunk Cloud?');
    expect(firstParagraph).toBeInTheDocument();
    const wholeSubDescription = firstParagraph.parentNode;
    expect(wholeSubDescription?.textContent).toEqual(
        props.text.replaceAll('</br>', '').replaceAll('[[blogPost]]', 'blog post')
    );

    const linkInsideDescription = wholeSubDescription?.querySelector('a');
    expect(linkInsideDescription).toBeInTheDocument();
    expect(linkInsideDescription?.href).toEqual('https://splk.it/31oy2b2');
});
