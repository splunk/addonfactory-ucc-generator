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
            tempEntity.value = e.encrypted ? '' : tempEntity.value;
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
            tempEntity.value = e.encrypted ? '' : tempEntity.value;
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
