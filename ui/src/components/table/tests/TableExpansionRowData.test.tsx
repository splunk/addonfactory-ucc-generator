import React from 'react';
import { render } from '@testing-library/react';
import { getExpansionRowData } from '../TableExpansionRowData';

const moreInfo = [
    { label: 'Name', field: 'name', mapping: { '[[default]]': 'Unknown' } },
    { label: 'Age', field: 'age' },
    { label: 'Country', field: 'country', mapping: { '[[default]]': 'N/A' } },
];

it('returns an empty array when moreInfo is undefined or empty', () => {
    const result = getExpansionRowData({}, []);
    expect(result).toEqual([]);
});

it('correctly processes non-empty moreInfo and returns expected React elements', () => {
    const row = { name: 'John Doe', age: 30, country: 'USA' };
    const { container } = render(<div>{getExpansionRowData(row, moreInfo)}</div>);
    expect(container.textContent).toContain('John Doe');
    expect(container.textContent).toContain('30');
    expect(container.textContent).toContain('USA');
});

it('excludes fields when not present in row and no default value is provided', () => {
    const row = { name: 'Jane Doe', country: 'Canada' };
    const { container } = render(<div>{getExpansionRowData(row, moreInfo)}</div>);
    expect(container.textContent).not.toContain('Age');
});

it('includes fields with their default value when specified and field in row is empty or missing', () => {
    const row = { age: 25 };
    const { container } = render(<div>{getExpansionRowData(row, moreInfo)}</div>);
    expect(container.textContent).toContain('Unknown'); // Default for name
    expect(container.textContent).toContain('N/A'); // Default for country
});

it('handles non-string values correctly, converting them to strings', () => {
    const row = { name: 'Alice', age: null, country: undefined };
    const { container } = render(<div>{getExpansionRowData(row, moreInfo)}</div>);
    expect(container.textContent).toContain('Alice');
    expect(container.textContent).toContain('Unknown'); // Default for age as null
    expect(container.textContent).toContain('N/A'); // Default for country as undefined
});
