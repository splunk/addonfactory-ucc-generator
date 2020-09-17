/**
 * @author jszeto
 * @date 3/18/14
 *
 * Represents a row in the table created by views/indexes/cloud/ArchivesView. The row contains links to perform
 * operations on the given archive. The user can expand the row to see more details about the archive
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/controls/SyntheticCheckboxControl',
        'views/shared/delegates/RowExpandCollapse',
        'util/format_numbers_utils',
        'util/time',
        'splunk.util',
        'contrib/text!views/archives/shared/ArchivesGridRow.html'
    ],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        SyntheticCheckboxControl,
        RowExpandCollapse,
        formatNumbersUtils,
        timeUtils,
        splunkUtils,
        template
    ) {

        return BaseView.extend({
            moduleId: module.id,
            tagName: "tr",
            className: "list-item",
            template: template,

            events: (function() {
                var events = {};
                events['click td.' + RowExpandCollapse.TOGGLE_CELL_CLASS] = 'toggleCellClickHandler';
                // Toggle expanding or collapsing the row
                events['click a.edit-older-than-btn'] = function() {
                    this.trigger("action:editOlderThan", this.model.archive.get("id"));
                };
                events['click .deleteAction'] = function(e) {
                    this.model.controller.trigger("deleteArchive", this.model.archive);
                    e.preventDefault();
                };
                events['click .editAction'] = function(e) {
                    this.model.controller.trigger("editArchive", this.model.archive);
                    e.preventDefault();
                };

                return events;
            })(),

            initialize: function (options) {
                BaseView.prototype.initialize.call(this, options);

                this.children.checkBoxSelected = new SyntheticCheckboxControl();
                this.listenTo(this.children.checkBoxSelected, "change", this.onCheckBoxSelectedChange);
            },

            setCheckBoxValue: function(newValue) {
                this.children.checkBoxSelected.setValue(newValue);
            },

            /**
             * Toggle the expand/collapse state and render
             */
            toggleCellClickHandler: function(e) {
                e.preventDefault();
                this.isExpanded = !this.isExpanded;
                this.debouncedRender();
            },

            onCheckBoxSelectedChange: function() {
                this.trigger("selectedChange", this.model.archive.get("id"), this.children.checkBoxSelected.getValue());
            },

            formatToRelativeTime: function(isoTime) {
                if (_.isUndefined(isoTime) || isoTime == "")
                    return "";

                var epochTime = splunkUtils.getEpochTimeFromISO(isoTime);
                return timeUtils.convertToRelativeTime(epochTime);
            },

            render: function () {

                this.children.checkBoxSelected.detach();
                var html = this.compiledTemplate({model: this.model.archive,
                    isExpanded: this.isExpanded,
                    formatNumbersUtils: formatNumbersUtils,
                    timeUtils: timeUtils,
                    //selected: this.model.get("selected"),
                    toggleCellClass: RowExpandCollapse.TOGGLE_CELL_CLASS,
                    expandedCellBody: RowExpandCollapse.EXPANDED_CELL_MARKUP,
                    collapsedCellBody: RowExpandCollapse.COLLAPSED_CELL_MARKUP,
                    rowIdAttribute: RowExpandCollapse.ROW_ID_ATTR
                });

                this.$el.html(html);

                // Set the row id attribute on the root tag which is a TR
                this.$el.attr(RowExpandCollapse.ROW_ID_ATTR, this.model.archive.get("id"));

                if (this.isExpanded)
                    this.$el.addClass(RowExpandCollapse.EXPANDED_ROW_CLASS);
                else
                    this.$el.removeClass(RowExpandCollapse.EXPANDED_ROW_CLASS);

                this.children.checkBoxSelected.render().appendTo(this.$(".selected-checkbox"));

                return this;
            }
        });
    });
