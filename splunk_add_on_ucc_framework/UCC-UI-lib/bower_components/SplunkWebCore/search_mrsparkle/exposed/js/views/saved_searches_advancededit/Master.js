define(
    [
        'underscore',
        'jquery',
        'backbone',
        'module',
        'views/Base',
        'views/shared/FlashMessages',
        'views/shared/FlashMessagesLegacy',
        'views/shared/controls/TextControl',
        'views/saved_searches_advancededit/ButtonHeader',
        'views/saved_searches_advancededit/Settings',
        'views/shared/delegates/Dock',
        'collections/shared/FlashMessages',
        'util/splunkd_utils',
        './Master.pcss'
    ],
    function(
        _,
        $,
        Backbone,
        module,
        Base,
        FlashMessagesView,
        FlashMessagesLegacyView,
        SearchInput,
        ButtonHeader,
        SettingsView,
        Dock,
        FlashMessagesCollection,
        splunkd_utils,
        css
    ){
        return Base.extend({
            moduleId: module.id,

            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.errorTypes = [splunkd_utils.FATAL, splunkd_utils.ERROR, splunkd_utils.NOT_FOUND];

                this.isError = splunkd_utils.messagesContainsOneOfTypes(this.model.editModel.error.get('messages'), this.errorTypes);
                this.children.flashMessage = new FlashMessagesView({ model: this.model.editModel });

                if (!this.isError) {
                    var editable = this.model.editModel.entry.acl.canWrite();

                    this.children.searchInput = new SearchInput({
                        model: this.model.state,
                        modelAttribute: 'filter',
                        canClear: true,
                        style: 'search',
                        placeholder: _('filter').t(),
                        updateOnKeyUp: true

                    });
                    this.children.settings = new SettingsView({
                        model: {
                            state: this.model.state,
                            editModel: this.model.editModel
                        },
                        editable: editable
                    });
                    this.children.buttonHeader = new ButtonHeader({
                        model: {
                            state: this.model.state,
                            editModel: this.model.editModel
                        },
                        editable: editable
                    });
                    this.children.noAttributesMessage = new FlashMessagesLegacyView({
                        collection: new FlashMessagesCollection([{
                            type: 'error',
                            html: _('No attributes found.').t()
                        }])
                    });
                }

                this.activate();
            },

            startListening: function() {
                this.listenTo(this.model.state, 'showMessage', function(flag){
                    if (this.children.noAttributesMessage) {
                        this.children.noAttributesMessage.$el[flag ? 'show': 'hide']();
                    }
                });
            },
 
            render: function() {
                this.$el.html(this.compiledTemplate({
                    name: this.model.editModel.entry.get('name'),
                    url: this.options.backToListUrl
                }));

                var $header = this.$('.section-header'),
                    $control = this.$('.control-wrapper'),
                    $editForm = this.$('.edit-form-wrapper');

                if (!this.isError) {
                    this.children.buttonHeader.render().appendTo($control);
                    this.children.searchInput.render().appendTo($control);
                    this.children.flashMessage.render().appendTo($control);
                    this.children.noAttributesMessage.render().appendTo($editForm);
                    this.children.settings.render().appendTo($editForm);
                } else {
                    this.children.flashMessage.render().appendTo($header);
                    $editForm.hide();
                }

                setTimeout(this.bindScrolltoWindow.bind(this), 0);

                return this;
            },

            bindScrolltoWindow: function() {
                var $header = this.$('.section-header'),
                    offset = 0;

                // Calculate scroll offset on Y axis.
                var titleHeight = parseInt($header.find('.section-title').css('height'),10),
                    breadcrumbHeight = parseInt($header.find('.breadcrumb').css('height'),10),
                    headerTopPadding = parseInt($header.css('padding-top'), 10);

                offset = headerTopPadding + titleHeight + breadcrumbHeight;

                this.children.dock = new Dock({
                    el: this.el,
                    offset: -offset,
                    affix: '.control-wrapper',
                    affixTopClassName: 'fix-position'
                });
            },

            template: '\
            <div class="section-padded section-header"> \
                <% if(name) { %> \
                    <h2 class="section-title"><%- _("Advanced Edit").t() %>: <%- name %></h2> \
                    <div class="breadcrumb"><a href="<%- url%>">Searches, reports, and alerts</a> » <%- name%></div> \
                    <div class="control-wrapper clearfix"></div> \
                <% } %> \
            </div>\
            <div class="edit-form-wrapper"> \
            </div>\
            '
        });
    }
);
