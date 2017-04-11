define([window.Lodash], function(Lodash) {
    class ExpandRow {
        constructor(el, component, model, serviceName) {
            this.el = el;
            this.component = component;
            this.model = model;
            this.serviceName = serviceName;
        }
        render() {
            const el = this.el.querySelector('.details');
            el.innerHTML = 'hello world for test';
            return this;
        }
    }
    return ExpandRow;
});
