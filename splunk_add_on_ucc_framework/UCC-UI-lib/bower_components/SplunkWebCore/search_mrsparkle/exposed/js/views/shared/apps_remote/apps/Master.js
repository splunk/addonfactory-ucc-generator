define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/apps_remote/apps/app/Master'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        AppView
        ){

        return BaseView.extend({
            moduleId: module.id,
            className: 'results',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.collection.appsRemote.on('sync', this.render, this);
            },

            render: function() {
                this.$el.html('');
                _.each(this.children, function(child, index){
                    child.remove();
                    delete this.children[index];
                }, this);

                if (!this.collection.appsRemote.length) {
                    this.$el.html(_('Nothing was found with selected filters.').t());
                } else {
                    var _AppView = this.options.appViewClass || AppView;
                    this.collection.appsRemote.each(function(model, index) {
                        var appView = new _AppView({
                            model: $.extend(true, {appRemote: model}, this.model),
                            collection: this.collection
                        });
                        this.children['app' + index] = appView;
                        this.$el.append(appView.render().el); 
                    }, this);  
                } 
                return this;
            }
        });
    });
