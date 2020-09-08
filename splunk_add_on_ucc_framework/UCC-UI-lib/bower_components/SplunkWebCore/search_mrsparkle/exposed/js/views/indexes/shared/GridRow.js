/**
 * @author jszeto
 * @date 2/9/14
 *
 * Represents a row in the table created by views/indexes/cloud/IndexesView. The row contains links to perform
 * operations on the given index. The user can expand the row to see more details about the index
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/controls/SyntheticCheckboxControl',
        'views/shared/delegates/RowExpandCollapse',
        'views/shared/basemanager/StatusCell',
        'uri/route',
        'util/format_numbers_utils',
        'util/time',
        'splunk.util'
    ],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        SyntheticCheckboxControl,
        RowExpandCollapse,
        StatusCellView,
        route,
        formatNumbersUtils,
        timeUtils,
        splunkUtils
    ) {

        return BaseView.extend({
            moduleId: module.id,
            tagName: "tr",
            className: "list-item",

            events: (function() {
                var events = {};
                events['click td.' + RowExpandCollapse.TOGGLE_CELL_CLASS] = 'toggleCellClickHandler';
                // Toggle expanding or collapsing the row
                events['click .deleteAction'] = function(e) {
                    this.model.controller.trigger("deleteEntity", this.model.entity);
                    e.preventDefault();
                };
                events['click .editAction'] = function(e) {
                    this.model.controller.trigger("editEntity", this.model.entity);
                    e.preventDefault();
                };
                events['click .disableAction'] = function(e) {
                    this.model.controller.trigger("disableEntity", this.model.entity);
                    e.preventDefault();
                };
                events['click .enableAction'] = function(e) {
                    this.model.controller.trigger("enableEntity", this.model.entity);
                    e.preventDefault();
                };

                return events;
            })(),


            initialize: function (options) {
                BaseView.prototype.initialize.call(this, options);

                this.children.checkBoxSelected = new SyntheticCheckboxControl();

                this.children.statusCell = new StatusCellView({
                    collection: this.collection,
                    model: this.model
                });

                this.listenTo(this.children.checkBoxSelected, "change", this.onCheckBoxSelectedChange);
                this.listenTo(this.model.entity.entry.content, "change", this.debouncedRender);

                this.template = this.options.template;
            },

            isEnabled: function() {
                return !splunkUtils.normalizeBoolean(this.model.entity.entry.content.get("disabled"));
            },
            isInternal: function() {
                return !this.model.entity.entry.links.get("remove");
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
                this.trigger("selectedChange", this.model.entity.get("id"), this.children.checkBoxSelected.getValue());
            },

            formatToEpochTime: function(isoTime) {
                if (_.isUndefined(isoTime) || isoTime == "")
                    return "";
                return splunkUtils.getEpochTimeFromISO(isoTime);

            },
            formatToLocalTime: function(isoTime) {
                return timeUtils.convertToLocalTime(this.formatToEpochTime(isoTime));
            },
            formatToRelativeTime: function(isoTime) {
                return timeUtils.convertToRelativeTime(this.formatToEpochTime(isoTime));
            },

            render: function () {
                this.children.checkBoxSelected.detach();

                var archiveLink = route.archives(this.model.application.get('root'),
                                                 this.model.application.get('locale'),
                                                 this.model.application.get('app'),
                                                 {});
                var html = _(this.template).template({
                    _: _,
                    model: {
                        entity: this.model.entity,
                        user: this.model.user
                    },
                    archiveLink: archiveLink,
                    editLink: splunkUtils.sprintf('indexes/%s?uri=%s&ns=%s&action=edit', this.model.entity.entry.get('name'), encodeURIComponent(this.model.entity.id), this.model.entity.entry.acl.get('app')),
                    user: this.model.user,
                    isExpanded: this.isExpanded,
                    isEnabled: this.isEnabled(),
                    isInternal: this.isInternal(),
                    formatNumbersUtils: formatNumbersUtils,
                    timeUtils: timeUtils,
                    splunkUtil: splunkUtils,
                    formatToLocalTime: this.formatToLocalTime.bind(this),
                    formatToRelativeTime: this.formatToRelativeTime.bind(this),
                    toggleCellClass: RowExpandCollapse.TOGGLE_CELL_CLASS,
                    expandedCellBody: RowExpandCollapse.EXPANDED_CELL_MARKUP,
                    collapsedCellBody: RowExpandCollapse.COLLAPSED_CELL_MARKUP,
                    rowIdAttribute: RowExpandCollapse.ROW_ID_ATTR
                });

                this.$el.html(html);

                // Set the row id attribute on the root tag which is a TR
                this.$el.attr(RowExpandCollapse.ROW_ID_ATTR, this.model.entity.get("id"));

                if (this.isExpanded)
                    this.$el.addClass(RowExpandCollapse.EXPANDED_ROW_CLASS);
                else
                    this.$el.removeClass(RowExpandCollapse.EXPANDED_ROW_CLASS);

                this.children.checkBoxSelected.render().appendTo(this.$(".selected-checkbox"));
                this.children.statusCell.render().appendTo(this.$(".status-cell-placeholder"));

                return this;
            }
        }, {
            columns: [
                {
                    id: 'name',
                    title: _('Name').t()
                }, {
                    id: 'eai:acl.app',
                    title: _('App').t(),
                    visible: function() {
                        return this.model.user.canUseApps();
                    }
                }, {
                    id: 'currentDBSizeMB',
                    title: _('Current Size').t()
                }, {
                    id: 'maxTotalDataSizeMB',
                    title: _('Max Size').t()
                }, {
                    id: 'totalEventCount',
                    title: _('Event Count').t()
                }, {
                    id: 'minTime',
                    title: _('Earliest Event').t()
                }, {
                    id: 'maxTime',
                    title: _('Latest Event').t()
                }, {
                    id: 'homePath',
                    title: _('Home Path').t(),
                    visible: function() {
                        return this.model.controller.get('mode') === 'local';
                    }
                }, {
                    id: 'coldToFrozenDir',
                    title: _('Frozen Path').t(),
                    visible: function() {
                        return this.model.controller.get('mode') === 'local';
                    }
                }, {
                    id: 'frozenTimePeriodInSecs',
                    title: _('Retention').t(),
                    visible: function() {
                        return this.model.controller.get('mode') === 'cloud';
                    }
                }, {
                    id: 'archive.provider',
                    title: _('Archive Destination').t(),
                    visible: function() {
                        return ((this.model.controller.get('mode') === 'cloud') && this.model.user.canViewArchives());
                    }
                }
            ]
        });
    });

