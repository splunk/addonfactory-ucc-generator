define([
    'underscore',
    'models/SplunkDBase',
    'splunk.util'
],
function(_, SplunkDBaseModel, splunkUtil) {
    var UserModel = SplunkDBaseModel.extend({
        FREE_PAYLOAD: {
            "links": {
                "create": "/services/authentication/users/_new"
            },
            "generator": {},
            "entry": [
                {
                    "name": "admin",
                    "links": {
                        "alternate": "/services/authentication/users/admin",
                        "list": "/services/authentication/users/admin",
                        "edit": "/services/authentication/users/admin"
                    },
                    "author": "system",
                    "acl": {
                        "app": "",
                        "can_list": true,
                        "can_write": true,
                        "modifiable": false,
                        "owner": "system",
                        "perms": {
                            "read": [
                                "*"
                            ],
                            "write": [
                                "*"
                            ]
                        },
                        "removable": false,
                        "sharing": "system"
                    },
                    "fields": {
                        "required": [],
                        "optional": [
                            "defaultApp",
                            "email",
                            "password",
                            "realname",
                            "restart_background_jobs",
                            "roles",
                            "tz"
                        ],
                        "wildcard": []
                    },
                    "content": {
                        "isFree": true,
                        "capabilities": [],
                        "defaultApp": "launcher",
                        "defaultAppIsUserOverride": false,
                        "defaultAppSourceRole": "system",
                        "eai:acl": null,
                        "email": "changeme@example.com",
                        "password": "********",
                        "realname": "Administrator",
                        "restart_background_jobs": true,
                        "roles": [
                            "admin"
                        ],
                        "type": "Splunk",
                        "tz": ""
                    }
                }
            ],
            "paging": {
                "total": 1,
                "perPage": 30,
                "offset": 0
            },
            "messages": []
        },
        url: "authentication/users",
        urlRoot: "authentication/users",/* for some unknown reason, base model checks for urlRoot existance... which chokes manager pages fetching User Model */
        initialize: function() {
            SplunkDBaseModel.prototype.initialize.apply(this, arguments);
        },
        sync: function(method, model, options) {
            // without this option the UI appends a suffix to array field names, i.e. 'roles' becomes 'roles[]'
            // which is not liked by the users endpoint
            options = options || {};
            if (method === 'update' || method === 'patch' || method === 'create') {
                options.traditional = true;
            }
            return SplunkDBaseModel.prototype.sync.call(this, method, model, options);
        },
        getCapabilities: function() {
            return this.entry.content.get('capabilities') || [];
        },
        hasCapability: function(capability) {
            if (this.isFree()) {
                return true;
            }
            return this.isNew() || (_.indexOf(this.getCapabilities(), capability) !== -1);
        },
        getRoles: function() {
            return this.entry.content.get('roles') || [];
        },
        hasRole: function(role) {
            if (this.isFree()) {
                return true;
            }
            return this.isNew() || (_.indexOf(this.getRoles(), role) !== -1);
        },
        isAdmin: function() {
            return this.hasRole('admin');
        },
        isAdminLike: function() {
            return this.hasCapability('admin_all_objects');
        },
        isCloudAdmin: function() {
            return this.hasRole('sc_admin') && this.serverInfo.isCloud();
        },
        canViewACL: function() {
            if (this.isFree()) {
                return false;
            }
            return true;
        },
        canEditDispatchAs: function() {
            if (this.isFree()) {
                return false;
            }
            return true;
        },
        //the ability to run searches.
        canSearch: function() {
            return this.hasCapability("search");
        },
        //the ability to run real-time searches.
        canRTSearch: function() {
            return this.hasCapability("rtsearch");
        },
        canScheduleRTSearch: function() {
            return this.hasCapability("schedule_rtsearch");
        },
        //the ability to schedule saved searches, create and update alerts, review triggered alert information, and turn on report acceleration for searches.
        canScheduleSearch: function() {
            if (this.isFree()) {
                return false;
            }
            return this.hasCapability("schedule_search");
        },
        //the ability to add new or edit existing inputs
        canEditMonitor: function() {
            return this.hasCapability("edit_monitor");
        },
        canEditTCP: function(){
            return this.hasCapability('edit_tcp');
        },
        canEditUDP: function(){
            return this.hasCapability('edit_udp');
        },
        canEditScripts: function(){
            return this.hasCapability('edit_scripted');
        },
        canEditHTTPTokens: function(){
            return this.hasCapability('edit_token_http');
        },
        canEditWinActiveDirectoryMonitoring: function(){
            return this.hasCapability("edit_modinput_admon");
        },
        canEditWinEventLogCollections: function(){
            return this.hasCapability('edit_win_eventlogs');
        },
        canEditWinHostMonitoring: function(){
            return this.hasCapability('edit_modinput_winhostmon');
        },
        canEditWinLocalPerformanceMonitoring: function(){
            return this.hasCapability('edit_modinput_perfmon');
        },
        canEditWinNetworkMonitoring: function(){
            return this.hasCapability('edit_modinput_winnetmon');
        },
        canEditWinPrintMonitoring: function(){
            return this.hasCapability('edit_modinput_winprintmon');
        },
        canEditWinRegistryMonitoring: function(){
            return this.hasCapability('edit_win_regmon');
        },
        canEditWinRemotePerformanceMonitoring: function(){
            // Maps to admin_win-wmi-collections.xml
            return this.hasCapability('edit_win_wmiconf');
        },
        canViewRemoteApps: function () {
            return this.hasCapability("rest_apps_view");
        },
        canManageRemoteApps: function() {
            return this.hasCapability("rest_apps_management");
        },
        canAccelerateDataModel: function() {
            if (this.isFree()) {
                return false;
            }
            return this.hasCapability("accelerate_datamodel");
        },
        //the ability to accelerate searches.
        canAccelerateReport: function() {
            if (this.isFree()) {
                return false;
            }
            return this.hasCapability("accelerate_search") && this.hasCapability("schedule_search");
        },
        canEmbed: function () {
            if (this.isFree()) {
                return false;
            }
            return this.hasCapability("embed_report");
        },
        canEditViewHtml: function () {
            return this.hasCapability("edit_view_html");
        },
        canPatternDetect: function() {
            return this.hasCapability("pattern_detect");
        },
        canEditUsers: function() {
            return this.hasCapability('edit_user');
        },
        canEditServer: function() {
            return this.hasCapability('edit_server');
        },
        canRestart: function() {
            return this.hasCapability('restart_splunkd');
        },
        canEditReceiving: function() {
            return this.hasCapability('edit_splunktcp');
        },
        canExportResults: function() {
            return this.hasCapability('export_results_is_visible');
        },
        canEditSearchSchedulePriority: function() {
            return this.hasCapability('edit_search_schedule_priority');
        },
        canEditSearchScheduleWindow: function() {
            return this.hasCapability('edit_search_schedule_window');
        },
        canEditInstrumentation: function() {
            return this.hasCapability('edit_telemetry_settings');
        },
        getSearchSyntaxHighlighting: function() {
            if (this.isFree()) {
                return true;
            }
            return this.entry.content.get('search_syntax_highlighting');
        },
        getSearchAssistant: function() {
            if (this.isFree()) {
                return UserModel.SEARCH_ASSISTANT.COMPACT;
            }
            return this.entry.content.get('search_assistant');
        },
        getSearchLineNumbers: function() {
            if (this.isFree()) {
                return true;
            }
            return this.entry.content.get('search_line_numbers');
        },
        getSearchAutoFormat: function() {
            if (this.isFree()) {
                return true;
            }
            return this.entry.content.get('search_auto_format');
        },
        isFree: function() {
            return (this.entry.content.get("isFree") === true);
        },
        getUserid: function () {
            return this.entry.get('name');
        },
        getUserName: function () {
            return this.entry.content.get('realname') || '';
        },
        getLabel: function () {
            var id = this.getUserid();
            var name = this.getUserName();
            if (_.isUndefined(id)) {
                return '';
            } else {
                return splunkUtil.sprintf('%s (%s)', name, id);
            }
        },
        getValue: function () {
            return this.getUserid();
        }
    },{
        SEARCH_ASSISTANT: {
            FULL: 'full',
            COMPACT: 'compact',
            NONE: 'none'
        }
    });
    return UserModel;
});
