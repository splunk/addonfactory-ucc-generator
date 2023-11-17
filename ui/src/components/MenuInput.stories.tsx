import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import MenuInput from './MenuInput';
import { setUnifiedConfig } from '../util/util';
import { GlobalConfig } from '../types/globalConfig/globalConfig';
import { getGlobalConfigMock } from '../mocks/globalConfigMock';
import { invariant } from '../util/invariant';
import { TableFullServiceSchema, TableSchema } from '../types/globalConfig/pages';

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

const table: z.infer<typeof TableSchema> = {
    header: [
        {
            field: 'name',
            label: 'Input Name',
        },
    ],
    moreInfo: [
        {
            field: 'name',
            label: 'Name',
        },
    ],
    actions: ['edit', 'delete', 'clone'],
};
const commonServices: z.infer<typeof TableFullServiceSchema>[] = [
    {
        name: 'test-service-name1',
        title: 'test-service-title1',
        entity: [],
        table,
    },
    {
        name: 'test-subservice1-name1',
        title: 'test-subservice1-title1',
        entity: [],
        table,
    },
    {
        name: 'test-subservice1-name2',
        title: 'test-subservice1-title2',
        entity: [],
        table,
    },
    {
        name: 'test-service-name2',
        title: 'test-service-title2',
        entity: [],
        table,
    },
];

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
];
const globalConfigMock = getGlobalConfigMock();
const { inputs } = globalConfigMock.pages;
invariant(inputs);
const { services } = inputs;
invariant(services);

export const Base: Story = {
    args: {
        config: {
            ...globalConfigMock,
            pages: {
                ...globalConfigMock.pages,
                inputs: {
                    title: inputs.title,
                    services: commonServices,
                },
            },
        },
    },
};

export const WithSubMenu: Story = {
    args: {
        config: {
            ...globalConfigMock,
            pages: {
                ...globalConfigMock.pages,
                inputs: {
                    ...inputs,
                    services: commonServices,
                    groupsMenu: commonGroups,
                },
            },
        },
    },
};

export const WithSubMenuAndCustomMenu: Story = {
    args: {
        config: {
            ...globalConfigMock,
            pages: {
                ...globalConfigMock.pages,
                inputs: {
                    ...inputs,
                    services: commonServices,
                    menu: {
                        src: 'CustomMenu',
                        type: 'external',
                    },
                    groupsMenu: commonGroups,
                },
            },
        },
    },
};
