// The review view pretty prints model.getReviewContent
// @param (BackboneModel) model: The model whose details need to be displayed
// NOTE -
// the model needs to implement 3 functions -
//   getReviewFields: this will return the list of model attributes to be displayed
//   getLabel(field): this will return the label for the given field.
//   getValue(field): this will return the value of the given field.
// @author: nmistry
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/Base'
], function TabsView(
    _,
    $,
    backbone,
    module,
    BaseView
) {

    return BaseView.extend({
        moduleId: module.id,

        className: 'inputs-review',

        tagName: 'div',

        render: function () {
            var contents = this.model.getReviewFields();
            this.el.innerHTML = this.compiledTemplate({
                model: this.model,
                contents: contents
            });
            return this;
        },

        template: '\
    <div>\
      <dl class="list-dotted">\
          <% _.each(contents, function (content) {%>\
              <dt><%- model.getLabel(content) %></dt>\
              <dd>\
              <% if(_.isArray(model.getValue(content))) { %>\
                  <% _.each(model.getValue(content), function(value) { %>\
                  <span><%- value %></span></br>\
                  <% }) %>\
              <% } else { %>\
                  <%- model.getValue(content) %>\</br>\
              <% } %>\
              </dd>\
          <%}) %>\
      </dl>\
    </div>'
    });
});
