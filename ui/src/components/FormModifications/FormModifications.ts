import { Mode } from '../../constants/modes';
import { AcceptableFormValueOrNullish, StandardPages } from '../../types/components/shareableTypes';
import { getValueMapTruthyFalse } from '../../util/considerFalseAndTruthy';
import {
    BaseFormState,
    AnyEntity,
    EntitiesAllowingModifications,
} from '../BaseFormView/BaseFormTypes';
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
    key: 'help' | 'label' | 'required',
    propValue: string | boolean,
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
    mode: Mode,
    page: StandardPages
) => {
    let modification = entity.modifyFieldsOnValue?.find((mod) => {
        const currentFieldValue = stateShallowCopy.data?.[entity.field]?.value;
        return (
            // do not compare empty values for modifications
            currentFieldValue !== undefined &&
            currentFieldValue !== null &&
            // here type convertion is needed as splunk keeps all data as string
            // and users can put numbers or booleans inside global config
            getValueMapTruthyFalse(currentFieldValue, page) ===
                getValueMapTruthyFalse(mod.fieldValue, page) &&
            (!mod.mode || mod.mode === mode)
        );
    });

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

const isEntityField = (propKey: string): propKey is 'help' | 'label' | 'required' =>
    propKey === 'help' || propKey === 'label' || propKey === 'required';

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
    if (
        isEntityField(modificationKey) &&
        (typeof modificationValue === 'string' || typeof modificationValue === 'boolean')
    ) {
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
    entitiesToModify: EntitiesAllowingModifications[],
    page: StandardPages
) => {
    let stateShallowCopy = { ...state };
    let shouldUpdateState = false;
    entitiesToModify.forEach((entity: EntitiesAllowingModifications) => {
        const modifications = getModificationForEntity(entity, stateShallowCopy, mode, page);

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
