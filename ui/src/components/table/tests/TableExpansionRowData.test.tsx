import { expect, it } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { getExpansionRowData } from '../TableExpansionRowData';
import { LABEL_FOR_DEFAULT_TABLE_CELL_VALUE } from '../TableConsts';
import { AcceptableFormValueOrNullish } from '../../../types/components/shareableTypes';

const moreInfo = [
    { label: 'Name', field: 'name', mapping: { [LABEL_FOR_DEFAULT_TABLE_CELL_VALUE]: 'Unknown' } },
    { label: 'Age', field: 'age' },
    {
        label: 'Country',
        field: 'country',
        mapping: { [LABEL_FOR_DEFAULT_TABLE_CELL_VALUE]: 'N/A' },
    },
    { label: 'Status', field: 'disabled' },
];

const getTermByText = (content: string) =>
    screen.getAllByRole('term').find((term) => term.textContent === content);
const getDefinitionByText = (content: string) =>
    screen.getAllByRole('definition').find((definition) => definition.textContent === content);

it('returns an empty array when moreInfo is undefined or empty', () => {
    const result = getExpansionRowData({}, []);
    expect(result).toEqual([]);
});

it('correctly processes non-empty moreInfo and returns expected React elements', async () => {
    const row = { name: 'John Doe', age: 30, country: 'USA', disabled: false };
    render(<div>{getExpansionRowData(row, moreInfo)}</div>);

    expect(screen.getAllByRole('definition')).toHaveLength(moreInfo.length);

    expect(getTermByText('Name')).toBeInTheDocument();
    expect(getDefinitionByText('John Doe')).toBeInTheDocument();

    expect(getTermByText('Country')).toBeInTheDocument();
    expect(getDefinitionByText('USA')).toBeInTheDocument();

    expect(getTermByText('Age')).toBeInTheDocument();
    expect(getDefinitionByText('30')).toBeInTheDocument();
});
it('excludes fields when not present in row and no default value is provided', async () => {
    const row = { name: 'Jane Doe', country: 'Canada' };
    render(<div>{getExpansionRowData(row, moreInfo)}</div>);

    const userAge = screen.queryByText('30');
    const ageTag = screen.queryByText('Age');

    expect(userAge).not.toBeInTheDocument();
    expect(ageTag).not.toBeInTheDocument();
});

it.each([
    { disabled: false, name: 'Jane Doe', country: 'Canada' },
    { disabled: true, name: 'Jane Doe', country: 'Canada' },
])(
    'display status correctly in more info',
    ({
        disabled,
        name,
        country,
    }: {
        disabled: AcceptableFormValueOrNullish;
        name: string;
        country: string;
    }) => {
        const row = { name, country, disabled };
        render(<div>{getExpansionRowData(row, moreInfo)}</div>);

        const nameText = screen.queryByText(name);
        const countryText = screen.queryByText(country);
        const statusText = screen.queryByText(String(disabled));

        expect(nameText).toBeInTheDocument();
        expect(countryText).toBeInTheDocument();
        expect(statusText).toBeInTheDocument();
    }
);

it.each([
    { disabled: undefined, name: 'Jane Doe', country: undefined },
    { disabled: undefined, name: 'Jane Doe', country: null },
    { disabled: null, name: 'Jane Doe', country: undefined },
    { disabled: null, name: 'Jane Doe', country: null },
    { disabled: '', name: 'Jane Doe', country: null },
])(
    'Do not display nullish data',
    async ({
        disabled,
        name,
        country,
    }: {
        disabled: AcceptableFormValueOrNullish;
        name: string;
        country: AcceptableFormValueOrNullish;
    }) => {
        const row = { name, country, disabled };
        render(<div>{getExpansionRowData(row, moreInfo)}</div>);

        const nameText = screen.queryByText(name);

        const countryText = screen.queryByText(String(country));
        const countryTextDefault = screen.queryByText('N/A');

        const statusLabel = screen.queryByRole(String(disabled));

        // name displayed correctly
        expect(nameText).toBeInTheDocument();

        // country with default value so value text is not displayed
        expect(countryText).not.toBeInTheDocument();
        expect(countryTextDefault).toBeInTheDocument();

        // status is not displayed at all
        expect(statusLabel).not.toBeInTheDocument();
    }
);

it('display status correctly', async () => {
    const row = { name: 'Jane Doe', country: 'Canada' };
    render(<div>{getExpansionRowData(row, moreInfo)}</div>);

    const userAge = screen.queryByText('30');
    const ageTag = screen.queryByText('Age');

    expect(userAge).not.toBeInTheDocument();
    expect(ageTag).not.toBeInTheDocument();
});

it('includes fields with their default value when specified and field in row is empty or missing', () => {
    const row = { age: 25 };
    render(<div>{getExpansionRowData(row, moreInfo)}</div>);

    expect(getDefinitionByText('Unknown')).toBeInTheDocument();
    expect(getDefinitionByText('N/A')).toBeInTheDocument();
});

it('handles non-string values correctly, converting them to strings', () => {
    const row = { name: 'Alice', age: null, country: undefined };
    render(<div>{getExpansionRowData(row, moreInfo)}</div>);

    expect(getDefinitionByText('Alice')).toBeInTheDocument();
    expect(getDefinitionByText('N/A')).toBeInTheDocument();
    expect(getDefinitionByText('Age')).toBeUndefined();
});
