define([
    'underscore',
    'jquery',
    'util/xml',
    './PanelSerializer',
    './InputSerializer',
    './ElementSerializer',
    './SerializerHelper'
], function(_,
            $,
            XML,
            PanelSerializer,
            InputSerializer,
            ElementSerializer,
            SerializerHelper) {

    function createFieldsetNode(fieldsetState, children, state, options) {
        var originalXML = state.fieldset.getOriginalXML();
        var $fieldset = originalXML ? XML.$node(originalXML) : XML.$tag('fieldset');
        if (fieldsetState && fieldsetState.isDirty() || !originalXML) {
            SerializerHelper.applyAttributes($fieldset, _(state.fieldset.getState(), 'autoRun', 'submitButton'));
        }
        $fieldset.empty();
        var $children = _(children).map(function(child) {
            if (child.type == 'input') {
                return InputSerializer.createInputNode(state.inputs.get(child.id), state, options);
            } else if (child.type == 'element') {
                return ElementSerializer.createElementNode(state.elements.get(child.id), state, options);
            }
        });
        $fieldset.append($children);
        fieldsetState.setXML(XML.serialize($fieldset));
        return $fieldset;
    }

    return {
        createFieldsetNode: createFieldsetNode
    };
});