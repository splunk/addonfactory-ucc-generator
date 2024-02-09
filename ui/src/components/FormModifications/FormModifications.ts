import { Mode } from '../../constants/modes';
import { AcceptableFormValueOrNullish } from '../../types/components/shareableTypes';
import { BaseFormState, AnyEntity, EntitiesWithModifications } from '../BaseFormTypes';
import { MarkdownMessageProps } from '../MarkdownMessage/MarkdownMessage';

export const handleStateFieldModificationProp = (
    key: 'display' | 'value' | 'disabled' | 'markdownMessage',
    propValue: string | number | boolean | object,
    fieldId: string,
    state: BaseFormState
) => {
    const shallowStateCopy = { ...state };
    if (shallowStateCopy.data) {
        shallowStateCopy.data[fieldId][key] = propValue as AcceptableFormValueOrNullish &
            boolean &
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

export function getAllFieldsWithModifications(entities: AnyEntity[]): EntitiesWithModifications[] {
    const entitiesWithModifications = entities.filter(
        (e) =>
            e.type !== 'helpLink' &&
            e.type !== 'checkboxGroup' &&
            e.type !== 'oauth' &&
            e.type !== 'custom' &&
            e?.modifyFieldsOnValue
    );

    return entitiesWithModifications as EntitiesWithModifications[];
}
export const getModifiedState = (
    state: BaseFormState,
    mode: Mode,
    entitiesToModify: EntitiesWithModifications[]
) => {
    let stateShallowCopy = { ...state };
    let shouldUpdateState = false;

    entitiesToModify?.forEach((entity: EntitiesWithModifications) => {
        let modification = entity?.modifyFieldsOnValue?.find(
            (mod) =>
                stateShallowCopy?.data?.[entity.field]?.value === mod.fieldValue &&
                (!mod.mode || mod.mode === mode)
        );

        if (!modification) {
            modification = entity?.modifyFieldsOnValue?.find(
                (mod) =>
                    mod.fieldValue === '[[any_other_value]]' && (!mod.mode || mod.mode === mode)
            );
        }

        modification?.fieldsToModify.forEach((modificationFields) => {
            const { fieldId, ...fieldProps } = modificationFields;
            Object.entries(fieldProps).forEach(([propKey, propValue]) => {
                if (
                    propKey === 'display' ||
                    propKey === 'value' ||
                    propKey === 'disabled' ||
                    propKey === 'markdownMessage'
                ) {
                    const { changesOccured, data } = handleStateFieldModificationProp(
                        propKey,
                        propValue,
                        fieldId,
                        stateShallowCopy
                    );
                    if (changesOccured && data) {
                        stateShallowCopy = data;
                        shouldUpdateState = true;
                    }
                } else if (
                    (propKey === 'help' || propKey === 'label') &&
                    typeof propValue === 'string'
                ) {
                    const { changesOccured, data } = handleEntityModificationProp(
                        propKey,
                        propValue,
                        fieldId,
                        stateShallowCopy
                    );
                    if (changesOccured && data) {
                        stateShallowCopy = data;
                        shouldUpdateState = true;
                    }
                }
            });
        });
    });
    return { newState: stateShallowCopy, shouldUpdateState };
};
