define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/datasets/PolymorphicDataset',
        'views/shared/Modal',
        'views/shared/FlashMessages',
        'uri/route',
        'splunk.util'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        PolymorphicDatasetModel,
        Modal,
        FlashMessages,
        route,
        splunkUtil
    ) {
        return Modal.extend({
            moduleId: module.id,

            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);

                this.children.flashMessages = new FlashMessages({
                    model: this.model.dataset
                });
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    var deleteDeferred = this.model.dataset.destroy({wait: true});

                    $.when(deleteDeferred).then(function() {
                        this.hide();
                        if (this.options.deleteRedirect) {
                            window.location = route.datasets(this.model.application.get("root"), this.model.application.get("locale"), this.model.application.get("app"));
                        }
                    }.bind(this));

                    e.preventDefault();
                }
            }),

            handleFetchDataset: function() {
                var $loadingMessage = this.$('.loading-message'),
                    datasetDeferred = this.model.dataset.fetch();

                $.when(datasetDeferred).then(function() {
                    $loadingMessage.hide();
                    
                    if (this.model.dataset.canDelete()) {
                        this.$(Modal.BODY_SELECTOR).append('<span>' + splunkUtil.sprintf(_('Are you sure you want to delete %s?').t(), '<em>' + _.escape(this.model.dataset.getFormattedName()) + '</em>') + '</span>');
                        this.$(Modal.FOOTER_SELECTOR).empty();
                        this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                        this.$(Modal.FOOTER_SELECTOR).append(_(this.deleteButtonTemplate).template({
                            _: _
                        }));
                    } else {
                        this.$(Modal.BODY_SELECTOR).append('<span>' + splunkUtil.sprintf(_('You do not have permission to delete %s.').t(), '<em>' + _.escape(this.model.dataset.getFormattedName()) + '</em>') + '</span>');
                    }
                }.bind(this));
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.children.flashMessages.render().prependTo(this.$(Modal.BODY_SELECTOR));
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Delete Dataset").t());
                this.$(Modal.BODY_SELECTOR).append(_(this.loadingTemplate).template({
                    _: _
                }));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CLOSE);

                this.handleFetchDataset();

                return this;
            },

            loadingTemplate: '\
                <span class="loading-message"><%- _("Loading...").t() %></span>\
            ',

            deleteButtonTemplate: '\
                <a href="#" class="btn btn-primary"><%- _("Delete").t() %></a>\
            '
        });
    });
