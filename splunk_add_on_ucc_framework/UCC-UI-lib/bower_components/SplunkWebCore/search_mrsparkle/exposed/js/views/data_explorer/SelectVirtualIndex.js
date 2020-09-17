/**
 * @author jszeto and frobinson
 * @date 6/30/14, 7/30/14
 *
 * Represents the first step of the Data Explorer. Retrieves user's available Providers from Data Controller. Displays
 * user's providers in a SyntheticSelectControl dropdown. Upon selection of a provider, populates a second synthetic
 * select dropdown with only the selected provider's virtual indices.  User must select a vix to move to next wizard step.
 * If user changes provider, vix dropdown will repopulate, display relevant vix for new selected provider.
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'collections/services/data/vix/Indexes',
        'splunk.util',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/FlashMessages',
        'uri/route',
        'util/splunkd_utils',
        'contrib/text!views/data_explorer/SelectVirtualIndex.html'
    ],

    function ($,
              _,
              Backbone,
              module,
              Indexes,
              splunkUtil,
              BaseView,
              ControlGroup,
              SyntheticSelectControl,
              FlashMessagesView,
              route,
              splunkDUtils,
              SelectVixTemplate
        ) {

        var NO_PROVIDERS_ERROR = "__no_providers_error";
        var NO_VIX_ERROR = "__no_vix_error";

        var SelectVirtualIndex = BaseView.extend({
            moduleId: module.id,
            template: SelectVixTemplate,
            initialize: function (options) {
                BaseView.prototype.initialize.call(this, options);

                this.children.flashMessagesView = this.options.flashMessagesView;
                //TODO: implement synthetic error handling/message display for no providers or no vixes on a provider. Offer link for user to add provider or vix
                this.providerItems = [];
                this.getAndLoadProviders();

                this.children.providerSelect = new ControlGroup({
                    controlType: "SyntheticSelect",
                    label: _("Provider ").t(),
                    controlOptions: {
                        toggleClassName: 'btn',
                        menuClassName: 'dropdown-menu-prov-vix',
                        items: this.providerItems,
                        popdownOptions: {attachDialogTo: 'body'},
                        prompt: 'Select Provider',
                        value: 'select provider',
                        model: this.model.state,
                        modelAttribute: 'selectedProvider'
                    }
                });

                this.children.vixSelect = new SyntheticSelectControl({toggleClassName: 'btn',
                    menuClassName: 'dropdown-menu-prov-vix',
                    popdownOptions: {attachDialogTo: 'body'},
                    prompt: 'Select Virtual Index',
                    items: [
                   //TODO: don't have to include dummy items after resolution of JIRA (SPL-87922) to fix once items [] can default to undefined without something passed in
                        {label: "", value: undefined}
                    ],
                    model: this.model.state,
                    value: 'select index',
                    modelAttribute: 'selectedVirtualIndex'});

                this.children.vixSelectGroup = new ControlGroup({
                    label: _("Virtual Index").t(),
                    controls: [this.children.vixSelect]
                });
                this.model.state.on('change:selectedProvider', this.populateVixSelect, this);
                //listener added per jszeto request
                this.collection.vix.on('reset add remove change', this.onCollectionChange, this);
            },
            //handler for client-side changes to the collection, added per jszeto
            onCollectionChange: function () {
                this.getAndLoadProviders();
                this.debouncedRender();
            },

            /**
             Iterates over the vix and provider collections passed in from DataExplorerController.js, loads
             each provider into providers hash in format
             for SyntheticSelectControl's items. Displays
             providers to the user in SyntheticSelectControl.
             **/
            getAndLoadProviders: function () {
                var providers = {};
                var providerCollection = this.collection.providers;
                this.collection.vix.each(function (vixModel) {
                    providerCollection.each(function(providerModel) {
                        //console.log(providerModel.entry.name);
                        //console.log(providerModel.entry.get('name'));
                        //console.log(vixModel.entry.content.get('vix.provider'));

                        if(providerModel.entry.get('name') === vixModel.entry.content.get('vix.provider')) {
                            var theProvider = vixModel.entry.content.get('vix.provider');
//                            var theProviderFullLabel = "Provider: " + theProvider;
//                            var theVix = vixModel.entry.get('name');
//                            var vixID = vixModel.id;
                            var theProviderDescription = vixModel.entry.content.get('vix.provider.description');
                            if (!providers[theProvider]) {
                                providers[theProvider] = {label: theProvider, value: theProvider, description: theProviderDescription};
                        }
                    }
                    });
                });
                //array to hold the providers
                var secondaryArray = [];
                $.each(providers, function (key, value) {
                    secondaryArray.push(value);
                });
                this.providerItems = secondaryArray;
            },

            /**
             * Gets the selected provider, then iterates through the vix collection to
             * find vix whose provider matches the selected provider. Loads these vix
             * into the items array for the vix select, and enables the vix select.
             */
            populateVixSelect: function () {
                var theSelectedProvider = this.model.state.get('selectedProvider');
                this.model.state.set('selectedVirtualIndex', undefined);
                this.model.state.set('selectedVixName', undefined);
                var vixArray = [];
                var secondaryArray = [];
                if (theSelectedProvider !== undefined) {
                    this.collection.vix.each(function (vixModel) {
                        if (vixModel.entry.content.get('vix.provider') === theSelectedProvider) {
                            var vixID = vixModel.id;
                            var theVixName = vixModel.entry.get('name');
                            var vixDesc = vixModel.entry.content.get('vix.description');
                            var disabled = vixModel.entry.content.get("disabled");
                            vixArray.push({value: vixID, label: theVixName, description: vixDesc, enabled:!disabled});
                        }
                    });
                    $.each(vixArray, function (key, value) {
                        secondaryArray.push(value, key);
                    });
                    this.children.vixSelect.enable();
                }
                this.children.vixSelect.setItems(secondaryArray);
            },

            /**Renders select for vix, but disables if
             provider has not been selected. Otherwise, renders the SSC, displays an
             alert message to show that there are no providers
             **/
            render: function () {
                var showSelectControls = true;
                var pageRouter = route.getContextualPageRouter(this.model.application);

                //detach children
                if (this.children.vixSelectGroup) {
                    this.children.vixSelectGroup.detach();
                }
                if (this.children.providerSelect) {
                    this.children.providerSelect.detach();
                }

                var helpUrl = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.exploredata.selectvirtualindex');

                // Use template
                this.$el.html(this.compiledTemplate({helpUrl:helpUrl}));

                //render the provider dropdown
                this.children.providerSelect.render().appendTo((this.$(".synthetic-select-placeholder1")));
                //render the vix dropdown
                this.children.vixSelectGroup.render().appendTo((this.$(".synthetic-select-placeholder2")));

                //if the user has not chosen a provider yet, disable the vix select
                if (this.model.state.get('selectedProvider') === undefined) {
                    this.children.vixSelect.disable();
                } else {
                    this.children.vixSelect.enable();
                }
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-placeholder"));

                if (this.collection.providers.length == 0) {
                    showSelectControls = false;
                    // TODO [JCS] Use the providers route once we are building against splunk 222778
//                    var providerUrl = pageRouter.providers();
                    var providerUrl = pageRouter.manager('vix_provider_new');
                    var providerMsg = splunkUtil.sprintf(
                        _("The admin has not created any Hadoop providers. <a href='%s'> Create a provider.</a>").t(),
                        providerUrl);
                    this.children.flashMessagesView.flashMsgHelper.addGeneralMessage(NO_PROVIDERS_ERROR,
                         {type: splunkDUtils.WARNING,
                          html:providerMsg});
                } else {
                    this.children.flashMessagesView.flashMsgHelper.removeGeneralMessage(NO_PROVIDERS_ERROR);
                }

                if (this.collection.providers.length > 0 && this.collection.vix.length == 0) {
                    showSelectControls = false;
                    // TODO [JCS] Use the virtualIndexes route once we are building against splunk 222778
//                    var vixUrl = pageRouter.virtualIndexes();
                    var vixUrl = pageRouter.manager('vix_index_new');
                    var vixMsg = splunkUtil.sprintf(
                        _("The admin has not created any virtual indexes for the Hadoop providers. <a href='%s'> Create a virtual index.</a>").t(),
                        vixUrl);
                    this.children.flashMessagesView.flashMsgHelper.addGeneralMessage(NO_VIX_ERROR,
                        {type: splunkDUtils.WARNING,
                         html:vixMsg});
                } else {
                    this.children.flashMessagesView.flashMsgHelper.removeGeneralMessage(NO_VIX_ERROR);
                }

                if (showSelectControls) {
                    this.children.providerSelect.$el.show();
                    this.children.vixSelectGroup.$el.show();
                    this.$(".label-instructions").show();
                } else {
                    this.children.providerSelect.$el.hide();
                    this.children.vixSelectGroup.$el.hide();
                    this.$(".label-instructions").hide();
                }

                return this;
            }
        });

        return SelectVirtualIndex;
    });

