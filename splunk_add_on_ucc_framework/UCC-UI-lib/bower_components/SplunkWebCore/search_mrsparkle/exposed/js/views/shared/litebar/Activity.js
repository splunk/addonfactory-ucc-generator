define(
[
    'underscore',
    'module',
    'views/shared/litebar/SystemSection',
    'models/SplunkDBase',
    'uri/route'
],
function(
    _,
    module,
    SystemSection,
    BaseModel,
    route
){
    return SystemSection.extend({
        moduleId: module.id,
        id: 'activity',
        initialize: function(options) {
            this.model = new BaseModel();
            this.model.set('label', _('Activity').t());

            var isAdmin = this.options.model.user.isAdmin() || this.options.model.user.isCloudAdmin(),
                app = (this.options.model.application.get('app') == 'system') ? 'search' : this.options.model.application.get('app'),
                root = this.options.model.application.get('root'),
                locale = this.options.model.application.get('locale'),
                items = [],
                jobsModel = new BaseModel(),
                jobLink = route.page(root, locale, app, 'job_manager');

            jobsModel.entry.content.set('menu.label', 'Jobs');
            jobsModel.entry.set('name', 'jobs');
            jobsModel.set('url', jobLink);
            items.push(jobsModel);

            if (this.options.model.user.canUseAlerts()) {
                var alertsLink = route.triggeredAlerts(root, locale, app),
                    alertsModel = new BaseModel();

                alertsModel.entry.content.set('menu.label', 'Triggered alerts');
                alertsModel.entry.set('name', 'alerts');
                alertsModel.set('url', alertsLink);
                items.push(alertsModel);
            }

            if (isAdmin && !this.options.model.user.serverInfo.isLiteFree()) {
                // only build systemActivityLink if the user is admin
                var systemActivityLink = route.page(root, locale, 'splunk_monitoring_console', 'scheduler_activity_instance'),
                    systemActivityModel = new BaseModel();

                systemActivityModel.entry.content.set('menu.label', 'System activity');
                systemActivityModel.entry.set('name', 'systemActivity');
                systemActivityModel.set('url', systemActivityLink);
                items.push(systemActivityModel);
            }

            this.model.set('items', items);
            SystemSection.prototype.initialize.apply(this, arguments);
        }
    });
});
