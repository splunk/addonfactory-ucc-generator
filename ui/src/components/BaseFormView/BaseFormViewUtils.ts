import Message from '@splunk/react-ui/Message';
import { variables } from '@splunk/themes';
import styled from 'styled-components';
import { MODE_CLONE, MODE_CONFIG, MODE_CREATE, MODE_EDIT } from '../../constants/modes';
import {
    AnyEntity,
    BaseFormProps,
    BasicEntity,
    CurrentBaseFormInput,
} from '../../types/components/BaseFormTypes';
import { AcceptableFormValueOrNullish } from '../../types/components/shareableTypes';
import { OAuthEntity } from '../../types/globalConfig/entities';
import { shouldHideForPlatform } from '../../util/pageContext';

/**
 * Filters auth type options based on auth_type_filter config and current
 * field values. Allows add-ons to hide specific auth types when another
 * field's value exceeds or falls below a threshold.
 *
 * Example globalConfig.json usage:
 *   "auth_type": ["oauth_client_credentials", "oauth", "basic"],
 *   "auth_type_filter": {
 *       "basic": { "hideForVersionAbove": 64.0, "dependsOnField": "sfdc_api_version" }
 *   }
 *
 * @param authTypes - full list of auth type keys from globalConfig
 * @param authTypeFilter - filter rules keyed by auth type
 * @param currentValues - current form field values to evaluate against
 * @returns filtered list of auth type keys
 */
export const filterAuthTypes = (
    authTypes: string[],
    authTypeFilter?: Record<
        string,
        {
            hideForVersionAbove?: number;
            hideForVersionBelow?: number;
            dependsOnField?: string;
        }
    >,
    currentValues?: Record<string, unknown>
): string[] => {
    if (!authTypeFilter || !currentValues) return authTypes;

    return authTypes.filter((authType) => {
        const rule = authTypeFilter[authType];
        if (!rule || !rule.dependsOnField) return true;

        const rawField = currentValues[rule.dependsOnField];
        // State values are stored as objects { value: ... } or as raw primitives
        const rawValue =
            rawField && typeof rawField === 'object' && 'value' in (rawField as object)
                ? (rawField as { value: unknown }).value
                : rawField;
        // If value is null/undefined/empty, cannot evaluate — show all options
        if (rawValue === null || rawValue === undefined || rawValue === '') return true;
        const fieldValue = parseFloat(String(rawValue));
        // eslint-disable-next-line no-console
        console.debug('[filterAuthTypes]', rule.dependsOnField, '=', rawValue, '→', fieldValue);
        if (isNaN(fieldValue)) return true;

        if (rule.hideForVersionAbove !== undefined && fieldValue > rule.hideForVersionAbove) {
            return false;
        }
        if (rule.hideForVersionBelow !== undefined && fieldValue < rule.hideForVersionBelow) {
            return false;
        }
        return true;
    });
};

