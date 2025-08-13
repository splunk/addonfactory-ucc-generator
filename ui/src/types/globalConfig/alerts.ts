import { z } from 'zod';
import {
    CheckboxEntitySchema,
    RadioEntitySchema,
    SingleSelectEntitySchema,
    SingleSelectSplunkSearchEntitySchema,
    TextAreaEntitySchema,
    TextEntitySchema,
} from './entities';

export const alerts = z
    .array(
        z.object({
            name: z.string(),
            label: z.string(),
            description: z.string(),
            iconFileName: z.string().optional(),
            adaptiveResponse: z
                .object({
                    task: z.array(z.string()).min(1),
                    supportsAdhoc: z.boolean().default(false).optional(),
                    supportsCloud: z.boolean().default(true).optional(),
                    subject: z.array(z.string()).min(1),
                    category: z.array(z.string()).min(1),
                    technology: z
                        .array(
                            z.object({
                                version: z.array(z.string()).min(1),
                                product: z.string(),
                                vendor: z.string(),
                            })
                        )
                        .min(1),
                    drilldownUri: z.string().optional(),
                    sourcetype: z.string().optional(),
                })
                .optional(),
            entity: z
                .array(
                    z.discriminatedUnion('type', [
                        TextEntitySchema,
                        TextAreaEntitySchema,
                        SingleSelectEntitySchema,
                        CheckboxEntitySchema,
                        RadioEntitySchema,
                        SingleSelectSplunkSearchEntitySchema,
                    ])
                )
                .optional(),
            customScript: z.string().optional(),
        })
    )
    .min(1)
    .optional();
