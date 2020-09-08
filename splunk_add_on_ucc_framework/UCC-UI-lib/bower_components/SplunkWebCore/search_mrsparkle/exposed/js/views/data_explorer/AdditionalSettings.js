/**
 * @author jszeto
 * @date 6/30/14
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/SyntheticSelectControl',
    'views/shared/controls/SyntheticRadioControl',
    'views/shared/controls/ControlGroup',
    'contrib/text!views/data_explorer/AdditionalSettings.html',
    'views/shared/FlashMessages',
    'uri/route',
    'util/splunkd_utils'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        SyntheticSelectControl,
        SyntheticRadioControl,
        ControlGroup,
        AdditionalSettingsTemplate,
        FlashMessagesView,
        route,
        splunkd_utils
        ) {

        return BaseView.extend({
            moduleId: module.id,
            template: AdditionalSettingsTemplate,


            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.appItems = [];
                this.getAndLoadApps();
                if (this.collection.apps.length !== 0) {
                    this.getAndLoadApps();
                }

                this.listenTo(this.model.acl, "change", this.aclChanged);

                this.children.appContextSelect = new ControlGroup( {
                    controlType: "SyntheticSelect",
                    label: _("App Context: ").t(),
                    controlOptions: {
                        model: this.model.state,
                        modelAttribute: this.options.modelAttribute.appContext,
                        toggleClassName: 'btn',
                        items: this.appItems,
                        popdownOptions: {attachDialogTo: 'body'},
                        prompt: "Select..."
                    }
                    });

                var permission_tabs = [
                        { label: _('App').t(), value: splunkd_utils.APP, className: 'app' },
                        { label: _('All apps').t(), value: splunkd_utils.GLOBAL, className: 'global' }
                ];

                this.children.sharingRadio = new SyntheticRadioControl({
                    enabled: false,
                    model: this.model.state,
                    modelAttribute: this.options.modelAttribute.sharing,
                    items: permission_tabs});

                this.children.sharingRadioGroup = new ControlGroup({
                    controls: [this.children.sharingRadio],
                    controlClass: 'controls-thirdblock',
                    label: _("Sharing Context:").t()});

                this.children.flashMessagesView = new FlashMessagesView({model:this.model});
            },

            getAndLoadApps: function() {
                var app = {};
                var appArray = [];
                this.collection.apps.each(function(appModel){
                    var theAppName = appModel.entry.get('name');
                    var appID = appModel.id;
                    app = {value: appID, label: theAppName};
                    //filter the collection to only show app if user has write permissions
                    // TODO [JCS] Move this logic into the controller. Can we use a search to filter on this value?
                    if(appModel.entry.acl.get('can_write')) {
                        appArray.push(app);
//                        console.log("loaded app name= ", app);
                    }
                });
                var secondaryArray = [];
                $.each(appArray, function(key, value){
                    secondaryArray.push(value);
                });
                this.appItems = secondaryArray;
            },

            aclChanged: function() {
                if (!_(this.model.state.get(this.options.modelAttribute.appContext)).isUndefined())
                    this.children.sharingRadio.enable();
                else
                    this.children.sharingRadio.disable();

                if (!this.model.acl.get("can_share_app")) {
                    this.children.sharingRadio.$('.app').attr('disabled', true);
                }
                if (!this.model.acl.get("can_share_global")) {
                    this.children.sharingRadio.$('.global').attr('disabled', true);
                }
                if(!this.model.acl.get("modifiable")) {
                    this.children.sharingRadio.$('.btn').attr('disabled', true);
                }
            },

            render: function() {
                // Detach children
                if (this.children.appContextSelect) {
                    this.children.appContextSelect.detach();
                }
                if (this.children.sharingRadioGroup) {
                    this.children.sharingRadioGroup.detach();
                }

                var helpUrl = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.exploredata.contextsettings');

                // Use template
                this.$el.html(this.compiledTemplate({helpUrl:helpUrl}));

                // Attach children and render them
                this.children.appContextSelect.render().appendTo(this.$(".context-placeholder"));
                this.children.sharingRadioGroup.render().appendTo(this.$(".sharing-placeholder"));
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-placeholder"));

                return this;
            }

        });
    });


