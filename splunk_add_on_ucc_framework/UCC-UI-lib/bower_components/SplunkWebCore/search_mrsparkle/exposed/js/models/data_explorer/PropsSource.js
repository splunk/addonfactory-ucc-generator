/**
 * @author jszeto
 * @date 7/31/14
 */

define([
    'jquery',
    'underscore',
    'models/services/configs/Props'
],
    function(
        $,
        _,
        PropsModel
        ) {

        var SOURCE_STANZA_PREFIX = "source::";

        var createStanzaFromName = function(name) {
            return SOURCE_STANZA_PREFIX + name;
        };

        var PropsSource = PropsModel.extend({

            initialize: function(attrs, options) {
                PropsModel.prototype.initialize.call(this, attrs, options);
            },

            getSource: function() {
                var stanzaName = this.entry.get("name");
                var start = stanzaName.indexOf(SOURCE_STANZA_PREFIX);

                if (start != -1) {
                    return stanzaName.slice(start + SOURCE_STANZA_PREFIX.length);
                }

                return stanzaName;
            }
        },
            {
                createStanzaFromName: createStanzaFromName
            });

        return PropsSource;

    });
