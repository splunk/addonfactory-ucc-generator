/**
 * @author jszeto
 * @date 12/20/12
 *
 * Displays a row for editing an extracted field. If the row is expanded, then is shows the top 10 distinct values for the field
 *
 * The tagName must be set by the parent view to be a TR. Backbone requires this value be passed into the options hash
 * of the constructor, so unfortunately we can't define it in this class.
 *
 * Input:
 *
 *     model {models/datamodel/ExtractedField} - The extracted field to edit
 */

define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/delegates/RowExpandCollapse',
    'views/shared/controls/TextControl',
    'views/shared/controls/SyntheticCheckboxControl',
    'views/data_model_editor/form_components/SelectFieldFlags',
    'views/data_model_editor/form_components/SelectFieldType'

],
    function(
        $,
        _,
        module,
        Base,
        RowExpandCollapse,
        TextControl,
        SyntheticCheckboxControl,
        SelectFieldFlags,
        SelectFieldType
        ) {

        return Base.extend({
            tagName: 'tr',

            moduleId: module.id,

            events: (function() {
                var events = {};
                events['click td.' + RowExpandCollapse.TOGGLE_CELL_CLASS] = 'toggleCellClickHandler';
                return events;
            })(),

            toggleCellClickHandler: function() {
                this.model.set("isExpanded", !this.model.get("isExpanded"));
            },

            initialize: function(options) {
                Base.prototype.initialize.call(this, options);

                this.children.checkBoxSelected = new SyntheticCheckboxControl({model:this.model,
                                                                               modelAttribute:"selected"});

                this.children.textDisplayName = new TextControl({model:this.model,
                                                                 modelAttribute:"displayName"});

                this.children.selectFieldType = new SelectFieldType({
                        model:this.model,
                        className: "dropdown",
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal .modal-body:visible'
                        }
                    });
                this.children.selectFieldFlags= new SelectFieldFlags({
                        model:this.model,
                        className: "dropdown",
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal .modal-body:visible'
                        }
                    });

                this.model.on("change", function() {
                    this.debouncedRender();
                }, this);
            },

            render: function() {
                this.children.checkBoxSelected.detach();
                this.children.textDisplayName.detach();
                this.children.selectFieldType.detach();
                this.children.selectFieldFlags.detach();

                var html = this.compiledTemplate({fieldName: this.model.get("fieldName"),
                                                  isExpanded: this.model.get("isExpanded"),
                                                  selected: this.model.get("selected"),
                                                  distinctValues: this.model.get("distinctValues"),
                                                  toggleCellClass: RowExpandCollapse.TOGGLE_CELL_CLASS,
                                                  expandedCellBody: RowExpandCollapse.EXPANDED_CELL_MARKUP,
                                                  collapsedCellBody: RowExpandCollapse.COLLAPSED_CELL_MARKUP,
                                                  rowIdAttribute: RowExpandCollapse.ROW_ID_ATTR
                                                });

                this.$el.html(html);

                // Set the row id attribute on the root tag which is a TR
                this.$el.attr(RowExpandCollapse.ROW_ID_ATTR, this.model.get("fieldName"));

                if (this.model.get("isExpanded"))
                    this.$el.addClass(RowExpandCollapse.EXPANDED_ROW_CLASS);
                else
                    this.$el.removeClass(RowExpandCollapse.EXPANDED_ROW_CLASS);


                this.$el.find(".col-checkbox").append(this.children.checkBoxSelected.render().el);

                if (this.model.get("selected")) {
                    this.$el.find(".col-rename").append(this.children.textDisplayName.render().el);
                    this.$el.find(".col-type").append(this.children.selectFieldType.render().el);
                    this.$el.find(".col-type").append(this.children.selectFieldFlags.render().el);
                }

                return this;
            },

            template: '\
                    <% if(isExpanded) { %>\
                        <td class="<%- toggleCellClass %>"><%= expandedCellBody %></td>\
                    <% } else { %>\
                        <td class="<%- toggleCellClass %>"><%= collapsedCellBody %></td>\
                    <% } %>\
                    <td class="col-checkbox"></td>\
                    <td class="col-description">\
                        <%- fieldName %>\
                        <% if(isExpanded) { %>\
                            <div class="expanded-info">\
                                <div>\
                                <p><%- _("Example values:").t() %></p>\
                                <p class="distinct-values-list">\
                                    <% _(distinctValues).each(function(distinctValue) { %>\
                                        <span class="distinct-value"><%- distinctValue.value %></span><br>\
                                    <% }); %>\
                                </p>\
                                </div>\
                            </div>\
                        <% } %>\
                    </td>\
                    <td class="col-rename">\
                        <% if(selected) { %>\
                            <div class="textinput-displayname-placeholder"></div>\
                        <% } %>\
                    </td>\
                    <td class="col-type">\
                        <% if(selected) { %>\
                            <div class="select-type-placeholder"></div>\
                        <% } %>\
                    </td>\
            '

        });

    });
