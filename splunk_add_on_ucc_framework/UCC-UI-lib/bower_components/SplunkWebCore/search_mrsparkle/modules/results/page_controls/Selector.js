Splunk.Module.Selector = $.klass(Splunk.Module, {
    /**
     * Donde estan sus pantalones, Count Dracula?
     */
    initialize: function($super, container){
        $super(container);
        this.logger = Splunk.Logger.getLogger("Selector.js");
        this.select = $("select[name='" + this.getParam('name') + "']", this.container);
        this.select.bind("change", function(event) {
            this.pushContextToChildren();
        }.bind(this));
        
        if (this.getParam('mode') == 'list') {
            this.getResults();
        }
    },
    
    getResultURL: function(params) {
        var uri = '';
        if (this.getParam('mode') == 'list') {
            uri = Splunk.util.make_url('api/lists', this.getParam('listEndpoint'));
            var args = {
                'fields': [JSON.stringify({
                    'label': this.getParam('text'),
                    'value': this.getParam('value')
                })],
                'output_mode': 'options'
            };
            if (this.getParam('selected')) {
                args['selected'] = this.getParam('selected');
            }
            uri += '?' + Splunk.util.propToQueryString(args);
        }
        return uri;
    },
    
    renderResults: function(html) {
        $('select', this.container).append($('option', html));
        $('select option[value="*"]', this.container).attr('selected', 'selected');
    },
    
    /**
     * modifies the context information for modules downstream.
     */
    getModifiedContext: function(){
        var context = this.getContext();
        context.set(this.getParam('name'), this.select.val());
        return context;
    }
});
