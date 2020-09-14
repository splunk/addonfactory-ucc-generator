define([
    'underscore',
    'module',
    'views/shared/apps_remote/dialog/Error',
    'splunk.util'
],
    function(
        _,
        module,
        ErrorView,
        splunkUtils
        ) {
        return ErrorView.extend({
            moduleId: module.id,
            _getErrorText: function() {
                var errorText = this.model.entryById.errorText || '';
                if (errorText.indexOf('already exists') > -1) {
                    errorText = splunkUtils.sprintf(_('%s is already installed.').t(), this.appRemoteType);
                }
                return errorText;
            }
        });
});
