import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { fn } from '@storybook/test';
import MenuInput from '../MenuInput';
import { setUnifiedConfig } from '../../../util/util';
import { GlobalConfig, GlobalConfigSchema } from '../../../types/globalConfig/globalConfig';
import { getGlobalConfigMock } from '../../../mocks/globalConfigMock';
import { invariant } from '../../../util/invariant';
import {
    InputsPageTableSchema,
    TableFullServiceSchema,
    TableSchema,
} from '../../../types/globalConfig/pages';

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
    title: 'MenuInput',
} satisfies Meta<typeof MenuInputWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

const table = {
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
    actions: [
        {
            action: 'edit',
            title: 'this is edit header',
        },
        {
            action: 'delete',
            title: 'this is delete header',
        },
        {
            action: 'clone',
            title: 'this is clone header',
        },
    ],
} satisfies z.infer<typeof TableSchema>;

const commonServices = [
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
] satisfies z.infer<typeof TableFullServiceSchema>[];

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
                    table: {
                        actions: [],
                        header: [
                            {
                                field: '',
                                label: '',
                            },
                        ],
                        customRow: {},
                    },
                },
            },
        } satisfies z.input<typeof GlobalConfigSchema>,
    },
};
