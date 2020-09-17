define([
    'underscore'
], function (
    _
) {
    /**
     * extend _.result to support function as 'attr'
     * @param {object} obj
     * @param {string|function} attr
     * @returns {*}
     */
    function result(obj, attr) {
        if (_.isFunction(attr)) {
            return attr(obj);
        } else {
            return _.result(obj, attr);
        }
    }

    return {
        /**
         * detect whether there's a cycle in linked list.
         * @param {object} head head of the linked list
         * @param {string|function} next indicates how to access node's next node
         * @param {string|function} [id] node id for comparison
         * @returns {boolean} return true if there's cycle; false if there's no cycle
         * @private
         */
        findCycleInLinkedList: function(head, next, id) {
            // Floyd's cycle-finding algorithm
            // https://en.wikipedia.org/wiki/Cycle_detection#Tortoise_and_hare
            var slow = head;
            var fast = head;

            while (true) {
                slow = result(slow, next);

                if (!result(fast, next)) {
                    return false;
                }
                fast = result(result(fast, next), next);

                if (!slow || !fast) {
                    return false;
                }

                if (slow === fast) {
                    return true;
                }

                if (id && result(slow, id) === result(fast, id)) {
                    return true;
                }
            }
        }
    };
});