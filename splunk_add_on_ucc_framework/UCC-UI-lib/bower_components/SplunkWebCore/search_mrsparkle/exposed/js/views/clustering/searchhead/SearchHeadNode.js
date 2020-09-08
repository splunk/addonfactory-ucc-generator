define([
    'jquery',
    'backbone',
    'module',
    'views/Base',
    'views/clustering/searchhead/SearchHeadGrid',
    'views/clustering/searchhead/SearchHeadDetails',
    'views/clustering/EditMenu',
    'views/clustering/searchhead/AddEditCluster',
    'views/clustering/searchhead/DeleteCluster',
    'views/shared/CollectionPaginator',
    'views/shared/delegates/RowExpandCollapse',
    'models/services/cluster/searchhead/Generation',
    'models/services/cluster/searchhead/SearchheadConfig',
    'models/services/cluster/Config',
    'uri/route',
    'contrib/text!views/clustering/searchhead/SearchHeadNode.html'
],
function(
    $,
    Backbone,
    module,
    BaseView,
    SearchHeadGridView,
    SearchHeadDetailsView,
    EditMenuView,
    AddEditClusterDialog,
    DeleteClusterDialog,
    Paginator,
    RowExpandCollapse,
    SearchheadGenerationModel,
    SearchheadConfigModel,
    ClusterConfigModel,
    route,
    SearchHeadNodeTemplate
) {
    return BaseView.extend({
        moduleId: module.id,
        template: SearchHeadNodeTemplate,
        events: {
            'click .addClusterButton a': 'addConfig',
            'click .editConfig': 'editConfig',
            'click .removeCluster': 'deleteConfig'
        },
        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);

            this.editMenu = new EditMenuView({model: this.model});

            this.searchHeadGridView = new SearchHeadGridView({
                collection: this.collection,
                model: this.model
            });

            this.children.paginator = new Paginator({
                collection: this.collection.searchheadConfigs
            });

            this.searchHeadDetailsView = new SearchHeadDetailsView({
                model: this.model
            });
        },
        render: function() {
            var root = this.model.application.get('root'),
                locale = this.model.application.get('locale'),
                link = route.docHelp(root, locale, 'manager.clustering.searchhead.details');
            var html = this.compiledTemplate({docLink:link});
            this.$el.html(html);
            this.$el.find('.moreInfo').replaceWith(this.searchHeadDetailsView.render().el);
            this.$el.find('.searchHeadGridPlaceHolder').append(this.searchHeadGridView.el);
            this.$el.find('.paginator').append(this.children.paginator.render().el);
            this.$el.find('.editMenu').replaceWith(this.editMenu.render().el);
            return this;
        },
        editConfig: function(e){
            e.preventDefault();
            var target = $(e.target);
            var tr = target.closest('tr');
            var id = tr.attr(RowExpandCollapse.ROW_ID_ATTR);

            var searchheadConfigModel = new SearchheadConfigModel({id: id});
            searchheadConfigModel.fetch();

            var addEditClusterDialog = new AddEditClusterDialog({
                model: searchheadConfigModel
            });

            $('body').append(addEditClusterDialog.render().el);

            addEditClusterDialog.on('stepDone', function(){
                this.collection.searchheadConfigs.fetch();
            }, this);
        },
        addConfig: function(e){
            e.preventDefault();
            var newModel = new SearchheadConfigModel();
            var addEditClusterDialog = new AddEditClusterDialog({
                model: newModel
            });
            $('body').append(addEditClusterDialog.render().el);

            addEditClusterDialog.on('stepDone', function(){
                this.collection.searchheadConfigs.fetch();
            }, this);
        },
        deleteConfig: function(e){
            e.preventDefault();
            var target = $(e.target);
            var tr = target.closest('tr');
            var id = tr.attr(RowExpandCollapse.ROW_ID_ATTR);

            var searchheadConfig = new SearchheadConfigModel({id: id});
            searchheadConfig.fetch();

            var deleteClusterDialog = new DeleteClusterDialog({
                model: searchheadConfig
            });

            deleteClusterDialog.on('stepDone', function(){
                this.collection.searchheadConfigs.fetch();
            }, this);

            this.$el.append(deleteClusterDialog.render().el);
            deleteClusterDialog.show();
        }
    });
});
