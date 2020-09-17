define(
    [
        'module',
        'jquery',
        'underscore',
        'models/Base',
        'collections/Base',
        'views/Base',
        'views/shared/TableHead',
        'views/shared/fieldpicker/table/TableRow',
        'views/shared/fieldpicker/table/MoreInfo',
        'views/shared/delegates/TableHeadStatic',
        'views/shared/delegates/StopScrollPropagation',
        'util/general_utils',
        'util/console',
        'splunk.util',
        'splunk.i18n'
    ],
    function(
        module,
        $,
        _,
        BaseModel,
        BaseCollection,
        Base,
        TableHead,
        TableRow,
        MoreInfo,
        TableHeadStatic,
        StopScrollPropagation,
        general_utils,
        console,
        splunkUtils,
        i18n
    ){
        return Base.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model:
             *         summary: <model.services.search.job.SummaryV2>,
             *         searchJob: <models.Job>,
             *         report: <models.services.SavedSearch>,
             *         application: <models.Application>
             *     },
             *     collections: {
             *         selectedFields: <collections.SelectedFields>,
             *     },
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                
                this.children.head = new TableHead({
                    model: this.model.state,
                    columns: [
                        {
                            html: '<i class="icon-info"></i>',
                            className: 'col-info'
                        },
                        {
                            html: '<i class="icon-check"></i>',
                            sortKey: 'selected',
                            className: 'col-select'
                        },
                        {
                            label: _("Field").t(),
                            sortKey: "field",
                            className: 'col-fields'

                        },
                        {
                            label: _("# of Values").t(),
                            sortKey: "value",
                            className: 'col-values'
                        },
                        {
                            label: _("Event Coverage").t(),
                            sortKey: "coverage",
                            className: 'col-coverage'
                        },
                        {
                            label: _("Type").t(),
                            sortKey: "type",
                            className: 'col-type'
                        }
                    ]
                });

                this.children.rows = this.rowsFromResult();

                this.children.tableHeadStatic = new TableHeadStatic({
                    el: this.el,
                    flexWidthColumn: 0,
                    offset: 42,
                    defaultLayout: 'auto'
                });
                
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.state, 'table-dock-update', function() {
                    this.children.tableHeadStatic.update();
                });
                this.listenTo(this.model.summary.fields, 'reset', this.createRows);
                this.listenTo(this.model.state, 'change:sortDirection change:sortKey', _.debounce(this.createRows, 0));
                this.listenTo(this.collection.selectedFields, 'reset', this.createRows);
                this.listenTo(this.collection.selectedFields, 'add remove', this.checkUncheck);
                this.listenTo(this.model.state, 'bulkSelect', this.select);
            },
            select: function(options) {
                var fields = [];
                options = options || {};
                if (options.select) {
                    fields = general_utils.unionWithKey(
                        this.collection.selectedFields.pluck('name'),
                        this.model.summary.fields.pluck('name'),
                        'name'
                    );
                }
                this.collection.selectedFields.reset(fields);
            },
            checkUncheck: function(model) {
                if (this.model.state.get('sortKey') !== 'selected') {
                    return;
                }

                var $row = this.$('tr[data-value="' + model.get('name') + '"]'),
                    $moreInfo =  $row.next(),
                    $rowPair =  $row.add($moreInfo).addClass('hide-contents'),
                    $tbody =  $row.parent(),
                    clonedFields = this.createAndSortClonedFields(),
                    clonedModel = clonedFields.findWhere({name: model.get('name')}),
                    scrollTop = this.$('> .scroll-table-wrapper').scrollTop(),
                    startYPos = $row.position().top + scrollTop,
                    endYPos = 0,
                    newIndex = clonedFields.indexOf(clonedModel);
                
                $rowPair.detach();
                if (newIndex > 0) {
                    $row.insertAfter($tbody.children('.shared-fieldpicker-table-tablerow').eq(newIndex -1).next());
                } else {
                    $row.prependTo($tbody);
                }
                $moreInfo.insertAfter($row);
                endYPos = $row.position().top + scrollTop;
                
                this.resetRowStriping();
                this.animateReorder($rowPair, startYPos, endYPos);
            },
            resetRowStriping: function(model) {
                this.$('.shared-fieldpicker-table-tablerow').each(function(index, element) {
                   var $row = $(element),
                       removeClass = index % 2 ? 'even' : 'odd',
                       addClass = index % 2 ? 'odd' : 'even';
                       
                   $row.add($row.next()).addClass(addClass).removeClass(removeClass);
               });
            },
            animateReorder: function($row, startPos, endPos) {
                if (startPos === endPos) {
                   $row.removeClass('hide-contents');
                   return;
               }
               
               var $animateTableTemplate = this.$('.table-field-moving').first(),
                   $animateTable = $animateTableTemplate.clone().insertAfter($animateTableTemplate),
                   duration = Math.min(Math.max(Math.abs(startPos - endPos), 200), 800),
                   removeAnimateTable = function() {
                           $animateTable.remove();
                           $row.removeClass('hide-contents');
                       };
                       
               $animateTable.find('tbody').append($row.clone().removeClass('hide-contents'));
               $animateTable.show().css('top', startPos).delay('100').animate({top: endPos}, duration).delay('100').queue(removeAnimateTable);
            },
            rowsFromResult: function() {
                var clonedFields = this.createAndSortClonedFields(),
                    expandedField;

                _(this.model.state.toJSON()).each(function(value, key) {
                   if(/rowExpanded/.test(key)) {
                        expandedField = value;
                        this.model.state.unset(key);
                    }
                },this);
                
                return _.flatten(
                    clonedFields.map(function(model, i) {
                        return [
                            new TableRow({
                                model: {
                                    field: model,
                                    report: this.model.report,
                                    state: this.model.state,
                                    searchJob: this.model.searchJob,
                                    summary: this.model.summary
                                },
                                collection: {
                                    selectedFields: this.collection.selectedFields
                                },
                                expandedField: expandedField || void(0),
                                index: i
                            }),
                            new MoreInfo({
                                model: {
                                    field: model,
                                    report: this.model.report,
                                    state: this.model.state,
                                    searchJob: this.model.searchJob,
                                    summary: this.model.summary,
                                    application: this.model.application
                                },
                                expandedField: expandedField || void(0),
                                index: i
                            })
                        ];
                    }, this)
                );
            },
            createAndSortClonedFields: function() {
                if(!this.model.state.get('sortKey')){
                    this.model.state.set({
                        'sortKey': 'selected',
                        'sortDirection': 'desc'
                    });
                }
                var sortIsAsc = (this.model.state.get('sortDirection') === 'asc'),
                    clonedFields = this.model.summary.fields.clone(),
                    model = this.model.summary,
                    that = this;

                switch (this.model.state.get('sortKey')) {
                    case 'selected':
                        var fl = clonedFields.length,
                            selectedFieldNames = this.collection.selectedFields.pluck('name'),
                            selectedFields = new BaseCollection(_(clonedFields.models).filter(function(model) {
                                return _.indexOf(selectedFieldNames, model.get('name'))>-1;
                            },this));

                        clonedFields = new BaseCollection(_.difference(clonedFields.models, selectedFields.models));

                        clonedFields.comparator = function(model) {
                            return model.get('name');
                        };
                        selectedFields.comparator = function(model) {
                            return model.get('name');
                        };
                        selectedFields.sort();
                        clonedFields.sort();
                        clonedFields.add(selectedFields.models, {at: (sortIsAsc) ? fl : 0, silent: true});
                        break;
                    case 'field':
                        clonedFields.comparator = function(modelA, modelB) {
                            return general_utils.compareWithDirection(modelA.get('name').toLowerCase(), modelB.get('name').toLowerCase(), sortIsAsc);
                        };
                        clonedFields.sort();
                        break;
                    case 'value':
                        clonedFields.comparator = function(modelA, modelB) {
                            var valueA = modelA.get('distinct_count'),
                                valueB = modelB.get('distinct_count');

                            if (valueA != valueB) {
                                return general_utils.compareWithDirection(valueA, valueB, sortIsAsc);
                            } else {
                                return general_utils.compareWithDirection(modelA.get('name'), modelB.get('name'), 'asc');
                            }
                        };
                        clonedFields.sort();
                        break;
                    case 'coverage':
                        clonedFields.comparator = function(modelA, modelB) {
                            var valueA = model.frequency(modelA.get('name')),
                                valueB = model.frequency(modelB.get('name'));

                            if (valueA != valueB) {
                                return general_utils.compareWithDirection(valueA, valueB, sortIsAsc);
                            } else {
                                return general_utils.compareWithDirection(modelA.get('name').toLowerCase(), modelB.get('name').toLowerCase(), 'asc');
                            }
                        };
                        clonedFields.sort();
                        break;
                    case 'type':
                        clonedFields.comparator = function(modelA, modelB) {
                            var valueA = (modelA.isNumeric() ? 0 : 1),
                                valueB = (modelB.isNumeric() ? 0 : 1);

                            if (valueA != valueB) {
                                return general_utils.compareWithDirection(valueA, valueB, sortIsAsc);
                            } else {
                                return general_utils.compareWithDirection(modelA.get('name').toLowerCase(), modelB.get('name').toLowerCase(), 'asc');
                            }
                        };
                        clonedFields.sort();
                        break;
                    default:
                        break;
                }
                
                return clonedFields;
            },
            renderRows: function() {
                var len = this.children.rows.length,
                    summary = this.model.summary;

                if (len === 0 && summary.has('omitted') && (summary.get('omitted') > 0)) {
                    var coverageValue = parseFloat(this.model.report.entry.content.get('display.prefs.fieldCoverage'),10),
                        message = '';
                    if (coverageValue < 1) {
                        message = splunkUtils.sprintf(_('No fields were found with coverage of %s or more').t(), i18n.format_percent(coverageValue));
                    } else {
                        message = splunkUtils.sprintf(_('No fields were found with coverage of %s').t(), i18n.format_percent(coverageValue));
                    }   
                    this.$('tr.waiting').show().children().eq(0).text(message);
                    return;
                }
                if (len > 0) {
                    this.$("tr.waiting").hide();
                }
                var fragment = document.createDocumentFragment();
                _(this.children.rows).each(function(row){
                    row.render().appendTo(fragment);
                }, this);
                $(fragment).appendTo(this.$('tbody.fields-list'));
                this.children.tableHeadStatic.update();
            },
            createRows: function() {
                _(this.children.rows).invoke('debouncedRemove', {detach: true});
                this.children.length = 0;
                this.children.rows = this.rowsFromResult();
                this.renderRows();
            },
            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.append(this.compiledTemplate({
                        _: _
                    }));
                    this.children.head.render().prependTo(this.$('.table-fields-list'));
                }
                
                this.children.stopScrollPropagation = new StopScrollPropagation({el: this.$(".scroll-table-wrapper")});
                return this;
            },
            template: '\
                <div class="header-table-static"></div>\
                <div class="scroll-table-wrapper">\
                    <table class="table table-striped table-row-expanding table-fields-list">\
                        <tbody class="fields-list">\
                            <tr class="waiting"><td colspan="6"><%- _("Waiting for results...").t() %></td></tr>\
                        </tbody>\
                    </table>\
                    <table class="table table-striped table-row-expanding table-field-moving" style="display:none; position:absolute; left:0; right:0;">\
                        <tbody class="field-moving">\
                        </tbody>\
                    </table>\
                </div>\
            '
        });
    }
);
