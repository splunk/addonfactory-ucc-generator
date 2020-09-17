define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'splunk.util',
        'views/shared/Modal'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        splunkUtil,
        Modal
    ) {
        return Modal.extend({
            moduleId: module.id,

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_.escape(_('Uninstall Completed').t()));

                this.$(Modal.BODY_SELECTOR).append(splunkUtil.sprintf(_('<b>%s</b> (version %s) uninstall is complete. Verify the status of the deployment by clicking on the Last Deployment Status button.').t(),
                    _.escape(this.options.appLabel),
                    _.escape(this.options.appVersion)
                ));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CLOSE);

                return this;
            }
        });
    }
);