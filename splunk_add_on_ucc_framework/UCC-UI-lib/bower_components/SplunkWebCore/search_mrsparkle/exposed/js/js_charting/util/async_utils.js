define(['jquery', 'underscore'], function($, _) {

    var asyncUtils = {};

    asyncUtils.CANCELLED = 'cancelled';

    // http://www.paulirish.com/2011/requestanimationframe-for-smart-animating
    asyncUtils.requestFrame = _(function(){
        return (
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback){
                window.setTimeout(callback, 50);
            }
        );
    }()).bind(window);

    asyncUtils.cancelFrame = _(function() {
        return (
            window.cancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            // SPL-76580, can't reference window.clearTimeout directly here, IE 7 and 8 might not have defined it yet
            function(id) {
                window.clearTimeout(id);
            }
        );
    }()).bind(window);

    asyncUtils.asyncEach = function(list, callback) {
        var pendingOperation,
            cancelled = false,
            listLength = list.length,
            dfd = $.Deferred(),
            callOnceAndWait = function(i) {
                // the cancel() method will try to de-queue the frame, but this is not always supported
                // so also logically cancel the work just to be safe
                if(cancelled) {
                    return;
                }
                callback(list[i], i);
                // check if we just processed the last item in the list
                // if so, we're done, if not, queue up the next one
                if(i < listLength - 1) {
                    pendingOperation = asyncUtils.requestFrame(function() { callOnceAndWait(i + 1); });
                }
                else {
                    dfd.resolve();
                }
            };

        dfd.cancel = function() {
            cancelled = true;
            if(pendingOperation) {
                asyncUtils.cancelFrame(pendingOperation);
                dfd.reject(asyncUtils.CANCELLED);
            }
        };

        callOnceAndWait(0);
        return dfd;
    };

    return asyncUtils;

});