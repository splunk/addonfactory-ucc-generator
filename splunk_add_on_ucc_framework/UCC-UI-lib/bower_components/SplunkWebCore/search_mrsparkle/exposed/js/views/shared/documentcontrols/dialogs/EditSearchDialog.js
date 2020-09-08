define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/services/authentication/User',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'views/shared/FlashMessages',
    'views/shared/searchbarinput/Master',
    'views/shared/documentcontrols/dialogs/EditSearchDialog.pcss',
    'uri/route'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        UserModel,
        Modal,
        ControlGroup,
        FlashMessage,
        SearchInputView,
        css,
        route
    ) {
    return Modal.extend({
        moduleId: module.id,
        /**
        * @param {Object} options {
        *       model: {
        *           report: <models.Report>
        *           user: <models.services.authentication.User> (Optional)
        *           application: <models.Application> (Optional)
        *       }
        *       showSearchField: <Boolean> (Optional) Whether to display a field to the user for entering the search string.
        *                                     Default is false.
        *       collection: {
        *           searchBNFs: <collections/services/configs/SearchBNFs> (Optional) Only needed if the showSearchField is true
        *       }
        * }
        */
        initialize: function(options) {
            Modal.prototype.initialize.apply(this, arguments);
            var defaults = {
                showSearchField: false
            };

            _.defaults(this.options, defaults);

            this.modelAttribute = 'description';
            
            if (_.isFunction(this.model.report.isDataset) && this.model.report.isDataset()) {
                if (this.model.report.getType() === 'table') {
                    this.modelAttribute = 'dataset.description';
                }
            }

            this.model.inmem = this.model.report.clone();

            this.children.flashMessage = new FlashMessage({ model: this.model.inmem });

            this.children.titleField = new ControlGroup({
                controlType: 'Label',
                controlOptions: {
                    modelAttribute: 'name',
                    model: this.model.inmem.entry
                },
                label: _('Title').t()
            });

            this.children.descriptionField = new ControlGroup({
                controlType: 'Textarea',
                controlOptions: {
                    modelAttribute: this.modelAttribute,
                    model: this.model.inmem.entry.content,
                    placeholder: _('optional').t()
                },
                label: _('Description').t()
            });

            if (this.options.showSearchField) {
                this.children.search = new SearchInputView({
                    model: {
                        user: this.model.user,
                        content: this.model.inmem.entry.content,
                        application: this.model.application
                    },
                    collection: {
                        searchBNFs: this.collection.searchBNFs
                    },
                    searchAttribute: 'search',
                    searchAssistant: (this.model.user.getSearchAssistant() === UserModel.SEARCH_ASSISTANT.FULL) ? UserModel.SEARCH_ASSISTANT.COMPACT : undefined
                });

                var timeRangeHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.manager.relativetime'
                );
                var helpText = _('Time specifiers: y, mon, d, h, m, s ').t() +
                    '<a href="' + _.escape(timeRangeHelpLink) + '" target="_blank">' + _('Learn More').t() + ' <i class="icon-external"></i></a>';

                this.children.earliestTime = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'dispatch.earliest_time',
                        model: this.model.inmem.entry.content,
                        placeholder: _('optional').t()
                    },
                    label: _('Earliest time').t(),
                    help: helpText
                });

                this.children.latestTime = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'dispatch.latest_time',
                        model: this.model.inmem.entry.content,
                        placeholder: _('optional').t()
                    },
                    label: _('Latest time').t(),
                    help: helpText
                });
            }

            this.on('hidden', function() {
                if (this.model.inmem.get("updated") > this.model.report.get("updated")) {
                    //now we know have updated the clone
                    this.model.report.entry.content.set(this.modelAttribute, this.model.inmem.entry.content.get(this.modelAttribute));
                    this.model.report.trigger('updateCollection');
                }
            }, this);
        },
        events: $.extend({}, Modal.prototype.events, {
            'click .btn-primary': function(e) {
                this.model.inmem.save({}, {
                    success: function(model, response) {
                        this.hide();
                    }.bind(this)
                });

                e.preventDefault();
            }
        }),
        render : function() {
            this.$el.html(Modal.TEMPLATE);

            var title = _("Edit Description").t();
            if (this.options.showSearchField) {
                title = _("Edit Search").t();
            }
            this.$(Modal.HEADER_TITLE_SELECTOR).html(title);

            this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

            this.children.titleField.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
            this.children.descriptionField.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
            if (this.options.showSearchField) {
                this.$el.addClass(Modal.CLASS_MODAL_WIDE);
                this.$(Modal.BODY_FORM_SELECTOR).append('<div class="search-input"></div>');
                this.$('div.search-input').append('<div class="search-label">' + _('Search').t() + '</div>');
                this.children.search.render().appendTo(this.$('div.search-input'));
                this.children.earliestTime.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.latestTime.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
            }
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

            return this;
        }
    });
});
