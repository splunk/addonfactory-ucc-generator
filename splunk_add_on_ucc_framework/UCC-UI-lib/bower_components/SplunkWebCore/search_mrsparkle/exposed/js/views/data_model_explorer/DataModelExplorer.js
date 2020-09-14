/**
 * @author sfishel
 * 
 * The master view for the "data_model_explorer" page.
 *
 * Child Views:
 * 
 * objectList <views/data_model_explorer/ObjectGrid> the grid display of objects in the data model
 *
 * Custom Events:
 *
 * action:goBack - triggered when the user should be navigated back to the previous interface
 * action:selectObject - triggered when an object has been selected from the list
 *     @param objectName {String} the name of the selected object
 */

define([
            'underscore',
            'module',
            'collections/shared/FlashMessages',
            'models/services/datamodel/DataModel',
            'models/shared/Application',
            'views/extensions/DeclarativeDependencies',
            'views/Base',
            'views/shared/FlashMessages',
            'views/data_model_explorer/ObjectGrid',
            'uri/route',
            'models/classicurl'
        ],
        function(
            _,
            module,
            FlashMessagesCollection,
            DataModel,
            Application,
            DeclarativeDependencies,
            BaseView,
            FlashMessagesView,
            ObjectGrid,
            route,
            classicUrl
        ) {
    
    var DataModelExplorer = BaseView.extend({
        
        moduleId: module.id,

        /**
         * @constructor
         * @param options {
         *    model: {
         *        dataModel: <models/services/datamodel/DataModel> the data model being explored
         *        application: <models/shared/Application> the application state model
         *    }
         */
        
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);
            this.children.flashMessages = new FlashMessagesView({ 
                model: {
                    dataModel: this.model.dataModel
                }     
            });
            
            this.children.objectList = new ObjectGrid({
                apiResources: this.apiResources.objectList
            });

            this.deferreds.dataModel.done(function() {
                var editButton = this.$('.edit-objects-button');
                this.model.dataModel.entry.acl.canWrite() ? editButton.show() : editButton.hide();
            }.bind(this));
        },
        
        render: function() {
            var pageRouter = route.getContextualPageRouter(this.model.application),
                editObjectsHref = pageRouter.data_model_editor({ data: { model: this.model.dataModel.id } }),
                html = _(this.template).template({
                    editObjectsHref: editObjectsHref
                });

            this.$el.html(html);
            this.$('.flash-messages-placeholder').replaceWith(this.children.flashMessages.render().el);
            this.$('.object-list-placeholder').replaceWith(this.children.objectList.render().el);
            if(!this.model.dataModel.entry.acl.canWrite()) {
                this.$('.edit-objects-button').hide();
            }

            return this;
        },
        
        template: '\
            <div class="section-padded section-header">\
            	<h2 class="section-title">\
                    <%- _("Select a Dataset").t() %>\
                </h2>\
                <a href="<%- editObjectsHref %>" class="edit-objects-button btn">\
                    <%- _("Edit Datasets").t() %>\
                </a>\
                <div class="flash-messages-placeholder"></div>\
            </div>\
            <div class="object-list-placeholder"></div>\
        '
        
    },
    {
        apiDependencies: {
            dataModel: DataModel,
            application: Application,
            objectList: ObjectGrid
        }
    });

    return DeclarativeDependencies(DataModelExplorer);
    
});
