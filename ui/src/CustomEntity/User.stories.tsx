import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import BaseFormView from '../components/BaseFormView/BaseFormView';
import { setUnifiedConfig } from '../util/util';

import { generateGlobalConfig } from './generateGlobalConfig';
import {
    AnyOfEntity,
    AnyOfEntitySchema,
    SingleSelectEntitySchema,
    TextEntitySchema,
} from '../types/globalConfig/entities';
import {
    migrateIndexTypeEntity,
    IndexEntity,
    IntervalEntity,
    migrateIntervalTypeEntity,
} from './helper';

/**
 * Union of supported entity types that can be visualized using the StoryWrapper.
 */
type EntityType = AnyOfEntity | IndexEntity | IntervalEntity;

/**
 * Args passed into the story.
 */
type StoryArgs = {
    entity: EntityType[];
};

/**
 * StoryWrapper component renders a single BaseFormView instance based on the provided input entity.
 * It performs schema migration, validation, and config injection for accurate preview and behavior.
 */
const StoryWrapper: React.FC<StoryArgs> = ({ entity }) => {
    const [debouncedEntity, setDebouncedEntity] = useState<EntityType[]>(entity);

    /**
     * Debounce to avoid excessive rerenders during arg editing.
     */
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedEntity(entity);
        }, 500);
        return () => clearTimeout(timeout);
    }, [entity]);

    const validatedEntities = debouncedEntity?.map((item, idx) => {
        let result;
        if (item.type === 'index') {
            const migrated = migrateIndexTypeEntity(item as IndexEntity);
            result = SingleSelectEntitySchema.safeParse(migrated);
        } else if (item.type === 'interval') {
            const migrated = migrateIntervalTypeEntity(item as IntervalEntity);
            result = TextEntitySchema.safeParse(migrated);
        } else {
            result = AnyOfEntitySchema.safeParse(item);
        }

        if (!result.success) {
            const formattedErrors = result.error.issues
                .map((issue) => `${idx} → ${issue.path.join('.')} - ${issue.message}`)
                .join('\n');
            throw new Error(`Entity validation failed:\n${formattedErrors}`);
        }

        return result.data;
    });

    const testconfig = generateGlobalConfig();
    if (testconfig.config.pages?.configuration?.tabs?.[0]) {
        testconfig.config.pages.configuration.tabs[0].entity = validatedEntities;
    }

    setUnifiedConfig(testconfig.config);

    // Render the form component with config and platform context
    return (
        <BaseFormView
            serviceName={testconfig.serviceName}
            mode={testconfig.mode}
            page={testconfig.page}
            stanzaName={testconfig.stanzaName}
            handleFormSubmit={testconfig.handleFormSubmit}
            pageContext={{ platform: testconfig?.platform || 'enterprise' }}
            customComponentContext={undefined}
        />
    );
};

const meta: Meta<StoryArgs> = {
    title: 'Custom Entity',
    render: (args) => <StoryWrapper {...args} />,
};

export default meta;

type Story = StoryObj<StoryArgs>;

/**
 * Renders a validated TextEntity schema using `BaseFormView`.
 */
export const TextField: Story = {
    args: {
        entity: [
            {
                type: 'text',
                label: 'Username',
                field: 'username',
                help: 'Enter your username',
                required: true,
            },
        ],
    },
};

/**
 * Example with multiple fields at once
 */
export const MultiEntityField: Story = {
    args: {
        entity: [
            {
                type: 'text',
                label: 'Name',
                validators: [
                    {
                        type: 'regex',
                        errorMsg:
                            'Input Name must begin with a letter and consist exclusively of alphanumeric characters and underscores.',
                        pattern: '^[a-zA-Z]\\w*$',
                    },
                    {
                        type: 'string',
                        errorMsg: 'Length of input name should be between 1 and 100',
                        minLength: 1,
                        maxLength: 100,
                    },
                ],
                field: 'name',
                help: 'A unique name for the data input.',
                required: true,
            },
            {
                type: 'checkbox',
                label: 'Example Checkbox',
                field: 'input_one_checkbox',
                help: 'This is an example checkbox for the input one entity',
                defaultValue: true,
            },
            {
                type: 'radio',
                label: 'Example Radio',
                field: 'input_one_radio',
                defaultValue: 'yes',
                help: 'This is an example radio button for the input one entity',
                required: false,
                options: {
                    items: [
                        {
                            value: 'yes',
                            label: 'Yes',
                        },
                        {
                            value: 'no',
                            label: 'No',
                        },
                    ],
                    display: true,
                },
            },
            {
                field: 'dependent_dropdown',
                label: 'Dependent',
                type: 'singleSelect',
                required: false,
                options: {
                    dependencies: ['input_one_radio'],
                    disableonEdit: true,
                    endpointUrl: 'splunk_ta_uccexample/dependent_dropdown',
                },
            },
            {
                field: 'singleSelectTest',
                label: 'Single Select Group Test',
                type: 'singleSelect',
                options: {
                    createSearchChoice: true,
                    autoCompleteFields: [
                        {
                            label: 'Group1',
                            children: [
                                {
                                    value: 'one',
                                    label: 'One',
                                },
                                {
                                    value: 'two',
                                    label: 'Two',
                                },
                            ],
                        },
                        {
                            label: 'Group2',
                            children: [
                                {
                                    value: 'three',
                                    label: 'Three',
                                },
                                {
                                    value: 'four',
                                    label: 'Four',
                                },
                            ],
                        },
                    ],
                },
            },
            {
                field: 'multipleSelectTest',
                label: 'Multiple Select Test',
                type: 'multipleSelect',
                defaultValue: 'a|b',
                options: {
                    delimiter: '|',
                    items: [
                        {
                            value: 'a',
                            label: 'A',
                        },
                        {
                            value: 'b',
                            label: 'B',
                        },
                    ],
                },
            },
            {
                type: 'interval',
                field: 'interval',
                label: 'Interval',
                help: 'Time interval of the data input, in seconds.',
                required: true,
            },
            {
                type: 'helpLink',
                field: 'example_help_link',
                label: '',
                options: {
                    text: 'Help Link',
                    link: 'https://docs.splunk.com/Documentation',
                },
            },
        ],
    },
};
