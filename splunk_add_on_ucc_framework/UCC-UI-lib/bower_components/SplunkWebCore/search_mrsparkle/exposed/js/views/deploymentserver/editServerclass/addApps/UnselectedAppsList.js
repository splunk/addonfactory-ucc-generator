define(
    [
     'module',
     'views/Base',
     'views/deploymentserver/editServerclass/addApps/UnselectedAppElement'
    ],
  function(
      module,
      BaseView,
      AppElement
  ) {

         return BaseView.extend({
            moduleId: module.id,
            tagName: 'ul',
            className: 'unselectedAppsList apps-list',
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
                 this.collection.on('reset', this.render, this);
                this.model.search.on('change:filter', this.performSearch, this);
            },
            render: function() {
                this.$el.html("");
                var that = this;
                this.collection.each(function(app){
                     var appElement = new AppElement({
                         model: {
                             app: app,
                             selectedAppsDict: that.model.selectedAppsDict
                         }
                     });
                     that.$el.append(appElement.render().el);
                });

                return this;
            },
            performSearch: function() {
                var search = this.model.search.get('filter') ? 'name="*' + this.model.search.get('filter') + '*"': '';  // If user typed in a search

                this.collection.fetch({data:{search:search, count: -1}});
            }
        });
});






