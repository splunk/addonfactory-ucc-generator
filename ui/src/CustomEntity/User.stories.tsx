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
type StoryInputEntity = IndexEntity | AnyOfEntity | IntervalEntity;

/**
 * StoryWrapper component renders a single BaseFormView instance based on the provided input entity.
 * It performs schema migration, validation, and config injection for accurate preview and behavior.
 */
const StoryWrapper: React.FC<StoryInputEntity> = (args) => {
    const [debouncedArgs, setDebouncedArgs] = useState<StoryInputEntity>(args);

    /**
     * Debounces the input args to prevent excessive rerenders or config changes during live editing.
     */
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedArgs(args);
        }, 300);
        return () => clearTimeout(timeout);
    }, [args]);

    // Perform schema migration and validation based on the input type
    let result;
    if (debouncedArgs.type === 'index') {
        const migrated = migrateIndexTypeEntity(debouncedArgs as IndexEntity);
        result = SingleSelectEntitySchema.safeParse(migrated);
    } else if (debouncedArgs.type === 'interval') {
        const migrated = migrateIntervalTypeEntity(debouncedArgs as IntervalEntity);
        result = TextEntitySchema.safeParse(migrated);
    } else {
        result = AnyOfEntitySchema.safeParse(debouncedArgs);
    }

    // Throw error if validation fails, so Storybook shows it clearly
    if (!result.success) {
        const formattedErrors = result.error.issues
            .map((issue) => `${issue.path.join('.')} - ${issue.message}`)
            .join('\n');
        throw new Error(`Entity validation failed:\n${formattedErrors}`);
    }

    // Generate a full config and inject the validated entity into the global tab structure
    const testconfig = generateGlobalConfig();
    if (testconfig.config.pages?.configuration?.tabs?.[0]) {
        testconfig.config.pages.configuration.tabs[0].entity = [result.data];
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

// Storybook metadata: tells Storybook how to render and type-check this story collection
const meta: Meta<StoryInputEntity> = {
    title: 'Custom Entity',
    render: (args) => <StoryWrapper {...args} />,
};

export default meta;

type Story = StoryObj<StoryInputEntity>;

/**
 * Renders a validated TextEntity schema using `BaseFormView`.
 */
export const TextField: Story = {
    args: {
        type: 'text',
        label: 'Username',
        field: 'username',
        help: 'Enter your username',
        required: true,
    },
};

/**
 * Renders a migrated IndexEntity as a `singleSelect` component.
 */
export const IndexField: Story = {
    args: {
        type: 'index',
        label: 'Index',
        field: 'index',
        help: 'An index is a type of data repository. Select the index in which you want to collect the events.',
        required: true,
        defaultValue: 'default',
    },
};

/**
 * Renders a migrated IntervalEntity as a validated text field (with CRON/number support).
 */
export const IntervalField: Story = {
    args: {
        type: 'interval',
        field: 'interval',
        label: 'Interval',
        help: 'Time interval of the data input, in seconds.',
        required: true,
    },
};
