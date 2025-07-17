import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { GlobalConfig } from '../../types/globalConfig/globalConfig';
import { setUnifiedConfig } from '../../util/util';
import ConfigurationPage from '../../pages/Configuration/ConfigurationPage';

export const renderConfigurationPage = (globalConfig: GlobalConfig) => {
    console.log('Rendering Configuration Page for UCC Tests', globalConfig);

    setUnifiedConfig(globalConfig);

    return render(<ConfigurationPage />, { wrapper: BrowserRouter });
};
