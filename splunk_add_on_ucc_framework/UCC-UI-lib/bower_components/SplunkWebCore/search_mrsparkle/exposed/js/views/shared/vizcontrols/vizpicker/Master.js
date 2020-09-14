/*
 * A pop-down dialog for picking a visualization.
 */

define([
            'jquery',
            'underscore',
            'module',
            'models/Base',
            'views/Base',
            'helpers/VisualizationRegistry',
            'uri/route',
            './Dialog',
            './Master.pcss'
        ],
        function(
            $,
            _,
            module,
            BaseModel,
            BaseView,
            VisualizationRegistry,
            route,
            Dialog,
            css
        ) {

    return BaseView.extend({

        /**
         * @param {Object} options {
         *     model: {
         *         report: <models.search.Report>,
         *         application: <models.shared.Application>,
         *         intentionsParser: <models.services.search.IntentionsParser>
         *         user: <models.shared.User>
         *     }
         *     vizTypes (required): [events &| statistics &| visualizations]
         *     saveOnApply: <Boolean> whether to save the report when any changes are submitted
         * }
         */

        moduleId: module.id,

        initialize: function() {
            this.reportModel = this.model.report;
            this.reportContentModel = this.reportModel.entry.content;
            this.intentionsParserModel = this.model.intentionsParser;
            this.applicationModel = this.model.application;
            this.userModel = this.model.user;
            this.vizModel = new BaseModel();
            this.items = this._generateItems();
            this._syncSelectedItemFromConfig();
            BaseView.prototype.initialize.call(this, this.options);
            this.activate();
        },

        events: {
            'click .viz-picker': function(e) {
                e.preventDefault();
                var $target = $(e.currentTarget);

                this.children.picker = new Dialog({
                    model: {
                        viz: this.vizModel,
                        user: this.userModel,
                        application: this.applicationModel
                    },
                    items: this.items,
                    onHiddenRemove: true,
                    warningMsg: this.options.warningMsg,
                    warningLearnMoreLink: this.options.warningLearnMoreLink,
                    defaultThumbnailPath: this._getDefaultThumbnailPath(),
                    saveOnApply: this.options.saveOnApply
                });
                this.children.picker.render().activate().appendTo($('body'));
                this.children.picker.show($target);
                $target.addClass('active');

                this.listenTo(this.children.picker, 'hidden', function() {
                    $target.removeClass('active');
                });
            }
        },

        startListening: function() {
            this.listenTo(this.reportContentModel, 'change', this._syncSelectedItemFromConfig);
            this.listenTo(this.intentionsParserModel, 'change', function() {
                this.items = this._generateItems();
                this.trigger('itemsChange');
            });
            this.listenTo(this.vizModel, 'change:id', function(model, newValue) {
                var reportSettings = VisualizationRegistry.getReportSettingsForId(newValue) || {};
                var reportIsChanging = _(reportSettings).any(function(value, key) {
                    return value !== this.reportContentModel.get(key);
                }, this);
                // Avoid the set and save part if there are no actual changes to the report,
                // this insulates us from calling save() in response to external report change.
                if (!_(reportSettings).isEmpty() && reportIsChanging) {
                    this.reportContentModel.set(reportSettings);
                    if (this.options.saveOnApply) {
                        this.reportModel.save();
                    }
                }
                this.render();
            });
            BaseView.prototype.startListening.apply(this, arguments);
        },

        activate: function() {
            if (this.active) {
                return BaseView.prototype.activate.apply(this, arguments);
            }
            BaseView.prototype.activate.apply(this, arguments);
            this._syncSelectedItemFromConfig();
            return this;
        },

        _syncSelectedItemFromConfig: function() {
            var vizConfig = VisualizationRegistry.findVisualizationForConfig(this.reportContentModel.toJSON());
            this.vizModel.set(vizConfig ? this._getItemById(vizConfig.id) : {});
            this.render();
        },

        getItemCount: function() {
            if (!this.items) {
                return 0;
            }
            return _(this.items).flatten().length;
        },

        _getItemById: function(vizId) {
            var vizItem = _.filter(_(this.items).flatten(), function(viz) {
                return viz.id === vizId;
            });
            return vizItem[0];
        },

        _generateItems: function() {
            var reportingCommand = null,
                reportsSearch = this.intentionsParserModel.get('reportsSearch');

            if(reportsSearch) {
                reportingCommand = reportsSearch.split(/\s{2,}/g)[0];
                if(this.intentionsParserModel.has('commands')) {
                    var commands = _(this.intentionsParserModel.get('commands')).pluck('command');
                    if(_(commands).contains('predict')) {
                        reportingCommand = 'predict';
                    }
                    else if(_(commands).contains('geostats')) {
                        reportingCommand = 'geostats';
                    } else if(_(commands).contains('geom')) {
                        reportingCommand = 'geom';
                    }
                }
            }
            return _(this.options.vizTypes).map(function(vizType) {

                return _(VisualizationRegistry.getAllVisualizations([vizType])).chain()
                    .where({ isSelectable: true })
                    .map(function(vizConfig) {
                        var isRecommended;
                        if (vizConfig.id === 'events') {
                            isRecommended = !reportingCommand;
                        } else {
                            isRecommended = _(vizConfig.recommendFor || []).contains(reportingCommand);
                        }
                        var categories = vizConfig.categories || [];
                        if (isRecommended) {
                            categories.push('recommended');
                        }
                        return ({
                            id: vizConfig.id,
                            label: vizConfig.label,
                            icon: vizConfig.icon,
                            categories: categories,
                            description: vizConfig.description,
                            searchHint: vizConfig.searchHint,
                            thumbnailPath: this._getThumbnailPath(vizConfig)
                        });
                    }, this)
                    .value();
                }, this);
        },

        _getDefaultThumbnailPath: function(){
            return this._getThumbnailPath({ appName: 'system'});
        },

        _getThumbnailPath: function(vizConfig) {
            var appBuildNumber = vizConfig.appBuildNumber || null;
            var appName = vizConfig.appName || 'system';
            var directory = vizConfig.vizName;
            var thumbnailName = vizConfig.preview;

            return route.vizIconFile(
                this.applicationModel.get('root'),
                this.applicationModel.get('locale'),
                appBuildNumber,
                appName,
                thumbnailName,
                directory
            );
        },

        disable: function(){
            this.options.enabled = false;
            this.$('a.popdown-toggle').addClass('disabled');
        },

        enable: function(){
            this.options.enabled = true;
            this.$('a.popdown-toggle').removeClass('disabled');
        },

        tooltip: function(options){
            this.$('a.popdown-toggle').tooltip(options);
        },

        render: function() {
            if (!this.vizModel.get('id')) {
                this.$el.html(_(this.vizNotFoundTemplate).template({}));
                return this;
            }
            this.$el.html(this.compiledTemplate(this.vizModel.toJSON()));

            return this;
        },

        template: '\
            <a class="btn-pill popdown-toggle viz-picker" href="#" data-selected-id="<%- id %>">\
                <i class="icon-<%- icon %>"/>\
                <span class="link-label"><%- label %></span><span class="caret"></span>\
            </a>\
        ',

        vizNotFoundTemplate: '\
            <a class="btn-pill popdown-toggle viz-picker" href="#">\
                <span class="link-label"><%= _("Select...").t() %></span><span class="caret"></span>\
            </a>\
        '
    });

});
