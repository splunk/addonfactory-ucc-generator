import { z } from 'zod';
import { meta } from './meta';
import { pages } from './pages';
import { alerts } from './alerts';

export const globalConfig = z
    .object({
        meta,
        pages,
        alerts,
    })
    .catchall(z.never());

export type globalConfig = z.infer<typeof globalConfig>;
