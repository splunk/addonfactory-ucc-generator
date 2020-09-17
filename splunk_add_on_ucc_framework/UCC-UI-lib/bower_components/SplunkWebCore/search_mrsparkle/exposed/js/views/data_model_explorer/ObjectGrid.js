/**
 * @author sfishel
 *
 * A grid view that displays the objects contained in a data model.
 *
 * Adds expand/collapse behavior on each row to display that object's fields.
 *
 * Custom Events:
 *
 * action:selectObject - triggered when an object has been selected from the list
 *     @param objectName {String} the name of the selected object
 */

define([
            'jquery',
            'underscore',
            'module',
            'models/services/datamodel/DataModel',
            'models/shared/Application',
            'models/pivot/datatable/PivotableDataTable',
            'views/extensions/DeclarativeDependencies',
            'views/Base',
            'views/shared/delegates/RowExpandCollapse',
            'helpers/grid/RowIterator',
            'views/pivot/DataTableFieldList',
            'views/shared/delegates/Popdown',
            'uri/route',
            'splunk.util',
            'splunk.i18n',
            'models/classicurl',
            './ObjectGrid.pcss'
        ],
        function(
            $,
            _,
            module,
            DataModel,
            Application,
            PivotableDataTable,
            DeclarativeDependencies,
            Base,
            RowExpandCollapse,
            RowIterator,
            DataTableFieldList,
            Popdown,
            route,
            splunkUtils,
            i18n,
            classicUrl,
            css
        ) {

    var ObjectGrid = Base.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param options {Object} {
         *     model: {
         *         dataModel: <models/services/datamodel/DataModel> the data model containing the objects to list
         *         application: <models/shared/Application> the application state model
         *     }
         * }
         */

        initialize: function(options) {
            Base.prototype.initialize.call(this, options);
            this.children.rowExpandCollapse = new RowExpandCollapse({
                el: this.el,
                autoUpdate: true
            });
            this.children.fieldActionPopdown = new Popdown({
                el: this.el,
                toggle: '.field-action-button',
                dialog: '.field-action-menu'
            });

            this.dataModelHasSynced = (this.deferreds.dataModel.state() !== 'pending');
            if (!this.dataModelHasSynced) {
                this.deferreds.dataModel.done(function() {
                    this.dataModelHasSynced = true;
                    this.debouncedRender();
                }.bind(this));
            }
            this.children.rowExpandCollapse.on(RowExpandCollapse.ROW_EXPAND, this.handleRowExpand, this);
            this.children.rowExpandCollapse.on(RowExpandCollapse.ROW_COLLAPSE, this.handleRowCollapse, this);
            this.children.fieldActionPopdown.on('show', function($target) {
                var objectName = this.resolveObjectName($target[0]),
                    fieldName = $target.attr('data-field-name'),
                    fieldOwner = $target.attr('data-field-owner'),
                    object = this.model.dataModel.objectByName(objectName),
                    field = object.getFieldByName(fieldName, fieldOwner);

                this.onFieldActionMenuShow(field, object);
            }, this);
        },

        render: function() {
            var headerMessage,
                hierarchy = this.model.dataModel.getPivotableHierarchy() || [],
                rowIterator = new RowIterator();

            if(this.dataModelHasSynced) {
                headerMessage = splunkUtils.sprintf(
                    i18n.ungettext('1 Object in %(modelName)s', '%(count)s Objects in %(modelName)s', hierarchy.length),
                    { count: hierarchy.length, modelName: this.model.dataModel.entry.content.get('displayName') }
                );
            }
            else {
                headerMessage = _("Loading Datasets...").t();
            }

            var html = this.compiledTemplate({
                    hierarchy: hierarchy,
                    application: this.model.application,
                    dataModel: this.model.dataModel,
                    eachRow: rowIterator.eachRow,
                    headerCellClass: RowExpandCollapse.HEADER_CELL_CLASS,
                    toggleCellClass: RowExpandCollapse.TOGGLE_CELL_CLASS,
                    rowIdAttribute: RowExpandCollapse.ROW_ID_ATTR,
                    headerMessage: headerMessage,
                    dataModelHasSynced: this.dataModelHasSynced,
                    route: route,
                    modelId: this.model.dataModel.get('id')
                }),
                $html = $(html);

            this.children.rowExpandCollapse.update($html);
            this.$el.html($html);

            this.$("a.select-object-button").click(function(e) {
                e.preventDefault();
                classicUrl.save({ object: $(this).data("object-name") }, { trigger: true });
            });
        },

        template: '\
            <table class="table table-chrome table-striped table-bordered-lite table-row-expanding">\
                <thead>\
                    <tr>\
                        <th class="<%- headerCellClass %>"></th>\
                        <th>\
                            <%- headerMessage %>\
                        </th>\
                    </tr>\
                </thead>\
                <tbody>\
                    <% eachRow(hierarchy, function(object, index) { %>\
                    \
                        <% if(object.isPivotable) { %>\
                            <tr class="list-item <%- index%2 == 0 ? "even" : "odd" %>" <%- rowIdAttribute %>="<%- object.objectName %>">\
                                <td class="<%- toggleCellClass %>"></td>\
                                <td class="title description object-description nested-<%- object.depth %>">\
                                    <a href="<%- route.pivot(application.get("root"), application.get("locale"), application.get("app"), { data: { model: modelId, object: object.objectName }}) %>" data-object-name="<%- object.objectName %>" class="select-object-button"><%- object.displayName %></a>\
                                </td>\
                            </tr>\
                        <% } else { %>\
                            <tr class="list-item <%- index%2 == 0 ? "even" : "odd" %>" <%- rowIdAttribute %>="<%- object.objectName %>">\
                                <td class="<%- toggleCellClass %>"></td>\
                                <td class="title description object-description nested-<%- object.depth %>">\
                                    <span class="unselectable-object"><%- object.displayName %></span>\
                                </td>\
                            </tr>\
                        <% } %>\
                    \
                    <% }) %>\
                </tbody>\
            </table>\
            <% if(dataModelHasSynced && hierarchy.length === 0) { %>\
                <% var href = route.data_model_editor(application.get("root"), application.get("locale"), application.get("app"), { data: { model: dataModel.id } }) %>\
                <div class="no-objects-message">\
                    <div class="alert alert-info">\
                        <i class="icon-alert"></i>\
                        <%- _("You have no Datasets available for Pivot.").t() %>\
                        <a class="edit-objects-link" href="<%- href %>" >\
                            <%- _("Edit Datasets").t() %>\
                        </a>\
                    </div>\
                </div>\
            <% } %>\
            <div class="dropdown-menu dropdown-menu-selectable field-action-menu">\
                <div class="arrow"></div>\
                <ul></ul>\
            </div>\
        ',

        // ----- private methods ----- //

        handleRowExpand: function(rowId) {
            var $row = this.getRowById(rowId),
                object = this.model.dataModel.objectByName(rowId),
                childId = 'objectFieldList_' + rowId;

            if(object.isPivotable()) {
                var fieldList = this.children[childId] = new DataTableFieldList({
                    model: PivotableDataTable.createFromDataModelObject(object),
                    eventButtonClass: 'field-action-button',
                    timestampButtonClass: 'non-link',
                    otherButtonClass: 'field-action-button'
                });
                fieldList.render().appendTo($row.find('.object-description'));
                fieldList.$('.field-action-button').append('<span class="caret"></span>');
                // for some reason IE 7 doesn't handle the CSS-only solution for row expand-collapse icons
                // so we explicitly take of things here
                $row.find('.col-info').html('<i class="icon-triangle-down-small"></i>');
            }
            else {
                var unpivotableMsg = this.children[childId] = $("<div>" + _("This dataset is not pivotable.").t() + "</div>");
                unpivotableMsg.appendTo($row.find('.object-description'));
            }
        },

        handleRowCollapse: function(rowId) {
            var childId = 'objectFieldList_' + rowId,
                $row = this.getRowById(rowId);

            if(this.children[childId]) {
                this.children[childId].off(null, null, this);
                this.children[childId].remove();
                delete this.children[childId];
            }
            // see IE 7 related comment in handleRowExpand above
            $row.find('.col-info').html('<i class="icon-triangle-right-small"></i>');
        },

        getRowById: function(rowId) {
            return this.$('tr[' + RowExpandCollapse.ROW_ID_ATTR + '="' + rowId + '"]');
        },

        resolveObjectName: function(elem) {
            return $(elem).closest('.list-item').attr(RowExpandCollapse.ROW_ID_ATTR);
        },

        onFieldActionMenuShow: function(field, object) {
            var type = field.type,
                root = this.model.application.get('root'),
                locale = this.model.application.get('locale'),
                app = this.model.application.get('app'),
                modelName = this.model.dataModel.id,
                objectName = object.get('objectName'),
                objectHasIndexTime = !!object.getFieldByName('_time'),
                $actionsUl = this.$('.field-action-menu ul');

            var appendActionLink = function(text, href) {
                var $li = $('<li></li>').appendTo($actionsUl);
                $('<a></a>').text(text).attr('href', href).appendTo($li);
            };

            $actionsUl.empty();
            if(type === 'objectCount' || type === 'childCount') {
                appendActionLink(
                    splunkUtils.sprintf(_('Count of %s').t(), field.displayName),
                    route.pivot(root, locale, app, { data: { model: modelName, object: objectName, cells: field.fieldName } })
                );
                if(objectHasIndexTime) {
                    appendActionLink(
                        splunkUtils.sprintf(_('Count of %s by Time').t(), field.displayName),
                        route.pivot(root, locale, app, { data: { model: modelName, object: objectName, cells: field.fieldName, rows: '_time' } })
                    );
                }
            }
            else {
                appendActionLink(
                    _('Top Values').t(),
                    route.pivot(root, locale, app, { data: { model: modelName, object: objectName, rows: field.fieldName } })
                );
                if(objectHasIndexTime) {
                    appendActionLink(
                        _('Top Values by Time').t(),
                        route.pivot(root, locale, app, { data: { model: modelName, object: objectName, columns: field.fieldName, rows: '_time' } })
                    );
                }
            }
        }

    },
    {
        apiDependencies: {
            dataModel: DataModel,
            application: Application
        }
    });

    return DeclarativeDependencies(ObjectGrid);
});
