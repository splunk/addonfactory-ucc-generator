/*
 * This view provides the popdown dialog for picking a visualization.
 */

define(
    [
        'underscore',
        'jquery',
        'module',
        'models/Base',
        'views/shared/PopTart',
        'uri/route'
    ],
    function(_, $, module, BaseModel, PopTart, route){
        return PopTart.extend({
            moduleId: module.id,

            options: {
                saveOnApply: false
            },

            /**
             * @constructor
             * @param options {
             *     model: {
             *         report: <models.search.Report>,
             *         application: <models.shared.Application>
             *         viz: <models.base>
             *         user: <models.shared.User>
             *     }
             *     items: <Array> 2d array of viz definitions in the form
             *         {
             *              id: <string>,
             *              label: <string>,
             *              icon: <string>,
             *              categories: <array> of category strings,
             *              description: <string>,
             *              searchHint: <string>,
             *              thumbnailPath: <string> url, 
             *         }
             * }
             */

            initialize: function(options) {
                this.vizModel = this.model.viz;
                this.userModel = this.model.user;
                this.applicationModel = this.model.application;
                this.items = this.options.items;
                this.compiledListTemplate = _.template(this.listSectionTemplate);

                PopTart.prototype.initialize.apply(this, arguments);
            },

            events: {
                'click .viz-picker-list-item': function(e) {
                    e.preventDefault();

                    var vizItem = this._getItemById($(e.target).closest('a').data('vizId'));
                    this.vizModel.set(_.extend({}, vizItem));

                    this.hide();
                },
                'mouseover .viz-picker-list-item': function(e) {
                    e.preventDefault();

                    var vizItem = this._getItemById( $(e.target).closest('a').data('vizId') );
                    this._setInfoTextForItem(vizItem);
                },

                'focus .viz-picker-list-item': function(e) {
                    e.preventDefault();

                    var vizItem = this._getItemById( $(e.target).closest('a').data('vizId') );
                    this._setInfoTextForItem(vizItem);
                },

                'mouseleave .list-container': function(e) {
                    e.preventDefault();
                    this._setDefaultText();
                },

                'mouseleave': function(e) {
                    e.preventDefault();
                    this._setDefaultText();
                }
            },

            _setDefaultText: function(){
                if (this.model.viz.has('id')) {
                    this._setInfoTextForItem(this._getItemById(this.model.viz.get('id')));
                }
            },

            _setInfoTextForItem: function(vizItem) {
                this._clearInfoText();
                this.$('.viz-picker-info-label').text(vizItem.label);
                this.$('.viz-picker-info-details').text(vizItem.description);

                if(vizItem.searchHint){
                    this.$('.viz-picker-info-search-hint-container').css('display', 'block');
                    this.$('.viz-picker-info-search-hint-text').text(vizItem.searchHint);
                }
            },

            _clearInfoText: function () {
                this.$('.viz-picker-info-label').text('');
                this.$('.viz-picker-info-details').text('');
                this.$('.viz-picker-info-search-hint-text').text('');
                this.$('.viz-picker-info-search-hint-container').css('display', 'none');
            },

            _getItemById: function(vizId) {
                var vizItem = _.filter(_(this.items).flatten(), function(viz) { 
                    return viz.id === vizId; 
                });
                return vizItem[0];
            },

            render: function() {
                this.$el.append(this.compiledTemplate({
                    showFindMoreLink: this.userModel.canUseApps() && this.userModel.canViewRemoteApps(),
                    findMoreHref: route.appsRemote(
                        this.applicationModel.get('root'),
                        this.applicationModel.get('locale'),
                        this.applicationModel.get('app'),
                        { data: { content: 'visualizations', type: 'app' } }
                    )
                }));
                if (this.options.warningMsg) {
                    var html = _.template(this.warningMessageTemplate, {
                        hasLearnMoreLink: this.options.warningLearnMoreLink != null,
                        message: this.options.warningMsg,
                        learn_more: _("Learn More").t(),
                        link: this.options.warningLearnMoreLink
                    });
                    $(html).appendTo(this.$(".popdown-dialog-body"));
                }
                var sections = {
                    recommended: {
                        header: _('Recommended').t(),
                        items: [],
                        className: 'list-section-recommended'
                    },
                    splunk: {
                        header: _('Splunk Visualizations').t(),
                        items: [],
                        className: 'list-section-splunk'
                    },
                    more: {
                        header: _('More').t(),
                        items: [],
                        className: 'list-section-more'
                    }
                };
                _.each(_(this.items).flatten(), function(vizItem) {

                    // Find recommended
                    if (_.contains(vizItem.categories, 'recommended')) {
                        sections.recommended.items.push(vizItem);
                    }

                    // Everything goes in either splunk, or more
                    if (_.contains(vizItem.categories, 'external')) {
                        sections.more.items.push(vizItem);
                    }
                    else {
                        sections.splunk.items.push(vizItem);
                    }
                    
                    //TODO: add other sections for other categries
                }, this);

                // Iterate over the sections in reversed order since they are going to
                // be prepended to the dialog body.
                _.each([sections.more, sections.splunk, sections.recommended], function(section) {
                    if (section.items && section.items.length > 0) {
                        this.$('.viz-picker-dialog-body').prepend(
                            this.compiledListTemplate({
                                sectionHeader: section.header,
                                listItems: section.items,
                                sectionClassName: section.className || ''
                            })
                        );
                    }
                }, this);

                var defaultThumbnailPath = this.options.defaultThumbnailPath;
                this.$('.viz-picker-list-item img').error(function(e){
                    this.src = defaultThumbnailPath;
                });

                // Set the selected item if there is one
                if (this.model.viz.has('id')) {
                    this._setDefaultText();
                    var selectedDOMElement = this.$('*[data-viz-id="' + this.model.viz.get('id') + '"]');
                    selectedDOMElement.addClass('viz-picker-selected-viz-item');
                    this.$onOpenFocus = selectedDOMElement;
                }

                this.$('.viz-picker-info-search-hint-container').css('display', 'none');
                
                return this;
            },

            listSectionTemplate: '\
                <div class="viz-picker-list-section <%- sectionClassName %>">\
                    <p> <%- sectionHeader %> </p>\
                    <div class="list-item-container">\
                        <% _.each(listItems, function(listItem) { %>\
                            <a href="#" class="viz-picker-list-item" data-viz-id="<%- listItem.id %>">\
                                <img class="viz-picker-img" src="<%- listItem.thumbnailPath %>"/>\
                            </a>\
                        <% }); %>\
                    </div>\
                </div>\
                <div class="viz-picker-clear-fix"></div>\
            ',
            warningMessageTemplate: '\
                <div class="vizpicker-message">\
                    <i class="icon icon-warning"></i>\
                    <span class="message-text">\
                        <%- message %>\
                        <% if (hasLearnMoreLink) {%>\
                        <a class="learn-more external" href="<%- link %>"><%- learn_more %></a>\
                        <% } %>\
                    </span>\
                </div>\
            ',

            template: '\
                <div class="arrow"></div>\
                <div class="popdown-dialog-body viz-picker-dialog-body">\
                    <% if (showFindMoreLink) { %>\
                        <a class="viz-picker-find-more-link" href="<%- findMoreHref %>" target="_blank">\
                            <%- _("Find more visualizations").t() %>\
                            <i class="icon-external"></i>\
                        </a>\
                    <% } %>\
                </div>\
                <div class="popdown-dialog-footer viz-picker-dialog-footer">\
                    <h5 class="viz-picker-info-label"></h5>\
                    <p class="viz-picker-info-details"></p>\
                    <div class="viz-picker-info-search-hint-container">\
                        <p class="viz-picker-info-search-hint-header"> <%- _("Search Fragment").t() %> </p>\
                        <p class="viz-picker-info-search-hint-text"></p>\
                    </div>\
                </div>\
            '
        });
    }
);
