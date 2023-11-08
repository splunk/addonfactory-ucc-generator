import { z } from 'zod';

export const pages = z
    .object({
        configuration: z
            .object({
                title: z.string().max(60),
                description: z.string().max(200).optional(),
                tabs: z
                    .array(
                        z
                            .object({
                                entity: z
                                    .array(
                                        z.union([
                                            z
                                                .object({
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string().max(30),
                                                    type: z.literal('checkboxGroup'),
                                                    options: z
                                                        .object({
                                                            groups: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            label: z
                                                                                .string()
                                                                                .max(30),
                                                                            options: z
                                                                                .object({
                                                                                    isExpandable: z
                                                                                        .boolean()
                                                                                        .default(
                                                                                            false
                                                                                        ),
                                                                                    expand: z
                                                                                        .boolean()
                                                                                        .default(
                                                                                            false
                                                                                        ),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                            fields: z
                                                                                .array(z.string())
                                                                                .min(1),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                            rows: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            field: z.string(),
                                                                            checkbox: z
                                                                                .object({
                                                                                    label: z
                                                                                        .string()
                                                                                        .max(30)
                                                                                        .optional(),
                                                                                    defaultValue: z
                                                                                        .boolean()
                                                                                        .optional(),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                            input: z
                                                                                .object({
                                                                                    defaultValue: z
                                                                                        .number()
                                                                                        .optional(),
                                                                                    required: z
                                                                                        .boolean()
                                                                                        .default(
                                                                                            false
                                                                                        ),
                                                                                    validators: z
                                                                                        .array(
                                                                                            z
                                                                                                .object(
                                                                                                    {
                                                                                                        errorMsg:
                                                                                                            z
                                                                                                                .string()
                                                                                                                .max(
                                                                                                                    400
                                                                                                                )
                                                                                                                .optional(),
                                                                                                        type: z.literal(
                                                                                                            'number'
                                                                                                        ),
                                                                                                        range: z.array(
                                                                                                            z.number()
                                                                                                        ),
                                                                                                    }
                                                                                                )
                                                                                                .catchall(
                                                                                                    z.never()
                                                                                                )
                                                                                        )
                                                                                        .optional(),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .min(1),
                                                        })
                                                        .catchall(z.never()),
                                                    validators: z
                                                        .array(
                                                            z
                                                                .object({
                                                                    errorMsg: z
                                                                        .string()
                                                                        .max(400)
                                                                        .optional(),
                                                                    type: z.literal('regex'),
                                                                    pattern: z.string(),
                                                                })
                                                                .catchall(z.never())
                                                        )
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('text'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z
                                                        .union([z.string(), z.number()])
                                                        .optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('number'),
                                                                        range: z.array(z.number()),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('email'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('ipv4'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('url'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('date'),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .min(1)
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            placeholder: z.string().optional(),
                                                            enable: z.boolean().optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('textarea'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z.string().optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('email'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('ipv4'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('url'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('date'),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .min(1)
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            placeholder: z.string().optional(),
                                                            enable: z.boolean().optional(),
                                                            rowsMin: z.number().optional(),
                                                            rowsMax: z.number().optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('singleSelect'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z
                                                        .union([z.string(), z.number()])
                                                        .optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('email'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('ipv4'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('url'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('date'),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .min(1)
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            placeholder: z.string().optional(),
                                                            enable: z.boolean().optional(),
                                                            disableSearch: z.boolean().optional(),
                                                            createSearchChoice: z
                                                                .boolean()
                                                                .optional(),
                                                            referenceName: z.string().optional(),
                                                            endpointUrl: z.string().optional(),
                                                            allowList: z.string().optional(),
                                                            denyList: z.string().optional(),
                                                            labelField: z.string().optional(),
                                                            autoCompleteFields: z
                                                                .any()
                                                                .superRefine((x, ctx) => {
                                                                    const schemas = [
                                                                        z.array(
                                                                            z.object({
                                                                                label: z.string(),
                                                                                children: z.array(
                                                                                    z
                                                                                        .object({
                                                                                            value: z
                                                                                                .any()
                                                                                                .superRefine(
                                                                                                    (
                                                                                                        x,
                                                                                                        ctx
                                                                                                    ) => {
                                                                                                        const schemas =
                                                                                                            [
                                                                                                                z.number(),
                                                                                                                z
                                                                                                                    .string()
                                                                                                                    .max(
                                                                                                                        250
                                                                                                                    ),
                                                                                                                z.boolean(),
                                                                                                            ];
                                                                                                        const errors =
                                                                                                            schemas.reduce(
                                                                                                                (
                                                                                                                    errors: z.ZodError[],
                                                                                                                    schema
                                                                                                                ) =>
                                                                                                                    ((
                                                                                                                        result
                                                                                                                    ) =>
                                                                                                                        'error' in
                                                                                                                        result
                                                                                                                            ? [
                                                                                                                                  ...errors,
                                                                                                                                  result.error,
                                                                                                                              ]
                                                                                                                            : errors)(
                                                                                                                        schema.safeParse(
                                                                                                                            x
                                                                                                                        )
                                                                                                                    ),
                                                                                                                []
                                                                                                            );
                                                                                                        if (
                                                                                                            schemas.length -
                                                                                                                errors.length !==
                                                                                                            1
                                                                                                        ) {
                                                                                                            ctx.addIssue(
                                                                                                                {
                                                                                                                    path: ctx.path,
                                                                                                                    code: 'invalid_union',
                                                                                                                    unionErrors:
                                                                                                                        errors,
                                                                                                                    message:
                                                                                                                        'Invalid input: Should pass single schema',
                                                                                                                }
                                                                                                            );
                                                                                                        }
                                                                                                    }
                                                                                                )
                                                                                                .optional(),
                                                                                            label: z
                                                                                                .string()
                                                                                                .max(
                                                                                                    100
                                                                                                ),
                                                                                        })
                                                                                        .catchall(
                                                                                            z.never()
                                                                                        )
                                                                                ),
                                                                            })
                                                                        ),
                                                                        z.array(
                                                                            z
                                                                                .object({
                                                                                    value: z
                                                                                        .any()
                                                                                        .superRefine(
                                                                                            (
                                                                                                x,
                                                                                                ctx
                                                                                            ) => {
                                                                                                const schemas =
                                                                                                    [
                                                                                                        z.number(),
                                                                                                        z
                                                                                                            .string()
                                                                                                            .max(
                                                                                                                250
                                                                                                            ),
                                                                                                        z.boolean(),
                                                                                                    ];
                                                                                                const errors =
                                                                                                    schemas.reduce(
                                                                                                        (
                                                                                                            errors: z.ZodError[],
                                                                                                            schema
                                                                                                        ) =>
                                                                                                            ((
                                                                                                                result
                                                                                                            ) =>
                                                                                                                'error' in
                                                                                                                result
                                                                                                                    ? [
                                                                                                                          ...errors,
                                                                                                                          result.error,
                                                                                                                      ]
                                                                                                                    : errors)(
                                                                                                                schema.safeParse(
                                                                                                                    x
                                                                                                                )
                                                                                                            ),
                                                                                                        []
                                                                                                    );
                                                                                                if (
                                                                                                    schemas.length -
                                                                                                        errors.length !==
                                                                                                    1
                                                                                                ) {
                                                                                                    ctx.addIssue(
                                                                                                        {
                                                                                                            path: ctx.path,
                                                                                                            code: 'invalid_union',
                                                                                                            unionErrors:
                                                                                                                errors,
                                                                                                            message:
                                                                                                                'Invalid input: Should pass single schema',
                                                                                                        }
                                                                                                    );
                                                                                                }
                                                                                            }
                                                                                        )
                                                                                        .optional(),
                                                                                    label: z
                                                                                        .string()
                                                                                        .max(100),
                                                                                })
                                                                                .catchall(z.never())
                                                                        ),
                                                                    ];
                                                                    const errors = schemas.reduce(
                                                                        (
                                                                            errors: z.ZodError[],
                                                                            schema
                                                                        ) =>
                                                                            ((result) =>
                                                                                'error' in result
                                                                                    ? [
                                                                                          ...errors,
                                                                                          result.error,
                                                                                      ]
                                                                                    : errors)(
                                                                                schema.safeParse(x)
                                                                            ),
                                                                        []
                                                                    );
                                                                    if (
                                                                        schemas.length -
                                                                            errors.length !==
                                                                        1
                                                                    ) {
                                                                        ctx.addIssue({
                                                                            path: ctx.path,
                                                                            code: 'invalid_union',
                                                                            unionErrors: errors,
                                                                            message:
                                                                                'Invalid input: Should pass single schema',
                                                                        });
                                                                    }
                                                                })
                                                                .optional(),
                                                            dependencies: z
                                                                .array(z.string())
                                                                .optional(),
                                                            items: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            value: z
                                                                                .any()
                                                                                .superRefine(
                                                                                    (x, ctx) => {
                                                                                        const schemas =
                                                                                            [
                                                                                                z.number(),
                                                                                                z
                                                                                                    .string()
                                                                                                    .max(
                                                                                                        250
                                                                                                    ),
                                                                                                z.boolean(),
                                                                                            ];
                                                                                        const errors =
                                                                                            schemas.reduce(
                                                                                                (
                                                                                                    errors: z.ZodError[],
                                                                                                    schema
                                                                                                ) =>
                                                                                                    ((
                                                                                                        result
                                                                                                    ) =>
                                                                                                        'error' in
                                                                                                        result
                                                                                                            ? [
                                                                                                                  ...errors,
                                                                                                                  result.error,
                                                                                                              ]
                                                                                                            : errors)(
                                                                                                        schema.safeParse(
                                                                                                            x
                                                                                                        )
                                                                                                    ),
                                                                                                []
                                                                                            );
                                                                                        if (
                                                                                            schemas.length -
                                                                                                errors.length !==
                                                                                            1
                                                                                        ) {
                                                                                            ctx.addIssue(
                                                                                                {
                                                                                                    path: ctx.path,
                                                                                                    code: 'invalid_union',
                                                                                                    unionErrors:
                                                                                                        errors,
                                                                                                    message:
                                                                                                        'Invalid input: Should pass single schema',
                                                                                                }
                                                                                            );
                                                                                        }
                                                                                    }
                                                                                )
                                                                                .optional(),
                                                                            label: z
                                                                                .string()
                                                                                .max(100),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                        })
                                                        .catchall(z.never()),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('multipleSelect'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z.string().optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('email'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('ipv4'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('url'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('date'),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .min(1)
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            placeholder: z.string().optional(),
                                                            enable: z.boolean().optional(),
                                                            disableSearch: z.boolean().optional(),
                                                            createSearchChoice: z
                                                                .boolean()
                                                                .optional(),
                                                            referenceName: z.string().optional(),
                                                            endpointUrl: z.string().optional(),
                                                            allowList: z.string().optional(),
                                                            denyList: z.string().optional(),
                                                            labelField: z.string().optional(),
                                                            autoCompleteFields: z
                                                                .any()
                                                                .superRefine((x, ctx) => {
                                                                    const schemas = [
                                                                        z.array(
                                                                            z.object({
                                                                                label: z.string(),
                                                                                children: z.array(
                                                                                    z
                                                                                        .object({
                                                                                            value: z
                                                                                                .any()
                                                                                                .superRefine(
                                                                                                    (
                                                                                                        x,
                                                                                                        ctx
                                                                                                    ) => {
                                                                                                        const schemas =
                                                                                                            [
                                                                                                                z.number(),
                                                                                                                z
                                                                                                                    .string()
                                                                                                                    .max(
                                                                                                                        250
                                                                                                                    ),
                                                                                                                z.boolean(),
                                                                                                            ];
                                                                                                        const errors =
                                                                                                            schemas.reduce(
                                                                                                                (
                                                                                                                    errors: z.ZodError[],
                                                                                                                    schema
                                                                                                                ) =>
                                                                                                                    ((
                                                                                                                        result
                                                                                                                    ) =>
                                                                                                                        'error' in
                                                                                                                        result
                                                                                                                            ? [
                                                                                                                                  ...errors,
                                                                                                                                  result.error,
                                                                                                                              ]
                                                                                                                            : errors)(
                                                                                                                        schema.safeParse(
                                                                                                                            x
                                                                                                                        )
                                                                                                                    ),
                                                                                                                []
                                                                                                            );
                                                                                                        if (
                                                                                                            schemas.length -
                                                                                                                errors.length !==
                                                                                                            1
                                                                                                        ) {
                                                                                                            ctx.addIssue(
                                                                                                                {
                                                                                                                    path: ctx.path,
                                                                                                                    code: 'invalid_union',
                                                                                                                    unionErrors:
                                                                                                                        errors,
                                                                                                                    message:
                                                                                                                        'Invalid input: Should pass single schema',
                                                                                                                }
                                                                                                            );
                                                                                                        }
                                                                                                    }
                                                                                                )
                                                                                                .optional(),
                                                                                            label: z
                                                                                                .string()
                                                                                                .max(
                                                                                                    100
                                                                                                ),
                                                                                        })
                                                                                        .catchall(
                                                                                            z.never()
                                                                                        )
                                                                                ),
                                                                            })
                                                                        ),
                                                                        z.array(
                                                                            z
                                                                                .object({
                                                                                    value: z
                                                                                        .any()
                                                                                        .superRefine(
                                                                                            (
                                                                                                x,
                                                                                                ctx
                                                                                            ) => {
                                                                                                const schemas =
                                                                                                    [
                                                                                                        z.number(),
                                                                                                        z
                                                                                                            .string()
                                                                                                            .max(
                                                                                                                250
                                                                                                            ),
                                                                                                        z.boolean(),
                                                                                                    ];
                                                                                                const errors =
                                                                                                    schemas.reduce(
                                                                                                        (
                                                                                                            errors: z.ZodError[],
                                                                                                            schema
                                                                                                        ) =>
                                                                                                            ((
                                                                                                                result
                                                                                                            ) =>
                                                                                                                'error' in
                                                                                                                result
                                                                                                                    ? [
                                                                                                                          ...errors,
                                                                                                                          result.error,
                                                                                                                      ]
                                                                                                                    : errors)(
                                                                                                                schema.safeParse(
                                                                                                                    x
                                                                                                                )
                                                                                                            ),
                                                                                                        []
                                                                                                    );
                                                                                                if (
                                                                                                    schemas.length -
                                                                                                        errors.length !==
                                                                                                    1
                                                                                                ) {
                                                                                                    ctx.addIssue(
                                                                                                        {
                                                                                                            path: ctx.path,
                                                                                                            code: 'invalid_union',
                                                                                                            unionErrors:
                                                                                                                errors,
                                                                                                            message:
                                                                                                                'Invalid input: Should pass single schema',
                                                                                                        }
                                                                                                    );
                                                                                                }
                                                                                            }
                                                                                        )
                                                                                        .optional(),
                                                                                    label: z
                                                                                        .string()
                                                                                        .max(100),
                                                                                })
                                                                                .catchall(z.never())
                                                                        ),
                                                                    ];
                                                                    const errors = schemas.reduce(
                                                                        (
                                                                            errors: z.ZodError[],
                                                                            schema
                                                                        ) =>
                                                                            ((result) =>
                                                                                'error' in result
                                                                                    ? [
                                                                                          ...errors,
                                                                                          result.error,
                                                                                      ]
                                                                                    : errors)(
                                                                                schema.safeParse(x)
                                                                            ),
                                                                        []
                                                                    );
                                                                    if (
                                                                        schemas.length -
                                                                            errors.length !==
                                                                        1
                                                                    ) {
                                                                        ctx.addIssue({
                                                                            path: ctx.path,
                                                                            code: 'invalid_union',
                                                                            unionErrors: errors,
                                                                            message:
                                                                                'Invalid input: Should pass single schema',
                                                                        });
                                                                    }
                                                                })
                                                                .optional(),
                                                            dependencies: z
                                                                .array(z.string())
                                                                .optional(),
                                                            items: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            value: z
                                                                                .any()
                                                                                .superRefine(
                                                                                    (x, ctx) => {
                                                                                        const schemas =
                                                                                            [
                                                                                                z.number(),
                                                                                                z
                                                                                                    .string()
                                                                                                    .max(
                                                                                                        250
                                                                                                    ),
                                                                                                z.boolean(),
                                                                                            ];
                                                                                        const errors =
                                                                                            schemas.reduce(
                                                                                                (
                                                                                                    errors: z.ZodError[],
                                                                                                    schema
                                                                                                ) =>
                                                                                                    ((
                                                                                                        result
                                                                                                    ) =>
                                                                                                        'error' in
                                                                                                        result
                                                                                                            ? [
                                                                                                                  ...errors,
                                                                                                                  result.error,
                                                                                                              ]
                                                                                                            : errors)(
                                                                                                        schema.safeParse(
                                                                                                            x
                                                                                                        )
                                                                                                    ),
                                                                                                []
                                                                                            );
                                                                                        if (
                                                                                            schemas.length -
                                                                                                errors.length !==
                                                                                            1
                                                                                        ) {
                                                                                            ctx.addIssue(
                                                                                                {
                                                                                                    path: ctx.path,
                                                                                                    code: 'invalid_union',
                                                                                                    unionErrors:
                                                                                                        errors,
                                                                                                    message:
                                                                                                        'Invalid input: Should pass single schema',
                                                                                                }
                                                                                            );
                                                                                        }
                                                                                    }
                                                                                )
                                                                                .optional(),
                                                                            label: z
                                                                                .string()
                                                                                .max(100),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                            delimiter: z.string().max(1).optional(),
                                                        })
                                                        .catchall(z.never()),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('checkbox'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z
                                                        .union([z.boolean(), z.number()])
                                                        .optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            enable: z.boolean().optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('radio'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z.string().optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            enable: z.boolean().optional(),
                                                            items: z.array(
                                                                z
                                                                    .object({
                                                                        value: z
                                                                            .any()
                                                                            .superRefine(
                                                                                (x, ctx) => {
                                                                                    const schemas =
                                                                                        [
                                                                                            z.number(),
                                                                                            z
                                                                                                .string()
                                                                                                .max(
                                                                                                    250
                                                                                                ),
                                                                                            z.boolean(),
                                                                                        ];
                                                                                    const errors =
                                                                                        schemas.reduce(
                                                                                            (
                                                                                                errors: z.ZodError[],
                                                                                                schema
                                                                                            ) =>
                                                                                                ((
                                                                                                    result
                                                                                                ) =>
                                                                                                    'error' in
                                                                                                    result
                                                                                                        ? [
                                                                                                              ...errors,
                                                                                                              result.error,
                                                                                                          ]
                                                                                                        : errors)(
                                                                                                    schema.safeParse(
                                                                                                        x
                                                                                                    )
                                                                                                ),
                                                                                            []
                                                                                        );
                                                                                    if (
                                                                                        schemas.length -
                                                                                            errors.length !==
                                                                                        1
                                                                                    ) {
                                                                                        ctx.addIssue(
                                                                                            {
                                                                                                path: ctx.path,
                                                                                                code: 'invalid_union',
                                                                                                unionErrors:
                                                                                                    errors,
                                                                                                message:
                                                                                                    'Invalid input: Should pass single schema',
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                }
                                                                            )
                                                                            .optional(),
                                                                        label: z.string().max(100),
                                                                    })
                                                                    .catchall(z.never())
                                                            ),
                                                        })
                                                        .catchall(z.never()),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('helpLink'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string().optional(),
                                                    options: z
                                                        .object({
                                                            text: z.string(),
                                                            link: z.string(),
                                                        })
                                                        .catchall(z.never()),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('file'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z.string().optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            enable: z.boolean().optional(),
                                                            maxFileSize: z.number().optional(),
                                                            fileSupportMessage: z
                                                                .string()
                                                                .optional(),
                                                            supportedFileTypes: z
                                                                .array(z.string())
                                                                .optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('oauth'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            enable: z.boolean().optional(),
                                                            auth_type: z.array(
                                                                z.union([
                                                                    z.literal('basic'),
                                                                    z.literal('oauth'),
                                                                ])
                                                            ),
                                                            basic: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            oauth_field: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            label: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            field: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            help: z
                                                                                .string()
                                                                                .max(200)
                                                                                .optional(),
                                                                            encrypted: z
                                                                                .boolean()
                                                                                .optional(),
                                                                            required: z
                                                                                .boolean()
                                                                                .optional(),
                                                                            options: z
                                                                                .object({
                                                                                    placeholder: z
                                                                                        .string()
                                                                                        .max(250)
                                                                                        .optional(),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                            oauth: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            oauth_field: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            label: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            field: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            help: z
                                                                                .string()
                                                                                .max(200)
                                                                                .optional(),
                                                                            encrypted: z
                                                                                .boolean()
                                                                                .optional(),
                                                                            required: z
                                                                                .boolean()
                                                                                .optional(),
                                                                            options: z
                                                                                .object({
                                                                                    placeholder: z
                                                                                        .string()
                                                                                        .max(250)
                                                                                        .optional(),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                            auth_label: z
                                                                .string()
                                                                .max(250)
                                                                .optional(),
                                                            oauth_popup_width: z
                                                                .number()
                                                                .optional(),
                                                            oauth_popup_height: z
                                                                .number()
                                                                .optional(),
                                                            oauth_timeout: z.number().optional(),
                                                            auth_code_endpoint: z
                                                                .string()
                                                                .max(350)
                                                                .optional(),
                                                            access_token_endpoint: z
                                                                .string()
                                                                .max(350)
                                                                .optional(),
                                                            oauth_state_enabled: z
                                                                .boolean()
                                                                .optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .and(z.intersection(z.any(), z.any())),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('custom'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    defaultValue: z
                                                        .any()
                                                        .superRefine((x, ctx) => {
                                                            const schemas = [
                                                                z.number(),
                                                                z.string(),
                                                                z.boolean(),
                                                            ];
                                                            const errors = schemas.reduce(
                                                                (errors: z.ZodError[], schema) =>
                                                                    ((result) =>
                                                                        'error' in result
                                                                            ? [
                                                                                  ...errors,
                                                                                  result.error,
                                                                              ]
                                                                            : errors)(
                                                                        schema.safeParse(x)
                                                                    ),
                                                                []
                                                            );
                                                            if (
                                                                schemas.length - errors.length !==
                                                                1
                                                            ) {
                                                                ctx.addIssue({
                                                                    path: ctx.path,
                                                                    code: 'invalid_union',
                                                                    unionErrors: errors,
                                                                    message:
                                                                        'Invalid input: Should pass single schema',
                                                                });
                                                            }
                                                        })
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            type: z.literal('external').optional(),
                                                            src: z.string().optional(),
                                                        })
                                                        .catchall(z.never()),
                                                })
                                                .catchall(z.never()),
                                        ])
                                    )
                                    .optional(),
                                name: z
                                    .string()
                                    .regex(new RegExp('^[\\/\\w]+$'))
                                    .max(250)
                                    .optional(),
                                title: z.string().max(50).optional(),
                                options: z
                                    .object({
                                        saveValidator: z.string().max(3000).optional(),
                                    })
                                    .catchall(z.never())
                                    .optional(),
                                table: z
                                    .object({
                                        moreInfo: z
                                            .array(
                                                z.object({
                                                    field: z.string().regex(new RegExp('^\\w+$')),
                                                    label: z.string().max(30),
                                                    mapping: z.record(z.any()).optional(),
                                                })
                                            )
                                            .optional(),
                                        header: z.array(
                                            z.object({
                                                field: z.string().regex(new RegExp('^\\w+$')),
                                                label: z.string().max(30),
                                                mapping: z.record(z.any()).optional(),
                                                customCell: z.record(z.any()).optional(),
                                            })
                                        ),
                                        customRow: z.record(z.any()).optional(),
                                        actions: z.array(z.enum(['edit', 'delete', 'clone'])),
                                    })
                                    .catchall(z.never())
                                    .optional(),
                                style: z.enum(['page', 'dialog']).optional(),
                                conf: z.string().max(100).optional(),
                                restHandlerName: z.string().max(100).optional(),
                                restHandlerModule: z.string().max(100).optional(),
                                restHandlerClass: z.string().max(100).optional(),
                                hook: z.record(z.any()).optional(),
                                customTab: z.record(z.any()).optional(),
                            })
                            .catchall(z.never())
                            .and(z.union([z.any(), z.any()]))
                    )
                    .min(1),
            })
            .catchall(z.never()),
        inputs: z
            .any()
            .superRefine((x, ctx) => {
                const schemas = [
                    z
                        .object({
                            title: z.string().max(60),
                            description: z.string().max(200).optional(),
                            menu: z.record(z.any()).optional(),
                            table: z
                                .object({
                                    moreInfo: z
                                        .array(
                                            z.object({
                                                field: z.string().regex(new RegExp('^\\w+$')),
                                                label: z.string().max(30),
                                                mapping: z.record(z.any()).optional(),
                                            })
                                        )
                                        .optional(),
                                    header: z.array(
                                        z.object({
                                            field: z.string().regex(new RegExp('^\\w+$')),
                                            label: z.string().max(30),
                                            mapping: z.record(z.any()).optional(),
                                            customCell: z.record(z.any()).optional(),
                                        })
                                    ),
                                    customRow: z.record(z.any()).optional(),
                                    actions: z.array(z.enum(['edit', 'delete', 'clone', 'enable'])),
                                })
                                .catchall(z.never()),
                            groupsMenu: z
                                .array(
                                    z.object({
                                        groupName: z
                                            .string()
                                            .regex(new RegExp('^[0-9a-zA-Z][\\w-]*$'))
                                            .max(50),
                                        groupTitle: z.string().max(100),
                                        groupServices: z
                                            .array(
                                                z
                                                    .string()
                                                    .regex(new RegExp('^[0-9a-zA-Z][\\w-]*$'))
                                                    .max(50)
                                            )
                                            .optional(),
                                    })
                                )
                                .optional(),
                            services: z.array(
                                z.object({
                                    name: z
                                        .string()
                                        .regex(new RegExp('^[0-9a-zA-Z][\\w-]*$'))
                                        .max(50),
                                    title: z.string().max(100),
                                    subTitle: z.string().max(50).optional(),
                                    entity: z.array(
                                        z.union([
                                            z
                                                .object({
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string().max(30),
                                                    type: z.literal('checkboxGroup'),
                                                    options: z
                                                        .object({
                                                            groups: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            label: z
                                                                                .string()
                                                                                .max(30),
                                                                            options: z
                                                                                .object({
                                                                                    isExpandable: z
                                                                                        .boolean()
                                                                                        .default(
                                                                                            false
                                                                                        ),
                                                                                    expand: z
                                                                                        .boolean()
                                                                                        .default(
                                                                                            false
                                                                                        ),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                            fields: z
                                                                                .array(z.string())
                                                                                .min(1),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                            rows: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            field: z.string(),
                                                                            checkbox: z
                                                                                .object({
                                                                                    label: z
                                                                                        .string()
                                                                                        .max(30)
                                                                                        .optional(),
                                                                                    defaultValue: z
                                                                                        .boolean()
                                                                                        .optional(),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                            input: z
                                                                                .object({
                                                                                    defaultValue: z
                                                                                        .number()
                                                                                        .optional(),
                                                                                    required: z
                                                                                        .boolean()
                                                                                        .default(
                                                                                            false
                                                                                        ),
                                                                                    validators: z
                                                                                        .array(
                                                                                            z
                                                                                                .object(
                                                                                                    {
                                                                                                        errorMsg:
                                                                                                            z
                                                                                                                .string()
                                                                                                                .max(
                                                                                                                    400
                                                                                                                )
                                                                                                                .optional(),
                                                                                                        type: z.literal(
                                                                                                            'number'
                                                                                                        ),
                                                                                                        range: z.array(
                                                                                                            z.number()
                                                                                                        ),
                                                                                                    }
                                                                                                )
                                                                                                .catchall(
                                                                                                    z.never()
                                                                                                )
                                                                                        )
                                                                                        .optional(),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .min(1),
                                                        })
                                                        .catchall(z.never()),
                                                    validators: z
                                                        .array(
                                                            z
                                                                .object({
                                                                    errorMsg: z
                                                                        .string()
                                                                        .max(400)
                                                                        .optional(),
                                                                    type: z.literal('regex'),
                                                                    pattern: z.string(),
                                                                })
                                                                .catchall(z.never())
                                                        )
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('text'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z
                                                        .union([z.string(), z.number()])
                                                        .optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('number'),
                                                                        range: z.array(z.number()),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('email'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('ipv4'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('url'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('date'),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .min(1)
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            placeholder: z.string().optional(),
                                                            enable: z.boolean().optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('textarea'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z.string().optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('email'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('ipv4'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('url'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('date'),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .min(1)
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            placeholder: z.string().optional(),
                                                            enable: z.boolean().optional(),
                                                            rowsMin: z.number().optional(),
                                                            rowsMax: z.number().optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('singleSelect'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z
                                                        .union([z.string(), z.number()])
                                                        .optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('email'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('ipv4'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('url'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('date'),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .min(1)
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            placeholder: z.string().optional(),
                                                            enable: z.boolean().optional(),
                                                            disableSearch: z.boolean().optional(),
                                                            createSearchChoice: z
                                                                .boolean()
                                                                .optional(),
                                                            referenceName: z.string().optional(),
                                                            endpointUrl: z.string().optional(),
                                                            allowList: z.string().optional(),
                                                            denyList: z.string().optional(),
                                                            labelField: z.string().optional(),
                                                            autoCompleteFields: z
                                                                .any()
                                                                .superRefine((x, ctx) => {
                                                                    const schemas = [
                                                                        z.array(
                                                                            z.object({
                                                                                label: z.string(),
                                                                                children: z.array(
                                                                                    z
                                                                                        .object({
                                                                                            value: z
                                                                                                .any()
                                                                                                .superRefine(
                                                                                                    (
                                                                                                        x,
                                                                                                        ctx
                                                                                                    ) => {
                                                                                                        const schemas =
                                                                                                            [
                                                                                                                z.number(),
                                                                                                                z
                                                                                                                    .string()
                                                                                                                    .max(
                                                                                                                        250
                                                                                                                    ),
                                                                                                                z.boolean(),
                                                                                                            ];
                                                                                                        const errors =
                                                                                                            schemas.reduce(
                                                                                                                (
                                                                                                                    errors: z.ZodError[],
                                                                                                                    schema
                                                                                                                ) =>
                                                                                                                    ((
                                                                                                                        result
                                                                                                                    ) =>
                                                                                                                        'error' in
                                                                                                                        result
                                                                                                                            ? [
                                                                                                                                  ...errors,
                                                                                                                                  result.error,
                                                                                                                              ]
                                                                                                                            : errors)(
                                                                                                                        schema.safeParse(
                                                                                                                            x
                                                                                                                        )
                                                                                                                    ),
                                                                                                                []
                                                                                                            );
                                                                                                        if (
                                                                                                            schemas.length -
                                                                                                                errors.length !==
                                                                                                            1
                                                                                                        ) {
                                                                                                            ctx.addIssue(
                                                                                                                {
                                                                                                                    path: ctx.path,
                                                                                                                    code: 'invalid_union',
                                                                                                                    unionErrors:
                                                                                                                        errors,
                                                                                                                    message:
                                                                                                                        'Invalid input: Should pass single schema',
                                                                                                                }
                                                                                                            );
                                                                                                        }
                                                                                                    }
                                                                                                )
                                                                                                .optional(),
                                                                                            label: z
                                                                                                .string()
                                                                                                .max(
                                                                                                    100
                                                                                                ),
                                                                                        })
                                                                                        .catchall(
                                                                                            z.never()
                                                                                        )
                                                                                ),
                                                                            })
                                                                        ),
                                                                        z.array(
                                                                            z
                                                                                .object({
                                                                                    value: z
                                                                                        .any()
                                                                                        .superRefine(
                                                                                            (
                                                                                                x,
                                                                                                ctx
                                                                                            ) => {
                                                                                                const schemas =
                                                                                                    [
                                                                                                        z.number(),
                                                                                                        z
                                                                                                            .string()
                                                                                                            .max(
                                                                                                                250
                                                                                                            ),
                                                                                                        z.boolean(),
                                                                                                    ];
                                                                                                const errors =
                                                                                                    schemas.reduce(
                                                                                                        (
                                                                                                            errors: z.ZodError[],
                                                                                                            schema
                                                                                                        ) =>
                                                                                                            ((
                                                                                                                result
                                                                                                            ) =>
                                                                                                                'error' in
                                                                                                                result
                                                                                                                    ? [
                                                                                                                          ...errors,
                                                                                                                          result.error,
                                                                                                                      ]
                                                                                                                    : errors)(
                                                                                                                schema.safeParse(
                                                                                                                    x
                                                                                                                )
                                                                                                            ),
                                                                                                        []
                                                                                                    );
                                                                                                if (
                                                                                                    schemas.length -
                                                                                                        errors.length !==
                                                                                                    1
                                                                                                ) {
                                                                                                    ctx.addIssue(
                                                                                                        {
                                                                                                            path: ctx.path,
                                                                                                            code: 'invalid_union',
                                                                                                            unionErrors:
                                                                                                                errors,
                                                                                                            message:
                                                                                                                'Invalid input: Should pass single schema',
                                                                                                        }
                                                                                                    );
                                                                                                }
                                                                                            }
                                                                                        )
                                                                                        .optional(),
                                                                                    label: z
                                                                                        .string()
                                                                                        .max(100),
                                                                                })
                                                                                .catchall(z.never())
                                                                        ),
                                                                    ];
                                                                    const errors = schemas.reduce(
                                                                        (
                                                                            errors: z.ZodError[],
                                                                            schema
                                                                        ) =>
                                                                            ((result) =>
                                                                                'error' in result
                                                                                    ? [
                                                                                          ...errors,
                                                                                          result.error,
                                                                                      ]
                                                                                    : errors)(
                                                                                schema.safeParse(x)
                                                                            ),
                                                                        []
                                                                    );
                                                                    if (
                                                                        schemas.length -
                                                                            errors.length !==
                                                                        1
                                                                    ) {
                                                                        ctx.addIssue({
                                                                            path: ctx.path,
                                                                            code: 'invalid_union',
                                                                            unionErrors: errors,
                                                                            message:
                                                                                'Invalid input: Should pass single schema',
                                                                        });
                                                                    }
                                                                })
                                                                .optional(),
                                                            dependencies: z
                                                                .array(z.string())
                                                                .optional(),
                                                            items: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            value: z
                                                                                .any()
                                                                                .superRefine(
                                                                                    (x, ctx) => {
                                                                                        const schemas =
                                                                                            [
                                                                                                z.number(),
                                                                                                z
                                                                                                    .string()
                                                                                                    .max(
                                                                                                        250
                                                                                                    ),
                                                                                                z.boolean(),
                                                                                            ];
                                                                                        const errors =
                                                                                            schemas.reduce(
                                                                                                (
                                                                                                    errors: z.ZodError[],
                                                                                                    schema
                                                                                                ) =>
                                                                                                    ((
                                                                                                        result
                                                                                                    ) =>
                                                                                                        'error' in
                                                                                                        result
                                                                                                            ? [
                                                                                                                  ...errors,
                                                                                                                  result.error,
                                                                                                              ]
                                                                                                            : errors)(
                                                                                                        schema.safeParse(
                                                                                                            x
                                                                                                        )
                                                                                                    ),
                                                                                                []
                                                                                            );
                                                                                        if (
                                                                                            schemas.length -
                                                                                                errors.length !==
                                                                                            1
                                                                                        ) {
                                                                                            ctx.addIssue(
                                                                                                {
                                                                                                    path: ctx.path,
                                                                                                    code: 'invalid_union',
                                                                                                    unionErrors:
                                                                                                        errors,
                                                                                                    message:
                                                                                                        'Invalid input: Should pass single schema',
                                                                                                }
                                                                                            );
                                                                                        }
                                                                                    }
                                                                                )
                                                                                .optional(),
                                                                            label: z
                                                                                .string()
                                                                                .max(100),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                        })
                                                        .catchall(z.never()),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('multipleSelect'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z.string().optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('email'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('ipv4'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('url'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('date'),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .min(1)
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            placeholder: z.string().optional(),
                                                            enable: z.boolean().optional(),
                                                            disableSearch: z.boolean().optional(),
                                                            createSearchChoice: z
                                                                .boolean()
                                                                .optional(),
                                                            referenceName: z.string().optional(),
                                                            endpointUrl: z.string().optional(),
                                                            allowList: z.string().optional(),
                                                            denyList: z.string().optional(),
                                                            labelField: z.string().optional(),
                                                            autoCompleteFields: z
                                                                .any()
                                                                .superRefine((x, ctx) => {
                                                                    const schemas = [
                                                                        z.array(
                                                                            z.object({
                                                                                label: z.string(),
                                                                                children: z.array(
                                                                                    z
                                                                                        .object({
                                                                                            value: z
                                                                                                .any()
                                                                                                .superRefine(
                                                                                                    (
                                                                                                        x,
                                                                                                        ctx
                                                                                                    ) => {
                                                                                                        const schemas =
                                                                                                            [
                                                                                                                z.number(),
                                                                                                                z
                                                                                                                    .string()
                                                                                                                    .max(
                                                                                                                        250
                                                                                                                    ),
                                                                                                                z.boolean(),
                                                                                                            ];
                                                                                                        const errors =
                                                                                                            schemas.reduce(
                                                                                                                (
                                                                                                                    errors: z.ZodError[],
                                                                                                                    schema
                                                                                                                ) =>
                                                                                                                    ((
                                                                                                                        result
                                                                                                                    ) =>
                                                                                                                        'error' in
                                                                                                                        result
                                                                                                                            ? [
                                                                                                                                  ...errors,
                                                                                                                                  result.error,
                                                                                                                              ]
                                                                                                                            : errors)(
                                                                                                                        schema.safeParse(
                                                                                                                            x
                                                                                                                        )
                                                                                                                    ),
                                                                                                                []
                                                                                                            );
                                                                                                        if (
                                                                                                            schemas.length -
                                                                                                                errors.length !==
                                                                                                            1
                                                                                                        ) {
                                                                                                            ctx.addIssue(
                                                                                                                {
                                                                                                                    path: ctx.path,
                                                                                                                    code: 'invalid_union',
                                                                                                                    unionErrors:
                                                                                                                        errors,
                                                                                                                    message:
                                                                                                                        'Invalid input: Should pass single schema',
                                                                                                                }
                                                                                                            );
                                                                                                        }
                                                                                                    }
                                                                                                )
                                                                                                .optional(),
                                                                                            label: z
                                                                                                .string()
                                                                                                .max(
                                                                                                    100
                                                                                                ),
                                                                                        })
                                                                                        .catchall(
                                                                                            z.never()
                                                                                        )
                                                                                ),
                                                                            })
                                                                        ),
                                                                        z.array(
                                                                            z
                                                                                .object({
                                                                                    value: z
                                                                                        .any()
                                                                                        .superRefine(
                                                                                            (
                                                                                                x,
                                                                                                ctx
                                                                                            ) => {
                                                                                                const schemas =
                                                                                                    [
                                                                                                        z.number(),
                                                                                                        z
                                                                                                            .string()
                                                                                                            .max(
                                                                                                                250
                                                                                                            ),
                                                                                                        z.boolean(),
                                                                                                    ];
                                                                                                const errors =
                                                                                                    schemas.reduce(
                                                                                                        (
                                                                                                            errors: z.ZodError[],
                                                                                                            schema
                                                                                                        ) =>
                                                                                                            ((
                                                                                                                result
                                                                                                            ) =>
                                                                                                                'error' in
                                                                                                                result
                                                                                                                    ? [
                                                                                                                          ...errors,
                                                                                                                          result.error,
                                                                                                                      ]
                                                                                                                    : errors)(
                                                                                                                schema.safeParse(
                                                                                                                    x
                                                                                                                )
                                                                                                            ),
                                                                                                        []
                                                                                                    );
                                                                                                if (
                                                                                                    schemas.length -
                                                                                                        errors.length !==
                                                                                                    1
                                                                                                ) {
                                                                                                    ctx.addIssue(
                                                                                                        {
                                                                                                            path: ctx.path,
                                                                                                            code: 'invalid_union',
                                                                                                            unionErrors:
                                                                                                                errors,
                                                                                                            message:
                                                                                                                'Invalid input: Should pass single schema',
                                                                                                        }
                                                                                                    );
                                                                                                }
                                                                                            }
                                                                                        )
                                                                                        .optional(),
                                                                                    label: z
                                                                                        .string()
                                                                                        .max(100),
                                                                                })
                                                                                .catchall(z.never())
                                                                        ),
                                                                    ];
                                                                    const errors = schemas.reduce(
                                                                        (
                                                                            errors: z.ZodError[],
                                                                            schema
                                                                        ) =>
                                                                            ((result) =>
                                                                                'error' in result
                                                                                    ? [
                                                                                          ...errors,
                                                                                          result.error,
                                                                                      ]
                                                                                    : errors)(
                                                                                schema.safeParse(x)
                                                                            ),
                                                                        []
                                                                    );
                                                                    if (
                                                                        schemas.length -
                                                                            errors.length !==
                                                                        1
                                                                    ) {
                                                                        ctx.addIssue({
                                                                            path: ctx.path,
                                                                            code: 'invalid_union',
                                                                            unionErrors: errors,
                                                                            message:
                                                                                'Invalid input: Should pass single schema',
                                                                        });
                                                                    }
                                                                })
                                                                .optional(),
                                                            dependencies: z
                                                                .array(z.string())
                                                                .optional(),
                                                            items: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            value: z
                                                                                .any()
                                                                                .superRefine(
                                                                                    (x, ctx) => {
                                                                                        const schemas =
                                                                                            [
                                                                                                z.number(),
                                                                                                z
                                                                                                    .string()
                                                                                                    .max(
                                                                                                        250
                                                                                                    ),
                                                                                                z.boolean(),
                                                                                            ];
                                                                                        const errors =
                                                                                            schemas.reduce(
                                                                                                (
                                                                                                    errors: z.ZodError[],
                                                                                                    schema
                                                                                                ) =>
                                                                                                    ((
                                                                                                        result
                                                                                                    ) =>
                                                                                                        'error' in
                                                                                                        result
                                                                                                            ? [
                                                                                                                  ...errors,
                                                                                                                  result.error,
                                                                                                              ]
                                                                                                            : errors)(
                                                                                                        schema.safeParse(
                                                                                                            x
                                                                                                        )
                                                                                                    ),
                                                                                                []
                                                                                            );
                                                                                        if (
                                                                                            schemas.length -
                                                                                                errors.length !==
                                                                                            1
                                                                                        ) {
                                                                                            ctx.addIssue(
                                                                                                {
                                                                                                    path: ctx.path,
                                                                                                    code: 'invalid_union',
                                                                                                    unionErrors:
                                                                                                        errors,
                                                                                                    message:
                                                                                                        'Invalid input: Should pass single schema',
                                                                                                }
                                                                                            );
                                                                                        }
                                                                                    }
                                                                                )
                                                                                .optional(),
                                                                            label: z
                                                                                .string()
                                                                                .max(100),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                            delimiter: z.string().max(1).optional(),
                                                        })
                                                        .catchall(z.never()),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('checkbox'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z
                                                        .union([z.boolean(), z.number()])
                                                        .optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            enable: z.boolean().optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('radio'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z.string().optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            enable: z.boolean().optional(),
                                                            items: z.array(
                                                                z
                                                                    .object({
                                                                        value: z
                                                                            .any()
                                                                            .superRefine(
                                                                                (x, ctx) => {
                                                                                    const schemas =
                                                                                        [
                                                                                            z.number(),
                                                                                            z
                                                                                                .string()
                                                                                                .max(
                                                                                                    250
                                                                                                ),
                                                                                            z.boolean(),
                                                                                        ];
                                                                                    const errors =
                                                                                        schemas.reduce(
                                                                                            (
                                                                                                errors: z.ZodError[],
                                                                                                schema
                                                                                            ) =>
                                                                                                ((
                                                                                                    result
                                                                                                ) =>
                                                                                                    'error' in
                                                                                                    result
                                                                                                        ? [
                                                                                                              ...errors,
                                                                                                              result.error,
                                                                                                          ]
                                                                                                        : errors)(
                                                                                                    schema.safeParse(
                                                                                                        x
                                                                                                    )
                                                                                                ),
                                                                                            []
                                                                                        );
                                                                                    if (
                                                                                        schemas.length -
                                                                                            errors.length !==
                                                                                        1
                                                                                    ) {
                                                                                        ctx.addIssue(
                                                                                            {
                                                                                                path: ctx.path,
                                                                                                code: 'invalid_union',
                                                                                                unionErrors:
                                                                                                    errors,
                                                                                                message:
                                                                                                    'Invalid input: Should pass single schema',
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                }
                                                                            )
                                                                            .optional(),
                                                                        label: z.string().max(100),
                                                                    })
                                                                    .catchall(z.never())
                                                            ),
                                                        })
                                                        .catchall(z.never()),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('helpLink'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string().optional(),
                                                    options: z
                                                        .object({
                                                            text: z.string(),
                                                            link: z.string(),
                                                        })
                                                        .catchall(z.never()),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('file'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z.string().optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            enable: z.boolean().optional(),
                                                            maxFileSize: z.number().optional(),
                                                            fileSupportMessage: z
                                                                .string()
                                                                .optional(),
                                                            supportedFileTypes: z
                                                                .array(z.string())
                                                                .optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('oauth'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            enable: z.boolean().optional(),
                                                            auth_type: z.array(
                                                                z.union([
                                                                    z.literal('basic'),
                                                                    z.literal('oauth'),
                                                                ])
                                                            ),
                                                            basic: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            oauth_field: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            label: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            field: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            help: z
                                                                                .string()
                                                                                .max(200)
                                                                                .optional(),
                                                                            encrypted: z
                                                                                .boolean()
                                                                                .optional(),
                                                                            required: z
                                                                                .boolean()
                                                                                .optional(),
                                                                            options: z
                                                                                .object({
                                                                                    placeholder: z
                                                                                        .string()
                                                                                        .max(250)
                                                                                        .optional(),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                            oauth: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            oauth_field: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            label: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            field: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            help: z
                                                                                .string()
                                                                                .max(200)
                                                                                .optional(),
                                                                            encrypted: z
                                                                                .boolean()
                                                                                .optional(),
                                                                            required: z
                                                                                .boolean()
                                                                                .optional(),
                                                                            options: z
                                                                                .object({
                                                                                    placeholder: z
                                                                                        .string()
                                                                                        .max(250)
                                                                                        .optional(),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                            auth_label: z
                                                                .string()
                                                                .max(250)
                                                                .optional(),
                                                            oauth_popup_width: z
                                                                .number()
                                                                .optional(),
                                                            oauth_popup_height: z
                                                                .number()
                                                                .optional(),
                                                            oauth_timeout: z.number().optional(),
                                                            auth_code_endpoint: z
                                                                .string()
                                                                .max(350)
                                                                .optional(),
                                                            access_token_endpoint: z
                                                                .string()
                                                                .max(350)
                                                                .optional(),
                                                            oauth_state_enabled: z
                                                                .boolean()
                                                                .optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .and(z.intersection(z.any(), z.any())),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('custom'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    defaultValue: z
                                                        .any()
                                                        .superRefine((x, ctx) => {
                                                            const schemas = [
                                                                z.number(),
                                                                z.string(),
                                                                z.boolean(),
                                                            ];
                                                            const errors = schemas.reduce(
                                                                (errors: z.ZodError[], schema) =>
                                                                    ((result) =>
                                                                        'error' in result
                                                                            ? [
                                                                                  ...errors,
                                                                                  result.error,
                                                                              ]
                                                                            : errors)(
                                                                        schema.safeParse(x)
                                                                    ),
                                                                []
                                                            );
                                                            if (
                                                                schemas.length - errors.length !==
                                                                1
                                                            ) {
                                                                ctx.addIssue({
                                                                    path: ctx.path,
                                                                    code: 'invalid_union',
                                                                    unionErrors: errors,
                                                                    message:
                                                                        'Invalid input: Should pass single schema',
                                                                });
                                                            }
                                                        })
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            type: z.literal('external').optional(),
                                                            src: z.string().optional(),
                                                        })
                                                        .catchall(z.never()),
                                                })
                                                .catchall(z.never()),
                                        ])
                                    ),
                                    options: z
                                        .object({
                                            saveValidator: z.string().max(3000).optional(),
                                        })
                                        .catchall(z.never())
                                        .optional(),
                                    groups: z
                                        .array(
                                            z
                                                .object({
                                                    options: z
                                                        .object({
                                                            isExpandable: z.boolean().optional(),
                                                            expand: z.boolean().optional(),
                                                        })
                                                        .optional(),
                                                    label: z.string().max(100),
                                                    fields: z.array(
                                                        z.string().regex(new RegExp('^\\w+$'))
                                                    ),
                                                })
                                                .catchall(z.never())
                                        )
                                        .optional(),
                                    style: z.enum(['page', 'dialog']).optional(),
                                    hook: z.record(z.any()).optional(),
                                    conf: z.string().max(100).optional(),
                                    restHandlerName: z.string().max(100).optional(),
                                    restHandlerModule: z.string().max(100).optional(),
                                    restHandlerClass: z.string().max(100).optional(),
                                })
                            ),
                        })
                        .catchall(z.never()),
                    z
                        .object({
                            title: z.string().max(60),
                            services: z.array(
                                z.object({
                                    name: z
                                        .string()
                                        .regex(new RegExp('^[0-9a-zA-Z][0-9a-zA-Z_-]*$'))
                                        .max(50),
                                    title: z.string().max(100),
                                    subTitle: z.string().max(50).optional(),
                                    description: z.string().max(200).optional(),
                                    table: z
                                        .object({
                                            moreInfo: z
                                                .array(
                                                    z.object({
                                                        field: z
                                                            .string()
                                                            .regex(new RegExp('^\\w+$')),
                                                        label: z.string().max(30),
                                                        mapping: z.record(z.any()).optional(),
                                                    })
                                                )
                                                .optional(),
                                            header: z.array(
                                                z.object({
                                                    field: z.string().regex(new RegExp('^\\w+$')),
                                                    label: z.string().max(30),
                                                    mapping: z.record(z.any()).optional(),
                                                    customCell: z.record(z.any()).optional(),
                                                })
                                            ),
                                            customRow: z.record(z.any()).optional(),
                                            actions: z.array(
                                                z.enum(['edit', 'delete', 'clone', 'enable'])
                                            ),
                                        })
                                        .catchall(z.never()),
                                    entity: z.array(
                                        z.union([
                                            z
                                                .object({
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string().max(30),
                                                    type: z.literal('checkboxGroup'),
                                                    options: z
                                                        .object({
                                                            groups: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            label: z
                                                                                .string()
                                                                                .max(30),
                                                                            options: z
                                                                                .object({
                                                                                    isExpandable: z
                                                                                        .boolean()
                                                                                        .default(
                                                                                            false
                                                                                        ),
                                                                                    expand: z
                                                                                        .boolean()
                                                                                        .default(
                                                                                            false
                                                                                        ),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                            fields: z
                                                                                .array(z.string())
                                                                                .min(1),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                            rows: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            field: z.string(),
                                                                            checkbox: z
                                                                                .object({
                                                                                    label: z
                                                                                        .string()
                                                                                        .max(30)
                                                                                        .optional(),
                                                                                    defaultValue: z
                                                                                        .boolean()
                                                                                        .optional(),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                            input: z
                                                                                .object({
                                                                                    defaultValue: z
                                                                                        .number()
                                                                                        .optional(),
                                                                                    required: z
                                                                                        .boolean()
                                                                                        .default(
                                                                                            false
                                                                                        ),
                                                                                    validators: z
                                                                                        .array(
                                                                                            z
                                                                                                .object(
                                                                                                    {
                                                                                                        errorMsg:
                                                                                                            z
                                                                                                                .string()
                                                                                                                .max(
                                                                                                                    400
                                                                                                                )
                                                                                                                .optional(),
                                                                                                        type: z.literal(
                                                                                                            'number'
                                                                                                        ),
                                                                                                        range: z.array(
                                                                                                            z.number()
                                                                                                        ),
                                                                                                    }
                                                                                                )
                                                                                                .catchall(
                                                                                                    z.never()
                                                                                                )
                                                                                        )
                                                                                        .optional(),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .min(1),
                                                        })
                                                        .catchall(z.never()),
                                                    validators: z
                                                        .array(
                                                            z
                                                                .object({
                                                                    errorMsg: z
                                                                        .string()
                                                                        .max(400)
                                                                        .optional(),
                                                                    type: z.literal('regex'),
                                                                    pattern: z.string(),
                                                                })
                                                                .catchall(z.never())
                                                        )
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('text'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z
                                                        .union([z.string(), z.number()])
                                                        .optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('number'),
                                                                        range: z.array(z.number()),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('email'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('ipv4'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('url'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('date'),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .min(1)
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            placeholder: z.string().optional(),
                                                            enable: z.boolean().optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('textarea'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z.string().optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('email'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('ipv4'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('url'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('date'),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .min(1)
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            placeholder: z.string().optional(),
                                                            enable: z.boolean().optional(),
                                                            rowsMin: z.number().optional(),
                                                            rowsMax: z.number().optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('singleSelect'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z
                                                        .union([z.string(), z.number()])
                                                        .optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('email'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('ipv4'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('url'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('date'),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .min(1)
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            placeholder: z.string().optional(),
                                                            enable: z.boolean().optional(),
                                                            disableSearch: z.boolean().optional(),
                                                            createSearchChoice: z
                                                                .boolean()
                                                                .optional(),
                                                            referenceName: z.string().optional(),
                                                            endpointUrl: z.string().optional(),
                                                            allowList: z.string().optional(),
                                                            denyList: z.string().optional(),
                                                            labelField: z.string().optional(),
                                                            autoCompleteFields: z
                                                                .any()
                                                                .superRefine((x, ctx) => {
                                                                    const schemas = [
                                                                        z.array(
                                                                            z.object({
                                                                                label: z.string(),
                                                                                children: z.array(
                                                                                    z
                                                                                        .object({
                                                                                            value: z
                                                                                                .any()
                                                                                                .superRefine(
                                                                                                    (
                                                                                                        x,
                                                                                                        ctx
                                                                                                    ) => {
                                                                                                        const schemas =
                                                                                                            [
                                                                                                                z.number(),
                                                                                                                z
                                                                                                                    .string()
                                                                                                                    .max(
                                                                                                                        250
                                                                                                                    ),
                                                                                                                z.boolean(),
                                                                                                            ];
                                                                                                        const errors =
                                                                                                            schemas.reduce(
                                                                                                                (
                                                                                                                    errors: z.ZodError[],
                                                                                                                    schema
                                                                                                                ) =>
                                                                                                                    ((
                                                                                                                        result
                                                                                                                    ) =>
                                                                                                                        'error' in
                                                                                                                        result
                                                                                                                            ? [
                                                                                                                                  ...errors,
                                                                                                                                  result.error,
                                                                                                                              ]
                                                                                                                            : errors)(
                                                                                                                        schema.safeParse(
                                                                                                                            x
                                                                                                                        )
                                                                                                                    ),
                                                                                                                []
                                                                                                            );
                                                                                                        if (
                                                                                                            schemas.length -
                                                                                                                errors.length !==
                                                                                                            1
                                                                                                        ) {
                                                                                                            ctx.addIssue(
                                                                                                                {
                                                                                                                    path: ctx.path,
                                                                                                                    code: 'invalid_union',
                                                                                                                    unionErrors:
                                                                                                                        errors,
                                                                                                                    message:
                                                                                                                        'Invalid input: Should pass single schema',
                                                                                                                }
                                                                                                            );
                                                                                                        }
                                                                                                    }
                                                                                                )
                                                                                                .optional(),
                                                                                            label: z
                                                                                                .string()
                                                                                                .max(
                                                                                                    100
                                                                                                ),
                                                                                        })
                                                                                        .catchall(
                                                                                            z.never()
                                                                                        )
                                                                                ),
                                                                            })
                                                                        ),
                                                                        z.array(
                                                                            z
                                                                                .object({
                                                                                    value: z
                                                                                        .any()
                                                                                        .superRefine(
                                                                                            (
                                                                                                x,
                                                                                                ctx
                                                                                            ) => {
                                                                                                const schemas =
                                                                                                    [
                                                                                                        z.number(),
                                                                                                        z
                                                                                                            .string()
                                                                                                            .max(
                                                                                                                250
                                                                                                            ),
                                                                                                        z.boolean(),
                                                                                                    ];
                                                                                                const errors =
                                                                                                    schemas.reduce(
                                                                                                        (
                                                                                                            errors: z.ZodError[],
                                                                                                            schema
                                                                                                        ) =>
                                                                                                            ((
                                                                                                                result
                                                                                                            ) =>
                                                                                                                'error' in
                                                                                                                result
                                                                                                                    ? [
                                                                                                                          ...errors,
                                                                                                                          result.error,
                                                                                                                      ]
                                                                                                                    : errors)(
                                                                                                                schema.safeParse(
                                                                                                                    x
                                                                                                                )
                                                                                                            ),
                                                                                                        []
                                                                                                    );
                                                                                                if (
                                                                                                    schemas.length -
                                                                                                        errors.length !==
                                                                                                    1
                                                                                                ) {
                                                                                                    ctx.addIssue(
                                                                                                        {
                                                                                                            path: ctx.path,
                                                                                                            code: 'invalid_union',
                                                                                                            unionErrors:
                                                                                                                errors,
                                                                                                            message:
                                                                                                                'Invalid input: Should pass single schema',
                                                                                                        }
                                                                                                    );
                                                                                                }
                                                                                            }
                                                                                        )
                                                                                        .optional(),
                                                                                    label: z
                                                                                        .string()
                                                                                        .max(100),
                                                                                })
                                                                                .catchall(z.never())
                                                                        ),
                                                                    ];
                                                                    const errors = schemas.reduce(
                                                                        (
                                                                            errors: z.ZodError[],
                                                                            schema
                                                                        ) =>
                                                                            ((result) =>
                                                                                'error' in result
                                                                                    ? [
                                                                                          ...errors,
                                                                                          result.error,
                                                                                      ]
                                                                                    : errors)(
                                                                                schema.safeParse(x)
                                                                            ),
                                                                        []
                                                                    );
                                                                    if (
                                                                        schemas.length -
                                                                            errors.length !==
                                                                        1
                                                                    ) {
                                                                        ctx.addIssue({
                                                                            path: ctx.path,
                                                                            code: 'invalid_union',
                                                                            unionErrors: errors,
                                                                            message:
                                                                                'Invalid input: Should pass single schema',
                                                                        });
                                                                    }
                                                                })
                                                                .optional(),
                                                            dependencies: z
                                                                .array(z.string())
                                                                .optional(),
                                                            items: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            value: z
                                                                                .any()
                                                                                .superRefine(
                                                                                    (x, ctx) => {
                                                                                        const schemas =
                                                                                            [
                                                                                                z.number(),
                                                                                                z
                                                                                                    .string()
                                                                                                    .max(
                                                                                                        250
                                                                                                    ),
                                                                                                z.boolean(),
                                                                                            ];
                                                                                        const errors =
                                                                                            schemas.reduce(
                                                                                                (
                                                                                                    errors: z.ZodError[],
                                                                                                    schema
                                                                                                ) =>
                                                                                                    ((
                                                                                                        result
                                                                                                    ) =>
                                                                                                        'error' in
                                                                                                        result
                                                                                                            ? [
                                                                                                                  ...errors,
                                                                                                                  result.error,
                                                                                                              ]
                                                                                                            : errors)(
                                                                                                        schema.safeParse(
                                                                                                            x
                                                                                                        )
                                                                                                    ),
                                                                                                []
                                                                                            );
                                                                                        if (
                                                                                            schemas.length -
                                                                                                errors.length !==
                                                                                            1
                                                                                        ) {
                                                                                            ctx.addIssue(
                                                                                                {
                                                                                                    path: ctx.path,
                                                                                                    code: 'invalid_union',
                                                                                                    unionErrors:
                                                                                                        errors,
                                                                                                    message:
                                                                                                        'Invalid input: Should pass single schema',
                                                                                                }
                                                                                            );
                                                                                        }
                                                                                    }
                                                                                )
                                                                                .optional(),
                                                                            label: z
                                                                                .string()
                                                                                .max(100),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                        })
                                                        .catchall(z.never()),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('multipleSelect'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z.string().optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('email'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('ipv4'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('url'),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('date'),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .min(1)
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            placeholder: z.string().optional(),
                                                            enable: z.boolean().optional(),
                                                            disableSearch: z.boolean().optional(),
                                                            createSearchChoice: z
                                                                .boolean()
                                                                .optional(),
                                                            referenceName: z.string().optional(),
                                                            endpointUrl: z.string().optional(),
                                                            allowList: z.string().optional(),
                                                            denyList: z.string().optional(),
                                                            labelField: z.string().optional(),
                                                            autoCompleteFields: z
                                                                .any()
                                                                .superRefine((x, ctx) => {
                                                                    const schemas = [
                                                                        z.array(
                                                                            z.object({
                                                                                label: z.string(),
                                                                                children: z.array(
                                                                                    z
                                                                                        .object({
                                                                                            value: z
                                                                                                .any()
                                                                                                .superRefine(
                                                                                                    (
                                                                                                        x,
                                                                                                        ctx
                                                                                                    ) => {
                                                                                                        const schemas =
                                                                                                            [
                                                                                                                z.number(),
                                                                                                                z
                                                                                                                    .string()
                                                                                                                    .max(
                                                                                                                        250
                                                                                                                    ),
                                                                                                                z.boolean(),
                                                                                                            ];
                                                                                                        const errors =
                                                                                                            schemas.reduce(
                                                                                                                (
                                                                                                                    errors: z.ZodError[],
                                                                                                                    schema
                                                                                                                ) =>
                                                                                                                    ((
                                                                                                                        result
                                                                                                                    ) =>
                                                                                                                        'error' in
                                                                                                                        result
                                                                                                                            ? [
                                                                                                                                  ...errors,
                                                                                                                                  result.error,
                                                                                                                              ]
                                                                                                                            : errors)(
                                                                                                                        schema.safeParse(
                                                                                                                            x
                                                                                                                        )
                                                                                                                    ),
                                                                                                                []
                                                                                                            );
                                                                                                        if (
                                                                                                            schemas.length -
                                                                                                                errors.length !==
                                                                                                            1
                                                                                                        ) {
                                                                                                            ctx.addIssue(
                                                                                                                {
                                                                                                                    path: ctx.path,
                                                                                                                    code: 'invalid_union',
                                                                                                                    unionErrors:
                                                                                                                        errors,
                                                                                                                    message:
                                                                                                                        'Invalid input: Should pass single schema',
                                                                                                                }
                                                                                                            );
                                                                                                        }
                                                                                                    }
                                                                                                )
                                                                                                .optional(),
                                                                                            label: z
                                                                                                .string()
                                                                                                .max(
                                                                                                    100
                                                                                                ),
                                                                                        })
                                                                                        .catchall(
                                                                                            z.never()
                                                                                        )
                                                                                ),
                                                                            })
                                                                        ),
                                                                        z.array(
                                                                            z
                                                                                .object({
                                                                                    value: z
                                                                                        .any()
                                                                                        .superRefine(
                                                                                            (
                                                                                                x,
                                                                                                ctx
                                                                                            ) => {
                                                                                                const schemas =
                                                                                                    [
                                                                                                        z.number(),
                                                                                                        z
                                                                                                            .string()
                                                                                                            .max(
                                                                                                                250
                                                                                                            ),
                                                                                                        z.boolean(),
                                                                                                    ];
                                                                                                const errors =
                                                                                                    schemas.reduce(
                                                                                                        (
                                                                                                            errors: z.ZodError[],
                                                                                                            schema
                                                                                                        ) =>
                                                                                                            ((
                                                                                                                result
                                                                                                            ) =>
                                                                                                                'error' in
                                                                                                                result
                                                                                                                    ? [
                                                                                                                          ...errors,
                                                                                                                          result.error,
                                                                                                                      ]
                                                                                                                    : errors)(
                                                                                                                schema.safeParse(
                                                                                                                    x
                                                                                                                )
                                                                                                            ),
                                                                                                        []
                                                                                                    );
                                                                                                if (
                                                                                                    schemas.length -
                                                                                                        errors.length !==
                                                                                                    1
                                                                                                ) {
                                                                                                    ctx.addIssue(
                                                                                                        {
                                                                                                            path: ctx.path,
                                                                                                            code: 'invalid_union',
                                                                                                            unionErrors:
                                                                                                                errors,
                                                                                                            message:
                                                                                                                'Invalid input: Should pass single schema',
                                                                                                        }
                                                                                                    );
                                                                                                }
                                                                                            }
                                                                                        )
                                                                                        .optional(),
                                                                                    label: z
                                                                                        .string()
                                                                                        .max(100),
                                                                                })
                                                                                .catchall(z.never())
                                                                        ),
                                                                    ];
                                                                    const errors = schemas.reduce(
                                                                        (
                                                                            errors: z.ZodError[],
                                                                            schema
                                                                        ) =>
                                                                            ((result) =>
                                                                                'error' in result
                                                                                    ? [
                                                                                          ...errors,
                                                                                          result.error,
                                                                                      ]
                                                                                    : errors)(
                                                                                schema.safeParse(x)
                                                                            ),
                                                                        []
                                                                    );
                                                                    if (
                                                                        schemas.length -
                                                                            errors.length !==
                                                                        1
                                                                    ) {
                                                                        ctx.addIssue({
                                                                            path: ctx.path,
                                                                            code: 'invalid_union',
                                                                            unionErrors: errors,
                                                                            message:
                                                                                'Invalid input: Should pass single schema',
                                                                        });
                                                                    }
                                                                })
                                                                .optional(),
                                                            dependencies: z
                                                                .array(z.string())
                                                                .optional(),
                                                            items: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            value: z
                                                                                .any()
                                                                                .superRefine(
                                                                                    (x, ctx) => {
                                                                                        const schemas =
                                                                                            [
                                                                                                z.number(),
                                                                                                z
                                                                                                    .string()
                                                                                                    .max(
                                                                                                        250
                                                                                                    ),
                                                                                                z.boolean(),
                                                                                            ];
                                                                                        const errors =
                                                                                            schemas.reduce(
                                                                                                (
                                                                                                    errors: z.ZodError[],
                                                                                                    schema
                                                                                                ) =>
                                                                                                    ((
                                                                                                        result
                                                                                                    ) =>
                                                                                                        'error' in
                                                                                                        result
                                                                                                            ? [
                                                                                                                  ...errors,
                                                                                                                  result.error,
                                                                                                              ]
                                                                                                            : errors)(
                                                                                                        schema.safeParse(
                                                                                                            x
                                                                                                        )
                                                                                                    ),
                                                                                                []
                                                                                            );
                                                                                        if (
                                                                                            schemas.length -
                                                                                                errors.length !==
                                                                                            1
                                                                                        ) {
                                                                                            ctx.addIssue(
                                                                                                {
                                                                                                    path: ctx.path,
                                                                                                    code: 'invalid_union',
                                                                                                    unionErrors:
                                                                                                        errors,
                                                                                                    message:
                                                                                                        'Invalid input: Should pass single schema',
                                                                                                }
                                                                                            );
                                                                                        }
                                                                                    }
                                                                                )
                                                                                .optional(),
                                                                            label: z
                                                                                .string()
                                                                                .max(100),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                            delimiter: z.string().max(1).optional(),
                                                        })
                                                        .catchall(z.never()),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('checkbox'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z
                                                        .union([z.boolean(), z.number()])
                                                        .optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            enable: z.boolean().optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('radio'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z.string().optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            enable: z.boolean().optional(),
                                                            items: z.array(
                                                                z
                                                                    .object({
                                                                        value: z
                                                                            .any()
                                                                            .superRefine(
                                                                                (x, ctx) => {
                                                                                    const schemas =
                                                                                        [
                                                                                            z.number(),
                                                                                            z
                                                                                                .string()
                                                                                                .max(
                                                                                                    250
                                                                                                ),
                                                                                            z.boolean(),
                                                                                        ];
                                                                                    const errors =
                                                                                        schemas.reduce(
                                                                                            (
                                                                                                errors: z.ZodError[],
                                                                                                schema
                                                                                            ) =>
                                                                                                ((
                                                                                                    result
                                                                                                ) =>
                                                                                                    'error' in
                                                                                                    result
                                                                                                        ? [
                                                                                                              ...errors,
                                                                                                              result.error,
                                                                                                          ]
                                                                                                        : errors)(
                                                                                                    schema.safeParse(
                                                                                                        x
                                                                                                    )
                                                                                                ),
                                                                                            []
                                                                                        );
                                                                                    if (
                                                                                        schemas.length -
                                                                                            errors.length !==
                                                                                        1
                                                                                    ) {
                                                                                        ctx.addIssue(
                                                                                            {
                                                                                                path: ctx.path,
                                                                                                code: 'invalid_union',
                                                                                                unionErrors:
                                                                                                    errors,
                                                                                                message:
                                                                                                    'Invalid input: Should pass single schema',
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                }
                                                                            )
                                                                            .optional(),
                                                                        label: z.string().max(100),
                                                                    })
                                                                    .catchall(z.never())
                                                            ),
                                                        })
                                                        .catchall(z.never()),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('helpLink'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string().optional(),
                                                    options: z
                                                        .object({
                                                            text: z.string(),
                                                            link: z.string(),
                                                        })
                                                        .catchall(z.never()),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('file'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    defaultValue: z.string().optional(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    validators: z
                                                        .array(
                                                            z.union([
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('string'),
                                                                        minLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                        maxLength: z
                                                                            .number()
                                                                            .gte(0),
                                                                    })
                                                                    .catchall(z.never()),
                                                                z
                                                                    .object({
                                                                        errorMsg: z
                                                                            .string()
                                                                            .max(400)
                                                                            .optional(),
                                                                        type: z.literal('regex'),
                                                                        pattern: z.string(),
                                                                    })
                                                                    .catchall(z.never()),
                                                            ])
                                                        )
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            enable: z.boolean().optional(),
                                                            maxFileSize: z.number().optional(),
                                                            fileSupportMessage: z
                                                                .string()
                                                                .optional(),
                                                            supportedFileTypes: z
                                                                .array(z.string())
                                                                .optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .optional(),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('oauth'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    options: z
                                                        .object({
                                                            display: z.boolean().optional(),
                                                            disableonEdit: z.boolean().optional(),
                                                            enable: z.boolean().optional(),
                                                            auth_type: z.array(
                                                                z.union([
                                                                    z.literal('basic'),
                                                                    z.literal('oauth'),
                                                                ])
                                                            ),
                                                            basic: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            oauth_field: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            label: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            field: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            help: z
                                                                                .string()
                                                                                .max(200)
                                                                                .optional(),
                                                                            encrypted: z
                                                                                .boolean()
                                                                                .optional(),
                                                                            required: z
                                                                                .boolean()
                                                                                .optional(),
                                                                            options: z
                                                                                .object({
                                                                                    placeholder: z
                                                                                        .string()
                                                                                        .max(250)
                                                                                        .optional(),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                            oauth: z
                                                                .array(
                                                                    z
                                                                        .object({
                                                                            oauth_field: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            label: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            field: z
                                                                                .string()
                                                                                .max(100)
                                                                                .optional(),
                                                                            help: z
                                                                                .string()
                                                                                .max(200)
                                                                                .optional(),
                                                                            encrypted: z
                                                                                .boolean()
                                                                                .optional(),
                                                                            required: z
                                                                                .boolean()
                                                                                .optional(),
                                                                            options: z
                                                                                .object({
                                                                                    placeholder: z
                                                                                        .string()
                                                                                        .max(250)
                                                                                        .optional(),
                                                                                })
                                                                                .catchall(z.never())
                                                                                .optional(),
                                                                        })
                                                                        .catchall(z.never())
                                                                )
                                                                .optional(),
                                                            auth_label: z
                                                                .string()
                                                                .max(250)
                                                                .optional(),
                                                            oauth_popup_width: z
                                                                .number()
                                                                .optional(),
                                                            oauth_popup_height: z
                                                                .number()
                                                                .optional(),
                                                            oauth_timeout: z.number().optional(),
                                                            auth_code_endpoint: z
                                                                .string()
                                                                .max(350)
                                                                .optional(),
                                                            access_token_endpoint: z
                                                                .string()
                                                                .max(350)
                                                                .optional(),
                                                            oauth_state_enabled: z
                                                                .boolean()
                                                                .optional(),
                                                        })
                                                        .catchall(z.never())
                                                        .and(z.intersection(z.any(), z.any())),
                                                })
                                                .catchall(z.never()),
                                            z
                                                .object({
                                                    type: z.literal('custom'),
                                                    field: z
                                                        .string()
                                                        .regex(
                                                            new RegExp(
                                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                                            )
                                                        ),
                                                    label: z.string(),
                                                    help: z.string().optional(),
                                                    tooltip: z.string().optional(),
                                                    required: z.boolean().optional(),
                                                    encrypted: z.boolean().optional(),
                                                    defaultValue: z
                                                        .any()
                                                        .superRefine((x, ctx) => {
                                                            const schemas = [
                                                                z.number(),
                                                                z.string(),
                                                                z.boolean(),
                                                            ];
                                                            const errors = schemas.reduce(
                                                                (errors: z.ZodError[], schema) =>
                                                                    ((result) =>
                                                                        'error' in result
                                                                            ? [
                                                                                  ...errors,
                                                                                  result.error,
                                                                              ]
                                                                            : errors)(
                                                                        schema.safeParse(x)
                                                                    ),
                                                                []
                                                            );
                                                            if (
                                                                schemas.length - errors.length !==
                                                                1
                                                            ) {
                                                                ctx.addIssue({
                                                                    path: ctx.path,
                                                                    code: 'invalid_union',
                                                                    unionErrors: errors,
                                                                    message:
                                                                        'Invalid input: Should pass single schema',
                                                                });
                                                            }
                                                        })
                                                        .optional(),
                                                    options: z
                                                        .object({
                                                            type: z.literal('external').optional(),
                                                            src: z.string().optional(),
                                                        })
                                                        .catchall(z.never()),
                                                })
                                                .catchall(z.never()),
                                        ])
                                    ),
                                    options: z
                                        .object({
                                            saveValidator: z.string().max(3000).optional(),
                                        })
                                        .catchall(z.never())
                                        .optional(),
                                    groups: z
                                        .array(
                                            z
                                                .object({
                                                    options: z
                                                        .object({
                                                            isExpandable: z.boolean().optional(),
                                                            expand: z.boolean().optional(),
                                                        })
                                                        .optional(),
                                                    label: z.string().max(100),
                                                    fields: z.array(
                                                        z.string().regex(new RegExp('^\\w+$'))
                                                    ),
                                                })
                                                .catchall(z.never())
                                        )
                                        .optional(),
                                    style: z.enum(['page', 'dialog']).optional(),
                                    hook: z.record(z.any()).optional(),
                                    conf: z.string().max(100).optional(),
                                    restHandlerName: z.string().max(100).optional(),
                                    restHandlerModule: z.string().max(100).optional(),
                                    restHandlerClass: z.string().max(100).optional(),
                                })
                            ),
                        })
                        .catchall(z.never()),
                ];
                const errors = schemas.reduce(
                    (errors: z.ZodError[], schema) =>
                        ((result) => ('error' in result ? [...errors, result.error] : errors))(
                            schema.safeParse(x)
                        ),
                    []
                );
                if (schemas.length - errors.length !== 1) {
                    ctx.addIssue({
                        path: ctx.path,
                        code: 'invalid_union',
                        unionErrors: errors,
                        message: 'Invalid input: Should pass single schema',
                    });
                }
            })
            .optional(),
        dashboard: z
            .object({
                panels: z.array(z.object({ name: z.string().max(100) }).catchall(z.never())).min(1),
            })
            .catchall(z.never())
            .optional(),
    })
    .catchall(z.never());
