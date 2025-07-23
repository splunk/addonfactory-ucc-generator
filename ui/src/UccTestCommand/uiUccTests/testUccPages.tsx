import React, { Suspense } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { GlobalConfig } from '../../types/globalConfig/globalConfig';
import { setUnifiedConfig } from '../../util/util';
import { WaitSpinnerWrapper } from '../../components/table/CustomTableStyle';
import { CustomElementsMap } from '../../types/CustomTypes';
import { CustomComponentContextProvider } from '../../context/CustomComponentContext';

const InputPage = React.lazy(() => import('../../pages/Input/InputPage'));
const ConfigurationPage = React.lazy(() => import('../../pages/Configuration/ConfigurationPage'));

export const renderConfigurationPage = (
    globalConfig: GlobalConfig,
    components?: CustomElementsMap
) => {
    setUnifiedConfig(globalConfig);

    return render(
        <Suspense fallback={<WaitSpinnerWrapper size="medium" />}>
            <CustomComponentContextProvider customComponents={components}>
                <ConfigurationPage />
            </CustomComponentContextProvider>
        </Suspense>,
        { wrapper: BrowserRouter }
    );
};

export const renderInputsPage = (globalConfig: GlobalConfig, components?: CustomElementsMap) => {
    setUnifiedConfig(globalConfig);

    return render(
        <Suspense fallback={<WaitSpinnerWrapper size="medium" />}>
            <CustomComponentContextProvider customComponents={components}>
                <InputPage />
            </CustomComponentContextProvider>
        </Suspense>,
        { wrapper: BrowserRouter }
    );
};
