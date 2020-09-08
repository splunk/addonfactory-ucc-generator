define([
            'jquery',
            'underscore',
            'module',
            'models/Base',
            'views/shared/Modal',
            'views/shared/FlashMessages',
            'splunk.util',
            'uri/route',
            'util/math_utils',
            'util/keyboard'
        ],
        function(
            $,
            _,
            module,
            BaseModel,
            Modal,
            FlashMessages,
            splunkUtils,
            route,
            mathUtils,
            keyboardUtils
        ) {

    // NOTE: this number is hard-coded in the warning message in the template.
    var FIELD_NUMBER_LIMIT = 50;

    var FieldSelectionModel = BaseModel.extend({

        validation: {
            coverage: {
                pattern: 'number',
                range: [0, 1],
                msg: _('Coverage must be a valid percentage.').t()
            }
        }

    });

    var OpenInPivotMenu = Modal.extend({

        moduleId: module.id,

        events: $.extend({}, Modal.prototype.events, {
            'change .coverage-input': function(e) {
                this.model.fieldSelectionState.set({
                    coverage: mathUtils.roundToDecimal(parseFloat($(e.target).val()) / 100, -5)
                }, { validate: true });
                if(this.model.fieldSelectionState.isValid()) {
                    this.$('.submit-button').removeClass('disabled');
                }
                else {
                    this.$('.submit-button').addClass('disabled');
                }
            },
            'change [name=selection-mode]': function(e) {
                this.model.fieldSelectionState.set({
                    mode: $(e.target).val()
                });
            },
            'keydown .coverage-input': function(e) {
                if(e.which === keyboardUtils.KEYS.TAB && e.shiftKey) {
                    this.forceFieldCoverageRadioFocus = true;
                }
            },
            // Whenever the field coverage radio button is selected, focus the text input.
            // The flaw in this strategy is that the user cannot use keyboard navigation to go backward from the
            // text input to the radio button (SPL-88299).  Explicitly handle that particular situation by setting a
            // flag when that keyboard navigation is detected and using that to force focus on the radio button.
            'focus [value=field-coverage]': function() {
                if(!this.forceFieldCoverageRadioFocus) {
                    this.$('.coverage-input').focus();
                }
                this.forceFieldCoverageRadioFocus = false;
            },
            'click .submit-button': function(e) {
                if($(e.target).hasClass('disabled')) {
                    e.preventDefault();
                }
            }
        }),

        /**
         * @constructor
         * @param options {
         *     model: {
         *         summary: <models.services.search.jobs.Summary>
         *         searchJob: <models.search.Job>
         *         application: <models.shared.Application>
         *         timeRange: <models.shared.TimeRange>
         *     },
         *     collection: {
         *         selectedFields: <collections.search.SelectedFields>
         *     }
         * }
         */

        initialize: function() {
            Modal.prototype.initialize.apply(this, arguments);
            this.$el.addClass('open-in-pivot-modal');
            this.model.fieldSelectionState = new FieldSelectionModel();
            this.chooseDefaultMode();
            this.getNumFieldsForCoverage = _(this.getNumFieldsForCoverage).memoize();

            this.children.flashMessages = new FlashMessages({
                model: this.model.fieldSelectionState
            });

            this.listenTo(this.model.fieldSelectionState, 'change:coverage', function() {
                this.updateCoverageCount();
                this.updateWarningTextVisibility();
                this.updateSubmitButton();
            });
            this.listenTo(this.model.fieldSelectionState, 'change:mode', function() {
                this.updateWarningTextVisibility();
                this.updateSubmitButton();
                this.updateCoverageInputEnabled();
            });
        },

        chooseDefaultMode: function() {
            var numSelectedFields = this.getFilteredSelectedFields().length;
            if(this.model.summary.fields.length <= FIELD_NUMBER_LIMIT) {
                this.model.fieldSelectionState.set({
                    mode: OpenInPivotMenu.ALL_FIELDS,
                    coverage: this.getDefaultCoverage()
                });
            }
            else if(numSelectedFields > 5 && numSelectedFields <= FIELD_NUMBER_LIMIT) {
                this.model.fieldSelectionState.set({
                    mode: OpenInPivotMenu.SELECTED_FIELDS,
                    coverage: this.getDefaultCoverage()
                });
            }
            else {
                this.model.fieldSelectionState.set({
                    mode: OpenInPivotMenu.FIELD_COVERAGE,
                    coverage: this.getDefaultCoverage()
                });
            }
        },

        getFilteredSelectedFields: function() {
            return this.model.summary.fields.filter(function(field) {
                return !!this.collection.selectedFields.findWhere({ name: field.get('name') });
            }, this);
        },

        getDefaultCoverage: function() {
            var sortedFields = this.model.summary.fields.sortBy('count').reverse();
            if(sortedFields.length === 0) {
                return 0;
            }
            sortedFields = sortedFields.slice(0, FIELD_NUMBER_LIMIT);
            var maxCoverage = _(sortedFields).last().get('count') / this.model.summary.get('event_count');
            // Round up to the nearest percent.
            maxCoverage = (Math.ceil(maxCoverage * 100) / 100);
            // If there are duplicate percentages we could still be over the limit, check for that here.
            // And increase by 1 percent if needed.
            if(this.getNumFieldsForCoverage(maxCoverage) > FIELD_NUMBER_LIMIT) {
                maxCoverage += 0.01;
            }
            return mathUtils.roundToDecimal(maxCoverage, -5);
        },

        getNumFieldsForCoverage: function(coverage) {
            var totalCount = this.model.summary.get('event_count'),
                coveredFields = this.model.summary.fields.filter(function(field) {
                    return (field.get('count') / totalCount) >= coverage;
                });

            return coveredFields.length;
        },

        updateCoverageInputEnabled: function() {
            var $coverageInput = this.$('.coverage-input');
            if(this.model.fieldSelectionState.get('mode') === OpenInPivotMenu.FIELD_COVERAGE) {
                $coverageInput.removeAttr('disabled');
                $coverageInput.focus();
            }
            else {
                $coverageInput.attr('disabled', true);

            }
        },

        updateCoverageCount: function() {
            this.$('.coverage-count').text(this.getNumFieldsForCoverage(this.model.fieldSelectionState.get('coverage')));
        },

        updateWarningTextVisibility: function() {
            var count;
            var mode = this.model.fieldSelectionState.get('mode');
            if(mode === OpenInPivotMenu.ALL_FIELDS) {
                count = this.model.summary.fields.length;
            }
            else if(mode === OpenInPivotMenu.SELECTED_FIELDS) {
                count = this.getFilteredSelectedFields().length;
            }
            else {
                count = this.getNumFieldsForCoverage(this.model.fieldSelectionState.get('coverage'));
            }
            var $warning = $('.too-many-fields-warning');
            if(count > FIELD_NUMBER_LIMIT) {
                $warning.show();
            }
            else {
                $warning.hide();
            }
        },

        updateSubmitButton: function() {
            var qsArgs = { seedSid: this.model.searchJob.id , earliest: this.model.timeRange.get("earliest") , latest: this.model.timeRange.get("latest") };
            var mode = this.model.fieldSelectionState.get('mode');
            if(mode === OpenInPivotMenu.SELECTED_FIELDS) {
                qsArgs.fields = splunkUtils.fieldListToString(_(this.getFilteredSelectedFields()).map(function(selectedField) {
                    return selectedField.get('name');
                }));
            }
            else if(mode === OpenInPivotMenu.FIELD_COVERAGE) {
                qsArgs.field_coverage = this.model.fieldSelectionState.get('coverage');
            }
            var href = route.pivot(
                this.model.application.get('root'),
                this.model.application.get('locale'),
                this.model.application.get('app'),
                { data: qsArgs }
            );
            this.$('.submit-button').attr('href', href);
        },

        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Fields').t());
            var $modalBody = this.$(Modal.BODY_SELECTOR);
            if(this.model.summary.fields.length === 0) {
                $modalBody.html(_(this.noFieldsTemplate).template({}));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                return this;
            }
            $modalBody.html(_(this.dialogBodyTemplate).template({}));
            this.children.flashMessages.prependTo($modalBody);
            $modalBody.append(Modal.FORM_HORIZONTAL);
            var coverage = mathUtils.roundToDecimal(this.model.fieldSelectionState.get('coverage') * 100, -5);
            this.$(Modal.BODY_FORM_SELECTOR).html(_(this.dialogFormBodyTemplate).template({
                fieldSelectionState: this.model.fieldSelectionState,
                numFields: this.model.summary.fields.length,
                numSelectedFields: this.getFilteredSelectedFields().length,
                cid: this.cid,
                coverageLabel: splunkUtils.sprintf(
                    _('Fields with at least %s %% coverage').t(),
                    '<input type="text" class="coverage-input input-very-small" value="' + coverage + '" />'
                ),
                MODES: _(OpenInPivotMenu).pick('ALL_FIELDS', 'SELECTED_FIELDS', 'FIELD_COVERAGE')
            }));
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append(
                '<a href="#" class="btn btn-primary submit-button modal-btn-primary pull-right">' + _('OK').t() + '</a>'
            );

            this.updateCoverageInputEnabled();
            this.updateCoverageCount();
            this.$('input[value="' + this.model.fieldSelectionState.get('mode') + '"]').prop('checked', true);
            this.updateWarningTextVisibility();
            this.updateSubmitButton();
            return this;
        },

        dialogBodyTemplate: '\
            <div class="alert alert-warning too-many-fields-warning" style="display: none;">\
                <i class="icon-alert"></i>\
                <%- _("Selecting more than 50 fields can make Pivot more difficult to use.").t() %>\
            </div>\
            <p><%- _("Which fields would you like to use as a Data Model?").t() %></p>\
        ',

        dialogFormBodyTemplate: '\
            <label class="radio" for="all-button-<%- cid %>">\
                <input type="radio" name="selection-mode" value="<%- MODES.ALL_FIELDS %>" id="all-button-<%- cid %>" />\
                <%- _("All Fields").t() %> (<span class="all-fields-count"><%- numFields %></span>)\
            </label>\
            <label class="radio" for="selected-button-<%- cid %>">\
                <input type="radio" name="selection-mode" value="<%- MODES.SELECTED_FIELDS %>" id="selected-button-<%- cid %>"/>\
                <%- _("Selected Fields").t() %> (<span class="selected-fields-count"><%- numSelectedFields %></span>)\
            </label>\
            <label class="radio" for="coverage-button-<%- cid %>">\
                <input type="radio" name="selection-mode" value="<%- MODES.FIELD_COVERAGE %>" id="coverage-button-<%- cid %>"/>\
                <%= coverageLabel %>\
                (<span class="coverage-count"></span>)\
            </label>\
        ',

        noFieldsTemplate: '\
            <div class="alert alert-error">\
                <i class="icon-alert"></i>\
                <%- _("You must extract at least one field in order to use Pivot.").t() %>\
            </div>\
        '

    },
    {
        ALL_FIELDS: 'all-fields',
        SELECTED_FIELDS: 'selected-fields',
        FIELD_COVERAGE: 'field-coverage'
    });

    return OpenInPivotMenu;

});
