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

                this.children.repFactor = new ControlGroup({
                    className: 'cluster-rep-factor control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.replication_factor',
                        model: this.model.clusterConfig,
                        save: false
                    },
                    label: _('Replication Factor').t(),
                    help: _('The number of copies of raw data that you want the cluster to maintain. A higher replication factor protects against loss of data if peer nodes fail.').t(),
                    helpClass: 'hint'
                });

                this.children.searchFactor = new ControlGroup({
                    className: 'cluster-search-factor control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.search_factor',
                        model: this.model.clusterConfig,
                        save: false
                    },
                    label: _('Search Factor').t(),
                    help: _('The number of searchable copies of data the cluster maintains. A higher search factor speeds up the time to recover lost data at the cost of disk space. Must be less than or equal to Replication Factor.').t(),
                    helpClass: 'hint'
                });

                this.children.secret = new ControlGroup({
                    className: 'cluster-secret control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        placeholder: 'Optional',
                        modelAttribute: 'ui.secret',
                        model: this.model.clusterConfig,
                        save: false,
                        password: true
                    },
                    label: _('Security Key').t(),
                    help: _('This key authenticates communication between the master and the peers and search heads.').t(),
                    helpClass: 'hint'
                });
                
                this.children.clusterLabel = new ControlGroup({
                    className: 'cluster-label control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        placeholder: 'Optional',
                        modelAttribute: 'ui.cluster_label',
                        model: this.model.clusterConfig,
                        save: false
                    },
                    label: _('Cluster Label').t(),
                    help: _('Name your cluster using this field.  This label is also used to identify this cluster in the Monitoring Console.').t(),
                    helpClass: 'hint'
                });                
            },
            events: {
                'click .back': function(e) {
                    this.model.wizard.trigger('back');
                    e.preventDefault();
                },
                'click .btn-primary': function(e) {
                    var that = this;
                    e.preventDefault();
                    this.model.clusterConfig.set('ui.mode', 'master');
                    this.model.clusterConfig.transposeToRest();
                    this.model.clusterConfig.save({
                        wait: true
                    }).done(function(){
                        that.model.wizard.trigger('next');
                    }).fail(function(){
                        that.model.wizard.trigger('submitFail');
                    });
                }
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Master Node Configuration").t());
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.flashMessages.render().el);
                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.repFactor.render().$el);
                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.searchFactor.render().$el);
                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.secret.render().$el);
                this.$(Modal.BODY_FORM_SELECTOR).append(this.children.clusterLabel.render().$el);

                var $saveBtn = $(Modal.BUTTON_SAVE);
                if (this.model.wizard.get('startPage') == 'master') {
                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                    $saveBtn.text(_('Save changes').t());
                } else {
                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_BACK);
                    this.$(Modal.FOOTER_SELECTOR).find('.modal-btn-back').addClass('pull-left'); // TODO: maybe this should be default?
                    $saveBtn.text(_('Enable Master Node').t());
                }
                this.$(Modal.FOOTER_SELECTOR).append($saveBtn);
                return this;
            }
        });
    });
