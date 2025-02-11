import { z } from 'zod';
import { TabSchema } from '../../types/globalConfig/pages';

export type Tab = z.infer<typeof TabSchema>;
