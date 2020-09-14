define([
    'underscore',
    'jquery',
    'util/general_utils',
    'util/xml',
    'dashboard/serializer/SearchSerializer',
    './SerializerHelper'
], function(_,
            $,
            GeneralUtils,
            XML,
            SearchSerializer,
            SerializerHelper) {

    var POPULATING_SEARCH_SELECTOR = 'populatingSavedSearch,populatingSearch,search';

    function createInputNode(inputState, state, options) {
        var searchId = inputState.getState().managerid;
        var forceDirty = searchId && state.searches.get(searchId)
            && (state.searches.get(searchId).isDirty() || state.searches.get(searchId).getOriginalXML() == null);
        var $input = SerializerHelper.getOriginalXMLIfNotDirty(inputState, function(originalXML) {
            return updateInputFromSettings(originalXML ? XML.$node(originalXML) : XML.$tag('input'), inputState.getState(), options);
        }, {forceDirty: forceDirty});

        if (searchId) {
            var searchState = state.searches.get(searchId);
            var $search = SerializerHelper.getOriginalXMLIfNotDirty(searchState, function(originalXML) {
                return $search = SearchSerializer.createSearchNode(searchState, state, options);
            });
            XML.replaceOrAppend({
                node: $search,
                container: $input,
                selector: POPULATING_SEARCH_SELECTOR
            });
        } else {
            $input.children(POPULATING_SEARCH_SELECTOR).remove();
        }
        inputState.setXML(XML.serialize($input));
        return $input;
    }

    /**
     * Creates a new node based on the current nodes and updates it using the given settings
     *
     * @param curNode - the current node representing the input to be updated
     * @param settings - new settings to apply to the new input node
     * @param options - options
     * @returns {*} the newly created and updated input node
     */
    function updateExistingInputNode(curNode, settings, options) {
        var newNode = XML.clone(curNode);
        return updateInputFromSettings(newNode, settings, options);
    }

    /**
     * Updated the given input node with new settings.
     *
     * @param $input - the input node to update
     * @param settings - new settings to apply to the input node
     * @param options - options
     * @returns {*} - the updated input node (same as $input param)
     */
    function updateInputFromSettings($input, settings, options) {
        $input.attr('type', settings.type);
        $input.attr('token', settings.token || null);
        $input.attr('searchWhenChanged', settings.searchWhenChanged != null ?
            String(GeneralUtils.normalizeBoolean(settings.searchWhenChanged)) : null);

        _applyInputLabel(settings, $input, options);
        _applyInputStaticChoices(settings, $input, options);
        _applyInputDefaultValue($input, settings, options);
        _applyInputSettings($input, settings, options);
        _applyInputSearchFields($input, settings, options);
        return $input;
    }

    /**
     * Create a new input node using the given settings.
     *
     * @param settings - settings to apply to the newly created input node
     * @param options - options
     * @returns {*} - the newly created input node
     */
    function createInputFromSettings(settings, options) {
        var $input = XML.$node('<input />');
        return updateInputFromSettings($input, settings, options);
    }

    function _applyInputLabel(settings, $input, options) {
        // set the label if it is different than the token name
        var label = $.trim(settings.label);
        if (label !== undefined) {
            XML.replaceOrPrepend({node: XML.$node('<label/>').text(label), selector: 'label', container: $input});
        } else {
            $input.children('label').remove();
        }
    }

    function _applyInputStaticChoices(settings, $input, options) {
        if (settings.choices && settings.choices.length) {
            var newChoices = _(settings.choices).map(function(choice) {
                return XML.$node('<choice/>').attr('value', choice.value).text(choice.label);
            });
            XML.replaceOrAppend({node: newChoices, container: $input, selector: 'choice'});
        } else {
            $input.children('choice').remove();
        }
    }

    function _applyInputDefaultValue($input, settings, options) {
        var defaultValue = settings['default'];
        if (defaultValue && !(_.isArray(defaultValue) && defaultValue.length === 0)) {
            // default is a named node
            var defaultNode = XML.$node('<default/>');
            if (settings.type == 'time') {
                XML.$node('<earliest></earliest>').text((defaultValue.earliest_time == null) ? '' : defaultValue.earliest_time).appendTo(defaultNode);
                XML.$node('<latest></latest>').text((defaultValue.latest_time == null) ? '' : defaultValue.latest_time).appendTo(defaultNode);
            } else if (_.isArray(defaultValue)) {
                defaultNode.text(_serializeCSVString(defaultValue));
            } else {
                defaultNode.text(defaultValue);
            }
            XML.replaceOrAppend({node: defaultNode, selector: 'default', container: $input});
        } else {
            $input.children('default').remove();
        }
    }

    function _serializeCSVString(list) {
        return _.map(list, function(part) {
            return /[,\r\n""]/.test(part) ? '"' + part.replace(/"/g, '""') + '"' : part;
        }).join(',');
    }

    function _applyInputSettings($input, settings, options) {
        _(['prefix', 'suffix', 'seed', 'initialValue', 'valuePrefix', 'valueSuffix', 'delimiter']).each(function(option) {
            var val = settings[option];
            if (val && !(_.isArray(val) && val.length === 0)) {
                var node = XML.$tag(option).text(val);
                XML.replaceOrAppend({node: node, container: $input, selector: option});
            } else {
                $input.children(option).remove();
            }
        });
    }

    function _applyInputSearchFields($input, settings, options) {
        if (settings.labelField) {
            XML.replaceOrAppend({
                node: XML.$tag('fieldForLabel').text(settings.labelField),
                container: $input,
                selector: 'fieldForLabel'
            });
        } else {
            $input.children('fieldForLabel').remove();
        }
        if (settings.valueField) {
            XML.replaceOrAppend({
                node: XML.$tag('fieldForValue').text(settings.valueField),
                container: $input,
                selector: 'fieldForValue'
            });
        } else {
            $input.children('fieldForValue').remove();
        }
    }


    return {
        createInputNode: createInputNode,

        _updateExistingInputNode: updateExistingInputNode,
        _updateInputFromSettings: updateInputFromSettings,
        _createInputFromSettings: createInputFromSettings
    };
});