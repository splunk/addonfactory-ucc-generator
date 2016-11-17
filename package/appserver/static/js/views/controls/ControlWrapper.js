import CONTROL_TYPE_MAP from 'app/constants/controlTypeMap';
import {generateCollection} from 'app/util/backbone';

define([
    'views/Base',
    'lodash'
], function (
    BaseView,
    _
) {
    /**
     *  A wrapper view for controls.
     *      An extra label will be render
     *      (TODO)A loading indicator will be render along with the control.
     */
    return BaseView.extend({
        className: 'form-horizontal',
        initialize: function (options) {
            this.label = options.label;
            _.extend(this, options);
            this.labelPosition = options.labelPosition || 'top';
            // Support both string mapping and raw component
            const controlType = typeof options.controlType === 'string' ?
                CONTROL_TYPE_MAP[options.controlType] : options.controlType;
            this.control = new controlType(this.controlOptions);
            this.listenTo(this.control, 'all', this.trigger);
            const {referenceName, customizedUrl} = this.controlOptions;
            if(referenceName || customizedUrl) {
                this._loadSingleSelectReference(customizedUrl, referenceName);
            }
        },

        events: {
            'click a.tooltip-link': function (e) {
                e.preventDefault();
            }
        },
        // TODO: support more component loading content dynamically like this one
        _loadSingleSelectReference: function(customizedUrl, referenceName) {
            const referenceCollection = generateCollection(referenceName, {customizedUrl});
            const referenceCollectionInstance = new referenceCollection([], {
                targetApp: this.addonName,
                targetOwner: "nobody"
            });
            const referenceDeferred = referenceCollectionInstance.fetch();
            referenceDeferred.done(() => {
                let dic = _.map(referenceCollectionInstance.models, model => {
                    return {
                        label: model.entry.attributes.name,
                        value: model.entry.attributes.name
                    };
                });
                if(this.control.setAutoCompleteFields) {
                    this.control.setAutoCompleteFields(dic, true);
                }
            });
        },

        validate: function () {
            return this.control.validate();
        },

        render: function () {
            this.$el.html(this.compiledTemplate({
                label: this.label,
                tooltip: this.tooltip,
                required: this.required,
                help: this.help
            }));
            if (this.tooltip) {
                this.$('.tooltip-link').tooltip({
                    animation: false,
                    title: this.options.tooltip,
                    container: 'body'
                });
            }
            var $control = this.control.render().$el;
            if (this.controlClass) {
                $control.addClass(this.controlClass);
            }
            this.$('.control-placeholder').prepend($control);
            this.$el.addClass('form-small');
            this.wrapperClass && this.$el.addClass(this.wrapperClass);
            return this;
        },

        remove: function () {
            if (this.tooltip) {
                this.$('.tooltip-link').tooltip('destroy');
            }
            return BaseView.prototype.remove.apply(this, arguments);
        },

        template: `
            <div class="form-group control-group">
                <% if (label) { %>
                    <div class="control-label col-sm-2">
                    <p>
                        <%- _(label).t() %>
                        <% if (tooltip) { %>
                            <a href="#" class="tooltip-link"><%- _("?").t() %></a>
                        <% } %>
                        <% if (required) { %>
                            <span class="required">*</span>
                        <% } %>
                    </p>
                    </div>
                <% } %>
                <div class="col-sm-10 controls control-placeholder">
                    <% if (help) { %>
                        <span class="help-block">
                        <%- _(help).t() %></span>
                    <% } %>
                </div>
            </div>
        `
    });
});
