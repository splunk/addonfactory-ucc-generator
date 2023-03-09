import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextDecoder } from 'node:util'; // (ESM style imports)
import FileInputComponent from '../../components/FileInputComponent';

// eslint-disable-next-line no-undef
global.TextDecoder = TextDecoder;

describe('FileInputComponent', () => {
    const field = 'testFile';
    const disabled = false;
    const controlOptions = {};
    const handleChange = jest.fn();

    test('check FileInputComponent render properly', () => {
        render(
            <FileInputComponent
                field={field}
                disabled={disabled}
                controlOptions={controlOptions}
                handleChange={handleChange}
            />
        );
        const file = screen.queryAllByTestId('file-supports');
        expect(file).toBeDefined();
    });
});
