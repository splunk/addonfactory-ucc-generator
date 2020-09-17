define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var BaseModel = require('models/Base');
    var i18n = require("splunk.i18n");
    var BaseView = require("views/Base");
    var AlertsAndViolations = require('views/licensing/AlertsAndViolations');
    var TableView = require('views/licensing/table/Master');
    var ControlGroup = require('views/shared/controls/ControlGroup');
    var SyntheticSelectControl = require('views/shared/controls/SyntheticSelectControl');
    var JSChart = require('views/shared/jschart/Master');
    var AddLicenseModal = require('views/licensing/dialogs/Master');
    var ExpiredLicenseModal = require('views/licensing/dialogs/ExpiredLicense');
    var RestartRequiredDialog = require('views/shared/RestartRequired');
    var RestartDialog = require('views/shared/Restart');
    var template = require("contrib/text!views/licensing/Summary.html");
    var splunkUtil = require('splunk.util');
    var numberUtils = require('util/format_numbers_utils');
    var SearchJob = require('models/search/Job');
    var resultJsonCols = require('models/services/search/jobs/ResultJsonCols');

    var cssBaseManager = require('views/shared/pcss/manager.pcss');
    var css = require('./Master.pcss');

    //license usage query strings
    var STACK_SIZE_SEARCH_STRING = splunkUtil.sprintf("index=_internal source=*license_usage.log* type=\"RolloverSummary\" earliest=-30d@d | \
        eval _time=_time - 43200 | append [ rest /services/licenser/usage | stats sum(quota) as stacksz | eval _time=relative_time(now(), \"@d\")] | \
        bin _time span=1d | timechart span=1d sum(stacksz) AS \"%s\" fixedrange=false ", _("volume licensed").t());

    var BASE_USAGE_SEARCH_STRING_UNFORMATTED = "| join type=outer _time [search index=_internal source=*license_usage.log* type=\"Usage\" \
        earliest=-30d@d latest=%s | eval _time=_time - 43200 | \
        eval h=if(len(h)=0 OR isnull(h),\"(SQUASHED)\",h) | eval s=if(len(s)=0 OR isnull(s),\"(SQUASHED)\",s) | eval idx=if(len(idx)=0 OR isnull(idx),\"(UNKNOWN)\",idx) | \
        bin _time span=1d | stats sum(b) as b by _time, pool, s, st, h, idx | %s \
        timechart span=1d sum(b) AS %s fixedrange=false] ";

    var fieldFormatString = "| fields - _timediff | foreach * [eval <<FIELD>>=round('<<FIELD>>'/1024/1024/1024, 3)]";
    var appendRestString = "append [ rest /services/licenser/usage/license_usage | stats sum(slaves_usage_bytes) as b | eval _time=relative_time(now(), \"@d\")] | ";

    var UNFORMATTED_LICENSE_USAGE = STACK_SIZE_SEARCH_STRING + BASE_USAGE_SEARCH_STRING_UNFORMATTED + fieldFormatString;

    // Only append data from REST when not splitting, since data from REST has nothing to split on
    var LICENSE_USAGE_NOSPLIT = splunkUtil.sprintf(UNFORMATTED_LICENSE_USAGE, "@d", appendRestString, "\"volume indexed\"");
    var LICENSE_USAGE_BY_SOURCETYPE = splunkUtil.sprintf(UNFORMATTED_LICENSE_USAGE, "now()", "", "volumeB by st");
    var LICENSE_USAGE_BY_HOST = splunkUtil.sprintf(UNFORMATTED_LICENSE_USAGE, "now()", "", "volumeB by h");
    var LICENSE_USAGE_BY_SOURCE = splunkUtil.sprintf(UNFORMATTED_LICENSE_USAGE, "now()", "", "volumeB by s");
    var LICENSE_USAGE_BY_INDEX = splunkUtil.sprintf(UNFORMATTED_LICENSE_USAGE, "now()", "", "volumeB by idx");

    return BaseView.extend({
        moduleId: module.id,
        template: template,
        isLicenseManager: false,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            //get capabilities
            if (this.model.user.canManageLicenses()) {
                this.isLicenseManager = true;
            }

            //get active license group
            this.activeGroup = this.collection.groups.find(function(group) {
                return group.entry.content.get('is_active');
            });

            //determine license slave id and label
            this.localSlaveName = '';
            this.localSlaveLabel = '';
            if (this.collection.localslaves.length > 0) {
                this.localSlaveName = this.collection.localslaves.models[0].entry.content.get('slave_id');
                this.localSlaveLabel = this.collection.localslaves.models[0].entry.content.get('slave_label');
            }

            //licenses table
            if (!this.children.table && this.isLicenseManager) {
                this.children.table = new TableView({
                    model: {
                        user: this.model.user,
                        serverInfo: this.model.serverInfo,
                        activeGroup: this.activeGroup
                    },
                    collection: {
                        licenses: this.collection.licenses
                    }
                });
            }

            //split picker
            if (!this.children.splitPicker) {
                this.children.splitPicker = new SyntheticSelectControl ({
                    items: [
                        { label: _('No Split').t(), value: 'noSplit' },
                        { label: _('Source Type').t(), value: 'sourceType' },
                        { label: _('Host').t(), value: 'host' },
                        { label: _('Source').t(), value: 'source' },
                        { label: _('Index').t(), value: 'index' }
                    ],
                    save: false,
                    toggleClassName: 'btn'
                });
            }
            this.splitValue = 'noSplit';
            this.searchJob  = this.model.searchJob;
            this.searchResults = this.model.searchResults;
            this.chartOptions = {
                'display.visualizations.charting.chart' : 'column',
                'display.visualizations.charting.axisTitleX.text' : _('Date').t(),
                'display.visualizations.charting.axisTitleY.text' : _('GB').t(),
                'display.visualizations.charting.legend.placement': 'right',
                'display.visualizations.charting.chart.stackMode': 'stacked',
                'display.visualizations.charting.chart.nullValueMode': 'connect',
                'display.visualizations.charting.legend.labelStyle.overflowMode': 'ellipsisMiddle',
                'display.visualizations.charting.drilldown': '1',
                'display.visualizations.charting.height': '300',
                'display.visualizations.charting.chart.overlayFields': '"volume licensed"',
                'display.visualizations.charting.lineDashStyle' : 'shortDash',
                'display.visualizations.charting.fieldColors' : '{' + _('volume licensed').t() + ': 0xff0000}'
            };

            this.localUsedBytes = -1;
            this.listenTo(this.searchResults, 'change', this.getLocalUsedBytesForTodayFromSearchResults);
            this.listenTo(this.children.splitPicker, 'change', this.renderUsageChart);

            //license usage chart
            if (!this.children.usageChart) {
                this.children.usageChart = new JSChart({
                    model: {
                        searchData: this.searchResults,
                        application: this.model.application,
                        searchDataParams: new BaseModel(),
                        config: new BaseModel(this.chartOptions)
                    }
                });
            }
        },

        events: {
            'click .show-all-alerts-violations' : 'showAllAlertsAndViolations',
            'click .add-license-btn' : 'showAddLicenseModal'
        },

        getLocalUsedBytesForTodayFromSearchResults: function() {
            if (this.splitValue == 'noSplit') {
                if (this.searchJob.isDone() && this.searchResults.toJSON()) {
                    var columns = this.searchResults.get('columns');
                    if (columns && columns.length > 0) {
                        var fields = columns[columns.length - 1];
                        if (fields && fields.length > 0) {
                            this.localUsedBytes = parseFloat(fields[fields.length - 1] * 1024 * 1024 * 1024);
                        }
                    }
                    this.renderVolumeUsedToday();
                }
            }
        },

        calculateLocalUsedBytes: function() {
            var localUsedBytes = 0.0;
            if (this.isLicenseManager) {
                this.collection.pools.each(function(pool) {
                    var pool_slaves_usage_bytes = pool.entry.content.get('slaves_usage_bytes') || {};
                    //accummulate the usage for the local slave
                    for (var slaveId in pool_slaves_usage_bytes) {
                        if (slaveId == this.localSlaveName) {
                            var slaveBytes = parseFloat(pool_slaves_usage_bytes[slaveId]);
                            if (!isNaN(slaveBytes)) {
                                localUsedBytes += slaveBytes;
                            }
                        }
                    }
                }.bind(this));
            }
            else {
                if (this.collection.usages.length > 0) {
                    localUsedBytes = parseFloat(this.collection.usages.models[0].entry.content.get('slaves_usage_bytes'));
                }
            }

            return localUsedBytes;
        },

        getCurrentStackQuota: function() {
            var stackQuota = 0;

            if (this.isLicenseManager) {
                var activeStacks = this.getActiveStacks();
                for (var i = 0; i < activeStacks.length; i++) {
                    stackQuota += parseInt(activeStacks[i].entry.content.get('quota'), 10);
                }
            }
            else {
                if (this.collection.usages.length > 0) {
                    stackQuota = parseInt(this.collection.usages.models[0].entry.content.get('quota'), 10);
                }
            }

            return stackQuota;
        },

        getActiveStacks: function() {
            var activeStacks = [];
            this.collection.stacks.each(function(stack) {
                if (_.contains(this.activeGroup.entry.content.get('stack_ids'), stack.entry.get('name'))) {
                    activeStacks.push(stack);
                }
            }.bind(this));
            return activeStacks;
        },

        destroyOldAndDispatchNewJob: function(splitValue) {

            if (this.searchJob) {
                this.searchJob.unregisterJobProgressLinksChild(/* no callback or scope passed, just remove event handling */);
                this.searchJob.handleJobDestroy();
                delete this.searchJob;
            }
            this.searchJob = new SearchJob();

            if (this.searchResults) {
                this.searchResults.clear();
                delete this.searchResults;
            }
            this.searchResults = new resultJsonCols();

            var searchString = LICENSE_USAGE_NOSPLIT;

            switch (splitValue) {
                case 'noSplit':
                    searchString = LICENSE_USAGE_NOSPLIT;
                    break;
                case 'sourceType':
                    searchString = LICENSE_USAGE_BY_SOURCETYPE;
                    break;
                case 'host':
                    searchString = LICENSE_USAGE_BY_HOST;
                    break;
                case 'source':
                    searchString = LICENSE_USAGE_BY_SOURCE;
                    break;
                case 'index':
                    searchString = LICENSE_USAGE_BY_INDEX;
                    break;
                default:
                    searchString = LICENSE_USAGE_NOSPLIT;
                    break;
            }

            var jobPromise = this.searchJob.save({}, {data: {
                app: this.model.application.get('app'),
                owner: this.model.application.get('owner'),
                search: searchString
            }});

            jobPromise.done(function() {
                this.searchJob.registerJobProgressLinksChild(
                    SearchJob.RESULTS_PREVIEW,
                    this.searchResults,
                    function() {
                        this.searchResults.fetch();
                    },
                    this);
                this.searchJob.startPolling();
            }.bind(this));

            this.listenTo(this.searchResults, 'change', this.getLocalUsedBytesForTodayFromSearchResults);
        },

        renderUsageChart: function(value) {
            if (value != this.splitValue) {
                this.splitValue = value;

                this.destroyOldAndDispatchNewJob(this.splitValue);
                if (this.children.usageChart) {
                    this.children.usageChart.remove();
                }
                this.children.usageChart = new JSChart({
                    model: {
                        searchData: this.searchResults,
                        application: this.model.application,
                        searchDataParams: new BaseModel(),
                        config: new BaseModel(this.chartOptions)
                    }
                });
                this.children.usageChart.render().appendTo(this.$('.license-usage-chart'));
            }
        },

        showAllAlertsAndViolations: function(e) {
            e.preventDefault();
            if (!this.children.alertsAndViolations) {
                this.children.alertsAndViolations = new AlertsAndViolations({
                    collection: {
                        messages: this.collection.messages
                    }
                });
                this.$('.alerts-violations-outer').html(this.children.alertsAndViolations.render().$el);
            }
        },

        showAddLicenseModal: function(e) {
            e.preventDefault();
            if (this.children.addLicenseModal) {
                this.children.addLicenseModal.hide();
                delete this.children.addLicenseModal;
            }

            if (this.children.expiredLicenseModal) {
                this.children.expiredLicenseModal.hide();
                delete this.children.expiredLicenseModal;
            }

            this.children.addLicenseModal = new AddLicenseModal({
                backdrop: 'static',
                keyboard: false,
                model: {
                    application : this.model.application,
                    serverInfo : this.model.serverInfo,
                    activeGroup: this.activeGroup
                },
                collection: {
                    licenses : this.collection.licenses
                },
                activeStacks : this.getActiveStacks(),
                onHiddenRemove: true
            });

            $('body').append(this.children.addLicenseModal.render().el);
            this.children.addLicenseModal.show();
            this.listenTo(this.children.addLicenseModal, 'licenseExpired', this.showExpiredLicenseModal);
            this.listenTo(this.children.addLicenseModal, 'successLicensing', this.showSuccessModal);
        },

        showExpiredLicenseModal: function() {
            if (this.children.expiredLicenseModal) {
                this.children.expiredLicenseModal.hide();
                delete this.children.expiredLicenseModal;
            }

            if (this.children.addLicenseModal) {
                this.children.addLicenseModal.hide();
                delete this.children.addLicenseModal;
            }

            this.children.expiredLicenseModal = new ExpiredLicenseModal({
                backdrop: 'static',
                keyboard: false,
                collection: {
                    groups: this.collection.groups,
                    users: this.collection.users
                },
                model: {
                    serverInfo: this.model.serverInfo
                },
                onHiddenRemove: true
            });

            $('body').append(this.children.expiredLicenseModal.render().el);
            this.children.expiredLicenseModal.show();
            this.listenTo(this.children.expiredLicenseModal, 'addLicense', this.showAddLicenseModal);
            this.listenTo(this.children.expiredLicenseModal, 'successLicensing', this.showSuccessModal);
        },

        showSuccessModal: function() {
            if (this.children.success) {
                this.children.success.hide();
                delete this.children.success;
            }
            this.children.success = new RestartRequiredDialog({
                model: {
                    serverInfo: this.model.serverInfo
                },
                restartMandatory: this.model.serverInfo.isLicenseStateExpired(),
                message: splunkUtil.sprintf(_('License was successfully added. Restart %s to activate your new license.').t(),
                    this.model.serverInfo.getProductName()),
                restartCallback: function() {
                    this.children.success.hide();
                    this.showRestartModal();
                }.bind(this)
            });
            $('body').append(this.children.success.render().el);
            this.children.success.show();
        },

        showRestartModal: function() {
            if (this.children.restartDialog) {
                this.children.restartDialog.hide();
                delete this.children.restartDialog;
            }
            this.children.restartDialog = new RestartDialog({
                model: {
                    serverInfo: this.model.serverInfo
                }
            });
            $('body').append(this.children.restartDialog.render().el);
            this.children.restartDialog.show();
            splunkUtil.restart_server();
        },

        renderVolumeUsedToday: function() {
            var stackQuota = this.getCurrentStackQuota();
            if (this.localUsedBytes == -1) {
                this.localUsedBytes = this.calculateLocalUsedBytes();
            }
            var volumeUsedToday = numberUtils.bytesToFileSize(this.localUsedBytes).toString();
            if(stackQuota > 0) {
                volumeUsedToday += splunkUtil.sprintf('%s' + _(' of licensed volume)').t() , ' (' + ((this.localUsedBytes / stackQuota) * 100).toFixed().toString() + '%');
            }
            this.$('.license-table-volume-used-today').html(volumeUsedToday);

            //progress bar
            var progressBarWidthPercentage = ((this.localUsedBytes / stackQuota) * 100).toFixed();
            this.$('.license-progress-bar-inner').css('width', progressBarWidthPercentage.toString() + '%');
        },

        render: function() {
            var stackQuota = this.getCurrentStackQuota();
            if (!this.el.innerHTML) {
                this.$el.html(this.compiledTemplate({
                    _ : _,
                    isLicenseManager: this.isLicenseManager,
                    serverInfo: this.model.serverInfo,
                    messages: this.collection.messages,
                    numberUtils: numberUtils,
                    stackQuota: stackQuota,
                    splunkUtil: splunkUtil
                }));
            }

            //licenses table
            if (this.children.table) {
                this.children.table.render().appendTo(this.$('.license-listing-table'));
            }

            //volue used today and progress bar
            this.renderVolumeUsedToday();

            //split picker
            this.children.splitPicker.render().appendTo(this.$('.license-usage-chart-split-picker'));

            //usage chart
            this.children.usageChart.render().appendTo(this.$('.license-usage-chart'));

            //if no active group then prompt add license
            if (!this.activeGroup && this.isLicenseManager) {
                this.showAddLicenseModal();
            }

            if (this.model.serverInfo.isLicenseStateExpired() && this.isLicenseManager) {
                this.showExpiredLicenseModal();
            }

            return this;
        }
    });

});
