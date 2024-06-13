import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { setUnifiedConfig } from '../../../util/util';
import { GlobalConfig } from '../../../types/globalConfig/globalConfig';
import TableWrapper, { ITableWrapperProps } from '../TableWrapper';
import { getSimpleConfig } from './configMockups';
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
                {(<TableWrapper {...props} />) as unknown as Node}
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
