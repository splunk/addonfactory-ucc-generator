define([window.Lodash], function(Lodash) {
    class CustomComponent {
        constructor(el, field, model, serviceName) {
            this.el = el;
            this.field = field;
            this.model = model;
            this.serviceName = serviceName;
        }
        render() {
            console.log('render is called');
            console.log(window.Lodash.now());
            this.el.innerHTML = '<input id="mytext" type="text"></text>';
            var el = this.el.querySelector('#mytext');
            el.addEventListener('change', () => {
                this.model.set(this.field, el.value);
                console.log(`Set ${this.field} to ${el.value}`);
            });
            return this;
        }
    }

    return CustomComponent;
});
