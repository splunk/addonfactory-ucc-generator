/**
 * Collapsible view that displays the current regex, if there is one.
 * Also contains controls for entering Manual Mode and previewing in search.
 */
define([
            'module',
            'views/Base'
        ],
        function(
            module,
            BaseView
        ) {


    return BaseView.extend({

        moduleId: module.id,
        className: 'extraction-viewer',

        events: {
            'click .preview-in-search-button': function(e) {
                e.preventDefault();
                if(!this.$el.hasClass('disabled')) {
                    this.trigger('action:previewInSearch');
                }
            },
            'click .manual-mode-button': function(e) {
                e.preventDefault();
                if(!this.$el.hasClass('disabled')) {
                    this.trigger('action:selectManualMode');
                }
            },
            'click .expand-collapse-button': function(e) {
                e.preventDefault();
                if(!this.$el.hasClass('disabled')) {
                    this.expanded = !this.expanded;
                    this.render();
                }
            }
        },

        /**
         * @constructor
         * @param options {
         *    model: {
         *        state {Model} the state of the current extraction
         *    }
         * }
         */

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.state, 'change:regex', this.render);
            this.expanded = false;
        },

        render: function() {
            var regex = this.model.state.get('regex');
            if(regex) {
                this.$el.html(this.compiledTemplate({
                    regex: regex,
                    expanded: this.expanded,
                    useSearchFilter: this.model.state.get('useSearchFilter')
                }));
                this.$el.show();
                var $expandCollapseContent = this.$('.regex-text-container, .regex-button-container');
                if(this.expanded) {
                    $expandCollapseContent.show();
                }
                else {
                    $expandCollapseContent.hide();
                }
            }
            else {
                this.$el.hide();
                this.$el.empty();
            }
            return this;
        },

        disable: function() {
            this.$el.addClass('disabled');
        },

        enable: function() {
            this.$el.removeClass('disabled');
        },

        template: '\
            <div class="search-button-container">\
                <a href="#" class="expand-collapse-button">\
                    <%- expanded ? _("Hide Regular Expression").t() : _("Show Regular Expression").t() %>\
                    <% if(expanded) { %>\
                        <i class="icon-chevron-down"></i>\
                    <% } else { %>\
                        <i class="icon-chevron-right"></i>\
                    <% } %>\
                </a>\
                <a href="#" class="preview-in-search-button btn">\
                    <%- _("View in Search").t() %>\
                    <i class="icon-external"></i>\
                </a>\
            </div>\
            <div class="regex-text-container">\
                <span class="regex-text"><%- regex %></span>\
            </div>\
            <div class="regex-button-container">\
                <a href="#" class="manual-mode-button btn"><%- _("Edit the Regular Expression").t() %></a>\
            </div>\
            <div class="clearfix"></div>\
        '

    });

});