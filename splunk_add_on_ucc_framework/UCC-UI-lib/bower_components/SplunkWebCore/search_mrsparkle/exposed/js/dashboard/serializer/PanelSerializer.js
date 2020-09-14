define([
    'underscore',
    'jquery',
    'util/xml',
    './ElementSerializer',
    './InputSerializer',
    './SerializerHelper'
], function(_,
            $,
            XML,
            ElementSerializer,
            InputSerializer,
            SerializerHelper) {

    function createPanelNode(panelState, inputs, elements, state, options) {
        var curSettings = panelState.getState();
        var $panel = SerializerHelper.getOriginalXMLIfNotDirty(panelState, function(originalXML) {
            var $panel = originalXML ? XML.$node(originalXML) : XML.$tag('panel');
            SerializerHelper.applyTokenDependencies($panel, curSettings);
            SerializerHelper.applyPredefinedID($panel, panelState);
            if (curSettings.ref) {
                $panel.empty();
                SerializerHelper.applyAttributes($panel, {ref: curSettings.ref, app: curSettings.app});
            } else {
                SerializerHelper.applyTitleNode($panel, curSettings.title);
            }
            return $panel;
        });

        if (!curSettings.ref) {
            SerializerHelper.removeInputsAndElements($panel);
            var $inputs = _(inputs).map(function(input) {
                return InputSerializer.createInputNode(state.inputs.get(input), state, options);
            });
            var $elements = _(elements).map(function(element) {
                return ElementSerializer.createElementNode(state.elements.get(element), state, options);
            });

            $panel.append($inputs).append($elements);
        }
        panelState.setXML(XML.serialize($panel));
        return $panel;
    }

    return {
        createPanelNode: createPanelNode
    };
});