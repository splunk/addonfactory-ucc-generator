/**
 * @author jszeto, frobinson
 * @date 6/30/14, 7/28/14
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'contrib/text!views/data_explorer/ReviewSettings.html',
    'views/shared/controls/TextareaControl',
    'views/shared/FlashMessages',
    './EditSourceModal',
    'uri/route'
    ],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        ReviewSettingsTemplate,
        TextAreaControl,
        FlashMessagesView,
        EditSourceModal,
        route
        ) {

        return BaseView.extend({
            moduleId: module.id,
            template: ReviewSettingsTemplate,

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.state = new Backbone.Model( {text: ""});

                this.children.propsText = new TextAreaControl({model: this.state, modelAttribute: 'text'});
                this.children.flashMessagesView = new FlashMessagesView({model: this.model});
                this.editedText = "";   
                this.listenTo(this.model.explorerState,
                    "change:appName change:selectedProvider change:selectedSource change:selectedSourceType change:selectedVirtualIndex change:sharing",
                    this.debouncedRender);
            },

            updateSource: function() {
                this.model.explorerState.set('selectedSource', this.editSourceModel.get('editedSource'));
                //console.log("selected source updated", this.model.explorerState.get('selectedSource'));
            },

            events : {
                'click  .edit' : function (e) {
                    e.preventDefault();

                    this.editedText = this.model.explorerState.get('selectedSource');
                    //console.log(this.editedText);

                    this.editSourceModel = new Backbone.Model({originalSource: this.editedText, editedSource: ""});
                    this.editSourceModel.on('change:editedSource', this.updateSource, this);
                    //console.log("original source " , this.editSourceModel.get('originalSource'));

                    this.children.editSourceDialog = new EditSourceModal({
                        model: {
                            editSource: this.editSourceModel
                        },
                        onHiddenRemove: true
                    });

                    this.children.editSourceDialog.render().appendTo($("body"));
                    this.children.editSourceDialog.show();

                }

            },

                //retrieves the source and sourcetype that will be saved to props.conf from the state model,
            //loads them into the text area for display to user
            getAndLoadPropsText: function() {
                var stateModel = this.model.explorerState;
                if(stateModel.get("selectedSourceType") !== undefined) {
                    var sourceString = stateModel.get("selectedSource");
                    var propConfString = "[source::" + sourceString + "]\n";
                    var sourceTypeString = stateModel.get("selectedSourceType");
                    propConfString += "sourcetype = " + sourceTypeString;
                    //console.log(propConfString);
                    this.state.set('text', propConfString);
                    this.children.propsText.disable();
                }
            },

            render: function() {
                var stateModel = this.model.explorerState;

                this.getAndLoadPropsText();

                var helpUrl = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.exploredata.review');

                var template = this.compiledTemplate ({
                    sourcetype : stateModel.get("selectedSourceType"),
                    appContext : stateModel.get("appName"),
                    theProvider: stateModel.get("selectedProvider"),
                    vix : stateModel.get("selectedVixName"),
                    sharingSetting: stateModel.get("sharing"),
                    source: this.model.explorerState.get("selectedSource"),
                    helpUrl:helpUrl
                });

                this.$el.html(template);

                this.children.propsText.render().appendTo((this.$(".textarea-placeholder")));
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-placeholder"));

                return this;
             }
        });

    });

