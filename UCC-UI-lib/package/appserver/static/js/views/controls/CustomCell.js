define([], function() {
    class CustomCell {
        constructor(el, field, model) {
            this.el = el;
            this.field = field;
            this.model = model;
        }
        render() {
            const el = this.el.querySelector('td');
            el.innerHTML = 'test custom cell';
            return this;
        }
    }
    return CustomCell;
});
