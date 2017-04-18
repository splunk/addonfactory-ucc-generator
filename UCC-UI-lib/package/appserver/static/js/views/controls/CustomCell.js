define([], function() {
    class CustomCell {
        constructor(el, field, model, serviceName) {
            this.el = el;
            this.field = field;
            this.model = model;
            this.serviceName = serviceName;
        }
        render() {
            this.el.innerHTML = 'test custom cell';
            return this;
        }
    }
    return CustomCell;
});
