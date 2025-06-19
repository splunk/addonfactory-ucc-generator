import { z } from 'zod';
import { meta } from './meta';
import { pages } from './pages';
import { alerts } from './alerts';

type IMeta = z.output<typeof meta>;
type IMetaIn = z.input<typeof meta>;

// Explicit type for the runtime schema of Department
interface IMetaRT extends z.ZodType<IMeta, z.ZodTypeDef, IMetaIn> {}

type IPages = z.output<typeof pages>;
type IPagesIn = z.input<typeof pages>;

// Explicit type for the runtime schema of Department
export interface IPagesRT extends z.ZodType<IPages, z.ZodTypeDef, IPagesIn> {}

type IAlerts = z.output<typeof alerts>;
type IAlertsIn = z.input<typeof alerts>;

// Explicit type for the runtime schema of Department
interface IAlertsRT extends z.ZodType<IAlerts, z.ZodTypeDef, IAlertsIn> {}

export const GlobalConfigSchema = z.object({
    meta: meta as IMetaRT,
    pages: pages as IPagesRT,
    alerts: alerts as IAlertsRT,
});

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;
