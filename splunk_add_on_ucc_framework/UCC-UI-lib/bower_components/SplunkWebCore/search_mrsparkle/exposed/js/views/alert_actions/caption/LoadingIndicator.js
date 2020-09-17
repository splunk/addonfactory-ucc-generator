define([
    'jquery',
    'underscore',
    'views/Base',
    'views/shared/waitspinner/Master'
], function($, _, BaseView, WaitSpinner) {

    return BaseView.extend({
        className: 'loading-indicator',
        initialize: function() {
            this.children.spinner = new WaitSpinner();
            this.listenTo(this.model, 'change:fetching', this.debouncedRender);
        },
        render: function() {
            if (this.$el.is(':empty')) {
                this.children.spinner.appendTo(this.$el);
                $('<div class="msg"></div>').text(_("Loading").t()).appendTo(this.$el);
            }
            var fetching = this.model.get('fetching');
            this.children.spinner[fetching ? 'start' : 'stop']();
            this.$el[fetching ? 'removeClass' : 'addClass']('hidden');
            return this;
        }
    });

});
