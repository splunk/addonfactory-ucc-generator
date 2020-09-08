define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/FlashMessages',
        'views/datapreview/Header',
        'views/datapreview/results/Master',
        'views/datapreview/settings/Master',
        'contrib/text!views/datapreview/Master.html',
        './Master.pcss'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        FlashMessage,
        HeaderView,
        ResultsView,
        SettingsView,
        dataPreviewTemplate,
        css
    ){
        return BaseView.extend({
            moduleId: module.id,
            template: dataPreviewTemplate,
            initialize: function(options) {
                this.options = options || {};
                BaseView.prototype.initialize.apply(this, arguments);
                this.deferreds = this.options.deferreds;

                this.children.header = new HeaderView({
                    collection: this.collection,
                    model: this.model,
                    deferreds: this.deferreds,
                    canChangeSource: this.options.canChangeSource
                });

                this.children.settings = new SettingsView({
                    collection: this.collection,
                    model: this.model,
                    deferreds: this.deferreds
                });

                this.children.results = new ResultsView({
                    collection: this.collection,
                    model: this.model,
                    deferreds: this.deferreds
                });

                //TODO: when everyone moves to activate/deactivate and do not have activate in initialize
                //we will not have to do this.
                _.each(this.children, function(child, key){
                    child.deactivate({deep: true});
                });

                //TODO make sure we are only setting one resize listener at a time (does this view get re-initialized ever?)
                $(window).on('resize', _(_.debounce(this.resize, 50)).bind(this));
            },
            render: function() {
                if (this.children.settings) {
                    this.children.settings.detach();
                }

                this.$el.html(this.compiledTemplate({}));
                this.renderHeader();
                this.$('.layoutColLeft').append(this.children.settings.render().el);
                this.$('.layoutColRight').append(this.children.results.render().el);
                this.children.results.children.eventsViewer.updateContainerHeight();

                return this;
            },
            renderHeader: function(){
                var layoutHeader = this.$('.layoutHeader');
                layoutHeader.append(this.children.header.render().el);
            },
            resize: function(){
                this.children.results.children.eventsViewer.updateContainerHeight();
            }
        });
    }
);
