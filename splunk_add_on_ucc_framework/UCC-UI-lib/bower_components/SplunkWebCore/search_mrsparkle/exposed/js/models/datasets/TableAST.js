define(
    [
        'jquery',
        'underscore',
        'models/services/search/AST'
    ],
    function(
        $,
        _,
        BaseAST
    ) {
    var TableAST = BaseAST.extend({
        initialize: function() {
            BaseAST.prototype.initialize.apply(this, arguments);
        },
        
        getInterestingFields: function(options) {
            options = options || {};
            
            var ast = this.get('ast'),
                fields;
            
            if (ast && ast['annotations'] && ast['annotations']['interesting_fields']) {
                fields = ast['annotations']['interesting_fields'];
            }

            if (options.withoutUnfixed) {
                return _.filter(fields, function(field) {
                    return field.name !== TableAST.UNFIXED_NAME;
                });
            }
            
            return fields;
        },

        getFields: function() {
            var ast = this.get('ast'),
                fields;

            if (ast && ast['fields_and_properties']) {
                fields = ast['fields_and_properties'];
            }

            return fields;
        },

        getReferencedFields: function() {
            var fields = this.getFields(),
                referencedFields;

            if (fields) {
                referencedFields = _.where(fields, { referenced:  true });
            }

            return referencedFields;
        },

        getReferencedFieldsNameList: function() {
            return _.pluck(this.getReferencedFields(), 'name');
        },

        getRemovedFields: function() {
            var fields = this.getFields(),
                removedFields;

            if (fields) {
                removedFields = _.where(fields, { removed:  true });
            }

            return removedFields;
        },
        
        getRemovedFieldsNameList: function() {
            return _.pluck(this.getRemovedFields(), 'name');
        },

        getModifiedFields: function() {
            var fields = this.getFields(),
                modifiedFields;

            if (fields) {
                modifiedFields = _.where(fields, { modified:  true });
            }

            return modifiedFields;
        },
        
        getModifiedFieldsNameList: function() {
            return _.pluck(this.getModifiedFields(), 'name');
        },
        
        isTableable: function() {
            var ast = this.get('ast');
            
            if (ast) {
                return this.isFixed() || !this.isTransforming();
            }
            
            return false;
        },
        
        isFixed: function() {
            var interestingFields = this.getInterestingFields(),
                notFixed;
                
            if (!interestingFields || _.isEmpty(interestingFields)) {
                return false;
            }
            
            notFixed = _.find(interestingFields, function(field) {
                return field.name === TableAST.UNFIXED_NAME;
            });
            
            return !notFixed;
        },
        
        setActionsDefaults: function(options) {
            return this.actions.reset([
                {
                    name: 'get_interesting_fields'
                },
                {
                    name: 'annotate_datasets'
                }
            ], options);
        },
        
        hasError: function() {
            var messages = this.error.get('messages');
            return !!messages && !!messages.length;
        },
        
        getFromCommandObjectPayloads: function() {
            var ast = this.get('ast'),
                foundFromNodeList,
                payloads = [];
            
            if (!ast) {
                return payloads;
            }
            
            foundFromNodeList = this.findCommandNodes('from');
            
            while (foundFromNodeList && foundFromNodeList.length) {
                // set the AST to the expanded AST of the extended dataset
                ast = foundFromNodeList[0].object.search.ast;
                
                if (ast) {
                    if (ast.command !== 'inputlookup') {
                        ast = ast.object;
                    }
                    
                    // Note that you can only call | from once in a search at the beginning
                    // so the node list is only going to be length one
                    payloads.unshift(ast);
                    
                    // search the extended dataset for another from command
                    if (ast && ast.search && ast.search.ast) {
                        foundFromNodeList = this.findCommandNodes('from', ast.search.ast);
                    } else {
                        foundFromNodeList = undefined;
                    }
                } else {
                    foundFromNodeList = undefined;
                }
            }
            
            return payloads;
        },

        getFieldPickerItems: function() {
            return _.map(this.getInterestingFields({ withoutUnfixed: true }), function(field) {
                return { value: field.name };
            }, this);
        }
    }, {
        UNFIXED_NAME: '*'
    });
    
    return TableAST;
});
