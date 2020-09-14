define([
    'jquery',
    'underscore',
    'module',
    'views/shared/ModalLocalClassNames',
    './Title',
    './Contents'
],
function(
    $,
    _,
    module,
    ModalView,
    TitleView,
    ContentsView
){
    return ModalView.extend({
        moduleId: module.id,
        initialize: function() {
            this.options.titleView = new TitleView({
                model: {
                    serverInfo: this.options.model.serverInfo
                }
            });
            this.options.bodyView = new ContentsView({
                collection: this.options.collection,
                model: {
                    application: this.options.model.application,
                    appLocal: this.options.model.appLocal,
                    serverInfo: this.options.model.serverInfo
                }
            });

            ModalView.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            ModalView.prototype.render.apply(this, arguments);
        }
    });
});
