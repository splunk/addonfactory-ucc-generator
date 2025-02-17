import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from '@storybook/test';

import BaseFormView from '../BaseFormView';
import {
    PAGE_CONFIG_BOTH_OAUTH,
    getConfigOauthBasic,
    getConfigOauthOauth,
} from './globalConfigs/configPageOauth';
import { setUnifiedConfig } from '../../../util/util';
import { GlobalConfig } from '../../../types/globalConfig/globalConfig';
import { Mode } from '../../../constants/modes';
import { BaseFormProps } from '../../../types/components/BaseFormTypes';
import { Platforms } from '../../../types/globalConfig/pages';
import {
    getGlobalConfigMockGroupsForConfigPage,
    getGlobalConfigMockGroupsForInputPage,
    getGlobalConfigMockModificationToFieldItself,
    getGlobalConfigMockModificationToGroupsConfig,
} from '../tests/configMocks';
import { invariant } from '../../../util/invariant';

interface BaseFormStoriesProps extends BaseFormProps {
    config: GlobalConfig;
    platform?: Platforms;
}

const meta = {
    title: 'BaseFormView',
    render: (props) => {
        setUnifiedConfig(props.config);
        return (
            <BaseFormView
                serviceName={props.serviceName}
                mode={props.mode}
                page={props.page}
                stanzaName={props.stanzaName}
                handleFormSubmit={props.handleFormSubmit}
                pageContext={{ platform: props.platform }}
            />
        );
    },
} satisfies Meta<BaseFormStoriesProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OuathBasic: Story = {
    args: {
        currentServiceState: {},
        serviceName: 'account',
        mode: 'create' as Mode,
        page: 'configuration',
        stanzaName: 'unknownStanza',
        handleFormSubmit: fn(),
        config: getConfigOauthBasic() as GlobalConfig,
        platform: 'enterprise',
    },
};

export const OauthOauth: Story = {
    args: {
        currentServiceState: {},
        serviceName: 'account',
        mode: 'create' as Mode,
        page: 'configuration',
        stanzaName: 'unknownStanza',
        handleFormSubmit: fn(),
        config: getConfigOauthOauth() as GlobalConfig,
    },
};

export const BothOauth: Story = {
    args: {
        currentServiceState: {},
        serviceName: 'account',
        mode: 'create' as Mode,
        page: 'configuration',
        stanzaName: 'unknownStanza',
        handleFormSubmit: fn(),
        config: PAGE_CONFIG_BOTH_OAUTH as GlobalConfig,
    },
};

export const OuathBasicEnterprise: Story = {
    args: {
        currentServiceState: {},
        serviceName: 'account',
        mode: 'create' as Mode,
        page: 'configuration',
        stanzaName: 'unknownStanza',
        handleFormSubmit: fn(),
        config: getConfigOauthBasic() as GlobalConfig,
        platform: 'enterprise',
    },
};
export const OuathBasicCloud: Story = {
    args: {
        currentServiceState: {},
        serviceName: 'account',
        mode: 'create' as Mode,
        page: 'configuration',
        stanzaName: 'unknownStanza',
        handleFormSubmit: fn(),
        config: getConfigOauthBasic() as GlobalConfig,
        platform: 'cloud',
    },
};

export const ConfigPageGroups: Story = {
    args: {
        currentServiceState: {},
        serviceName: 'account',
        mode: 'create' as Mode,
        page: 'configuration',
        stanzaName: 'unknownStanza',
        handleFormSubmit: fn(),
        config: getGlobalConfigMockGroupsForConfigPage(),
        platform: 'cloud',
    },
};

export const InputPageGroups: Story = {
    args: {
        currentServiceState: {},
        serviceName: 'demo_input',
        mode: 'create' as Mode,
        page: 'inputs',
        stanzaName: 'unknownStanza',
        handleFormSubmit: fn(),
        config: getGlobalConfigMockGroupsForInputPage(),
        platform: 'cloud',
    },
};

export const GroupModificationsConfig: Story = {
    args: {
        currentServiceState: {},
        serviceName: 'account',
        mode: 'create' as Mode,
        page: 'configuration',
        stanzaName: 'unknownStanza',
        handleFormSubmit: fn(),
        config: getGlobalConfigMockModificationToGroupsConfig(),
        platform: 'cloud',
    },
};

export const FieldModifyItself: Story = {
    args: {
        currentServiceState: {},
        serviceName: 'account',
        mode: 'create' as Mode,
        page: 'configuration',
        stanzaName: 'unknownStanza',
        handleFormSubmit: fn(),
        config: getGlobalConfigMockModificationToFieldItself(),
    },
};

export const FieldModifyItselfAfterMods: Story = {
    args: FieldModifyItself.args,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const modifyInputText = canvas
            .getAllByRole('textbox')
            .find((el) => el.getAttribute('value') === 'default value');

        invariant(modifyInputText, 'modification input field should be defined');

        await userEvent.clear(modifyInputText);
        await userEvent.type(modifyInputText, 'modify itself');
    },
};
