import { Tab } from '../../../publicApi';
import { CustomTabBase } from '../CustomTabBase';

class CustomTab extends CustomTabBase {
    constructor(tab: Tab, el: HTMLDivElement) {
        super(tab, el);
        this.tab = tab;
        this.el = el;
    }

    render() {
        this.el.innerHTML = `<h1 style="margin-top: 20px">${this.tab.title} - This is a custom tab rendered from the TA</h1>`;
    }
}
export default CustomTab;
