define(function(require) {
    var BaseSplunkView = require('../basesplunkview');
    var mvc = require('../mvc');
    var _ = require('underscore');
    var $ = require('jquery');
    var controller = require('./controller');
    var EditControls = require('./editdashboard/master');
    var DragnDropView = require('./dragndrop');
    var console = require('util/console');
    var FieldsetView = require('../simpleform/fieldsetview');

    var DashboardTitleView = require('./dashboard/title');
    var DashboardDescriptionView = require('./dashboard/description');
    var DashboardRowView = require('./dashboard/row');
    var DashboardPanel = require('./dashboard/panel');
    var ScheduledView = require('models/services/ScheduledView');
    var EmptyStateView = require('./dashboard/empty');
    var FormSettingsView = require('../simpleform/edit/formsettings');
    var SchedulePDF = require('views/dashboards/table/controls/SchedulePDF');
    var sharedModels = require('../sharedmodels');

    var DashboardView = BaseSplunkView.extend({
        options: {
            showTitle: true,
            editable: true
        },

        initialize: function() {
            this.configure();
            this.collection = this.collection || {};
            this.collection.appLocalsUnfiltered = sharedModels.get('appLocalsUnfiltered');
            this.model = controller.getStateModel();
            this.model.scheduledView = new ScheduledView();
                    
            this.scheduledViewDfd = $.Deferred();
            controller.onViewModelLoad(function(){
                var dfd = this.model.scheduledView.findByName(this.model.view.entry.get('name'),
                    this.model.app.get('app'),
                    this.model.app.get('owner'));
                dfd.done(_.bind(this.scheduledViewDfd.resolve, this.scheduledViewDfd));
                dfd.fail(_.bind(this.scheduledViewDfd.reject, this.scheduledViewDfd));
            }, this);

            if (this.settings.get('editable')) {
                this.editControls = new EditControls({
                    model: {
                        state: this.model,
                        dashboard: this.model.view,
                        application: this.model.app,
                        scheduledView: this.model.scheduledView,
                        serverInfo: this.model.serverInfo,
                        userPref: this.model.userPref
                    },
                    collection: {
                        appLocalsUnfiltered: this.collection.appLocalsUnfiltered
                    },
                    controller: controller
                });
                this.model.on('change:edit', this.onEditStateChange, this);
            }
            this.listenTo(this.model, 'change:dialog', this.handleDialog);
            if (this.model.has('dialog')) {
                this.handleDialog(this.model);
            }
        },
        render: function() {
            var model = this.model;
            _.each(this.$('.dashboard-row'), function(row) {
                var $row = $(row);
                var id = $row.attr('id');
                if (!mvc.Components.has(id)) {
                    new DashboardRowView({
                        id: id,
                        tokenDependencies: {
                            depends: $row.data('depends'),
                            rejects: $row.data('rejects')
                        },
                        el: row
                    }).renderFromDOM();
                }
            });
            if (this.settings.get('showTitle')) {
                this.titleView = new DashboardTitleView({
                    model: this.model,
                    el: this.$('.dashboard-header h2')
                }).render();

                var descEl = this.$('p.description');
                if (!descEl.length) {
                    descEl = $('<p class="description"></p>').appendTo(this.$('.dashboard-header')).hide();
                }

                this.descriptionView = new DashboardDescriptionView({
                    el: descEl,
                    model: model
                }).render();
            }

            var fieldsetEl = this.$el.children('.fieldset');
            if(!fieldsetEl.length) {
                fieldsetEl = $('<div class="fieldset"></div>').insertAfter(this.$('.dashboard-header'));
            }
            this.fieldsetView = new FieldsetView({
                el: fieldsetEl
            }).render();

            if (this.settings.get('editable')) {
                var editEl = $('<div class="edit-dashboard-menu pull-right"></div>').prependTo(this.$('.dashboard-header'));
                $.when(this.scheduledViewDfd).then(function () {
                    this.editControls.render().appendTo(editEl);
                }.bind(this));
            }

            _(this.$('.dashboard-cell')).each(function(el){
                var $el = $(el);
                var id = $el.attr('id');
                if (!mvc.Components.has(id)) {
                    new DashboardPanel({
                        id: id,
                        tokenDependencies: {
                            depends: $el.data('depends'),
                            rejects: $el.data('rejects')
                        },
                        el: el
                    }).renderFromDOM();
                }
            });

            this.onEditStateChange();

            _.defer(function() {
                $('body').removeClass('preload');
            });

            this.$el.addClass(this.model.get('edit') ? 'edit-mode' : 'view-mode');

            controller.onReady(_.bind(function() {
                if (this.model.view.isSimpleXML()) {
                    this.resetDashboardStructure();
                }
            }, this));

            this.updateEmptyState();
            return this;
        },
        getController: function() {
            return controller;
        },
        getStateModel: function() {
            return this.model;
        },
        getDashboardStructure: function(options) {
            options || (options = {});
            var structure = {};
            var getCmp = _.bind(mvc.Components.get, mvc.Components);
            
            var fieldset = getCmp(this.$el.children('.fieldset').attr('id')); 

            structure.fieldset = fieldset ? fieldset.serializeStructure(options) : [];
            structure.rows = _(this.$el.children('.dashboard-row')).chain()
                .map($).invoke('attr', 'id')
                .map(_.bind(mvc.Components.get, mvc.Components))
                .filter(function(row){ return row && options.omitHidden !== true || !row.$el.is('.hidden');})
                .map(function(row){ return row.serializeStructure(options); })
                .value();

            return structure;
        },
        isEmptyDashboard: function() {
            return false;
        },
        getElementIds: function(options) {
            return _(this.getDashboardStructure(options).rows).chain().pluck('panels').flatten().pluck('elements').flatten().value();
        },
        updateEmptyState: function(forceNotEmpty){
            if(this.isEmptyDashboard() && forceNotEmpty !== true && this.model.view.isSimpleXML()) {
                if(!this.emptyStateView) {
                    this.emptyStateView = new EmptyStateView({
                        model: {
                            app: this.model.app,
                            state: this.model
                        }
                    });
                }
                this.emptyStateView.render().$el.appendTo(this.$el);
            } else if(this.emptyStateView) {
                this.emptyStateView.remove();
                this.emptyStateView = null;
            }
        },
        enterEditMode: function() {
            this.leaveEditMode();

            if(this.model.get('editable')) {
                console.log('Entering edit mode');
                this.dragnDrop = new DragnDropView({
                    el: this.el
                });
                if (!this.resetDashboardStructure()) {
                    return;
                }
                this.dragnDrop.on('sortupdate', _.debounce(this.updatePanelOrder, 0), this);
                this.dragnDrop.render();
                if (this.$el.is('.view-mode')) {
                    this.$el.addClass('edit-mode').removeClass('view-mode');
                }
                this.formSettings = new FormSettingsView().render().insertBefore(this.$el.children('.fieldset'));
            } else {
                console.log('Aborting edit mode: Dashboard is not editable');
                this.model.set('edit', false);
            }
        },
        resetDashboardStructure: function(){
            try {
                this.model.view.captureDashboardStructure(this.getDashboardStructure());
            } catch (e) {
                console.error('Error capturing dashboard structure - disabling edit mode!', e);
                this.model.set('editable', false);
                this.model.set('edit', false);
                return false;
            }
            return true;
        },
        updatePanelOrder: function() {
            return this.updateDashboardStructure();
        },
        updateDashboardStructure: function(options) {
            if(this.model.get('editable')) {
                return this.model.view.updateStructure(this.getDashboardStructure(), options);
            }
            return $.Deferred().resolve();
        },
        leaveEditMode: function() {
            if (this.formSettings) {
                this.formSettings.remove();
                this.formSettings = null;
            }
            if(this.dragnDrop) {
                this.dragnDrop.off();
                this.dragnDrop.destroy();
                this.updatePanelOrder();
                this.dragnDrop = null;
            }
            if (this.$el.is('.edit-mode')) {
                this.$el.removeClass('edit-mode').addClass('view-mode');
            }
            this.updateEmptyState();
        },
        onEditStateChange: function() {
            if (this.model.get('edit')) {
                controller.onReady(_.bind(this.enterEditMode, this));
            } else {
                this.leaveEditMode();
            }
        },
        events: {
            'structureChange': function(e) {
                if (this.model.get('edit')) {
                    this.updatePanelOrder();
                }
                this.updateEmptyState();
            },
            'structureReset': function(e) {
                if (this.resetDashboardStructure()) {
                    this.updateDashboardStructure();
                }
            },
            'panelRemoved': function(e) {
                this.onPanelRemoved($(e.target));
            }
        },
        getChildContainer: function(){
            return this.$el;
        },
        onPanelRemoved: function(cell) {
            cell.trigger('cellRemoved');
            this.updateEmptyState();
        },
        createNewRow: function(){
            var row = new DashboardRowView({ });
            row.render().$el.appendTo(this.$el);
            return row;
        },
        createNewPanel: function(options){
            var row = this.createNewRow();
            var panel = new DashboardPanel(options);
            panel.render().$el.appendTo(row.getChildContainer());
            _.defer(_.bind(this.updateEmptyState, this));
            return panel;
        },
        handleDialog: function(model) {
            if (model.get('dialog')) {
                controller.onViewModelLoad(function() {
                    if (model.get('dialog') === 'schedulePDF') {
                        model.unset('dialog');
                        if (!model.view.isForm()) {
                            this.openSchedulePDFDialog();
                        }
                    }
                }, this);
            }
        },
        openSchedulePDFDialog: function() {
            var model = this.model;
            this.scheduledViewDfd.done(function() {
                var schedulePDF = new SchedulePDF({
                    model: {
                        scheduledView: model.scheduledView,
                        dashboard: model.view,
                        application: model.app,
                        appLocal: model.appLocal
                    },
                    onHiddenRemove: true
                });
                $("body").append(schedulePDF.render().el);
                schedulePDF.show();
            });
        },
        rowTemplate: '  <div class="dashboard-row">\
                            <div class="dashboard-cell" style="width: 100%;">\
                                <div class="dashboard-panel clearfix">\
                                    <div class="panel-element-row">\
                                        <div class="dashboard-element" id="<%= id %>" style="width: 100%">\
                                            <div class="panel-head"><h3><%- title %></h3></div>\
                                            <div class="panel-body"></div>\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>'
    });

    return DashboardView;
});
