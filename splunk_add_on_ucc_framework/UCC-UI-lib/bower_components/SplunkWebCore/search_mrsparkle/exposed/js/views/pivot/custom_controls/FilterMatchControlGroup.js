/**
 * @author sfishel
 *
 * A custom sub-class of ControlGroup for pivot filter config forms.
 *
 * Can create a drop-down list of comparator options and a either a text box or drop-down list for the compare to value.
 */

define([
            'jquery',
            'underscore',
            'module',
            'views/shared/controls/ControlGroup',
            'views/shared/controls/Control',
            'views/shared/controls/TextControl',
            'views/shared/delegates/Popdown',
            'util/pivot/config_form_utils',
            'splunk.util'
        ],
        function(
            $,
            _,
            module,
            ControlGroup,
            Control,
            TextControl,
            Popdown,
            configFormUtils,
            splunkUtil
        ) {

    var COMPARATOR_ITEMS = {

        string: [
            {
                value: 'is',
                label: configFormUtils.filterRuleToDisplay('is')
            },
            {
                value: 'contains',
                label: configFormUtils.filterRuleToDisplay('contains')
            },
            {
                value: 'isNot',
                label: configFormUtils.filterRuleToDisplay('isNot')
            },
            {
                value: 'doesNotContain',
                label: configFormUtils.filterRuleToDisplay('doesNotContain')
            },
            {
                value: 'startsWith',
                label: configFormUtils.filterRuleToDisplay('startsWith')
            },
            {
                value: 'endsWith',
                label: configFormUtils.filterRuleToDisplay('endsWith')
            },
            {
                value: 'isNull',
                label: configFormUtils.filterRuleToDisplay('isNull')
            },
            {
                value: 'isNotNull',
                label: configFormUtils.filterRuleToDisplay('isNotNull')
            },
            {
                value: 'in',
                label: configFormUtils.filterRuleToDisplay('in')
            }
            // regex is not supported by the back end
//            {
//                value: 'regex',
//                label: configFormUtils.filterRuleToDisplay('regex')
//            }
        ],

        ipv4: [
            {
                value: 'is',
                label: configFormUtils.filterRuleToDisplay('is')
            },
            {
                value: 'contains',
                label: configFormUtils.filterRuleToDisplay('contains')
            },
            {
                value: 'isNot',
                label: configFormUtils.filterRuleToDisplay('isNot')
            },
            {
                value: 'doesNotContain',
                label: configFormUtils.filterRuleToDisplay('doesNotContain')
            },
            {
                value: 'startsWith',
                label: configFormUtils.filterRuleToDisplay('startsWith')
            },
            {
                value: 'isNull',
                label: configFormUtils.filterRuleToDisplay('isNull')
            },
            {
                value: 'isNotNull',
                label: configFormUtils.filterRuleToDisplay('isNotNull')
            },
            {
                value: 'in',
                label: configFormUtils.filterRuleToDisplay('in')
            }
            // regex is not supported by the back end
//            {
//                value: 'regex',
//                label: configFormUtils.filterRuleToDisplay('regex')
//            }
        ],

        number: [
            {
                value: '=',
                label: configFormUtils.filterRuleToDisplay('=')
            },
            {
                value: '!=',
                label: configFormUtils.filterRuleToDisplay('!=')
            },
            {
                value: '<=',
                label: configFormUtils.filterRuleToDisplay('<=')
            },
            {
                value: '<',
                label: configFormUtils.filterRuleToDisplay('<')
            },
            {
                value: '>=',
                label: configFormUtils.filterRuleToDisplay('>=')
            },
            {
                value: '>',
                label: configFormUtils.filterRuleToDisplay('>')
            },
            {
                value: 'isNull',
                label: configFormUtils.filterRuleToDisplay('isNull')
            },
            {
                value: 'isNotNull',
                label: configFormUtils.filterRuleToDisplay('isNotNull')
            }
        ]
    };

    var BOOLEAN_COMPARE_TO_ITEMS = [
        {
            value: 'true',
            label: configFormUtils.filterRuleToDisplay('true')
        },
        {
            value: 'false',
            label: configFormUtils.filterRuleToDisplay('false')
        },
        {
            value: 'isNull',
            label: configFormUtils.filterRuleToDisplay('isNull')
        },
        {
            value: 'isNotNull',
            label: configFormUtils.filterRuleToDisplay('isNotNull')
        }
    ];

    var CompareToTextControl = TextControl.extend({

        initialize: function(options) {
            this.options.append = this.sampleValuesToggleTemplate;
            TextControl.prototype.initialize.call(this, this.options);
            this.children.sampleValues = new Popdown({ el: this.el, detachDialog: true });
            this.children.sampleValues.on('show', this.onSampleValuesMenuShow, this);
            this.children.sampleValues.on('hide', this.onSampleValuesMenuHide, this);
        },

        render: function() {
            TextControl.prototype.render.apply(this, arguments);
            this.$el.append(this.sampleValuesMenuTemplate);
            this.$sampleValuesMenu = this.$('.sample-values-menu');
            return this;
        },

        onSampleValuesMenuShow: function() {
            var dispatchData = {
                app: this.options.application.get('app'),
                owner: this.options.application.get('owner'),
                earliest_time: this.options.report.entry.content.get('dispatch.earliest_time') || 0,
                provenance: 'UI:Pivot'
            };

            if (this.options.report.entry.content.get('dispatch.latest_time')) {
                dispatchData.latest_time = this.options.report.entry.content.get('dispatch.latest_time');
            }

            var sampleValues = this.options.dataTable.getSampleValuesModel(
                this.model.get('fieldName'),
                {
                    data: dispatchData
                }
            );

            if(sampleValues.has('values')) {
                this.renderSampleValues(sampleValues);
            }
            else {
                this.$sampleValuesMenu.find(':not(.arrow)').remove();
                this.$sampleValuesMenu.append(_(this.loadingSampleValuesTemplate).template({}));
                sampleValues.once('change:values', this.renderSampleValues, this);
            }

            var that = this;
            this.$sampleValuesMenu.on('click', '.sample-value', function(e) {
                e.preventDefault();
                var value = $(e.currentTarget).attr('data-value');
                that.setValue(value, true);
            });
        },

        onSampleValuesMenuHide: function() {
            this.$sampleValuesMenu.off();
        },

        renderSampleValues: function(sampleValues) {
            this.$sampleValuesMenu.find(':not(.arrow)').remove();
            this.$sampleValuesMenu.append(
                _(this.sampleValuesContentTemplate).template({ limit: sampleValues.get('limit'), values: sampleValues.get('values') })
            );
        },

        sampleValuesToggleTemplate: '\
            <a href="#" class="add-on btn dropdown-toggle">\
                <i class="icon-triangle-down-small"></i>\
            </a>\
        ',

        sampleValuesMenuTemplate: '\
            <div class="sample-values-menu dropdown-menu">\
                <div class="arrow"></div>\
            </div>\
        ',

        loadingSampleValuesTemplate: '\
            <ul>\
                <li><a href="#" class="disabled"><%- _("Loading...").t() %></a></li>\
            </ul>\
        ',

        sampleValuesContentTemplate: '\
            <ul>\
                <% if(values.length > 0) { %>\
                    <% _(values).each(function(value) { %>\
                        <li class="sample-value" data-value="<%- value %>">\
                            <a href="#"><%- value %></a>\
                        </li>\
                    <% }); %>\
                    <% if(values.length == limit) { %>\
                        <li class="sample-value-limit">\
                            Displaying top <%- limit %> values\
                        </li>\
                    <% } %>\
                <% } else { %>\
                    <ul>\
                        <li><a href="#" class="disabled"><%- _("No Sample Values found.").t() %></a></li>\
                    </ul>\
                <% } %>\
            </ul>\
        '

    });

    /*
     * A custom control to normalize what is stored in the model as an array into a
     * string of comma-separated values.
     */
    var CompareToListTextControl = TextControl.extend({

        setValueFromModel: function(render) {
            var rawValues = this.model.get(this.getModelAttribute());
            rawValues = _(rawValues).isArray() ? rawValues : [rawValues];
            this._setValue(splunkUtil.fieldListToString(rawValues), render);
            return this;
        },

        getUpdatedModelAttributes: function() {
            var updateAttrs = TextControl.prototype.getUpdatedModelAttributes.apply(this, arguments),
                rawValue = updateAttrs[this.getModelAttribute()];

            updateAttrs[this.getModelAttribute()] = splunkUtil.stringToFieldList(rawValue);
            return updateAttrs;
        }

    });

    var DEFAULT_COMPARE_TO = '*';

    return ControlGroup.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param options {Object} {
         *     model {Model} the pivot element model to operate on
         *     report <models/pivot/PivotReport> the current pivot report
         *     dataTable <models/pivot/PivotableDataTable> the current data table
         *     application: <models/shared/Application> the application state model
         * }
         */

        initialize: function() {
            var controls = [],
                dataType = this.model.get('type');

            if(dataType === 'string' || dataType === 'ipv4' || dataType === 'number') {
                controls.push({
                    type: 'SyntheticSelect',
                    options: {
                        className: Control.prototype.className + ' input-prepend',
                        model: this.model,
                        modelAttribute: 'ruleComparator',
                        toggleClassName: 'btn',
                        menuWidth: 'narrow',
                        items: COMPARATOR_ITEMS[dataType],
                        popdownOptions: {
                            detachDialog: true
                        }
                    }
                });
            }
            if(dataType === 'boolean') {
                controls.push({
                    type: 'SyntheticSelect',
                    options: {
                        model: this.model,
                        modelAttribute: 'ruleCompareTo',
                        toggleClassName: 'btn',
                        menuWidth: 'narrow',
                        items: BOOLEAN_COMPARE_TO_ITEMS,
                        popdownOptions: {
                            detachDialog: true
                        }
                    }
                });
            }
            else {
                controls.push(new CompareToTextControl({
                    className: Control.prototype.className + ' input-prepend',
                    model: this.model,
                    modelAttribute: 'ruleCompareTo',
                    inputClassName: 'input-small',
                    report: this.options.report,
                    dataTable: this.options.dataTable,
                    application: this.options.application
                }));
                if(dataType === 'string' || dataType === 'ipv4') {
                    controls.push(new CompareToListTextControl({
                        className: Control.prototype.className + ' input-prepend',
                        model: this.model,
                        modelAttribute: 'ruleCompareTo',
                        inputClassName: 'input-medium'
                    }));
                }
            }

            this.options.label = _('Match').t();
            this.options.controls = controls;
            ControlGroup.prototype.initialize.call(this, this.options);

            // set up references to each control
            this.ruleComparatorControl = this.childList[0];
            if(this.childList.length > 1) {
                this.ruleCompareToControl = this.childList[1];
            }
            if(this.childList.length > 2) {
                this.ruleCompareToListControl = this.childList[2];
            }
            this.model.on('change:ruleComparator', this.handleComparatorChange, this);
            this.model.on('change:ruleCompareTo', this.handleCompareToChange, this);
        },

        render: function() {
            ControlGroup.prototype.render.apply(this, arguments);
            this.handleComparatorChange();
            return this;
        },

        handleComparatorChange: function() {
            // The "compare to" value for the "in" comparator is an array, so it's incompatible
            // with other comparators.  When switching from the "in" comparator to another,
            // set the "compare to" to a default, but remember the value in case we come
            // back to "in".
            var newComparator = this.model.get('ruleComparator'),
                oldComparator = this.model.previous('ruleComparator');

            // need this guard because this method is called from render
            if(this.model.hasChanged('ruleComparator')) {
                if(oldComparator === "in") {
                    this.previousListCompareTo = this.model.get('ruleCompareTo');
                    this.model.set({
                        ruleCompareTo: this.previousListCompareTo.length === 1 ?
                            this.previousListCompareTo[0] : DEFAULT_COMPARE_TO
                    });
                }
                else if(newComparator === "in") {
                    this.model.set({
                        ruleCompareTo: this.previousListCompareTo || [this.model.get('ruleCompareTo')]
                    });
                }
            }
            if(!this.ruleCompareToControl) {
                return;
            }
            if(newComparator in { isNull: true, isNotNull: true }) {
                this.ruleCompareToControl.detach();
                if(this.ruleCompareToListControl) {
                    this.ruleCompareToListControl.detach();
                }
                this.ruleComparatorControl.$el.removeClass('input-prepend');
                this.setHelpText('');
            }
            else if(newComparator === 'in') {
                this.ruleCompareToControl.detach();
                this.ruleCompareToListControl.insertAfter(this.ruleComparatorControl.el);
                this.ruleComparatorControl.$el.addClass('input-prepend');
                this.setHelpText(this.matchListComparatorHelpText);
            }
            else {
                if(this.ruleCompareToListControl) {
                    this.ruleCompareToListControl.detach();
                }
                this.ruleCompareToControl.insertAfter(this.ruleComparatorControl.el);
                this.ruleComparatorControl.$el.addClass('input-prepend');
                this.setHelpText('');
            }
        },

        handleCompareToChange: function() {
            // If the user changes the compare to value, erase the list mode history
            if(this.model.get('ruleComparator') !== 'in' && !this.model.hasChanged('ruleComparator')) {
                this.previousListCompareTo = null;
            }
        },

        matchListComparatorHelpText: '\
            Enter a comma-separated list of allowed values. Wildcards are permitted.\
            <br />\
            Example:  warning, error-*\
        '

    });

});