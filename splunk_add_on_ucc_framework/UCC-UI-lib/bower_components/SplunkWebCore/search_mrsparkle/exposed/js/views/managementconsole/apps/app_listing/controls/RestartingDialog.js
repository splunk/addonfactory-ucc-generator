define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'splunk.util',
        'views/shared/Modal',
        'views/shared/waitspinner/Master',
        './RestartingDialog.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        splunkUtil,
        Modal,
        WaitSpinner,
        css
    ) {
        return Modal.extend({
            moduleId: module.id,
            className: [Modal.CLASS_NAME, 'restarting-dialog'].join(' '),

            initialize: function(options) {
                Modal.prototype.initialize.call(this, options);

                this.waitspinner = new WaitSpinner({
                    color: 'green',
                    size: 'medium',
                    frameWidth: 19
                });

                this.listenTo(this.model.deployTask.entry.content, 'change:state', function() {
                    var state = this.model.deployTask.entry.content.get('state');
                    if (state === 'completed' || state === 'failed') {
                        this.onTaskCompleted();
                    }
                }.bind(this));
            },

            onTaskCompleted: function() {
                _.isFunction(this.options.onTaskCompleted) && this.options.onTaskCompleted.apply(this, arguments);
                this.hide();
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_.escape(_('Uninstalling app...').t()));

                this.$(Modal.BUTTON_CLOSE_SELECTOR).remove();

                this.$(Modal.BODY_SELECTOR).append(splunkUtil.sprintf(_('<b>%s</b> (version %s) is being uninstalled. This might take several minutes and cause Splunk Cloud to restart. Please do not navigate away from this page until app uninstall is complete.').t(),
                    _.escape(this.model.app.getAppLabel()),
                    _.escape(this.model.app.getVersion())
                ));

                this.$(Modal.BODY_SELECTOR).append(this.waitspinner.render().el);
                this.waitspinner.start();

                return this;
            }
        });
    }
);