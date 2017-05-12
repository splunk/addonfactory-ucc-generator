import $ from 'jquery';
import _ from 'lodash';
import Backbone from 'backbone';
import GroupSectionTemplate from 'app/views/component/GroupSection.html';

export default Backbone.View.extend({
    className: 'section-group',

    initialize: function (options) {
        // label, options, controls
        _.extend(this, options);
        if (options.options) {
            this.expand = !options.options.expand || false;
            this.isExpandable = options.options.isExpandable || false;
        }
    },

    render: function () {
        let compiled = _.template(GroupSectionTemplate);
        this.$el.html(compiled({
            label: _(this.label).t(),
            isExpandable: this.isExpandable ? 'expandable' : ''
        }));
        this.renderContent();
        this._onHeaderClick();
        return this;
    },

    renderContent: function () {
        _.each(this.controls, control => {
            control = control.render();
            this.$('.section-body').append(control.$el || control.el);
        });
    },

    events: {
        'click .section-header': '_onHeaderClick'
    },

    _onHeaderClick: function () {
        if (!this.isExpandable) {
            return;
        }
        if (this.expand) {
            //hide section content
            this.$('.section-header i')
                .removeClass('icon-chevron-down')
                .addClass('icon-chevron-right');
            this.$('.section-body').hide();
            this.expand = false;
        }
        else {
            //show section content
            this.$('.section-header i')
                .removeClass('icon-chevron-right')
                .addClass('icon-chevron-down');
            this.$('.section-body').show();
            this.expand = true;
        }
    }
});
