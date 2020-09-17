define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/Base',
    'models/ACLReadOnly',
    'models/services/configs/SearchLimit',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'views/shared/FlashMessages',
    'views/shared/permissions/Master',
    'util/splunkd_utils',
    './Master.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseModel,
        ACLReadOnlyModel,
        SearchLimit,
        Modal,
        ControlGroup,
        FlashMessage,
        PermissionsView,
        splunkd_utils,
        css
    ) {
    return Modal.extend({
        moduleId: module.id,
        /**
        * @param {Object} options {
        *       model: {
        *           document: <models.Report>,
        *           nameModel: <model> Model for name,
        *           user: <models.service.admin.user>,
        *           application: <models.Application> (only required if showDispatchAs=true)
        *           searchLimit: <models.services.configs.SearchLimit> (Optional, only needed if showDispatchAs=true if it is not provided it will be created.)
        *       }
        *       collection: <collections.services.authorization.Roles>,
        *       nameLabel: <string> Label for name,
        *       nameKey: <string> Key for name found in nameModel,
        *       showDispatchAs: <boolean> to determine if the dispatch as control should be shown
        * }
        */
        initialize: function(options) {
            Modal.prototype.initialize.apply(this, arguments);

            var defaults = {
                nameLabel: _('Name').t(),
                nameKey: 'name',
                showDispatchAs: false
            },
                permissionsParams;

            _.defaults(this.options, defaults);

            this.model.inmem = new ACLReadOnlyModel($.extend(true, {}, this.model.document.entry.acl.toJSON()));

            if (this.options.showDispatchAs) {
                this.model.inmemDocument = this.model.document.clone();
                if (!this.model.searchLimit) {
                    this.model.searchLimit = new SearchLimit();
                    this.searchLimitDeferred = this.model.searchLimit.fetch();
                }
            }

            permissionsParams = {
                collection: this.collection,
                displayForControlClass: 'controls-thirdblock',
                displayForLabel: _('Display For').t(),
                showDispatchAs: this.options.showDispatchAs,
                model: {
                    inmem: this.model.inmem,
                    inmemDocument: this.model.inmemDocument,
                    user: this.model.user,
                    serverInfo: this.model.serverInfo,
                    application: this.model.application,
                    searchLimit: this.model.searchLimit
                }
            };

            $.when(this.searchLimitDeferred).then(function() {
                this.children.permissionsView = new PermissionsView(permissionsParams);
            }.bind(this));

            this.children.flashMessage = new FlashMessage({
                model: {
                    inmem: this.model.inmem,
                    report: this.model.document,
                    reportAcl: this.model.document.acl
                }
            });

            this.children.name = new ControlGroup({
                controlType: 'Label',
                controlOptions: {
                    modelAttribute: this.options.nameKey,
                    model: this.model.nameModel
                },
                label: _(this.options.nameLabel).t()
            });

        },
        saveACL: function() {
            var data = this.model.inmem.toDataPayload();
            return this.model.document.acl.save({}, {
                data: data,
                success: function(model, response){
                    this.hide();
                    this.model.document.setFromSplunkD(response);
                    this.model.document.trigger('updateCollection');
                }.bind(this)
            });
        },
        events: $.extend({}, Modal.prototype.events, {
            'click .btn-primary': function(e) {
                if (this.options.showDispatchAs) {
                    // SPL-109045: Set dispatchAs to owner if report is scheduled.
                    if (this.model.document.entry.content.get('is_scheduled')) {
                        this.model.inmemDocument.entry.content.set('dispatchAs', 'owner');
                    }
                    this.model.inmemDocument.save({}, {
                        success: function(model, response) {
                            // Proxying over dispatchAs from response after save.
                            // Can not proxy all atrr due to SPL-94969
                            this.model.document.entry.content.set('dispatchAs', response.entry[0].content.dispatchAs);
                            this.saveACL();
                        }.bind(this)
                    });
                } else {
                    this.saveACL();
                }

                e.preventDefault();
            }
        }),
        render: function() {
            $.when(this.searchLimitDeferred).then(function() {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Edit Permissions").t());
                this.$(Modal.BODY_SELECTOR).addClass('modal-body-scrolling');

                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.children.name.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));

                this.children.permissionsView.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));

                if (this.model.inmem.get('can_change_perms')) {
                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
                } else {
                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CLOSE);
                    this.$(Modal.FOOTER_SELECTOR).find('.modal-btn-close').addClass('pull-left');
                }
            }.bind(this));

            return this;
        }
    });
});