export const mapEntityIntoBaseForViewEntityObject = (
    e: OAuthEntity | AnyEntity,
    currentInput: CurrentBaseFormInput,
    props: BaseFormProps,
    currentOauthValue?: AcceptableFormValueOrNullish, // shared state for oauth
    oauthType?: string // shared state for oauth
) => {
    const tempEntity: BasicEntity = {
        disabled: false,
        error: false,
        display: true,
    };

    if (e.type !== 'helpLink' && e.type !== 'custom') {
        // encrypt by default for oauth
        e.encrypted = e?.encrypted || false;

        if (e.type === 'file' && currentInput?.[e.field]) {
            /*
                         adding example name to enable possibility of removal file,
                         not forcing value addition as if value is encrypted it is shared as
                         string ie. ***** and it is considered a valid default value
                         if value is not encrypted it is pushed correctly along with this name
                        */
            tempEntity.fileNameToDisplay = 'Previous File';
        }
        if (props.mode === MODE_CREATE) {
            tempEntity.value = typeof e.defaultValue !== 'undefined' ? e?.defaultValue : null;
            tempEntity.display =
                typeof e?.options?.display !== 'undefined' ? e.options.display : true;
            if (oauthType) {
                tempEntity.display =
                    typeof e?.options?.display !== 'undefined'
                        ? e.options.display
                        : oauthType === currentOauthValue;
            }
            tempEntity.display = shouldHideForPlatform(
                e.options?.hideForPlatform,
                props.pageContext?.platform
            )
                ? false
                : tempEntity.display;
            tempEntity.error = false;
            tempEntity.disabled = e?.options?.enable === false;
            return tempEntity;
        }
        if (props.mode === MODE_EDIT) {
            tempEntity.value =
                typeof currentInput?.[e.field] !== 'undefined' ? currentInput?.[e.field] : null;
            // For encrypted fields, preserve masked values (like "******") to show user that value exists
            if (e.encrypted && !currentInput?.[e.field]) {
                tempEntity.value = '';
            }
            tempEntity.display =
                typeof e?.options?.display !== 'undefined' ? e.options.display : true;
            if (oauthType) {
                tempEntity.display =
                    typeof e?.options?.display !== 'undefined'
                        ? e.options.display
                        : oauthType === currentOauthValue;
            }
            tempEntity.display = shouldHideForPlatform(
                e.options?.hideForPlatform,
                props.pageContext?.platform
            )
                ? false
                : tempEntity.display;

            tempEntity.error = false;
            tempEntity.disabled = e?.options?.enable === false;
            if (e.field === 'name') {
                tempEntity.disabled = true;
            } else if (typeof e?.options?.disableonEdit !== 'undefined') {
                tempEntity.disabled = e.options.disableonEdit;
            }
            return tempEntity;
        }
        if (props.mode === MODE_CLONE) {
            tempEntity.value = e.field === 'name' || e.encrypted ? '' : currentInput?.[e.field];

            tempEntity.display =
                typeof e?.options?.display !== 'undefined' ? e.options.display : true;
            if (oauthType) {
                tempEntity.display =
                    typeof e?.options?.display !== 'undefined'
                        ? e.options.display
                        : oauthType === currentOauthValue;
            }
            tempEntity.display = shouldHideForPlatform(
                e.options?.hideForPlatform,
                props.pageContext?.platform
            )
                ? false
                : tempEntity.display;

            tempEntity.error = false;
            tempEntity.disabled = e?.options?.enable === false;
            return tempEntity;
        }
        if (props.mode === MODE_CONFIG) {
            e.defaultValue = typeof e.defaultValue !== 'undefined' ? e.defaultValue : undefined;
            tempEntity.value =
                typeof currentInput?.[e.field] !== 'undefined'
                    ? currentInput?.[e.field]
                    : e.defaultValue;
            // For encrypted fields, preserve masked values (like "******") to show user that value exists
            if (e.encrypted && !currentInput?.[e.field]) {
                tempEntity.value = '';
            }
            tempEntity.display =
                typeof e?.options?.display !== 'undefined' ? e.options.display : true;
            if (oauthType) {
                tempEntity.display =
                    typeof e?.options?.display !== 'undefined'
                        ? e.options.display
                        : oauthType === currentOauthValue;
            }
            tempEntity.display = shouldHideForPlatform(
                e.options?.hideForPlatform,
                props.pageContext?.platform
            )
                ? false
                : tempEntity.display;

            tempEntity.error = false;
            tempEntity.disabled = e?.options?.enable === false;
            if (e.field === 'name') {
                tempEntity.disabled = true;
            } else if (typeof e?.options?.disableonEdit !== 'undefined') {
                tempEntity.disabled = e.options.disableonEdit;
            }
            return tempEntity;
        }
        throw new Error(`Invalid mode : ${props.mode}`);
    } else {
        if (e.type === 'custom') {
            // value for custom control element is passed to custom js later on
            tempEntity.value = currentInput?.[e.field];
        }
        // TODO extract if before this if else block
        return tempEntity;
    }
};

export const StyledMessage = styled(Message)`
    margin-bottom: ${variables.spacingLarge};
`;
