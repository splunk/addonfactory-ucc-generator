define(
    [
     'module',
     'views/Base'
    ],
function(
    module,
    BaseView
) {

         return BaseView.extend({
            moduleId: module.id,
            className: 'selectedMachineTypeElement btn-combo',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                var template = this.compiledTemplate({machineType: this.model.get('name')});
                this.$el.html(template);
                return this;
            },
            events: {
                'click .removeMachineType' : function(){
                    this.trigger('itemRemoved', this.model);
                }
            },
            // this should use btn-small but the dropdown doesn't support it
            template: '\
                    <div class="btn "><%-machineType%></div>\
                    <a href="#" class="btn  removeMachineType"><i class="icon-cancel"></i></a>\
            '

        });
});
