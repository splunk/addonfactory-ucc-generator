define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'models/Base',
    'models/ACLReadOnly',
    'views/Base',
    'views/shared/controls/ControlGroup',
    'views/shared/permissions/Master',
    'util/splunkd_utils',
    'util/field_extractor_utils'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseModel,
        ACLReadOnlyModel,
        BaseView,
        ControlGroup,
        PermissionsView,
        splunkd_utils,
        fieldExtractorUtils
    ) {

    return BaseView.extend({
        moduleId: module.id,
        /**
         * @constructor
         * @param options {
         *     model: {
         *         extraction <models.services.data.props.Extraction>
         *         user <models.services.authentication.User>
         *         application <models.shared.Application>
         *     }
         *     collection: {
         *         roles <collections.services.authorization.Roles>
         *     }
         * }
         */
        initialize: function(options) {
            var DEFAULT_ACL_SETTINGS = {
                    app: this.model.application.get('app'),
                    can_change_perms: true,
                    can_list: true,
                    can_share_app: true,
                    can_share_global: true,
                    can_share_user: true,
                    can_write: true,
                    modifiable: true,
                    owner: this.model.application.get('owner'),
                    perms: {
                       read: [
                          "*"
                       ],
                       write: [
                          "admin"
                       ]
                    },
                    removable: true,
                    sharing: 'user'
                },
                defaults = {
                    nameKey: 'name'
                },
                permissionsParams,
                fieldNamesModel;
            _.defaults(this.options, defaults);

            BaseView.prototype.initialize.call(this, this.options);

            if(this.model.extraction.isNew()) {
                this.model.extraction.entry.acl.set(DEFAULT_ACL_SETTINGS);
            }

            this.model.inmem = new ACLReadOnlyModel($.extend(true, {}, this.model.extraction.entry.acl.toJSON()));

            permissionsParams = {
                collection: this.collection.roles,
                displayForControlClass: '',
                displayForLabel: _('Permissions').t(),
                model: {
                    inmem: this.model.inmem,
                    user: this.model.user,
                    serverInfo: this.model.serverInfo
                }
            };

            this.children.permissionsView = new PermissionsView(permissionsParams);

            this.isManualMode = this.model.state.get('interactiveMode') === fieldExtractorUtils.NO_INTERACTION_MODE;
            if (this.model.state.get('method') === 'regex' || this.isManualMode) {
                if(this.model.extraction.isNew()) {
                    this.children.name = new ControlGroup({
                        controlType: 'Text',
                        controlClass: 'controls-block',
                        controlOptions: {
                            modelAttribute: this.options.nameKey,
                            model: this.model.extraction.entry.content
                        },
                        label: _('Extractions Name').t()
                    });
                }
                else {
                    this.children.name = new ControlGroup({
                        controlType: 'Label',
                        controlClass: 'controls-block',
                        controlOptions: {
                            modelAttribute: this.options.nameKey,
                            model: this.model.extraction.entry
                        },
                        label: _('Extractions Name').t()
                    });
                }
            } else if (this.model.state.get('method') === 'delim') {
                this.children.name = new ControlGroup({
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'reportName',
                        model: this.model.state
                    },
                    label: _('Extractions Name').t()
                });
            }
            
            var typeLabel = _('Source type').t();
            if (this.model.state.get('type') === 'source') {
                typeLabel = _('Source').t();
            }

            this.children.sourcetype = new ControlGroup({
                controlType: 'Label',
                controlOptions: {
                    modelAttribute: 'stanza',
                    model: this.model.extraction.entry.content
                },
                label: typeLabel
            });

            fieldNamesModel = new BaseModel({ fieldNames:
                fieldExtractorUtils.getCaptureGroupNames(this.model.state.get('regex'))
            });
            this.children.fieldNames = new ControlGroup({
                controlType: 'Label',
                controlOptions: {
                    modelAttribute: 'fieldNames',
                    model: fieldNamesModel
                },
                label: _('Fields').t()
            });

            if(!this.isManualMode && this.model.extraction.isNew() && this.model.state.get('requiredText')){
                this.children.requiredText = new ControlGroup({
                    controlType: 'Label',
                    controlOptions: {
                        modelAttribute: 'requiredText',
                        model: this.model.state
                    },
                    label: _('RequiredText').t()
                });
            }

            if (this.model.state.get('method') === 'regex' || this.isManualMode) {
                this.children.regex = new ControlGroup({
                    controlType: 'Label',
                    controlOptions: {
                        modelAttribute: 'value',
                        model: this.model.extraction.entry.content
                    },
                    label: _('Regular Expression').t()
                });
            } else if (this.model.state.get('method') === 'delim') {
                this.children.regex = new ControlGroup({
                    controlType: 'Label',
                    controlOptions: {
                        modelAttribute: 'delimType',
                        model: this.model.state
                    },
                    label: _('Delimiter').t()
                });
            }
        },
        saveExtractions: function() {
            var data = { app: this.model.inmem.get("app") };
                data.owner = (this.model.inmem.get('sharing') !== splunkd_utils.USER) ?
                    splunkd_utils.NOBODY : this.model.application.get("owner");
            var transformSavedDfd = $.Deferred(),
                aclDfd = $.Deferred();

            if (this.model.state.get('method') === 'delim') {
                var reportName = this.model.state.get('reportName') ? 'REPORT-' + this.model.state.get('reportName') : "";
                reportName = reportName.replace(/\s/g, '');
                this.model.transform.entry.content.set({
                    name: reportName
                });
                this.model.extraction.entry.content.set({
                    value: reportName,
                    name: reportName
                });

                transformSavedDfd = this.model.transform.save({}, { data: data});
            } else {
                transformSavedDfd.resolve();
            }
            // TODO: update ACL for tranforms too?
            transformSavedDfd.done( function() {
                var result = $.Deferred();
                if(this.model.extraction.isNew()) {
                    result = this.model.extraction.save({}, { data: data }).then(_(this.updateACL).bind(this));
                } else {
                    result = this.model.extraction.save().then(_(this.updateACL).bind(this));
                }
                result.done(function() {
                    aclDfd.resolve();
                });
            }.bind(this));

            return aclDfd;
        },
        updateACL: function() {
            var data = this.model.inmem.toDataPayload();
            data.owner = this.model.application.get('owner');
            return this.model.extraction.acl.save({}, { data: data });
        },
        renderEvents: function() {
            var noRequiredTextObject = {text: ''},
                noStartIndex = -1;
            if(this.model.state.get('masterEvent') && this.model.state.get('masterEvent').length > 0) {
                $(_(this.sampleEventTemplate).template({})).appendTo(this.$('.review-extractions-form'));
                var requiredTextObject = {text: this.model.state.get('requiredText')};
                this.$('.master-event-wrapper').html($('<div class="event-text"></div>').html(
                    fieldExtractorUtils.replaceBoundingGroupsWithTemplate(
                        this.model.state.get('masterEvent'),
                        this.model.state.get('examples'),
                        requiredTextObject,
                        noStartIndex,
                        fieldExtractorUtils.highlightedContentTemplate
                    )
                ));
            }
            _(this.model.state.get('sampleEvents')).each((function(sample, i) {
                this.$('.sample-events-wrapper').append($('<div class="event-text"></div>').html(fieldExtractorUtils.replaceBoundingGroupsWithTemplate(
                    sample.rawText,
                    sample.extractions,
                    noRequiredTextObject,
                    noStartIndex,
                    fieldExtractorUtils.highlightedContentTemplate,
                    this.model.state.get('examples')
                )));
            }).bind(this));
        },
        render: function() {
            this.$el.html(this.compiledTemplate({
                extractionIsNew: this.model.extraction.isNew()
            }));

            this.children.name.render().appendTo(this.$('.save-extractions-form'));

            if (this.model.state.get('method') === 'regex' || this.isManualMode) {
                if (this.model.extraction.isNew()) {
                    this.children.name.$('.control').prepend($("<span class='extract-prelabel'>EXTRACT-</span>"));
                }
            } else if (this.model.state.get('method') === 'delim'){
                this.children.name.$('.control').prepend($("<span class='extract-prelabel'>REPORT-</span>"));
            }

            this.children.permissionsView.render().appendTo(this.$('.save-extractions-form'));

            this.children.sourcetype.render().appendTo(this.$('.review-extractions-form'));

            if(!this.isManualMode) {
                this.renderEvents();
            }

            this.children.fieldNames.render().appendTo(this.$('.review-extractions-form'));
            if(this.children.requiredText) {
                this.children.requiredText && this.children.requiredText.render().appendTo(this.$('.review-extractions-form'));
            }

            this.children.regex.render().appendTo(this.$('.review-extractions-form'));

            return this;
        },
        template: '\
            <div class="save-extractions-container">\
                <div class="save-extractions-form form-horizontal"></div>\
                <div class="review-extractions-form form-horizontal"></div>\
            </div>\
        ',
        sampleEventTemplate: '\
            <div class="sample-event-container">\
                <span class="sample-event-label control-label" for="sample-events-wrapper"><%- _("Sample event").t() %></span>\
                <div class="events-wrapper">\
                    <div class="master-event-wrapper"></div>\
                    <div class="sample-events-wrapper"></div>\
                </div>\
            </div>\
        '
    });
});
