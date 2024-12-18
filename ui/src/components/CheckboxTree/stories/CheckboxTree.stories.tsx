import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import CheckboxTree from '../CheckboxTree';
import { MODE_CREATE, MODE_EDIT } from '../../../constants/modes';

const meta = {
    component: CheckboxTree,
    title: 'CheckboxTree/Component',
} satisfies Meta<typeof CheckboxTree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
    args: {
        handleChange: fn(),
        mode: MODE_EDIT,
        field: 'api',
        value: 'collect_collaboration,collect_file,collect_task',
        label: 'checkboxtree',
        controlOptions: {
            rows: [
                {
                    field: 'collect_collaboration',
                    checkbox: {
                        label: 'Collect folder collaboration',
                    },
                },
                {
                    field: 'collect_file',
                    checkbox: {
                        label: 'Collect file metadata',
                    },
                },
                {
                    field: 'collect_task',
                    checkbox: {
                        label: 'Collect tasks and comments',
                    },
                },
            ],
        },
    },
};

export const Multiline: Story = {
    args: {
        handleChange: fn(),
        mode: MODE_EDIT,
        field: 'api',
        value: 'neigh,like',
        label: 'checkboxtree',
        controlOptions: {
            rows: [
                {
                    field: 'like',
                    checkbox: {
                        label: 'I like ponies',
                    },
                },
                {
                    field: 'unicorn',
                    checkbox: {
                        label: 'Enable unicorn mode (Warning: May attract nearby ponies)',
                    },
                },
                {
                    field: 'neigh',
                    checkbox: {
                        label: "I agree to occasionally neigh like a pony when nobody's watching",
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
                    },
                },
                {
                    field: 'collect_file',
                    checkbox: {
                        label: 'Collect file metadata',
                    },
                },
            ],
        },
    },
};

export const MixedWithGroups: Story = {
    args: {
        ...Base.args,
        value: 'collect_collaboration',
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
                    },
                },
                {
                    field: 'collect_file',
                    checkbox: {
                        label: 'Collect file metadata',
                    },
                },
                {
                    field: 'collect_task',
                    checkbox: {
                        label: 'Collect tasks and comments',
                    },
                },
                {
                    field: 'collect_folder_metadata',
                    checkbox: {
                        label: 'Collect folder metadata',
                    },
                },
            ],
        },
    },
};

export const MultilineWithGroups: Story = {
    args: {
        ...Base.args,
        value: 'collect_collaboration',
        controlOptions: {
            groups: [
                {
                    label: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry dummy',
                    fields: ['lorem_ipsum1'],
                    options: { isExpandable: true },
                },
                {
                    label: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                    fields: ['lorem_ipsum', 'lorem_ipsum2'],
                    options: { isExpandable: false },
                },
            ],
            rows: [
                {
                    field: 'lorem_ipsum1',
                    checkbox: {
                        label: 'Lorem ipsum dummy',
                    },
                },
                {
                    field: 'lorem_ipsum2',
                    checkbox: {
                        label: 'Lorem ipsum dummy text',
                    },
                },
                {
                    field: 'lorem_ipsum',
                    checkbox: {
                        label: 'Lorem ipsum',
                    },
                },
                {
                    field: 'collect_folder_metadata',
                    checkbox: {
                        label: 'Collect folder metadata',
                    },
                },
            ],
        },
    },
};

export const CreateMode: Story = {
    args: {
        ...Base.args,
        value: undefined,
        mode: MODE_CREATE,
        controlOptions: {
            rows: [
                {
                    field: 'field1',
                    checkbox: {
                        label: 'checkbox list with default value true',
                        defaultValue: true,
                    },
                },
                {
                    field: 'field2',
                    checkbox: {
                        label: 'checkbox list with default value false',
                        defaultValue: false,
                    },
                },
            ],
        },
    },
};

export const Disabled: Story = {
    args: {
        ...Base.args,
        value: undefined,
        mode: MODE_CREATE,
        disabled: true,
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
                        defaultValue: true,
                    },
                },
                {
                    field: 'collect_file',
                    checkbox: {
                        label: 'Collect file metadata',
                    },
                },
            ],
        },
    },
};
