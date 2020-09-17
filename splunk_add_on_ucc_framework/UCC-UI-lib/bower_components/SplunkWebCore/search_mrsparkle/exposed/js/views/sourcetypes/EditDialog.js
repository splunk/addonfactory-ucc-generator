/**
 * @author lbudchenko / callan
 * @date 5/5/15
 *
 * Popup dialog for editing sourcetype config
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/FlashMessages',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'views/datapreview/settings/SettingsPanels'

],

    function(
        $,
        _,
        Backbone,
        module,
        FlashMessages,
        Modal,
        ControlGroup,
        SettingsPanels
        ) {

        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME + ' edit-dialog-modal modal-wide',

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    var saveOptions = {};
                    if(this.model.entity.isNew()  || this.options.isClone){
                        var app = this.canUseApps ? this.model.entity.entry.acl.get('app') : "search";
                        saveOptions.data = {app: app, owner: 'nobody'};
                        this.model.entity.entry.content.set('pulldown_type', 1);
                    }

                    if (_.isUndefined(this.model.entity.entry.get('name'))) {
                        this.model.entity.entry.set({name:''}, {silent:true});
                    }
                    this.model.entity.set('name', this.model.entity.entry.get('name'));

                    if (this.options.isClone){
                        this.model.entity.set('id', undefined);
                    }

                    var saveDfd = this.model.entity.save({}, saveOptions);
                    if (saveDfd) {
                        saveDfd.done(function() {
                            this.trigger("entitySaved", this.model.entity.get("name"));
                            this.hide();
                        }.bind(this))
                        .fail(function() {
                            this.$el.find('.modal-body').animate({ scrollTop: 0 }, 'fast');
                        }.bind(this));
                    }
                }
            }),

            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
                options = options || {};
                _(options).defaults({isNew:true});

                this.renderDfd = new $.Deferred();
                this.deferreds = options.deferreds;

                this.canUseApps = this.model.user.canUseApps();
                // Create flash messages view
                this.children.flashMessagesView = new FlashMessages({
                    model: this.model.entity,
                    helperOptions: {
                        removeServerPrefix: true
                    }
                });

                // Create the form controls
                this.children.entityName = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'name',
                        model: this.model.entity.entry
                    },
                    controlClass: 'controls-block',
                    label: _('Name').t()
                });

                this.children.entityDesc = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'description',
                        model: this.model.entity.entry.content,
                        placeholder: _('optional').t()
                    },
                    controlClass: 'controls-block',
                    label: _('Description').t(),
                    required: false
                });

                this.children.appSelect = new ControlGroup({
                    label: _('Destination app').t(),
                    controlType: 'SyntheticSelect',
                    controlOptions: {
                        model: this.model.entity.entry.acl,
                        modelAttribute: 'app',
                        items: [],
                        className: 'fieldAppSelect',
                        toggleClassName: 'btn',
                        popdownOptions: {
                            detachDialog: true
                        },
                        save: false
                    }
                });

                this.children.categorySelect = new ControlGroup({
                    label: _('Category').t(),
                    controlType: 'SyntheticSelect',
                    controlOptions: {
                        model: this.model.entity.entry.content,
                        modelAttribute: 'category',
                        items: [],
                        className: 'fieldCategorySelect',
                        toggleClassName: 'btn',
                        popdownOptions: {
                            detachDialog: true
                        },
                        save: false
                    }
                });

                this.children.indexedExtractions = new ControlGroup({
                    label: _('Indexed Extractions').t(),
                    controlType: 'SyntheticSelect',
                    tooltip: _('Use this setting only for structured data files whose type matches an entry in this list. Choose \'none\' for other types of data.').t(),
                    controlOptions: {
                        model: this.model.entity.entry.content,
                        modelAttribute: 'INDEXED_EXTRACTIONS',
                        items: [
                            {value: '', label: 'none'},
                            {value: 'json'},
                            {value: 'csv'},
                            {value: 'tsv'},
                            {value: 'psv'},
                            {value: 'w3c'}
                        ],
                        className: 'fieldIndexedExtractionsSelect',
                        toggleClassName: 'btn',
                        popdownOptions: {
                            attachDialogTo: 'body'
                        },
                        save: false
                    }
                });

                this.children.settingsPanels = new SettingsPanels({
                    collection: this.collection,
                    model: {
                        sourcetypeModel: this.model.entity,
                        application: this.model.application
                    },
                    enableAccordion: false,
                    advancedToggle: true,
                    updateSilent: false
                });

                $.when(
                    this.deferreds.entity
                ).done(function(){
                    this.setIndexedExtractions();
                    this.setEnabledState();
                }.bind(this));

                if (this.canUseApps) {
                    $.when(
                        this.deferreds.entity,
                        this.deferreds.appLocals
                    ).done(function(){
                        this.setAppItems();
                    }.bind(this));
                }

                $.when(
                    this.deferreds.entity,
                    this.deferreds.entities,
                    this.deferreds.sourcetypesCategories
                ).done(function(){
                    this.setCategoryItems();
                }.bind(this));

            },

            setEnabledState: function(){
                //TODO this is a bit of a hack (renderDfd and setTimeout) in order to get synthetic select to do the right thing.
                //TODO synthetic select control should allow disabled as option on instantiation, rather than depending on disable() method
                this.renderDfd.done(function(){
                    setTimeout(function(){
                        if(!this.model.entity.isNew() && !this.options.isClone){
                            this.children.appSelect.childList[0].disable();
                            this.children.entityName.childList[0].disable();
                        }else{
                            this.children.appSelect.childList[0].enable();
                            this.children.entityName.childList[0].enable();
                        }
                    }.bind(this),0);
                }.bind(this));
            },

            setIndexedExtractions: function(){
                this.children.indexedExtractions.childList[0].setValue(this.model.entity.entry.content.get('INDEXED_EXTRACTIONS'));
            },

            setCategoryItems: function(){
                var items = this.collection.sourcetypesCategories.getCategories();
                this.children.categorySelect.childList[0].setItems(items);
                this.children.categorySelect.childList[0].setValue(this.model.entity.entry.content.get('category') || _('Custom').t());
            },

            setAppItems: function(){
                var items = this.buildAppItems();
                this.children.appSelect.childList[0].setItems(items);
                this.children.appSelect.childList[0].setValue(this.model.entity.entry.acl.get('app') || 'search');
            },

            buildAppItems: function(){
                var items = [];
                this.collection.appLocals.each(function(app){
                    items.push( {
                        value: app.entry.get('name'),
                        label: app.entry.content.get('label') //do not translate app names
                    });
                });
                items.push( {value: 'system', label: 'system'} );
                return _.sortBy(items, function(item){
                    return (item.label||'').toLowerCase();
                });
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                var title = (this.options.isNew || this.options.isClone) ? _('Create Source Type').t() : (_('Edit Source Type: ').t() + ' ' + _.escape(this.model.entity.entry.get('name')));
                this.$(Modal.HEADER_TITLE_SELECTOR).html(title);
                this.$(Modal.BODY_SELECTOR).show();
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.$(Modal.BODY_FORM_SELECTOR).html(_(this.dialogFormBodyTemplate).template({}));
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-view-placeholder"));
                if (this.options.isNew || this.options.isClone) {
                    this.children.entityName.render().appendTo(this.$(".name-placeholder"));
                }
                this.children.entityDesc.render().appendTo(this.$(".desc-placeholder"));

                if (this.canUseApps) {
                    this.children.appSelect.render().appendTo(this.$(".appselect-placeholder"));
                }

                this.children.categorySelect.render().appendTo(this.$(".category-placeholder"));
                this.children.indexedExtractions.render().appendTo(this.$(".extractions-placeholder"));
                this.children.settingsPanels.render().appendTo(this.$(".settings-placeholder"));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                this.$('.accordion-group').addClass('active').find('.accordion-inner').show();
                this.$('.icon-accordion-toggle').addClass('icon-triangle-down-small');
                this.$('.accordion-group').last().find('.accordion-inner').hide();
                this.$('.icon-accordion-toggle').last().removeClass('icon-triangle-down-small');
                this.$('.copyToClipboardDialog textarea').removeProp('readonly');

                this.renderDfd.resolve();

                return this;
            },

            dialogFormBodyTemplate: '\
                <div class="flash-messages-view-placeholder"></div>\
                <div class="name-placeholder"></div>\
                <div class="desc-placeholder"></div>\
                <div class="appselect-placeholder"></div>\
                <div class="category-placeholder"></div>\
                <div class="extractions-placeholder"></div>\
                <div class="settings-placeholder"></div>\
            '
        });
    });
