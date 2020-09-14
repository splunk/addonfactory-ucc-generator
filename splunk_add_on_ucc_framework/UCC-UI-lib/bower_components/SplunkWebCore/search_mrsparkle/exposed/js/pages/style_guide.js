define(['jquery', 'views/style_guide/Master', 'prettify'], function($, View, prettify) {
        var view = new View();
        view.render().$el.appendTo('body');
        view.onAddedToDocument();

});
