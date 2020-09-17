define(function(require, exports, module){
    var $ = require('jquery');
    var _ = require('underscore');
    var BaseView = require('views/Base');
    var sidebarTemplate = require('contrib/text!./sidebartemplate.html');
    var InlineContent = require('../dialog/addpanel/inline');

    return BaseView.extend({
        moduleId: module.id,
        className: 'panel_content_preview content-preview',
        events: {
            'click .btn.add-content': 'addToDashboard'
        },
        initialize: function(options){
            BaseView.prototype.initialize.apply(this, arguments);
            this.children = this.children || {};
            this.children.inlineContent = new InlineContent({
                model: this.model,
                collection: {
                    timeRanges: this.collection.timesCollection
                }
            });
        },
        addToDashboard: function(evt) {
            if (typeof evt.preventDefault == "function") {
                evt.preventDefault();
            }
            var xhr = this.model.report.save();
            if (!xhr === false) {
                this.trigger('addToDashboard');
            }
        },
        getPreview: function() {
            var $div = $('<div/>');
            this.children.inlineContent.render().appendTo($div);
            return $div;
        },
        render: function() {
            var title = _('New ').t() + this.model.report.get('vizTypeLabel');
            this.$el.html(this.compiledTemplate({title: title}));
            this.getPreview().appendTo(this.$('.preview-body'));
            return this;
        },
        focus: function() {
            this.$("[name=title]").focus();
        },
        template: sidebarTemplate
    });
});
