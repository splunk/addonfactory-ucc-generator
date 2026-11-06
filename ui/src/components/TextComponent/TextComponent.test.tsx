import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import TextComponent from './TextComponent';

const handleChange = vi.fn();

const renderTextComponent = () => {
    render(<TextComponent value="test" handleChange={handleChange} field="fieldId" />);
};

it('should render text component correctly with value', async () => {
    renderTextComponent();

    const textElement = screen.getByTestId('text');
    expect(textElement).toBeInTheDocument();

    const textBox = screen.getByTestId('textbox');
    expect(textBox).toBeInTheDocument();

    expect(textBox).toHaveValue('test');
});

it('should trigger callback correctly after typing', async () => {
    renderTextComponent();

    const textBox = screen.getByTestId('textbox');

    await userEvent.type(textBox, 'f');
    expect(handleChange).toHaveBeenCalledWith('fieldId', 'testf');

    await userEvent.type(textBox, 'o');
    expect(handleChange).toHaveBeenCalledWith('fieldId', 'testo');
});

it('should use callback with empty string after clear', async () => {
    renderTextComponent();

    const textBox = screen.getByTestId('textbox');

    await userEvent.clear(textBox);
    expect(handleChange).toHaveBeenCalledWith('fieldId', '');
});

describe('password reveal', () => {
    const PLACEHOLDER = '******';

    const renderRevealComponent = (
        props: Partial<React.ComponentProps<typeof TextComponent>> = {}
    ) =>
        render(
            <TextComponent
                value={PLACEHOLDER}
                handleChange={handleChange}
                field="api_key"
                encrypted
                mode="edit"
                controlOptions={{ enablePasswordReveal: true }}
                {...props}
            />
        );

    it('should not render the toggle without enablePasswordReveal', () => {
        render(
            <TextComponent
                value={PLACEHOLDER}
                handleChange={handleChange}
                field="api_key"
                encrypted
                mode="edit"
            />
        );
        expect(screen.queryByTestId('api_key-reveal-toggle')).not.toBeInTheDocument();
    });

    it('should not render the toggle for non-encrypted fields', () => {
        renderRevealComponent({ encrypted: false });
        expect(screen.queryByTestId('api_key-reveal-toggle')).not.toBeInTheDocument();
    });

    it('should toggle visibility of a typed value without fetching', async () => {
        const fetchStoredClearValue = vi.fn();
        renderRevealComponent({
            value: 'typed-secret',
            mode: 'create',
            fetchStoredClearValue,
        });

        const textBox = screen.getByTestId('textbox');
        expect(textBox).toHaveAttribute('type', 'password');

        await userEvent.click(screen.getByTestId('api_key-reveal-toggle'));
        expect(textBox).toHaveAttribute('type', 'text');
        expect(textBox).toHaveValue('typed-secret');
        expect(fetchStoredClearValue).not.toHaveBeenCalled();

        await userEvent.click(screen.getByTestId('api_key-reveal-toggle'));
        expect(textBox).toHaveAttribute('type', 'password');
    });

    it('should fetch and show the stored value in edit mode', async () => {
        const fetchStoredClearValue = vi.fn().mockResolvedValue('stored-secret');
        renderRevealComponent({ fetchStoredClearValue });

        const textBox = screen.getByTestId('textbox');
        expect(textBox).toHaveValue(PLACEHOLDER);
        expect(textBox).toHaveAttribute('type', 'password');

        await userEvent.click(screen.getByTestId('api_key-reveal-toggle'));

        expect(fetchStoredClearValue).toHaveBeenCalledWith('api_key');
        expect(await screen.findByDisplayValue('stored-secret')).toBeInTheDocument();
        expect(textBox).toHaveAttribute('type', 'text');
        // revealing must not mark the field as changed
        expect(handleChange).not.toHaveBeenCalled();

        await userEvent.click(screen.getByTestId('api_key-reveal-toggle'));
        expect(textBox).toHaveAttribute('type', 'password');
        expect(textBox).toHaveValue(PLACEHOLDER);
    });

    it('should show an error when the fetch is rejected', async () => {
        const fetchStoredClearValue = vi
            .fn()
            .mockRejectedValue(new Error('You do not have permission to view this value.'));
        renderRevealComponent({ fetchStoredClearValue });

        await userEvent.click(screen.getByTestId('api_key-reveal-toggle'));

        expect(await screen.findByTestId('api_key-reveal-error')).toBeInTheDocument();
        const textBox = screen.getByTestId('textbox');
        expect(textBox).toHaveAttribute('type', 'password');
        expect(textBox).toHaveValue(PLACEHOLDER);
    });

    it('should show a hint when there is no stored value', async () => {
        const fetchStoredClearValue = vi.fn().mockResolvedValue(null);
        renderRevealComponent({ fetchStoredClearValue });

        await userEvent.click(screen.getByTestId('api_key-reveal-toggle'));

        expect(await screen.findByTestId('api_key-reveal-error')).toHaveTextContent(
            'There is no stored value to show.'
        );
        expect(screen.getByTestId('textbox')).toHaveAttribute('type', 'password');
    });
});
