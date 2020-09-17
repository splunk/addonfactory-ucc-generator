/**
 * Created by lrong on 3/9/16.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'views/shared/controls/SyntheticCheckboxControl'
    ],
    function(
        $,
        _,
        Backbone,
        SyntheticCheckboxControlView
    ) {
        return SyntheticCheckboxControlView.extend({

            initialize: function() {
                SyntheticCheckboxControlView.prototype.initialize.apply(this, arguments);

                this.compiledExpandTemplate = _.template(this.expandTemplate);
                this.compiledCollapseTemplate = _.template(this.collapseTemplate);

                this.listenTo(this.options.model, 'change:' + this.options.modelAttribute, this.toggleExpansion);
                this.listenTo(this.options.model, 'change:' + this.options.modelAttribute, this.debouncedRender);
            },

            events: {
                'click .btn-pill': function(e) {
                    e.preventDefault();
                    if (this.options.enabled) {
                        this.setValue(!this._value);
                    }
                }
            },

            toggleExpansion: function () {
                var isCheckboxChecked = this._isExpandedChecked(),
                    isExpanded = null,
                    that = this;

                this.options.getExpandRows().each(function() {
                    isExpanded = $(this).hasClass('expanded');
                    // only do it when actual state (rows expanded or collapsed) doesn't match with selected one (checkbox)
                    if (isCheckboxChecked !== isExpanded) {
                        that.options.tableRowToggle.toggleRow($(this), false);
                    }
                });
            },

            render: function() {
                var checked = this.options.invertValue ? !this.getValue() : this.getValue();
                if (checked) {
                    this.$el.html(this.compiledCollapseTemplate());
                } else {
                    this.$el.html(this.compiledExpandTemplate());
                }
            },

            _isExpandedChecked: function() {
                return this.getValue() > 0;
            },

            expandTemplate: '\
              <a href="#" class="btn-pill">\
                <i class="icon-plus"></i>\
                <%- _("Expand All").t() + " " + this.options.label %>\
            </a>\
            ',

            collapseTemplate: '\
              <a href="#" class="btn-pill">\
              <i class="icon-minus"></i>\
                <%- _("Collapse All").t() + " " + this.options.label %> \
            </a>\
            '
        });
    }
);