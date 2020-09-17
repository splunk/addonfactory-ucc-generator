
// Example of a completely static module. 
// (that content is in static_content_sample.html)
// this implements no JS behaviours and no AJAX functionality at all.
// but since it's a module, it can be inserted into a hierarchy of complex AJAX
// (or of course it can be part of a view of simple Modules which also implement
// no behaviours.
Splunk.namespace("Module");
Splunk.Module.StaticContentSample = $.klass(Splunk.Module, {
    initialize: function($super, container) {
        $super(container);

        // Add any additional leading language and root endpoints to static 
        // content links. See bug SPL-32106 for reasoning.
        $('a', this.container).each(function(i, el) {
            var new_url = $(el).attr('href');
            // Only add root endpoints to absolute local urls
            if (!new_url || new_url.indexOf('/') !== 0)
                return;

            new_url = Splunk.util.make_url(new_url);
            $(el).attr('href', new_url);
        });
    }

});
