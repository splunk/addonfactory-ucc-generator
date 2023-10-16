import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MenuInput from './MenuInput';
import { setUnifiedConfig } from '../util/util';
import { UnifiedConfig } from '../types/config';

interface MenuInputProps {
    handleRequestOpen: (args: { serviceName: string; input?: string; groupName?: string }) => void;
    config: UnifiedConfig;
}

function MenuInputWrapper(props: MenuInputProps) {
    const [display, setDisplay] = useState(false);

    useEffect(() => {
        setUnifiedConfig(props.config);
        setDisplay(true);
    }, [props.config]);

    return display ? (
        <MenuInput handleRequestOpen={props.handleRequestOpen} />
    ) : (
        <span>loading</span>
    );
}

const meta = {
    component: MenuInputWrapper,
    title: 'Components/MenuInput',
} satisfies Meta<typeof MenuInputWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        handleRequestOpen: (args) => {
            // eslint-disable-next-line
            console.log({ args });
        },
        config: {
            pages: {
                inputs: {
                    services: [
                        {
                            name: 'test-service-name1',
                            title: 'test-service-title1',
                            subTitle: 'test-service-subTitle1',
                            // hasSubmenu: true,
                        },
                        {
                            name: 'test-subservice1-name1',
                            title: 'test-subservice1-title1',
                            subTitle: 'test-subservice-subTitle1',
                        },
                        {
                            name: 'test-subservice1-name2',
                            title: 'test-subservice1-title2',
                            subTitle: 'test-subservice-subTitle2',
                        },
                        {
                            name: 'test-service-name2',
                            title: 'test-service-title2',
                            subTitle: 'test-service-subTitle2',
                        },
                    ],
                },
            },
            meta: {},
        },
    },
};

export const WithSubMenu: Story = {
    args: {
        handleRequestOpen: (args) => {
            // eslint-disable-next-line
            console.log({ args });
        },
        config: {
            pages: {
                inputs: {
                    services: [
                        {
                            name: 'test-service-name1',
                            title: 'test-service-title1',
                            subTitle: 'test-service-subTitle1',
                            hasSubmenu: true,
                        },
                        {
                            name: 'test-subservice1-name1',
                            title: 'test-subservice1-title1',
                            subTitle: 'test-subservice-subTitle1',
                            hasSubmenu: true,
                        },
                        {
                            name: 'test-subservice1-name2',
                            title: 'test-subservice1-title2',
                            subTitle: 'test-subservice-subTitle2',
                        },
                        {
                            name: 'test-service-name2',
                            title: 'test-service-title2',
                            subTitle: 'test-service-subTitle2',
                        },
                    ],
                    groupsMenu: [
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
                    ],
                },
            },
            meta: {},
        },
    },
};

export const WithSubMenuAndCustomMenu: Story = {
    args: {
        handleRequestOpen: (args) => {
            // eslint-disable-next-line
            console.log({ args });
        },
        config: {
            pages: {
                inputs: {
                    services: [
                        {
                            name: 'test-service-name1',
                            title: 'test-service-title1',
                            subTitle: 'test-service-subTitle1',
                            hasSubmenu: true,
                        },
                        {
                            name: 'test-subservice1-name1',
                            title: 'test-subservice1-title1',
                            subTitle: 'test-subservice-subTitle1',
                            hasSubmenu: true,
                        },
                        {
                            name: 'test-subservice1-name2',
                            title: 'test-subservice1-title2',
                            subTitle: 'test-subservice-subTitle2',
                        },
                        {
                            name: 'test-service-name2',
                            title: 'test-service-title2',
                            subTitle: 'test-service-subTitle2',
                        },
                    ],
                    menu: {
                        src: 'CustomMenu',
                        type: 'external',
                    },
                    groupsMenu: [
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
                    ],
                },
            },
            meta: {},
        },
    },
};
