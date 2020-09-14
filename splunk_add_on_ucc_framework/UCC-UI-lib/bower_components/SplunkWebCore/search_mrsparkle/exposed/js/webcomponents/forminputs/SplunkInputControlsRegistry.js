/*
 * This file registers the Splunk webcomponent-based input controls 
 * and returns a collection of their constructors. 
 * 
 * To use the webcomponent inputs as html tags, this file only
 * needs to be required, the constructors are returned for use
 * in javascript.
 */

define([
    'webcomponents/forminputs/SplunkSelect',
    'webcomponents/forminputs/SplunkTextInput',
    'webcomponents/forminputs/SplunkTextArea',
    'webcomponents/forminputs/SplunkRadioInput',
    'webcomponents/forminputs/SplunkColorPicker',
    'webcomponents/forminputs/SplunkSearchDropdown',
    'webcomponents/forminputs/SplunkControlGroup'
], function(
    SplunkSelect,
    SplunkTextInput,
    SplunkTextArea,
    SplunkRadioInput,
    SplunkColorPicker,
    SplunkSearchDropdown,
    SplunkControlGroup
) {
    return {
        SplunkSelect: SplunkSelect,
        SplunkTextInput: SplunkTextInput,
        SplunkTextArea: SplunkTextArea,
        SplunkRadioInput: SplunkRadioInput,
        SplunkColorPicker: SplunkColorPicker,
        SplunkSearchDropdown: SplunkSearchDropdown,
        SplunkControlGroup: SplunkControlGroup
    };

});