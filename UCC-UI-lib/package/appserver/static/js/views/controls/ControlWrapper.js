import CONTROL_TYPE_MAP from 'app/constants/controlTypeMap';
import restEndpointMap from 'app/constants/restEndpointMap';
import {generateCollection} from 'app/util/backboneHelpers';

define([
    'views/Base',
    'lodash'
], function(
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
        initialize: function(options) {
            _.extend(this, options);

            const {type} = options;
            // Support both string mapping and raw component
            const controlType = typeof type === 'string' ?
                CONTROL_TYPE_MAP[type] : type;

            this.control = new controlType(this.controlOptions);
            this.listenTo(this.control, 'all', this.trigger);

            const {referenceName, endpointUrl} = this.controlOptions;
            if(referenceName || endpointUrl) {
                this._loadSingleSelectReference(endpointUrl, referenceName);
            }
        },

        events: {
            'click a.tooltip-link': function(e) {
                e.preventDefault();
            }
        },
        // TODO: support more component loading content dynamically like this one
        _loadSingleSelectReference: function(endpointUrl, referenceName) {
            let referenceCollectionInstance;
            if (!restEndpointMap[referenceName]) {
                referenceCollectionInstance = generateCollection(referenceName, {endpointUrl});
            } else {
                referenceCollectionInstance = generateCollection('', {'endpointUrl': restEndpointMap[referenceName]});
            }
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
                // unset defaultValue if not in loading list
                this.controlOptions.model.set(this.controlOptions.modelAttribute, '');
            });
        },

        validate: function() {
            return this.control.validate();
        },

        render: function() {
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
            return this;
        },

        remove: function() {
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
