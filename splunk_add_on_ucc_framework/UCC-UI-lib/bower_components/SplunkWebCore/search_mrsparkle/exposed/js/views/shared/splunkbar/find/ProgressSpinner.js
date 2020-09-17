define(
[
    'underscore',
    'module',
    'views/shared/waitspinner/Master',
    'splunk.util'],
function(
    _,
    module,
    SpinnerView,
    splunkutil
){
    return SpinnerView.extend({
        moduleId: module.id,
        initialize: function() {
            this.options.useLocalClassNames = true;
            SpinnerView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            this.$el.show()['addClass']('active');
            this.start();
            this.spinning = true;
            return this;
        }
    });
});
