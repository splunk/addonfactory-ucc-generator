import { TOAST_TYPES } from '@splunk/react-toast-notifications/ToastConstants';
import Toaster, { makeCreateToast } from '@splunk/react-toast-notifications/Toaster';

let appData = null;
let unifiedConfigs = null;

export function setMetaInfo(data) {
    appData = data;
}

export function getMetaInfo() {
    return {
        appData,
    };
}

export function isFalse(value) {
    return ['0', 'FALSE', 'F', 'N', 'NO', 'NONE', ''].includes(value.toString().toUpperCase());
}

export function isTrue(value) {
    return ['1', 'TRUE', 'T', 'Y', 'YES'].includes(value.toString().toUpperCase());
}

export function generateEndPointUrl(name) {
    return `${unifiedConfigs.meta.restRoot}_${name}`;
}

export function setUnifiedConfig(unifiedConfig) {
    unifiedConfigs = unifiedConfig;
}

export function getUnifiedConfigs() {
    return unifiedConfigs;
}

const createToast = makeCreateToast(Toaster);
export const generateToast = (message, messageType, action = undefined) => {
    let toastType;
    switch (messageType) {
        case 'success':
            toastType = TOAST_TYPES.SUCCESS;
            break;
        case 'error':
            toastType = TOAST_TYPES.ERROR;
            break;
        case 'warning':
            toastType = TOAST_TYPES.ERROR;
            break;
        default:
            toastType = TOAST_TYPES.INFO;
    }
    createToast({
        type: toastType,
        message,
        autoDismiss: true,
        dismissOnActionClick: true,
        showAction: Boolean(action),
        action: action || undefined,
    });
};

export function filterByAllowList(fields, allowList) {
    const allowRegex = new RegExp(allowList);
    return fields.filter((item) => allowRegex.test(item.value));
}

export function filterByDenyList(fields, denyList) {
    const denyRegex = new RegExp(denyList);
    return fields.filter((item) => !denyRegex.test(item.value));
}

export function filterResponse(items, labelField, allowList, denyList) {
    let newItems = items.map((item) => {
        return { label: labelField ? item[labelField] : item.name, value: item.name };
    });

    if (allowList) {
        newItems = filterByAllowList(newItems, allowList);
    }

    if (denyList) {
        newItems = filterByDenyList(newItems, denyList);
    }

    return newItems;
}
