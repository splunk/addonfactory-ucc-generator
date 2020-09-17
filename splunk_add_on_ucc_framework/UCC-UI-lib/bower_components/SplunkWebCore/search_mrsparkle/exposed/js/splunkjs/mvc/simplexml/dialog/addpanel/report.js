define(function(require, exports, module) {
    var _ = require('underscore');
    var Base = require('views/Base');
    var ControlGroup = require('views/shared/controls/ControlGroup');
    var SearchTextareaControl = require('views/dashboard/editor/addcontent/preview/content/SearchTextareaControl');
    var utils = require('../../../utils');
    var timeUtils = require('util/time');
    var Cron = require('models/shared/Cron');
    var splunkUtil = require('splunk.util');
    var route = require('uri/route');
    var Modal = require('views/shared/Modal');

    return Base.extend({
        moduleId: module.id,
        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            this.children.reportPlaceholder = new Base();
            this.controller = this.options.controller;

            if(!this.controller.reportsCollection){
                this.controller.fetchCollection();
            }

            this.controller.reportsCollection.initialFetchDfd.done(_.bind(function() {
                var items = this.controller.reportsCollection.map(function(report){
                    return { label: report.entry.get('name'), value: report.entry.get('name') };
                });
                var pageInfo = utils.getPageInfo();
                var reportsLink = route.reports(
                    pageInfo.root,
                    pageInfo.locale,
                    pageInfo.app
                );

                if(this.controller.reportsCollection.length === this.controller.reportsCollection.REPORTS_LIMIT){
                    this.children.report = new ControlGroup({
                        label: "",
                        controlType: 'SyntheticSelect',
                        controlOptions: {
                            className: 'btn-group add-panel-report',
                            toggleClassName: 'btn',
                            model: this.model.report,
                            modelAttribute: 'savedSearchName',
                            items: items,
                            popdownOptions: this.options.popdownOptions || {
                                attachDialogTo: '.modal:visible',
                                scrollContainer: '.modal:visible .modal-body:visible'
                            }
                        },
                        help: _("This does not contain all reports. Add a report that is not listed from ").t() + splunkUtil.sprintf('<a href=%s>%s</a>.', reportsLink, _('Reports').t())
                    });
                }else{
                    this.children.report = new ControlGroup({
                        label: "",
                        controlType: 'SyntheticSelect',
                        controlOptions: {
                            className: 'btn-group add-panel-report',
                            toggleClassName: 'btn',
                            model: this.model.report,
                            modelAttribute: 'savedSearchName',
                            items: items,
                            popdownOptions: this.options.popdownOptions || {
                                attachDialogTo: '.modal:visible',
                                scrollContainer: '.modal:visible .modal-body:visible'
                            }
                        }
                    });
                }

                if (!this.model.report.get('savedSearchName')) {
                    this.model.report.set('savedSearchName', items[0].value);
                }
            }, this));
            
            this.children.searchField = new SearchTextareaControl({
                model: {
                    content: this.model.report,
                    user: this.model.user,
                    application: this.model.application
                },
                collection: {
                    searchBNFs: this.collection.searchBNFs
                },
                searchAttribute: 'savedSearchString',
                enabled: false
            });

            this.children.timerangeField = new ControlGroup({
                controlType: 'Label',
                controlOptions: {
                    modelAttribute: 'savedSearchTimerange',
                    model: this.model.report
                },
                label: _("Time Range").t()
            });

            this.children.schedule = new ControlGroup({
                controlType: 'Label',
                controlOptions: {
                    modelAttribute: 'savedSearchSchedule',
                    model: this.model.report
                },
                label: _("Schedule").t()
            });

            this.children.permissions = new ControlGroup({
                controlType: 'Label',
                controlOptions: {
                    modelAttribute: 'savedSearchPermissions',
                    model: this.model.report
                },
                label: _("Permissions").t()
            });

            this.model.report.set('savedSearchString', '...');
            this.listenTo(this.model.report, 'change:elementCreateType', this.onModeChange, this);
            this.listenTo(this.model.report, 'change:savedSearchName', this.searchSelected, this);
        },
        events: {
            'click a.run-search': function(e) {
                e.preventDefault();
                var savedSearchName = this.model.report.get('savedSearchName');
                if(!savedSearchName) {
                    return;
                }

                var pageInfo = utils.getPageInfo(), url = route.search(pageInfo.root, pageInfo.locale, pageInfo.app, {
                    data: { s: savedSearchName }
                });
                utils.redirect(url, true);
            }
        },
        searchSelected: function() {
            var savedSearchName = this.model.report.get('savedSearchName');
            var report = this.controller.reportsCollection.find(function(model) {
                return (model.entry.get('name') === savedSearchName);
            });

            if (!report) {
                return;
            }

            this.model.report.set('savedSearch', report.get('id'));
            this.model.report.set('savedSearchString', report.entry.content.get('search'));
            var et = report.entry.content.get('dispatch.earliest_time'),
                    lt = report.entry.content.get('dispatch.latest_time');

            var vizType = 'statistics', sub;
            if(report.entry.content.has('display.general.type')) {
                vizType = report.entry.content.get('display.general.type');
                sub = ['display', vizType, 'type'].join('.');
                if(report.entry.content.has(sub)) {
                    vizType = [vizType, report.entry.content.get(sub)].join(':');
                }
            }
            this.model.report.set('savedSearchVisualization', vizType);
            this.model.report.set('savedSearchTimerange', timeUtils.generateLabel(this.collection.timeRanges, et, null, lt, null));
            var schedule = _("Never").t();
            if(report.entry.content.get('is_scheduled')) {
                var cronModel = Cron.createFromCronString(report.entry.content.get('cron_schedule'));
                schedule = cronModel.getScheduleString();
            }
            this.model.report.set('savedSearchSchedule', schedule);
            this.model.report.set('savedSearchPermissions', splunkUtil.sprintf(_("%s. Owned by %s.").t(),
                    (report.entry.acl.get("perms")) ? _("Shared").t() : _("Not Shared").t(),
                    report.entry.acl.get("owner")));
        },
        onModeChange: function() {
            this.$el[ this.model.report.get('elementCreateType') === 'saved' ? 'show' : 'hide' ]();
            //if reports have not been fetched and there is no loading message yet, then create a loading message
            if(this.model.report.get('elementCreateType') === 'saved' && this.controller.reportsCollection.initialFetchDfd.readyState !== 4 && this.$(Modal.LOADING_SELECTOR).length === 0){
                this.$el.append(Modal.LOADING_HORIZONTAL);
                this.$(Modal.LOADING_SELECTOR).html(_('Loading...').t());
            }
        },
        render: function() {
            this.children.reportPlaceholder.render().appendTo(this.el);
            this.controller.reportsCollection.initialFetchDfd.done(_.bind(function() {
                //reports fetch is done so remove any loading message and render other elements
                if(this.$(Modal.LOADING_SELECTOR).length > 0){
                   this.$(Modal.LOADING_SELECTOR).remove();
                }
                this.children.report.render().appendTo(this.children.reportPlaceholder.el);
                this.searchSelected();
                this.children.searchField.render().appendTo(this.el);
                this.children.searchField.$('textarea').attr('readonly', 'readonly');

                this.children.timerangeField.render().appendTo(this.el);
                this.children.schedule.render().appendTo(this.el);
                this.children.permissions.render().appendTo(this.el);

                this.onModeChange();
            }, this));

            return this;
        }
    });

});
