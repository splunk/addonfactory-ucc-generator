define(['underscore', 'module', 'views/shared/waitspinner/Master', 'splunk.util'], function(_, module, SpinnerView, splunkutil) {
    return SpinnerView.extend({
        className: 'pull-left',
        moduleId: module.id,
        initialize: function() {
           SpinnerView.prototype.initialize.apply(this, arguments);
           this.activate();
        },
        startListening: function() {
            SpinnerView.prototype.startListening.apply(this, arguments);
            this.listenTo(this.model.entry.content, 'change:dispatchState change:isDone change:isPaused', this.debouncedRender);  
        },
        render: function() {
            var spinning = !(this.model.isDone() || this.model.entry.content.get("isPaused") || this.model.isNew());
            
            if (this.spinning === spinning) {
                return this;
            }
            
            this.$el[spinning ? 'show' : 'hide']()[spinning ? 'addClass' : 'removeClass']('active');
            this[spinning ? 'start' : 'stop']();
            this.spinning = spinning;
            return this;
        }
    });
});
