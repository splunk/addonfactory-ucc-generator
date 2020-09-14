define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/Modal',
    'views/shared/FlashMessages',
    'views/shared/controls/ControlGroup'
],
    function(
        $,
        _,
        module,
        BaseView,
        Modal,
        FlashMessagesView,
        ControlGroup
        ) {
        return BaseView.extend({
            /**
             * @param {Object} options {
             *       model: <models.>,
             *       collection: <collections.services.>
             * }
             */
            moduleId: module.id,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.children.flashMessages = new FlashMessagesView({ model: this.model.clusterConfig });
                this.model.clusterConfig.transposeFromRest();

                this.children.masteruri = new ControlGroup({
                    className: 'cluster-masterip control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    helpClass: 'hint',
                    controlOptions: {
                        modelAttribute: 'ui.master_uri',
                        model: this.model.clusterConfig,
                        save: false
                    },
                    label: _('Master URI').t(),
                    help: _('E.g. https://10.152.31.202:8089').t()
                });

                this.children.repPort = new ControlGroup({
                    className: 'cluster-port control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    helpClass: 'hint',
                    controlOptions: {
                        modelAttribute: 'ui.replication_port',
                        model: this.model.clusterConfig,
                        save: false
                    },
                    label: _('Peer replication port').t(),
                    help: _('The port peer nodes use to stream data to each other (Eg: 8080).').t()
                });

                this.children.secret = new ControlGroup({
                    className: 'cluster-secret control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    helpClass: 'hint',
                    controlOptions: {
                        placeholder: 'Optional',
                        modelAttribute: 'ui.secret',
                        model: this.model.clusterConfig,
                        save: false,
                        password: true
                    },
                    label: _('Security key').t(),
                    help: _('This key authenticates communication between the master and the peers and search heads.').t()
                });
            },
            events: {
                'click .back': function(e) {
                    this.model.wizard.trigger('back');
                    e.preventDefault();
                },
                // this.model.clusterConfig is defined in routers/Clustering.js.
                // It is propagated in this way:
                // routers/Clustering.js
                // -> views/clustering/peer/PeerNode.js
                // -> views/clustering/EditMenu.js
                // -> views/clustering/config/Master.js
                // -> views/clustering/config/PeerSetup.js
                'click .btn-primary': function(e) {
                    var that = this;
                    e.preventDefault();
                    this.model.clusterConfig.set('ui.mode', 'slave');
                    this.model.clusterConfig.transposeToRest();
                    this.model.clusterConfig.save({
                        wait: true,
                        mode: this.model.clusterConfig.entry.content.get('mode'),
                        master_uri: this.model.clusterConfig.entry.content.get('master_uri'),
                        replication_port: this.model.clusterConfig.entry.content.get('replication_port'),
                        secret: this.model.clusterConfig.entry.content.get('secret')
                    }, {
                      patch: true
                    }).done(function(){
                        that.model.wizard.trigger('next');
                    }).fail(function(){
                        that.model.wizard.trigger('submitFail');
                    });
                }
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Peer node configuration").t());
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.flashMessages.render().el);
                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.masteruri.render().$el);
                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.repPort.render().$el);
                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.secret.render().$el);

                if (this.model.wizard.get('startPage') !== 'peer') {
                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_BACK);
                    this.$(Modal.FOOTER_SELECTOR).find('.modal-btn-back').addClass('pull-left');
                }
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn next btn-primary modal-btn-primary">'+_('Enable peer node').t()+'</a>');
                return this;
            }
        });
    });
