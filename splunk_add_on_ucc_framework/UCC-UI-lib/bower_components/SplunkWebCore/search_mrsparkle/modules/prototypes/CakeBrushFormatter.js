Splunk.Module.CakeBrushFormatter = $.klass(Splunk.Module, {
    
    CHARTING_PREFIX : "charting.",
    
    initialize: function($super, container){
        $super(container);
        this.coreValues = {
            "cake": "pie",
            "cakeBrushPalette": "list",
            "cakeBrushPalette.brushes": "[@cakeBrush1,@cakeBrush2,@cakeBrush3,@cakeBrush4,@cakeBrush5,@cakeBrush6]",
            "cake.sliceBrushPalette": "@cakeBrushPalette",
            "cake.data": "@data"
        };
        this.cakeImages = this.getParam("cakeImages");
    },

    getModifiedContext: function() {
        var charting_prefix = "charting.";
        var context = this.getContext();
        for (key in this.coreValues) {
            context.set(this.CHARTING_PREFIX + key, this.coreValues[key]);
        }
        for (var i=0; i<this.cakeImages.length; i++) {
            var url = Splunk.util.make_url(this.cakeImages[i]);
            // if for some reason we need full URL's, uncomment this instead. 
            /*
            var url = [];
            url.push(document.location.protocol);
            url.push("//");
            url.push(document.location.host);
            url.push(Splunk.util.make_url(cakeImages[i]));
            url = url.join("");
            */

            var brushName = this.CHARTING_PREFIX + "cakeBrush"+(i+1);
            context.set(brushName,  "imageFill");
            context.set(brushName + ".source",  url);
            context.set(brushName + ".smooth",  "true");
        }
        return context;
    }

});
