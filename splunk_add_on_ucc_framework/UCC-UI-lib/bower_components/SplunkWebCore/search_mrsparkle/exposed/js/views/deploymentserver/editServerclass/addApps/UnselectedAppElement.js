define(
    ['module', 'views/Base', 'underscore'],
          function(module, BaseView, _) {

         return BaseView.extend({
            moduleId: module.id,
            tagName: 'li',
            className: 'appElement',
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
                 this.model.selectedAppsDict.on('change:' + this.model.app.entry.get('name'), this.handleSelected, this);
            },
            render: function() {
                var template = this.compiledTemplate({
                     app: this.model.app
                });
                this.$el.html(template);
                this.handleSelected();
                this.$('.selectPrompt').hide();
                return this;
            },
            events: {
                'mouseout' : function(e) {
                     this.$('.selectPrompt').hide();
                     // this.$el.css("background-color","white");
                },
                'mouseover' : function(e) {
                     this.$('.selectPrompt').show();
                     // this.$el.css("background-color","#EEEEEE");
                },
                'click' : function(e) {
                    this.$el.hide();
                    this.model.selectedAppsDict.set(this.model.app.entry.get('name'), true);
                }
            },
            handleSelected: function() {
               var isSelected = this.model.selectedAppsDict.get(this.model.app.entry.get('name'));
               this.model.selectedAppsDict.get(this.model.app.entry.get('name')) ? this.$el.hide() : this.$el.show();
            },
            template: '\
                <span class="selectPrompt" style="float:right"><%-_("Select").t()%></span>\
                <a href="#"><%=app.entry.get("name")%></a> \
            '

        });
});






