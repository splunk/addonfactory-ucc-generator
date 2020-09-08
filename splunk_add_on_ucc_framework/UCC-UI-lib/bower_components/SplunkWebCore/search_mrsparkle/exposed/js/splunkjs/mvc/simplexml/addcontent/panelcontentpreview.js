define(function(require, exports, module){
    var _ = require('underscore');
    var BaseView = require('views/Base');
    var PermissionsView = require('views/shared/documentcontrols/details/Permissions');
    var sharedModels = require('../../sharedmodels');
    var PreviewPanel = require('../dashboard/previewpanel');
    var sidebarTemplate = require('contrib/text!./sidebartemplate.html');
    
    var PanelContentPreviewView = BaseView.extend({
        moduleId: module.id,
        className: 'panel_content_preview content-preview',
        events: {
            'click .btn.add-content': 'addToDashboard'
        },
        /**
        * @param {Object} options {
        *       model:  <models.services.data.ui.panel>
        * }
        */
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.children.panel = new PreviewPanel();
            this.children.permissionsView = new PermissionsView({
                    model: {
                        report: this.model, 
                        user: sharedModels.get('user')
                    }
            });
        },
        addToDashboard: function(evt) {
            if (typeof evt.preventDefault == "function") {
                evt.preventDefault();
            }
            this.trigger('addToDashboard', this.model);
        },
        getPreview: function() {
            // Render new panel to screen
            this.children.panel.render();
            this.children.panel.previewXML(this.model.entry.content.get('eai:data'));
            return this.children.panel.$el;
        },
        render: function() {
            this.$el.html(this.compiledTemplate({title: _("Preview").t()}));
            this.$('.preview-body').append(_.template(
                this.refPanelTemplate, 
                {
                    canUseApps: sharedModels.get('user').canUseApps(), 
                    model: this.model 
                }));
            this.$el.find('.preview-body').addClass('dashboard-row');
            this.children.permissionsView.render().appendTo(this.$('dd.permissions'));
            this.getPreview().appendTo(this.$('.preview-body'));
            return this;
        },
        focus: function() {
            this.$el.find('.add-content').focus();
        },
        template: sidebarTemplate,
        refPanelTemplate: '\
            <dl class="list-dotted">\
                <% if(model.entry.content.get("panel.description")) { %>\
                    <dt class="description"><%- _("Description").t() %></dt>\
                    <dd class="description"><%- model.entry.content.get("panel.description") %></dd>\
                <% } %>\
                <% if(canUseApps) { %>\
                    <dt class="app"><%- _("App").t() %></dt>\
                    <dd class="app"><%- model.entry.acl.get("app") %></dd>\
                <% } %>\
                <dt class="permissions"><%- _("Permissions").t() %></dt>\
                    <dd class="permissions"></dd>\
            </dl>\
        '
    });
    
    return  PanelContentPreviewView;
});