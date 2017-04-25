import Backbone from 'backbone';
import Spinner from 'contrib/text!./WaitSpinner.svg';

export default Backbone.View.extend({
    tagName: 'span',

    className: 'ta-wait-spinner',

    render() {
        this.$el.html(Spinner);
        return this;
    }
});
