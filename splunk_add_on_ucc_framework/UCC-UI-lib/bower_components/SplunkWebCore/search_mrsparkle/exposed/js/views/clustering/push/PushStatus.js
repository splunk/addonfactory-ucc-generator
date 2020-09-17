define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/FlashMessages',
    'contrib/text!views/clustering/push/PushStatus.html',
    'util/time',
    'bootstrap.tooltip'
],
    function(
        $,
        _,
        module,
        BaseView,
        FlashMessagesView,
        Template,
        timeUtils,
        bsTooltip
    ) {
        return BaseView.extend({
            moduleId: module.id,
            template: Template,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.children.flashMessages = new FlashMessagesView({ model: this.model.masterControl });
                this.model.pushModel.on('reset change', this.render, this);
                this.model.masterGeneration.on('reset change', this.render, this);
            },
            render: function() {
                if (!this.model.masterInfo || !this.model.pushModel) {
                    return;
                }
                var latestBundle = this.model.masterInfo.entry.content.get('latest_bundle'),
                    timeLastPush = latestBundle? timeUtils.convertToLocalTime(latestBundle.timestamp) : _('N/A').t(),
                    bundleId = latestBundle? latestBundle.checksum : _('N/A').t();
                var html = this.compiledTemplate({
                    pushSuccess: this.model.pushModel.get('lastPushSuccess'),
                    timeLastPush: timeLastPush,
                    bundleId: bundleId
                });
                this.$el.html(html);
                this.$el.prepend(this.children.flashMessages.render().el);
                this.$('.tooltip-link').tooltip({animation:false, container: 'body'});
            }
        });

    });