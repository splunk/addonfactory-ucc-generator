/**
 * @author jszeto
 *
 * Main view for adding one or more archives
 *
 * INPUTS:
 *
 * model: {
 *     application {models/Application}
 * },
 * collection: {
 *     allArchives {collections/services/data/vix/Indexes} - all of the archive indexes
 *     providers {collections/services/data/vix/Providers}
 *     splunkIndexes {collections/services/data/Indexes} - all of the available splunk indexes
 * }
 *
 */

define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/Base',
        'models/virtual_indexes/AddArchive',
        'models/services/data/vix/Index',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/MultiInputControl',
        'views/shared/controls/TextControl',
        'views/shared/controls/SyntheticCheckboxControl',
        'views/virtual_indexes/custom_controls/TimeSecondsControl',
        'views/virtual_indexes/custom_controls/OptionalTimeSecondsControl',
        'views/shared/FlashMessages',
        'uri/route',
        'util/string_utils',
        'util/splunkd_utils',
        'splunk.util',
        '../shared.pcss',
        './ArchiveSetup.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseModel,
        AddArchive,
        IndexModel,
        BaseView,
        ControlGroup,
        MultiInputControl,
        TextControl,
        SyntheticCheckboxControl,
        TimeSecondsControl,
        OptionalTimeSecondsControl,
        FlashMessagesView,
        route,
        utils,
        splunkDUtils,
        splunkUtils,
        cssShared,
        css
        ){
        return BaseView.extend({
            moduleId: module.id,

            events: {
                'click .btn-primary': function(e) {
                    e.preventDefault();
                    // TODO Clear flashMessages
                    // Validate the addArchive model
                    // Generate new indexes
                    // Add index to flashMessages
                    // Save each new index

                    if (this.model.addArchive.set({}, {validate: true})) {

                        var savedIndexes = [];
                        var indexAttrs = this.model.addArchive.generateVixAttributes();
                        var valid = true;
                        var indexCount = indexAttrs.length;
                        var failCount = 0;
                        var indexesDeferred = $.Deferred();
                        var saveDfd = $.Deferred();

                        if (this.children.unifiedSearchCutoff.isEnabled() && !this.model.limits.getUnifiedSearch()) {
                            // Unified Search is turned on globally when it is turned on for an index.
                            // Only update limits.conf if Unified Search is being turned on.
                            this.model.limits.entry.content.set({'unified_search': 1});
                            $.when(this.model.limits.save()).done(_(function() {
                                saveDfd.resolve();
                            }).bind(this));
                        } else {
                            saveDfd.resolve();
                        }
                        $.when(saveDfd).done(_(function() {
                            _(indexAttrs).each(function(indexAttr) {
                                var indexModel = new IndexModel();
                                this.children.flashMessages.register(indexModel);

                                indexModel.entry.content.set(indexAttr);
                                // TODO [JCS] Do we want to run serially? We could put the indexAttrs into a class variable
                                // We would start off saving the first archive. Once that one completes, then grab the next
                                // item in the indexAttrs array.
                                $.when(indexModel.save())
                                    .done(function() {
                                        savedIndexes.push(indexModel.entry.content.get("vix.output.buckets.from.indexes"));
                                        indexCount--;
                                        if (indexCount == 0) {
                                            indexesDeferred.resolve();
                                        }
                                    })
                                    .fail(function() {
                                        failCount++;
                                        indexCount--;
                                        if (indexCount == 0) {
                                            indexesDeferred.resolve();
                                        }
                                    });
                            }, this);

                        }).bind(this));

                        $.when(indexesDeferred).done(_(function() {
                            if (failCount > 0) {
                                // Remove the successfully saved archives from the MultiInput and send an info message
                                var splunkIndexes = this.model.addArchive.get("originIndexes").split(",");
                                splunkIndexes = _(splunkIndexes).difference(savedIndexes);
                                this.model.addArchive.set("originIndexes", splunkIndexes.join(","));
                                // TODO [JCS] Remove the saved indexes from the MultiInput
                                if (savedIndexes.length > 0) {
                                    this.children.flashMessages.flashMsgHelper.addGeneralMessage("__INDEXES_SAVED__",
                                        {
                                            type: splunkDUtils.INFO,
                                            html: _("Successfully saved archived indexes for these splunk indexes: " + savedIndexes.join(", ")).t()
                                        }); // TODO [JCS] use sprintf
                                }
                            } else {
                                window.location.href = this._getVirtualIndexesRoute();
                            }
                        }).bind(this));
                    }
                },
                'click .cancel': function(e) {
                    e.preventDefault();
                    window.location.href = this._getVirtualIndexesRoute();
                }
            },

            /**
             * @param {Object} options {
             *
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.model.addArchive = new AddArchive();

                this.createIndexesAutoComplete();

                this.children.flashMessages = new FlashMessagesView({ model: this.model.addArchive});

                // TODO [JCS] Get correct model attribute for origin index
                this.originIndexControl = new MultiInputControl({
                    modelAttribute: 'originIndexes',
                    model: this.model.addArchive,
                    autoCompleteFields: this.indexesAutoComplete
                });

                this.children.originIndex = new ControlGroup({
                    className: 'index-origin control-group',
                    controlClass: 'controls-block',
                    controls: [this.originIndexControl],
                    label: _('Splunk Index(es)').t(),
                    tooltip: _('You can add multiple Splunk Enterprise indexes, separated by commas').t()
                });


                this.children.suffix = new ControlGroup({
                    className: 'index-name control-group',
                    controlClass: 'controls-block',
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'suffix',
                        model: this.model.addArchive
                    },
                    label: _('Archived Index Name Suffix').t(),
                    tooltip: _('The suffix that is appended to each index name, for example "_archive"').t()

                });

                this.providerNames = this.collection.providers.map(function(model) {
                    return {label:model.entry.get('name'), value:model.entry.get('name')};
                });
                this.children.provider = new ControlGroup({
                    className: 'index-provider control-group',
                    controlType: 'SyntheticSelect',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'provider',
                        model: this.model.addArchive,
                        items: this.providerNames,
                        className: 'btn-group view-count',
                        menuWidth: 'wide',
                        maxLabelLength: 80,
                        toggleClassName: 'btn',
                        prompt: _("Select a Provider").t()
                    },
                    label: _("Destination Provider").t()
                });

                this.children.archiveDirectory = new ControlGroup({
                    className: 'index-path-hdfs control-group',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'outputDirectory',
                        model: this.model.addArchive
                    },
                    label:   _('Destination Path in HDFS').t(),
                    help:    _('Examples: /home/data/archive/ or hdfs://namenode:8020/user/john/data/').t(),
                    tooltip: _('Root Path where the archived buckets will be stored').t()
                });

                this.timeThresholdControl = new TimeSecondsControl({
                    modelAttribute: 'threshold',
                    model: this.model.addArchive
                });

                this.children.timeThreshold = new ControlGroup({
                    className: 'control-group',
                    controlClass: 'controls-block',
                    controls: [this.timeThresholdControl],
                    label: _('Older Than').t(),
                    tooltip: _('Age at which bucket data should be archived').t()
                });

                var helpText = _('Query against virtual index for events older than this value.').t();
                var docLink = route.docHelp(this.model.application.get('root'),
                                            this.model.application.get('locale'),
                                            'learnmore.unifiedsearch.about');
                var helpLink = ' <a href="' + docLink + '" class="doc" target="_blank">' + _('Learn More').t() + ' <i class="icon-external"></i></a>';
                this.children.unifiedSearchCutoff = new OptionalTimeSecondsControl({
                    enabled: false,
                    modelAttribute: 'cutoff',
                    model: this.model.addArchive,
                    checkboxLabel: _("Enable Unified Search").t(),
                    checkboxHelp: _("Unified Search may increase search runtime.").t(),
                    timeLabel: _('Cutoff Time').t(),
                    timeHelp: helpText + helpLink
                });
            },

            createIndexesAutoComplete: function() {

                // Create the list of autocomplete items for the splunk indexes MultiInput control.
                // We create this list by taking the union of the known splunk indexes (this.collection.splunkIndexes)
                // and the splunk indexes that have already been archived (archivedIndexes). We make sure that this
                // list is sorted and that items in archivedIndexes are disabled (since a splunk index can only be
                // archived into one archive index).
                var archivedIndexes = [];

                // Plunk out the vix.output.buckets.from.indexes value from the list of archive indexes
                this.collection.allArchives.each(function(archive) {
                    var indexes = archive.entry.content.get("vix.output.buckets.from.indexes");
                    // This field is a comma delimited string so we might need to split it
                    indexes = indexes.split(",");
                    if (indexes.length > 1) {
                        archivedIndexes.push(indexes[0]);
                    }
                    else {
                        // if indexes has more than one item, then combine the arrays
                        archivedIndexes = _.union(archivedIndexes, indexes);
                    }
                }, this);

                // Map the splunk indexes into the auto complete object format. By default, they are enabled.
                // Later, we will disable any that have already been archived.
                var indexesAutoComplete = this.collection.splunkIndexes.map(function(index) {
                    var name = index.entry.get("name");
                    return {text:name, id:name, disabled: false};
                }, this);

                _(archivedIndexes).each(function(archivedIndex) {
                    // Find the archived index in the list of splunk indexes
                    var archiveInAutoComplete = _(indexesAutoComplete).findWhere({id:archivedIndex});
                    // If we found it, then disable it since it has already been archived. Otherwise, we need to
                    // add it to the auto complete list in a disabled state
                    if (!_(archiveInAutoComplete).isUndefined()) {
                        archiveInAutoComplete.disabled = true;
                    } else {
                        // Binary search to find where to insert. We want to make sure the list stays sorted
                        var insertedIndex = {text: archivedIndex, id: archivedIndex, disabled: true};
                        var insertPosition = _(indexesAutoComplete).sortedIndex(insertedIndex, "text");
                        // Insert into the right spot
                        indexesAutoComplete.splice(insertPosition, 0, insertedIndex);
                    }
                }, this);

                this.indexesAutoComplete = indexesAutoComplete;
            },

            managerRoute: function(page, options) {
                return route.manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'system',
                    page,
                    options
                );
            },
            _getVirtualIndexesRoute: function() {
                return route.manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'system',
                    'virtual_indexes',
                    {
                        data:
                        {
                            t: 'archives'
                        }
                    });
            },

            render: function() {

                this.$el.html(this.compiledTemplate({managerRoute: this.managerRoute.bind(this)}));
                this.children.flashMessages.render().replaceAll(this.$(".flash-messages-placeholder"));
                this.children.originIndex.render().replaceAll(this.$(".select-indexes-placeholder"));
                this.children.suffix.render().replaceAll(this.$(".suffix-placeholder"));
                this.children.provider.render().replaceAll(this.$(".select-provider-placeholder"));
                this.children.archiveDirectory.render().replaceAll(this.$(".archive-directory-placeholder"));
                this.children.timeThreshold.render().replaceAll(this.$(".input-age-placeholder"));
                this.$('.unified-search-cutoff-wrapper').append(this.children.unifiedSearchCutoff.render().el);

                return this;
            },

            template: '\
                <div class="index-setup section-padded section-header">\
                    <div class="ManagerBar">\
                        <h2 class="ManagerPageTitle section-title">\
                                <%= _("Add Archived Indexes").t() %>\
                        </h2>\
                    <div class="breadcrumb section-description">\
                        <a href="<%- managerRoute("virtual_indexes", {data:{t: "archives"}}) %>"><%= _("Archives").t() %></a>»\
                            <%= _("Add new archived indexes").t() %>\
                    </div>\
                </div>\
                <div class="admin-content dashboard-panel clearfix">\
                    <div class="flash-messages-placeholder"></div>\
                    <div class="select-indexes-placeholder"></div>\
                    <div class="suffix-placeholder"></div>\
                    <div class="select-provider-placeholder"></div>\
                    <div class="archive-directory-placeholder"></div>\
                    <div class="input-age-placeholder"></div>\
                    <div class="unified-search-cutoff-wrapper"></div>\
                    <div class="button-wrapper">\
                        <a href="#" class="btn cancel pull-left"><%- _("Cancel").t() %></a>\
                        <a href="#" class="btn btn-primary pull-right"><%- _("Save").t() %></a>\
                    </div>\
                </div>\
            </div>'

        });
    }
);
