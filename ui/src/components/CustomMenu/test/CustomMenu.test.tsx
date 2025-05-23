import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';

import { getBuildDirPath } from '../../../util/script';
import { setUnifiedConfig } from '../../../util/util';
import CustomMenu from '../CustomMenu';
import mockCustomMenu from './mocks/CustomMenuMock';
import { getGlobalConfigMockCustomMenu, GroupsMenuType } from './mocks/globalConfigMock';
import { consoleError } from '../../../../test.setup';
import {
    CustomComponentContextProvider,
    CustomComponentContextType,
} from '../../../context/CustomComponentContext';

const MODULE = 'customMenuFileName';

const handleChange = vi.fn();

const waitForLoadingDisappear = async () => {
    return waitFor(async () => {
        const loading = screen.queryByText('Loading...');
        expect(loading).not.toBeInTheDocument();
    });
};

const doCustomMenuMock = () => {
    vi.doMock(`${getBuildDirPath()}/custom/${MODULE}.js`, () => ({
        default: mockCustomMenu,
    }));
};

const doCustomMenuUnMock = () => {
    vi.doUnmock(`${getBuildDirPath()}/custom/${MODULE}.js`);
};

const setup = (groupsMenu?: GroupsMenuType) => {
    const mockConfig = getGlobalConfigMockCustomMenu(MODULE, groupsMenu);
    setUnifiedConfig(mockConfig);

    render(<CustomMenu fileName={MODULE} type="external" handleChange={handleChange} />);
};

const setupContextComponent = (groupsMenu?: GroupsMenuType) => {
    const mockConfig = getGlobalConfigMockCustomMenu(MODULE, groupsMenu);
    setUnifiedConfig(mockConfig);

    const compContext: CustomComponentContextType = {
        [MODULE]: {
            component: mockCustomMenu,
            type: 'menu',
        },
    };

    render(
        <CustomComponentContextProvider customComponents={compContext}>
            <CustomMenu
                fileName={MODULE}
                type="external"
                handleChange={handleChange}
                customComponentContext={compContext}
            />
        </CustomComponentContextProvider>
    );
};

it('should render component and call handler correctly', async () => {
    doCustomMenuMock();
    setup();
    await waitForLoadingDisappear();
    const customMenuText = await waitFor(() => {
        const menuText = screen.getByText('Click Me! I am a button for custom menu');
        expect(menuText).toBeInTheDocument();
        return menuText;
    });
    await userEvent.click(customMenuText);
    expect(handleChange).toHaveBeenCalledWith({
        service: 'example_input_one',
    });
});

it('should render component and call handler correctly - context component', async () => {
    setupContextComponent();
    await waitForLoadingDisappear();
    const customMenuText = await waitFor(() => {
        const menuText = screen.getByText('Click Me! I am a button for custom menu');
        expect(menuText).toBeInTheDocument();
        return menuText;
    });
    await userEvent.click(customMenuText);
    expect(handleChange).toHaveBeenCalledWith({
        service: 'example_input_one',
    });
});

it('Do not render custom if group menu provided + loading disappears', async () => {
    const groupsMenu = [
        {
            groupName: 'group_one',
            groupTitle: 'Group One',
            groupServices: ['example_input_one', 'example_input_two'],
        },
        {
            groupName: 'example_input_three',
            groupTitle: 'Example Input Three',
        },
        {
            groupName: 'group_two',
            groupTitle: 'Group Two',
            groupServices: ['example_input_two', 'example_input_four'],
        },
    ];
    doCustomMenuMock();

    setup(groupsMenu);
    await waitForLoadingDisappear();
    await waitFor(() => {
        const customMenuText = screen.queryByText('Click Me! I am a button for custom menu');
        expect(customMenuText).not.toBeInTheDocument();
    });
});

it('should render loading text correctly (constantly)', async () => {
    const errorHandler = vi.fn();
    consoleError.mockImplementation(errorHandler);
    doCustomMenuUnMock();
    setup();
    const loading = screen.getByText('Loading...');
    expect(loading).toBeInTheDocument();
    await waitFor(() => {
        expect(errorHandler).toHaveBeenCalledWith(
            expect.stringContaining('[Custom Menu] Error loading custom menu ')
        );
    });
});
