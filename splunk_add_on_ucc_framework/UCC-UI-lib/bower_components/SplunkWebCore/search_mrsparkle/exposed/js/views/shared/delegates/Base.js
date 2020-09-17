/**
 *   views/shared/delegates/Base
 *
 *   Desc:
 *     This a base class for other delegates.

 *   @param {Object} (Optional) options An optional object literal having one settings.
 *
 *    Usage:
 *       var p = new DelegateBase({el: {el}})
 *
 *    Options:
 *        el (required): The event delegate
 */


define([ 'views/Base' ],function(BaseView){
    return BaseView.extend({
        
        initialize: function() {
            //no-op
        },

        wake: function() {
            //no-op
        },

        sleep: function() {
            //no-op
        },
        
        /**
         * Due to the nature of delegates acting as decorators (delegates do not own
         * their root el), we need to override on base class methods that operate on 
         * DOM elements that the view owns.
         */
        remove: function() {
            this.stopListening();
            return this;
        },

        detach: function() {
            throw new Error('detach is not supported by delegates.');
        },
        
        appendTo: function() {
            throw new Error('jQuery-like attachment methods are not supported by delegates.');
        },

        prependTo: function() {
            throw new Error('jQuery-like attachment methods are not supported by delegates.');
        },

        replaceAll: function() {
            throw new Error('jQuery-like attachment methods are not supported by delegates.');
        },

        insertBefore: function() {
            throw new Error('jQuery-like attachment methods are not supported by delegates.');
        },

        insertAfter: function() {
            throw new Error('jQuery-like attachment methods are not supported by delegates.');
        }

    });
});
