import { GlobalConfig } from '../../../../publicApi';

class CustomMenuMock {
    globalConfig: GlobalConfig;

    el?: HTMLElement;

    setValue: (val: { service: string; input?: string }) => void;

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
        setValue: (val: { service: string; input?: string }) => void
    ) {
        this.globalConfig = globalConfig;
        this.el = el;
        this.setValue = setValue;
    }

    render() {
        if (this.el) {
            this.el.innerHTML =
                '<button type="button">Click Me! I am a button for custom menu</button>';
            this.el.onclick = () => {
                this.setValue({
                    service: 'example_input_one', // The value of service can be the name of any services, specified in the globalConfig file.
                });
            };
        }
    }
}
export default CustomMenuMock;
