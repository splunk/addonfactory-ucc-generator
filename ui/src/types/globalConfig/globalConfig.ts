import { z } from 'zod';
import { meta } from './meta';
import { pages } from './pages';
import { alerts } from './alerts';

export const GlobalConfigSchema = z.object({
    meta,
    pages,
    alerts,
});

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;
