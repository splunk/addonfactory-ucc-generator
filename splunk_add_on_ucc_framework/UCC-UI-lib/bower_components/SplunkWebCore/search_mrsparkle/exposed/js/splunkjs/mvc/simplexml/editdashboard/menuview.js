define(function(require, exports, module) {
    var _ = require('underscore');
    var $ = require('jquery');
    var BaseView = require('views/Base');
    var pdfUtils = require('util/pdf_utils');
    var console = require('util/console');
    var mvc = require('../../../mvc');
    var utils = require('../../utils');
    var route = require('uri/route');
    var EditMenu = require('./editmenu');
    var MoreInfoMenu = require('./moreinfomenu');
    var AddFormMenu = require('./addformmenu');
    var Printer = require('helpers/Printer');
    var AddContent = require('../addcontent/master');
    var DashboardSerializer = require('../serializer');

    var MenuView = BaseView.extend({
        moduleId: module.id,
        className: 'edit-menu',
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model.state.on('change:edit', this.onEditModeChange, this);
            this.model.state.on('change:editable change:pdf_available', this.render, this);
            this.model.state.user.on("change", this.render, this);
        },
        events: {
            'click a.edit-btn': function(e) {
                e.preventDefault();
                var $target = $(e.currentTarget);
                if (this.children.editMenu && this.children.editMenu.shown) {
                    this.children.editMenu.hide();
                    return;
                }
                if (this.children.moreInfoMenu && this.children.moreInfoMenu.shown) {
                    this.children.moreInfoMenu.hide();
                }
                $target.addClass('active');
                this.children.editMenu = new EditMenu({
                    model: {
                        application: this.model.application,
                        dashboard: this.model.dashboard,
                        state: this.model.state, 
                        scheduledView: this.model.scheduledView,
                        serverInfo: this.model.serverInfo,
                        userPref: this.model.userPref
                    },
                    collection: this.collection,
                    showOpenActions: this.options.showOpenActions,
                    deleteRedirect: this.options.deleteRedirect,
                    onHiddenRemove: true
                });
                $('body').append(this.children.editMenu.render().el);
                this.children.editMenu.show($target);
                this.children.editMenu.on('hide', function() {
                    $target.removeClass('active');
                }, this);
            },
            'click a.more-info-btn': function(e) {
                e.preventDefault();
                var $target = $(e.currentTarget);
                if (this.children.moreInfoMenu && this.children.moreInfoMenu.shown) {
                    this.children.moreInfoMenu.hide();
                    return;
                }
                if (this.children.editMenu && this.children.editMenu.shown) {
                    this.children.editMenu.hide();
                }
                $target.addClass('active');
                this.children.moreInfoMenu= new MoreInfoMenu({
                    model: {
                        application: this.model.application,
                        dashboard: this.model.dashboard,
                        state: this.model.state,
                        scheduledView: this.model.scheduledView,
                        serverInfo: this.model.serverInfo
                    },
                    collection: this.collection.roles,
                    onHiddenRemove: true
                });
                
                $('body').append(this.children.moreInfoMenu.render().el);
                this.children.moreInfoMenu.show($target);
                this.children.moreInfoMenu.on('hide', function() {
                    $target.removeClass('active');
                }, this);
            },
            'click a.edit-done': function(e){
                e.preventDefault();
                this.model.state.set('edit', false);
            },
            'click a.add-form': function(e) {
                e.preventDefault();
                var $target = $(e.currentTarget);
                if ($target.hasClass('disabled')) {
                    return;
                }
                if (this.children.addFormMenu && this.children.addFormMenu.shown) {
                    this.children.addFormMenu.hide();
                    return;
                }
                $target.addClass('active');

                this.children.addFormMenu = new AddFormMenu({
                    model: {
                        application: this.model.application,
                        dashboard: this.model.dashboard,
                        state: this.model.state,
                        scheduledView: this.model.scheduledView
                    },
                    collection: this.collection.roles,
                    onHiddenRemove: true
                });
                $('body').append(this.children.addFormMenu.render().el);
                this.children.addFormMenu.show($target);
                this.children.addFormMenu.on('hide', function() {
                    $target.removeClass('active');
                }, this);
            },
            'click a.add-panel': function(e) {
                e.preventDefault();
                this.children.addContent = new AddContent();
                this.children.addContent.render();
            },
            'click a.print-dashboard': function(e){
                e.preventDefault();
                Printer.printPage();
            },
            'click a.generate-pdf': function(e){
                e.preventDefault();
                var view = this.model.dashboard.entry.get('name'),
                    app = this.model.dashboard.entry.acl.get('app'),
                    params = {}, idx = 0;

                // Collect SIDs for search jobs on the dashboard
                var dashboardView = mvc.Components.get('dashboard');
                _.map(dashboardView.getElementIds({flatten: true, omitHidden: true}), function(id) {
                    var element = mvc.Components.get(id);
                    if(element && element.getExportParams) {
                        _.extend(params, element.getExportParams('sid_'+idx));
                    }
                    idx++;
                });

                pdfUtils.isPdfServiceAvailable().done(function(available, type){
                    if(type === 'pdfgen') {
                        var dashboardStructure = dashboardView.getDashboardStructure({ tokens: false, flatten: true, omitHidden: true });
                        var xml = DashboardSerializer.createFlattenedDashboardXML(dashboardStructure, {
                            label: dashboardView.model.get('label'),
                            description: dashboardView.model.get('description'),
                            useLoadjob: false,
                            indent: false,
                            pdf: true
                        });
                        pdfUtils.downloadReportFromXML(xml, app, view, params);
                    }
                });
            }
        },
        onEditModeChange: function() {
            var edit = this.model.state.get('edit');
            if(edit) {
                this.$('.dashboard-view-controls').hide();
                this.$('.dashboard-edit-controls').show();
                this.$('.dashboard-edit-controls .add-panel').focus();
            } else {
                this.$('.dashboard-edit-controls').hide();
                this.$('.dashboard-view-controls').show();
                this.$('.dashboard-view-controls .edit-btn').focus();
            }
            this.setAddInputState();
        },
        setAddInputState: function(){
            var isScheduled = this.model.scheduledView.entry.content.get('is_scheduled');
            if (isScheduled) {
                this.$('.add-form').addClass('disabled').tooltip({ animation:false, placement: 'bottom', title: _("You must unschedule this dashboard to add form fields. To do this, use the \"Schedule PDF Delivery\" link in the edit menu.").t() });
            } else {
                this.$('.add-form').removeClass('disabled').tooltip('destroy');
            }
        },
        render: function() {
            var app = this.model.application.toJSON();
            var renderModel = {
                dashboard: this.model.dashboard.isDashboard(),
                editLinkViewMode: route.manager(app.root, app.locale, app.app, ['data','ui','views', app.page], {
                            data: {
                                action: 'edit',
                                ns: app.app,
                                redirect_override: route.page(app.root, app.locale, app.app, app.page)
                            }
                        }),
                editLinkEditMode: route.manager(app.root, app.locale, app.app, ['data','ui','views', app.page], {
                            data: {
                                action: 'edit',
                                ns: app.app,
                                redirect_override: route.page(app.root, app.locale, app.app, app.page) + '/edit'
                            }
                        }),
                dashboardType: this.model.dashboard.getViewType(),
                editable: this.model.state.get('editable'),
                canWrite: this.model.dashboard.entry.acl.canWrite(),
                removable: this.model.dashboard.entry.links.get('remove') ? true : false,
                isSimpleXML: this.model.dashboard.isSimpleXML(),
                isHTML: this.model.dashboard.isHTML(),
                isPdfServiceAvailable: this.model.state.get('pdf_available'),
                showAddTRP: !this.model.state.get('default_timerange'),
                isScheduled: this.model.scheduledView.entry.content.get('is_scheduled'),
                _: _
            };

            this.$el.html(this.compiledTemplate(renderModel));
            this.setAddInputState();

            this.$('.generate-pdf').tooltip({ animation:false, title: _("Export PDF").t() });
            this.$('.print-dashboard').tooltip({ animation:false, title: _("Print").t() });
            this.onEditModeChange();
            return this;
        },
        template: '\
            <span class="dashboard-view-controls">\
                <% if(canWrite) { %>\
                    <div class="btn-group">\
                        <a class="btn edit-btn" href="#"><%- _("Edit").t() %> <span class="caret"></span></a>\
                        <a class="btn more-info-btn" href="#"><%- _("More Info").t() %> <span class="caret"></span></a>\
                    </div>\
                <% }else{ %>\
                    <div class="btn-group">\
                        <a class="btn edit-btn" href="#"><%- _("Edit").t() %> <span class="caret"></span></a>\
                    </div>\
                <% } %>\
                <div class="btn-group">\
                    <% if(isSimpleXML && isPdfServiceAvailable) { %>\
                        <a class="btn generate-pdf" href="#"><i class="icon-export icon-large"></i></a>\
                    <% } %>\
                    <a class="btn print-dashboard" href="#"><i class="icon-print icon-large"></i></a>\
                </div>\
            </span>\
            <span class="dashboard-edit-controls" style="display:none;">\
                <div class="btn-group">\
                    <a class="btn add-panel" href="#"><i class="icon-plus"></i> <%- _("Add Panel").t() %></a>\
                    <a class="btn add-form" href="#"><i class="icon-plus"></i> <%- _("Add Input").t() %> <span class="caret"></span></a>\
                    <a class="btn edit-source" href="<%- editLinkEditMode %>"><i class="icon-code"></i> <%- _("Edit Source").t() %></a>\
                </div>\
                <a class="btn btn-primary edit-done" href="#"><%- _("Done").t() %></a>\
            </span>\
        '
    });
    
    return MenuView;
}); 
