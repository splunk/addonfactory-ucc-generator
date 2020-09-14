define(
    [
        'jquery',
        'underscore',
        'views/Base'
    ],
    function($,
             _,
             BaseView) {


        return BaseView.extend({
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            render: function() {
                var title = this._getTitle();
                this.$el.html(this.compiledTemplate({title: title}));
                this.children.preview = this._getPreview();
                this.children.preview.render().$el.appendTo(this.$('.preview-body'));
                return this;
            },
            _getTitle: function() {
                // override by sub modules
                return "";
            },
            _getPreview: function() {
                // override by sub modules
            },
            _getPayload: function() {
                // override by sub modules
                return {};
            },
            _isValid: function() {
                return true;
            },
            _addToDashboard: function(e) {
                e.preventDefault();
                // trigger event back to Master view, Master view will then pass it to controller
                this._isValid() && (this.trigger('addToDashboard', this._getPayload()));
            },
            template: '\
                <div class="header">\
                    <h3><%- title %></h3>\
                    <a class="btn btn-primary add-content" href="#"><%- _("Add to Dashboard").t() %></a>\
                </div>\
                <div class="preview-body"></div>\
            ',
            events: {
                'click .btn.add-content': '_addToDashboard'
            }
        });
    });