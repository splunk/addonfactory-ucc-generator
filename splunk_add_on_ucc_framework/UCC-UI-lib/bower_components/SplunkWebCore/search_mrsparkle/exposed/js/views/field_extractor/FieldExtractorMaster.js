/**
 * Master View that is responsible for loading Field Extractor page components,
 * depending on whatever automatic wizard step/manual mode the page is in.
 * Instantiated by FieldExtractorRouter.
 */
define([
            'jquery',
            'underscore',
            'module',
            'models/Base',
            'models/services/data/props/Extraction',
            'models/services/configs/Transforms',
            'models/knowledgeobjects/Sourcetype',
            'models/search/Job',
            'collections/Base',
            'collections/services/authorization/Roles',
            'views/Base',
            './ManualExtractionEditor',
            './ExistingExtractionsList',
            './MasterEventViewer',
            './MasterEventEditor',
            './MasterEventDelimEditor',
            './ExtractionViewer',
            './SaveExtractionsView',
            './CounterExampleEditor',
            './ConfirmationView',
            'views/shared/knowledgeobjects/SourcetypeMenu',
            'views/shared/dataenrichment/preview/RexPreviewViewStack',
            'views/shared/dataenrichment/preview/PreviewJobController',
            'views/shared/dataenrichment/preview/RegexGeneratorController',
            'views/shared/controls/ControlGroup',
            'views/shared/controls/SyntheticSelectControl',
            'views/shared/controls/SyntheticRadioControl',
            'views/shared/controls/TextControl',
            'views/shared/controls/StepWizardControl',
            'views/shared/Sidebar',
            'views/shared/FlashMessages',
            'splunk.util',
            'util/field_extractor_utils',
            'util/splunkd_utils',
            'util/string_utils',
            'uri/route',
            'views/shared/pcss/data-enrichment.pcss',
            './FieldExtractorMaster.pcss',
            'bootstrap.tooltip'  // package without return type
        ],
        function(
            $,
            _,
            module,
            BaseModel,
            Extraction,
            TransformModel,
            Sourcetype,
            Job,
            BaseCollection,
            RolesCollection,
            BaseView,
            ManualExtractionEditor,
            ExistingExtractionsList,
            MasterEventViewer,
            MasterEventEditor,
            MasterEventDelimEditor,
            ExtractionViewer,
            SaveExtractionsView,
            CounterExampleEditor,
            ConfirmationView,
            SourcetypeMenu,
            RexPreviewViewStack,
            PreviewJobController,
            RegexGeneratorController,
            ControlGroup,
            SyntheticSelectControl,
            SyntheticRadioControl,
            TextControl,
            StepWizardControl,
            Sidebar,
            FlashMessages,
            splunkUtils,
            fieldExtractorUtils,
            splunkdUtils,
            stringUtils,
            route,
            cssDataEnrichment,
            css
            /* undefined */
        ) {

    return BaseView.extend({

        moduleId: module.id,

        className: 'field-extractor-master',

        SIDEBAR_WIDTH: 350,
        REGEX_MODE: 'regex',
        DELIM_MODE: 'delim',

        events: {
            'click .view-extractions-button:not(.disabled)' : function(e) {
                // Open sidebar that displays existing saved extractions.
                e.preventDefault();
                this._createSidebar();
            },
            'click .content-header .manual-mode-button': function(e) {
                // Enter manual editor from wizard/automatic mode.
                e.preventDefault();
                this.setManualMode();
            },
            'click .btn-regex': function(e) {
                e.preventDefault();
                this.setMethod(this.REGEX_MODE);
                this.children.masterEventViewer.render();
                this._refreshExistingExtractionsButton();
                this.$('.view-all-extractions-button-container').show();
            },
            'click .btn-delim': function(e) {
                e.preventDefault();
                this.setMethod(this.DELIM_MODE);
                this._hideExistingExtractions();
                this.children.masterEventViewer.render();
                this.$('.view-all-extractions-button-container').hide();
            },
            'click .return-automatic-mode': function(e) {
                // Return to wizard/automatic mode from manual editor.
                // This button is only displayed if the user has not manually edited the regex.
                e.preventDefault();
                this.cleanupManualMode();
            },
            'click .return-manual-page': function(e) {
                // Return to manual editor from SaveExtractionsView - user is bailing out from saving the extraction.
                e.preventDefault();
                // In case regex has not been manually edited,
                // allow user to return the most recently visited wizard step in automatic mode.
                this.model.state.set({ mode: this.lastAutomaticMode });
                this._setupManualView();
                this.$('.return-manual-page').hide();
                this.$('.manual-save-button').hide();
            },
            'click .content-header .preview-in-search-link': function(e) {
                e.preventDefault();
                if(!$(e.currentTarget).hasClass('disabled')) {
                    this._handlePreviewInSearch();
                }
            },
            'click .manual-save-button': function(e) {
                e.preventDefault();
                this._validateAndSaveExtraction();
            },
            'keypress' : function(event) {
                var ENTER_KEY = 13;
                if (event.which === ENTER_KEY) {
                    var source = this.$('.source-wrapper .control input').val();
                    if (source) {
                        this.model.state.set({ source: source });
                    }
                }
            }
        },
        /**
         * @constructor
         *
         * @param options {Object} {
         *     sourcetype {String} the name of the current sourcetype
         *     sid (optional) the sid of an existing search job whose results we want to extract fields from
         *     model: {
         *         application <models.Application>
         *         user <models.services.authentication.Users>
         *         extraction <models.services.data.props.Extraction>
         *     }
         *     collection: {
         *         extractions <collections.services.data.props.Extractions>
         *         sourcetypes <collections.knowledgeobjects.Sourcetypes>
         *         roles <collections.services.authorization.Roles>
         *     }
         * }
         *
         */
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.environment = this.model.serverInfo.isLite() ? 'Light' : 'Enterprise';

            this.model.state = new BaseModel({
                type: 'sourcetype',
                source: '',
                sourcetype: this.options.sourcetype,
                sampleSize: { head: 1000 },
                inputField: '_raw',
                regex: this.model.extraction.isNew() ? '' : this.model.extraction.entry.content.get('value'),
                interactiveMode: fieldExtractorUtils.INTERACTION_MODE,
                filter: '',
                clustering: fieldExtractorUtils.CLUSTERING_NONE,
                eventsView: fieldExtractorUtils.VIEW_ALL_EVENTS,
                mode: fieldExtractorUtils.SELECT_SAMPLE_MODE,
                masterEvent: this.options.masterEvent,
                examples: [],
                counterExamples: [],
                sampleEvents: [],
                errorState: false, //used to check server validation errors
                regexGenErrorState: false, //used for regex generator promise errors
                useSearchFilter: true,
                hasSid: false,
                existingExtractions: [],
                existingSampleExtractions: []
            });
            this.model.searchJob = new Job({}, { delay: 1000, processKeepAlive: true });
            if (this.options.sid) {
                this.model.state.set({type: 'sourcetype'});
                this.model.state.set({hasSid: true});
            }
            this.model.transform = new TransformModel();
            if (this.options.sourcetype) {
                this.model.state.set({type: 'sourcetype'});
            }
            if (this.options.existingExtractions) {
                this.model.state.set({type: 'sourcetype'});
                this.model.state.set({existingExtractions: this.options.existingExtractions});
                this._tryToShowExistingExtractions();
            }

            this.collection.wizardSteps = new BaseCollection([
                {
                    value: fieldExtractorUtils.SELECT_SAMPLE_MODE,
                    label: _('Select sample').t(),
                    nextLabel: _('Next').t(),
                    showPreviousButton: false
                },
                {
                    value: fieldExtractorUtils.SELECT_METHOD_MODE,
                    label: _('Select method').t(),
                    enabled: !!this.model.state.get('masterEvent'),
                    nextLabel: _('Next').t()
                },
                {
                    value: fieldExtractorUtils.SELECT_DELIM_MODE,
                    label: _('Rename fields').t(),
                    enabled: (this.model.state.get('method') === this.DELIM_MODE),
                    visible: false,
                    nextLabel: _('Next').t()
                },
                {
                    value: fieldExtractorUtils.SELECT_FIELDS_MODE,
                    label: _('Select fields').t(),
                    enabled: (this.model.state.get('method') === this.REGEX_MODE),
                    nextLabel: _('Next').t()
                },
                {
                    value: fieldExtractorUtils.VALIDATE_FIELDS_MODE,
                    label: _('Validate').t(),
                    enabled: ((this.model.state.get('examples') || []).length > 0),
                    visible: false,
                    nextLabel: _('Next').t()
                },
                {
                    value: fieldExtractorUtils.SAVE_FIELDS_MODE,
                    label: _('Save').t(),
                    enabled: (((this.model.state.get('examples') || []).length > 0) ||
                              (_(this.model.state.get('delimFieldNames')).keys().length > 0)),
                    nextLabel: _('Finish').t()
                },
                {
                    value: fieldExtractorUtils.CONFIRMATION_MODE,
                    label: '',
                    showPreviousButton: false,
                    showNextButton: false
                }
            ]);
            // If certain values are pre-populated in the state model, make sure to remove the skipped steps from
            // the wizard and set the correct mode in the state model.
            if(this.model.state.has('sourcetype')) {
                // Update the existing extractions if the sourcetype is already set.
                this._refreshExtractions();
            }
            if(this.model.state.has('masterEvent')) {
                this.collection.wizardSteps.remove(
                    this.collection.wizardSteps.findWhere({ value: fieldExtractorUtils.SELECT_SAMPLE_MODE })
                );
                this.collection.wizardSteps
                    .findWhere({ value: fieldExtractorUtils.SELECT_METHOD_MODE })
                    .set({ showPreviousButton: false });
                this.model.state.set({ mode: fieldExtractorUtils.SELECT_METHOD_MODE });
                // Update the existing extractions if the masterEvent is already set.
                this._refreshExtractions();
            }

            this._createComponents();
            this.listenTo(this.model.searchJob, 'serverValidated', _.bind(function(noValidationErrors, searchJobContext, errorMessages) {
                // Set state model's error state attribute if search job returns incomplete and with (and creates page-wide flash message)
                if(!noValidationErrors){
                    this.model.state.set('errorState', true);
                }else{
                    this.model.state.set('errorState', false);
                }
            }, this));
            this.listenTo(this.model.state, 'change:type', function() {
                this.model.state.set('masterEvent', '');
                this._refreshExtractionViews();
            });
            this.listenTo(this.model.state, 'change:source', function() {
                // Refresh the existing extracted fields when the source is updated.
                this._forceRefreshExtractions().done(_(function() {
                    this.children.regexGenerationController.reset();
                    this._syncStateModelFromController();
                    this._refreshExtractionViews();
                }).bind(this));
            });
            this.listenTo(this.model.state, 'change:sourcetype', function() {
                // Refresh the existing extracted fields when the sourcetype is updated.
                this._forceRefreshExtractions().done(_(function() {
                    // Clear any previous extraction information when the sourcetype changes (SPL-89136)
                    this.children.regexGenerationController.reset();
                    this._syncStateModelFromController();
                    this._refreshExtractionViews();
                }).bind(this));
            });
            this.listenTo(this.model.state, 'change:masterEvent', function() {
                this.collection.wizardSteps
                    .findWhere({ value: fieldExtractorUtils.SELECT_METHOD_MODE })
                    .set({ enabled: !!this.model.state.get('masterEvent') });
                if (this.model.state.get('masterEvent')) {
                    this._refreshPreview();
                }
            });
            this.listenTo(this.model.state, 'change:examples', function() {
                this.collection.wizardSteps
                    .findWhere({ value: fieldExtractorUtils.VALIDATE_FIELDS_MODE })
                    .set({ enabled: (this.model.state.get('examples') || []).length > 0 });
                this.collection.wizardSteps
                    .findWhere({ value: fieldExtractorUtils.SAVE_FIELDS_MODE })
                    .set({ enabled: ((this.model.state.get('examples') || []).length > 0) });
            });
            this.listenTo(this.model.state, 'change:method', function() {
                var method = this.model.state.get('method');
                this.collection.wizardSteps
                    .findWhere({ value: fieldExtractorUtils.SELECT_DELIM_MODE })
                    .set({ visible: (method === this.DELIM_MODE),
                           enabled: true });
                this.collection.wizardSteps
                    .findWhere({ value: fieldExtractorUtils.SELECT_FIELDS_MODE })
                    .set({ visible: (method === this.REGEX_MODE),
                           enabled: true });
                this.collection.wizardSteps
                    .findWhere({ value: fieldExtractorUtils.VALIDATE_FIELDS_MODE })
                    .set({ visible: (method === this.REGEX_MODE),
                           enabled: (this.model.state.get('examples') || []).length > 0 });
                this._updateMethodButtons();
                $('html,body').animate({scrollTop: "0px"}, 300);
            });
            this.listenTo(this.model.state, 'change:delimType', function(model, delimType) {
                if (this.model.state.get('mode') === fieldExtractorUtils.SELECT_DELIM_MODE) {
                    if (delimType === 'custom') {
                        if (this.model.state.get('delim') && !_.isEmpty(this.model.state.get('delim'))) {
                            this.applyDelim(this.model.state.get('delim'));
                        }
                        this.children.delimiterCustom.$el.show();
                        return;
                    } else {
                        this.children.delimiterCustom.$el.hide();
                    }
                }
                var delim = fieldExtractorUtils.DELIM_MAP[delimType];
                this.model.state.set('delim', delim);
            });
            this.listenTo(this.model.state, 'change:delim', function(model, delim) {
                if (this.model.state.get('mode') === fieldExtractorUtils.SELECT_DELIM_MODE) {
                    this.applyDelim(delim);
                    if (this.$('.content-body').is(':hidden')) {
                        this.children.previewView.detach();
                        this.children.previewView.appendTo(this.$('.content-body')).$el.show();
                        this.$('.content-body').show();
                    }
                    this.children.masterEventDelimEditor.appendTo(this.$('.content-header')).$el.show();
                }
            });
            this.listenTo(this.model.state, 'delimFieldNamesUpdated', function() {
                // When a field is named, update the regex, so that the results table is updated with new field names
                if (this.model.state.get('mode') === fieldExtractorUtils.SELECT_DELIM_MODE) {
                    var delimFieldNames = this.model.state.get('delimFieldNames'),
                        delimItems = this.model.state.get('delimItems'),
                        delim = this.model.state.get('delim'),
                        delimRegex = '';
                    for (var i = 0; i < delimFieldNames.length; i++) {
                        delimRegex += "(?P<" + delimFieldNames[i] + ">[^" + delim + "]*)";
                        if (i < delimFieldNames.length-1) {
                                delimRegex += delimItems[i];
                        }
                    }
                    this.collection.wizardSteps
                        .findWhere({ value: fieldExtractorUtils.SAVE_FIELDS_MODE })
                        .set({ enabled: (_(this.model.state.get('delimFieldNames')).keys().length > 0) });
                    this.model.state.set('regex', delimRegex);
                }
            });
            this.listenTo(this.model.state, 'change:mode', function() {
                var currentMode = this.model.state.get('mode'),
                    previousMode = this.model.state.previous('mode');
                if(currentMode === fieldExtractorUtils.SELECT_SAMPLE_MODE
                    && previousMode === fieldExtractorUtils.SELECT_METHOD_MODE){
                    this.tempClearState();
                    // Set Select Fields mode visible, so wizard steps don't look bad.
                    this.collection.wizardSteps
                        .findWhere({ value: fieldExtractorUtils.SELECT_FIELDS_MODE })
                        .set({ visible: true });
                    this.children.stepWizardControl.updateNavButtons();
                }else if(currentMode === fieldExtractorUtils.SELECT_METHOD_MODE
                    && previousMode === fieldExtractorUtils.SELECT_SAMPLE_MODE) {
                    // we are returning to this step after having gone backwards
                    if(this.cachedStateModel) {
                        var typeHasChanged = this.cachedStateModel.type !== this.model.state.get('type'),
                            sourcetypeHasChanged = this.cachedStateModel.sourcetype !== this.model.state.get('sourcetype'),
                            sourceHasChanged = this.cachedStateModel.source !== this.model.state.get('source'),
                            masterEventHasChanged = this.cachedStateModel.masterEvent !== this.model.state.get('masterEvent'),
                            stateHasChanged = typeHasChanged || sourcetypeHasChanged || sourceHasChanged || masterEventHasChanged;
                        if(stateHasChanged) {
                            this.cachedStateModel = null; // proceed as usual. state is up to date.
                            this.cachedFieldsState = null; // Zero out cached field state if state is up to date.
                        }else{
                            // user has gone back but not made any changes. restore previous state.
                            this.restoreClearedState();
                            // When user entered select sample mode and established enabled state of the next mode (validate fields),
                            // the examples array was empty so validate fields mode's next button is disabled.
                            // Must update enabled state of next mode upon repopulating examples array.
                            this.children.stepWizardControl.updateNavButtons();
                        }
                    }
                } else if (currentMode === fieldExtractorUtils.SELECT_METHOD_MODE &&
                           (previousMode === fieldExtractorUtils.SELECT_FIELDS_MODE || previousMode === fieldExtractorUtils.SELECT_DELIM_MODE)) {
                    this.tempClearFields();
                } else if ((currentMode === fieldExtractorUtils.SELECT_FIELDS_MODE || currentMode === fieldExtractorUtils.SELECT_DELIM_MODE) &&
                           previousMode === fieldExtractorUtils.SELECT_METHOD_MODE) {
                    if (this.cachedFieldsState) {
                        if (this.cachedFieldsState.method !== this.model.state.get('method')) {
                            this.cachedStateModel = null; // proceed as usual. state is up to date.
                        } else {
                            // user has gone back but not made any changes. restore previous state.
                            this.restoreClearedFields();
                            // When user entered select method mode and established enabled state of next mode (validate or save),
                            // the examples array or delimFieldNames array was empty so the next step button was disabled.
                            // So we need to update wizard buttons after repopulating the appropriate info.
                            this.children.stepWizardControl.updateNavButtons();
                            // claral potentially rerender the mastereventdelimeditor
                        }
                    }
                }else if(currentMode === fieldExtractorUtils.VALIDATE_FIELDS_MODE) {
                    // When entering validate fields mode, set the view to all events so the user can find false
                    // positives (SPL-88792).
                    this.model.state.set({ eventsView: fieldExtractorUtils.VIEW_ALL_EVENTS });
                }
                this.cleanUpOldMode(this.model.state.previous('mode'));
                this._refreshExtractionViews();
            });
            this.listenTo(this.model.state, 'change:sampleEvents', function() {
                if(this.model.state.get('errorState') !== true){
                    this.children.previewView.setAddSamplesEnabled(this.model.state.get('sampleEvents').length < fieldExtractorUtils.SAMPLE_EVENT_LIMIT);
                }
            });

            this.listenTo(this.model.state, 'change:regex', function() {
                if (this.model.state.get('regex') && this.$('.content-body').is(':hidden')) {
                    this.children.previewView.detach();
                    this.children.previewView.appendTo(this.$('.content-body')).$el.show();
                    this.$('.content-body').show();
                }
                if(this.model.state.get('interactiveMode') === fieldExtractorUtils.NO_INTERACTION_MODE){
                    if(this.regexManuallyModified() || this.model.state.get('mode') === fieldExtractorUtils.SELECT_SAMPLE_MODE) {
                        this.$('.return-automatic-mode').hide();
                        this.children.manualExtractionEditor.$('.edit-regex-warning').hide();
                    }
                }
            });

            this.listenTo(this.model.state, 'change', function() {
                var whitelist = ['filter', 'regex', 'clustering', 'eventsView', 'sampleSize', 'useSearchFilter'],
                    shouldRefreshPreview = _(whitelist).any(function(attrName) {
                        return this.model.state.hasChanged(attrName);
                    }, this);

                if(shouldRefreshPreview) {
                    this._refreshPreview();
                }
            });
        },
        setManualMode: function() {
            // Store most recently visited wizard step to allow user to return to this step if re-entering automatic mode
            this.lastAutomaticMode = this.model.state.get('mode');
            this.model.state.set({ interactiveMode: fieldExtractorUtils.NO_INTERACTION_MODE });
            this.children.stepWizardControl.$el.hide();
            this._setupManualView();
        },
        _setupManualView: function() {
            this.cleanUpOldMode(this.model.state.get('mode'));
            this._refreshExtractionViews();
            if(this.model.extraction.isNew() && (!this.regexManuallyModified() || !this.model.state.get('regex'))) {
                this.$('.return-automatic-mode').show();
                this.children.manualExtractionEditor.$('.edit-regex-warning').show();
                this.$('.regex-editor-wrapper').find('textarea').focus();
            }
        },
        setMethod: function(method) {
            if (method === this.REGEX_MODE || method === this.DELIM_MODE) {
                this.model.state.set('method', method);
            }
        },
        cleanupManualMode: function(){
            this.model.state.set('interactiveMode', fieldExtractorUtils.INTERACTION_MODE);
            this.children.stepWizardControl.$el.show();
            this.children.manualExtractionEditor.cleanupState();
            this._cleanupManualView();
            this._refreshExtractionViews();
        },
        _cleanupManualView: function() {
            this.$('.select-sourcetype-header').detach();
            this.children.previewView.$el.detach().hide();
            this.children.manualExtractionEditor.$el.detach().hide();
            this.$('.return-automatic-mode').hide();
            this.children.manualExtractionEditor.$('.edit-regex-warning').hide();
            this.$('.view-all-extractions-button-container').hide();
        },
        cleanUpOldMode: function(mode) {
            // Teardown routines for each previous step of wizard mode as user goes to another step
            if(mode === fieldExtractorUtils.SELECT_SAMPLE_MODE) {
                this.$('.select-sample-header').detach();
                if (!this.options.sid && !this.options.sourcetype) {
                    this.children.typeDropDown.$el.detach().hide();
                    this.children.source.$el.detach().hide();
                }
                this.children.sourcetypeDropDown.$el.detach().hide();
                this.children.previewView.$el.detach().hide();
                this.children.masterEventViewer.detach();
            }
            else if(mode === fieldExtractorUtils.SELECT_METHOD_MODE) {
                this.$('.select-method-header').detach();
                if (this.model.state.get('method') === this.DELIM_MODE) {
                    this.$('.view-all-extractions-button-container').hide();
                }
            }
            else if(mode === fieldExtractorUtils.SELECT_FIELDS_MODE) {
                this.$('.select-fields-header').detach();
                this.children.extractionViewer.detach();
                this.children.masterEventEditor.$el.detach().hide();
                this.children.previewView.$el.detach().hide();
                this.$('.body-instructions').detach();
                if (this.$('.content-body').is(':hidden')) {
                    this.$('.content-body').css("display", "block");
                }
            }
            else if(mode === fieldExtractorUtils.SELECT_DELIM_MODE) {
                this.$('.select-fields-header').detach();
                this.children.extractionViewer.detach();
                this.children.masterEventViewer.detach();
                this.children.masterEventDelimEditor.$el.detach().hide();
                this.children.previewView.$el.detach().hide();
                this.$('.body-instructions').detach();
                if (this.$('.content-body').is(':hidden')) {
                    this.$('.content-body').css("display", "block");
                }
            }
            else if(mode === fieldExtractorUtils.VALIDATE_FIELDS_MODE) {
                this.$('.validate-fields-header').detach();
                this.children.previewView.$el.detach().hide();
                this.children.extractionViewer.detach();
                this.children.counterExampleEditor.$el.detach().hide();
                this.$('.view-all-extractions-button-container').hide();
            }
            else if(mode === fieldExtractorUtils.SAVE_FIELDS_MODE) {
                this.$('.save-extractions-header').detach();
                this.children.saveView.remove();
                this.$('.content-body').show();
                // When leaving the save mode, clear any errors that ocurred trying to save the extraction (SPL-89627).
                this.model.extraction.trigger('serverValidated', false, this.model.extraction);
                this.model.extraction.acl.trigger('serverValidated', false, this.model.extraction.acl);
                this.model.transform.trigger('serverValidated', false, this.model.transform);
            }
            else if(mode === fieldExtractorUtils.CONFIRMATION_MODE) {
                this.$('.confirmation-header').detach();
                this.children.confirmationView.$el.detach().hide();
            }
        },

        _tryToShowExistingExtractions: function() {
            var existingExtractions = this.model.state.get('existingExtractions');
            if (fieldExtractorUtils.containsNoOverlappingExtractions(existingExtractions)) {
                // No extraction overlaps, so set all existing extractions to hidden: false.
                _.each(existingExtractions, function(extraction) {
                    extraction.hidden = false;
                });
                this.model.state.set({extractionWarningOn: false});
            } else {
                this.model.state.set({extractionWarningOn: true});
            }
        },

        _hideExistingExtractions: function() {
            var existingExtractions = this.model.state.get("existingExtractions") || [];
            _.each(existingExtractions, function(extraction) {
                extraction.hidden = true;
            });
        },

        _refreshExistingExtractionsButton: function() {
            var warningOn = this.model.state.get('extractionWarningOn');
            this.$('.view-all-extractions-button-container').html(_(this.viewAllExtractionsTemplate).template({
                warningOn: warningOn
            }));
            if (warningOn) {
                var $warningIcon = this.$('.view-all-extractions-button-container .icon-alert');
                var tooltipText = _("There are existing extractions, however because they overlap, they can only be manually turned on.").t();
                $warningIcon.tooltip({ animation: false, title: tooltipText, container: $warningIcon });
            }
        },

        _createSidebar: function() {
            if(this.children.extractionsSidebar) {
                this.children.extractionsSidebar.remove();
            }
            this.children.extractionsSidebar = new Sidebar({ modalize : true });
            this.children.extractionsSidebar.render().$el.appendTo($('body'));
            this.children.extractionsSidebar.addSidebar(this.children.existingExtractions.render().$el.css({'width' : this.SIDEBAR_WIDTH + 'px'}));
            // The sidebar clobbers DOM event listeners when it gets removed, so refresh them (SPL-88877).
            this.children.existingExtractions.delegateEvents();
            this._refreshExtractions();
        },

        _forceRefreshExtractions: function() {
            var stanza = '';
            if (this.model.state.get('type') === 'sourcetype') {
                stanza = this.model.state.get('sourcetype');
            } else if (this.model.state.get('type') === 'source') {
                stanza = 'source::' + this.model.state.get('source');
            }
            var extractionSearch = 'type=inline AND stanza=' + stanza;
            if(this.collection.extractions.fetchData.get('search') !== extractionSearch) {
                this.collection.extractions.reset();
                // Update the fetch data silently and then force a synchronous fetch so observers will see the collection
                // in a loading state.
                this.collection.extractions.fetchData.set({
                    search: extractionSearch,
                    count: 0
                }, { silent: true });
                return this.collection.extractions.fetch({ data: this.model.application.pick('app', 'owner') }).then(_(function() {
                    // Filter out extractions that are using the <regex> in <field> syntax, we only want extractsion from _raw.
                    var filteredModels = this.collection.extractions.filter(function(model) {
                        return !/ in [a-zA-Z0-9_]+$/.test(model.entry.content.get('value'));
                    });
                    this.collection.extractions.reset(filteredModels);
                }).bind(this));
            }
        },

        _refreshExtractions: function() {
            this._forceRefreshExtractions();
        },

        // TODO(claral): need to fix this to account for user changing method as well as changing master event.
        tempClearState: function() {
            // Create deep copy of state model
            this.cachedStateModel = $.extend(true, {}, this.model.state.attributes);
            // Set cached mode to the mode at which the cached state model would be restored
            this.cachedStateModel.mode = fieldExtractorUtils.SELECT_METHOD_MODE;
            // Clear state model so user sees clean state when returning to previous step.
            // Selectively set only attributes that will affect how preview table is rendered
            this.model.state.set({
                sampleSize: { head: 1000 },
                regex: '',
                filter: '',
                clustering: fieldExtractorUtils.CLUSTERING_NONE,
                eventsView: fieldExtractorUtils.VIEW_ALL_EVENTS,
                examples: [],
                counterExamples: [],
                sampleEvents: [],
                requiredText: '',
                delimType: '',
                delim: '',
                delimFieldNames: [],
                method: ''
            });
        },

        restoreClearedState: function() {
            // Restore state model to cached state as user did not make any changes
            this.model.state.set(this.cachedStateModel);
            // Reset cached field names because setting delim reset them to default
            if (this.cachedFieldsState) {
                this.model.state.set({delimFieldNames: this.cachedFieldsState.delimFieldNames});
            }
            // Delete cached state model
            this.cachedStateModel = null;
        },

        tempClearFields: function() {
            this.cachedFieldsState = $.extend(true, {}, this.model.state.attributes);
            this.cachedFieldsState.mode = this.model.state.previous('mode');

            this.model.state.set({
                sampleSize: { head: 1000 },
                regex: '',
                filter: '',
                clustering: fieldExtractorUtils.CLUSTERING_NONE,
                eventsView: fieldExtractorUtils.VIEW_ALL_EVENTS,
                examples: [],
                counterExamples: [],
                sampleEvents: [],
                requiredText: '',
                delimType: '',
                delim: '',
                delimFieldNames: [],
                delimitedBounds: [],
                delimItems: []
            });
        },

        restoreClearedFields: function() {
            this.model.state.set(this.cachedFieldsState);
            // Reset cached field names because setting delim reset them to default
            this.model.state.set({delimFieldNames: this.cachedFieldsState.delimFieldNames});
            this.cachedFieldsState = null;
        },

        _createComponents: function() {
            this._setupControllers();
            this._setupStepWizard();
            this._setupFlashMessages();
            this._setupSelectSourcetypeMode();
            this._setupSelectMasterMode();
            this._setupCounterExampleEditor();
            this._setupMasterEventEditor();
            this._setupMasterEventDelimEditor();
            this._setupManualExtractionEditor();
            this._setupExtractionViewer();
            this._setupExistingExtractionsList();
            this._setupResultsTable();
            this._initializeHide();
            this._setupConfirmationView();
        },

        _setupControllers: function() {
            this.children.previewJobController = new PreviewJobController({
                model: {
                    application: this.model.application,
                    state: this.model.state,
                    searchJob: this.model.searchJob
                }
            });

            this.children.regexGenerationController = new RegexGeneratorController({
                model: {
                    application: this.model.application,
                    state: this.model.state,
                    searchJob: this.model.searchJob
                }
            });
            if(this.model.state.has('masterEvent')) {
                this.children.regexGenerationController.setMasterEvent(this.model.state.get('masterEvent'));
                // Since in this entry flow the user did not choose a sample event, we do not yet have a running job to
                // pass to the regex generator, so we dispatch one here and store the resulting promise.
                this.jobReadyDfd = this.children.previewJobController.preview(this._generatePreviewBasesearch(), {data:{provenance:"UI:FieldExtractor"}});
            }
            else {
                // If we reach this branch we are in an entry flow where the user selects a sample event.  This means
                // we are guaranteed to have a running job for the regex generator.
                this.jobReadyDfd = $.Deferred().resolve();
            }
        },

        _setupStepWizard: function() {
            this.children.stepWizardControl = new StepWizardControl({
                model: this.model.state,
                modelAttribute: 'mode',
                collection: this.collection.wizardSteps,
                validateNext: _(function() {
                    if(this.model.state.get('mode') === fieldExtractorUtils.SAVE_FIELDS_MODE) {
                        this._validateAndSaveExtraction();
                        // Return false because the validation will advance to the next step only on a successful save.
                        return false;
                    }
                    return true;
                }).bind(this)
            });
        },

        _setupFlashMessages: function() {
            this.children.flashMessages = new FlashMessages({
                model: {
                    searchJob: this.model.searchJob,
                    extraction: this.model.extraction,
                    transform: this.model.transform,
                    extractionAcl: this.model.extraction.acl
                },
                whitelist: [splunkdUtils.FATAL, splunkdUtils.ERROR, splunkdUtils.WARNING]
            });
            this.regexErrorMessageId = _.uniqueId('regex-error-');
        },

        _setupSelectSourcetypeMode: function() {
            var currentSourcetype = new Sourcetype();
            currentSourcetype.entry.set({ name: this.model.state.get('sourcetype') });
            // If we're bootstrapping from an sid, show a simple drop-down control since it will only
            // contain the few sourcetypes from that job.
            var sourcetypePrompt = _('-- Select Source Type --').t();
            if(this.options.sid) {
                this.children.sourcetypeDropDown = new SyntheticSelectControl({
                    model: this.model.state,
                    modelAttribute: 'sourcetype',
                    toggleClassName: 'btn',
                    prompt: sourcetypePrompt,
                    items: this.collection.sourcetypes.map(function(sourcetype) {
                        return ({
                            description: sourcetype.entry.content.get('description') || '',
                            value: sourcetype.entry.get('name')
                        });
                    })
                });
            } else {
                var items = [{description: 'Source type', value: 'sourcetype'},
                             {description: 'Source', value: 'source'}];
                this.children.typeDropDown = new SyntheticSelectControl({
                    model: this.model.state,
                    modelAttribute: 'type',
                    toggleClassName: 'btn',
                    items: items
                });

                this.children.sourcetypeDropDown = new SourcetypeMenu({
                    addLabel: false,
                    prompt: sourcetypePrompt,
                    model: {
                        sourcetypeModel: currentSourcetype
                    },
                    collection: {
                        sourcetypesCollection: this.collection.sourcetypes
                    }
                });

                this.children.source = new ControlGroup({
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'source',
                        model: this.model.state
                    },
                    label: _('Source Name').t()
                });
            }
            this.listenTo(currentSourcetype.entry, 'change:name', function() {
                this.model.state.set({ sourcetype: currentSourcetype.entry.get('name') });
            });
        },

        _setupSelectMasterMode: function() {
            this.children.masterEventViewer = new MasterEventViewer({
                model: {
                    state: this.model.state
                }
            });
        },

        _setupCounterExampleEditor: function() {
            this.children.counterExampleEditor = new CounterExampleEditor({
                model: {
                    state: this.model.state
                }
            });
            this.listenTo(this.children.counterExampleEditor, 'action:removeCounterExample', function(index) {
                var promise = this.children.regexGenerationController.removeCounterExample(index);
                this._handleRegexGeneratorPromise(promise);
            });
        },

        _setupMasterEventEditor: function() {
            this.children.masterEventEditor = new MasterEventEditor({
                model: {
                    state: this.model.state
                }
            });
            this.listenTo(this.children.masterEventEditor, 'action:addExtraction', function(selection) {
                this.showLoading();
                $.when(this.jobReadyDfd).then(_(function() {
                    var promise = this.children.regexGenerationController.addExample(
                        _(selection).pick('fieldName', 'startIndex', 'endIndex')
                    );
                    this._handleRegexGeneratorPromise(promise);
                }).bind(this));
            });
            this.listenTo(this.children.masterEventEditor, 'action:addSampleExtraction', function(selection, index) {
                var promise = this.children.regexGenerationController.addSampleExtraction(
                    _(selection).pick('fieldName', 'startIndex', 'endIndex'),
                    index
                );
                this._handleRegexGeneratorPromise(promise);
            });
            this.listenTo(this.children.masterEventEditor, 'action:addRequiredText', function(selection) {
                var promise = this.children.regexGenerationController.addRequiredText(selection.selectedText);
                this._handleRegexGeneratorPromise(promise);
            });
            this.listenTo(this.children.masterEventEditor, 'action:removeRequiredText', function() {
                var promise = this.children.regexGenerationController.removeRequiredText();
                this._handleRegexGeneratorPromise(promise);
            });
            this.listenTo(this.children.masterEventEditor, 'action:selectManualMode', function() {
                this.setManualMode();
            });
            this.listenTo(this.children.masterEventEditor, 'action:renameExistingExample', function(oldFieldName, newFieldName) {
                var promise = this.children.regexGenerationController.renameExample(oldFieldName, newFieldName);
                this._handleRegexGeneratorPromise(promise);
            });
            this.listenTo(this.children.masterEventEditor, 'action:removeExistingExample', function(fieldName) {
                var promise = this.children.regexGenerationController.removeExample(fieldName);
                this._handleRegexGeneratorPromise(promise);
            });
            this.listenTo(this.children.masterEventEditor, 'action:removeExistingSampleExtraction', function(fieldName, index) {
                var promise = this.children.regexGenerationController.removeSampleExtraction(fieldName, index);
                this._handleRegexGeneratorPromise(promise);
            });
            this.listenTo(this.children.masterEventEditor, 'action:removeExistingSampleEvent', function(index) {
                var existingSampleExtractions = this.model.state.get('existingSampleExtractions');
                existingSampleExtractions.splice(index, 1);
                this.model.state.set('existingSampleExtractions', existingSampleExtractions);
                var promise = this.children.regexGenerationController.removeSampleEvent(index);
                this._handleRegexGeneratorPromise(promise);
            });
        },

        _setupMasterEventDelimEditor: function() {
            this.children.masterEventDelimEditor = new MasterEventDelimEditor({
                model: {
                    state: this.model.state
                }
            });
            this.listenTo(this.children.masterEventDelimEditor, 'action:hideMasterEventViewer', function() {
                this.children.masterEventViewer.detach();
            });
        },

        _setupManualExtractionEditor: function() {
            this.children.manualExtractionEditor = new ManualExtractionEditor({
                model: {
                    state: this.model.state,
                    application: this.model.application
                }
            });
            this.listenTo(this.children.manualExtractionEditor, 'action:selectAutomaticMode', function() {
                this.model.state.set('interactiveMode', fieldExtractorUtils.INTERACTION_MODE);
            });
            this.listenTo(this.children.manualExtractionEditor, 'action:save', this._handleManualExtractionSave);
            this.listenTo(this.children.manualExtractionEditor, 'action:previewInSearch', this._handlePreviewInSearch);
        },

        // The save action can have two different meanings to upstream handlers.
        // If the active extraction is already saved, then it's an in-place update.  If not, it's a creation.
        // In either case, the contract with upstream logic is that the model passed will not already be part of
        // the extractions collection, and the event handler is responsible for saving that model to the back end
        // and updating the extractions collection accordingly or displaying an error message.
        _setupSaveView: function() {
            var stanza = '';
            if (this.model.state.get('type') === 'sourcetype') {
                stanza = this.model.state.get('sourcetype');
            } else if (this.model.state.get('type') === 'source') {
                stanza = 'source::' + this.model.state.get('source');
            }
            if (this.model.state.get('method') === this.DELIM_MODE) {
                var delimiter = fieldExtractorUtils.DELIM_CONF_MAP[this.model.state.get('delimType')] ?
                    '"' + fieldExtractorUtils.DELIM_CONF_MAP[this.model.state.get('delimType')] + '"' :
                    JSON.stringify(this.model.state.get('delim'));//JSON.stringify will escape quotes
                this.model.transform.entry.content.set({
                    DELIMS: delimiter,
                    FIELDS: '"'+_(this.model.state.get('delimFieldNames')).values().join('","')+'"'
                });

                if (this.model.extraction.isNew()) {
                    this.model.extraction.entry.content.set({
                        stanza: stanza,             // value, name
                        type: 'Uses transform'
                    });
                }
                else {
                    this.model.extraction.entry.content.set({
                        value: this.model.state.get('transformName')
                    });
                }
            } else {
                if (this.model.extraction.isNew()) {
                    this.model.extraction.entry.content.set({
                        name: splunkUtils.fieldListToString(
                            fieldExtractorUtils.getCaptureGroupNames(this.model.state.get('regex'))
                        ),
                        value: this.model.state.get('regex'),
                        stanza: stanza,
                        type: 'Inline'
                    });
                }
                else {
                    this.model.extraction.entry.content.set({
                        value: this.model.state.get('regex')
                    });
                }
            }
            if(this.children.saveView) {
                this.children.saveView.detach();
                this.children.saveView.remove();
            }
            this.children.saveView = new SaveExtractionsView({
                model: {
                    extraction: this.model.extraction,
                    user: this.model.user,
                    application: this.model.application,
                    state: this.model.state,
                    serverInfo: this.model.serverInfo,
                    transform: this.model.transform
                },
                collection: {
                    roles: this.collection.roles
                }
            });
            this.listenTo(this.children.saveView, 'action:finish', function() {
                this._validateAndSaveExtraction();
            });
        },

        _setupExtractionViewer: function() {
            this.children.extractionViewer = new ExtractionViewer({
                model: {
                    state: this.model.state
                }
            });
            this.listenTo(this.children.extractionViewer, 'action:previewInSearch', this._handlePreviewInSearch);
            this.listenTo(this.children.extractionViewer, 'action:selectManualMode', function() {
                this.setManualMode();
            });
        },

        _setupExistingExtractionsList: function() {
            this.children.existingExtractions = new ExistingExtractionsList({
                collection: {
                    extractions: this.collection.extractions
                },
                model: {
                    state: this.model.state,
                    application: this.model.application
                }
            });

            this.listenTo(this.children.existingExtractions, 'action:updateHighlighting', function() {
                this._refreshPreview();
                this.children.masterEventEditor.render();
                this.children.masterEventViewer.render();
            });
        },

        _setupResultsTable: function() {
            this.children.previewView = new RexPreviewViewStack({
                model: {
                    application: this.model.application,
                    searchJob: this.model.searchJob,
                    state: this.model.state
                },
                className: 'preview-view-stack',
                autoDrilldownEnabled: false
            });

            this.listenTo(this.children.previewView, 'action:selectEvent', function(rawText, existingExtractions) {
                if(this.model.state.get('mode') === fieldExtractorUtils.SELECT_SAMPLE_MODE) {
                    this.children.regexGenerationController.setMasterEvent(rawText);
                    this.model.state.set({ existingExtractions: existingExtractions });
                    this._tryToShowExistingExtractions();
                    this._refreshExistingExtractionsButton();
                    $('html,body').animate({scrollTop: "0px"}, 300);
                } else {
                    this.children.regexGenerationController.addSampleEvent(rawText);
                    var existingSampleExtractions = this.model.state.get('existingSampleExtractions');
                    existingSampleExtractions.push(existingExtractions);
                    this.model.state.set('existingSampleExtractions', existingSampleExtractions);
                }
                this._syncStateModelFromController();
            });
            this.listenTo(this.children.previewView, 'action:removeExtraction', function(selection) {
                var promise = this.children.regexGenerationController.addCounterExample(
                    _(selection).pick('fieldName', 'rawText', 'startIndex', 'endIndex')
                );
                this._handleRegexGeneratorPromise(promise);
                $('html,body').animate({scrollTop: "0px"}, 300);
            });
            this.listenTo(this.children.previewView, 'action:valueDrilldown', function(fieldName, value) {
                this.model.state.set({ filter: fieldName + '=' + value });
            });
            this.listenTo(this.children.previewView, 'action:nextStep', function() {
                this.model.state.set({ mode: this._getNextMode().get('value') });
            });
        },

        regexManuallyModified: function() {
            var regex = this.model.state.get('regex'),
                regexManuallyModified = regex !== this.children.regexGenerationController.getCurrentRegex();
            return regexManuallyModified;
        },

        applyDelim: function(delim) {
            // split sample event by this delim
            var sampleEvent = this.model.state.get('masterEvent'),
                isCustomDelimType = this.model.state.get('delimType') === 'custom',
                regexp = !isCustomDelimType ? new RegExp(delim,"g") : new RegExp(fieldExtractorUtils.getMultiCharDelimRegex(delim),"g"),
                match,
                matches = [],
                pairs = [],
                names = [],
                delimItems = [];
            var delimRegex = '';
            // preprocess to get rid of leading and trailing delim characters
            var delimString = fieldExtractorUtils.DELIM_CONF_MAP[this.model.state.get('delimType')] ?
                    fieldExtractorUtils.DELIM_CONF_MAP[this.model.state.get('delimType')] :
                    this.model.state.get('delim');
            while (stringUtils.strStartsWith(sampleEvent, delimString)){
                sampleEvent = sampleEvent.slice(delimString.length);
            }
            while (stringUtils.strEndsWith(sampleEvent, delimString)) {
                sampleEvent = sampleEvent.slice(0, sampleEvent.length - delimString.length);
            }

            while ((match = regexp.exec(sampleEvent)) != null) {
                delimItems.push(isCustomDelimType ? match[0] : delim);
                matches.push(match.index);
            }

            matches.unshift(-1);
            matches.push(sampleEvent.length);

            for (var i=0; i<matches.length-1; i++) {
                pairs.push({start: matches[i]+1, end: matches[i+1]});
                var fieldName = 'field' + (i+1);
                names.push(fieldName);
                delimRegex += "(?P<"+fieldName+">[^"+delim+"]*)";
                if (i < matches.length-2) {
                        delimRegex += delimItems[i];
                }
            }
            this.model.state.set('delimItems', delimItems);
            this.model.state.set('delimitedBounds', pairs);
            this.model.state.set('regex', delimRegex);
            this.model.state.set('delimFieldNames', names);
        },

        _initializeHide: function() {
            this.children.masterEventEditor.$el.hide();
            this.children.masterEventDelimEditor.$el.hide();
            this.children.manualExtractionEditor.$el.hide();
            this.children.previewView.$el.hide();
        },

        _setupConfirmationView: function() {
            this.children.confirmationView = new ConfirmationView({
                model: {
                    state: this.model.state,
                    application: this.model.application
                }
            });
        },

        _syncStateModelFromController: function() {
            this.model.state.set({
                masterEvent: this.children.regexGenerationController.getCurrentMasterEvent(),
                examples: this.children.regexGenerationController.getCurrentExamples(),
                requiredText: this.children.regexGenerationController.getCurrentRequiredText(),
                counterExamples: this.children.regexGenerationController.getCurrentCounterExamples(),
                sampleEvents: this.children.regexGenerationController.getCurrentSampleEvents(),
                regex: this.children.regexGenerationController.getCurrentRegex()
            });
        },

        _handleRegexGeneratorPromise: function(promise) {
            this._syncStateModelFromController();
            this.showLoading();
            promise.done(_(function(regexes) {
                var newRegex = regexes[0] || '';
                this.model.state.set({ regex: newRegex });
                this.hideLoading();
                if(newRegex || this.model.state.get('examples').length === 0) {
                    // valid regex returned by endpoint
                    this.model.state.set({ errorState: false });
                    this.model.state.set({ regexGenErrorState: false });
                    this.children.flashMessages.flashMsgHelper.removeGeneralMessage(this.regexErrorMessageId);
                }
                else {
                    // regex invalid - error state
                    this.model.state.set({ errorState: true });
                    this.showError();
                }
            }).bind(this));
            promise.fail(_(function() {
                var errorMessage,
                    mode = this.model.state.get('mode');
                if(mode === fieldExtractorUtils.SELECT_FIELDS_MODE){
                    errorMessage = _('The extraction failed. If you are extracting multiple fields, try removing one or more fields. Start with extractions that are embedded within longer text strings.').t();
                }else if(mode === fieldExtractorUtils.VALIDATE_FIELDS_MODE){
                    errorMessage = _('This counterexample cannot update the extraction. Remove it and try another counterexample. If you are extracting multiple fields, you may need to step back and remove one or more of them.').t();
                }else{
                    errorMessage = splunkUtils.sprintf(_('Splunk %s cannot generate a regular expression based on the current event and field selections.').t(), this.environment);
                }
                this.children.flashMessages.flashMsgHelper.addGeneralMessage(this.regexErrorMessageId, {
                    type: splunkdUtils.ERROR,
                    html: errorMessage
                });
                this.model.state.set({ regex: '' });
                this.hideLoading();
                this.model.state.set({ regexGenErrorState: true });
                this.showError();
            }).bind(this));
        },

        _refreshPreview: function() {
            if (this.model.state.get('method') === this.DELIM_MODE){
                var filler = splunkUtils.sprintf(_('Preview (%s fields)').t(),
                                                 this.model.state.get('delimFieldNames').length);
                this.$('.instructions-title').text(filler);
            }
            this.children.previewJobController.preview(this._generatePreviewBasesearch(), {data:{provenance:"UI:FieldExtractor"}});
        },

        _generatePreviewBasesearch: function() {
            var mode = this.model.state.get('mode'),
                prefix = '';
            if (this.options.sid &&
                ((mode === fieldExtractorUtils.SELECT_SAMPLE_MODE && this.model.state.get('useSearchFilter')) ||
                 (mode === fieldExtractorUtils.SELECT_FIELDS_MODE && this.model.state.get('useSearchFilter')) ||
                 (mode === fieldExtractorUtils.SELECT_DELIM_MODE && this.model.state.get('useSearchFilter')) ||
                 (mode === fieldExtractorUtils.VALIDATE_FIELDS_MODE && this.model.state.get('useSearchFilter')) ||
                 (mode !== fieldExtractorUtils.SELECT_FIELDS_MODE && mode !== fieldExtractorUtils.VALIDATE_FIELDS_MODE && mode !== fieldExtractorUtils.SELECT_SAMPLE_MODE))) {
                prefix = '| loadjob ' + this.options.sid + ' events=t ignore_running=f require_finished=f | search ';
            }
            var previewBaseSearch = prefix + 'index=* OR index=_*';
            if (this.model.state.get('type') === 'sourcetype' && this.model.state.get('sourcetype')) {
                previewBaseSearch += ' sourcetype=' +  splunkUtils.searchEscape(this.model.state.get('sourcetype'));
            } else if (this.model.state.get('type') === 'source' && this.model.state.get('source')) {
                previewBaseSearch += ' source="' +  splunkUtils.searchEscape(this.model.state.get('source')) + '"';
            }

            var regex = "(?ms)" + this.model.state.get('regex');

            if(regex && fieldExtractorUtils.getCaptureGroupNames(regex).length > 0) {
                var pipeToRex = splunkUtils.sprintf(
                    ' | rex field=%s %s' + ' offset_field=%s',
                    splunkUtils.searchEscape(this.model.state.get('inputField')),
                    splunkUtils.searchEscape(regex, { forceQuotes: true }),
                    fieldExtractorUtils.OFFSET_FIELD_NAME
                );
                previewBaseSearch += pipeToRex;
            }
            // Add a rex command for each existing extraction.
            (this.collection.extractions).each((function(extraction, i) {
                var pipeToRex = splunkUtils.sprintf(
                    ' | rex field=%s %s' + ' offset_field=%s' + i,
                    splunkUtils.searchEscape(this.model.state.get('inputField')),
                    splunkUtils.searchEscape(extraction.entry.content.get('value'), { forceQuotes: true }),
                    fieldExtractorUtils.OFFSET_FIELD_NAME
                );
                previewBaseSearch += pipeToRex;
            }).bind(this));
            return previewBaseSearch;
        },

        _refreshExtractionViews: function() {
            // Setup routines for each wizard/manual mode that user enters
            var mode = this.model.state.get('mode'),
                interactiveMode = this.model.state.get('interactiveMode'),
                isManualMode = interactiveMode === fieldExtractorUtils.NO_INTERACTION_MODE,
                method = this.model.state.get('method'),
                type = this.model.state.get('type'),
                sourcetype = this.model.state.get('sourcetype'),
                source = this.model.state.get('source');

            if(isManualMode) {
                if(fieldExtractorUtils.isManualEditorMode(mode, interactiveMode)) {
                   this.children.manualExtractionEditor.appendTo(this.$('.content-header')).$el.show();
                   this.$('.regex-editor-wrapper').find('textarea').focus();
                }
            }else{
                if(mode === fieldExtractorUtils.SELECT_SAMPLE_MODE){
                    this.$('.select-sample-header').detach();
                    $(_(this.selectMasterEventTemplate).template({
                        urlSourcetype: this.options.sourcetype,
                        sourcetype: sourcetype,
                        source: source,
                        type: type,
                        fieldsHelpHref: route.docHelp(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            'manager.fields'
                        )
                    })).appendTo(this.$('.content-header'));
                    this.children.sourcetypeDropDown.detach();
                    if (!this.options.sid && !this.options.sourcetype) {
                        this.children.typeDropDown.detach();
                        this.children.source.detach();
                        // Only show type drop down when starting from bare field_extractor page
                        this.children.typeDropDown.appendTo(this.$('.type-dropdown-wrapper')).$el.show();
                        if (type === 'sourcetype') {
                            this.children.sourcetypeDropDown.appendTo(this.$('.sourcetype-dropdown-wrapper')).$el.show();
                        } else if(type === 'source') {
                            this.children.source.appendTo(this.$('.source-wrapper')).$el.show();
                        }
                    } else {
                        this.children.sourcetypeDropDown.appendTo(this.$('.sourcetype-dropdown-wrapper')).$el.show();
                    }
                    this.children.masterEventViewer.render().appendTo(this.$('.content-header')).$el.show();
                }

                else if(mode === fieldExtractorUtils.SELECT_METHOD_MODE){
                    $(_(this.selectMethodTemplate).template({
                        type: type,
                        sourcetype: sourcetype,
                        source: source,
                        ifxHelpHref: route.docHelp(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            'learnmore.field.extraction.method'
                        ),
                        regexTxt: splunkUtils.sprintf(_('Splunk %s will extract fields using a Regular Expression.').t(), this.environment),
                        delimTxt: splunkUtils.sprintf(_('Splunk %s will extract fields using a delimiter (such as commas, spaces, or characters). Use this method for delimited data like comma separated values (CSV files).').t(), this.environment)
                    })).appendTo(this.$('.content-header'));
                    this.children.masterEventViewer.render().insertBefore(this.$('.method-switch'));
                    this._updateMethodButtons();
                }

                else if(mode === fieldExtractorUtils.SELECT_DELIM_MODE){
                    var delimiters = [
                            {label: _('Space').t(), value: 'space'},
                            {label: _('Comma').t(), value: 'comma'},
                            {label: _('Tab').t(), value: 'tab'},
                            {label: _('Pipe').t(), value: 'pipe'},
                            {label: _('Other').t(), value: 'custom'}];

                    this.children.delimiterRadio = new SyntheticRadioControl({
                        model: this.model.state,
                        modelAttribute: 'delimType',
                        toggleClassName: 'btn',
                        prompt: _('Delimiter').t(),
                        items: delimiters
                    });
                    this.children.delimiterCustom = new TextControl({
                        model: this.model.state,
                        modelAttribute: 'delim',
                        inputClassName: 'delim-custom',
                        trimLeadingSpace: false,
                        trimTrailingSpace: false
                    });

                    $(_(this.selectDelimTemplate).template({
                        delimRenameHelp: route.docHelp(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            'learnmore.field.extraction.rename'
                        )
                    })).appendTo(this.$('.content-header'));
                    this.$('.delimiter-radio').append(this.children.delimiterRadio.render().$el);
                    this.$('.delimiter-radio').append(this.children.delimiterCustom.render().$el);

                    this._hideExistingExtractions();

                    if (this.model.state.get('delimType') !== 'custom') {
                        this.children.delimiterCustom.$el.hide();
                    }
                    this.children.masterEventDelimEditor.detach();
                    if (!this.model.state.get('delimitedBounds') || this.model.state.get('delimitedBounds').length === 0) {
                        this.children.masterEventViewer.render().appendTo(this.$('.delim-selector'));
                    } else {
                        this.children.masterEventDelimEditor.appendTo(this.$('.content-header')).$el.show();
                    }
                    if(this.$('.content-body').find('.body-instructions').length === 0){
                        this.$('.content-body').prepend(_(this.previewInstructionsTemplate).template({
                            text: ''
                        }));
                    }
                }

                else if(mode === fieldExtractorUtils.SELECT_FIELDS_MODE){
                    this.$('.select-fields-header').detach();
                    $(_(this.selectFieldsTemplate).template(
                        {
                            ifxHelpHref: route.docHelp(
                                this.model.application.get('root'),
                                this.model.application.get('locale'),
                                'learnmore.field.extraction.automatic'
                            )
                        }
                    )).appendTo(this.$('.content-header'));
                    this.children.masterEventEditor.detach();
                    this.children.masterEventEditor.appendTo(this.$('.content-header')).$el.show();
                    this.children.extractionViewer.appendTo(this.$('.content-header'));
                    if(this.$('.content-body').find('.body-instructions').length === 0){
                        this.$('.content-body').prepend(_(this.previewInstructionsTemplate).template({
                            text: _('If you see incorrect results below, click an additional event to add it to the set of sample events. Highlight its values to improve the extraction. You can remove incorrect values in the next step.').t()
                        }));
                    }
                }

                else if(mode === fieldExtractorUtils.VALIDATE_FIELDS_MODE){
                    //Render the instructions
                    this.$('.validate-fields-header').detach();
                    $(_(this.validateFieldsTemplate).template({
                        instructionsText: _('Validate your field extractions and remove values that are incorrectly highlighted in the Events tab. In the field tabs, inspect the extracted values for each field, and optionally click a value to apply it as a search filter to the Events tab event list.').t()
                    })).appendTo(this.$('.content-header'));

                    this.children.counterExampleEditor.detach();
                    this.children.counterExampleEditor.appendTo(this.$('.content-header')).$el.show();
                    this.children.extractionViewer.appendTo(this.$('.content-header'));
                }
            }

            if(mode === fieldExtractorUtils.SAVE_FIELDS_MODE){
                this.$('.save-extractions-header').detach();
                $(_(this.saveExtractionsTemplate).template({
                    extractionIsNew: this.model.extraction.isNew()
                })).appendTo(this.$('.content-header'));
                this._setupSaveView();
                this.children.saveView.render().appendTo(this.$('.content-header')).$el.show();
                this.$('.content-body').hide();
                if(this.model.state.get('interactiveMode') === fieldExtractorUtils.NO_INTERACTION_MODE){
                    this.$('.return-manual-page').show();
                    this.$('.manual-save-button').show();
                }
            }

            if(mode === fieldExtractorUtils.CONFIRMATION_MODE) {
                this.$('.confirmation-header').detach();
                this.$('.content-body').hide();
                if(this.model.state.get('interactiveMode') === fieldExtractorUtils.NO_INTERACTION_MODE){
                    this.$('.return-manual-page').hide();
                    this.$('.manual-save-button').hide();
                }
                var editExtractionsHref = route.manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    ['data', 'props', 'extractions']
                );
                var successMessage = splunkUtils.sprintf(
                        _('You have extracted additional fields from your data (sourcetype=%s).').t(),
                        this.model.state.get('sourcetype'));
                if (this.model.state.get('type') === 'source') {
                    successMessage = splunkUtils.sprintf(
                        _('You have extracted additional fields from your data (source=%s).').t(),
                        this.model.state.get('source'));
                }
                $(_(this.confirmationTemplate).template({
                    successMessage: successMessage,
                    editExtractionsMessage: splunkUtils.sprintf(
                        _('Edit your field extractions at any time by going to %s.').t(),
                        '<a href="' + editExtractionsHref + '" class="edit-extractions-link">' + _('Field Extractions').t() + '</a>'
                    )
                })).appendTo(this.$('.content-header'));
                this.children.confirmationView.render().appendTo(this.$('.content-header')).$el.show();
            }

            // Only show existing extractions flyout button when in the first two wizard steps
            // or when selecting fields not in delim mode.
            // Do not show for save or confirm steps.
            if (mode === fieldExtractorUtils.SELECT_SAMPLE_MODE ||
                mode === fieldExtractorUtils.SELECT_METHOD_MODE ||
                mode === fieldExtractorUtils.SELECT_FIELDS_MODE ||
                mode === fieldExtractorUtils.VALIDATE_FIELDS_MODE) {
                this._refreshExistingExtractionsButton();
                this.$('.view-all-extractions-button-container').show();
            }
            if (!this.model.state.get('masterEvent')) {
                this.$('.view-all-extractions-button-container').find('.view-extractions-button').addClass('disabled');
            }

            if(fieldExtractorUtils.isEventsTableMode(mode, interactiveMode)){
                if (mode === fieldExtractorUtils.SELECT_FIELDS_MODE && !this.model.state.get('regex') ||
                    mode === fieldExtractorUtils.SELECT_DELIM_MODE && !this.model.state.get('delim') ||
                    (mode === fieldExtractorUtils.SELECT_SAMPLE_MODE &&
                        (type === '' || !this.model.state.get(type) || this.model.state.get(type) === '' ))) {
                    this.$('.content-body').hide();
                }
                else {
                    if (mode === fieldExtractorUtils.SELECT_SAMPLE_MODE &&
                        this.model.state.previous('interactiveMode') !== fieldExtractorUtils.NO_INTERACTION_MODE &&
                        this.model.state.get('interactiveMode') !== fieldExtractorUtils.NO_INTERACTION_MODE &&
                        ((type === 'sourcetype' && sourcetype) || (type === 'source' && source))) {
                        this._refreshPreview();
                    }
                    this.children.previewView.detach();
                    this.$('.content-body').show();
                    this.children.previewView.appendTo(this.$('.content-body')).$el.show();
                }
            }
        },

        _handlePreviewInSearch: function() {
            var url = route.search(
                this.model.application.get('root'),
                this.model.application.get('locale'),
                this.model.application.get('app'),
                { data: { q: this._generatePreviewBasesearch() } }
            );
            window.open(url, '_blank');
        },

        _handleManualExtractionSave: function() {
            this.model.state.set({ mode: fieldExtractorUtils.SAVE_FIELDS_MODE });
            this._cleanupManualView();
        },

        _validateAndSaveExtraction: function() {
            this.children.saveView.saveExtractions().done(_(function() {
                this.model.state.set({ mode: fieldExtractorUtils.CONFIRMATION_MODE });
            }).bind(this));
        },

        _getNextMode: function() {
            var activeMode = this._getCurrentMode(),
                activeModeIndex = this.collection.wizardSteps.indexOf(activeMode);

            return this.collection.wizardSteps.at(activeModeIndex + 1);
        },

        _getCurrentMode: function() {
            return this.collection.wizardSteps.findWhere({ value: this.model.state.get('mode') });
        },

        _updateMethodButtons: function() {
            var method = this.model.state.get('method');
            if (method === this.DELIM_MODE) {
                this.$('.btn-delim').addClass('selected-method');
                this.$('.btn-regex').removeClass('selected-method');
            } else if (method === this.REGEX_MODE) {
                this.$('.btn-regex').addClass('selected-method');
                this.$('.btn-delim').removeClass('selected-method');
            }
        },

        render: function() {
            this.$el.html(this.compiledTemplate({
                sourcetype: this.model.state.get('sourcetype')
            }));
            this.children.stepWizardControl.render().appendTo(this.$('.step-buttons-container'));
            this.children.flashMessages.render().appendTo(this.$('.flash-messages-container'));
            if (!this.options.sid && !this.options.sourcetype) {
                this.children.typeDropDown.render();
                this.children.source.render();
            }
            this.children.sourcetypeDropDown.render();
            this.children.extractionViewer.render();
            this.children.previewView.render();
            this.children.masterEventEditor.render();
            this.children.manualExtractionEditor.render();
            this._refreshExtractionViews();
            if(!this.model.extraction.isNew()) {
                this.setManualMode();
            }
            return this;
        },

        showLoading: function() {
            this.children.stepWizardControl.disable();
            this.$('.instruction a').addClass('disabled');
            this.children.masterEventEditor.disable();
            this.children.counterExampleEditor.disable();
            this.children.previewView.$el.hide();
            this.$('.regex-loading-message').show();
            this.children.extractionViewer.disable();
        },

        hideLoading: function() {
            this.children.stepWizardControl.enable();
            this.$('.instruction a').removeClass('disabled');
            this.children.masterEventEditor.enable();
            this.children.counterExampleEditor.enable();
            this.children.previewView.$el.show();
            this.$('.regex-loading-message').hide();
            this.children.extractionViewer.enable();
        },

        showError: function() {
            this.children.stepWizardControl.disable();
            this.$('.instruction a').addClass('disabled');
            this.children.extractionViewer.disable();
        },

        viewAllExtractionsTemplate: '\
            <% if(warningOn) { %>\
                <i class="icon-alert" title="<%- _("There are existing extractions, however because they overlap, they can only be manually turned on.").t() %>"></i>\
            <% } %>\
            <button class="view-extractions-button btn"><%- _("Existing fields").t() %> <i class="icon-chevron-right"></i></button>\
        ',

        selectMasterEventTemplate: '\
            <div class="select-sample-header">\
                <div class="instruction">\
                    <h3 class="instruction-title"><%- _("Select Sample Event").t() %></h3>\
                    <span class="instruction-text">\
                        <%- _("Choose a source or source type, select a sample event, and click Next to go to the next step. The field extractor will use the event to extract fields. ").t() %>\
                        <a href="<%- fieldsHelpHref %>" class="external" target="_blank"><%- _("Learn more").t() %></a>\
                        <% if (urlSourcetype || sourcetype || source) { %>\
                            <div class="manual-mode-button-container"><a href="#" class="manual-mode-button"><%- _("I prefer to write the regular expression myself").t() %> <i class="icon-chevron-right"></i></a></div>\
                        <% } %>\
                    </span>\
                </div>\
                <% if (!urlSourcetype) { %>\
                    <div class="type-wrapper form-horizontal">\
                        <span class="type-label"><%- _("Data Type").t() %></span>\
                        <div class="type-dropdown-wrapper"></div>\
                        <% if (type === "sourcetype") { %>\
                            <div class="sourcetype-wrapper"><span class="sourcetype-label"><%- _("Source Type").t() %></span>\
                            <div class="sourcetype-dropdown-wrapper"></div></div>\
                        <% } else if (type === "source") { %>\
                            <div class="source-wrapper form-horizontal align-left"></div>\
                        <% } %>\
                    </div>\
                <% } else { %>\
                    <div class="sourcetype-wrapper"><span class="sourcetype-label"><%- _("Source type ").t() %></span>\
                    <span class="sourcetype-name"><%- urlSourcetype %></span></div>\
                <% } %>\
            </div>\
        ',

        selectMethodTemplate: '\
            <div class="select-method-header">\
                <div class="instruction">\
                    <h3 class="instruction-title"><%- _("Select Method").t() %></h3>\
                    <span class="instruction-text">\
                        <%- _("Indicate the method you want to use to extract your field(s).").t() %>\
                        <a href="<%- ifxHelpHref %>" class="external" target="_blank"><%- _("Learn more").t() %></a>\
                    </span>\
                    <div class="manual-mode-button-container"><a href="#" class="manual-mode-button"><%- _("I prefer to write the regular expression myself").t() %> <i class="icon-chevron-right"></i></a></div>\
                </div>\
                <% if (type === "sourcetype") { %>\
                    <div class="sourcetype-wrapper"><span class="sourcetype-label"><%- _("Source type").t() %></span>\
                    <span class="sourcetype-name"><%- sourcetype %></span></div>\
                <% } else { %>\
                    <div class="source-wrapper"><span class="source-label"><%- _("Source").t() %></span>\
                    <span class="source-name"><%- source %></span></div>\
                <% } %>\
                <div class="method-switch">\
                    <div class="type-container">\
                        <div class="type-btn btn-regex" tabIndex="0">\
                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="104px" height="104px" viewBox="-73 21 104 104" enable-background="new -73 21 104 104" xml:space="preserve">\
                                <g>\
                                    <path class="fill" d="M-21,22.8c27.7,0,50.2,22.5,50.2,50.2S6.7,123.2-21,123.2S-71.2,100.7-71.2,73S-48.7,22.8-21,22.8 M-21,21c-28.7,0-52,23.3-52,52s23.3,52,52,52s52-23.3,52-52S7.7,21-21,21L-21,21z"/>\
                                </g>\
                                <g>\
                                    <path class="fill" d="M-33.1,62.8l0.7-2.2l3.7,1.5V58h2.3v4.1l3.7-1.5l0.8,2.2l-3.9,1.3l2.4,3.2l-1.8,1.3l-2.4-3.3l-2.3,3.3l-1.9-1.3l2.4-3.2L-33.1,62.8z"/>\
                                    <path class="fill" d="M-17.4,65.7c0-1.2,0.2-2.4,0.6-3.4s0.9-1.9,1.6-2.6c0.7-0.7,1.6-1.3,2.6-1.7c1-0.4,2.1-0.6,3.4-0.6c1,0,2,0.2,2.9,0.5c0.9,0.3,1.7,0.7,2.3,1.3c0.7,0.6,1.2,1.3,1.6,2.2c0.4,0.9,0.6,1.8,0.6,2.9c0,0.8-0.1,1.5-0.3,2.1s-0.4,1.1-0.7,1.5c-0.3,0.4-0.6,0.8-1,1.1c-0.4,0.3-0.7,0.7-1.1,1C-5.3,70.3-5.7,70.7-6,71c-0.4,0.3-0.7,0.7-1,1.1c-0.3,0.4-0.5,0.9-0.6,1.5c-0.1,0.6-0.2,1.3-0.2,2.1h-3.7c0-1,0.1-1.8,0.2-2.5s0.3-1.3,0.5-1.8c0.2-0.5,0.5-1,0.8-1.4c0.3-0.4,0.7-0.8,1.2-1.2c0.4-0.3,0.7-0.6,1-0.9c0.3-0.3,0.6-0.6,0.9-0.9c0.3-0.3,0.5-0.7,0.6-1.1c0.1-0.4,0.2-0.9,0.2-1.5c0-0.7-0.1-1.3-0.4-1.8c-0.2-0.5-0.5-0.9-0.9-1.2C-7.7,61.2-8,61-8.4,60.9c-0.4-0.1-0.7-0.2-1-0.2c-1.4,0-2.4,0.5-3.1,1.4c-0.7,0.9-1,2.1-1,3.7H-17.4z"/>\
                                </g>\
                                <circle class="fill" cx="-9.6" cy="80.8" r="2.2"/>\
                                <circle class="fill" cx="-38.5" cy="80.8" r="2.2"/>\
                                <path class="fill" d="M5.1,88.8H2.9c5.2-9,5.8-21.6,0-31.3h2.2C11.8,67.8,11.4,78.9,5.1,88.8z"/>\
                                <path class="fill" d="M-47.1,57.4h2.2c-5.8,9.7-5.2,22.4,0,31.3h-2.2C-53.5,78.9-53.8,67.8-47.1,57.4z"/>\
                            </svg>\
                            <div class="type-title-text"><%=_("Regular Expression").t()%></div>\
                        </div>\
                        <div class="type-desc-text"><%= regexTxt %></div>\
                    </div>\
                    <div class="type-container">\
                        <div class="type-btn btn-delim" tabIndex="0">\
                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="104px" height="104px" viewBox="107 21 104 104" enable-background="new 107 21 104 104" xml:space="preserve">\
                                <g>\
                                    <g>\
                                        <path class="fill stroke" stroke-miterlimit="10" d="M125.5,66.4h2.8l3.2,4.7l3.4-4.7h2.7l-4.6,6.2l5.2,7.3h-2.8l-3.7-5.6l-3.7,5.6h-2.7l5-7.1L125.5,66.4z"/>\
                                        <path class="fill stroke" stroke-miterlimit="10" d="M159.2,83.3c-0.3,0.5-0.5,0.8-0.8,1.1c-0.3,0.3-0.6,0.5-1,0.6c-0.4,0.1-0.8,0.2-1.3,0.2c-0.3,0-0.5,0-0.8-0.1c-0.3,0-0.5-0.1-0.8-0.2v-2c0.2,0.1,0.4,0.1,0.6,0.2s0.4,0.1,0.7,0.1c0.5,0,0.8-0.1,1.1-0.3c0.3-0.2,0.5-0.5,0.7-0.9l0.9-2.3l-5.3-13.4h2.5l3.9,11h0.1l3.8-11h2.3l-5.8,15.2C159.7,82.3,159.4,82.8,159.2,83.3z"/>\
                                        <path class="fill stroke" stroke-miterlimit="10" d="M172.5,59.4h1v26h-1V59.4z"/>\
                                        <path class="fill stroke" stroke-miterlimit="10" d="M144.5,59.5h1v26h-1V59.5z"/>\
                                        <path class="fill stroke" stroke-miterlimit="10" d="M189.3,68.3h-7.6v-1.9h10.5v1.5l-8.2,10h8.6v2h-11.3v-1.7L189.3,68.3z"/>\
                                    </g>\
                                </g>\
                                <g>\
                                    <path class="fill" d="M159,22.8c27.7,0,50.2,22.5,50.2,50.2s-22.5,50.2-50.2,50.2s-50.2-22.5-50.2-50.2S131.3,22.8,159,22.8M159,21c-28.7,0-52,23.3-52,52s23.3,52,52,52s52-23.3,52-52S187.7,21,159,21L159,21z"/>\
                                </g>\
                            </svg>\
                            <div class="type-title-text"><%=_("Delimiters").t()%></div>\
                        </div>\
                        <div class="type-desc-text"><%= delimTxt %></div>\
                    </div>\
                </div>\
            </div>\
        ',

        selectDelimTemplate: '\
            <div class="select-fields-header">\
                <div class="instruction">\
                    <h3 class="instruction-title"><%- _("Rename Fields").t() %></h3>\
                    <span class="instruction-text">\
                        <%- _("Select a delimiter. In the table that appears, rename fields by clicking on field names or values. ").t() %>\
                        <a href="<%- delimRenameHelp %>" class="external" target="_blank"><%- _("Learn more").t() %></a>\
                    </span>\
                    <div class="delim-selector">\
                        <span><%= _("Delimiter").t() %></span>\
                        <div class="delimiter-radio"></div>\
                    </div> \
                </div>\
            </div>\
        ',

        selectFieldsTemplate: '\
            <div class="select-fields-header">\
                <div class="instruction">\
                    <h3 class="instruction-title"><%- _("Select Fields").t() %></h3>\
                    <span class="instruction-text">\
                        <%- _("Highlight one or more values in the sample event to create fields. You can indicate one value is required, meaning it must exist in an event for the regular expression to match. Click on highlighted values in the sample event to modify them. To highlight text that is already part of an existing extraction, first turn off the existing extractions.").t() %>\
                        <a href="<%- ifxHelpHref %>" class="external" target="_blank"><%- _("Learn more").t() %></a>\
                    </span>\
                </div>\
            </div>\
        ',

        validateFieldsTemplate: '\
            <div class="validate-fields-header">\
                <div class="instruction">\
                    <h3 class="instruction-title"><%- _("Validate").t() %></h3>\
                    <span class="instruction-text"><%= instructionsText %></span>\
                </div>\
            </div>\
        ',

        saveExtractionsTemplate: '\
            <div class="save-extractions-header">\
                <div class="instruction"> \
                    <h3 class="instruction-title"><%- _("Save").t() %></h3>\
                    <span class="instruction-text">\
                        <% if(extractionIsNew) { %>\
                            <%- _("Name the extraction and set permissions.").t() %> \
                        <% } else { %>\
                            <%- _("Verify permissions").t() %> \
                        <% } %>\
                    </span>\
                </div>\
            </div>\
        ',

        confirmationTemplate: '\
            <div class="confirmation-header">\
                <div class=" instructions">\
                	<h3 class="instruction-title"><%- _("Success!").t() %></h3>\
                </div>\
                <p class="success-message"><%- successMessage %></p>\
                <p class="edit-extractions-message">\
                    <%= editExtractionsMessage %>\
                </p>\
            </div>\
        ',

        previewInstructionsTemplate: '\
            <div class="body-instructions">\
                <h3 class="instructions-title"><%- _("Preview").t() %></h3>\
                <div class="instructions-text">\
                    <%= text %>\
                </div>\
            </div>\
        ',

        template: '\
            <div class="page-header">\
                <div class="extract-fields-page-title"><%- _("Extract Fields").t() %></div>\
                <a href="#" class="btn previous-button return-automatic-mode" style="display:none"><i class="icon-chevron-left"></i> <%- _("Back").t() %></a>\
                <a href="#" class="btn previous-button return-manual-page" style="display:none"><i class="icon-chevron-left"></i> <%- _("Back").t() %></a>\
                <a href="#" class="btn btn-primary manual-save-button" style="display:none"><i class="icon-chevron-right"></i> <%- _("Finish").t() %></a>\
                <div class="step-buttons-container"></div>\
                <div class="view-all-extractions-button-container"></div>\
            </div>\
            <div class="page-content">\
                <div class="content-header">\
                    <div class="flash-messages-container"></div>\
                </div>\
                <div class="content-body preview-container">\
                    <div class="regex-loading-message" style="display: none;">\
                        <div class="alert alert-info">\
                            <i class="icon-alert"></i>\
                            <%- _("Generating a Regular Expression...").t() %>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        '

    });

});
