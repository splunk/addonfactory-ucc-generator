define(
    ['jquery', 'module', 'views/Base', 'underscore'],
          function($, module, BaseView, _) { 
 
         return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
                 this.model.on('change:filter', this.render, this);
            }, 
            render: function() {
                this.$el.html() || this.$el.html('<textarea class="list-area" placeholder="' + this.options.placeholder + '"></textarea>');
                this.$('textarea').val(this.model.get('filter'));
                return this;
            }, 
            events: {
                'keyup textarea': function(e) {
                    var $el = $(e.target);
                    if (e.keyCode == 27) {
                        this.model.set('filter', '');
                        this.render();
                        $el.focus();
                        return;
                    }
                    this.model.set('filter', e.target.value);
                }
            }
        }); 
});





