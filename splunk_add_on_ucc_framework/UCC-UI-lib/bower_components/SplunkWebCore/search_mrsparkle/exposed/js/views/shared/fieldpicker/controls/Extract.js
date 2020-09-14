define(
    [
        'module',
        'views/Base',
        'uri/route'
    ],
    function(module, Base, route) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'a',
            attributes: {
                "href": "#"
            },
            className: 'extract btn btn-primary',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.searchJob, "change:id", function(){
                    var sid = this.model.searchJob.id;
                    if (sid){
                        var routeToIfx = route.field_extractor(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            this.model.application.get('app'),
                            { data: { sid: sid, offset: 0 } }
                        );
                        this.$el.attr("href", routeToIfx);
                    } else {
                        this.$el.attr("href", "#");
                    }
                });
            },
            events: {
                "click": function(e){
                    if (this.$el.attr("href") === "#") {
                        e.preventDefault();
                    }
                }
            },
            render: function() {
                this.$el.html('Extract New Field');
                this.$el.attr("target", "_blank");
                return this;
            }
        });
    }
);
