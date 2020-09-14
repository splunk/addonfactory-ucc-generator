define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/FlashMessages',
    'contrib/text!views/clustering/master/StatusSummary.html',
    'splunk.util',
    'util/splunkd_utils',
    'uri/route'
],
function(
    $,
    _,
    module,
    BaseView,
    FlashMessagesView,
    StatusSummaryTemplate,
    splunkUtil,
    splunkDUtils,
    route
){
    return BaseView.extend({
        moduleId: module.id,
        template: StatusSummaryTemplate,
        initialize: function(options){
            BaseView.prototype.initialize.call(this, options);

            this.children.flashMessages = new FlashMessagesView({
                className: 'message-single'
            });

            this.model.masterGeneration.on('change reset', function(){
                this.debouncedRender();
            }, this);

            this.model.indexesStatusSummary.on('change reset', function(){
                this.debouncedRender();
            }, this);

            this.model.peersStatusSummary.on('change reset', function(){
                this.debouncedRender();
            }, this);

            this.model.masterInfo.on('change reset', function(){
                if (this.model.masterInfo.entry.content.get('maintenance_mode')){

                    var root = this.model.application.get('root'),
                        locale = this.model.application.get('locale');

                    var docLink = route.docHelp(root, locale, 'manager.clustering.maintenancemode');
                    var errMessage = _('The cluster is in maintenance mode. ').t()+ '<a href="'+docLink+'" class="external" target="_blank">'+_('Learn more.').t()+'</a>';
                    this.children.flashMessages.flashMsgHelper.addGeneralMessage('cluster_maint_mode',
                        {
                            type: splunkDUtils.WARNING,
                            html: errMessage
                        }
                    );
                } else {
                    this.children.flashMessages.flashMsgHelper.removeGeneralMessage('cluster_maint_mode');
                }
            }, this);
        },
        render: function(){
            var pendingLastReason = this.model.masterGeneration.entry.content.get('pending_last_reason'),
                searchFactorMet = this.model.masterGeneration.entry.content.get('search_factor_met'),
                repFactorMet = this.model.masterGeneration.entry.content.get('replication_factor_met'),
                isClusterSearchable = (typeof pendingLastReason == 'undefined') ? pendingLastReason : (pendingLastReason === ''),
                isSearchFactorMet = (typeof searchFactorMet == 'undefined') ? searchFactorMet : splunkUtil.normalizeBoolean(searchFactorMet),
                isRepFactorMet = (typeof repFactorMet == 'undefined') ? repFactorMet : splunkUtil.normalizeBoolean(repFactorMet);

            var html = this.compiledTemplate({
                isClusterSearchable:  isClusterSearchable,
                isSearchFactorMet: isSearchFactorMet,
                isReplicationFactorMet: isRepFactorMet,
                numSearchablePeers: this.model.peersStatusSummary.get('numSearchable'),
                numNotSearchablePeers:  this.model.peersStatusSummary.get('numNotSearchable'),
                numSearchableIndexes: this.model.indexesStatusSummary.get('numSearchable'),
                numNotSearchableIndexes: this.model.indexesStatusSummary.get('numNotSearchable')
            });
            this.$el.html(html);
            this.$el.prepend(this.children.flashMessages.render().el);
            return this;
        }
    });
});