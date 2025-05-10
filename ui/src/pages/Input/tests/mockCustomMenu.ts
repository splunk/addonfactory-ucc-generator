import { GlobalConfig } from '../../../publicApi';

class CustomMenu {
    globalConfig: GlobalConfig;

    el: HTMLElement;

    setValue: (newValue: { service: string }) => void;

    services: Record<string, string>;

    /**
     * Custom Menu
     * @constructor
     * @param {Object} globalConfig - Global configuration.
     * @param {element} el - The element of the custom menu.
     * @param {function} setValue - set value of the custom field.
     */
    constructor(
        globalConfig: GlobalConfig,
        el: HTMLElement,
        setValue: (newValue: { service: string }) => void
    ) {
        this.globalConfig = globalConfig;
        this.el = el;
        this.setValue = setValue;
        this.services = {};
    }

    render() {
        this.el.innerHTML =
            '<button type="button">Click Me! I am a button for custom menu</button>';
        this.el.onclick = () => {
            this.setValue({
                service: 'demo_input', // The value of service can be the name of any services, specified in the globalConfig file.
            });
        };
    }
}
export default CustomMenu;
