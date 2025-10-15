import { z } from 'zod';

export const meta = z
    .object({
        displayName: z.string(),
        name: z.string(),
        restRoot: z.string(),
        apiVersion: z.string().optional(),
        version: z.string(),
        schemaVersion: z.string().optional(),
        _uccVersion: z.string().optional(),
        hideUCCVersion: z.boolean().optional(),
        checkForUpdates: z.boolean().default(true).optional(),
        searchViewDefault: z.boolean().default(false).optional(),
        isVisible: z.boolean().default(true).optional(),
        supportedThemes: z.array(z.string()).optional(),
        showFooter: z.boolean().default(true).optional(),
        supportedPythonVersion: z.array(z.string()).optional(),
        defaultView: z
            .enum(['inputs', 'configuration', 'dashboard', 'search'])
            .default('configuration')
            .optional(),
        'os-dependentLibraries': z
            .array(
                z.object({
                    name: z.string(),
                    version: z.string(),
                    dependencies: z.boolean().optional(),
                    platform: z.string(),
                    python_version: z.string(),
                    target: z.string(),
                    os: z.enum(['linux', 'windows', 'darwin']),
                    ignore_requires_python: z.boolean().optional(),
                })
            )
            .optional(),
    })
    .strict();

export type meta = z.infer<typeof meta>;
