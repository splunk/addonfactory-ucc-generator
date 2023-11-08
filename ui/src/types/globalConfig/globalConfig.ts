import { z } from 'zod';
import { meta } from './meta';
import { pages } from './pages';
import { alerts } from './alerts';

export default z
    .object({
        meta,
        pages,
        alerts,
    })
    .catchall(z.never());
