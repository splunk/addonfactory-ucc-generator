import { render, screen } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import CustomControl from './CustomControl';
import mockCustomControlMockForTest from './CustomControlMockForTest';
import { getBuildDirPath } from '../../util/script';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { setUnifiedConfig } from '../../util/util';

const MODULE = 'CustomControlForTest';

const handleChange = jest.fn();
const addingCustomValidation = jest.fn();
const mockSetState = jest.fn();
const mockSetErrorFieldMsg = jest.fn();
const mockSetErrorMsg = jest.fn();
const mockClearErrorMsg = jest.fn();

const FIELD_NAME = 'testCustomField';

beforeEach(() => {
    const mockConfig = getGlobalConfigMock();
    setUnifiedConfig(mockConfig);

    jest.mock(`${getBuildDirPath()}/custom/${MODULE}.js`, () => mockCustomControlMockForTest, {
        virtual: true,
    });

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
});

it('should render custom component correctly', async () => {
    const renderedModal = await screen.findByTestId('customSelect');
    expect(renderedModal).toBeInTheDocument();
});

it('should try to add validator', async () => {
    expect(addingCustomValidation).toHaveBeenCalled();
});

it('should correctly call handler on change', async () => {
    const selectElem = document.querySelector('select');
    expect(selectElem).toBeInTheDocument();
    const SELECTED_OPTION = 'input_one';
    await userEvent.selectOptions(selectElem!, SELECTED_OPTION);

    expect(handleChange).toHaveBeenCalledWith(FIELD_NAME, SELECTED_OPTION);
});
