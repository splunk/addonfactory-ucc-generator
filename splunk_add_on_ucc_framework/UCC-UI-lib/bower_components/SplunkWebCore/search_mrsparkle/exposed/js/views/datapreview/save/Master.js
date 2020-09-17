define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/Base',
    'views/shared/FlashMessages',
    'views/shared/controls/ControlGroup',
    'views/shared/controls/SyntheticSelectControl',
    'models/knowledgeobjects/Sourcetype',
    'splunk.util'
],
function(
    _,
    $,
    Backbone,
    module,
    Base,
    FlashMessages,
    ControlGroup,
    SyntheticSelectControl,
    SourcetypeModel,
    splunkUtil
){
    return Base.extend({
        moduleId: module.id,
        initialize: function(options) {
            Base.prototype.initialize.apply(this, arguments);

            this.isLite = this.model.serverInfo.isLite();

            this.children.flashMessages = new FlashMessages({
                helperOptions: {
                    postProcess: function(errors){
                        if(errors && errors.length > 0 ){
                            var realErrors = [];
                            for(var i = 0, len = errors.length;i<len;i++){
                                var error = errors[i];
                                if(error && error.get){
                                    var message = error.get('html') || '';
                                    if(message.indexOf('An object with name=') < 0){
                                        realErrors.push(error);
                                    }
                                }
                            }
                            return realErrors;
                        }
                        return errors;
                    }
                }
            });

            this.children.sourcetypeName = new ControlGroup({
                label: _("Name").t(),
                controlType: 'Text',
                controlOptions: {
                    model: this.model.sourcetypeModel.entry,
                    modelAttribute: 'name',
                    className:'fieldName',
                    save: false,
                    updateModel: false
                }
            });

            this.children.description = new ControlGroup({
                label: _('Description').t(),
                controlType: 'Text',
                controlOptions: {
                    model: this.model.sourcetypeModel.entry.content,
                    modelAttribute: 'description',
                    className: 'fieldDesc',
                    save: false,
                    updateModel: false
                }
            });

            var categoryItems = this.buildCategoryItems();
            this.children.categorySelect = new ControlGroup({
                label: _('Category').t(),
                controlType: 'SyntheticSelect',
                controlOptions: {
                    model: this.model.sourcetypeModel.entry.content,
                    modelAttribute: 'category',
                    items: categoryItems,
                    className: 'fieldCategorySelect',
                    toggleClassName: 'btn',
                    popdownOptions: {
                        attachDialogTo: 'body'
                    },
                    save: false,
                    updateModel: false
                }
            });

            var appItems = this.buildAppItems();
            this.children.appSelect = new ControlGroup({
                label: _('App').t(),
                controlType: 'SyntheticSelect',
                controlOptions: {
                    model: this.model.sourcetypeModel.entry.acl,
                    modelAttribute: 'app',
                    items: appItems,
                    className: 'fieldAppSelect',
                    toggleClassName: 'btn',
                    popdownOptions: {
                        attachDialogTo: 'body'
                    },
                    save: false,
                    updateModel: false
                }
            });

            //TODO could not find more elegant way to set default values.
            var currentName = this.model.sourcetypeModel.entry.get('name');
            if(currentName === 'default' || currentName === '__auto__learned__'){
                this.children.sourcetypeName.childList[0].setValue('');
                this.children.categorySelect.childList[0].setValue('Custom');

                if(this.isLite){
                    //if isLite, default to search namespace
                    this.children.appSelect.childList[0].setValue('search');
                }else{
                    //set app namespace to current app context in URL
                    this.children.appSelect.childList[0].setValue(this.model.application.get('app'));
                }
            }

        },
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
        buildCategoryItems: function(){
            return this.collection.sourcetypesCollection.getCategories();
        },
        save: function(){
            var self = this;
            var sourcetypeName = this.children.sourcetypeName.childList[0].getValue();
            var app = this.children.appSelect.childList[0].getValue();
            var owner = 'nobody';

            var propsToSave = this.model.sourcetypeModel.getExplicitProps();
            propsToSave.pulldown_type = 'true';
            propsToSave.description = this.children.description.childList[0].getValue();
            propsToSave.category = this.children.categorySelect.childList[0].getValue();

            var newModel = new SourcetypeModel();
            newModel.entry.set('name', sourcetypeName);
            newModel.entry.acl.set('app', app);
            newModel.entry.content.set(propsToSave);
            newModel.set('name', sourcetypeName);

            this.children.flashMessages.register(newModel);
            if (!newModel.entry.isValid(true)) {
                return;
            }

            newModel.save({}, {data: {
                app: app,
                owner: owner
            }})
                .done(function(){
                    self.onSaveDone.apply(self, [newModel]);
                })
                .fail(function(jqXhr){
                    if(parseInt(jqXhr.status, 10) === 409){
                        //409 is splunkd telling us we have name conflict.
                        self.confirmOverwrite(sourcetypeName, function(confirmed){
                            if(!confirmed){
                                return;
                            }
                            //TODO must overwrite with the same app TODO
                            var fullId = ['/servicesNS', encodeURIComponent(owner), encodeURIComponent(app), 'saved/sourcetypes', encodeURIComponent(sourcetypeName)].join('/');
                            newModel
                                .set({
                                    id: fullId
                                })
                                .save({data:{
                                    app: app,
                                    owner: owner
                                }}).done(function(){
                                    self.onSaveDone.apply(self, [newModel]);
                                });
                        });
                    }
                });
        },
        onSaveDone: function(newModel){
            var id = newModel && newModel.entry && newModel.entry.get('name');
            this.trigger('savedSourcetype', id);
        },
        confirmOverwrite: function(name, callback){
            this.model.previewPrimer.trigger('confirmOverwrite', name, callback);
        },
        render: function() {
            this.$el.append(this.children.flashMessages.render().el);
            this.$el.append(this.children.sourcetypeName.render().el);
            this.$el.append(this.children.description.render().el);
            this.$el.append(this.children.categorySelect.render().el);
            this.$el.append(this.children.appSelect.render().el);

            if(this.isLite){
                this.children.appSelect.$el.hide();
            }

            return this;
        }
    });
});