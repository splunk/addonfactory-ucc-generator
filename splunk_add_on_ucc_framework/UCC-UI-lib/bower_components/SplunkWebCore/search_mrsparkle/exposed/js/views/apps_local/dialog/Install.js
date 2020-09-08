define([
    'underscore',
    'module',
    'views/shared/apps_remote/dialog/Install',
    'splunk.util'
],
    function(
        _,
        module,
        InstallView,
        splunkUtils
        ) {
        return InstallView.extend({
            moduleId: module.id,
            initialize: function(options) {
                InstallView.prototype.initialize.call(this, options);
                this.headerText = splunkUtils.sprintf('%s %s...', _("Installing").t(), this.options.appType);
            }
        });
    });
