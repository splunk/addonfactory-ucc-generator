type ToastType = 'info' | 'warning' | 'success' | 'error';
declare module '@splunk/react-toast-notifications/Toaster' {
    import type { ReactElement } from 'react';

    function makeCreateToast(toaster: CreateToastProps): CreateToast;

    type CreateToastProps = {
        type: ToastType;
        message: string;
        autoDismiss?: boolean;
        timeout?: number;
        dismissOnActionClick?: boolean;
        showAction?: boolean;
        action?: {
            label: ReactElement | string;
            callback: () => void;
        };
    };
    type CreateToast = (props: CreateToastProps) => void;

    export type { CreateToastProps, CreateToast };
    export { makeCreateToast };
    export default Toaster;
}
declare module '@splunk/react-toast-notifications/ToastConstants' {
    export const TOAST_TYPES: {
        [k in Uppercase<ToastType>]: ToastType;
    };
}

declare module '@splunk/react-toast-notifications/ToastMessages';
