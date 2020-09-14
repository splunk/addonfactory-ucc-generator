define([
    'jquery',
    'splunk.util',
    'models/SplunkDBase',
    'underscore',
    'util/xml'
], function($, splunkutil, SplunkDBaseModel, _, XML) {

    var PanelModel = SplunkDBaseModel.extend({
        url: "data/ui/panels",
        initialize: function () {
            SplunkDBaseModel.prototype.initialize.apply(this, arguments);
        },
        get$XML: function() {
            var data = this.entry.content.get('eai:data') || '<panel />';
            var doc = XML.parse(data);
            doc.find('script').remove();
            return doc;
        },
        set$XML: function($xml) {
            var xmlStr = XML.serializeDashboardXML($xml);
            this.entry.content.set('eai:data', xmlStr);
        },
        getElementNodes: function() {
            var panelNode = XML.root(this.get$XML());
            if (panelNode.is('panel')) {
                return PanelModel.getPanelElementNodes(panelNode);
            } 
        },
        getInputNodes: function() { 
            var panelNode = XML.root(this.get$XML());
            if (panelNode.is('panel')) {
                return PanelModel.getPanelInputNodes(panelNode);
            } 
        }
    }, {
        getPanelElementNodes: function(panelNode) {
            return $(panelNode).children('table,chart,event,single,list,map,html,viz');
        },
        getPanelInputNodes: function(panelNode) {
            return $(panelNode).children('input');
        }
    });
    
    return PanelModel;

});
