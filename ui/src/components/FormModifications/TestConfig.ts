import { z } from 'zod';
import { getGlobalConfigMock } from '../../mocks/globalConfigMock';
import { GlobalConfigSchema } from '../../types/globalConfig/globalConfig';
import { TabSchema } from '../../types/globalConfig/pages';
import { CheckboxEntity, TextEntity } from '../../types/globalConfig/entities';

const defaultTableProps = {
    name: 'account',
    table: {
        actions: ['edit', 'delete', 'clone'],
        header: [
            {
                label: 'Name',
                field: 'name',
            },
            {
                label: 'Auth Type',
                field: 'auth_type',
            },
        ],
    },
    title: 'Account jest test',
} satisfies z.infer<typeof TabSchema>;

export const firstStandardTextField = {
    type: 'text',
    label: 'Standard text label first field',
    field: 'standard_text1',
    help: 'Standard Text help first field',
} satisfies z.infer<typeof TextEntity>;

export const secondStandardTextField = {
    type: 'text',
    label: 'Standard text label second field',
    field: 'standard_text2',
    help: 'Standard Text help second field',
} satisfies z.infer<typeof TextEntity>;

export const firstModificationField = {
    type: 'text',
    label: 'First Modification field - text - label',
    field: 'modification_field1',
    help: 'First Modification field - text - help',
    modifyFieldsOnValue: [
        {
            fieldValue: 'a',
            fieldsToModify: [
                {
                    fieldId: 'standard_text1',
                    disabled: true,
                    value: 'field1a',
                    help: 'field1a new help for a value',
                    label: 'field1a new label for a value',
                },
                {
                    fieldId: 'standard_text2',
                    disabled: true,
                    value: 'field2a',
                    help: 'field2a new help for a value',
                    label: 'field2a new label for a value',
                },
            ],
        },
        {
            fieldValue: 'aa',
            fieldsToModify: [
                {
                    fieldId: 'standard_text1',
                    disabled: false,
                    value: 'field1aa',
                    help: 'field1aa new help for a value',
                    label: 'field1aa new label for a value',
                },
                {
                    fieldId: 'standard_text2',
                    disabled: false,
                    value: 'field2aa',
                    help: 'field2aa new help for a value',
                    label: 'field2aa new label for a value',
                },
            ],
        },
    ],
} satisfies z.infer<typeof TextEntity>;

export const secondModificationField = {
    type: 'text',
    label: 'Second Modification field - text - label',
    field: 'modification_field2',
    help: 'Second Modification field - text - help',
    modifyFieldsOnValue: [
        {
            fieldValue: 'a',
            fieldsToModify: [
                {
                    fieldId: 'standard_text1',
                },
                {
                    fieldId: 'standard_text2',
                    markdownMessage: {
                        markdownType: 'hybrid',
                        text: 'markdown message to open token and explain sth',
                        link: 'http://localhost:8000/en-GB/app/Splunk_TA_UCCExample/configuration',
                        token: 'token',
                        linkText: 'conf page',
                    },
                },
            ],
        },
        {
            fieldValue: 'aa',
            fieldsToModify: [
                {
                    fieldId: 'standard_text1',
                    markdownMessage: {
                        markdownType: 'link',
                        text: 'markdown message test conf page',
                        link: 'http://localhost:8000/en-GB/app/Splunk_TA_UCCExample/configuration',
                    },
                },
                {
                    fieldId: 'standard_text2',
                    markdownMessage: {
                        markdownType: 'text',
                        text: 'markdown message test',
                        color: 'red',
                    },
                },
            ],
        },
    ],
} satisfies z.infer<typeof TextEntity>;

export const thirdModificationField = {
    type: 'checkbox',
    label: 'Third Modification field - checkbox - label',
    field: 'modification_field3',
    help: 'Third Modification field - checkbox - help',
} satisfies z.infer<typeof CheckboxEntity>;

export const getConfigWithModifications = () => {
    const standardConfig = getGlobalConfigMock();
    const newConfig = {
        ...standardConfig,
        pages: {
            ...standardConfig.pages,
            configuration: {
                ...standardConfig.pages.configuration,
                tabs: [
                    {
                        entity: [
                            firstModificationField,
                            secondModificationField,
                            thirdModificationField,
                            firstStandardTextField,
                            secondStandardTextField,
                        ],
                        ...defaultTableProps,
                    },
                ],
            },
        },
    };

    return newConfig satisfies z.infer<typeof GlobalConfigSchema>;
};
