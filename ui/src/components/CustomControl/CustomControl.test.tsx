import { render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import React from 'react';
import userEvent from '@testing-library/user-event';
import CustomControl from './CustomControl';
import mockCustomControlMockForTest from './mockCustomControlMockForTest';
import { getBuildDirPath } from '../../util/script';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../util/util';
import {
    CustomComponentContextType,
    CustomComponentContextProvider,
} from '../../context/CustomComponentContext';

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

    // doMock is not hoisted to the top of the file
    vi.doMock(`${getBuildDirPath()}/custom/${MODULE}.js`, () => ({
        default: mockCustomControlMockForTest,
    }));
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

    await waitFor(async () => {
        const loading = screen.queryByText('Loading...');
        if (loading) {
            await waitFor(() => expect(loading).not.toHaveTextContent('Loading...'));
        }
    });
};

const setupComponentContext = async () => {
    const mockConfig = getGlobalConfigMock();
    setUnifiedConfig(mockConfig);

    const compContext: CustomComponentContextType = {
        [MODULE]: {
            component: mockCustomControlMockForTest,
            type: 'control',
        },
    };

    render(
        <CustomComponentContextProvider customComponents={compContext}>
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
        </CustomComponentContextProvider>
    );

    await waitFor(async () => {
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

it('should render custom component correctly - context component', async () => {
    await setupComponentContext();
    const renderedModal = await screen.findByTestId('customSelect');
    expect(renderedModal).toBeInTheDocument();
});

it('should try to add validator', async () => {
    await setup();
    expect(addingCustomValidation).toHaveBeenCalled();
});

it('should correctly call handler on change', async () => {
    await setup();
    const selectElem = screen.getByTestId('customSelect');
    expect(selectElem).toBeInTheDocument();
    const SELECTED_OPTION = 'input_one';
    await userEvent.selectOptions(selectElem!, SELECTED_OPTION);

    expect(handleChange).toHaveBeenCalledWith(FIELD_NAME, SELECTED_OPTION);
});
