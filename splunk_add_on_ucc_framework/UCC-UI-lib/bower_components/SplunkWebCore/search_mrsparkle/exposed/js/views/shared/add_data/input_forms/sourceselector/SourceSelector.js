define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/add_data/input_forms/sourceselector/Tree',
        'uri/route',
        'util/splunkd_utils',
        'util/string_utils',
        'contrib/text!views/shared/add_data/input_forms/sourceselector/SourceSelector.html'
    ],
    function(
        _, 
        $,
        module, 
        Base,
        Tree,
        route,
        splunkd_utils,
        stringUtils,
        template
    ){
        return Base.extend({
            moduleId: module.id,
            template: template,
            initialize: function(options) {
                var self = this;
                this.explorerUrl = null;
                this.prompt = '';
                this.selectedNode = null;

                if (this.options.browserType == 'files') {
                    this.explorerUrl = route.fileExplorer(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        this.model.application.get("owner"),
                        this.model.application.get("app")
                    );
                    this.prompt = _('File path').t();
                } else if (this.options.browserType == 'registry') {
                    this.explorerUrl = route.regExplorer(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        this.model.application.get("owner"),
                        this.model.application.get("app")
                    );
                    this.prompt = _('Registry hive').t();
                } else if (this.options.browserType == 'ad') {
                    this.explorerUrl = route.adExplorer(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        this.model.application.get("owner"),
                        this.model.application.get("app")
                    );
                    this.prompt = _('Active Directory path').t();
                }

                Base.prototype.initialize.apply(this, arguments);

                if (this.model.classicUrl) {
                    this.model.classicUrl.on('change:file', function(){
                        this.render();
                    }.bind(this));
                }


                this.children.tree = new Tree({
                    collection: this.collection,
                    model: this.model,
                    deferreds: this.options.deferreds,
                    explorerUrl: this.explorerUrl,
                    urlArgsOverride: this.options.urlArgsOverride
                });

                this.children.tree.on('select', function(node){
                    self.selectedNode = node;
                    self.$('.selected-path').text(
                        stringUtils.truncateString(node.id, 125, 45, 80));
                }, this);

                this.children.tree.on('fetchError', function(message){
                    this.options.flashMsgHelper.addGeneralMessage('fetch-error', message);
                }, this);


            },

            getSelectedNode: function() {
                return this.selectedNode;
            },

            render: function() {
            	this.$el.html(this.compiledTemplate({
                      selectedPath : this.model.sourceModel.get('input'),
                      prompt: this.prompt
                  }));
                          
                this.$el.prepend(this.children.tree.render().el);
                return this;
            }

        });
    }
);
