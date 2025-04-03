import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { getBuildDirPath } from '../../../util/script';
import { setUnifiedConfig } from '../../../util/util';
import CustomMenu from '../CustomMenu';
import mockCustomMenu from './mocks/CustomMenuMock';
import { getGlobalConfigMockCustomMenu, GroupsMenuType } from './mocks/globalConfigMock';
import userEvent from '@testing-library/user-event';

const MODULE = 'customMenuFileName';

const handleChange = jest.fn();

const waitForCustomElementLoad = async () => {
    await waitFor(async () => {
        const loading = screen.queryByText('Loading...');
        if (loading) {
            await waitFor(() => expect(loading).not.toHaveTextContent('Loading...'));
        }
    });
};

const setup = (groupsMenu?: GroupsMenuType) => {
    const mockConfig = getGlobalConfigMockCustomMenu(MODULE, groupsMenu);
    setUnifiedConfig(mockConfig);

    jest.mock(`${getBuildDirPath()}/custom/${MODULE}.js`, () => mockCustomMenu, {
        virtual: true,
    });

    render(<CustomMenu fileName={MODULE} type={'external'} handleChange={handleChange} />);
};

it('should render loading text correctly (constantly)', () => {
    setup();
    const loading = screen.getByText('Loading...');
    expect(loading).toBeInTheDocument();
});

it('should render component Correctly', async () => {
    setup();
    await waitForCustomElementLoad();
    const customMenuText = screen.getByText('Click Me! I am a button for custom menu');
    expect(customMenuText).toBeInTheDocument();
});

it('should call handler correctly', async () => {
    setup();
    await waitForCustomElementLoad();
    const customMenuText = screen.getByText('Click Me! I am a button for custom menu');

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
    setup(groupsMenu);
    await waitForCustomElementLoad();
    const customMenuText = screen.queryByText('Click Me! I am a button for custom menu');
    expect(customMenuText).not.toBeInTheDocument();
});
