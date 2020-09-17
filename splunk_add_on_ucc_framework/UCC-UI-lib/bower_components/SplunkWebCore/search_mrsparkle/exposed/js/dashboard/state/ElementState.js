define(['underscore', './ItemState', 'views/dashboard/element/Html'], function(_, ItemState, HtmlElement) {

    return ItemState.extend({
        setState: function(element) {
            var defaults = {
                'dashboard.element.title': ''
            };
            var state = _.extend({id: element.id}, defaults);
            var options = this._stateOptions || {};
            if (element instanceof HtmlElement) {
                state = element.elementModel.toJSON(_.extend({tokens: true}, options));
                state.type = 'html';
            } else {
                var elementReport = element.model.elementReport;
                var stateContent = _.omit(elementReport.toJSON(_.extend({tokens: true}, options)));
                if (options.tokens === false) {
                    stateContent['dashboard.element.title'] = elementReport.get('dashboard.element.title', {
                        tokens: true,
                        retainUnmatchedTokens: true
                    });
                }
                _(stateContent).each(function(value, key) {
                    if (key.indexOf('dashboard.element.') === 0 || key.indexOf('display.') === 0) {
                        state[key] = value;
                    }
                });
            }
            ItemState.prototype.setState.call(this, state);
        }
    });

});