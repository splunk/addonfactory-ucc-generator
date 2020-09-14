define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/Modal',
    'contrib/text!views/shared/apps_remote/dialog/Error.html',
    'uri/route',
    'splunk.util'
],
    function(
        $,
        _,
        module,
        BaseView,
        Modal,
        template,
        route,
        splunkUtils
        ) {
        return BaseView.extend({
            template: template,
            moduleId: module.id,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.appRemoteType = this.model.appRemote.get('type') === 'addon' ? 'Add-on' : 'App';
                this.headerText = splunkUtils.sprintf(_('%s Installation Failed').t(), this.appRemoteType);
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    this.model.wizard.set('step', 1);
                }
            }),

            _getErrorText: function() {
                return this.model.entryById.errorText || '';
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(this.headerText);

                var template = this.compiledTemplate({
                    errorText: this._getErrorText()
                });
                this.$(Modal.BODY_SELECTOR).append(template);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">' + _('Retry').t() + '</a>');
                return this;
            }
        });
});
