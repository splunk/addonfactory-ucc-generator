define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'collections/Base',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        BaseModel,
        BaseCollection,
        splunkDUtils
    ) {
    var AST = BaseModel.extend({
        url: 'search/ast',
        
        initialize: function() {
            BaseModel.prototype.initialize.apply(this, arguments);
            
            this.initializeAssociated();
            this.setActionsDefaults();
        },
        
        initializeAssociated: function() {
            // do a dynamic lookup of the current constructor so that this method is inheritance-friendly
            var RootClass = this.constructor;
            this.associated = this.associated || {};
            
            //associated
            this.actions = this.actions || new RootClass.ActionsCollection();
            this.associated.actions = this.actions;
        },
        
        sync: function(method, model, options) {
            var syncOptions, attrs;
            
            // You must always use the AST model with fetch
            if (method !== 'read') {
                throw new Error('Sync operation not supported: ' + method);
            }
            
            options = $.extend(true, {}, options, {
                // these URLs can be quite long, so we make this request by POST
                type: 'POST',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            });
            
            // Will remove the data.app, data.owner, and data.sharing
            syncOptions = splunkDUtils.prepareSyncOptions(options, model.url);
            
            // get the json attrs from the model
            attrs = syncOptions.attrs || model.toJSON(syncOptions);
            
            // make sure to prepare the options for the POST so they don't 
            // get from encoded
            syncOptions.data = JSON.stringify(attrs);
            
            return BaseModel.prototype.sync.call(this, 'read', model, syncOptions);
        },
        
        toJSON: function(options) {
            var baseJSON = BaseModel.prototype.toJSON.apply(this, arguments),
                actionsJSON = this.actions.toJSON(options);
            
            if (!_.isEmpty(actionsJSON)) {
                baseJSON.actions = actionsJSON;
            }
            
            return baseJSON;
        },
        
        setActionsDefaults: function(options) {
            // Override to set your default actions
        },
        
        clear: function(options) {
            options = options || {};
            
            // Default the reset of the actions to get the default visitors for the AST
            _.defaults(options, { setDefaults: true });
            
            BaseModel.prototype.clear.apply(this, arguments);
            
            if (options.setDefaults) {
                this.setActionsDefaults(options);
            }
            
            return this;
        },
        
        // recursive search for a nodes that match a command
        findCommandNodes: function(command, ast) {
            var list = [];
            
            ast = ast || this.get('ast');
            
            if (!ast || !command) {
                return list;
            }
            
            this.recursiveFindCommandNodes(ast, command, list);
            
            return list;
        },
        
        recursiveFindCommandNodes: function(ast, command, list) {
            if (!ast) {
                return;
            }
            
            if (ast.command === command) {
                list.push(ast);
            }
            
            _.each(ast.sources, function(subAst) {
                return this.recursiveFindCommandNodes(subAst, command, list);
            }.bind(this));
        },

        isTransforming: function() {
            var ast = this.get('ast');

            if (ast) {
                return (ast.pipeline === 'report') || (ast.pipeline === 'streamreport');
            }

            return false;
        }
        
    }, {
        ActionsCollection: BaseCollection
    });
    
    return AST;
});