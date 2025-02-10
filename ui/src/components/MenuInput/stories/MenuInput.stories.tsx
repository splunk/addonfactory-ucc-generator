import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { fn, userEvent, waitForElementToBeRemoved, within } from '@storybook/test';
import MenuInput from '../MenuInput';
import { setUnifiedConfig } from '../../../util/util';
import { GlobalConfig, GlobalConfigSchema } from '../../../types/globalConfig/globalConfig';
import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { invariant } from '../../../util/invariant';
import {
    InputsPageTableSchema,
    TableLessServiceSchema,
    TableSchema,
} from '../../../types/globalConfig/pages';
import { PageContextProvider } from '../../../context/PageContext';

interface MenuInputProps {
    handleRequestOpen: (args: { serviceName: string; input?: string; groupName?: string }) => void;
    config: GlobalConfig;
}

/*
 * using wrapper to enable unified config passed in args/props
 */
function MenuInputWrapper(props: MenuInputProps) {
    const [display, setDisplay] = useState(false);

    useEffect(() => {
        // TODO: introduce a stateless stories component to reflect thaat component logic itself
        setUnifiedConfig(props.config);
        setDisplay(true);
    }, [props.config]);

    return display ? (
        <PageContextProvider platform="enterprise">
            <MenuInput handleRequestOpen={props.handleRequestOpen} />
        </PageContextProvider>
    ) : (
        <span>loading</span>
    );
}

function setup(canvasElement: HTMLElement) {
    const canvas = within(canvasElement);
    // menu is rendered in body which is out of canvas
    const bodyElement = canvasElement.parentElement;
    invariant(bodyElement);
    const body = within(bodyElement);
    const user = userEvent.setup();
    return { canvas, body, user };
}

const meta = {
    component: MenuInputWrapper,
    title: 'MenuInput',
} satisfies Meta<typeof MenuInputWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

const table = {
    actions: [],
    header: [
        {
            field: '',
            label: '',
        },
    ],
    customRow: {},
} satisfies z.infer<typeof TableSchema>;

const commonServices = [
    {
        name: 'test-service-name1',
        title: 'test-service-title1',
        entity: [],
    },
    {
        name: 'test-subservice1-name1',
        title: 'test-subservice1-title1',
        entity: [],
    },
    {
        name: 'test-subservice1-name2',
        title: 'test-subservice1-title2',
        entity: [],
    },
    {
        name: 'test-service-name2',
        title: 'test-service-title2',
        entity: [],
    },
] satisfies z.infer<typeof TableLessServiceSchema>[];

const commonGroups = [
    {
        groupName: 'test-group-name1',
        groupTitle: 'test-group-title1',
        groupServices: ['test-subservice1-name1', 'test-subservice1-name2'],
    },
    {
        groupName: 'test-group-name2',
        groupTitle: 'test-group-title2',
        groupServices: ['test-service-name2', 'test-service-name1'],
    },
] satisfies z.infer<typeof InputsPageTableSchema>['groupsMenu'];

const globalConfigMock = getGlobalConfigMock();
const { inputs } = globalConfigMock.pages;
invariant(inputs);
const { services } = inputs;
invariant(services);

export const Base: Story = {
    args: {
        handleRequestOpen: fn(),
        config: {
            ...globalConfigMock,
            pages: {
                ...globalConfigMock.pages,
                inputs: {
                    title: inputs.title,
                    services: commonServices,
                    table,
                },
            },
        },
    },
};

export const WithSubMenu: Story = {
    args: {
        handleRequestOpen: fn(),
        config: {
            ...globalConfigMock,
            pages: {
                ...globalConfigMock.pages,
                inputs: {
                    services: [
                        {
                            name: 'test-service-name1',
                            title: 'test-service-title1',
                            subTitle: 'test-service-subTitle1',
                            entity: [],
                        },
                        {
                            name: 'test-subservice1-name1',
                            title: 'test-subservice1-title1',
                            subTitle: 'test-subservice-subTitle1',
                            entity: [],
                        },
                        {
                            name: 'test-subservice1-name2',
                            title: 'test-subservice1-title2',
                            subTitle: 'test-subservice-subTitle2',
                            entity: [],
                        },
                        {
                            name: 'test-service-name2',
                            title: 'test-service-title2',
                            subTitle: 'test-service-subTitle2',
                            entity: [],
                        },
                    ],
                    groupsMenu: commonGroups,
                    title: '',
                    table,
                },
            },
        } satisfies z.input<typeof GlobalConfigSchema>,
    },
};

