define(
    [
        'jquery',
        'underscore',
        'models/StaticIdSplunkDBase',
        'util/xml',
        'util/console'
    ],
    function($, _, SplunkDBaseModel, XML, console) {
        return SplunkDBaseModel.extend({
            url: 'data/ui/nav',
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },
            parse: function(response, options) {
                // make a defensive copy of response since we are going to modify it (only if we want to)
                if (!options.skipClone) {
                    response = $.extend(true, {}, response);
                }

                // Use the first entry that we can successfuly parse
                response.entry[0] = _(response.entry).find(function(entry) {
                    try {
                        XML.parse(entry.content['eai:data']);
                        return true;
                    } catch(e) {
                        console.warn('Warning: Invalid xml in nav', entry.name);
                        return false;
                    }
                });
                SplunkDBaseModel.prototype.parse.call(this, response, options);
            },
            getColor: function() {
                var $xml,
                    color,
                    eaiData = this.entry.content.get('eai:data');
                if (!eaiData) {
                    return "";
                }
                try {
                    $xml = XML.parse(eaiData);
                } catch(e) {
                    return "";
                }
                color = $xml.find('nav').attr('color');
                if (color && color.charAt(0) != '#') {
                    color = '#' + color;
                }
                return color;
            }
        },
        {
            id: 'data/ui/nav'
        });
    }
);
