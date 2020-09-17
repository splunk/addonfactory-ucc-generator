define([
    'jquery',
    'module',
    'backbone',
    'views/Base',
    'views/clustering/config/Master',
    'uri/route',
    'contrib/text!views/clustering/EnableClustering.html'
],
    function(
        $,
        module,
        Backbone,
        BaseView,
        ConfigDialog,
        route,
        EnableClusteringTemplate
        ) {
        return BaseView.extend({
            moduleId: module.id,
            template: EnableClusteringTemplate,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
            },

            events: {
                'click #enable_clustering': function(e) {
                    this.children.configDialog = new ConfigDialog({
                        model: this.model,
                        onHiddenRemove: true
                    });
                    this.$el.append(this.children.configDialog.render().el);
                    this.children.configDialog.show();
                    e.preventDefault();
                }
            },
            render: function() {
                var root = this.model.application.get('root');
                var locale = this.model.application.get('locale');
                var link = route.docHelp(root, locale, 'manager.clustering.configureClustering');
                var html = this.compiledTemplate({
                    learnmoreLink: link
                });
                this.$el.html(html);
            }
        });

    });
