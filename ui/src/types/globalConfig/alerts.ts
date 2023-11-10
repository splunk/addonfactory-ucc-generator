import { z } from 'zod';
import { AnyOfEntity } from './entities';

export const alerts = z
    .array(
        z.object({
            name: z.string().max(100),
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
                                    version: z.array(z.string()).min(1),
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
            entity: AnyOfEntity,
        })
    )
    .min(1)
    .optional();
