define([
    'jquery',
    'module',
    'views/Base',
    'views/shared/delegates/Popdown',
    'contrib/text!views/clustering/searchhead/SearchHeadDetails.html'
],
    function(
        $,
        module,
        BaseView,
        PopdownView,
        SearchHeadDetailsTemplate
    ) {
    return BaseView.extend({
        moduleId: module.id,
        className: 'btn-combo',
        template: SearchHeadDetailsTemplate,
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);

            this.model.serverInfo.on('change reset', function(){
                this.render();
            }, this);
        },
        render: function() {
            this.children.popdown = new PopdownView({
                el: this.el
            });
            var html = this.compiledTemplate({serverName: this.model.serverInfo.getServerName()});
            this.$el.html(html);
            return this;
        }
    });
});
