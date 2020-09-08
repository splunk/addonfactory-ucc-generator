define(
    [
        'jquery',
        'underscore',
        'backbone',
        'routers/Base',
        'models/services/cluster/master/Control',
        'models/services/cluster/master/Info',
        'models/services/cluster/master/Generation',
        'collections/services/cluster/master/Peers',
        'views/clustering/push/Master',
        'util/console'
    ],
    function(
        $,
        _,
        Backbone,
        BaseRouter,
        MasterControlModel,
        MasterInfoModel,
        MasterGenerationModel,
        MasterPeersCollection,
        ClusteringPushView,
        console
        ){
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.enableAppBar = false;
                this.setPageTitle(_('Distribute Configuration Bundle').t());
                var that = this;
                this.VALIDATION_SUCCESS = 'Validation successful';
                this.VALIDATION_FAIL = 'Validation failed';

                this.pushModel = new Backbone.Model();
                this.masterControl = new MasterControlModel();
                this.masterInfo = new MasterInfoModel();
                this.masterPeers = new MasterPeersCollection();
                this.masterGeneration = new MasterGenerationModel();
                this.masterGeneration.fetch();

                this.masterActiveBundle = null;
                this.masterLatestBundle = null;
                this.errors = [];
                this.validationProgress = [];
                this.restartProgress = [];

                this.clusteringPushView = new ClusteringPushView({
                    model: {
                        application: this.model.application,
                        pushModel: this.pushModel,
                        masterInfo: this.masterInfo,
                        masterControl: this.masterControl,
                        masterGeneration: this.masterGeneration
                    }
                });

                // initial setup
                this.firstRun = true; // need it to stop the initial page load
                this.pushModel.set('inProgress', false); // if push is in progress at this moment
                that.pushModel.set('peersValidated', 0);
                that.pushModel.set('peersRestarted', 0);

                this.masterPeers.on('reset change', function() {
                    /*
                    Here we're going through all peers, counting as done those that have no errors and active=latest=master
                     */
                    if (!that.masterActiveBundle || !that.masterLatestBundle) {
                        return;
                    }
                    var i;
                    // initial reset of validationProgress array
                    if (that.validationProgress.length == 0) {
                        for (i=0; i<that.masterPeers.length; i++) {
                            that.validationProgress[i] = false;
                        }
                    }
                    if (that.restartProgress.length == 0) {
                        for (i=0; i<that.masterPeers.length; i++) {
                            that.restartProgress[i] = false;
                        }
                    }

                    if (that.pushModel.get('state') == 'validation') {
                        // while validation is on, repopulate the errors from zero
                        that.errors = [];
                    }

                    console.log('peers state:'+ that.pushModel.get('state'));
                    console.log(that.masterPeers.length);
                    i = 0;
                    that.masterPeers.each(function(peer) {
                        var activeBundleId = peer.entry.content.get('active_bundle_id'),
                            latestBundleId = peer.entry.content.get('latest_bundle_id'),
                            _applyBundleStatus = peer.entry.content.get('apply_bundle_status'),
                            validationErrors = _applyBundleStatus.invalid_bundle.bundle_validation_errors,
                            label = peer.entry.content.get('label'),
                            status = peer.entry.content.get('status');

                        if (!that.isValidationComplete() || that.firstRun) {
                            console.log(label + 'status:', status);
                            if (validationErrors && validationErrors.length) {
                                console.log(validationErrors);
                                that.errors.push({label: label, errors: validationErrors});
                            }
                            if (latestBundleId == that.masterLatestBundle ||
                                status !== 'Up' ||
                                that.firstRun) {

                                that.validationProgress[i] = true;
                            }
                            console.log('validationProgress:',that.validationProgress);
                        }

                        if (that.pushModel.get('state') == 'restart') {
                            console.log(label + ': ' + status);
                            if (status == 'Restarting' || status == 'Down') {
                                that.restartProgress[i] = true;
                            }
                        }

                        i+=1;

                    });
                    that.firstRun = false;
                    var peersValidated = that.getValidatedCount();
                    var peersRestarted = that.getRestartedCount();
                    console.log('peersValidated', peersValidated);
                    if (peersValidated >= that.pushModel.get('peersValidated')) {
                        that.pushModel.set('peersValidated', peersValidated);
                    }
                    if (peersRestarted >= that.pushModel.get('peersRestarted')) {
                        that.pushModel.set('peersRestarted', peersRestarted);
                    }
                    that.pushModel.set('peersTotal', that.masterPeers.length);
                    console.log('errors:', that.errors);
                    that.pushModel.set('errors', that.errors);
                    that.pushModel.trigger('tick');


                    console.log('validation complete: '+ that.isValidationComplete());
                    if (that.pushModel.get('state') == 'idle' && that.isValidationComplete()) {

                        console.log('master done');

                        that.masterPeers.stopPolling();

                        that.pushModel.set('lastPushSuccess', that.isPushSuccessful());
                        that.pushModel.set('inProgress', false);
                                    console.log('all peers updated: polling stopped!');
                    }
                });    // end masterPeers.on_change

                this.masterInfo.on('change', function() {
                    var _activeBundle = that.masterInfo.entry.content.get('active_bundle');
                    var _latestBundle = that.masterInfo.entry.content.get('latest_bundle');
                    if (!(_activeBundle && _latestBundle)) { return ; }

                    that.masterActiveBundle = _activeBundle.checksum;
                    that.masterLatestBundle = _latestBundle.checksum;
                    var _applyBundleStatus = that.masterInfo.entry.content.get('apply_bundle_status');
                    that.masterApplyBundleStatus = _applyBundleStatus.status;
                    that.masterValidationErrors = _applyBundleStatus.invalid_bundle.bundle_validation_errors_on_master;

                    var validation = (that.masterApplyBundleStatus == "Bundle validation is in progress."),
                        reload = _applyBundleStatus.reload_bundle_issued,
                        restart = that.masterInfo.entry.content.get('rolling_restart_flag'),
                        label = that.masterInfo.entry.content.get('label');

                    if (that.masterValidationErrors && that.masterValidationErrors.length) {
                        that.masterPeers.stopPolling();
                        that.errors = [];
                        that.errors.push({label: label, errors: that.masterValidationErrors});
                        that.pushModel.set('lastPushSuccess', that.isPushSuccessful());
                        that.pushModel.set('inProgress', false);
                        that.pushModel.set('errors', that.errors);
                        that.pushModel.trigger('tick');
                    }
                    console.log('master-errors:',that.masterValidationErrors);
                    var state = validation? 'validation': reload? 'reload': restart? 'restart': 'idle';
                    that.pushModel.set('state', state);

                    if (state == 'idle') {
                        that.masterInfo.stopPolling();
                    }
                    console.log('[Master] state:' + state, 'a:'+that.masterActiveBundle, 'l:'+that.masterLatestBundle);
                });     // end of masterInfo.on_change


                this.pushModel.on('confirmed', function() {
                    /*
                    On user confirm, issue an apply command and start polling status endpoints until all peers
                    receive the bundle or report an error
                     */
                    that.pushModel.set('peersValidated', 0);
                    that.pushModel.set('errors', {});
                    that.validationProgress.splice(0);
                    this.masterControl.save()
                        .done(function(){
                            console.log('     ----    ');
                            console.log('push command went successful');
                            that.monitorPushStatus();
                        })
                        .fail(function() {
                            that.masterInfo.fetch();
                        });
                }, this);

                // Initial status check
                this.monitorPushStatus();

            },

            getValidatedCount: function() {
                return _.reduce(this.validationProgress, function(memo, item) {
                    return item ? memo+1 : memo;
                }, 0);
            },

            getRestartedCount: function() {
                return _.reduce(this.restartProgress, function(memo, item) {
                    return item ? memo+1 : memo;
                }, 0);
            },

            isValidationComplete: function() {
                return _.reduce(this.validationProgress, function(memo, item) {
                    return memo && item;
                }, true);
            },

            isPushSuccessful: function() {
                return (this.masterActiveBundle == this.masterLatestBundle) && (this.errors.length == 0);
            },

            monitorPushStatus: function() {
                this.pushModel.set('state', 'validation');
                this.pushModel.set('inProgress', true);
                this.masterInfo.startPolling({ delay: 1000 });
                this.masterPeers.startPolling({
                        'delay': 500,
                        'data': {'count': -1}
                });
                console.log('polling started!');
            },

            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);
                this.deferreds.pageViewRendered.done(function() {
                    $('.preload').replaceWith(this.pageView.el);
                    this.pageView.$('.main-section-body').append(this.clusteringPushView.render().el);
                }.bind(this));
            }
        });
    }
);
