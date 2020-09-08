/**
 * @author lbudchenko
 * @date 4/14/15
 *
 * Popup dialog for editing token configuration
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/services/data/inputs/HTTP',
    'views/shared/knowledgeobjects/SourcetypeMenu',
    'views/shared/FlashMessages',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup'
],

    function(
        $,
        _,
        Backbone,
        module,
        InputModel,
        SourcetypeMenu,
        FlashMessages,
        Modal,
        ControlGroup
        ) {

        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME + ' edit-dialog-modal modal-wide',
            initialize: function(options) {
                Modal.prototype.initialize.call(this, arguments);
                options = options || {};
                _(options).defaults({isNew:true});

                // Create flash messages view
                this.children.flashMessagesView = new FlashMessages({
                    model:this.model.entity,
                    helperOptions: {
                        removeServerPrefix: true
                    }
                });

                // Create the form controls
                this.children.inputName = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'name',
                        model: this.model.entity.entry
                    },
                    controlClass: 'controls-block',
                    label: _('Name').t()
                });
                this.children.inputDesc = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'ui.description',
                        model: this.model.entity,
                        placeholder: _('optional').t()
                    },
                    controlClass: 'controls-block',
                    label: _('Description').t(),
                    required: false
                });
                this.children.source = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'ui.source',
                        model: this.model.entity,
                        placeholder: _('optional').t()
                    },
                    controlClass: 'controls-block',
                    label: _('Source').t(),
                    required: false
                });
                var _sourcetypeMenuControl = new SourcetypeMenu({
                    model: this.model.entity,
                    modelAttribute: 'ui.sourcetype',
                    collection: this.collection,
                    addNewSourcetypeLink: false,
                    addLabel: false,
                    attachToModal: true
                });
                this.children.selectSourcetype = new ControlGroup({
                    controlType: 'SyntheticSelect',
                    controlOptions: {
                        modelAttribute: 'ui.sourcetypeSelection',
                        model: this.model.entity,
                        items: [
                            {value: 'Manual', label: _('Entered sourcetype').t()},
                            {value: 'From List', label: _('Select source type from list').t()}
                        ],
                        toggleClassName: 'btn',
                        popdownOptions: {
                            attachDialogTo: 'body'
                        }
                    },
                    controlClass: 'controls-block',
                    label: _('Set Source Type').t(),
                    required: false
                });
                this.children.manualSourcetype = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'ui.sourcetype',
                        model: this.model.entity
                    },
                    controlClass: 'controls-block',
                    label: _('Source Type').t(),
                    required: false
                });
                this.children.sourcetype = new ControlGroup({
                    controls: [_sourcetypeMenuControl],
                    controlClass: 'controls-block',
                    label: _('Source Type').t(),
                    required: false
                });
                this.children.useAck = new ControlGroup({
                    className: 'http-useack control-group',
                    controlType: 'SyntheticCheckbox',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.useACK',
                        model: this.model.entity,
                        save: false
                    },
                    label:   _('Enable indexer acknowledgement').t()
                });

                this.model.entity.on('change:ui.indexes', function() {
                    this.updateDefaultIndexControl();
                }, this);

                this.model.entity.on('change:ui.sourcetypeSelection', function() {
                    this.toggleSourcetype();
                }, this);
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    if (this.model.entity.get('ui.indexes') &&
                        this.model.entity.get('ui.indexes').length === 0 &&
                        this.model.entity.entry.content.get('indexes').length > 0) {
                        // empty array is ignored on save, so passing a space instead IF this looks like a delete
                        // i.e. on page load indexes array wasn't empty
                        this.model.entity.set({'ui.indexes': ' '}, {silent: true});
                    }
                    this.model.entity.transposeToRest();

                    var saveDfd = this.model.entity.save();
                    if (saveDfd) {
                        saveDfd.done(function() {
                            this.trigger("entitySaved", this.model.entity.get("name"));
                            this.hide();
                        }.bind(this));
                    }
                }
            }),

            refreshIndexes: function() {
                return this.collection.indexes.fetch({
                    data: {
                        search: 'isInternal=0 disabled=0',
                        count: -1
                    }
                });
            },

            refreshOutputs: function() {
                return this.collection.outputs.fetch({
                    data: {
                        search: 'disabled=0',
                        count: -1
                    }
                });
            },

            updateIndexControlContent: function() {
                this.indexes = [];
                this.collection.indexes.each(function(model) {
                    var indexName = model.entry.get('name');
                    this.indexes.push({label: indexName, value:indexName});
                }.bind(this));
            },

            updateDefaultIndexControlContent: function() {
                var selectedIndex = '',
                    uiindexes = this.model.entity.get('ui.indexes');

                this.indexes = [];
                if (!uiindexes.length) {
                    this.indexes.push({label: _('Default').t(), value:''});
                    this.collection.indexes.each(function(model) {
                        var indexName = model.entry.get('name');
                        this.indexes.push({label: indexName, value:indexName});
                    }.bind(this));
                    selectedIndex = this.model.entity.get('ui.index') ? this.model.entity.get('ui.index') : '';

                } else {
                    _(uiindexes).each(function(indexName) {
                        this.indexes.push({label: indexName, value:indexName});
                    }.bind(this));

                    selectedIndex = ($.inArray(this.model.entity.get('ui.index'), uiindexes)>-1)? this.model.entity.get('ui.index') : uiindexes[0]; // the first in the list will be default
                }
                this.model.entity.set('ui.index', selectedIndex); // set the selected 'default index'
            },

            updateIndexControl: function() {
               this.updateIndexControlContent();

                var availableItems = this.indexes,
                    selectedItems = this.model.entity.get('ui.indexes');
                this.children.allowedIndexes = new ControlGroup({
                    className: 'allowed-indexes control-group',
                    controlType: 'Accumulator',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.indexes',
                        model: this.model.entity,
                        save: false,
                        itemName: _('indexes').t(),
                        availableItems: availableItems,
                        selectedItems: selectedItems
                    },
                    label: _('Select Allowed Indexes (optional)').t(),
                    help: _('Select indexes that clients will be able to select from.').t()
                });

                this.$('.allowed-indexes-placeholder').html(this.children.allowedIndexes.render().el);
            },

            updateDefaultIndexControl: function() {
                this.updateDefaultIndexControlContent();

                var label = (this.model.entity.get('ui.indexes').length) ? _('Default Index').t() : _('Default Index (optional)').t();
                this.children.index = new ControlGroup({
                    className: 'index control-group',
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.index',
                        model: this.model.entity,
                        items: this.indexes,
                        className: 'btn-group view-count',
                        menuWidth: 'narrow',
                        toggleClassName: 'btn',
                        popdownOptions: {
                            detachDialog: true
                        }
                    },
                    label: label
                });

                this.$('.index-placeholder').html(this.children.index.render().el);
            },

            updateOutputsControl: function() {
                var items = [{'label':_('None').t(), 'value':''}];
                this.collection.outputs.each(function(model) {
                    var outputName = model.entry.get('name');
                    items.push({label: outputName, value:outputName});
                }.bind(this));
                this.children.outputs = new ControlGroup({
                    className: 'output-group control-group',
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.outputgroup',
                        model: this.model.entity,
                        items: items,
                        className: 'btn-group view-count',
                        menuWidth: 'wide',
                        toggleClassName: 'btn',
                        popdownOptions: {
                            detachDialog: true
                        }
                    },
                    label: _('Output Group (optional)').t()
                });
                this.children.outputs.render().appendTo(this.$(".outputs-placeholder"));
            },

            toggleSourcetype: function() {
                if (this.model.entity.get('ui.sourcetypeSelection') === 'Manual') {
                    this.children.sourcetype.hide();
                    this.children.manualSourcetype.show();
                } else {
                    this.children.manualSourcetype.hide();
                    this.children.sourcetype.show();
                }
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Edit Token: ').t() + ' ' + _.escape(this.model.entity.getPrettyName()));
                this.$(Modal.BODY_SELECTOR).show();
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.$(Modal.BODY_FORM_SELECTOR).html(_(this.dialogFormBodyTemplate).template({}));
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-view-placeholder"));
                this.children.inputDesc.render().appendTo(this.$(".desc-placeholder"));
                this.children.source.render().appendTo(this.$(".source-placeholder"));
                this.children.selectSourcetype.render().appendTo(this.$(".sourcetype-select-placeholder"));
                this.children.sourcetype.render().appendTo(this.$(".sourcetype-placeholder"));
                this.children.useAck.render().appendTo(this.$(".useack-placeholder"));
                this.children.manualSourcetype.render().appendTo(this.$(".manualSourcetype-placeholder"));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                this.refreshIndexes().done(function() {
                    this.updateIndexControl();
                    this.updateDefaultIndexControl();
                }.bind(this));

                this.refreshOutputs().done(function() {
                    this.updateOutputsControl();
                }.bind(this));

                this.children.sourcetype.hide();
                this.toggleSourcetype();

                return this;
            },

            dialogFormBodyTemplate: '\
                <div class="flash-messages-view-placeholder"></div>\
                <div class="name-placeholder"></div>\
                <div class="desc-placeholder"></div>\
                <div class="source-placeholder"></div>\
                <div class="sourcetype-select-placeholder"></div>\
                <div class="sourcetype-placeholder"></div>\
                <div class="manualSourcetype-placeholder"></div>\
                <div class="allowed-indexes-placeholder"></div>\
                <div class="index-placeholder"></div>\
                <div class="outputs-placeholder"></div>\
                <div class="useack-placeholder"></div>\
            '
        });
    });
