import React, { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { setUnifiedConfig } from '../../../util/util';
import { GlobalConfig } from '../../../types/globalConfig/globalConfig';
import TableWrapper, { ITableWrapperProps } from '../TableWrapper';
import {
    getManyServicesConfig,
    getSimpleConfig,
    getSimpleConfigStylePage,
    getSimpleConfigWithMapping,
} from './configMockups';
import { TableContextProvider } from '../../../context/TableContext';
import { ServerHandlers } from './rowDataMockup';

interface ITableWrapperStoriesProps extends ITableWrapperProps {
    config: GlobalConfig;
}

const meta = {
    title: 'TableWrapper',
    render: (props) => {
        setUnifiedConfig(props.config);
        return (
            <TableContextProvider>
                {(<TableWrapper {...props} />) as unknown as ReactNode}
            </TableContextProvider>
        );
    },
} satisfies Meta<ITableWrapperStoriesProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OuathBasic: Story = {
    args: {
        page: 'configuration',
        serviceName: 'account',
        handleRequestModalOpen: fn(),
        handleOpenPageStyleDialog: fn(),
        displayActionBtnAllRows: false,
        config: getSimpleConfig() as GlobalConfig,
    },
    parameters: {
        msw: {
            handlers: ServerHandlers,
        },
    },
};

export const SimpleTableStylePage: Story = {
    args: {
        page: 'inputs',
        serviceName: 'example_input_one',
        handleRequestModalOpen: fn(),
        handleOpenPageStyleDialog: fn(),
        displayActionBtnAllRows: false,
        config: getSimpleConfigStylePage() as GlobalConfig,
    },
    parameters: {
        msw: {
            handlers: ServerHandlers,
        },
    },
};

export const SimpleConfigWithStatusMapped: Story = {
    args: {
        page: 'configuration',
        serviceName: 'account',
        handleRequestModalOpen: fn(),
        handleOpenPageStyleDialog: fn(),
        displayActionBtnAllRows: false,
        config: getSimpleConfigWithMapping() as GlobalConfig,
    },
    parameters: {
        msw: {
            handlers: ServerHandlers,
        },
    },
};

export const SimpleTableManyServices: Story = {
    args: {
        page: 'inputs',
        handleRequestModalOpen: fn(),
        handleOpenPageStyleDialog: fn(),
        displayActionBtnAllRows: false,
        config: getManyServicesConfig() as GlobalConfig,
    },
    parameters: {
        msw: {
            handlers: ServerHandlers,
        },
    },
};
