define([
    'jquery',
    'underscore',
    'module',
    'views/shared/ModalLocalClassNames',
    'views/shared/RestartContents',
    'splunk.util'
],
    function(
        $,
        _,
        module,
        Modal,
        RestartContents,
        SplunkUtil
        ) {
        return Modal.extend({
            moduleId: module.id,
            initialize: function(options) {
                this.options.showCloseButton = false;
                this.options.closeOnEscape = false;
                this.options.title = SplunkUtil.sprintf(_('Restarting %s...').t(), this.model.serverInfo.getProductName());
                this.options.bodyView = new RestartContents({
                    model: {
                        serverInfo: this.model.serverInfo
                    }
                });
                Modal.prototype.initialize.call(this, options);
            }
        });
    });
