define(
[
    'underscore',
    'models/SplunkDBase',
    'splunk.util'
],
function(
    _,
    SplunkDBase,
    splunk_util
) {
    var Keyword = SplunkDBase.extend({
        url: 'data/ui/livetail',

        isEnabled: function() {
            return splunk_util.normalizeBoolean(this.entry.content.get("enabled"));
        },

        getKeyword: function() {
            return _.unescape(this.entry.content.get("keyphrase")) || '';
        },

        isValid: function() {
            return this.isEnabled() && this.getKeyword();
        },

        getColor: function() {
            return this.entry.content.get("color");
        },

        getCount: function() {
            return this.get("count") || 0;
        },

        isFlashOn: function() {
            return splunk_util.normalizeBoolean(this.entry.content.get("flash"));
        },

        playSound: function() {
            return splunk_util.normalizeBoolean(this.entry.content.get("playsound"));
        },

        getSound: function() {
            return this.entry.content.get("sound");
        },

        getThreshold: function() {
            return this.entry.content.get("threshold");
        },

        getName: function() {
            return this.entry.get("name");
        },

        getEncodedSound: function() {
            var sound = this.getSound();
            return this.entry.content.get('sound-' + sound);
        }
    });
    return Keyword;
});
