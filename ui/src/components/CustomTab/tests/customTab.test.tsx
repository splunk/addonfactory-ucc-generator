import { expect, it, vi } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { setUnifiedConfig } from '../../../util/util';
import ConfigurationPage from '../../../pages/Configuration/ConfigurationPage';
import { getGlobalConfigMockCustomHook } from './configMocks';
import { getBuildDirPath } from '../../../util/script';
import mockCustomTabFile from './mockCustomTabFile';
import {
    CustomComponentContextProvider,
    CustomComponentContextType,
} from '../../../context/CustomComponentContext';

const CUSTOM_TAB_FILE_NAME = 'customTabFileName';
const TITLE = 'Custom Tab Title';

const mockConfig = () => {
    const globalConfigMock = getGlobalConfigMockCustomHook(CUSTOM_TAB_FILE_NAME, TITLE);

    const newGlobalConfig = {
        ...globalConfigMock,
    };

    setUnifiedConfig(newGlobalConfig);
};

function setupViaFileMock() {
    vi.doMock(`${getBuildDirPath()}/custom/${CUSTOM_TAB_FILE_NAME}.js`, () => ({
        default: mockCustomTabFile,
    }));

    mockConfig();
    return render(<ConfigurationPage />, { wrapper: BrowserRouter });
}

function setupViaContextMock() {
    mockConfig();

    const compContext: CustomComponentContextType = {
        [CUSTOM_TAB_FILE_NAME]: {
            component: mockCustomTabFile,
            type: 'tab',
        },
    };

    return render(
        <CustomComponentContextProvider customComponents={compContext}>
            <ConfigurationPage />
        </CustomComponentContextProvider>,
        { wrapper: BrowserRouter }
    );
}

describe('should render custom tab correctly', () => {
    it.each([setupViaFileMock, setupViaContextMock])(
        'should render custom tab correctly',
        async (setupFnc) => {
            setupFnc();
            await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

            const customTabText = await screen.findByText(
                `${TITLE} - This is a custom tab rendered from the TA`
            );

            expect(customTabText).toBeInTheDocument();
        }
    );
});
