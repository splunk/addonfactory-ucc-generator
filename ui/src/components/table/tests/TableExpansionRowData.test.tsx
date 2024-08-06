import React from 'react';
import { render, screen } from '@testing-library/react';
import { getExpansionRowData } from '../TableExpansionRowData';
import { LABEL_FOR_DEFAULT_TABLE_CELL_VALUE } from '../TableConsts';

const moreInfo = [
    { label: 'Name', field: 'name', mapping: { [LABEL_FOR_DEFAULT_TABLE_CELL_VALUE]: 'Unknown' } },
    { label: 'Age', field: 'age' },
    {
        label: 'Country',
        field: 'country',
        mapping: { [LABEL_FOR_DEFAULT_TABLE_CELL_VALUE]: 'N/A' },
    },
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
    const row = { name: 'John Doe', age: 30, country: 'USA' };
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
