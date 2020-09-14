define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/virtual_indexes/ProviderThrottling',
        './forms/ProviderAdditionalSettings',
        './forms/ProviderNewSettings',
        'views/virtual_indexes/custom_controls/BandwidthControl',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/Section',
        'views/shared/FlashMessages',
        'contrib/text!views/virtual_indexes/config/ProviderSetup.html',
        'uri/route',
        '../shared.pcss',
        './ProviderSetup.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        ProviderThrottling,
        ProviderAdditionalSettings,
        ProviderNewSettings,
        BandwidthControl,
        BaseView,
        ControlGroup,
        Section,
        FlashMessagesView,
        Template,
        route,
        cssShared,
        css
        ){
        var HADOOP_1X = '$SPLUNK_HOME/bin/jars/SplunkMR-h1.jar';
        var HADOOP_2X = '$SPLUNK_HOME/bin/jars/SplunkMR-h2.jar';
        var HADOOP_2X_YARN = '$SPLUNK_HOME/bin/jars/SplunkMR-hy2.jar';
        var HADOOP_VERSION = 'vix.command.arg.3';
        var JOB_TRACKER = 'vix.mapred.job.tracker';
        var KERBEROS_AUTHORIZATION = 'vix.hadoop.security.authorization';
        var KERBEROS_MODE = 'vix.hadoop.security.authentication';
        var KERBEROS_MODE_DEFAULT = 'kerberos';
        var KERBEROS_SERVER_NAME = 'vix.javaprops.java.security.krb5.kdc';
        var KERBEROS_REALM = 'vix.javaprops.java.security.krb5.realm';
        var KERBEROS_MAPREDUCE_PRINCIPAL = 'vix.mapreduce.jobtracker.kerberos.principal';
        var OLD_KERBEROS_SERVER_NAME = 'vix.java.security.krb5.kdc';
        var OLD_KERBEROS_REALM = 'vix.java.security.krb5.realm';
        var KERBEROS_CONFIGURATION_FILE_PATH = 'vix.javaprops.java.security.krb5.conf';
        var KERBEROS_CONFIG_SWITCH = 'kerberos.config';
        var KERBEROS_CONFIG_SWITCH_SERVER_NAME_AND_REALM = '1';
        var KERBEROS_CONFIG_SWITCH_FILE_PATH = '2';
        var VIX_PREFIX = "vix.";
        var ENABLE_THROTTLING = "enableThrottling";
        var MAX_NETWORK_BANDWIDTH = "vix.output.buckets.max.network.bandwidth";
        var HUNK_THIRDPARTY_JARS_1X = '$SPLUNK_HOME/bin/jars/thirdparty/common/avro-1.7.7.jar,$SPLUNK_HOME/bin/jars/thirdparty/common/avro-mapred-1.7.7.jar,$SPLUNK_HOME/bin/jars/thirdparty/common/commons-compress-1.10.jar,$SPLUNK_HOME/bin/jars/thirdparty/common/commons-io-2.4.jar,$SPLUNK_HOME/bin/jars/thirdparty/common/libfb303-0.9.2.jar,$SPLUNK_HOME/bin/jars/thirdparty/common/parquet-hive-bundle-1.6.0.jar,$SPLUNK_HOME/bin/jars/thirdparty/common/snappy-java-1.1.1.7.jar,$SPLUNK_HOME/bin/jars/thirdparty/hive/hive-exec-0.12.0.jar,$SPLUNK_HOME/bin/jars/thirdparty/hive/hive-metastore-0.12.0.jar,$SPLUNK_HOME/bin/jars/thirdparty/hive/hive-serde-0.12.0.jar';
        var HUNK_THIRDPARTY_JARS_2X = '$SPLUNK_HOME/bin/jars/thirdparty/common/avro-1.7.7.jar,$SPLUNK_HOME/bin/jars/thirdparty/common/avro-mapred-1.7.7.jar,$SPLUNK_HOME/bin/jars/thirdparty/common/commons-compress-1.10.jar,$SPLUNK_HOME/bin/jars/thirdparty/common/commons-io-2.4.jar,$SPLUNK_HOME/bin/jars/thirdparty/common/libfb303-0.9.2.jar,$SPLUNK_HOME/bin/jars/thirdparty/common/parquet-hive-bundle-1.6.0.jar,$SPLUNK_HOME/bin/jars/thirdparty/common/snappy-java-1.1.1.7.jar,$SPLUNK_HOME/bin/jars/thirdparty/hive_1_2/hive-exec-1.2.1.jar,$SPLUNK_HOME/bin/jars/thirdparty/hive_1_2/hive-metastore-1.2.1.jar,$SPLUNK_HOME/bin/jars/thirdparty/hive_1_2/hive-serde-1.2.1.jar';

        return BaseView.extend({
            moduleId: module.id,
            template: Template,
            /**
             * @param {Object} options {
             *
             * }
             */
            initialize: function() {

                // TODO: change Kerberos section into two sections ERP-582
                BaseView.prototype.initialize.apply(this, arguments);

                var maxBandwidth = this.model.provider.entry.content.get(MAX_NETWORK_BANDWIDTH);

                this.formModel = new Backbone.Model(); // event bus
                this.model.throttling = new ProviderThrottling();
                this.model.throttling.initializeAttributesFromProvider(this.model.provider.entry.content);
                this.sections = {};

                this._initFlashMessage();
                this._initBasic();
                this._initThrottling();
                this._initEnvVars();
                this._initProviderPaths();
                this._initSplunkSettings();
                this._initKerberosSettings();
                this._initAdditionalSettings();

                // trigger 'loadComplete' when all the sections reportedly finish loading
                var sectionDfds = _.map(this.sections, function(section) {
                    return section.getLoadStatusDfd();
                }, this);
                $.when.apply($, sectionDfds).then(function(schemas) {
                    this.formModel.trigger('loadComplete');
                }.bind(this));

                // the dropdown associated with this model attribute toggles visibility of several sections
                this.model.provider.entry.content.on('change:vix.family', this._onChangeFamily, this);

                this.model.provider.on('change', function() {
                    if (this.options.mode !== 'edit') {
                        this.model.provider.entry.set('name','');
                    }
                    // preserve events in subviews while rerendering
                    var adminContent = this.$('.admin-content').detach();
                    this.render();
                    this.$('.admin-content').replaceWith(adminContent);
                }, this);

                this.listenTo(this.model.provider.entry.content,
                    'change:' + KERBEROS_AUTHORIZATION,
                    this._toggleKerberosSectionAndMode);

                /**
                 * ERP-391: when user chooses 'Hadoop 2.x, (Yarn)', we remove 'Job Tracker' field and add three more
                 * attributes in the additional settings.
                 */
                this.listenTo(this.model.provider.entry.content,
                    'change:' + HADOOP_VERSION,
                    this._onChangeHadoopVersion);

                this.listenTo(this.model.provider.entry.content,
                    'change:' + OLD_KERBEROS_SERVER_NAME + ' change:' + OLD_KERBEROS_REALM,
                    this._syncOldKerberosAttributes);

                this.listenTo(this.formModel,
                    'change:' + KERBEROS_CONFIG_SWITCH,
                    this._onChooseKerberosConfigSwitch);

                this.listenTo(this.model.throttling,
                    'change:' + ENABLE_THROTTLING,
                    this._onEnableThrottlingChanged);
            },

            events: {
                'click .btn-primary': function(e) {
                    //on save, check if all required elements are input
                    e.preventDefault();

                    // Set the additional settings and new settings back into the provider model
                    this.model.provider.entry.content.set(this.model.additionalSettings.attributes);
                    this.model.provider.entry.content.set(this.model.newSettings.attributes);

                    var validThrottling = this.model.throttling.set({}, {validate:true});
                    var validEntry = this.model.provider.entry.set({}, {validate: true});
                    var validContent = this.model.provider.entry.content.set({}, {validate: true});

                    if(validThrottling && validEntry && validContent) {

                        // Copy values from throttling over to provider
                        this.model.provider.entry.content.set(this.model.throttling.getAttributesForProvider());

                        this.model.provider.save({}, {silent: true}).done(function(){
                            window.location.href = this._getVirtualIndexesRoute();
                        }.bind(this));
                        $('html, body').animate({ scrollTop: 0 }, 'fast');
                    }
                },
                'click .cancel': function(e) {
                    e.preventDefault();
                    window.location.href = this._getVirtualIndexesRoute();
                }
            },

            onAddedToDocument: function() {

                BaseView.prototype.onAddedToDocument.apply(this, arguments);

                this._onChangeFamily();
            },


            /*
             For 'Additional settings' we want to get all the model attributes that are not included into any of the ControlGroups.
             This method returns the list of attributes already used that should be excluded.
             */
            _getChildrenAttributes: function() {
                return _.map(this.children, function(child) {
                    if (child.hasOwnProperty('childList')) {
                        return child.childList[0].getModelAttribute();
                    }
                    return '';
                });
            },

            _managerRoute: function(page, options) {
                return route.manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'system',
                    page,
                    options
                );
            },

            _getVirtualIndexesRoute: function() {
                return route.manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'system',
                    'virtual_indexes',
                    {
                        data:
                        {
                            t: 'providers'
                        }
                    });
            },


            _initFlashMessage: function() {
                this.children.flashMessages = new FlashMessagesView({ model: {provider: this.model.provider,
                                                                              content: this.model.provider.entry.content,
                                                                              throttling: this.model.throttling} });
            },

            _initBasic: function() { // Name and family
                this.children.name = new ControlGroup({
                    className: 'prov-name control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'name',
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('Name').t()
                });

                this.children.description = new ControlGroup({
                    className: 'provider-description control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.description',
                        model: this.model.provider.entry.content,
                        save: false,
                        placeholder: 'optional'
                    },
                    label: _('Description').t()
                });

                this.familyNames = this.collection.indexesConf.map(function(model) {
                    var name = model.entry.get('name').match(/provider-family:(.*)/)[1];
                    return {label: name, value: name};
                });
                this.children.family = new ControlGroup({
                    className: 'prov-family control-group',
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.family',
                        model: this.model.provider.entry.content,
                        items: this.familyNames,
                        className: 'btn-group view-count',
                        menuWidth: 'narrow',
                        toggleClassName: 'btn'
                    },
                    label: _("Provider Family").t()
                });
                // notify the section of loading complete
                this.formModel.trigger('update', 'family');

                // make the first element submitted by default
                if (!this.model.provider.entry.content.get('vix.family') && this.familyNames && this.familyNames.length>0) {
                    this.model.provider.entry.content.set('vix.family', this.familyNames[0].value);
                }

                if (this.familyNames.length <= 1) {
                    this.children.family.disable();
                } else {
                    this.children.family.enable();
                }

                this.sections.basic = new Section({
                    label: '',
                    id: 'basic',
                    children: this.children,
                    model: {
                        form: this.formModel,
                        data: this.model.provider
                    },
                    order: ['name', 'description', 'family']
                });
            },

            _initThrottling: function() {

                this.children.enableThrottling = new ControlGroup({
                    className: 'prov-enable-throttling control-group',
                    controlType: 'SyntheticCheckbox',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: ENABLE_THROTTLING,
                        model: this.model.throttling,
                        save: false,
                        label: _('Enable Archive Bandwidth Throttling').t()
                    }
                });

                this.children.throttling = new ControlGroup({
                    className: 'bandwidth-throttling control-group',
                    controlClass: 'controls-block',
                    controls: [new BandwidthControl({model: this.model.throttling,
                        modelAttribute: "maxBandwidth"})],
                    label: _('Max Archiving Bandwidth').t(),
                    tooltip:_('Specify the amount of bandwidth to give to archived indexes associated with this provider').t()
                });

                this.sections.archiving = new Section({
                    label: _('Archiving Settings').t(),
                    id: 'archiving',
                    children: this.children,
                    order: ['enableThrottling', 'throttling']
                });
            },

            _initEnvVars: function() {
                this.children.javaHome = new ControlGroup({
                    className: 'prov-java-home control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.env.JAVA_HOME',
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('Java Home').t(),
                    help: _('Example: /usr/jdk').t()
                });

                this.children.hadoopHome = new ControlGroup({
                    className: 'prov-hadoop-home control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.env.HADOOP_HOME',
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('Hadoop Home').t(),
                    help: _('Example: /usr/hadoop').t()
                });

                this.sections.envVars = new Section({
                    label: _('Environment Variables').t(),
                    id: 'env-vars',
                    children: this.children,
                    model: {
                        data: this.model.provider
                    },
                    order: ['javaHome', 'hadoopHome']
                });
            },

            _initProviderPaths: function() {
                this.children.hadoopVersion = new ControlGroup({
                    className: 'prov-hadoop-version control-group',
                    controlType: 'SyntheticSelect',
                    controlOptions: {
                        modelAttribute: HADOOP_VERSION,
                        model: this.model.provider.entry.content,
                        items:[
                            {label: _('Hadoop 1.x, (MRv1)').t(), value: HADOOP_1X},
                            {label: _('Hadoop 2.x, (MRv1)').t(), value: HADOOP_2X},
                            {label: _('Hadoop 2.x, (Yarn)').t(), value: HADOOP_2X_YARN}
                        ],
                        className: 'btn-group view-count',
                        menuWidth: 'narrow',
                        toggleClassName: 'btn'
                    },
                    label: _("Hadoop Version").t()
                });

                this.children.jobTracker = new ControlGroup({
                    className: 'prov-job-tracker control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: JOB_TRACKER,
                        model: this.model.provider.entry.content,
                        save: false,
                        placeholder: 'optional'
                    },
                    label: _('Job Tracker').t(),
                    help: _('Example: jobtracker.example.com:8021').t()
                });

                this.children.fileSystem = new ControlGroup({
                    className: 'prov-file-system control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.fs.default.name',
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('File System').t(),
                    help: _('Example: hdfs://namenode.example.com:8020').t()
                });

                this.children.enablePassThrough = new ControlGroup({
                    className: 'control-group',
                    controlType: 'SyntheticCheckbox',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.splunk.impersonation',
                        model: this.model.provider.entry.content,
                        label: _('Enable Pass Through Authentication').t()
                    }

                });

                this.children.resourceManager = new ControlGroup({
                    className: 'prov-resource-manager control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.yarn.resourcemanager.address',
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('Resource Manager Address').t(),
                    help: _('').t()
                });

                this.children.resourceScheduler = new ControlGroup({
                    className: 'prov-resource-scheduler control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.yarn.resourcemanager.scheduler.address',
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('Resource Scheduler Address').t(),
                    help: _('').t()
                });

                this.sections.providerPaths = new Section({
                    label: _('Hadoop Cluster Information').t(),
                    id: 'provider-paths',
                    children: this.children,
                    model: {
                        data: this.model.provider
                    },
                    order: ['hadoopVersion', 'jobTracker', 'fileSystem', 'enablePassThrough', 'resourceManager', 'resourceScheduler']
                });
            },

            _initSplunkSettings: function() {
                this.children.homeHdfs = new ControlGroup({
                    className: 'prov-home-hdfs control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.splunk.home.hdfs',
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('HDFS Working Directory').t(),
                    help: _('Example: /user/splunk/hunk-01.example.com/').t(),
                    tooltip: _('Path in HDFS that you want this provider to use as it\'s workspace').t()
                });

                this.children.jobQueue = new ControlGroup({
                    className: 'prov-job-queue control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.mapred.job.queue.name',
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('Job Queue').t(),
                    help: _('Example: highPriorityQ').t(),
                    tooltip: _('Job queue where MapReduce jobs of this provider get submitted to').t()
                });

                this.sections.splunkSettings = new Section({
                    label: _('Splunk Settings').t(),
                    id: 'splunk-settings',
                    children: this.children,
                    model: {
                        data: this.model.provider
                    },
                    order: ['homeHdfs', 'jobQueue']
                });
            },

            _initKerberosSettings: function() {
                // this is to control Kerberos Settings show/hide
                this.children.addSecureCluster = new ControlGroup({
                    className: 'prov-secure-cluster control-group',
                    controlType: 'SyntheticCheckbox',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: KERBEROS_AUTHORIZATION,
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('Add Secure Cluster').t()
                });

                this.children.kerberosMode = new ControlGroup({
                    className: 'prov-kerberos-mode control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: KERBEROS_MODE,
                        model: this.model.provider.entry.content,
                        placeholder: KERBEROS_MODE_DEFAULT,
                        useSyntheticPlaceholder: true,
                        defaultValue: KERBEROS_MODE_DEFAULT,
                        save: false
                    },
                    label: _('Mode').t(),
                    help: _('').t(),
                    tooltip: _('').t()
                });

                this.children.kerberosConfig = new ControlGroup({
                    className: 'prov-kerberos-config control-group',
                    controlType: 'SyntheticSelect',
                    controlOptions: {
                        modelAttribute: KERBEROS_CONFIG_SWITCH,
                        model: this.formModel,
                        items:[
                            {label: _('------ Choose ------ ').t(), value: null, enabled: false},
                            {label: _('Server Name and Realm').t(), value: KERBEROS_CONFIG_SWITCH_SERVER_NAME_AND_REALM},
                            {label: _('Configuration File Path').t(), value: KERBEROS_CONFIG_SWITCH_FILE_PATH}
                        ],
                        className: 'btn-group view-count',
                        toggleClassName: 'btn'
                    },
                    label: _('').t()
                });

                this.children.kerberosServerName = new ControlGroup({
                    className: 'prov-kerberos-server-name control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: KERBEROS_SERVER_NAME,
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('Kerberos Server Name').t(),
                    help: _('').t(),
                    tooltip: _('').t()
                });

                this.children.kerberosDefaultRealm = new ControlGroup({
                    className: 'prov-kerberos-default-realm control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: KERBEROS_REALM,
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('Kerberos Default Realm').t(),
                    help: _('').t(),
                    tooltip: _('').t()
                });

                // ERP-582: Configuration File Path
                this.children.kerberosConfigurationFilePath = new ControlGroup({
                    className: 'prov-kerberos-configuration-file-path control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: KERBEROS_CONFIGURATION_FILE_PATH,
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('Kerberos Configuration File Path').t(),
                    help: _('').t(),
                    tooltip: _('').t()
                });

                this.children.kerberosPrincipalName = new ControlGroup({
                    className: 'prov-kerberos-principal-name control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.kerberos.principal',
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('Kerberos Principal Name').t(),
                    help: _('').t(),
                    tooltip: _('').t()
                });

                this.children.kerberosKeytabPath = new ControlGroup({
                    className: 'prov-kerberos-keytab-path control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.kerberos.keytab',
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('Kerberos Keytab Path').t(),
                    help: _('').t(),
                    tooltip: _('').t()
                });

                this.children.hdfsPrincipal = new ControlGroup({
                    className: 'prov-hdfs-principal control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.dfs.namenode.kerberos.principal',
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('HDFS Principal').t(),
                    help: _('').t(),
                    tooltip: _('').t()
                });

                this.children.mapreducePrincipal = new ControlGroup({
                    className: 'prov-mapreduce-principal control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: KERBEROS_MAPREDUCE_PRINCIPAL,
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('MapReduce Principal').t(),
                    help: _('').t(),
                    tooltip: _('').t()
                });

                this.children.resourcemanagerPrincipal = new ControlGroup({
                    className: 'prov-resourcemanager-principal control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.yarn.resourcemanager.principal',
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('Resource Manager Principal').t(),
                    help: _('').t(),
                    tooltip: _('').t()
                });

                this.children.nodemanagerPrincipal = new ControlGroup({
                    className: 'prov-nodemanager-principal control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'vix.yarn.nodemanager.principal',
                        model: this.model.provider.entry.content,
                        save: false
                    },
                    label: _('Node Manager Principal').t(),
                    help: _('').t(),
                    tooltip: _('').t()
                });

                // Section
                this.sections.kerberosSettings = new Section({
                    label: _('Security Settings').t(),
                    id: 'kerberos-settings',
                    children: this.children,
                    model: {
                        data: this.model.provider.entry.content
                    },
                    order: ['kerberosMode', 'kerberosConfig', 'kerberosServerName', 'kerberosDefaultRealm', 'kerberosConfigurationFilePath', 'kerberosPrincipalName',
                        'kerberosKeytabPath', 'hdfsPrincipal', 'mapreducePrincipal', 'resourcemanagerPrincipal',
                        'nodemanagerPrincipal']
                });

            },

            _initAdditionalSettings: function() {
                // Pass filtered model. Omit attributes already displayed in the rest of the form. Filter out
                // attributes that don't start w/ "vix"
                var filteredKeys = this.model.provider.entry.content.keys().filter(function(key) {
                                                        return key.indexOf(VIX_PREFIX) == 0;
                                                    });
                var filteredAttrs = _(this.model.provider.entry.content.omit(this._getChildrenAttributes())).pick(filteredKeys);

                this.model.additionalSettings = new Backbone.Model(filteredAttrs);
                this.model.newSettings = new Backbone.Model();

                this.children.additionalSettingsView = new ProviderAdditionalSettings({model: this.model.additionalSettings});
                this.children.newSettingsView = new ProviderNewSettings({model: this.model.newSettings});

                this.sections.additionalSettings = new Section({
                    label: _('Additional Settings').t(),
                    id: 'additional-settings',
                    description: _('Additional settings for hadoop configuration. Refer to Hadoop mapred documentation for setting name and description.').t(),
                    children: this.children,
                    order: ['additionalSettingsView', 'newSettingsView']
                });

                // avoiding circular dependency
                this.sections.additionalSettings.loadStatusDfd.resolve();
            },

            _onChangeHadoopVersion: function() {
                // choose 'yarn'
                if (this.isYarn()) {
                    /** Hadoop Cluster Information section:
                     *   - remove job tracker
                     *   - add Resource Manager and Resource Scheduler
                     */
                    this.setJobTracker('');
                    this.children.jobTracker.$el.hide('fast');
                    this.children.resourceManager.$el.show('fast');
                    this.children.resourceScheduler.$el.show('fast');

                    /** Additional Settings section:
                     *   - add MapReduce framework name
                     */
                    if (!this.model.provider.entry.content.get('vix.mapreduce.framework.name')) {
                        this.model.provider.entry.content.set('vix.mapreduce.framework.name', 'yarn');
                    }
                    /** Additional Settings section:
                     *   - add thirdparty jars
                     */
                    this.updateHunkThirdpartyJars(HUNK_THIRDPARTY_JARS_2X);

                    /** Kerberos Settings section:
                     *   - remove MapReduce Principal
                     *   - add Resourcemanager Principal and Nodemanager Principal
                     */
                    this.setKerberosMapReducePrincipla('');
                    this.children.mapreducePrincipal.$el.hide('fast');
                    this.children.resourcemanagerPrincipal.$el.show('fast');
                    this.children.nodemanagerPrincipal.$el.show('fast');
                }
                else {  // not choose 'yarn'
                    /** Hadoop Cluster Information section:
                     *   - show job tracker
                     *   - hide Resource Manager and Resource Scheduler and remove attributes
                     */
                    this.children.jobTracker.$el.show('fast');
                    this.model.provider.entry.content.set('vix.yarn.resourcemanager.address', '');
                    this.model.provider.entry.content.set('vix.yarn.resourcemanager.scheduler.address', '');
                    this.children.resourceManager.$el.hide();
                    this.children.resourceScheduler.$el.hide();

                    /** Additional Settings section:
                     *   - remove MapReduce framework name
                     */
                    this.model.provider.entry.content.set('vix.mapreduce.framework.name', '');

                    /** Additional Settings section:
                     *   - update thirdparty jars updated for Hadoop2.x(MRv1) or Hadoop1.x
                     */
                    if (this.isHadoop2x()) {
                        this.updateHunkThirdpartyJars(HUNK_THIRDPARTY_JARS_2X);
                    } else {
                        this.updateHunkThirdpartyJars(HUNK_THIRDPARTY_JARS_1X);
                    }
                    /** Kerberos Settings section:
                     *   - show MapReduce Principal
                     *   - hide Resourcemanager Principal and Nodemanager Principal
                     */
                    this.children.mapreducePrincipal.$el.show('fast');
                    this.model.provider.entry.content.set('vix.yarn.resourcemanager.principal', '');
                    this.model.provider.entry.content.set('vix.yarn.nodemanager.principal', '');
                    this.children.resourcemanagerPrincipal.$el.hide('fast');
                    this.children.nodemanagerPrincipal.$el.hide('fast');
                }
            },

            _onChangeFamily: function() {
                var family = this.model.provider.entry.content.get('vix.family');
                if (family !== 'hadoop') {
                    this.sections.envVars.hide();
                    this.sections.providerPaths.hide();
                    this.sections.splunkSettings.hide();
                    $('#additional-settings p').hide(); // hide additional settings description for non-hadoop
                } else {
                    this.sections.envVars.show();
                    this.sections.providerPaths.show();
                    this.sections.splunkSettings.show();
                    $('#additional-settings p').show();
                }
            },

            _onChooseKerberosConfigSwitch: function() {
                var flag = this.formModel.get(KERBEROS_CONFIG_SWITCH);

                if (flag === KERBEROS_CONFIG_SWITCH_SERVER_NAME_AND_REALM) {
                    // hide configuration file path field
                    this.setKerberosConfigFilePath('');
                    this.children.kerberosConfigurationFilePath.$el.hide('fast');

                    this.children.kerberosServerName.$el.show('fast');
                    this.children.kerberosDefaultRealm.$el.show('fast');
                }

                if (flag === KERBEROS_CONFIG_SWITCH_FILE_PATH) {
                    this.setKerberosServerName('');
                    this.setKerberosRealm('');
                    this.children.kerberosServerName.$el.hide('fast');
                    this.children.kerberosDefaultRealm.$el.hide('fast');

                    this.children.kerberosConfigurationFilePath.$el.show('fast');
                }
            },

            _syncOldKerberosAttributes: function() {
                var oldServerName = this.model.provider.entry.content.get(OLD_KERBEROS_SERVER_NAME);
                var oldRealm = this.model.provider.entry.content.get(OLD_KERBEROS_REALM);
                var newServerName = this.model.provider.entry.content.get(KERBEROS_SERVER_NAME);
                var newRealm = this.model.provider.entry.content.get(KERBEROS_REALM);

                newServerName = newServerName || oldServerName;
                newRealm = newRealm || oldRealm;

                this.setKerberosServerName(newServerName);
                this.setKerberosRealm(newRealm);
            },

            _toggleKerberosSectionAndMode: function() {
                // show/hide section and set/unset kerberos mode
                var modeSwitch = this.model.provider.entry.content.get(KERBEROS_AUTHORIZATION);
                if (modeSwitch) {
                    this.sections.kerberosSettings.show();
                    this.setKerberosMode(KERBEROS_MODE_DEFAULT);
                }
                else {
                    this.sections.kerberosSettings.hide();
                    this.setKerberosMode('');
                }
            },

            _onEnableThrottlingChanged: function() {
                var enableThrottling = this.model.throttling.get(ENABLE_THROTTLING);
                if (enableThrottling)
                    this.children.throttling.show();
                else
                    this.children.throttling.hide();
            },

            isYarn: function() {
                return this.model.provider.entry.content.get(HADOOP_VERSION) === HADOOP_2X_YARN;
            },

            isHadoop2x: function() {
                return this.model.provider.entry.content.get(HADOOP_VERSION) === HADOOP_2X;
            },

            updateHunkThirdpartyJars: function(value) {
                this.model.additionalSettings.set('vix.env.HUNK_THIRDPARTY_JARS', value);
                this.children.additionalSettingsView.$el.find("input[name='vix.env.HUNK_THIRDPARTY_JARS']").val(value);
            },

            setKerberosMode: function(value) {
                // by default, the mode should be 'kerberos'
                this.model.provider.entry.content.set(KERBEROS_MODE, value);
            },

            setKerberosServerName: function(value) {
                this.model.provider.entry.content.set(KERBEROS_SERVER_NAME, value);
            },

            setKerberosRealm: function(value) {
                this.model.provider.entry.content.set(KERBEROS_REALM, value);
            },

            setKerberosMapReducePrincipla: function(value) {
                this.model.provider.entry.content.set(KERBEROS_MAPREDUCE_PRINCIPAL, value);
            },

            setJobTracker: function(value) {
                this.model.provider.entry.content.set(JOB_TRACKER, value);
            },

            setKerberosConfigFilePath: function(value) {
                this.model.provider.entry.content.set(KERBEROS_CONFIGURATION_FILE_PATH, value);
            },

            getActionText: function() {
                switch(this.options.mode) {
                    case 'edit':
                        return _('Edit provider').t();
                    case 'clone':
                        return _('Clone provider').t();
                    case 'new':
                        return _('Add new provider').t();
                    default:
                        return _('Add new provider').t();
                }
            },

            render: function() {
                var html = this.compiledTemplate({
                    actionText: this.getActionText(),
                    managerRoute: this._managerRoute.bind(this)
                });

                var $html = $(html);
                if (!this.el.innerHTML) {
                    $html.find('.admin-content').append(this.children.flashMessages.render().el);

                    $html.find('.admin-content').append(this.sections.basic.render().el);
                    $html.find('.admin-content').append(this.sections.envVars.render().el);
                    $html.find('.admin-content').append(this.sections.providerPaths.render().el);
                    $html.find('.admin-content').append(this.sections.splunkSettings.render().el);
                    $html.find('.admin-content').append(this.children.addSecureCluster.render().el);
                    $html.find('.admin-content').append(this.sections.kerberosSettings.render().el);
                    $html.find('.admin-content').append(this.sections.archiving.render().el);
                    $html.find('.admin-content').append(this.sections.additionalSettings.render().el);

                    $html.find('.admin-content').append('<div class="button-wrapper" />');
                    $html.find('.admin-content .button-wrapper').append('<a href="#" class="btn cancel pull-left">' + _('Cancel').t() + '</a>');
                    $html.find('.admin-content .button-wrapper').append('<a href="#" class="btn btn-primary pull-right">' + _('Save').t() + '</a>');
                }
                this.$el.html($html);

                // hide resource manager/scheduler in default
                if (!this.isYarn()) {
                    this.children.resourceManager.hide();
                    this.children.resourceScheduler.hide();
                } else {
                    this.children.jobTracker.$el.hide();
                    this.children.jobTracker.$el.hide();
                }

                // hide kerberos server name, default realm and configuration file path in default,
                // only show it when user choose options in the drop-down list
                this.children.kerberosServerName.$el.hide();
                this.children.kerberosDefaultRealm.$el.hide();
                this.children.kerberosConfigurationFilePath.$el.hide();

                // hide kerberos settings in default case
                if (this.model.provider.entry.content.get(KERBEROS_AUTHORIZATION) !== '1') {
                    this.sections.kerberosSettings.$el.hide();
                }

                this._onEnableThrottlingChanged();

                // disable kerberos mode setting since we only support kerberos mode
                this.children.kerberosMode.childList[0].disable();

                // ERP-582: according to Allan's suggestion, add two sub-section labels
                if(this.children.kerberosConfig.$el.children('.subsection').length === 0) {
                    this.children.kerberosConfig.$el.prepend('<div class="subsection">' + _('Kerberos Server Configuration:').t() + '</div>');
                }
                if(this.children.kerberosPrincipalName.$el.children('.subsection').length === 0) {
                    this.children.kerberosPrincipalName.$el.prepend('<div class="subsection">' + _('Hadoop Kerberos Credentials:').t() + '</div>');
                }

                if (this.options.mode === 'edit') {
                    this.children.name.childList[0].disable();
                    if (this.children.family) {
                        this.children.family.childList[0].disable();
                    }
                }
                return this;
            }
        });
    }
);
