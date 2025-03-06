import { expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import CustomControl from './CustomControl';
import mockCustomControlMockForTest from './CustomControlMockForTest';
import { getBuildDirPath } from '../../util/script';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../util/util';

const MODULE = 'CustomControlForTest';

const handleChange = vi.fn();
const addingCustomValidation = vi.fn();
const mockSetState = vi.fn();
const mockSetErrorFieldMsg = vi.fn();
const mockSetErrorMsg = vi.fn();
const mockClearErrorMsg = vi.fn();

const FIELD_NAME = 'testCustomField';

const setup = async () => {
    const mockConfig = getGlobalConfigMock();
    setUnifiedConfig(mockConfig);

    vi.mock(import(`${getBuildDirPath()}/custom/${MODULE}.js`), () => mockCustomControlMockForTest);

    await act(async () => {
        render(
            <CustomControl
                data={{
                    value: 'input_default',
                    mode: 'create',
                    serviceName: 'serviceName',
                }}
                field={FIELD_NAME}
                handleChange={handleChange}
                controlOptions={{
                    src: MODULE,
                    type: 'external',
                }}
                addCustomValidator={addingCustomValidation}
                utilCustomFunctions={{
                    setState: mockSetState,
                    setErrorFieldMsg: mockSetErrorFieldMsg,
                    clearAllErrorMsg: mockClearErrorMsg,
                    setErrorMsg: mockSetErrorMsg,
                }}
            />
        );

        const loading = screen.queryByText('Loading...');
        if (loading) {
            await waitFor(() => expect(loading).not.toHaveTextContent('Loading...'));
        }
    });
};

it('should render custom component correctly', async () => {
    await setup();
    const renderedModal = await screen.findByTestId('customSelect');
    expect(renderedModal).toBeInTheDocument();
});

it('should try to add validator', async () => {
    await setup();
    expect(addingCustomValidation).toHaveBeenCalled();
});

it('should correctly call handler on change', async () => {
    await setup();
    const selectElem = document.querySelector('select');
    expect(selectElem).toBeInTheDocument();
    const SELECTED_OPTION = 'input_one';
    await userEvent.selectOptions(selectElem!, SELECTED_OPTION);

    expect(handleChange).toHaveBeenCalledWith(FIELD_NAME, SELECTED_OPTION);
});
