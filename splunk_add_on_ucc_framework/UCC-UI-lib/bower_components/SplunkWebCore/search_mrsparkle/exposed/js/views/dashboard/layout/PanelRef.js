define([
    'module',
    'jquery',
    'underscore',
    'backbone',
    'views/dashboard/layout/Panel',
    'views/dashboard/editor/PanelEditor',
    'views/shared/dialogs/TextDialog',
    'models/services/data/ui/Panel',
    'dashboard/DashboardParser',
    'dashboard/DashboardFactory',
    'splunkjs/mvc/messages',
    'controllers/dashboard/helpers/ModelHelper',
    'util/splunkd_utils',
    'splunk.util'
], function(module,
            $,
            _,
            Backbone,
            Panel,
            PanelEditor,
            TextDialog,
            PanelModel,
            Parser,
            Factory,
            Messages,
            ModelHelper,
            SplunkdUtils,
            SplunkUtil) {

    var sprintf = SplunkUtil.sprintf;

    var PanelRef = Panel.extend({
        moduleId: module.id,
        className: 'dashboard-cell ref-panel',
        initialize: function(options) {
            Panel.prototype.initialize.apply(this, arguments);
            this.deferreds = _.extend({}, {
                panelReady: new $.Deferred(),
                panelRendered: new $.Deferred(),
                panelEditorReady: new $.Deferred()
            }, options.deferreds);
            this.model = _.extend({}, this.model);
            // render right away if there's panel model provided
            if (this.model.panel) {
                this.deferreds.panelReady.resolve();
            } else {
                this.model.panel = new PanelModel();
            }
            this.components = [];
            this.managers = [];
            this.events = [];
        },
        applySettings: function(newSettingProperties) {
            this.settings.set(newSettingProperties, {tokens: true});
        },
        render: function() {
            Panel.prototype.render.apply(this, arguments);
            this.deferreds.panelReady.then(function() {
                this.build(this.model.panel).then(function(rootComponent, managers, components, events) {
                    this.components = _(components).filter(_.identity);
                    this.managers = managers;
                    this.events = events;
                    this.deferreds.panelRendered.resolve();
                }.bind(this), this.deferreds.panelRendered.reject);
            }.bind(this));
            return this;
        },
        build: function(panelModel, options) {
            options || (options = {});

            options = _.extend({}, {
                idPrefix: this.id + '_',
                model: ModelHelper.getViewOnlyModel(this.model),
                deferreds: this.deferreds,
                collection: this.collection
            }, options);
            this.model.panel = panelModel;
            var panelXml = this.model.panel.entry.content.get('eai:data');
            try {
                var parser = Parser.getDefault();
                var parserResult = parser.parsePanel(panelXml);
                // no parsing error, remove loading message
                this._removeMessage();
                return Factory.getDefault().materializeExisting(this, parserResult, options);
            } catch (e) {
                this.onParserError(e);
                return $.Deferred().reject(e);
            }
        },
        onParserError: function(e) {
            this.renderError(_("Error parsing prebuilt dashboard panel.").t());
        },
        load: function(panelName, app, options) {
            if (!panelName) {
                this.renderError(_("Empty panel reference specified.").t());
                return;
            }
            this.model.panel.entry.set('name', panelName);
            this.model.panel.entry.acl.set('app', app);
            this._renderMessage({
                icon: "info-circle",
                level: "info",
                message: _("Loading panel...").t()
            });
            var self = this;
            this.model.panel.fetch({
                url: SplunkdUtils.fullpath(this.model.panel.url + "/" + encodeURIComponent(panelName), {
                    app: app || this.model.application.get('app'),
                    owner: this.model.application.get('owner')
                }),
                success: function() {
                    self.deferreds.panelReady.resolve();
                },
                error: function(model, xhr) {
                    var errorMsg = xhr.status === 404 ?
                        sprintf(_("Dashboard panel \"%s\" not found.").t(), _.escape(panelName)) :
                        sprintf(_("Error loading dashboard panel \"%s\".").t(), _.escape(panelName));
                    self.renderError(errorMsg);
                    self.deferreds.panelReady.reject();
                    self.deferreds.panelRendered.reject();
                }
            });
        },
        _renderFieldSet: function(options) {
            return Panel.prototype._renderFieldSet.call(this, {
                state: new Backbone.Model({
                    editable: false,
                    mode: 'view'
                })
            });
        },
        _removeMessage: function() {
            this.$panel.children('.panel-message').remove();
        },
        renderError: function(msg) {
            this._renderMessage({
                icon: "warning-sign",
                level: "error",
                message: msg
            });
        },
        _renderMessage: function(msg) {
            this.$panel = this.$panel || this.createOrFind('dashboard-panel');
            this._removeMessage();
            var ct = $('<div class="dashboard-element panel-message"></div>');
            var ctInner = $('<div class="panel-body"></div>').appendTo(ct);
            Messages.render(msg, ctInner);
            this.$panel.append(ct);
        },
        _renderTitleEditor: function() {
            // does not allow title to be modified
            this._renderTitle();
        },
        _onTitleChange: function() {
            this._renderTitle();
        },
        _renderPanelEditor: function() {
            $.when(this.deferreds.panelReady, this.deferreds.panelRendered).always(function() {
                var canConvert = !this._hasChildWithBaseSearch()
                    && this.deferreds.panelReady.state() == 'resolved'
                    && this.deferreds.panelRendered.state() == 'resolved';
                var tooltip = canConvert ? null : _('Unable to convert to prebuilt panel due to dependency on base search.').t();
                this.children.panelEditor = new PanelEditor({
                    model: this.settings,
                    icon: 'icon-lock',
                    label: _("Prebuilt Panel").t(),
                    actions: [
                        {
                            name: 'convert',
                            className: canConvert ? 'convert-panel' : 'disabled',
                            label: _("Convert to Inline Panel").t(),
                            tooltip: tooltip
                        },
                        {name: 'delete', className: 'delete-panel', label: _("Delete").t()}
                    ]
                });
                this.children.panelEditor.render().$el.prependTo(this.$panel);
                this.deferreds.panelEditorReady.resolve();
            }.bind(this));
        },
        _bindEventHandler: function() {
            this.deferreds.panelEditorReady.always(function() {
                this.children.panelEditor && this.listenTo(this.children.panelEditor, 'all', this._handleEditEvent);
                this.listenTo(this.settings, 'change', this._handleSettingChange);
            }.bind(this));
        },
        _handleEditEvent: function(event) {
            // panel editor event, delegate to controller
            switch (event) {
                case 'convert':
                    this._convertToInlinePanel();
                    break;
                case 'delete':
                    this._deletePanel();
                    break;
            }
        },
        _convertToInlinePanel: function() {
            var self = this;
            TextDialog.confirm(_("Conversion to an inline panel lets you edit and customize the panel on this dashboard.").t(), {
                id: 'modal_convert_to_inline',
                title: _("Convert to Inline Panel").t(),
                primaryButtonLabel: _("Convert").t(),
                primaryAction: function() {
                    self.model.controller.trigger('edit:make-inline-panel', {
                        panelId: self.id,
                        panelComponent: self
                    });
                }
            });
        },
        captureStructure: function() {
            return {
                type: 'panel',
                id: this.id
            };
        },
        remove: function() {
            _(this.events).invoke('dispose');
            _(this.components).invoke('remove');
            _(this.managers).invoke('dispose');
            Panel.prototype.remove.apply(this, arguments);
        }
    });

    return PanelRef;
});
