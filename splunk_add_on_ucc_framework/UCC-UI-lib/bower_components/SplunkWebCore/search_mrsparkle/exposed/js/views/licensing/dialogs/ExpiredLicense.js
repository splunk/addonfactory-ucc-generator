define(
    [
        'module',
        'underscore',
        'jquery',
        'views/shared/Modal',
        'splunk.util',
        'contrib/text!views/licensing/dialogs/ExpiredLicense.html'
    ],
    function(
        module,
        _,
        $,
        Modal,
        splunkUtil,
        ResultsTemplate
    ) {
        return Modal.extend({
            template: ResultsTemplate,
            moduleId: module.id,
            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
                var sortedUsers = _.sortBy(this.collection.users.models, function(user) {
                    return user.entry.get('name');
                }, this);

                this.firstAdmin = _.find(sortedUsers, function(user) {
                    return _.contains(user.entry.content.get('roles'), 'admin');
                }).entry.get('name');
            },

            events: $.extend({}, Modal.prototype.events,
            {
                'click .add-license-btn' : 'showAddLicenseModal',
                'click .change-spl-light-free' : 'switchToLiteFreeGroup'
            }),

            showAddLicenseModal: function(e) {
                e.preventDefault();
                this.trigger('addLicense', e);
            },

            switchToLiteFreeGroup: function(e) {
                e.preventDefault();

                //get lite free license group
                var liteFreeGroup = this.collection.groups.find(function(group) {
                    return group.entry.get('name') == 'Lite_Free';
                });

                if (liteFreeGroup) {
                    liteFreeGroup.entry.content.set({'is_active' : true});
                    liteFreeGroup.save({}, {
                        success:
                            function(updatedLicenseGroup) {
                                this.hide();
                                this.trigger('successLicensing');
                            }.bind(this),

                        error:
                            function(liteFreeLicenseGroup, error) {
                                this.$(Modal.BODY_SELECTOR).find('.splunk-lite-free-error').show();
                            }.bind(this)
                    });
                }
                else {
                    this.$(Modal.BODY_SELECTOR).find('.splunk-lite-free-error').show();
                }
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("License Expired").t());
                this.$(Modal.BUTTON_CLOSE_SELECTOR).remove();
                this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                    firstAdmin: this.firstAdmin,
                    serverInfo: this.model.serverInfo,
                    _ : _
                }));
                this.$(Modal.BODY_SELECTOR).find('.splunk-free-error').hide();
                this.$(Modal.FOOTER_SELECTOR).html('<a href="#" class="btn btn-primary modal-btn-primary pull-right add-license-btn">' + _('Add License').t() + '</a>');
                this.$(Modal.FOOTER_SELECTOR).append('<a target="_blank" href="http://www.splunk.com/goto/estore" class="btn modal-btn-primary get-license-btn pull-right">' + _('Get License').t() + '</a>');

                var linkText = _('Change to Splunk Light Free').t();
                if (!this.model.serverInfo.isLiteFree()) {
                    this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="change-spl-light-free pull-left">' + linkText + '</a>');
                }

                return this;
            }
        });
    }
);
