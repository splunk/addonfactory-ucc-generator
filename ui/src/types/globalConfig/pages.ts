import { z } from 'zod';
import { AnyOfEntitySchema } from './entities';

export const TableSchema = z.object({
    moreInfo: z
        .array(
            z.object({
                field: z.string(),
                label: z.string(),
                mapping: z.record(z.string(), z.string()).optional(),
            })
        )
        .optional(),
    header: z.array(
        z.object({
            field: z.string(),
            label: z.string(),
            mapping: z.record(z.string(), z.string()).optional(),
            customCell: z.record(z.string(), z.string()).optional(),
        })
    ),
    customRow: z.record(z.string(), z.string()).optional(),
    actions: z.array(z.enum(['edit', 'delete', 'clone', 'search'])),
});

// TODO add "required": ["entity", "name", "title"] or required": ["customTab", "name", "title"]
const HooksSchema = z
    .object({
        saveValidator: z.string().optional(),
    })
    .optional();

const WarningMessageSchema = z.object({
    message: z.string(),
    alwaysDisplay: z.boolean().default(false).optional(),
});

const WarningSchema = z
    .object({
        create: WarningMessageSchema.optional(),
        edit: WarningMessageSchema.optional(),
        config: WarningMessageSchema.optional(),
        clone: WarningMessageSchema.optional(),
    })
    .optional();

const GroupsSchema = z
    .array(
        z.object({
            options: z
                .object({
                    isExpandable: z.boolean().optional(),
                    expand: z.boolean().optional(),
                })
                .optional(),
            label: z.string(),
            fields: z.array(z.string()),
        })
    )
    .optional();

export const TabSchema = z.object({
    entity: z.array(AnyOfEntitySchema).optional(),
    name: z.string(),
    title: z.string(),
    options: HooksSchema,
    table: TableSchema.extend({
        actions: z.array(z.enum(['edit', 'delete', 'clone'])),
    }).optional(),
    style: z.enum(['page', 'dialog']).optional(),
    hook: z.record(z.string(), z.string()).optional(),
    conf: z.string().optional(),
    restHandlerName: z.string().optional(),
    restHandlerModule: z.string().optional(),
    restHandlerClass: z.string().optional(),
    customTab: z.record(z.string(), z.string()).optional(),
    warning: WarningSchema,
    hideForPlatform: z.enum(['cloud', 'enterprise']).optional(),
    groups: GroupsSchema,
    formTitle: z.string().optional(),
});

export const TableLessServiceSchema = z.object({
    name: z.string(),
    title: z.string(),
    subTitle: z.string().optional(),
    entity: z.array(AnyOfEntitySchema),
    options: HooksSchema,
    groups: GroupsSchema,
    style: z.enum(['page', 'dialog']).optional(),
    hook: z.record(z.string(), z.string()).optional(),
    conf: z.string().optional(),
    restHandlerName: z.string().optional(),
    restHandlerModule: z.string().optional(),
    restHandlerClass: z.string().optional(),
    warning: WarningSchema,
    inputHelperModule: z.string().optional(),
    disableNewInput: z.boolean().optional(),
    hideForPlatform: z.enum(['cloud', 'enterprise']).optional(),
    formTitle: z.string().optional(),
});

export const TableFullServiceSchema = TableLessServiceSchema.extend({
    description: z.string().optional(),
    table: TableSchema,
    useInputToggleConfirmation: z.boolean().optional(),
});

export const InputsPageRegular = z
    .object({
        title: z.string(),
        services: z.array(TableFullServiceSchema),
        inputsUniqueAcrossSingleService: z.boolean().default(false).optional(),
    })
    // The strict method disallows a table field to distinguish between to inputs
    .strict();

export const SubDescriptionSchema = z
    .object({
        text: z.string(),
        links: z
            .array(
                z.object({
                    slug: z.string(),
                    link: z.string(),
                    linkText: z.string(),
                })
            )
            .optional(),
    })
    .optional();

export const InputsPageTableSchema = z
    .object({
        title: z.string(),
        description: z.string().optional(),
        subDescription: SubDescriptionSchema,
        table: TableSchema,
        groupsMenu: z
            .array(
                z.object({
                    groupName: z.string(),
                    groupTitle: z.string(),
                    groupServices: z.array(z.string()).optional(),
                })
            )
            .optional(),
        // The strict method disallows a table field to distinguish between
        // TableLessServiceSchema and TableFullServiceSchema
        services: z.array(TableLessServiceSchema.strict()),
        hideFieldId: z.string().optional(),
        readonlyFieldId: z.string().optional(),
        useInputToggleConfirmation: z.boolean().optional(),
        inputsUniqueAcrossSingleService: z.boolean().default(false).optional(),
    })
    .strict();

const InputsPageSchema = z.union([InputsPageRegular, InputsPageTableSchema]).optional();
const ServiceTableSchema = z.union([TableFullServiceSchema, TableLessServiceSchema]);

export const pages = z
    .object({
        configuration: z
            .object({
                title: z.string(),
                description: z.string().optional(),
                subDescription: SubDescriptionSchema,
                tabs: z.array(TabSchema).min(1),
            })
            .strict()
            .optional(),
        inputs: InputsPageSchema,
        dashboard: z
            .object({
                panels: z.array(z.object({ name: z.string() })).min(1),
                troubleshooting_url: z.string().optional(),
                settings: z.object({ custom_tab_name: z.string().optional() }).optional(),
            })
            .optional(),
    })
    .strict();

export type Platforms = 'enterprise' | 'cloud' | undefined;

// Define the types based on the Zod schemas
export type InputsPage = z.infer<typeof InputsPageSchema>;
export type InputsPageTable = z.infer<typeof InputsPageTableSchema>;
export type ServiceTable = z.infer<typeof ServiceTableSchema>;
export type SubDescriptionType = z.infer<typeof SubDescriptionSchema>;
export type ITableConfig = z.infer<typeof TableSchema>;
