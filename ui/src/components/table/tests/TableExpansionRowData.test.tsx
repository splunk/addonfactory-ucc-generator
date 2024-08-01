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

it('returns an empty array when moreInfo is undefined or empty', () => {
    const result = getExpansionRowData({}, []);
    expect(result).toEqual([]);
});

it('correctly processes non-empty moreInfo and returns expected React elements', async () => {
    const row = { name: 'John Doe', age: 30, country: 'USA' };
    const { container } = render(<div>{getExpansionRowData(row, moreInfo)}</div>);

    const dlElements = container.querySelectorAll('dd');
    expect(dlElements).toHaveLength(moreInfo.length);

    const userName = await screen.findByText('John Doe');
    const userAge = await screen.findByText('30');
    const userCountry = await screen.findByText('USA');

    const nameTag = await screen.findByText('Name');
    const ageTag = await screen.findByText('Age');
    const countryTag = await screen.findByText('Country');

    expect(userName).toBeInTheDocument();
    expect(userAge).toBeInTheDocument();
    expect(userCountry).toBeInTheDocument();

    expect(nameTag).toBeInTheDocument();
    expect(ageTag).toBeInTheDocument();
    expect(countryTag).toBeInTheDocument();
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

    const defName = screen.queryByText('Unknown');
    const defCountry = screen.queryByText('N/A');

    expect(defName).toBeInTheDocument();
    expect(defCountry).toBeInTheDocument();
});

it('handles non-string values correctly, converting them to strings', () => {
    const row = { name: 'Alice', age: null, country: undefined };
    render(<div>{getExpansionRowData(row, moreInfo)}</div>);

    const name = screen.queryByText('Alice');
    const ageElem = screen.queryByText('Age');
    const defCountry = screen.queryByText('N/A');

    expect(name).toBeInTheDocument();
    expect(ageElem).not.toBeInTheDocument();
    expect(defCountry).toBeInTheDocument();
});
