import type { Meta, StoryObj } from '@storybook/react';
import BaseFormView from '../BaseFormView';
import CheckboxGroup from './CheckboxGroup';

const meta = {
    component: CheckboxGroup,
    title: 'Components/CheckboxGroup',
} satisfies Meta<typeof BaseFormView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        field: 'api',
        value: 'collect_collaboration/1200,collect_file/1,collect_task/1',
        controlOptions: {
            rows: [
                {
                    field: 'collect_collaboration',
                    checkbox: {
                        label: 'Collect folder collaboration',
                        options: {
                            enable: true,
                        },
                    },
                    text: {
                        defaultValue: 1200,
                        required: false,
                    },
                },
                {
                    field: 'collect_file',
                    checkbox: {
                        label: 'Collect file metadata',
                        options: {
                            enable: true,
                        },
                    },
                    text: {
                        defaultValue: 1,
                        required: true,
                    },
                },
                {
                    field: 'collect_task',
                    checkbox: {
                        label: 'Collect tasks and comments',
                        options: {
                            enable: true,
                        },
                    },
                    text: {
                        defaultValue: 1,
                        required: true,
                    },
                },
                {
                    field: 'disabledField',
                    checkbox: {
                        label: 'Disabled',
                        options: {
                            enable: false,
                        },
                    },
                    text: {
                        defaultValue: 3600,
                        required: true,
                    },
                },
            ],
        },
    },
};
export const WithSingleGroup: Story = {
    args: {
        ...Base.args,
        value: undefined,
        controlOptions: {
            groups: [
                {
                    label: 'Group 1',
                    fields: ['collect_collaboration', 'collect_file'],
                    options: { isExpandable: false },
                },
            ],
            rows: [
                {
                    field: 'collect_collaboration',
                    checkbox: {
                        label: 'Collect folder collaboration',
                        options: {
                            enable: true,
                        },
                    },
                    text: {
                        defaultValue: 1200,
                        required: false,
                    },
                },
                {
                    field: 'collect_file',
                    checkbox: {
                        label: 'Collect file metadata',
                        options: {
                            enable: true,
                        },
                    },
                    text: {
                        defaultValue: 1,
                        required: true,
                    },
                },
            ],
        },
    },
};
export const MixedWithGroups: Story = {
    args: {
        ...Base.args,
        value: undefined,
        controlOptions: {
            groups: [
                {
                    label: 'Expandable group',
                    fields: ['collect_collaboration', 'collect_file'],
                    options: { isExpandable: true, expand: true },
                },

                {
                    label: 'Non expandable group',
                    fields: ['collect_folder_metadata'],
                    options: { isExpandable: false },
                },
            ],
            rows: [
                {
                    field: 'collect_collaboration',
                    checkbox: {
                        label: 'Collect folder collaboration',
                        options: {
                            enable: true,
                        },
                    },
                    text: {
                        defaultValue: 1200,
                        required: false,
                    },
                },
                {
                    field: 'collect_file',
                    checkbox: {
                        label: 'Collect file metadata',
                        options: {
                            enable: true,
                        },
                    },
                    text: {
                        defaultValue: 1,
                        required: true,
                    },
                },
                {
                    field: 'collect_task',
                    checkbox: {
                        label: 'Collect tasks and comments',
                        options: {
                            enable: true,
                        },
                    },
                    text: {
                        defaultValue: 1,
                        required: true,
                    },
                },
                {
                    field: 'collect_folder_metadata',
                    checkbox: {
                        label: 'Collect folder metadata',
                        options: {
                            enable: true,
                        },
                    },
                    text: {
                        defaultValue: 3600,
                        required: true,
                    },
                },
            ],
        },
    },
};
