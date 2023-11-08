import { z } from 'zod';

export const alerts = z
    .array(
        z
            .object({
                name: z.string().regex(new RegExp('^[a-zA-Z0-9_]+$')).max(100),
                label: z.string().max(100),
                description: z.string(),
                activeResponse: z
                    .object({
                        task: z.array(z.string()).min(1),
                        supportsAdhoc: z.boolean(),
                        subject: z.array(z.string()).min(1),
                        category: z.array(z.string()).min(1),
                        technology: z
                            .array(
                                z
                                    .object({
                                        version: z
                                            .array(
                                                z.string().regex(new RegExp('^\\d+(?:\\.\\d+)*$'))
                                            )
                                            .min(1),
                                        product: z.string().max(100),
                                        vendor: z.string().max(100),
                                    })
                                    .catchall(z.never())
                            )
                            .min(1),
                        drilldownUri: z.string().optional(),
                        sourcetype: z
                            .string()
                            .regex(new RegExp('^[a-zA-Z0-9:-_]+$'))
                            .max(50)
                            .optional(),
                    })
                    .optional(),
                entity: z
                    .array(
                        z.union([
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
                                    defaultValue: z.union([z.string(), z.number()]).optional(),
                                    help: z.string().optional(),
                                    tooltip: z.string().optional(),
                                    required: z.boolean().optional(),
                                    encrypted: z.boolean().optional(),
                                    validators: z
                                        .array(
                                            z.union([
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('number'),
                                                        range: z.array(z.number()),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('string'),
                                                        minLength: z.number().gte(0),
                                                        maxLength: z.number().gte(0),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('regex'),
                                                        pattern: z.string(),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('email'),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('ipv4'),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('url'),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
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
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('string'),
                                                        minLength: z.number().gte(0),
                                                        maxLength: z.number().gte(0),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('regex'),
                                                        pattern: z.string(),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('email'),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('ipv4'),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('url'),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
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
                                    defaultValue: z.union([z.string(), z.number()]).optional(),
                                    help: z.string().optional(),
                                    tooltip: z.string().optional(),
                                    required: z.boolean().optional(),
                                    encrypted: z.boolean().optional(),
                                    validators: z
                                        .array(
                                            z.union([
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('string'),
                                                        minLength: z.number().gte(0),
                                                        maxLength: z.number().gte(0),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('regex'),
                                                        pattern: z.string(),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('email'),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('ipv4'),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
                                                        type: z.literal('url'),
                                                    })
                                                    .catchall(z.never()),
                                                z
                                                    .object({
                                                        errorMsg: z.string().max(400).optional(),
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
                                            createSearchChoice: z.boolean().optional(),
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
                                                                ),
                                                            })
                                                        ),
                                                        z.array(
                                                            z
                                                                .object({
                                                                    value: z
                                                                        .any()
                                                                        .superRefine((x, ctx) => {
                                                                            const schemas = [
                                                                                z.number(),
                                                                                z.string().max(250),
                                                                                z.boolean(),
                                                                            ];
                                                                            const errors =
                                                                                schemas.reduce(
                                                                                    (
                                                                                        errors: z.ZodError[],
                                                                                        schema
                                                                                    ) =>
                                                                                        ((result) =>
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
                                                                                ctx.addIssue({
                                                                                    path: ctx.path,
                                                                                    code: 'invalid_union',
                                                                                    unionErrors:
                                                                                        errors,
                                                                                    message:
                                                                                        'Invalid input: Should pass single schema',
                                                                                });
                                                                            }
                                                                        })
                                                                        .optional(),
                                                                    label: z.string().max(100),
                                                                })
                                                                .catchall(z.never())
                                                        ),
                                                    ];
                                                    const errors = schemas.reduce(
                                                        (errors: z.ZodError[], schema) =>
                                                            ((result) =>
                                                                'error' in result
                                                                    ? [...errors, result.error]
                                                                    : errors)(schema.safeParse(x)),
                                                        []
                                                    );
                                                    if (schemas.length - errors.length !== 1) {
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
                                            dependencies: z.array(z.string()).optional(),
                                            items: z
                                                .array(
                                                    z
                                                        .object({
                                                            value: z
                                                                .any()
                                                                .superRefine((x, ctx) => {
                                                                    const schemas = [
                                                                        z.number(),
                                                                        z.string().max(250),
                                                                        z.boolean(),
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
                                                            label: z.string().max(100),
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
                                    type: z.literal('checkbox'),
                                    field: z
                                        .string()
                                        .regex(
                                            new RegExp(
                                                '(?!^(?:persistentQueueSize|queueSize|start_by_shell|output_mode|output_field|owner|app|sharing)$)(?:^\\w+$)'
                                            )
                                        ),
                                    label: z.string(),
                                    defaultValue: z.union([z.boolean(), z.number()]).optional(),
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
                                                            .superRefine((x, ctx) => {
                                                                const schemas = [
                                                                    z.number(),
                                                                    z.string().max(250),
                                                                    z.boolean(),
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
                                    field: z.string().regex(new RegExp('^\\w+$')),
                                    label: z.string().max(30),
                                    type: z.literal('singleSelectSplunkSearch'),
                                    help: z.string().max(200).optional(),
                                    defaultValue: z
                                        .any()
                                        .superRefine((x, ctx) => {
                                            const schemas = [
                                                z.number(),
                                                z.string().max(250),
                                                z.boolean(),
                                            ];
                                            const errors = schemas.reduce(
                                                (errors: z.ZodError[], schema) =>
                                                    ((result) =>
                                                        'error' in result
                                                            ? [...errors, result.error]
                                                            : errors)(schema.safeParse(x)),
                                                []
                                            );
                                            if (schemas.length - errors.length !== 1) {
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
                                    required: z.boolean().optional(),
                                    search: z.string().max(200).optional(),
                                    valueField: z.string().max(200).optional(),
                                    labelField: z.string().max(200).optional(),
                                    options: z
                                        .object({
                                            items: z
                                                .array(
                                                    z
                                                        .object({
                                                            value: z
                                                                .any()
                                                                .superRefine((x, ctx) => {
                                                                    const schemas = [
                                                                        z.number(),
                                                                        z.string().max(250),
                                                                        z.boolean(),
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
                                                            label: z.string().max(100),
                                                        })
                                                        .catchall(z.never())
                                                )
                                                .optional(),
                                        })
                                        .optional(),
                                })
                                .catchall(z.never()),
                        ])
                    )
                    .optional(),
            })
            .catchall(z.never())
    )
    .min(1)
    .optional();
