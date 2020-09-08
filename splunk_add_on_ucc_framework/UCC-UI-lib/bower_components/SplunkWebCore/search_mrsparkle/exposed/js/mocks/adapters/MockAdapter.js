/**
 * @author sfishel
 *
 * A mock adapter for use in unit tests.
 * Note - Added support for multiple request handling (handled using a stack, so LIFO)
 *
 * For documentation and usage, see: http://eswiki.splunk.com/QUnit#Shared_Testing_Code
 */

define(['jquery', 'backbone'], function($, Backbone) {

    return function() {

        var createAbortablePromise = function(dfd) {
            var promise = dfd.promise();
            promise.aborted = false;
            promise.abort = function() {
                promise.aborted = true;
            };
            return promise;
        };

        var syncFn = function(method, modelOrCollection, options) {
            var promise;

            switch(method) {
                case 'read':
                    promise = createAbortablePromise(syncFn.readSpy(modelOrCollection, options));
                    syncFn.readCallStack.push(syncFn.readSpy.lastCall);
                    break;
                case 'create':
                    promise = createAbortablePromise(syncFn.createSpy(modelOrCollection, options));
                    syncFn.createCallStack.push(syncFn.createSpy.lastCall);
                    break;
                case 'update':
                    promise = createAbortablePromise(syncFn.updateSpy(modelOrCollection, options));
                    syncFn.updateCallStack.push(syncFn.updateSpy.lastCall);
                    break;
                case 'delete':
                    promise = createAbortablePromise(syncFn.deleteSpy(modelOrCollection, options));
                    syncFn.deleteSpy.lastCall.deletedId = modelOrCollection.id;
                    syncFn.deleteCallStack.push(syncFn.deleteSpy.lastCall);
                    break;
            }
            modelOrCollection.trigger('request', modelOrCollection, promise, options);
            return promise;
        };

        $.extend(syncFn, {
            _isMockAdapter: true,
            readSpy: sinon.spy(function(){return $.Deferred();}),
            createSpy: sinon.spy(function(){return $.Deferred();}),
            updateSpy: sinon.spy(function(){return $.Deferred();}),
            deleteSpy: sinon.spy(function(){return $.Deferred();}),
            readCallStack: [],
            createCallStack: [],
            updateCallStack: [],
            deleteCallStack: [],

            getLastCall: function(stack) {
                return stack.pop();
            },
            respondToRead: function(response, options) {
                var lastRead = this.getLastCall(syncFn.readCallStack),
                    modelOrCollection = lastRead.args[0],
                    readDeferred = lastRead.returnValue;

                response = response || (modelOrCollection instanceof Backbone.Model ? {} : []);
                syncFn._respond(lastRead, response, options || {}, readDeferred);
            },

            respondToCreate: function(response, options) {
                var lastCreate = this.getLastCall(syncFn.createCallStack),
                    modelOrCollection = lastCreate.args[0],
                    createDeferred = lastCreate.returnValue;

                response = response || (modelOrCollection instanceof Backbone.Model ? {} : []);
                syncFn._respond(lastCreate, response, options || {}, createDeferred);
            },

            respondToUpdate: function(response, options) {
                var lastUpdate = this.getLastCall(syncFn.updateCallStack),
                    modelOrCollection = lastUpdate.args[0],
                    updateDeferred = lastUpdate.returnValue;

                response = response || (modelOrCollection instanceof Backbone.Model ? {} : []);
                syncFn._respond(lastUpdate, response, options || {}, updateDeferred);
            },

            respondToDelete: function(response, options) {
                var lastDelete = this.getLastCall(syncFn.deleteCallStack),
                    deleteDeferred = lastDelete.returnValue;
                response = response || true;
                syncFn._respond(lastDelete, response, options || {}, deleteDeferred);
            },

            _respond: function(spyCall, response, options, deferred) {
                var responseType = (options && options.error) ? 'error' : 'success',
                    syncOptions = spyCall.args[1];

                if(syncOptions.hasOwnProperty(responseType)) {
                    spyCall.yieldTo(responseType, response);
                }
                if (responseType === "error") {
                    deferred.reject(response);
                } else {
                    deferred.resolve(response);
                }

            }

        });

        return syncFn;

    };

});
