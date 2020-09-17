/**
 * A model representation of a single field extraction entry in props.conf.
 *
 * This is a non-standard endpoint, so creating a new extraction is accomplished differently than with other models.
 * The following code example:
 *
 *   var extraction = new Extraction();
 *   extraction.entry.content.set({
 *       name: 'EXTRACT-foo,bar',
 *       value: 'http://<foo>/<bar>',
 *       stanza: 'my_sourcetype',
 *       type: 'Inline'
 *   });
 *   extraction.save();
 *
 * Will create stanza entry that looks like this:
 *
 *   [my_sourcetype]
 *   EXTRACT-foo,bar = http://<foo>/<bar>
 */

define([
            'models/SplunkDBase'
        ],
        function(
            SplunkDBase
        ) {

    var Extraction = SplunkDBase.extend({

        url: 'data/props/extractions'

    });

    // break the shared reference to Entry
    Extraction.Entry = SplunkDBase.Entry.extend({});
    // now we can safely change Entry.Content
    Extraction.Entry.Content = SplunkDBase.Entry.Content.extend({

        // When performing a create, we have to do a little bit of munging of the serialized representation of the model.
        // This is because the endpoint expects a different input when creating than what it outputs.
        // This is safer than it looks since "name" and "type" are only allowed as POST params for a create operation.
        toJSON: function() {
            var json = SplunkDBase.Entry.Content.prototype.toJSON.apply(this, arguments);
            if(json.name) {
                json.name = json.name.replace(/^EXTRACT-/, '').replace(/^REPORT-/, '');
            }
            if(json.type === 'Inline') {
                json.type = 'EXTRACT';
            }
            else if(json.type === 'Uses transform') {
                json.type = 'REPORT';
            }
            return json;
        }

    });

    return Extraction;

});