define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/ControlGroup',
    'util/general_utils'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        ControlGroup,
        generalUtils
        ) {

        return BaseView.extend({
            moduleId: module.id,

            className: "controls-placeholder form form-horizontal",

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);

                // Check if user has write permission. 
                if (this.options.editable) {
                    // Get list of editable fields.
                    this.whiteList = this.model.editModel.filterInputToSaveableFields(this.model.editModel.entry.content.attributes);
                } else {
                    this.whiteList = {};
                }
                
                this.activate();
            },

            startListening: function() {
                this.listenTo(this.model.state, 'change:filter', this.debouncedRender);
            },

            createSetting: function(attribute, enabled) {
                if (enabled) {
                    return new ControlGroup({
                        controlType: 'Text',
                        controlOptions: {
                            modelAttribute: attribute,
                            model: this.model.editModel.entry.content,
                            canClear: true
                        },
                        label: attribute
                    });
                }

                var value = this.model.editModel.entry.content.get(attribute);
                return new ControlGroup({
                    controlType: 'Label',
                    controlOptions: {
                        defaultValue: (value == undefined) ? '-' : value
                    },
                    label: attribute
                });
            },

            isEditable: function(field) {
                return field in this.whiteList;
            },

            render: function() {
                var patt = generalUtils.generateFilterRegex((this.model.state.get('filter') || '').trim()),
                    noAttributesFlag = true;

                _(this.model.editModel.entry.content.keys()).each(function(key) {
                    var value = this.model.editModel.entry.content.get(key);

                    if (!_(this.children).has(key)) {
                        this.children[key] = this.createSetting(key, this.isEditable(key));
                        this.children[key].render().appendTo(this.$el);
                        this.children[key].hide();
                    }

                    // Show or hide depends on the filter
                    if (patt.test(key) || patt.test(value)) {
                        this.children[key].show();
                        noAttributesFlag = false;
                    } else {
                        this.children[key].hide();
                    }

                }, this);

                this.model.state.trigger('showMessage', noAttributesFlag);

                return this;
            }
        });

    });
