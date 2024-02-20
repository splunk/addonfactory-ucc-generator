import { Mode } from '../../constants/modes';
import { AcceptableFormValueOrNullish } from '../../types/components/shareableTypes';
import { BaseFormState, AnyEntity, EntitiesAllowingModifications } from '../BaseFormTypes';
import { MarkdownMessageProps } from '../MarkdownMessage/MarkdownMessage';

const VALUE_TO_TRIGGER_UPDATE_FOR_ANY_NOT_LISTED_VALUES = '[[any_other_value]]';

export const handleStateFieldModificationProp = (
    key: 'display' | 'value' | 'disabled' | 'markdownMessage',
    propValue: string | number | boolean | MarkdownMessageProps,
    fieldId: string,
    state: BaseFormState
) => {
    const shallowStateCopy = { ...state };
    if (shallowStateCopy.data) {
        shallowStateCopy.data[fieldId][key] = propValue as boolean &
            AcceptableFormValueOrNullish &
            (MarkdownMessageProps | undefined);
        return {
            changesOccured: true,
            data: shallowStateCopy,
        };
    }
    return {
        changesOccured: false,
        data: shallowStateCopy,
    };
};

export const handleEntityModificationProp = (
    key: 'help' | 'label',
    propValue: string,
    fieldId: string,
    state: BaseFormState
) => {
    const shallowStateCopy = { ...state };
    if (shallowStateCopy?.data?.[fieldId]) {
        shallowStateCopy.data[fieldId].modifiedEntitiesData = {
            ...shallowStateCopy.data[fieldId].modifiedEntitiesData,
            [key]: propValue,
        };
        return {
            changesOccured: true,
            data: shallowStateCopy,
        };
    }

    return {
        changesOccured: false,
        data: shallowStateCopy,
    };
};

export const isEntityWithModifications = (
    entity: AnyEntity
): entity is EntitiesAllowingModifications =>
    !!(
        (entity.type === 'text' ||
            entity.type === 'textarea' ||
            entity.type === 'singleSelect' ||
            entity.type === 'multipleSelect' ||
            entity.type === 'checkbox' ||
            entity.type === 'radio' ||
            entity.type === 'file') &&
        entity?.modifyFieldsOnValue
    );

export function getAllFieldsWithModifications(
    entities: AnyEntity[]
): EntitiesAllowingModifications[] {
    const entitiesWithModifications = entities.filter((e) => isEntityWithModifications(e));
    return entitiesWithModifications as EntitiesAllowingModifications[];
}

const getModificationForEntity = (
    entity: EntitiesAllowingModifications,
    stateShallowCopy: BaseFormState,
    mode: Mode
) => {
    let modification = entity.modifyFieldsOnValue?.find(
        (mod) =>
            stateShallowCopy.data?.[entity.field]?.value === mod.fieldValue &&
            (!mod.mode || mod.mode === mode)
    );

    if (!modification) {
        modification = entity.modifyFieldsOnValue?.find(
            (mod) =>
                mod.fieldValue === VALUE_TO_TRIGGER_UPDATE_FOR_ANY_NOT_LISTED_VALUES &&
                (!mod.mode || mod.mode === mode)
        );
    }

    return modification;
};

const isStateField = (
    propKey: string
): propKey is 'value' | 'display' | 'disabled' | 'markdownMessage' =>
    propKey === 'display' ||
    propKey === 'value' ||
    propKey === 'disabled' ||
    propKey === 'markdownMessage';

const isEntityField = (propKey: string): propKey is 'help' | 'label' =>
    propKey === 'help' || propKey === 'label';

const getStateAfterModification = (
    modificationKey: string,
    modificationValue: string | number | boolean | MarkdownMessageProps,
    fieldId: string,
    stateShallowCopy: BaseFormState
) => {
    if (isStateField(modificationKey)) {
        return handleStateFieldModificationProp(
            modificationKey,
            modificationValue,
            fieldId,
            stateShallowCopy
        );
    }
    if (isEntityField(modificationKey) && typeof modificationValue === 'string') {
        return handleEntityModificationProp(
            modificationKey,
            modificationValue,
            fieldId,
            stateShallowCopy
        );
    }
    return {
        changesOccured: false,
        data: stateShallowCopy,
    };
};

export const getModifiedState = (
    state: BaseFormState,
    mode: Mode,
    entitiesToModify: EntitiesAllowingModifications[]
) => {
    let stateShallowCopy = { ...state };
    let shouldUpdateState = false;

    entitiesToModify.forEach((entity: EntitiesAllowingModifications) => {
        const modifications = getModificationForEntity(entity, stateShallowCopy, mode);

        modifications?.fieldsToModify.forEach((modificationFields) => {
            const { fieldId, ...fieldProps } = modificationFields;
            Object.entries(fieldProps).forEach(([propKey, propValue]) => {
                const { data, changesOccured } = getStateAfterModification(
                    propKey,
                    propValue,
                    fieldId,
                    stateShallowCopy
                );
                if (changesOccured) {
                    stateShallowCopy = data;
                    shouldUpdateState = true;
                }
            });
        });
    });
    return { newState: stateShallowCopy, shouldUpdateState };
};
