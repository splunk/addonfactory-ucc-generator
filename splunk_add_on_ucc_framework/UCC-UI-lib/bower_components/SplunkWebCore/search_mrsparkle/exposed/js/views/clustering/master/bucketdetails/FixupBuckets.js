/**
 * Created by ykou on 5/15/14.
 */
define([
    'jquery',
    'underscore',
    'module',
    'backbone',
    'models/classicurl',
    'views/Base',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/SyntheticRadioControl',
    'views/shared/CollectionPaginator',
    'views/shared/TableHead',
    'views/clustering/master/bucketdetails/components/TableRow',
    'mixins/ViewPane',
    'contrib/text!views/clustering/master/bucketdetails/FixupBuckets.html',
    './FixupBuckets.pcss',
    'util/time',
    'splunk.i18n'
],
    function(
        $,
        _,
        module,
        Backbone,
        classicurl,
        BaseView,
        ControlGroup,
        SyntheticRadioControl,
        Paginator,
        TableHead,
        TableRow,
        ViewPaneMixin,
        Template,
        css,
        time_utils,
        i18n
        ){
        var FIXUP_COLLECTIONS = {
            'search_factor':        'fixupSearchFactorCollection',
            'replication_factor':   'fixupReplicationFactorCollection',
            'generation':           'fixupGenerationCollection'
        };
        var FixupView = BaseView.extend({
            /**
             * this.collection:
             *      {
             *          fixupSearchFactorCollection
             *          fixupReplicationFactorCollection
             *          fixupGenerationCollection
             *      }
             *
             * we have to switch among these three collections, every time use clicks on the level button, we need to
             * switch to the right collection, re-render thead, tbody, and paginator.
             */
            moduleId: module.id,
            template: Template,
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.viewPaneInitialize(options);

                this.$el.html(this.compiledTemplate());
                if (!this.$thead) {
                    this.$table = this.$el.find('table');
                }
                if (!this.$tbody) {
                    this.$tbody = this.$el.find('tbody');
                }

                // use this model to control which level of buckets shows
                this.fixupLevelsModel = new Backbone.Model({
                    'level': 'search_factor'
                });
                $.when(this.options.classicurlDfd).done(function() {
                    // update fixupLevelsModel from classicurl
                    var level = classicurl.get('level');
                    if (level) {
                        this.fixupLevelsModel.set('level', level);
                    }
                }.bind(this));

                this.children.fixupLevels = new SyntheticRadioControl({
                    model: this.fixupLevelsModel,
                    modelAttribute: 'level',
                    items: [
                        {label: _('Search Factor (0)').t(), value: 'search_factor'},
                        {label: _('Replication Factor (0)').t(), value: 'replication_factor'},
                        {label: _('Generation (0)').t(), value: 'generation'}
                    ]
                });

                this.children.fixupTime = new ControlGroup({
                    controlType: 'SyntheticSelect',
                    className: 'fixup-time control-group',
                    controlOptions: {
                        modelAttribute: 'filter',
                        model: this.fixupLevelsModel,
                        items: [
                            { label: _('Unconstrained').t(), value: 'minutes_in_fixup>0' },
                            { label: _('1 hour').t(), value: 'minutes_in_fixup>60' },
                            { label: _('4 hours').t(), value: 'minutes_in_fixup>240' },
                            { label: _('24 hours').t(), value: 'minutes_in_fixup>1440' },
                            { label: _('7 days').t(), value: 'minutes_in_fixup>10080' }
                        ],
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    },
                    controlClass: 'controls-block btn'
                });

                this.children.fixupLevels.render().$el.appendTo(this.$el.find('.fixup-level-select'));
                this.children.fixupTime.render().$el.appendTo(this.$el.find('.fixup-time-select'));

                this.listenTo(this.collection.fixupSearchFactorCollection, 'change reset', this.render);
                this.listenTo(this.collection.fixupReplicationFactorCollection, 'change reset', this.render);
                this.listenTo(this.collection.fixupGenerationCollection, 'change reset', this.render);

                this.listenTo(this.fixupLevelsModel, 'change', function() {
                    this.collection.fixupSearchFactorCollection.fetchData.set('filter', this.fixupLevelsModel.get('filter'));
                    this.collection.fixupReplicationFactorCollection.fetchData.set('filter', this.fixupLevelsModel.get('filter'));
                    this.collection.fixupGenerationCollection.fetchData.set('filter', this.fixupLevelsModel.get('filter'));
                    this.updateClassicUrlFromParams();
                    this.render();
                });
            },

            _renderThead: function(collection) {
                this.$table.find('thead').remove();

                this.children.thead = new TableHead({
                    model: collection.fetchData,
                    columns: [
                        { label: _('Bucket Name').t(), className: 'col-name'},
                        { label: _('Action').t(), className: 'col-action'},
                        { label: _('Index').t(), className: 'col-index'},
                        { label: _('Fixup Reason').t(), className: 'col-initial-reason'},
                        { label: _('Time in Fixup').t(), className: 'col-initial-timestamp'},
                        { label: _('Current Status').t(), className: 'col-latest-reason'}
                    ]
                });
                this.children.thead.render().$el.prependTo(this.$table);
            },

            _renderTbody: function(collection) {
                /**
                 * levelNames {type: array}:
                 * 'generation'
                 * 'replication_factor'
                 * 'search_factor'
                 */
                this.$tbody.empty();
                var attributes = this._reduceAttributes(collection); // attributes is an array of row-data
                if (attributes) {
                    attributes.forEach(function(rowData, index) {  // each row of a level
                        var row = new TableRow({
                            rowData: rowData,
                            model: collection.at(index)
                        });
                        row.render().$el.appendTo(this.$tbody);
                    }, this);
                }
            },

            _reduceAttributes: function(collection) {
                /**
                 * This function format attributes of a model so that it fits into one row
                 * return: an array, each array element contains data for a row
                 */
                var allRowsData = [];
                collection.forEach(function(model) {
                    var rowData = [];
                    rowData.push(model.entry.get('name'));  // bucket name
                    rowData.push('<a class="action-menu">' + _('Action').t() + '<span class="caret"></span></a>');
                    rowData.push(model.entry.content.get('index') || '');
                    rowData.push(model.entry.content.get('initial')['reason']);
                    rowData.push(this._formatTime(model.entry.content.get('initial')['timestamp']));
                    rowData.push(model.entry.content.get('latest')['reason']);
                    allRowsData.push(rowData);
                }, this);
                return allRowsData;
            },

            _formatTime: function(time) {
                var timeStringArray = [];
                var secondsDiff = (new Date() / 1000) - time;
                var minutesDiff = Math.floor(secondsDiff / 60) % 60;
                var hoursDiff = Math.floor(secondsDiff /  (60 * 60)) % 24;
                var daysDiff = Math.floor(secondsDiff / (60 * 60 * 24));

                if (daysDiff > 0) {
                    timeStringArray.push(daysDiff, _('day(s)').t());
                }
                if (hoursDiff > 0) {
                    timeStringArray.push(hoursDiff, _('hour(s)').t());
                }
                if (minutesDiff > 0 || (daysDiff === 0 && hoursDiff === 0)) {
                    timeStringArray.push(minutesDiff, _('minute(s)').t());
                }

                if (secondsDiff >= 0) {
                    return timeStringArray.join(' ');
                } else {
                    return _('Invalid timestamp.').t();
                }
            },

            updateClassicUrlFromParams: function() {
                _.debounce(function() {
                    classicurl.save(this.fixupLevelsModel.attributes);
                }.bind(this), 0)();
            },

            getFixupCounts: function() {
                var fixupSearchFactorCount = this.collection.fixupSearchFactorCollection.length > 0 ? this.collection.fixupSearchFactorCollection.models[0].paging.get('total') : 0;
                var fixupReplicationFactorCount = this.collection.fixupReplicationFactorCollection.length > 0 ? this.collection.fixupReplicationFactorCollection.models[0].paging.get('total') : 0;
                var fixupGenerationCount = this.collection.fixupGenerationCollection.length > 0 ? this.collection.fixupGenerationCollection.models[0].paging.get('total') : 0;

                return {
                    'searchFactor': fixupSearchFactorCount,
                    'replicationFactor': fixupReplicationFactorCount,
                    'generation': fixupGenerationCount,
                    'total': fixupSearchFactorCount + fixupReplicationFactorCount + fixupGenerationCount
                };
            },

            updateTabCount: function($el) {
                // update count number in fixup tab text
                var $fixupTab = $el ? $el.find('.fixup-buckets-tab') : $('.fixup-buckets-tab');
                var htmlText = $fixupTab.html();

                var fixupCounts = this.getFixupCounts();

                if (htmlText) {
                    htmlText = htmlText.replace(/\(\d+\)/, '(' + fixupCounts['total'] + ')');
                    $fixupTab.html(htmlText);
                }

                // update count of each tab
                var $replicationFactorTab = this.$el.find("button[data-value='replication_factor']");
                var $searchFactorTab = this.$el.find("button[data-value='search_factor']");
                var $generationTab = this.$el.find("button[data-value='generation']");

                var replicationFactorHtml = $replicationFactorTab.html();
                var searchFactorHtml = $searchFactorTab.html();
                var generationHtml = $generationTab.html();

                replicationFactorHtml = replicationFactorHtml.replace(/\(\d+\)/, '(' + fixupCounts['replicationFactor'] + ')');
                searchFactorHtml = searchFactorHtml.replace(/\(\d+\)/, '(' + fixupCounts['searchFactor'] + ')');
                generationHtml = generationHtml.replace(/\(\d+\)/, '(' + fixupCounts['generation'] + ')');

                $replicationFactorTab.html(replicationFactorHtml);
                $searchFactorTab.html(searchFactorHtml);
                $generationTab.html(generationHtml);
            },

            _renderPaginator: function(collection) {
                var $controlSection = this.$el.find('.control-section');
                $controlSection.empty();
                this.children.paginator = new Paginator({
                    collection: collection
                });
                this.children.paginator.render().$el.appendTo($controlSection);
            },

            render: function() {
                var collectionToRender = this.collection[FIXUP_COLLECTIONS[this.fixupLevelsModel.get('level')]];

                this._renderThead(collectionToRender);
                this._renderTbody(collectionToRender);
                this._renderPaginator(collectionToRender);

                this.updateTabCount();

                return this;
            }
        });
        _.extend(FixupView.prototype, ViewPaneMixin);

        return FixupView;
    });