const servicesWithHideForPlatform = [
    {
        name: 'test-service-name1',
        title: 'test-service-title1',
        subTitle: 'test-service-subTitle1',
        entity: [],
    },
    {
        name: 'test-subservice1-name1',
        title: 'test-subservice1-title1',
        subTitle: 'test-subservice-subTitle1',
        entity: [],
    },
    {
        name: 'test-subservice1-name2',
        title: 'test-subservice1-title2',
        subTitle: 'test-subservice-subTitle2',
        entity: [],
    },
    {
        name: 'test-service-name2',
        title: 'test-service-title2',
        subTitle: 'test-service-subTitle2',
        entity: [],
    },
    {
        name: 'test-service-hide-cloud-name1',
        title: 'test-service-hide-cloud-title1',
        subTitle: 'test-service-hide-cloud-subTitle1',
        entity: [],
        hideForPlatform: 'cloud',
    },
    {
        name: 'test-service-hide-cloud-name2',
        title: 'test-service-hide-cloud-title2',
        subTitle: 'test-service-hide-cloud-subTitle2',
        entity: [],
        hideForPlatform: 'cloud',
    },
    {
        name: 'test-service-hide-enterprise-name1',
        title: 'test-service-hide-enterprise-title1',
        subTitle: 'test-service-hide-enterprise-subTitle1',
        entity: [],
        hideForPlatform: 'enterprise',
    },
    {
        name: 'test-service-hide-enterprise-name2',
        title: 'test-service-hide-enterprise-title2',
        subTitle: 'test-service-hide-enterprise-subTitle2',
        entity: [],
        hideForPlatform: 'enterprise',
    },
] satisfies z.infer<typeof TableLessServiceSchema>[];

const groupMenuHideForPlatform = [
    {
        groupName: 'test-service-hide-cloud-name1',
        groupTitle: 'test-service-hide-cloud-title1',
    },
    {
        groupName: 'test-service-hide-enterprise-name1',
        groupTitle: 'test-service-hide-enterprise-title1',
    },
    {
        groupName: 'test-group-name1',
        groupTitle: 'test-group-title1',
        groupServices: ['test-subservice1-name1', 'test-subservice1-name2'],
    },
    {
        groupName: 'test-group-name2',
        groupTitle: 'test-group-title2',
        groupServices: ['test-service-name2', 'test-service-name1'],
    },
    {
        groupName: 'test-group-hide-for-platform',
        groupTitle: 'test-group hide for platform',
        groupServices: ['test-service-hide-enterprise-name2', 'test-service-hide-cloud-name2'],
    },
] satisfies z.infer<typeof InputsPageTableSchema>['groupsMenu'];

export const WithOpenedMenu: Story = {
    args: {
        handleRequestOpen: fn(),
        config: {
            ...globalConfigMock,
            pages: {
                ...globalConfigMock.pages,
                inputs: {
                    title: 'WithOpenedSubMenu',
                    services: servicesWithHideForPlatform,
                    groupsMenu: groupMenuHideForPlatform,
                    table,
                },
            },
        },
    },
    play: async ({ canvasElement }) => {
        const { canvas, body, user } = setup(canvasElement);

        const menuDropdown = await canvas.findByRole('button', { name: 'Create New Input' });

        invariant(menuDropdown, 'Menu Dropdown must exist');

        await user.click(menuDropdown);

        await body.findByRole('menuitem', {
            name: 'test-group-title1',
        });
    },
};

export const WithOpenedSubMenu: Story = {
    args: {
        handleRequestOpen: fn(),
        config: {
            ...globalConfigMock,
            pages: {
                ...globalConfigMock.pages,
                inputs: {
                    title: 'WithOpenedSubMenu',
                    services: servicesWithHideForPlatform,
                    groupsMenu: groupMenuHideForPlatform,
                    table,
                },
            },
        },
    },
    play: async ({ canvasElement }) => {
        const { canvas, body, user } = setup(canvasElement);

        const menuDropdown = await canvas.findByRole('button', { name: 'Create New Input' });

        invariant(menuDropdown, 'Menu Dropdown must exist');
        await user.click(menuDropdown);

        const groupMenuItem = body.getByRole('menuitem', {
            name: 'test-group hide for platform',
        });

        await user.click(groupMenuItem);

        await waitForElementToBeRemoved(() =>
            body.queryByRole('menuitem', {
                name: 'test-group hide for platform',
            })
        );
    },
};
