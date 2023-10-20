const EntityAliases = {
    loggingEntity: {
        type: 'singleSelect',
        label: 'Log level',
        options: {
            disableSearch: true,
            autoCompleteFields: [
                {
                    value: 'DEBUG',
                    label: 'DEBUG',
                },
                {
                    value: 'INFO',
                    label: 'INFO',
                },
                {
                    value: 'WARNING',
                    label: 'WARNING',
                },
                {
                    value: 'ERROR',
                    label: 'ERROR',
                },
                {
                    value: 'CRITICAL',
                    label: 'CRITICAL',
                },
            ],
        },
        defaultValue: 'INFO',
        field: 'loglevel',
    },
} as const;

function getKeyValue<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}
function isObjKey<T extends object>(key: PropertyKey, obj: T): key is keyof T {
    return key in obj;
}

export function getEntityAlias<EntityType extends keyof typeof EntityAliases>(
    entityType: string
): (typeof EntityAliases)[EntityType] | null {
    if (isObjKey(entityType, EntityAliases)) {
        return getKeyValue(EntityAliases, entityType);
    }
    return null;
}
