define([
    'jquery',
    'module',
    'views/Base',
    'views/shared/delegates/Popdown',
    'views/clustering/config/Master',
    'contrib/text!views/clustering/master/MasterNodeInfo.html'

],
function(
    $,
    module,
    BaseView,
    PopdownView,
    ConfigDialog,
    InfoTemplate
){
    return BaseView.extend({
        moduleId: module.id,
        className: 'btn-combo',
        template: InfoTemplate,
        initialize: function(options){
            BaseView.prototype.initialize.call(this, options);

            this.model.masterInfo.on('change reset', this.update, this);
            this.model.clusterConfig.on('change reset', this.update, this);
            this.model.masterGeneration.on('change reset', this.update, this);

            this.children.popdown = new PopdownView({
                el: this.el
            });

            // SPL-103173: tooltip automatically shows up because the default focus is on it.
            // here we listen to the 'shown' event to manually change the focus on to that dropdown toggle button.
            this.listenTo(this.children.popdown, 'shown', function() {
                this.$('.btn.dropdown-toggle').focus();
            });
        },
        events: {
            'click a.masterconfig': function(e){
                this.children.configDialog = new ConfigDialog({
                    model: {
                        clusterConfig: this.model.clusterConfig,
                        application: this.model.application,
                        serverInfo: this.model.serverInfo,
                        wizard: this.model.wizard
                    },
                    startView: 'master',
                    onHiddenRemove: true
                });
                $('body').append(this.children.configDialog.render().el);
                this.children.configDialog.show();
                e.preventDefault();
            }
        },
        update: function(){
            var noPeers = (this.model.peersStatusSummary.get('totalCount') == 0);
            this.$('#label').html(this.model.masterInfo.entry.content.get('label'));
            this.$('#repFactor').html(this.model.clusterConfig.entry.content.get('replication_factor'));
            this.$('#searchFactor').html(this.model.clusterConfig.entry.content.get('search_factor'));
            this.$('#genId').html(this.model.masterGeneration.entry.content.get('generation_id'));
            this.$('a.cluster-push')[noPeers?'hide':'show']();
        },
        render: function(){
            var html = this.compiledTemplate({
                label: this.model.masterInfo.entry.content.get('label'),
                replicationFactor: this.model.clusterConfig.entry.content.get('replication_factor'),
                searchFactor: this.model.clusterConfig.entry.content.get('search_factor'),
                generationId: this.model.masterGeneration.entry.content.get('generation_id'),
                // the multisite attribute indicates whether multisite is enabled or not
                // we use this attribute to control whether enable or disable 'edit' menu
                multisite: this.model.clusterConfig.entry.content.get('multisite')
            });

            this.$el.html(html);
            this.$('.tooltip-link').tooltip({animation:false, container: 'body'});

            return this;
        }
    });
});
