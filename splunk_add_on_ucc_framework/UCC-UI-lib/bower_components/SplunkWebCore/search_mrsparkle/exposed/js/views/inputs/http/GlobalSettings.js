/**
 * @author lbudchenko
 * @date 4/14/15
 *
 * Popup dialog for editing global setting for HTTP Inputs / tokens
 *
 */
define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/controls/ControlGroup',
    'views/shared/knowledgeobjects/SourcetypeMenu',
    'views/shared/FlashMessages',
    'views/shared/Modal'
],
    function(
        $,
        _,
        module,
        BaseView,
        ControlGroup,
        SourcetypeMenu,
        FlashMessagesView,
        Modal
        ){
        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME + ' edit-dialog-modal modal-wide',

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    this.model.settings.transposeToRest();
                    var saveDfd = this.model.settings.save();
                    if (saveDfd) {
                        saveDfd.done(_(function() {
                            this.model.controller.trigger('globalSaved');
                            this.hide();
                        }).bind(this));
                    }
                }
            }),

            initialize: function(options) {
                Modal.prototype.initialize.call(this, options);

                this.supportsOutputGroups = this.model.user.supportsOutputGroups ();

                this.children.flashMessages = new FlashMessagesView({
                    model: {
                        input: this.model.settings
                    },
                    helperOptions: {
                        removeServerPrefix: true
                    }
                });

                this.children.controlSwitch = new ControlGroup({
                    className: 'control-switch control-group',
                    controlType: 'SyntheticRadio',
                    controlClass: 'controls-halfblock',
                    controlOptions: {
                        modelAttribute: 'ui.disabled',
                        model: this.model.settings,
                        items: [
                            {
                                label: _('Enabled').t(),
                                value: '0'
                            },
                            {
                                label: _('Disabled').t(),
                                value: '1'
                            }
                        ],
                        save: false
                    },
                    label: _('All Tokens').t()
                });

                var _sourcetypeMenuControl = new SourcetypeMenu({
                    model: this.model.settings,
                    modelAttribute: 'ui.sourcetype',
                    collection: this.collection,
                    addNewSourcetypeLink: false,
                    addLabel: false,
                    attachToModal: true
                });
                this.children.sourcetype = new ControlGroup({
                    controls: [_sourcetypeMenuControl],
                    controlClass: 'controls-halfblock',
                    label: _('Default Source Type').t(),
                    required: false
                });

                if (this.supportsOutputGroups) {
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
                            model: this.model.settings,
                            items: items,
                            className: 'btn-group view-count',
                            menuWidth: 'wide',
                            toggleClassName: 'btn',
                            popdownOptions: {
                                detachDialog: true
                            }
                        },
                        label: _('Default Output Group').t()
                    });
                }

                this.children.useds = new ControlGroup({
                    className: 'http-useds control-group',
                    controlType: 'SyntheticCheckbox',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.useDeploymentServer',
                        model: this.model.settings,
                        save: false
                    },
                    label:   _('Use Deployment Server').t(),
                    enabled: !this.model.serverInfo.isCloud()
                });

                this.children.enableSSL = new ControlGroup({
                    className: 'http-enablessl control-group',
                    controlType: 'SyntheticCheckbox',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.enableSSL',
                        model: this.model.settings,
                        save: false
                    },
                    label:   _('Enable SSL').t(),
                    enabled: !this.model.serverInfo.isCloud()
                });

                this.children.port = new ControlGroup({
                    className: 'http-port control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.port',
                        model: this.model.settings,
                        save: false,
                        placeholder: _('optional').t()
                    },
                    label:   _('HTTP Port Number').t(),
                    tooltip: _('Dedicated port for HTTP Input.').t(),
                    enabled: !this.model.serverInfo.isCloud()
                });

                this.updateIndexControl();
            },

            updateIndexControl: function() {
                var indexes = [{label: _('Default').t(), value:' '}];
                this.collection.indexes.each(function(model) {
                    var indexName = model.entry.get('name');
                    indexes.push({label: indexName, value:indexName});
                }.bind(this));

                this.children.index = new ControlGroup({
                    className: 'index control-group',
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'ui.index',
                        model: this.model.settings,
                        items: indexes,
                        className: 'btn-group view-count',
                        menuWidth: 'narrow',
                        toggleClassName: 'btn',
                        save: false,
                        popdownOptions: {
                            detachDialog: true
                        }
                    },
                    label: _('Default Index').t()
                });
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Edit Global Settings').t());
                this.$(Modal.BODY_SELECTOR).show();
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.$(Modal.BODY_FORM_SELECTOR).html(this.compiledTemplate({}));

                this.updateIndexControl();
                var $form = this.$('.settingsform_wrapper');
                $form.empty();
                this.children.flashMessages.render().appendTo($form);
                this.children.controlSwitch.render().appendTo($form);
                this.children.sourcetype.render().appendTo($form);
                this.children.index.render().appendTo($form);
                if (this.supportsOutputGroups) {
                    this.children.outputs.render().appendTo($form);
                }
                this.children.useds.render().appendTo($form);
                this.children.enableSSL.render().appendTo($form);
                this.children.port.render().appendTo($form);

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
            },

            template: '<div class="settingsform_wrapper form-horizontal"></div>'
        });
    });


