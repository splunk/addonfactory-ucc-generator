define(['splunkjs/mvc/layoutview'], function(LayoutView) {
    var _layoutView;
    return {
        create: function(options) {
            if (_layoutView) {
                throw new Error('Layout may only be created once');
            }
            _layoutView = new LayoutView(options).render();
            return {
                getContainerElement: function() {
                    return _layoutView.getContainerElement();
                }
            };
        }
    };
});
