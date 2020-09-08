define(function(require, exports, module){
    var $ = require('jquery');
    var _ = require('underscore');
    var BaseView = require('views/Base');
    var sidebarTemplate = require('contrib/text!./sidebartemplate.html');
    var PreviewPanel = require('../dashboard/previewpanel');
    var DashboardParser = require('../parser');
    var SharedModels = require('../../sharedmodels');
    var SplunkdUtils = require('util/splunkd_utils');
    var PanelModel = require('models/services/data/ui/Panel');
    var Messages = require('../../messages');
    var sprintf = require('splunk.util').sprintf;

    return BaseView.extend({
        moduleId: module.id,
        className: 'panel_content_preview content-preview',
        events: {
            'click .btn.add-content': 'addToDashboard'
        },
        initialize: function(options){
            BaseView.prototype.initialize.apply(this, arguments);
            this.children = this.children || {};
            this.panel = options.panel;
        },
        addToDashboard: function(evt) {
            if (typeof evt.preventDefault == "function") {
                evt.preventDefault();
            }
            this.trigger('addToDashboard', this.panel);
        },
        renderPreview: function() {
            var panel = this.panel;
            if (this.panel.type === "panelref") {
                this.panelModel = new PanelModel();
                var appModel = SharedModels.get('app');
                var app =  this.panel.settings.app || appModel.get('app');
                var panelName = this.panel.settings.ref;
                this.panelModel.entry.set('name', panelName);
                this.panelModel.entry.acl.set('app', app);
                this.renderMessage({
                    icon: "info-circle",
                    level: "info",
                    message: _("Loading panel...").t()
                });
                var that = this;
                this.panelModel.fetch({
                    url: SplunkdUtils.fullpath(this.panelModel.url + "/" + encodeURIComponent(panelName), {
                        app: app,
                        owner: appModel.get("owner")
                    }),
                    success: function() {
                        that.parsePanel();
                    },
                    error: function(model, xhr){
                        var errorMsg = xhr.status === 404 ?
                            sprintf(_("Dashboard panel \"%s\" not found.").t(), _.escape(panelName)) :
                            sprintf(_("Error loading dashboard panel \"%s\".").t(), _.escape(panelName));
                        that.onLoadError(errorMsg, panelName, app);
                    }
                });

            } else {
                this.createPreviewPanel({ preview: this.panel });
            }
        },
        parsePanel: function() {
            var panelXml = this.panelModel.entry.content.get('eai:data');
            try {
                var parser = DashboardParser.getDefault();
                var parserResult = parser.parsePanel(panelXml);
                this.removeMessage();
                this.createPreviewPanel({ preview: parserResult });
            } catch (e) {
                this.onParserError(e);
                return $.Deferred().reject(e);
            }
        },
        createPreviewPanel: function(options) {
            if (this.children.previewPanel) {
                this.children.previewPanel.remove();
                this.children.previewPanel = null;
            }
            return (this.children.previewPanel = new PreviewPanel(options)).render().$el.appendTo(this.$('.preview-body'));
        },
        onLoadError: function(msg) {
            this._loading = false;
            this.renderError(msg);
        },
        onParserError: function() {
            this._loading = false;
            this.renderError(_("Error parsing prebuilt dashboard panel.").t());
        },
        renderError: function(msg){
            this.renderMessage({
                icon: "warning-sign",
                level: "error",
                message: msg
            });
        },
        renderMessage: function(msg) {
            this.removeMessage();
            var ct = $('<div class="dashboard-element panel-message"></div>');
            var ctInner = $('<div class="panel-body"></div>').appendTo(ct);
            Messages.render(msg, ctInner);
            this.$('.preview-body').append(ct);
        },
        removeMessage: function(){
            this.$('.preview-body').children('.panel-message').remove();
        },
        render: function() {
            this.$el.html(this.compiledTemplate({title: _("Preview").t()}));
            this.$el.find('.preview-body').addClass('dashboard-row');
            this.renderPreview();
            return this;
        },
        focus: function() {
            this.$el.find('.add-content').focus();
        },
        template: sidebarTemplate
    });
});
