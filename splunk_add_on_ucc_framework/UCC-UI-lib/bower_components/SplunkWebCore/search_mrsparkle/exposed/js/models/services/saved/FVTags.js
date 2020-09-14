define(['jquery', 'underscore', 'models/SplunkDBase'], function($, _, BaseModel) {
    return BaseModel.extend({
        url: 'saved/fvtags',
        initialize: function() {
            BaseModel.prototype.initialize.apply(this, arguments);
        },
        resetTags: function(tags) {

            //unset tag prefixed keys 
            _(this.entry.content.toJSON()).each(function(v, k) {
                if(k.match(/^tag.+/g)){
                    this.entry.content.unset(k);
                }
            }, this);
            //unset the tags array
            this.entry.content.unset('tags');
            
            if (tags) {
                var attrs = {};
                _(tags).each(function(tag) {
                    attrs['tag.' + tag] = tag;
                }, this);
                this.entry.content.set(attrs);
            }

        },
        setId: function(app, owner, fieldName, fieldValue){
            this.set('id', '/servicesNS/' + encodeURIComponent(owner) + '/' + encodeURIComponent(app) + '/saved/fvtags/' + encodeURIComponent(fieldName) + '%3D' + encodeURIComponent(fieldValue));
        }
    },
    // class-level properties
    {
        tagStringtoArray: function(tag) {
            return tag ? $.trim(tag.replace(/,/g,' ')).split(/\s+/): [];
        },
        tagArraytoString: function(tags) {
            return tags.join(', ');
        }
    });
});
