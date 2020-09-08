define(
    [
        'underscore',
        'models/services/authentication/User',
        'models/services/server/ServerInfo',
        'collections/services/AppLocals'
    ],
    function(
        _,
        UserBaseModel,
        ServerInfoModel,
        AppLocalsCollection
    ) {
        var CORE_JS_APP_NAMES = {
            DATASETS_EXTENSIONS: 'splunk_datasets_addon'
        };
        
        var UserModel = UserBaseModel.extend({
            initialize: function(attributes, options) {
                UserBaseModel.prototype.initialize.apply(this, arguments);
                options = options || {};
                
                var serverInfoModel = options.serverInfoModel,
                    appLocalsCollection = options.appLocalsCollection;
                
                if (!serverInfoModel || !(serverInfoModel instanceof ServerInfoModel)) {
                    throw 'The following constructor arguments are required ({}, {serverInfoModel: <models/services/server/ServerInfo>}).';
                }
                this.associated.serverInfo = serverInfoModel;
                this.serverInfo = serverInfoModel;
                
                if (appLocalsCollection && (appLocalsCollection instanceof AppLocalsCollection)) {
                    this.associated.appLocals = appLocalsCollection;
                    this.appLocals = appLocalsCollection;
                }
            },
            
            canAddData: function() {
                // SystemMenu uses this.canEditMonitor to decide whether to show this link
                // Hunk uses Explore Data, not Add Data
                return (this.canUploadData() || this.canMonitorData() || this.canForwardData()) && !(this.serverInfo.isHunk());
            },
            
            canUploadData: function(){
                // The capabilities for the file upload workflow were changed to
                // allow cloud customers file upload access without having to give
                // full edit_tcp access. The on-prem product still uses the old
                // capabilities to avoid impacting existing customers.
                // The new capabilities, edit_upload_and_index & edit_tcp_stream,
                // are not defined on-prem. edit_tcp is not given on cloud.
                // So there should be no need for instance type check here.
                return ((this.hasCapability('edit_tcp') && this.hasCapability('edit_monitor'))
                    || (this.hasCapability('edit_upload_and_index') && this.hasCapability('edit_tcp_stream')));
            },
            
            canMonitorData: function() {
                // Same capabilities as datainputstats.xml (Data Inputs). Any changes to that xml file should be updated here as well.
                this.hasModularInputCapability();
                return (
                    this.canEditMonitor() ||
                    this.canEditTCP() ||
                    this.canEditUDP() ||
                    this.canEditScripts() ||
                    this.canEditHTTPTokens() ||
                    this.canEditWinEventLogCollections() ||
                    this.canEditWinRegistryMonitoring() ||
                    this.canEditWinRemotePerformanceMonitoring() ||
                    this.hasModularInputCapability()
                );
            },
            
            hasModularInputCapability: function(){
                var hasCapability = false;
                _.each(this.getCapabilities(), function(capability){
                    if (capability.indexOf('edit_modinput_') == 0){
                        hasCapability = true;
                        return;
                    }
                }.bind(this));
                return hasCapability;
            },
            
            canForwardData: function(){
                return this.hasCapability('edit_deployment_server');
            },

            canArchive: function () {
                // Checking for Hadoop add-on to determine if archiving is on.
                return this.serverInfo.isEnterpriseCloud() && this.serverInfo.hasHadoopAddon();
            },
            
            canEditArchives: function(){
                // Check if user can edit archives
                return this.canArchive() && this.hasCapability('edit_archives');
            },
            
            canViewArchives: function(){
                // Check if user can view archives
                return this.canArchive() && this.hasCapability('list_archives');
            },
            
            canEditIndexes: function () {
                return this.hasCapability('indexes_edit');
            },

            isHunkAdmin: function() {
                return !this.isFree() && this.serverInfo.hasHadoopAddon() &&
                    !this.serverInfo.isCloud() && this.isAdmin();
            },

            canExploreData: function() {
                // Hunk uses Explore Data, not Add Data
                return this.isHunkAdmin();
            },

            canUseVirtualIndexes: function() {
                return this.isHunkAdmin();
            },
            
            canUseApps: function() {
                // Previously, apps were hidden in Splunk Light. Now that apps are supported in Splunk Light,
                // we always return true here. Keep this method for any future use, if eventually, we create
                // a 'can_use_apps' capability for example.
                return true;
            },
            
            supportsOutputGroups: function() {
                if (this.serverInfo.isLite() || !this.hasCapability('list_forwarders')) {
                    return false;
                }
                return true;
            },
            
            canUseAlerts: function() {
                return !(this.serverInfo.isLiteFree() || this.serverInfo.isFreeLicense() || this.serverInfo.hasForwarderLicense());
            },
            
            canPivot: function() {
                if (this.serverInfo.isLite()) {
                    return false;
                }
                return true;
            },
            
            canSchedulePDF: function() {
                return (!this.serverInfo.isLiteFree() && this.canScheduleSearch());
            },
            
            canUseSidenav: function() {
                if (this.serverInfo.isLite()) {
                    return true;
                }
                return false;
            },
            
            canManageLicenses: function() {
                if (this.hasCapability('license_edit')) {
                    return true;
                }
                return false;
            },
            
            canViewLicense: function() {
                if (this.hasCapability('license_view_warnings') || this.hasCapability('license_edit')) {
                    return true;
                }
                return false;
            },
            
            canLiveTail: function() {
                if (this.serverInfo.isLite() && this.canRTSearch()) {
                    return true;
                }
                return false;
            },
            
            canAccessAppWithName: function(appname) {
                var app;
                
                if (this.appLocals) {
                    app = this.appLocals.find(function(app) {
                        return app.entry.get('name') === appname;
                    });
                    
                    return !!app;
                } 
                
                return false;
            },
            
            canAccessSplunkDatasetExtensions: function() {
                return this.canAccessAppWithName(CORE_JS_APP_NAMES.DATASETS_EXTENSIONS);
            }
        },
        {
            CORE_JS_APP_NAMES: CORE_JS_APP_NAMES
        });
        
        return UserModel;
    }
);
