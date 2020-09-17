/**
 * @author jszeto
 * @date 11/4/14
 *
 * Represents a row in the table created by views/virtual_indexes/ArchiveGrid. The row contains links to perform
 * operations on the given archive. The user can expand the row to see more details about the archive
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'splunk.util',
    'util/time_hunk',
    'views/Base',
    'views/shared/controls/SyntheticCheckboxControl',
    'views/shared/delegates/RowExpandCollapse'
],
    function (
        $,
        _,
        Backbone,
        module,
        splunkUtils,
        timeUtil,
        BaseView,
        SyntheticCheckboxControl,
        RowExpandCollapse
        ) {

        return BaseView.extend({
            moduleId: module.id,
            tagName: "tr",
            className: "list-item",

            events: (function() {
                var events = {};
                events['click td.' + RowExpandCollapse.TOGGLE_CELL_CLASS] = 'toggleCellClickHandler';
                // Toggle expanding or collapsing the row
                events['click a.edit-older-than-btn'] = function() {
                    this.trigger("action:editOlderThan", this.model.archive.get("id"));
                };
                events['click a.edit-cutoff-sec-btn'] = function() {
                    this.trigger('action:editCutoffSec', this.model.archive.get('id'));
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

            render: function () {
                this.children.checkBoxSelected.detach();

                var olderThan = timeUtil.formatSeconds(this.model.archive.entry.content.get("vix.output.buckets.older.than"));
                
                var unifiedSearchEnabled = this.model.limits.getUnifiedSearch();
                var cutoff = 'Off ';
                if (unifiedSearchEnabled && this.model.archive.entry.content.get('vix.unified.search.cutoff_sec')) {
                    var cutoffSec = timeUtil.formatSeconds(this.model.archive.entry.content.get('vix.unified.search.cutoff_sec'));
                    cutoff = splunkUtils.sprintf(_('Cutoff at %s').t(), cutoffSec);
                }

                // TODO [JCS] format the Older Than value. (eg. 7 days)
                var html = this.compiledTemplate({model: this.model.archive,
                    isExpanded: this.isExpanded,
                    olderThan: olderThan,
                    cutoff: cutoff,
                    unifiedSearchEnabled: unifiedSearchEnabled,
                    maxBandwidth: this.options.bandWidth,
                    toggleCellClass: RowExpandCollapse.TOGGLE_CELL_CLASS,
                    expandedCellBody: RowExpandCollapse.EXPANDED_CELL_MARKUP,
                    collapsedCellBody: RowExpandCollapse.COLLAPSED_CELL_MARKUP,
                    rowIdAttribute: RowExpandCollapse.ROW_ID_ATTR,
                    nextArchiveAttempt: this.options.nextArchiveAttempt
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
            },

            template: '\
                <% if(isExpanded) { %>\
                        <td class="<%- toggleCellClass %>"><%= expandedCellBody %></td>\
                    <% } else { %>\
                        <td class="<%- toggleCellClass %>"><%= collapsedCellBody %></td>\
                <% } %>\
                <td class="selected-checkbox"></td>\
                <td><%- model.entry.get("name") %>\
                    <% if(isExpanded) { %>\
                        <div class="expanded-info">\
                            <dl class="list-dotted">\
                                <dt><%- _("Destination Path").t() %></dt>\
                                <dd><%- model.entry.content.get("vix.output.buckets.path") %></dd>\
                                <dt><%- _("Older Than").t() %></dt>\
                                <dd><%- olderThan %>\
                                    <a class="edit-older-than-btn" href="#"><%- _("Edit").t() %></a>\
                                </dd>\
                                <dt><%- _("Unified Search").t() %></dt>\
                                <dd><%- cutoff%>\
                                    <a class="edit-cutoff-sec-btn" href="#"><%- _("Edit").t() %></a>\
                                </dd>\
                                <% if (!_.isEmpty(nextArchiveAttempt)) { %>\
                                    <dt><%- _("Next Archive Attempt").t() %></dt>\
                                    <dd><%- nextArchiveAttempt %></dd>\
                                <% } %>\
                            </dl>\
                        </div>\
                    <% } %>\
                </td>\
                <td><%- model.entry.content.get("vix.output.buckets.from.indexes") %></td>\
                <td>\
                    <% if (model.entry.content.get("disabled")) { %>\
                        <%= _("Disabled").t() %> <a href="#" class="enableAction"><%= _("Enable").t() %></a>\
                    <% } else { %>\
                        <%= _("Enabled").t() %> <a href="#" class="disableAction"><%= _("Disable").t() %></a>\
                    <% } %>\
                </td>\
                <td class="actions">\
                    <a href="#" class="searchAction"><%= _("Search").t() %></a>\
                    <a href="#" class="deleteAction"><%= _("Delete").t() %></a>\
                </td>\
                <td><a href="#" class="provider-link" data-provider="<%- model.entry.content.get("vix.provider")%>">\
                    <%- model.entry.content.get("vix.provider") %> </a></td>\
                <td><a href="#" class="provider-link" data-provider="<%- model.entry.content.get("vix.provider")%>">\
                    <%- maxBandwidth %></a></td>\
            '
        });
    });

