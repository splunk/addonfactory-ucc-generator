/**
 * @author ahebert
 * @date 3/15/15
 *
 * Dialog for the prebuilt panels manager page
 * - new
 * - edit
 * - clone
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/shared/FlashMessages',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/dashboard/editor/XMLEditor',
        'dashboard/DashboardParser',
        'splunk.util'
    ],

    function(
        $,
        _,
        Backbone,
        module,
        FlashMessages,
        Modal,
        ControlGroup,
        XMLEditor,
        DashboardParser,
        splunkUtils
    ) {
        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME + ' edit-dialog-modal modal-wide',

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    var saveOptions = {};
                    if (this.model.entity.isNew() || this.options.isClone){
                        var app;
                        // In Splunk Enterprise, create and clone in app selected in the appSelect control.
                        if (this.canUseApps) {
                            app = this.model.entity.entry.acl.get('app');
                        } else {
                            // In Splunk Light, create the panel is the current namespace if defined, if not, default to 'search'.
                            // In Splunk Light, clone the panel in the same app context as the original.
                            if (this.model.entity.isNew()) {
                                app = this.options.namespaceFilterCandidate ? this.options.namespaceFilterCandidate : "search";
                            } else { // this.options.isClone = true
                                app = this.model.entity.entry.acl.get('app');
                            }
                        }
                        saveOptions.data = {
                            app: app,
                            owner: this.model.user.entry.get('name'),
                            'eai:data': this.children.editorView.getEditorValue()
                        };
                    } else {
                        this.model.entity.entry.content.set('eai:data', this.children.editorView.getEditorValue());
                    }

                    if (_.isUndefined(this.model.entity.entry.get('name'))) {
                        this.model.entity.entry.set({name:''}, {silent:true});
                    }

                    // ahebert TODO: to remove when epic/dmc-health-check is pushed to develop
                    this.model.entity.entry.content.set('name', this.model.entity.entry.get('name'));

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
                    e.preventDefault();
                }
            }),

            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
                options = options || {};
                _(options).defaults({isNew:true});

                this.renderDfd = new $.Deferred();
                this.deferreds = options.deferreds;

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
                    label: _('Prebuilt panel ID').t()
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

                this.model.editor = new Backbone.Model();
                this.children.editorView = new XMLEditor({
                    model: { 
                        application: this.model.application,
                        editor: this.model.editor
                    },
                    readOnly: false,
                    autoAdjustHeight: false,
                    fixedHeight: 450,
                    showMessages: false
                });
                this.panelParser = DashboardParser.getDefault();
                this.listenTo(this.model.editor, 'change:code', _.debounce(this.validateXML, 500));
                this.model.editor.set('code', this.model.entity.entry.content.get('eai:data') || "<panel></panel>");

                $.when(this.deferreds.entity).done(function(){
                    this.setEnabledState();
                }.bind(this));

                this.canUseApps = this.model.user.canUseApps();
                if (this.canUseApps) {
                    $.when(this.deferreds.entity, this.deferreds.appLocals).done(function(){
                        this.setAppItems();
                    }.bind(this));
                }
            },

            validateXML: function() {
                var xml = this.children.editorView.getEditorValue();
                var annotations = [];
                var parser = this.panelParser;
                var result = parser.validatePanel(xml);
                this.model.editor.set('parseResults', result);
                this.children.editorView.applyAnnotations();
                return annotations;
            },

            /**
             * Inspired from views/sourcetypes/EditDialog.js
             */
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

            /**
             * Inspired from views/sourcetypes/EditDialog.js
             */
            setAppItems: function(){
                var items = this.buildAppItems();
                this.children.appSelect.childList[0].setItems(items);
                this.children.appSelect.childList[0].setValue(this.model.entity.entry.acl.get('app') || 'search');
            },

            /**
             * Inspired from views/sourcetypes/EditDialog.js
             */
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
                var title = "";
                if (this.options.isClone) {
                    title = splunkUtils.sprintf(_('Clone from %s').t(), _.escape(this.model.entity.entry.get('name')));
                    // Reset entity name by default.
                    // For the cloned entity, the user should type a different name than the original entity.
                    this.model.entity.entry.set('name', '');
                } else if (this.options.isNew) {
                    title = _('Create prebuilt panel').t();
                } else {
                    title = splunkUtils.sprintf(_('Edit %s').t(), _.escape(this.model.entity.entry.get('name')));
                }

                this.$(Modal.HEADER_TITLE_SELECTOR).html(title);
                this.$(Modal.BODY_SELECTOR).show();
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.$(Modal.BODY_FORM_SELECTOR).html(_(this.dialogFormBodyTemplate).template());

                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-view-placeholder"));

                if (this.options.isNew || this.options.isClone) {
                    this.children.entityName.render().appendTo(this.$(".name-placeholder"));
                }
                if (this.canUseApps) {
                    this.children.appSelect.render().appendTo(this.$(".appselect-placeholder"));
                }

                this.children.editorView.render().appendTo(this.$(".xmleditor-placeholder"));

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                this.renderDfd.resolve();

                return this;
            },

            dialogFormBodyTemplate: '\
                <div class="flash-messages-view-placeholder"></div>\
                <div class="name-placeholder"></div>\
                <div class="appselect-placeholder"></div>\
                <div class="xmleditor-placeholder">\
                    <div class="control-group shared-controls-controlgroup"><label class="control-label"><%= _("Prebuilt panel XML").t() %></label></div>\
                </div>\
            '
        });
    });
