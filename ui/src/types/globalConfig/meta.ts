import { z } from 'zod';

export const meta = z
    .object({
        displayName: z.string(),
        name: z.string(),
        restRoot: z.string(),
        apiVersion: z.string().optional(),
        version: z.string(),
        schemaVersion: z.string().optional(),
        checkForUpdates: z.boolean().default(true),
    })
    .catchall(z.never());

export type meta = z.infer<typeof meta>;
