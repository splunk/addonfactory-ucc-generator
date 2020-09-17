define(function(require, module){
    var _ = require('underscore');
    var $ = require('jquery');
    var mvc = require('../mvc');
    var BaseView = require('../basesplunkview');
    var Dashboard = require('../simplexml/controller');

    // Requiring styles in this manner is against coding standards.
    // Refactoring to extend CoreJS view is one solution to resolve this issue.
    require('../../../views/dashboard/form/Fieldset.pcss');

    return BaseView.extend({
        moduleId: module.id,
        className: 'fieldset',
        options: {
            editable: true
        },
        initialize: function() {
            this.configure();
            this.listenTo(Dashboard, 'formupdate', this.render);
            this.listenTo(Dashboard.model, 'change:edit change:rootNodeName', this.render);
            this.listenTo(this.settings, 'change:editable', this.render);
            BaseView.prototype.initialize.apply(this, arguments);
        },
        isEmpty: function(){
            return this.getChildElementIDs().length === 0;
        },
        childrenVisible: function(){
            return _.any(this.getChildElements(), function(child){ return !child.$el.is('.hidden'); });
        },
        addChild: function(input){
            input.render().$el.appendTo(this.show());
            this.render();
        },
        show: function() {
            return this.$el.removeClass('hidden');
        },
        hide: function() {
            return this.$el.addClass('hidden');
        },
        updateEmptyState: function(){
            this.$el[this.isEmpty() ? 'addClass' : 'removeClass']('empty');
        },
        render: function() {
            this.$el.attr('id', this.id);
            var editable = this.settings.get('editable');
            this.$el[editable ? 'addClass' : 'removeClass']('editable');
            var editMode = Dashboard.isEditMode() && editable;
            var someInputsHaveLabel = !_.all(this.$el.find('.input>label'), function(label) {
                return !$.trim($(label).text());
            });

            if(editMode || someInputsHaveLabel) {
                this.$el.removeClass('hide-label');
            } else {
                this.$el.addClass('hide-label');
            }
            var rootNodeName = Dashboard.model.get('rootNodeName');
            if ((!editMode && this.isEmpty()) || (rootNodeName != null && rootNodeName !== 'form')) {
                this.hide();
            } else {
                this.show();
            }
            this.updateEmptyState();
            return this;
        },
        getChildElementIDs: function(){
            return _(this.$el.children(':not(.form-submit)')).map(function(input){ return $(input).attr('id'); });
        },
        getChildElements: function() {
            return _(this.getChildElementIDs()).chain()
                .map(_.bind(mvc.Components.get, mvc.Components))
                .filter(_.identity)
                .value();
        },
        removeChildren: function() {
            _(this.getChildElements()).invoke('remove');
        },
        serializeStructure: function() {
            return this.getChildElementIDs();
        },
        remove: function() {
            this.removeChildren();
            BaseView.prototype.remove.apply(this, arguments);
        }
    });
});
