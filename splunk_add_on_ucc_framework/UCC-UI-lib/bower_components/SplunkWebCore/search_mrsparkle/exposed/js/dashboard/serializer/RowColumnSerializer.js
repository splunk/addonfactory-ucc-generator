define([
    'underscore',
    'jquery',
    'util/xml',
    './PanelSerializer',
    './InputSerializer',
    './ElementSerializer',
    './FieldsetSerializer',
    './SerializerHelper'
], function(_,
            $,
            XML,
            PanelSerializer,
            InputSerializer,
            ElementSerializer,
            FieldsetSerializer,
            SerializerHelper) {

    function applyRowColumnLayout($dashboard, state, options) {
        $dashboard.children('row,fieldset').remove();

        var layoutState = state.layout.getState();

        var fieldset = _(layoutState.children).findWhere({type: 'fieldset'});
        if (fieldset) {
            $dashboard.append(FieldsetSerializer.createFieldsetNode(state.fieldset, fieldset.children, state, options));
        }

        var $rows = _(layoutState.children).chain().where({type: 'row'}).map(function(row) {
            return createRowNode(state.rows.get(row.id), state, row, options);
        }).value();
        $dashboard.append($rows);
    }

    function createRowNode(rowState, state, row, options) {
        var $row = null;
        if (rowState) {
            $row = XML.$node(rowState.getOriginalXML() || '<row/>').empty();
            SerializerHelper.applyPredefinedID($row, rowState);
        } else {
            $row = XML.$tag('row');
        }

        var $panels = _(row.children).map(function(panel) {
            var inputs = _(panel.children).chain().where({type: 'input'}).pluck('id').value();
            var elements = _(panel.children).chain().where({type: 'element'}).pluck('id').value();
            return PanelSerializer.createPanelNode(state.panels.get(panel.id), inputs, elements, state, options);
        });
        // always remove grouping
        $row.removeAttr('grouping');
        $row.append($panels);
        return $row;
    }

    function appendPanelNode($xml, options) {
        options || (options = {});
        var rowNode = XML.$node('<row/>');
        var panelNode = XML.$node('<panel/>').appendTo(rowNode);
        SerializerHelper.applyTitleNode(panelNode, options.panelTitle);
        if ($xml) {
            $xml.find(':eq(0)').append(rowNode);
        }
        return panelNode;
    }

    return {
        appendPanelNode: appendPanelNode,
        applyRowColumnLayout: applyRowColumnLayout,
        // private
        _createRowNode: createRowNode
    };
});