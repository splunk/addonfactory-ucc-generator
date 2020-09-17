define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/waitspinner/Master',
        'splunk.i18n'
    ],
    function(
        _,
        module,
        BaseView,
        WaitSpinner,
        i18n
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: function(){
                return this.options.tagName || 'span';
            },

            /**
             * @param {Object} options {
             *     countLabel: (Optional) <String> The count vanity label,
             *     collection: <collections.SplunkDsBase>,
             *     model: (Optional for loading state) <Backbone.Model> state model that determines fetching state.,
             *     tagName: Defaluts to 'span'.
             * }
             */

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.listenTo(this.collection.paging, 'change', this.debouncedRender);
                if (this.model) {
                    this.listenTo(this.model, 'change:fetching', this.debouncedRender);
                }
            },

            render: function() {
                !this.children.spinner || this.children.spinner.$el.detach();
                var isFetching = this.model && this.model.get('fetching'),
                    html = this.compiledTemplate({
                    countLabel: this.options.countLabel,
                    collectionStatus: isFetching ? _('Loading').t() : i18n.format_decimal(this.collection.paging.get("total") || 0)
                });
                this.$el.html(html);
                
                this.children.spinner = this.children.spinner || new WaitSpinner();
                this.children.spinner.prependTo(this.$el);
                this.children.spinner.$el[isFetching ? 'show' : 'hide']();
                this.children.spinner[isFetching ? 'start' : 'stop']();

                return this;
            },

            template: '<%- collectionStatus %> <%- countLabel || "" %>'
        });
    }
);
