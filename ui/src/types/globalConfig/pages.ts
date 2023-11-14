import { z } from 'zod';
import { AnyOfEntity } from './entities';

const TableSchema = z.object({
    moreInfo: z
        .array(
            z.object({
                field: z.string(),
                label: z.string(),
                mapping: z.record(z.any()).optional(),
            })
        )
        .optional(),
    header: z.array(
        z.object({
            field: z.string(),
            label: z.string(),
            mapping: z.record(z.any()).optional(),
            customCell: z.record(z.any()).optional(),
        })
    ),
    customRow: z.record(z.any()).optional(),
    actions: z.array(z.enum(['edit', 'delete', 'clone', 'enable'])),
});

// TODO add "required": ["entity", "name", "title"] or required": ["customTab", "name", "title"]
const HooksSchema = z
    .object({
        saveValidator: z.string().optional(),
    })
    .optional();
const TabSchema = z.object({
    entity: z.array(AnyOfEntity).optional(),
    name: z.string(),
    title: z.string(),
    options: HooksSchema,
    table: TableSchema.extend({
        actions: z.array(z.enum(['edit', 'delete', 'clone'])),
    }).optional(),
    style: z.enum(['page', 'dialog']).optional(),
    hook: z.record(z.any()).optional(),
    conf: z.string().optional(),
    restHandlerName: z.string().optional(),
    restHandlerModule: z.string().optional(),
    restHandlerClass: z.string().optional(),
    customTab: z.record(z.any()).optional(),
});

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
export const InputsPageRegular = z.object({
    title: z.string(),
    services: z.array(
        z.object({
            name: z.string(),
            title: z.string(),
            subTitle: z.string().optional(),
            description: z.string().optional(),
            // table should be required, but TS cannot distinguish diff between this and
            // service from tablefull input
            table: TableSchema.optional(),
            entity: z.array(AnyOfEntity),
            options: HooksSchema,
            groups: GroupsSchema,
            style: z.enum(['page', 'dialog']).optional(),
            hook: z.record(z.any()).optional(),
            conf: z.string().optional(),
            restHandlerName: z.string().optional(),
            restHandlerModule: z.string().optional(),
            restHandlerClass: z.string().optional(),
        })
    ),
});

export const InputsPageTableSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    menu: z
        .object({
            type: z.literal('external'),
            src: z.string(),
        })
        .optional(),
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
    services: z.array(
        z.object({
            name: z.string(),
            title: z.string(),
            subTitle: z.string().optional(),
            entity: z.array(AnyOfEntity),
            options: HooksSchema,
            groups: GroupsSchema,
            style: z.enum(['page', 'dialog']).optional(),
            hook: z.record(z.any()).optional(),
            conf: z.string().optional(),
            restHandlerName: z.string().optional(),
            restHandlerModule: z.string().optional(),
            restHandlerClass: z.string().optional(),
        })
    ),
});

export const pages = z.object({
    configuration: z.object({
        title: z.string(),
        description: z.string().optional(),
        tabs: z.array(TabSchema).min(1),
    }),
    inputs: z.union([InputsPageRegular, InputsPageTableSchema]).optional(),
    dashboard: z
        .object({
            panels: z.array(z.object({ name: z.string() })).min(1),
        })
        .optional(),
});
