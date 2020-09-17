define(
    [
        'underscore',
        'module',
        'views/Base',
        'util/splunkd_utils',
        'splunk.util'
    ],
    function(_, module, Base, splunkDUtils, splunkUtil) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'span',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                var render = _.debounce(this.render, 0);
                this.model.report.entry.acl.on('change:sharing change:owner', render, this);
            },
            render: function() {
                var isLite = this.model.serverInfo && this.model.serverInfo.isLite();

                var sharing = this.model.report.entry.acl.get("sharing"),
                    owner = this.model.report.entry.acl.get("owner"),
                    canUseApps = this.model.user.canUseApps();

                if (sharing == 'app' && !canUseApps) {
                    sharing = 'system';
                }
                
                var permissionString = splunkDUtils.getPermissionLabel(sharing, owner);
                    
                this.$el.html(this.compiledTemplate({
                    permissionString: permissionString
                }));
                return this;
            },
            template: '\
               <%- permissionString %>\
            '
        });
    }
);
