define([
    'jquery',
    'underscore',
    'backbone',
    'util/console',
    'dashboard/state/ElementState',
    'dashboard/state/InputState',
    'dashboard/state/LayoutState',
    'dashboard/state/PanelState',
    'dashboard/state/RowState',
    'dashboard/state/SearchState',
    'dashboard/state/DashboardHeaderState',
    'dashboard/state/FieldsetState',
    'dashboard/state/ItemStateCollection',
    'dashboard/state/ItemState',
    'dashboard/serializer/DashboardSerializer'
], function($,
            _,
            Backbone,
            console,
            ElementState,
            InputState,
            LayoutState,
            PanelState,
            RowState,
            SearchState,
            DashboardHeaderState,
            FieldsetState,
            ItemStateCollection,
            ItemState,
            DashboardSerializer) {

    function DashboardState() {
        this.initialize.apply(this, arguments);
    }

    _.extend(DashboardState.prototype, Backbone.Events, {
        initialize: function() {
            this.rows = new ItemStateCollection();
            this.panels = new ItemStateCollection();
            this.elements = new ItemStateCollection();
            this.inputs = new ItemStateCollection();
            this.searches = new ItemStateCollection();
            this.layout = new LayoutState();
            this.dashboard = new DashboardHeaderState();
            this.fieldset = new FieldsetState();

            this.xml = new ItemState();
            this.resume();
            this.latestChangedItem = null;
        },

        suspend: function() {
            this.stopListening();
            this._suspended = true;
        },

        items: function() {
            return [
                this.rows, this.panels, this.elements, this.inputs,
                this.searches, this.layout, this.fieldset, this.dashboard
            ];
        },

        resume: function() {
            _(this.items()).each(function(item) {
                this.listenTo(item, 'all', this.trigger);
                this.listenTo(item, 'changed', this.updateChangedItem);
            }, this);
            this.listenTo(this.xml, 'all', this.trigger);
            this.listenTo(this.xml, 'changed', this.updateChangedItem);
            this._suspended = false;
        },

        addElement: function(id, element) {
            this.elements.add(new ElementState(id, element));
        },
        updateElement: function(id, element) {
            var elementState = this.elements.get(id);
            if (elementState) {
                elementState.setState(element);
            } else {
                console.warn('Unable to update dashboard element with id=%o, not found in dashboard state', id);
            }
        },
        removeElement: function(id) {
            if (!this.elements.remove(id)) {
                console.warn('Unable to remove dashboard element with id=%o, not found in dashboard state', id);
            }
        },

        addInput: function(id, input) {
            this.inputs.add(new InputState(id, input));
        },
        updateInput: function(id, settings) {
            var inputState = this.inputs.get(id);
            if (inputState) {
                inputState.setState(settings);
            } else {
                console.warn('Unable to update dashboard input with id=%o, not found in dashboard state', id);
            }
        },
        removeInput: function(id) {
            if (!this.inputs.remove(id)) {
                console.warn('Unable to remove dashboard input with id=%o, not found in dashboard state', id);
            }
        },

        addSearch: function(id, search) {
            this.searches.add(new SearchState(search));
        },
        updateSearch: function(id, search) {
            var searchState = this.searches.get(id);
            if (searchState) {
                searchState.setState(search);
            } else {
                console.warn('Unable to update search with id=%o, not found in dashboard state', id);
            }
        },
        removeSearch: function(id) {
            if (!this.searches.remove(id)) {
                console.warn('Unable to remove search with id=%o, not found in dashboard state', id);
            }
        },

        addPanel: function(id, panel) {
            this.panels.add(new PanelState(id, panel));
        },
        updatePanel: function(id, panel) {
            var panelState = this.panels.get(id);
            if (panelState) {
                panelState.setState(panel);
            } else {
                console.warn('Unable to update panel with id=%o, not found in dashboard state', id);
            }
        },
        removePanel: function(id) {
            if (!this.panels.remove(id)) {
                console.warn('Unable to remove panel with id=%o, not found in dashboard state', id);
            }
        },

        updateLayout: function(layoutData) {
            this.layout.setState(layoutData);
        },

        updateDashboard: function(dashboardState) {
            this.dashboard.setState(dashboardState);
        },

        updateFieldset: function(fieldset) {
            this.fieldset.setState(fieldset);
        },
        isDirty: function() {
            return _.any(this.items(), function(item) { return item.isDirty(); });
        },

        commit: function(options) {
            _(this.items()).invoke('commitState', options);
        },
        restore: function() {
            _(this.items()).invoke('restoreState');
        },

        reset: function(stateObjects) {
            _(this.items()).invoke('clear');
            if (stateObjects) {
                var wasSuspended = this._suspended;
                if (!wasSuspended) {
                    this.suspend();
                }
                _(stateObjects).each(this.addStateObject.bind(this));
                if (!wasSuspended) {
                    this.resume();
                }
            }
            this.commit();
        },

        addStateObject: function(stateObject) {
            if (stateObject instanceof LayoutState) {
                this.layout = stateObject;
            } else if (stateObject instanceof DashboardHeaderState) {
                this.dashboard = stateObject;
            } else if (stateObject instanceof FieldsetState) {
                this.fieldset = stateObject;
            } else if (stateObject instanceof PanelState) {
                this.panels.add(stateObject);
            } else if (stateObject instanceof ElementState) {
                this.elements.add(stateObject);
            } else if (stateObject instanceof InputState) {
                this.inputs.add(stateObject);
            } else if (stateObject instanceof SearchState) {
                this.searches.add(stateObject);
            } else if (stateObject instanceof RowState) {
                this.rows.add(stateObject);
            } else {
                throw new Error('Invalid state object: ' + String(stateObject));
            }
        },

        setXML: function(xml) {
            // always trim xml source
            this.xml.setState({source: xml.trim()});
        },
        commitXML: function() {
            this.xml.commitState();
        },
        commitAll: function() {
            // always update original xml
            this.commit({
                updateOriginalXML: true
            });
            this.commitXML();
            this.latestChangedItem = null;
        },
        restoreXML: function() {
            this.xml.restoreState();
        },
        restoreAll: function() {
            this.restore();
            this.restoreXML();
            this.latestChangedItem = null;
        },
        updateChangedItem: function(stateItem) {
            this.latestChangedItem = stateItem;
        },
        getDashboardXML: function() {
            if (this.latestChangedItem === this.xml) {
                return this.xml.getState().source;
            }
            else {
                return this.generateDashboardXML();
            }
        },
        /**
         * Generate xml content from component states
         * @returns {*}
         */
        generateDashboardXML: function() {
            var xml;
            if (this.isDirty()) {
                //generate xml only when the items are dirty and the xml is not dirty.
                //otherwise the xml is the latest change, there's no need to generate it.
                var newSource = this._generateDashboardXML();
                this.setXML(newSource);
                xml = newSource;
            } else {
                xml = this.xml.getState().source;
            }
            return xml;
        },
        _generateDashboardXML: function() {
            return DashboardSerializer.applyDashboardState(this, this.xml.getState().source);
        }
    });

    return DashboardState;
});