/* globals assert */
define([
            'jquery',
            'underscore'
        ],
        function(
            $,
            _
        ) {

    var Module = {

        verifyVisibleChild: function(modalView, childName) {
            var child = modalView.children[childName];
            if(!child) {
                throw new Error('The modal has no child named ' + childName);
            }
            _(modalView.children).each(function(thisChild, thisChildName) {
                if(child === thisChild) {
                    assert.ok($.contains(modalView.el, child.el), 'the ' + childName + ' child has been appended to the modal');
                    assert.ok(child.$el.css('display') !== 'none', 'the ' + childName + ' child is visible');
                }
                else {
                    assert.ok(
                        thisChild.$el.css('display') === 'none' || !$.contains(modalView.el, thisChild.el),
                        'the ' + thisChildName + ' child is not visible'
                    );
                }
            });
        }

    };

    return { Module: Module };

});