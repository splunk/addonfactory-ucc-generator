export const MODE_CLONE = 'clone';
export const MODE_CREATE = 'create';
export const MODE_DELETE = 'delete';
export const MODE_EDIT = 'edit';
export const MODE_CONFIG = 'config';

export type Mode =
    | typeof MODE_CLONE
    | typeof MODE_CREATE
    | typeof MODE_DELETE
    | typeof MODE_EDIT
    | typeof MODE_CONFIG;
