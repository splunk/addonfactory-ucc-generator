define([
    'module',
    'underscore',
    'views/dashboard/editor/element/ElementControls',
    'views/dashboard/editor/element/DialogHelper',
    'controllers/dashboard/helpers/EditingHelper',
    'util/general_utils'
], function(module,
            _,
            ElementControls,
            DialogHelper,
            EditingHelper,
            GeneralUtils) {

    var InlineSearchControls = ElementControls.extend({
        moduleId: module.id,
        events: _.extend(ElementControls.prototype.events, {
            'click a.action-edit-search': function(e) {
                e.preventDefault();
                var dialog = DialogHelper.openEditSearchDialog({
                    model: this.model,
                    manager: this.manager
                }).on('searchUpdated', function(searchAttributes) {
                    this.manager.settings.set(searchAttributes, {tokens: true});
                    this.model.controller.trigger('edit:search', {managerId: this.manager.id});
                    dialog.hide();
                }.bind(this));
                this.children.popdown.hide();
            },
            'click a.action-convert-to-report': function(e) {
                e.preventDefault();
                var dialog = DialogHelper.openCreateReportDialog({
                    model: this.model,
                    manager: this.manager
                }).on('saveAsReport', function(createdReport) {
                    // pre-populate the title
                    this.model.savedReport.entry.set('name', createdReport.entry.content.get('name'));
                    EditingHelper.saveAsReport(this.manager, createdReport, this.model.report, {
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner')
                    }).then(function() {
                        this.model.controller.trigger('edit:save-inline-as-report', {managerId: this.manager.id});
                        dialog.hide();
                    }.bind(this));
                }.bind(this));
                this.children.popdown.hide();
            }
        }),
        getIconClass: function() {
            var isPivot = GeneralUtils.isValidPivotSearch(this.manager.settings.resolve());
            return isPivot ? "icon-pivot" : "icon-search-thin";
        },
        template: '\
            <a class="dropdown-toggle btn-pill" href="#">\
                    <span class="<%- iconClass %>"></span><span class="caret"></span>\
            </a>\
            <div class="dropdown-menu">\
                <div class="arrow"></div>\
                <ul class="report-info">\
                    <li class="element-type"><%- _("INLINE SEARCH").t() %></li>\
                </ul>\
                <ul class="element-actions">\
                    <li><a href="#" class="action-change-title"><%- _("Edit Title").t() %></a></li>\
                    <li><a href="#" class="action-edit-search"><%- _("Edit Search").t() %></a></li>\
                    <li><a href="#" class="action-convert-to-report"><%- _("Convert to Report").t() %></a></li>\
                </ul>\
            </div>\
        '
    });

    return InlineSearchControls;
});