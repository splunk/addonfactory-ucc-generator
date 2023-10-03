import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextDecoder } from 'node:util'; // (ESM style imports)
import FileInputComponent from './FileInputComponent';

// eslint-disable-next-line no-undef
global.TextDecoder = TextDecoder;

test('Check FileInputComponent render properly with the fileSupportMessage option.', async () => {
    const field = 'testFileField';
    const disabled = false;
    const controlOptions = {
        fileSupportMessage: 'Support Message',
        supportedFileTypes: ['json'],
    };
    const handleChange = jest.fn();

    const testfile = new File(['{"test":"test"}'], 'test.json', {
        type: 'application/json',
    });

    render(
        <FileInputComponent
            field={field}
            disabled={disabled}
            controlOptions={controlOptions}
            handleChange={handleChange}
        />
    );
    // Check if file component is rendered
    const file = screen.getByTestId('file');
    expect(file).toBeInTheDocument();

    // Check if support message is rendered
    const fileSupportMessage = screen.getByTestId('file-supports');
    expect(fileSupportMessage).toHaveTextContent('Support Message');

    const fileInput = screen.getByTestId('file-input');
    await userEvent.upload(fileInput, testfile);
    expect(await screen.findByTestId('label')).toHaveTextContent('test.json');

    // Check that uploaded file is present.
    // Check that handleChange is called with valid args.
    expect(handleChange).toHaveBeenCalledWith('testFileField', '{"test":"test"}');
});

test('Check file remove button works properly.', async () => {
    const field = 'testFileField';
    const disabled = false;
    const controlOptions = {
        supportedFileTypes: ['txt'],
    };
    const handleChange = jest.fn();

    const testfile = new File(['test file content'], 'test.txt', {
        type: 'text/plain',
    });

    render(
        <FileInputComponent
            field={field}
            disabled={disabled}
            controlOptions={controlOptions}
            handleChange={handleChange}
        />
    );

    const fileInput = screen.getByTestId('file-input');
    await userEvent.upload(fileInput, testfile);

    // Check that uploaded file is present.
    expect(await screen.findByTestId('label')).toHaveTextContent('test.txt');
    // Check that handleChange is called with valid args.
    expect(handleChange).toHaveBeenCalledWith('testFileField', 'test file content');

    const removeButton = screen.getByTestId('remove');
    await userEvent.click(removeButton);

    // Check that file is not present
    expect(screen.queryByTestId('label')).not.toBeInTheDocument();
    // Check that handleChange is called with empty string
    expect(handleChange).toHaveBeenCalledWith('testFileField', '');
});

test('Check that the proper error message is displayed for an invalid file type with a single valid type.', async () => {
    const field = 'testFileField';
    const disabled = false;
    const controlOptions = {
        supportedFileTypes: ['json'],
    };
    const handleChange = jest.fn();

    const invalidFile = new File(['test file content'], 'test.txt', {
        type: 'text/plain',
    });

    render(
        <FileInputComponent
            field={field}
            disabled={disabled}
            controlOptions={controlOptions}
            handleChange={handleChange}
        />
    );

    const fileInput = screen.getByTestId('file-input');

    await userEvent.upload(fileInput, invalidFile);

    // Check that file is present
    expect(await screen.findByTestId('label')).toHaveTextContent('test.txt');
    // Check if proper error msg is display
    expect(await screen.findByTestId('help')).toHaveTextContent('The file must be in json format');
    // Check that handleChange is called with ##INVALID_FILE##
    expect(handleChange).toHaveBeenCalledWith('testFileField', '##INVALID_FILE##');
});

test('Check that the proper error message is displayed for an invalid file type with multiple valid types in the supportedFileTypes option.', async () => {
    const field = 'testFileField';
    const disabled = false;
    const controlOptions = {
        supportedFileTypes: ['txt', 'pem'],
    };
    const handleChange = jest.fn();

    const invalidFile = new File(['{"test":"test"}'], 'test.json', {
        type: 'application/json',
    });

    render(
        <FileInputComponent
            field={field}
            disabled={disabled}
            controlOptions={controlOptions}
            handleChange={handleChange}
        />
    );

    const fileInput = screen.getByTestId('file-input');
    await userEvent.upload(fileInput, invalidFile);

    // Check that file is present
    expect(await screen.findByTestId('label')).toHaveTextContent('test.json');
    // Check if proper error msg is display
    expect(await screen.findByTestId('help')).toHaveTextContent(
        'The file must be in one of these formats: txt, pem'
    );
    // Check that handleChange is called with ##INVALID_FILE##
    expect(handleChange).toHaveBeenCalledWith('testFileField', '##INVALID_FILE##');
});

test('Check that the proper error message is displayed for invalid file size.', async () => {
    const field = 'testFileField';
    const disabled = false;
    const controlOptions = {
        supportedFileTypes: ['json'],
        maxFileSize: 10,
    };
    const handleChange = jest.fn();

    const invalidFile = new File(['{"test":"test"}'], 'test.json', {
        type: 'application/json',
    });

    Object.defineProperty(invalidFile, 'size', { value: 1024 * 10 + 1 });

    render(
        <FileInputComponent
            field={field}
            disabled={disabled}
            controlOptions={controlOptions}
            handleChange={handleChange}
        />
    );

    const fileInput = screen.getByTestId('file-input');
    await userEvent.upload(fileInput, invalidFile);

    // Check that file is present
    expect(await screen.findByTestId('label')).toHaveTextContent('test.json');
    // Check if proper error msg is displaya
    expect(await screen.findByTestId('help')).toHaveTextContent(
        'The file size should not exceed 10 KB'
    );
    // Check that handleChange is called with ##INVALID_FILE##
    expect(handleChange).toHaveBeenCalledWith('testFileField', '##INVALID_FILE##');
});
