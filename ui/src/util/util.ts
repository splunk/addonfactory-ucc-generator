import { TOAST_TYPES } from '@splunk/react-toast-notifications/ToastConstants';
import Toaster, { makeCreateToast } from '@splunk/react-toast-notifications/Toaster';
import { GlobalConfig } from '../types/globalConfig/globalConfig';

interface AppData {
    app: string;
    // eslint-disable-next-line camelcase
    custom_rest: string;
    nullStr: 'NULL';
    stanzaPrefix: string;
}

let appData: AppData | null = null;
let unifiedConfigs: GlobalConfig | null = null;

export function setMetaInfo(data: AppData) {
    appData = data;
}

export function getMetaInfo() {
    return {
        appData,
    };
}

export function isFalse(value: unknown) {
    return (
        value === null ||
        value === undefined ||
        ['0', 'FALSE', 'F', 'N', 'NO', 'NONE', ''].includes(value.toString().toUpperCase())
    );
}

export function isTrue(value: unknown) {
    return (
        value !== null &&
        value !== undefined &&
        ['1', 'TRUE', 'T', 'Y', 'YES'].includes(value.toString().toUpperCase())
    );
}

export function generateEndPointUrl(name: string) {
    if (!unifiedConfigs) {
        throw new Error('No GlobalConfig set');
    }
    return `${unifiedConfigs.meta.restRoot}_${name}`;
}

export function setUnifiedConfig(unifiedConfig: GlobalConfig) {
    unifiedConfigs = unifiedConfig;
}

export function getUnifiedConfigs() {
    return unifiedConfigs;
}

const createToast = makeCreateToast(Toaster);
export const generateToast = (
    message: string,
    messageType: (typeof TOAST_TYPES)[keyof typeof TOAST_TYPES],
    action = undefined
) => {
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

export function filterByAllowList(fields: { value: string; label?: string }[], allowList: string) {
    const allowRegex = new RegExp(allowList);
    return fields.filter((item) => allowRegex.test(item.value));
}

export function filterByDenyList(fields: { value: string; label?: string }[], denyList: string) {
    const denyRegex = new RegExp(denyList);
    return fields.filter((item) => !denyRegex.test(item.value));
}

export function filterResponse(
    items: { content?: Record<string, string>; name: string }[],
    labelField: string,
    allowList: string,
    denyList: string
) {
    let newItems: { value: string; label?: string }[] = items.map((item) => ({
        label: labelField ? item.content?.[labelField] : item.name,
        value: item.name,
    }));

    if (allowList) {
        newItems = filterByAllowList(newItems, allowList);
    }

    if (denyList) {
        newItems = filterByDenyList(newItems, denyList);
    }

    return newItems;
}
