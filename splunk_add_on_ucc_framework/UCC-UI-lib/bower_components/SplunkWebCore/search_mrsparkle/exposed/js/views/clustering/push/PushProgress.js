define([
    'jquery',
    'module',
    'views/Base',
    'contrib/text!views/clustering/push/PushProgress.html',
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
                this.model.pushModel.set('peersValidated', 0);
                this.render();
            },
            render: function() {
                var count = this.model.pushModel.get('peersValidated'),
                    total = this.model.pushModel.get('peersTotal'),
                    html = this.compiledTemplate({
                    count: count,
                    total: total
                }),
                    $html = $(html);

                if (count == total) {
                    $html.find('.progress').removeClass('active');
                }
                this.$el.html($html);
            }
        });

    });