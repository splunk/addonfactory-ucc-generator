import Backbone from 'backbone';
import _ from 'lodash';
import Spinner from 'contrib/text!./WaitSpinner.svg';

export default Backbone.View.extend({
    tagName: 'span',

    className: 'ta-wait-spinner',

    initialize(options) {
        this.dataSize = options.dataSize || 'small';
        this.dataColor = options.dataColor || 'gray';
    },

    render() {
        this.$el.html(_.template(Spinner)({
            dataSize: this.dataSize,
            dataColor: this.dataColor
        }));
        return this;
    }
});
