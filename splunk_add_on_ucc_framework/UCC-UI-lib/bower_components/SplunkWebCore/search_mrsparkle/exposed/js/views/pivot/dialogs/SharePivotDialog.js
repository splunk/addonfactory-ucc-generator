define([
            'underscore',
            'module',
            'views/extensions/DeclarativeDependencies',
            'views/shared/Modal',
            'views/shared/controls/ControlGroup'
        ],
        function(
            _,
            module,
            DeclarativeDependencies,
            Modal,
            ControlGroup
        ) {

    var SharePivotDialog = Modal.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param options {Object} {
         *     shareLink {String} the fully-qualified link to use as the share link
         * }
         */

        initialize: function() {
            Modal.prototype.initialize.apply(this, arguments);
            this.$el.addClass('share-pivot-dialog');
            this.children.bookmark = new ControlGroup({
                label: _('Link To Pivot').t(),
                controlType: 'Text',
                help: _('Copy or bookmark the link by right-clicking the icon, or drag the icon into your bookmarks bar.').t(),
                controlOptions: {
                    defaultValue: this.options.shareLink,
                    append: _(this.bookmarkButtonTemplate).template({ shareLink: this.options.shareLink })
                }
            });
        },

        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Share Pivot').t());
            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
            this.children.bookmark.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
            this.$(Modal.BODY_SELECTOR).prepend(this.compiledTemplate({}));
        },

        template: '\
            <p>\
                <%- _("Share your pivot with this link. The job will run again with any relative times. This result set and job will not be shared.").t() %>\
            </p>\
        ',

        bookmarkButtonTemplate: '\
            <a class="add-on bookmark" href="<%- shareLink %>">\
                <i class="icon-bookmark"></i>\
                <span class="hide-text"><%- _("Splunk Pivot Report").t() %></span>\
            </a>\
        '

    },
    {
        apiDependencies: {}
    });

    return DeclarativeDependencies(SharePivotDialog);

});