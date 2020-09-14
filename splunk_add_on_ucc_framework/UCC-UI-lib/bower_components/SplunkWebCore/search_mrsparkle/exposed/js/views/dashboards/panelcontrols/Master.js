define([
    'underscore',
    'views/Base',
    'models/Base',
    'jquery',
    'module',
    'views/shared/controls/SyntheticSelectControl',
    'views/shared/delegates/Popdown',
    'views/shared/reportcontrols/details/Master',
    'collections/services/authorization/Roles',
    'models/shared/Application',
    'views/dashboards/panelcontrols/titledialog/Modal',
    'views/dashboards/panelcontrols/querydialog/Modal',
    'views/dashboards/panelcontrols/ReportDialog',
    'views/dashboards/panelcontrols/CreateReportDialog',
    'uri/route',
    'util/console', 
    'splunk.util',
    'views/shared/dialogs/TextDialog',
    'bootstrap.tooltip'
],
function(_,
         BaseView,
         BaseModel,
         $,
         module,
         SyntheticSelectControl,
         Popdown,
         ReportDetailsView,
         RolesCollection,
         ApplicationModel,
         TitleDialogModal,
         QueryDialogModal,
         ReportDialog,
         CreateReportDialog,
         route,
         console,
         splunkUtils,
         TextDialog,
         _bootstrapTooltip
    ){

    var PanelControls = BaseView.extend({
        moduleId: module.id,
        initialize: function(options){
            BaseView.prototype.initialize.apply(this, arguments);

            this.model.report.on('change:id', this.updateReportView, this);
            this.model.report.entry.content.on('change', this.updateReportView, this);

            this.collection = this.collection || {};
            this.collection.roles = new RolesCollection({});
            this.collection.roles.fetch();
        },
        onChangeElementTitle: function(e) {
            e.preventDefault();
            this.model.report.trigger('editTitle');
            this.children.popdown.hide();
        },
        onChangeSearchString: function(e) {
            e.preventDefault();
            if ($(e.currentTarget).is('.disabled')) {
                return;
            }
            this.children.queryDialogModal = new QueryDialogModal({
                model:  {
                    report: this.model.report,
                    appLocal: this.model.appLocal,
                    application: this.model.application,
                    user: this.model.user,
                    dashboard: this.model.dashboard,
                    state: this.model.state
                },
                onHiddenRemove: true
            });

            $("body").append(this.children.queryDialogModal.render().el);
            this.children.queryDialogModal.show();
            this.children.popdown.hide();
        },
        updateReportView: function(){
            this.debouncedRender();
        },
        render: function(){
            var panelClass,
                templateArgs = {};

            if (this.model.report.get('id')){
                panelClass = this.model.report.isPivotReport() ? "icon-report-pivot" : "icon-report-search";
            }
            else {
                panelClass = this.model.report.isPivotReport() ? "icon-pivot" : "icon-search-thin";
            }
            templateArgs['panelClass'] = panelClass;

            this.$el.html(this.compiledTemplate(templateArgs));
            this.children.popdown = new Popdown({ el: this.el, mode: 'dialog' });

            this._renderPanelControls();

            return this;
        },
        _renderPanelControls: function(){
            this.$('.dropdown-menu').html(_.template(this._panelControlsTemplate, { _:_ }));
            var panelType;
            if (this.model.report.get('id')){
                panelType = this.model.report.isPivotReport() ? _("PIVOT REPORT").t() : _("SEARCH REPORT").t();
            }
            else {
                panelType = this.model.report.isPivotReport() ? _("INLINE PIVOT").t() : _("INLINE SEARCH").t();
            }

            var panelTypeLI = _.template('<li class="panelType"><%- panelType %></li>', {panelType: panelType});
            if (this.model.report.get('id')){
                var reportList = _.template('<ul class="report_actions"><%= panelTypeLI %>' +
                        '<li><a class="viewPanelReport" href="#"><%- reportName %>' +
                        '<span class="icon-triangle-right-small"></span></a></li></ul>',
                        {panelTypeLI: panelTypeLI, reportName: this.model.report.entry.get('name')});

                this.$('.panel_actions').before(reportList);
                this.$('.panel_actions').prepend('<li><a href="#" class="changeElementTitle">'+_("Edit Title").t()+'</a></li>');
            }
            else {
                var convertToReportItem = $('<li><a class="convertToReport" href="#">' + _("Convert to Report").t() + '</a></li>');
                var editSearchItem = $('<li><a href="#" class="changeSearchString">' + _("Edit Search String").t() + '</a></li>');
                if (this.model.report.entry.content.get('display.general.search.type') === 'global') {
                    convertToReportItem.find('a').addClass('disabled').tooltip({
                        animation: false,
                        title: _("Cannot convert global search to report.").t()
                    });
                    editSearchItem.find('a').addClass('disabled').tooltip({
                        animation: false,
                        title: _("Cannot edit global search.").t()
                    });
                }
                this.$('.panel_actions').prepend(convertToReportItem);
                this.$('.panel_actions').prepend(editSearchItem);
                this.$('.panel_actions').prepend('<li><a href="#" class="changeElementTitle">'+_("Edit Title").t()+'</a></li>');
                this.$('.panel_actions').prepend(panelTypeLI);
            }
        },
        _panelControlsTemplate: '\
                <div class="arrow"></div>\
                <ul class="panel_actions">\
                    <li><a class="deletePanel" href="#"><%- _("Delete").t() %></a></li>\
                </ul>\
        ',
        template: '\
            <a class="dropdown-toggle btn-pill" href="#">\
                    <span class="<%- panelClass %>"></span><span class="caret"></span>\
            </a>\
            <div class="dropdown-menu">\
            </div>\
        ',
        onDelete: function(e){
            e.preventDefault();

            this.children.dialog = new TextDialog({
                id: "modal_delete", 
                "flashModel": this.model.dashboard
            });

            this.model.report.on('successfulDelete', this.children.dialog.closeDialog, this.children.dialog);  
            this.children.dialog.settings.set("primaryButtonLabel",_("Delete").t());
            this.children.dialog.settings.set("cancelButtonLabel",_("Cancel").t());
            this.children.dialog.on('click:primaryButton', this._dialogDeleteHandler, this);
            this.children.dialog.settings.set("titleLabel",_("Delete").t());
            this.children.dialog.setText(splunkUtils.sprintf(
                _("Are you sure you want to delete %s?").t(), '<em>' + _.escape(this.model.report.entry.content.get('display.general.title')) + '</em>'));
            $("body").append(this.children.dialog.render().el);
            this.children.dialog.show();
            this.children.popdown.hide();
        },
        
        _dialogDeleteHandler: function(e) {
            e.preventDefault(); 
            this.model.report.trigger('deleteReport'); 
            console.log('deleteReport event triggered');
        },
        onViewPanelReport: function(e){
            e.preventDefault();
            e.stopPropagation();
            var template = '', viewReportLink, editReportLink,
                root = this.model.application.get('root'),
                locale = this.model.application.get('locale'),
                app = this.model.application.get('app');
            viewReportLink = route.report(root, locale, app, {data: {s: this.model.report.get('id')}});
            if (this.model.report.isPivotReport()){
                template = this.pivotReportDetailsTemplate;
                editReportLink = route.pivot(root, locale, app, {data: {s: this.model.report.get('id')}});
            } else {
                template = this.searchReportDetailsTemplate;
                editReportLink = route.search(root, locale, app, {data: {s: this.model.report.get('id')}});
            }
            this.$('.dropdown-menu').html(_.template(template, { viewReportLink: viewReportLink, editReportLink: editReportLink, _:_ }));

            if(this.children.reportDetails) {
                this.children.reportDetails.remove();
            }

            this.children.reportDetails = new ReportDetailsView({
                model: {
                    report: this.model.report,
                    application: this.model.application,
                    appLocal: this.model.appLocal,
                    user: this.model.user,
                    serverInfo: this.model.serverInfo
                },
                collection: {
                    roles: this.collection.roles
                }
            });

            this.$('.reportDetails').prepend($("<li/>").addClass('reportDetailsView').append(this.children.reportDetails.render().el));
            var desc = this.model.report.entry.content.get('description');
            if(desc) {
                this.$('.reportDetails').prepend($("<li/>").addClass('report-description').text(desc));
            }
            this.$('.reportDetails').prepend($("<li/>").addClass('report-name').text(this.model.report.entry.get('name')));
            this.$('.dropdown-menu').addClass('show-details');
            $(window).trigger('resize');
        },
        searchReportDetailsTemplate: '\
            <div class="arrow"></div>\
            <a class="dialogBack btn" href="#"><span class="icon-chevron-left"/> <%- _("Back").t() %></a>\
            <ul class="reportDetails">\
                <li><a href="<%- viewReportLink %>" class="viewSearchReport"><%- _("View").t() %></a></li>\
                <li><a href="<%- editReportLink %>" class="openSearchReport"><%- _("Open in Search").t() %></a></li>\
                <li><a href="#" class="cloneSearchReport"><%- _("Clone to an Inline Search").t() %></a></li>\
            </ul>\
            <ul class="reportActions">\
                <li><a href="#" class="selectNewReport"><%- _("Select New Report").t() %></a></li>\
                <li><a href="#" class="useReportFormatting"><%- _("Use Report\'s Formatting for this Content").t() %></a></li>\
            </ul>\
        ',
        pivotReportDetailsTemplate: '\
            <div class="arrow"></div>\
            <a class="dialogBack btn" href="#"><span class="icon-chevron-left"/> <%- _("Back").t() %></a>\
            <ul class="reportDetails">\
                <li><a href="<%- viewReportLink %>" class="viewPivotReport"><%- _("View").t() %></a></li>\
                <li><a href="<%- editReportLink %>" class="openPivotReport"><%- _("Open in Pivot").t() %></a></li>\
                <li><a href="#" class="clonePivotReport"><%- _("Clone to an Inline Pivot").t() %></a></li>\
            </ul>\
            <ul class="reportActions">\
                <li><a class="selectNewReport"><%- _("Select New Report").t() %></a></li>\
                <li><a class="useReportFormatting"><%- _("Use Report\'s Formatting for this Content").t() %></a></li>\
            </ul>\
        ',
        onDialogBack: function(e){
            e.preventDefault();
            e.stopPropagation();
            this._renderPanelControls();
            this.$('.dropdown-menu').removeClass('show-details');
            $(window).trigger('resize');
        },
        tbd: function(e){
            e.preventDefault();
            alert("Coming soon to a Splunk near you!");
        },
        convertToInlineSearch: function(e){
            e.preventDefault();
            this.children.dialog = new TextDialog({
                id: "modal_inline",
                "flashModel": this.model.dashboard
            });
            this.children.dialog.settings.set("primaryButtonLabel",_("Clone to Inline Search").t());
            this.children.dialog.settings.set("cancelButtonLabel",_("Cancel").t());
            this.children.dialog.on('click:primaryButton', this._convertToInlineSearch, this);
            this.model.report.on('successfulManagerChange', this.children.dialog.closeDialog, this.children.dialog);  
            this.children.dialog.settings.set("titleLabel", _("Clone to Inline Search").t());
            this.children.dialog.setText('<div>\
                <p>'+_("The report will be cloned to an inline search.").t()+'</p>\
                <p>'+_("The inline search:").t()+'\
                </p><ul>\
                <li>'+_("Cannot be scheduled.").t()+'</li>\
                <li>'+_("Will run every time the dashboard is loaded.").t()+'</li>\
                <li>'+_("Will use the permissions of the dashboard.").t()+'</li>\
                </ul>\
                </div>');
            $("body").append(this.children.dialog.render().el);
            this.children.dialog.show();
            this.children.popdown.hide();
        },
        convertToInlinePivot: function(e){
            e.preventDefault();
            this.children.dialog = new TextDialog ({
                id: "modal_inline",
                "flashModel": this.model.dashboard
            });
            this.children.dialog.settings.set("primaryButtonLabel",_("Clone to Inline Pivot").t());
            this.children.dialog.settings.set("cancelButtonLabel",_("Cancel").t());
            this.children.dialog.on('click:primaryButton', this._convertToInlineSearch, this);
            this.model.report.on('successfulManagerChange', this.children.dialog.closeDialog, this.children.dialog);
            this.children.dialog.settings.set("titleLabel", _("Clone to Inline Pivot").t());
            this.children.dialog.setText('<div>\
                <p>'+_("The report will be cloned to an inline pivot.").t()+'</p>\
                <p>'+_("The inline pivot:").t()+'\
                </p><ul>\
                <li>'+_("Cannot be scheduled.").t()+'</li>\
                <li>'+_("Will run every time the dashboard is loaded.").t()+'</li>\
                <li>'+_("Will use the permissions of the dashboard.").t()+'</li>\
                </ul>\
                </div>');
            $("body").append(this.children.dialog.render().el);
            this.children.dialog.show();
            this.children.popdown.hide();
            
        },
        _convertToInlineSearch: function(e){
            e.preventDefault();
            this.model.report.trigger("makeInline");
            console.log("makeInline event triggered"); 
        },
        useReportFormatting: function(e){
            e.preventDefault();

            this.children.dialog = new TextDialog({
                id: "modal_use_report_formatting", 
                "flashModel": this.model.dashboard
            });

            this.children.dialog.settings.set("primaryButtonLabel",_("Use Report's Formatting").t());
            this.children.dialog.settings.set("cancelButtonLabel",_("Cancel").t());
            this.children.dialog.on('click:primaryButton', this._useReportFormatting, this);
            this.model.report.on('successfulReportFormatting', this.children.dialog.closeDialog, this.children.dialog);  
            this.children.dialog.settings.set("titleLabel",_("Use Report's Formatting").t());
            this.children.dialog.setText(_("This will change the content's formatting to the report's formatting. Are you sure you want use the report's formatting?").t());
            $("body").append(this.children.dialog.render().el);
            this.children.dialog.show();
            this.children.popdown.hide();
        },
        _useReportFormatting: function(e){
            e.preventDefault(); 
            this.model.report.trigger("useReportFormatting");
            console.log('useReportFormatting event triggered');
        },
        selectNewReport: function(e) {
            e.preventDefault();
            this.children.newReportDialog = new ReportDialog({
                model:  {
                    report: this.model.report, 
                    dashboard: this.model.dashboard, 
                    application: this.model.application
                },
                controller: this.options.controller, 
                onHiddenRemove: true
            });

            $("body").append(this.children.newReportDialog.render().el);
            this.children.newReportDialog.show();
            this.children.popdown.hide();
        },
        convertToReport: function(e){
            e.preventDefault();
            if ($(e.currentTarget).is('.disabled')) {
                return;
            }
            this.children.createReportDialog = new CreateReportDialog({
                model:  {
                    report: this.model.report, 
                    dashboard: this.model.dashboard
                },
                onHiddenRemove: true
            });

            $("body").append(this.children.createReportDialog.render().el);
            this.children.createReportDialog.show();
            this.children.popdown.hide();
        },
        events: {
            'click a.deletePanel': 'onDelete',
            'click a.viewPanelReport': 'onViewPanelReport',
            'click a.changeElementTitle': "onChangeElementTitle",
            'click a.changeSearchString': "onChangeSearchString",
            'click a.dialogBack': "onDialogBack",
            'click a.cloneSearchReport': "convertToInlineSearch",
            'click a.clonePivotReport': "convertToInlinePivot",
            'click a.selectNewReport': "selectNewReport",
            'click a.convertToReport': "convertToReport",
            'click a.useReportFormatting': "useReportFormatting",
            'click a': function(e){
                // SPL-66074 - Catch all: open regular links in a new window
                var link = $(e.currentTarget).attr('href');
                if(link && link[link.length-1] !== '#') {
                    e.preventDefault();
                    window.open(link);
                }
            }, 
            'click li.reportDetailsView a': function(e){
                this.children.popdown.hide(); 
            }
        }

    });
    return PanelControls;
});
