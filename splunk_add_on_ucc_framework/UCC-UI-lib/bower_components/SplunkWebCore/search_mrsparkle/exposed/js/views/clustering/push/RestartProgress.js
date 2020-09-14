define([
    'jquery',
    'module',
    'views/Base',
    'contrib/text!views/clustering/push/RestartProgress.html',
    'util/console'
],
    function(
        $,
        module,
        BaseView,
        Template,
        console
        ) {
        return BaseView.extend({
            moduleId: module.id,
            template: Template,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.model.pushModel.on('tick', this.render, this);
            },
            reset: function() {
                this.model.pushModel.set('peersRestarted', 0);
                this.render();
            },
            render: function() {
                var html = this.compiledTemplate({
                    count: this.model.pushModel.get('peersRestarted'),
                    total: this.model.pushModel.get('peersTotal')
                });
                this.$el.html(html);
            }
        });

    });