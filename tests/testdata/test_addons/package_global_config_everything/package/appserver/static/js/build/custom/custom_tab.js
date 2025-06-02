class CustomTab {

    /**
    * Custom Tab
    * @constructor
    * @param {Object} tab - Tab details.
    * @param {element} el - The element of the custom menu.
    */
    constructor(tab, el) {
        this.tab = tab;
        this.el = el;
    }

    render() {
        this.el.innerHTML = `<h1 style="margin-top: 20px">${this.tab.title} - This is a custom component rendered from the TA</h1>`
    }
}
export default CustomTab;
