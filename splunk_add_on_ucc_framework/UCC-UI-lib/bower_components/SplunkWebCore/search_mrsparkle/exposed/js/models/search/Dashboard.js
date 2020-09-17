define(
    [
        'jquery',
        'underscore',
        'splunk.util',
        'models/services/data/ui/View',
        'util/xml',
        'util/splunkd_utils',
        'models/Base'
   ],
   function($, _, splunkUtil, ViewModel, XML, splunkDUtils, BaseModel) {
        var HTML_PANEL_TYPE = 'html',
            CHART_PANEL_TYPE = 'chart',
            EVENT_PANEL_TYPE = 'event',
            SINGLE_PANEL_TYPE = 'single',
            MAP_PANEL_TYPE = 'map',
            TABLE_PANEL_TYPE = 'table',
            CUSTOM_VIZ_PANEL_TYPE = 'viz',
            NON_HTML_PANEL_TYPES = [CHART_PANEL_TYPE, EVENT_PANEL_TYPE, SINGLE_PANEL_TYPE,
                                    MAP_PANEL_TYPE, TABLE_PANEL_TYPE, CUSTOM_VIZ_PANEL_TYPE];

        /**
         * Transient Dashboard Metadata Model
         *
         * Attributes:
         * - label
         * - description
         *
         */
        var DashboardMetadata = BaseModel.extend({
            constructor: function(dashboard) {
                this._dash = dashboard;
                BaseModel.prototype.constructor.call(this);
            },
            //validation: {},
            apply: function(){
                this._dash._applyMetadata(this.toJSON());
            },
            save: function() {
                if(arguments.length) {
                    this.set.apply(this, arguments);
                }
                this._dash._applyMetadata(this.toJSON());
                return this._dash.save.apply(this._dash, arguments);
            },
            fetch: function() {
                var m = this._dash._extractMetadata();
                this.set(m);
                var dfd = $.Deferred();
                dfd.resolve(this);
                return dfd;
            }
        });

        var Dashboard = ViewModel.extend({
            /**
             * model {Object} 
             * options {
             *     indent: <boolean> (default: true)
             * }
             */
            initialize: function(model, options) {
                ViewModel.prototype.initialize.apply(this, arguments);
                this.indent = (options || {}).indent !== false;
            },
            initializeAssociated: function() {
                ViewModel.prototype.initializeAssociated.apply(this, arguments);
                var meta = this.meta = this.meta || new DashboardMetadata(this);
                this.entry.content.on('change:eai:data', function(){
                    meta.fetch();
                }, this);
                meta.fetch();
            },
            associatedOff: function(e, cb, ctx) {
                ViewModel.prototype.associatedOff.apply(this, arguments);
                this.meta.off(e, cb, ctx);
            },
            set$XML: function($xml) {
                this.setXML(XML.serializeDashboardXML($xml, this.indent));
            },
            setXML: function(raw) {
                this.entry.content.set('eai:data', raw);
                this.entry.content.set('eai:type', 'views');
            },
            setHTML: function(raw) {
                this.entry.content.set('eai:data', raw);
                this.entry.content.set('eai:type', 'html');
            },
            _extractMetadata: function() {
                var isXML = this.isXML(), $xml = isXML ? this.getReadOnly$XML() : null;
                var label = this.entry.content.get('label') || this.entry.get('name');
                if (label != null) {
                    label = label.trim();
                }
                var description = (isXML && XML.root($xml).children('description:first').text()) || '';
                return {
                    label: label,
                    description: description.trim()
                };
            },
            _applyMetadata: function(metadata) {
                var $xml = this.get$XML();
                var root = XML.root($xml);
                var $label = root.children('label');
                var $description = root.children('description');

                if(!$label.length && metadata.label) {
                    $label = XML.$node('<label/>');
                    XML.root($xml).prepend($label);
                }
                if(!$description.length && metadata.description) {
                    $description = XML.$node('<description/>');
                    XML.inject({
                        node: $description,
                        where: 'after',
                        container: root,
                        selectors: ['label'],
                        fallback: 'prepend'
                    });
                }
                if (metadata.label) {
                    $label.text(metadata.label || '');
                    this.entry.content.set("label", metadata.label);
                }
                if (metadata.description) {
                    $description.text(metadata.description || '');
                }

                this.set$XML($xml);
            },
            getLabel: function() {
                var result = this.meta.get('label');
                return result === undefined ? "" : result;
            },
            setLabel: function(value) {
                this.setLabelAndDescription(value, undefined);
            },       
            getDescription: function() {
                return this.meta.get('description');
            },
            setDescription: function(value) {
                this.setLabelAndDescription(undefined, value);
            },
            setLabelAndDescription: function(label, description) {
                this._applyMetadata({ label: label, description: description });
            },
            get$Rows: function() {
                return XML.root(this.get$XML()).children('row');
            },
            createPrivateUserClone: function(owner, app, options) {
                options = options || {};
                var clone = new Dashboard();
                clone.setXML(this.entry.content.get('eai:data'));
                clone.meta.set(this.meta.toJSON());
                var data = {
                    sharing: splunkDUtils.USER, 
                    owner: owner, 
                    app: app
                }; 
                clone.entry.content.set('name', 'dashboard'); 
                clone.save({}, {data: data, 
                    success: function(model, response) {
                        if (options.deferred) {
                            options.deferred.resolve();
                        }
                    }.bind(this)
                });
                return clone;
            },
            /**
             * Append a prebuilt panel to a dashboard using its name (ref)
             * and its app context. We don't check if the prebuilt panel
             * is already in the dashboard.
             * @param panel
             */
            appendPrebuiltPanel: function(panel) {
                var $xml = this.get$XML();
                var rowNode = XML.$node('<row/>');
                var panelNode = XML.$node('<panel/>')
                    .attr('ref', panel.entry.get('name'))
                    .attr('app', panel.entry.acl.get('app'))
                    .appendTo(rowNode);
                $xml.find(':eq(0)').append(rowNode);
                this.set$XML($xml);
            },
            nonHTMLPanelTemplate: '\
                <<%- panelType %> <%= panelRootAttributes %>>\
                    <% if (properties.title) { %>\
                        <title><%- properties.title %></title>\
                    <% } %>\
                    <% if (properties.searchString) { %>\
                        <search>\
                            <query><%- properties.searchString %></query>\
                        <% if (properties.earliestTime !== undefined) { %>\
                            <earliest><%- properties.earliestTime %></earliest>\
                        <% } %>\
                        <% if (properties.latestTime !== undefined) { %>\
                            <latest><%- properties.latestTime %></latest>\
                        <% } %>\
                        <% if (properties.sampleRatio !== undefined) { %>\
                            <sampleRatio><%- properties.sampleRatio %></sampleRatio>\
                        <% } %>\
                        </search>\
                    <% } else if (properties.searchName) { %>\
                        <search ref="<%- properties.searchName %>" />\
                    <% } %>\
                    <% if (properties.fields) { %>\
                        <fields><%- properties.fields %></fields>\
                    <% } %>\
                    <% _.each(properties.options, function(value, key) { %>\
                        <option name="<%- key %>"><%- value %></option>\
                    <% }) %>\
                </<%- panelType %>>\
            ',
            HTMLPanelTemplate: '<html><%= properties.html %></html>'
        });

        // break the shared reference to Entry
        Dashboard.Entry = Dashboard.Entry.extend({});
        // now we can safely extend Entry.Content
        var Content = Dashboard.Entry.Content;
        Dashboard.Entry.Content = Content.extend({
            initialize: function() {
                Content.prototype.initialize.apply(this, arguments);
            },
            validate: function(attributes) {
                var eaiData = attributes["eai:data"],
                    xml, dashboard;

                if (eaiData != void(0)){
                    xml = $.parseXML(eaiData);

                    dashboard = xml.firstChild;
                    if (dashboard.nodeName !== 'dashboard' && dashboard.nodeName !== 'form'){
                        return {
                            'eai:data': "You must declare a dashboard node."
                        };
                    }
                }
            }
        });
        
        return Dashboard;
    }
);
