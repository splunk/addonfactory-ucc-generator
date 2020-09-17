define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/Base',
        'models/managementconsole/Stanza',
        'collections/shared/FlashMessages',
        'views/managementconsole/configuration/group/AttributesList',
        'views/managementconsole/shared/controls/TypeaheadTextControl',
        'views/managementconsole/shared/controls/ObservableRadioControl',
        'views/shared/FlashMessagesLegacy',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/SyntheticCheckboxControl',
        'splunk.util'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseModel,
        StanzaModel,
        FlashMessagesCollection,
        AttributesList,
        TypeaheadTextControl,
        ObservableRadioControl,
        FlashMessagesView,
        Modal,
        ControlGroup,
        SyntheticCheckboxControl,
        splunkUtil
    ) {
        var FAILURE_HTML = _.escape(_('Your stanza could not be saved at this time. Please try again later.').t()),
            STANZA_NAME_MODIFIED_ERROR = _.escape(_('Stanza name cannot be modified. Please change the stanza name back to its original state:').t()),
            UNRECOGNIZED_MESSAGE_HTMLS = {
                name: _.escape(_('Unrecognized stanza name: %s').t()),
                key: _.escape(_('Unrecognized attribute key: %s').t())
            },
            UNRECOGNIZED_MESSAGE_HTMLS_PLURAL = {
                name: _.escape(_('Unrecognized stanza names: %s').t()),
                key: _.escape(_('Unrecognized attribute keys: %s').t())
            },
            VIEW = {
                ATTRIBUTES: 'attributes',
                TEXT: 'text'
            },
            INITIAL_VIEW = VIEW.ATTRIBUTES,
            PREVIEW_BUTTON = '<a href="#" class="btn modal-btn-preview pull-right">' + _('Preview').t() + '</a>';

        return Modal.extend({
            moduleId: module.id,

            initialize: function (options) {
                options = _.defaults(options, {
                    keyboard: false,
                    backdrop: 'static'
                });

                Modal.prototype.initialize.call(this, options);
                this.collection = this.collection || {};

                this.collection.flashMessages = new FlashMessagesCollection();

                this._isCreate = _.isUndefined(this.model.stanza);
                this.model.stanza = this._isCreate ? this._createInitializedNewStanzaModel() : this.model.stanza;
                this.model.local = this._createInitializedLocalModel();
                this.model._state = new BaseModel({
                    currentView: INITIAL_VIEW,
                    requestedView: INITIAL_VIEW,
                    importText: '',
                    canRenderTypeaheads: false,
                    hasParsingError: false,
                    stanzaWarnings: true
                });

                this.children.flashMessages = new FlashMessagesView({
                    collection: this.collection.flashMessages
                });

                this.compiledStanzaNameError = _.template(this._stanzaNameEditErrorTemplate);

                if (this.model.stanza.hasDefaults()) {
                    this.$el.addClass('modal-wide');
                }

                this.children.stanzaName = new ControlGroup({
                    className: 'stanza-name conf-type',
                    controlTypes: {
                        TypeaheadText: TypeaheadTextControl
                    },
                    controlType: 'TypeaheadText',
                    controlOptions: {
                        modelAttribute: 'name',
                        model: this.model.stanza.entry,
                        waitModel: this.model._state,
                        waitModelAttribute: 'canRenderTypeaheads',
                        waitModelEvent: 'rerenderTypeaheads',
                        typeaheadView: {
                            extraWidth: 30
                        },
                        clearOnEsc: false
                    },
                    controlClass: 'controls-block',
                    label: _('Stanza Name').t(),
                    enabled: this._isCreate
                });

                this.children.stanzaAttrs = new AttributesList({
                        modelAttribute: 'attrsList',
                        model: this.model.local,
                        defaultsModel: this.model.stanza.hasDefaults() ? this.model.stanza.entry.content : null,
                        defaultsAttribute: this.model.stanza.hasDefaults() ? 'default' : null,
                        merger: StanzaModel.getMergedDefaultLocal,
                        typeaheadWaitModel: this.model._state,
                        typeaheadWaitModelAttribute: 'canRenderTypeaheads',
                        typeaheadWaitModelEvent: 'rerenderTypeaheads'
                    });

                if (!this.model.stanza.hasDefaults()) {
                    // Initialize the "import" scenario views
                    this.children.importSwitcher = new ControlGroup({
                        className: 'import-switcher',
                        controlTypes: {
                            ObservableRadioControl: ObservableRadioControl
                        },
                        controlType: 'ObservableRadioControl',
                        controlOptions: {
                            modelAttribute: 'currentView',
                            changeEvent: 'switcherClicked',
                            model: this.model._state,
                            elastic: true,
                            items: [
                                {label: _("Attributes").t(), value: VIEW.ATTRIBUTES},
                                {label: _("Text").t(), value: VIEW.TEXT}
                            ]
                        },
                        controlClass: 'controls-block'
                    });

                    this.children.importText = new ControlGroup({
                        className: 'text-area-control',
                        controlType: 'Textarea',
                        controlOptions: {
                            modelAttribute: 'importText',
                            model: this.model._state,
                            placeholder: _('Insert full stanza as text').t()
                        },
                        controlClass: 'controls-block',
                        label: _('Stanza text').t()
                    });

                    this.listenTo(this.model._state, 'change:currentView', this.changeCurrentView);
                    this.listenTo(this.model._state, 'switcherClicked', this.changeRequestedView);
                }
                
                this.children.warnings = new SyntheticCheckboxControl({
                    className: SyntheticCheckboxControl.prototype.className + ' pull-right',
                    model: this.model._state,
                    modelAttribute: 'stanzaWarnings',
                    label: _('Check for warnings').t()
                });

                this.listenTo(this.model._state, 'change:hasParsingError', this.debouncedRender);

                this.listenTo(this.model.confSpec, 'sync', this.updateStanzaSources);
                this.updateStanzaSources();

                this.listenTo(this.model.confSpec, 'sync', this.updateDescription);
                this.listenTo(this.model.stanza.entry, 'change:name', this.updateDescription);
                this.updateDescription();

                this.listenTo(this.model.confStanzaSpec, 'sync change:settings', this.updateKeyTypeaheads);
                this.listenTo(this.model.stanza.entry, 'change:name', this.updateConfStanzaSpec);
                this.updateConfStanzaSpec();
                this.updateKeyTypeaheads();

                // Any time we update the flash messages, the underlying typeahead
                // dropdowns positions need to be recomputed.
                this.listenTo(this.collection.flashMessages, 'reset', _.debounce(function() {
                    this.model._state.trigger('rerenderTypeaheads');
                }.bind(this), 100));
                
                this._resetFlashMessages([]);
            },

            events: {
                'click .btn-primary': function (e) {
                    e.preventDefault();
                    this._resetFlashMessages([]);

                    var error = null,
                        saveStanza = function() {
                            var saveDfd = this.model.stanza.save(
                                {}, 
                                {
                                    warnings: this.model._state.get('stanzaWarnings') 
                                }
                            );

                            saveDfd.done(function() {
                                this.hide();
                                this.collection.stanzas.fetch().done(function () {
                                    // Causes list of types on to be re-populated
                                    // since udpates to stanzas can have such a side-effect
                                    this.model.configuration.fetch();
                                }.bind(this));
                            }.bind(this));

                            saveDfd.fail(this._failStanza.bind(this));

                        }.bind(this);

                    error = this.model.stanza.setLocalFromList(
                        this.model.local.get('attrsList')
                    );

                    if (this.model._state.get('currentView') === VIEW.ATTRIBUTES) {
                        if (error) {
                            this._resetFlashMessages([{
                                type: 'error',
                                html: error
                            }]);
                            return;
                        }
                        saveStanza();
                    } else { // text view
                        this.model.stanzasMeta.parseTextToAttr(this.model._state.get('importText')).done(function (response) {
                            if (!this._isCreate && response.name !== this.model.stanza.entry.get('name')) {
                                this._resetFlashMessages([{
                                    type: 'error',
                                    html: this.compiledStanzaNameError({stanzaName: this.model.stanza.entry.get('name')})
                                }]);
                                return;
                            }

                            this.model.stanza.entry.set('name', response.name);
                            this.model.stanza.entry.content.set('local', response.local);
                            saveStanza();
                        }.bind(this)).fail(this._failStanza.bind(this));
                    }
                },

                'click .modal-btn-back': function (e) {
                    e.preventDefault();
                    this.hide();
                },

                'hidden': function (e) {
                    if (this.$el.is($(e.target))) {
                        this.model._state.set('canRenderTypeaheads', false);
                        this.remove();
                    }
                },

                'shown': function (e) {
                    this.model._state.set('canRenderTypeaheads', true);
                }
            },

            changeCurrentView: function() {
                // Extremely important that this is not debouncedRender;
                // The typeahead rendering is dependent on the actual computed screen position
                // Of its DOM anchors
                this.render();
                this.model._state.set('canRenderTypeaheads', this.model._state.get('currentView') === VIEW.ATTRIBUTES);
            },

            render: function () {
                this.el.innerHTML = Modal.TEMPLATE;
                this.$(Modal.HEADER_TITLE_SELECTOR).html(this._isCreate ? _("Create a new stanza").t() : _("Edit stanza").t());
                this.$(Modal.BODY_SELECTOR).append(this.children.flashMessages.render().$el);

                if (this.children.importSwitcher) {
                    this.$(Modal.BODY_SELECTOR).append(this.importSwitcherTemplate);
                    this.$('.import-switch-placeholder').append(this.children.importSwitcher.render().$el);
                    this.$('.attribute-view-title').append(this.children.stanzaName.render().$el);
                    this.$('.attribute-view-body').append(this.children.stanzaAttrs.render().$el);
                    this.$('.text-view-placeholder').append(this.children.importText.render().$el);

                    this.$('.attribute-view-placeholder').show();
                    this.$('.text-view-placeholder').hide();
                } else {
                    this.$(Modal.BODY_SELECTOR).append(this.children.stanzaName.render().$el);
                    this.$(Modal.BODY_SELECTOR).append(this.children.stanzaAttrs.render().$el);
                }

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
                this.$(Modal.FOOTER_SELECTOR).append(this.children.warnings.render().$el);

                if (!this.model._state.get('hasParsingError')) {
                    if (this.model._state.get('currentView') === VIEW.ATTRIBUTES) {
                        this.$('.text-view-placeholder').hide();
                        this.$('.attribute-view-placeholder').show();
                    } else {
                        this.$('.attribute-view-placeholder').hide();
                        this.$('.text-view-placeholder').show();
                    }
                } else {
                    this.$('.attribute-view-placeholder').hide();
                    this.$('.text-view-placeholder').show();
                }
                
                return this;
            },

            remove: function() {
                this._getStanzaNameTextControl().remove();
                this.model.confStanzaSpec.fetchData.unset('stanza');
                Modal.prototype.remove.apply(this, arguments);
            },

            importSwitcherTemplate: '<div class="import-switch-placeholder"></div> \
            <div class="attribute-view-placeholder"> \
                <div class="attribute-view-title"></div> \
                <div class="attribute-view-body"></div> \
            </div> \
            <div class="text-view-placeholder"></div>',

            _stanzaNameEditErrorTemplate: STANZA_NAME_MODIFIED_ERROR + ' <%- stanzaName %>.',

            changeRequestedView: function(requestedView) {
                if (requestedView === this.model._state.get('currentView')) {
                    return;
                }

                if (requestedView === VIEW.ATTRIBUTES) {
                    this.model.stanzasMeta.parseTextToAttr(this.model._state.get('importText')).done(function (response) {
                        if (!this._isCreate && response.name !== this.model.stanza.entry.get('name')) {
                            this._resetFlashMessages([{
                                type: 'error',
                                html: this.compiledStanzaNameError({stanzaName: this.model.stanza.entry.get('name')})
                            }]);
                            this.model._state.set('hasParsingError', true);
                        } else {
                            this.model._state.set('hasParsingError', false);
                            this.model.stanza.entry.set('name', response.name);
                            this.model.local.set('attrsList', response.local);
                            this._resetFlashMessages([]);
                            this._getImportSwitcherControl().setValue(VIEW.ATTRIBUTES, true);
                        }
                    }.bind(this)).fail(function (error) {
                        this.model._state.set('hasParsingError', true);
                        this._failStanza(error);
                    }.bind(this));
                } else { // requestedView === VIEW.TEXT
                    this.model.stanzasMeta.parseAttrToText(this.model.stanza.entry.get('name'), this.model.local.get('attrsList')).done(function (response) {
                        this.model._state.set('importText', response);
                        this._resetFlashMessages([]);
                        this._getImportSwitcherControl().setValue(VIEW.TEXT, true);
                    }.bind(this));
                }
            },

            updateStanzaSources: function () {
                this._getStanzaNameTextControl().setSources(this.model.confSpec.getStanzaNames());
            },

            updateDescription: function () {
                var stanzas = this.model.confSpec.get('stanzas') || [],
                    currentName = this.model.stanza.entry.get('name') || '',
                    stanzaObj = null,
                    helpText = '';

                if (!_.isEmpty(stanzas) && $.trim(currentName) !== '' && this._isCreate) {
                    stanzaObj = this._findStanzaObject(currentName);

                    if (stanzaObj) {
                        helpText = _('Example usage').t() + ': ' + stanzaObj.rawStanza;
                    }
                }

                this._getStanzaNameTextControl().setHelpText(helpText);
            },

            updateConfStanzaSpec: function () {
                var stanzaObj = this._findStanzaObject(this.model.stanza.entry.get('name')),
                    stanzaName = (stanzaObj || {}).stanza || '';

                if ($.trim(stanzaName)) {
                    this.model.confStanzaSpec.fetchData.set('stanza', stanzaName);
                } else {
                    this.model.confStanzaSpec.set('settings', []);
                }
            },

            updateKeyTypeaheads: function () {
                var autocompleteKeys = this.model.confStanzaSpec.getValidKeys(),
                    placeholders = this.model.confStanzaSpec.getPlaceholders();

                // If there are no autocomplete keys returned by default, then this might
                // be a user-defined stanza, which should have "default" keys as part of the 
                // autocomplete suggestions. 
                // Check to see if this is a known stanza as well; in which case autocomplete keys
                // should be taken as truth.
                if (autocompleteKeys.length === 0 &&
                    !this.model.confSpec.isKnownStanza(this.model.stanza.entry.get('name'))) {

                    autocompleteKeys = this.model.confDefaultSpec.getValidKeys();
                    placeholders = this.model.confDefaultSpec.getPlaceholders();
                }

                this.children.stanzaAttrs.setPlaceholders(
                    placeholders
                );
                this.children.stanzaAttrs.setKeyAutocomplete(
                    autocompleteKeys
                );
            },

            _findStanzaObject: function (stanzaName) {
                return this.model.confSpec.findStanzaObject(stanzaName);
            },

            _getStanzaNameTextControl: function () {
                return this._getControl('stanzaName');
            },

            _getImportSwitcherControl: function() {
                return this._getControl('importSwitcher');
            },

            _getControl: function(childName) {
                return this.children[childName].getAllControls()[0];
            },

            _createInitializedNewStanzaModel: function () {
                var stanzaModel = new StanzaModel(),
                    bundle = this.model.configuration.getBundleName(),
                    type = this.collection.stanzas.fetchData.get('type'),
                    internalTypes = this.model.stanzasMeta.entry.content.get('internalTypes'),
                    typeObj = _.findWhere(internalTypes, {type: type}),
                    fileExt = typeObj && typeObj.fileExt;


                stanzaModel.entry.content.set({
                    bundle: bundle,
                    type: type
                });

                if (!_.isUndefined(fileExt)) {
                    stanzaModel.entry.content.set('fileExt', fileExt);
                }

                return stanzaModel;
            },

            _createInitializedLocalModel: function () {
                return new BaseModel({
                    attrsList: this.model.stanza.entry.content.get('local') || []
                });
            },

            _failStanza: function (error) {
                var errorObj,
                    errorMsgs,
                    messages = [],
                    unrecognized = {
                        key: [],
                        name: []    
                    };

                try {
                    errorObj = JSON.parse(error.responseText);
                    errorMsgs = errorObj.error.message;
                } catch (e) {
                }
                
                if (_.isObject(errorMsgs)) {
                    _.each(errorMsgs.warnings, function(warning) {
                       unrecognized[warning.type].push($.trim(warning.name)); 
                    });
                    
                    _.each(_.keys(unrecognized), function(type) {
                        var unrecognizedList = unrecognized[type],
                            messageHtml = (unrecognizedList.length === 1 ?
                                UNRECOGNIZED_MESSAGE_HTMLS :
                                UNRECOGNIZED_MESSAGE_HTMLS_PLURAL)[type];
                             
                        if (unrecognizedList.length > 0) {
                            messages.push({
                                type: 'warning',
                                html: splunkUtil.sprintf(
                                    messageHtml,
                                    unrecognizedList.join(', ')
                                )
                            });
                        }
                    });
                }

                if (_.isString(errorMsgs)) {
                    messages = [{ type: 'error', html: errorMsgs || FAILURE_HTML }];
                }
                
                if (messages.length === 0) {
                    messages = [{
                        type: 'error',
                        html: FAILURE_HTML
                    }];
                }
                
                this._resetFlashMessages(messages);
            },

            _resetFlashMessages: function (messages) {
                var defaultMessages = [];
                if (this.options.warningMessage) {
                    defaultMessages = [
                        {type: 'warning', html: this.options.warningMessage}
                    ];
                }

                this.collection.flashMessages.reset(defaultMessages.concat(messages));
            }
        });
    }
);