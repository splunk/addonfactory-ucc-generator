import { z } from 'zod';
import { AnyOfEntity } from './entities';

export const alerts = z
    .array(
        z.object({
            name: z.string(),
            label: z.string(),
            description: z.string(),
            activeResponse: z
                .object({
                    task: z.array(z.string()).min(1),
                    supportsAdhoc: z.boolean(),
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
            entity: AnyOfEntity.optional(),
        })
    )
    .min(1)
    .optional();
