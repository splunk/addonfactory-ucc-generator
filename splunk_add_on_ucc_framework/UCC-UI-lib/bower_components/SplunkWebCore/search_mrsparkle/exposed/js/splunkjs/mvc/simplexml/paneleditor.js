define(function(require, exports, module) {
    var mvc = require('../mvc');
    var BaseSplunkView = require('../basesplunkview');
    var FormatControls = require('views/shared/vizcontrols/Master');
    var sharedmodels = require('../sharedmodels');
    var PanelControls = require('views/dashboards/panelcontrols/Master');
    var SavedSearchManager = require('../savedsearchmanager');
    var SearchManager = require('../searchmanager');
    var utils = require('splunkjs/mvc/utils');
    var _ = require('underscore');
    var splunkConfig = require('splunk.config');
    var console = require('util/console');
    var controller = require('./controller');
    var TokenAwareModel = require('../tokenawaremodel');
    var DashboardReport = require('models/dashboards/DashboardReport');

    /**
     * Working model for a DashboardReport model
     * Delegates to saveXML() when save() is called
     */
    var WorkingModel = DashboardReport.extend({
        initialize: function(attrs, options) {
            DashboardReport.prototype.initialize.apply(this, arguments);
            this._report = options.report;

            this.entry.content = new TokenAwareModel({}, {
                applyTokensByDefault: true,
                retrieveTokensByDefault: true
            });

            this.setFromSplunkD(this._report.toSplunkD());

            // Make sure the working model stays up-to-date while in edit mode
            this.contentSyncer = utils.syncModels({
                source: this._report.entry.content,
                dest: this.entry.content,
                auto: 'push'
            });
            this.entrySyncer = utils.syncModels({
                source: this._report.entry,
                dest: this.entry,
                auto: 'push'
            });
        },
        save: function(attrs, options) {
            if(attrs) {
                this.set(attrs, options);
            }
            this._report.entry.set(this.entry.toJSON());
            this._report.entry.content.set(this.entry.content.toJSON({ tokens: true }));

            //return deferred that is returned by .save()
            return this._report.saveXML(options); 
        },
        syncOff: function() {
            this.contentSyncer.destroy();
            this.entrySyncer.destroy();
            this.off();
        }
    });

    var EditPanel = BaseSplunkView.extend({
        className: 'panel-editor',
        initialize: function() {
            this.children = this.children || {};
            BaseSplunkView.prototype.initialize.call(this);
            //create the report and state models
            this.model = this.model || {};
            this.model.report = this.model.report || new DashboardReport();
            this.model.working = new WorkingModel({}, { report: this.model.report });
            this.model.application = controller.model.app;
            this.manager = this.options.manager;
            this._instantiateChildren();
            this.bindToComponent(this.manager, this.onManagerChange, this);

            this.listenTo(this.model.report, 'makeInline', this._makePanelInline, this);
            this.listenTo(this.model.report, 'useReportFormatting', this._useReportFormatting, this);
            this.listenTo(this.model.report, 'updateReportID', this._updateReportID, this);
            this.listenTo(this.model.report, 'saveAsReport', this._saveAsReport, this);
            this.listenTo(this.model.report, 'updateSearchString', this._updateSearchManager, this);
            this.listenTo(this.model.report, 'deleteReport', this._deleteReport, this);
            //use this.model.working instead of this.model.report for dialogs that use tokens
            this.listenTo(this.model.working, 'saveTitle', this._saveTitle, this);
            this.listenTo(this.model.working, 'editTitle', this._editTitle, this);

            this.model.user = controller.model.user;
            this.model.appLocal = controller.model.appLocal;
        },
        _instantiateChildren: function() {
            //create the child views
            this.children.vizControl = new FormatControls({
                model: {
                    report: this.model.working,
                    application: this.model.application,
                    user: this.model.user
                },
                vizTypes: ['events', 'statistics', 'visualizations'],
                saveOnApply: true,
                dashboard: true
            });
            
            this.children.panelControl = new PanelControls({
                model: {
                    report: this.model.report,
                    working: this.model.working,
                    application: this.model.application,
                    appLocal: this.model.appLocal,
                    user: this.model.user, 
                    dashboard: controller.model.view,
                    state: controller.getStateModel(),
                    serverInfo: sharedmodels.get('serverInfo')
                }, 
                controller: controller
            });
        },
        remove: function() {
            this.model.working.syncOff();
            this._removeChildren();
            BaseSplunkView.prototype.remove.apply(this, arguments);
        },
        _removeChildren: function() {
            this.children.vizControl.remove();
            this.children.panelControl.remove();
        },
        _updateSearchManager: function(newAttributes) {
            //preserve old state before search info is updated
            var oldState = this.model.report.toSplunkD(); 

            //update search info (note: we are passing newAttributes instead of newState as model.workingReport does not have toSplunkD() method)
            this.model.report.entry.content.set(newAttributes);

            var dfd = this.model.report.saveXML();
            dfd.done(_.bind(function(){
                //notify modal dialog of save success, so that the dialog knows to hide itself
                this.model.report.trigger("successfulSave"); 
                //update search manager with new search info 
                var manager = mvc.Components.get(this.manager);
                if(manager.settings) {
                    manager.settings.set('search', this.model.report.entry.content.get('search', { tokens: true }), { tokens: true, silent: false });
                    manager.settings.set({
                        'earliest_time': this.model.report.entry.content.get('dispatch.earliest_time', { tokens: true }),
                        'latest_time': this.model.report.entry.content.get('dispatch.latest_time', { tokens: true })
                    }, {tokens: true});
                }
            }, this)); 
            dfd.fail(_.bind(function(){
                //restore state and notify listeners to re-render views
                this.model.report.setFromSplunkD(oldState, {silent: false}); 
            }, this));             
        },

        onManagerChange: function() {
            this._removeChildren();
            this._instantiateChildren();
            this.render();

        },
        render: function() {
            this.$el.append(this.children.panelControl.render().el);
            this.$el.append(this.children.vizControl.render().el);
            return this;
        },
        _makePanelInline: function() {
            var oldState = this.model.report.toSplunkD(); 
            var oldName = this.model.report.entry.get('name'); 
            var oldId = this.model.report.get('id'); 

            delete this.model.report.id;
            this.model.report.unset('id', {silent: true});
            this.model.report.entry.unset('name', {silent: true}); //making inline, so remove name for getSearch() in mapper.js

            var dfd = this.model.report.saveXML();
            dfd.fail(_.bind(function(){
                //restore state and notify listeners to re-render views
                this.model.report.setFromSplunkD(oldState, {silent: false}); 
            }, this)); 
            dfd.done(_.bind(function(){
                this.model.report.trigger('successfulManagerChange'); 
                new SearchManager({
                    "id": this.manager,
                    "latest_time": this.model.report.entry.content.get('dispatch.latest_time'),
                    "earliest_time": this.model.report.entry.content.get('dispatch.earliest_time'),
                    "search": this.model.report.entry.content.get('search'),
                    "sample_ratio": this.model.report.entry.content.get('dispatch.sample_ratio'),
                    "app": utils.getCurrentApp(),
                    "auto_cancel": 90,
                    "status_buckets": 0,
                    "preview": true,
                    "timeFormat": "%s.%Q",
                    "wait": 0
                }, { replace: true });

                //trigger change events on 'id' and 'name' 
                this.model.report.set({'id': oldId}, {silent: true}); 
                this.model.report.unset('id', {silent: false});

                this.model.report.entry.set({'name': oldName}, {silent: true}); 
                this.model.report.entry.unset('name', {silent: false}); 
            }, this)); 

        },
        _useReportFormatting: function() {
            //this.model.report.clear({silent: true});

            //preserve copy of report's attributes before fetch on model 
            var oldState = this.model.report.toSplunkD(); 
            var dfd = this.model.report.fetch({}, {silent: true});
            dfd.done(_.bind(function(){
                //get copy of report's attributes after fetch on model
                var newState = this.model.report.toSplunkD();
                var dfd = this.model.report.saveXML({clearOptions: true});                 
                dfd.fail(_.bind(function(){
                    //restore state and notify listeners to re-render views
                    this.model.report.setFromSplunkD(oldState, {silent: false}); 
                }, this)); 
                dfd.done(_.bind(function(){
                    this.model.report.setFromSplunkD(oldState, {silent: true}); //reset to enable listener notification in next line
                    this.model.report.setFromSplunkD(newState, {silent: false}); //notify listeners 
                    this.model.report.trigger("successfulReportFormatting"); 
                }, this)); 

            }, this)); 

        },
        _updateReportID: function(id, title) {
            //preserve copy of report's attributes before ID reset and fetch
            var oldState = this.model.report.toSplunkD(); 
            if(id){
                //set new attributes
                this.model.report.set({'id': id}, {silent: true});
                this.model.report.entry.set({'id': id}, {silent: true});
                this.model.report.id = id;
            }
            if(title){
                this.model.report.entry.content.set({"display.general.title": title});
            }

            var dfd = this.model.report.fetch({}, {silent: true});
            dfd.done(_.bind(function() {
                var dfd = this.model.report.saveXML();
                dfd.fail(_.bind(function(){
                    //restore old state and views 
                    this.model.report.setFromSplunkD(oldState, {silent: false}); 
                }, this)); 
                dfd.done(_.bind(function(){
                    //tell dialog to close itself
                    this.model.report.trigger('successfulManagerChange'); 
                    // tbd: overlay the defaults from the XML
                    
                    //update view to reflect new, successfully-saved attributes 
                    new SavedSearchManager({
                        "id": this.manager, 
                        "searchname": this.model.report.entry.get("name"),
                        "app": utils.getCurrentApp(),
                        "auto_cancel": 90,
                        "status_buckets": 0,
                        "preview": true,
                        "timeFormat": "%s.%Q",
                        "wait": 0
                    }, { replace: true });

                }, this));               
            }, this));
        },
        _saveAsReport: function(name, description) {
            var oldState = this.model.report.toSplunkD();

            //would like to add option {silent: true} to avoid notifying listeners (which updates the view) but adding it causes network 'bad request' response
            this.model.report.entry.content.set({"name": name, "description": description, "display.general.title": name}); 
            this.model.report.entry.set({'name': name}, {silent: true});

            if(this.model.report.entry.content.get('display.general.search.type') === 'postprocess') {
                // Apply base-search + post process as search for new report
                this.model.report.entry.content.set('search', this.model.report.entry.content.get('display.general.search.fullSearch'));
            }

            var dfd = this.model.report.save({}, { data: { app: utils.getCurrentApp(), owner: splunkConfig.USERNAME }});
            dfd.done(_.bind(function() {
                var dfd = this.model.report.saveXML(); 
                dfd.fail(_.bind(function(){
                    this.model.report.destroy(); 
                    this.model.report.unset('id', {silent: true});
                    this.model.report.setFromSplunkD(oldState, {silent: false}); //notify listeners to restore old view 
                }, this)); 
                dfd.done(_.bind(function(){
                    this.model.report.trigger("successfulReportSave");
                    new SavedSearchManager({
                        "id": this.manager,
                        "searchname": name,
                        "app": utils.getCurrentApp(),
                        "auto_cancel": 90,
                        "status_buckets": 0,
                        "preview": true,
                        "timeFormat": "%s.%Q",
                        "wait": 0
                    }, { replace: true });
                }, this));       
            }, this));
        },                             
        _saveTitle: function(newTitle){
            var oldState = this.model.report.toSplunkD(); 
            this.model.working.entry.content.set({'display.general.title': newTitle});
            //use this.model.working instead of this.model.report for dialogs that use tokens
            var dfd = this.model.working.save();
            dfd.fail(_.bind(function(){
                //restore old title as new title could not be saved, and notify listners to restore old views 
                this.model.report.setFromSplunkD(oldState, {silent: false}); 
            }, this)); 
            dfd.done(_.bind(function(){
                //notify modal dialog of save success, so that the dialog knows to hide itself
                this.model.working.trigger("successfulSave"); 
                //notify listeners so they update their views on displayed report model 
                this.model.report.entry.content.set({'display.general.title': ""}, {silent: false});   
                this.model.report.entry.content.set({'display.general.title': newTitle}, {silent: false});   
            }, this)); 
        }, 
        _editTitle: function() {
            this.model.report.trigger('editTitle');
        },
        _deleteReport: function(){
            var dfd = this.model.report.deleteXML(); //returns deferred - removes panel from dashboard view
            dfd.done(_.bind(function(){
                this.model.report.trigger("successfulDelete");  
                this.model.report.trigger("removedPanel"); //removes report's XML
            }, this)); 
        }
    });

    return EditPanel;
});
