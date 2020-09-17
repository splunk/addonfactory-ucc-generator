define(function(require) {
    var _ = require('underscore'), $ = require('jquery');
    var BaseDashboardModel = require('models/search/Dashboard');
    var GeneralUtils = require('util/general_utils');
    var console = require('util/console');
    var Serializer = require('./serializer');
    var Panel = require('models/services/data/ui/Panel');
    
    var DashboardModel = BaseDashboardModel.extend({
        initialize: function() {
            BaseDashboardModel.prototype.initialize.apply(this, arguments);
        },
        /**
         * Update the dashboard element with the settings specified
         * @param id - the element id (string)
         * @param settings - a settings object containing the update information
         * @param options - persistence options
         */
        updateElement: function(id, settings, options) {
            var $xml = this.get$XML();
            var cur = this.getXMLNode(id, $xml);
            if (!cur) {
                throw new Error("Unable to find dashboard element with ID " + id);
            }

            var newNode = Serializer.updateExistingElementNode(cur, settings, options);
            if (settings.search && settings.search.type === 'global') {
                Serializer.applyGlobalSearch($xml, settings);
            }

            $(cur).replaceWith(newNode);
            this.set$XML($xml);
            return this.save();
        },
        deleteElement: function(id) {
            // Create new item order without the element which is to be deleted
            var newStructure = {
                fieldset: this._structure.fieldset,
                rows: _(this._structure.rows).map(function(row) {
                    return _.defaults({ 
                        panels: _(row.panels).map(function(panel) {
                            return {
                                inputs: panel.inputs,
                                elements: _(panel.elements).without(id)
                            };
                        }) 
                    }, row);
                })
            };
            return this.updateStructure(newStructure);
        },
        addElement: function(id, settings) {
            var newPanelStructure = {
                inputs: [],
                elements: [id]
            };
            var $xml = this.get$XML();
            Serializer.insertNewElement($xml, settings);
            this._structure.rows.push({ panels: [newPanelStructure] });
            this.set$XML($xml);
            return this.save();
        },
        _migrateViewType: function($xml, tagName) {
            var newXML = Serializer.migrateViewType($xml, tagName);
            if (newXML !== undefined) {
                $xml = newXML;
                this.trigger('change:rootNodeName', this, tagName);
            }
            return $xml;
        },
        captureDashboardStructure: function(structure) {
            var $xml = this.get$XML();
            this.validateItemOrder(this._getItemOrderMap(structure.rows, $xml));
            this.validateInputOrder(this._getInputOrderMap(structure, $xml));
            this._structure = structure;
        },
        getStructureMap: function(structure, $xml) {
            return _.extend({},
                this._getItemOrderMap(structure.rows, $xml),
                this._getInputOrderMap(structure, $xml)
            );
        },
        getCurrentStructureMap: function() {
            return this.getStructureMap(this._structure, this.get$XML());
        },
        getXMLNode: function(id, $xml) {
            id = String(id);
            var node = $xml.find(':eq(0)>fieldset>#' + id + ',:eq(0)>row>#' + id + ',:eq(0)>row>panel>#' + id);
            if (node.length) {
                return node[0];
            } else {
                return this.getStructureMap(this._structure, $xml)[id];
            }
        },
        _getItemOrderMap: function(rowOrder, $xml) {
            var elements = _($xml.find('row').children()).map(function(el) {
                return $(el).is('panel') ? Panel.getPanelElementNodes(el).toArray() : el;
            });
            var makeObject = function(keys, values, hint) {
                if (keys.length !== values.length) {
                    throw new Error('Item order did not match XML structure (' + keys.length + ' keys, ' + values.length + ' nodes)');
                }
                return _.object(keys, values);
            };
            return makeObject(_(rowOrder).chain().pluck('panels').flatten().pluck('elements').flatten().value(), _.flatten(elements));
        },
        validateItemOrder: function(itemOrderMap) {
            _(itemOrderMap).each(function(node, id) {
                var nid = $(node).attr(id);
                if (!(nid === undefined || nid === id)) {
                    throw new Error('Invalid Item order. Expected node with ID ' + id + '. Instead saw ' + nid);
                }
            });
        },
        updateInputXML: function(id, settings, options) {
            var $xml = this.get$XML();
            var cur = this.getXMLNode(id, $xml);
            if (!cur) {
                throw new Error('Unable to find input with ID=', id);
            }
            cur = $(cur);
            var newNode = Serializer.updateExistingInputNode(cur, settings.toJSON({ tokens: options.tokens !== false }), options);
            $(cur).replaceWith(newNode);
            this.set$XML($xml);
            return this.save();
        },
        isFormAutoRun: function() {
            var $xml = this.get$XML();
            var fieldset = $xml.find('fieldset');
            return GeneralUtils.normalizeBoolean(fieldset.attr('autoRun'));
        },
        updateFormSettings: function(options) {
            this.set$XML(Serializer.updateFormSettings(this.get$XML(), options));
            return this.save();
        },
        deleteInput: function(id) {
            var newStructure = {
                fieldset: _(this._structure.fieldset).without(id),
                rows: _(this._structure.rows).map(function(row) {
                    return _.defaults({ 
                        panels: _(row.panels).map(function(panel) {
                            return {
                                inputs: _(panel.inputs).without(id),
                                elements: panel.elements
                            };
                        })
                    }, row);
                })
            };
            return this.updateStructure(newStructure);
        },
        _getInputOrderMap: function(structure, $xml) {
            var map = {};
            var makeObject = function(keys, values, hint) {
                if (keys.length !== values.length) {
                    throw new Error('Input (' + hint + ') order did not match XML structure (' + keys.length + ' keys, ' + values.length + ' nodes)');
                }
                return _.object(keys, values);
            };
            _.extend(map, makeObject(structure.fieldset, $xml.find(':eq(0)>fieldset>input,:eq(0)>fieldset>html'), 'fieldset'));
            _.extend(map, makeObject(_(structure.rows).chain().pluck('panels').flatten().pluck('inputs').flatten().value(), $xml.find(':eq(0)>row>panel>input'), 'panels'));
            return map;
        },
        validateInputOrder: function(inputOrderMap) {
            _(inputOrderMap).each(function(node, id) {
                var nid = $(node).attr(id);
                if (!(nid === undefined || nid === id)) {
                    throw new Error('Invalid Input order. Expected node with ID ' + id + '. Instead saw ' + nid);
                }
            });
        },
        updateInput: function(settingsModel) {
            return this.updateInputXML(settingsModel.get('name'), settingsModel, {});
        },
        addInput: function(settingsModel) {
            var $input = Serializer.createInputNode(settingsModel.toJSON({ tokens: true }));
            // Ensure that we are a form
            var $xml = this._migrateViewType(this.get$XML(), 'form');
            // append xml to fieldset
            var $fieldset = Serializer.createFieldset($xml);
            $fieldset.append($input);
            // ensure the mapping and order is updated
            this._structure.fieldset.push(settingsModel.get('id'));
            this.set$XML($xml);
            return this.save();
        },
        updateStructure: function(structure, options) {
            options || (options = {});
            if (!this._structure) {
                console.warn('No captured dashboard structure');
                this.captureDashboardStructure(structure);
            }

            if (!_.isEqual(structure, this._structure)) {
                console.log("Saving new dashboard structure", structure);

                // Remove empty rows from structure
                structure.rows = _(structure.rows).filter(function(row) {
                    return row.panels.length > 0;
                });

                var $xml = this.get$XML();

                var itemMap = _.extend(this._getItemOrderMap(this._structure.rows, $xml), options.itemMap);
                var inputMap = _.extend(this._getInputOrderMap(this._structure, $xml), options.inputMap);
                
                $xml = Serializer.serializeDashboardStructure($xml, structure, _.extend({}, options, {
                    itemMap: itemMap,
                    inputMap: inputMap
                }));

                console.log('Updated dashboard structure', JSON.stringify(structure), $xml.find(':eq(0)')[0]);
                this._structure = structure;

                if (this.hasInputs()) {
                    $xml = this._migrateViewType($xml, 'form');
                } else {
                    $xml = this._migrateViewType($xml, 'dashboard');
                }
                this.set$XML($xml);
                console.log('Saving XML changes');
                return this.save();
            } else {
                console.log('no changes to input order');
                return $.Deferred().resolve();
            }
        },
        isEditable: function() {
            return this.isDashboard() || this.isForm();
        },
        getRootNodeName: function() {
            return (this.get$XML().find(':eq(0)').prop('nodeName') || '').toLowerCase();
        },
        hasInputs: function(){
            return this._structure.fieldset.length > 0 || _(this._structure.rows).any(function(row){
                return _(row.panels).any(function(element){
                    return element.inputs && element.inputs.length > 0;
                });
            });
        }
    });

    return DashboardModel;
});