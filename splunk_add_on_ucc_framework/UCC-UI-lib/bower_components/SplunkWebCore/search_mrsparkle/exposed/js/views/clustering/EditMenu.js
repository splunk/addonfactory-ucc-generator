define(
    [
        'jquery',
        'underscore',
        'module',
        'backbone',
        'views/Base',
        'views/clustering/config/Master',
        'views/clustering/config/DataRebalance',
        'views/clustering/push/Master',
        'views/clustering/disable/DisableClustering',
        'views/shared/delegates/Popdown',
        'views/shared/RestartRequired',
        'views/shared/Restart',
        'contrib/text!views/clustering/EditMenu.html',
        'uri/route',
        'splunk.util',
        './EditMenu.pcss',
        'bootstrap.tooltip'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        BaseView,
        ConfigDialog,
        DataRebalanceDialog,
        PushConfig,
        DisableClustering,
        PopdownView,
        RestartRequired,
        Restart,
        EditMenuTemplate,
        route,
        splunkUtils,
        css
        // tooltip
        )
    {
        return BaseView.extend({
            moduleId: module.id,
            className: 'btn-combo',
            template: EditMenuTemplate,
            /**
             * @param {Object} options {
             *     model: <models.Application>
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.model.wizard.on('disable', function() {
                    this.model.clusterConfig.entry.content.set('mode', 'disabled');
                    this.model.clusterConfig.save({
                        wait: true
                    }).done(function(){
                        this.children.disableClustering.hide();
                        var return_to = route.manager(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            this.model.application.get('app'),
                            'clustering');
                        this.children.success = new RestartRequired({
                            model: {
                                serverInfo: this.model.serverInfo
                            },
                            message: splunkUtils.sprintf(_('You must restart %s for clustering to be completely disabled.').t(),
                                this.model.serverInfo.getProductName()),
                            restartCallback: function (){
                                this.children.success.hide();
                                this.children.restart = new Restart({
                                    model: {
                                        serverInfo: this.model.serverInfo
                                    }
                                });
                                $('body').append(this.children.restart.render().el);
                                this.children.restart.show();
                            }.bind(this),
                            return_to: return_to
                        });
                        $('body').append(this.children.success.render().el);
                        this.children.success.show();
                    }.bind(this));
                }, this);

                this.children.popdown = new PopdownView({
                    el: this.el
                });
            },
            events: {
                'click a#nodeType': function(e) {
                    this.children.configDialog = new ConfigDialog({
                        model: this.model,
                        onHiddenRemove: true
                    });
                    $('body').append(this.children.configDialog.render().el);
                    this.children.configDialog.show();
                    e.preventDefault();
                },
                'click a#masterConfig': function(e) {
                    this.children.configDialog = new ConfigDialog({
                        model: this.model,
                        startView: 'master',
                        onHiddenRemove: true
                    });
                    $('body').append(this.children.configDialog.render().el);
                    this.children.configDialog.show();
                    e.preventDefault();
                },
                'click a#dataRebalance': function(e) {
                    this.children.dataRebalanceDialog = new DataRebalanceDialog({
                        model: this.model,
                        collection: this.collection,
                        onHiddenRemove: true
                    });
                    $('body').append(this.children.dataRebalanceDialog.render().el);
                    this.children.dataRebalanceDialog.show();
                    e.preventDefault();
                },
                'click a#peerConfig': function(e) {
                    this.children.configDialog = new ConfigDialog({
                        model: this.model,
                        startView: 'peer',
                        onHiddenRemove: true
                    });
                    $('body').append(this.children.configDialog.render().el);
                    this.children.configDialog.show();
                    e.preventDefault();
                },
                'click a#disableCluster': function(e) {
                    this.children.disableClustering = new DisableClustering({
                        model: this.model,
                        onHiddenRemove: true
                    });
                    $('body').append(this.children.disableClustering.render().el);
                    this.children.disableClustering.show();
                    e.preventDefault();
                }
            },
            render: function() {
                var multisite = this.model.clusterConfig.entry.content.get('multisite') === 'true';

                var html = this.compiledTemplate({
                    mode: this.model.clusterConfig.entry.content.get('mode'),

                    // on MASTER NODE, 'multisite = true' means multisite mode is enabled.
                    // on PEER NODE or SEARCHHEAD NODE, 'site' presents AND 'site != default' means multisite mode is enabled.

                    // we use this attribute to control whether enable or disable 'edit' menu on MASTER NODE.
                    // This is just for temporary purpose, because the 'edit' menu is not ready for multisite mode.
                    multisite: multisite

                    // we use this attribute to control whether enable or disable 'edit' menu on PEER NODE.
                    // This is just for temporary purpose, because the 'edit' munu is not ready for multisite mode.
                    // site: this.model.clusterConfig.entry.content.get('site')
                });
                this.$el.html(html);

                if (multisite) {
                    this.$('#masterConfig').tooltip({
                        animation: false,
                        title: _('This capability is not available with multisite clusters. Use the CLI instead.').t(),
                        container: 'body'
                    });
                }

                return this;
            }
        });
    }
);
