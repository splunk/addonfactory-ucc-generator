/**
 * Created by rtran on 4/20/16.
 */
define([
    'jquery',
    'underscore',
    'module',
    'backbone',
    'views/Base',
    'bootstrap.tooltip'
], function($, _, module, Backbone, BaseView) {
    var TYPE = {
        instance: {
            template: ' \
                <td class="cell cell-host-name"><%- hostName %></td> \
                <td class="cell cell-dns-name"><%- dnsName %></td> \
                <td class="cell cell-client-name"><a href="<%- configureUrl %>"><%- clientName %></a></td> \
                <td class="cell cell-ip-address"><%- ip %></td> \
                <td class="cell cell-last-phone-home"><%- lastPhoneHome %></td> \
                <% if (statusExplanation) { %> \
                <td class="cell cell-deploy-status alert-error"> \
                    <i class="icon-alert"></i> \
                <% } else { %> \
                <td class="cell cell-deploy-status"> \
                <% } %> \
                <%- deployStatus %> \
                </td> \
            ',
            entry: [
                {reference: 'hostName', field: 'hostname'},
                {reference: 'dnsName', field: 'dns'},
                {reference: 'clientName', field: 'clientName'},
                {reference: 'configureUrl', method: 'getConfigureUrl'},
                {reference: 'ip', field: 'ip'},
                {reference: 'lastPhoneHome', method: 'getRelativeLastPhoneHomeTime'},
                {reference: 'deployStatus', method: 'getInstanceDeployStatus'},
                {reference: 'statusExplanation', method: 'getInstanceStatusExplanation'}
            ]
        },
        bundle: {
            template: ' \
                <td class="cell cell-bundle-name"><a href="<%- configureUrl %>"><%- bundleName %></a></td> \
                <td class="cell cell-context-type"><%- contextType %></td> \
                <% if (statusExplanation) { %> \
                <td class="cell cell-deploy-status alert-error"> \
                    <i class="icon-alert"></i> \
                <% } else { %> \
                <td class="cell cell-deploy-status"> \
                <% } %> \
                <%- deployStatus %> \
                </td> \
                ',
            entry: [
                {reference: 'bundleName', method: 'getDisplayName'},
                {reference: 'contextType', method: 'getBundleLabel'},
                {reference: 'configureUrl', method: 'getConfigureUrl'},
                {reference: 'deployStatus', method: 'getDeployStatusLabel'},
                {reference: 'statusExplanation', method: 'getDeployStatusExplanation'}
            ]
        }
    };

    return BaseView.extend({
        moduleId: module.id,
        tagName: 'tr',

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.redirectReturnToPage = this.options.redirectReturnToPage;
            this.type = this.options.type;

            this.compiledTemplate = _.template(TYPE[this.type].template);
        },

        methodDecorators: {
            getConfigureUrl: function() {
                return this.model.entity.getConfigureUrl({return_to_page: this.redirectReturnToPage});
            },
            getInstanceDeployStatus: function() {
                var selectedBundle = this.model.state.get('context'),
                    bundle = this.model.entity.getBundleByBundleName(selectedBundle),
                    upToDate;

                if (selectedBundle === 'all') {
                    upToDate = this.model.entity.entry.content.get('@upToDate');
                } else if (_.isUndefined(bundle)) {
                    this.$el.html();
                    return;
                } else {
                    upToDate = bundle.entry.content.get('upToDate');

                }

                if (_.isNull(upToDate) || _.isUndefined(upToDate)) {
                    return _('N/A').t();
                }

                return !!upToDate ? _('Up-to-date').t() : _('Out-of-date').t();
            },
            getInstanceStatusExplanation: function() {
                var selectedBundle = this.model.state.get('context'),
                    bundle = this.model.entity.getBundleByBundleName(selectedBundle),
                    statusExplanation;

                if (selectedBundle === 'all') {
                    statusExplanation = null;
                } else if (_.isUndefined(bundle)) {
                    this.$el.html();
                    return;
                } else {
                    statusExplanation = bundle.entry.content.get('error');
                }

                return statusExplanation;
            }
        },

        constructRenderObject: function() {
            var entries = TYPE[this.type].entry;
            var renderObject = {};
            _.each(entries, function(entry) {
                if (!_.isUndefined(entry.method)) {
                    // if a method dectory exists && is a function -> call method decorator for that field
                    if (_.has(this.methodDecorators, entry.method) && _.isFunction(this.methodDecorators[entry.method])) {
                        renderObject[entry.reference] = this.methodDecorators[entry.method].call(this);
                    // else ->just call method
                    } else {
                        renderObject[entry.reference] = this.model.entity[entry.method].apply(this.model.entity);
                    }
                } else if (!_.isUndefined(entry.field)) {
                    renderObject[entry.reference] = this.model.entity.entry.content.get(entry.field);
                } else {
                    throw new Error('Ill formatted entry');
                }
            }, this);
            return renderObject;
        },

        render: function() {
            var renderObject = this.constructRenderObject();
            this.$el.html(this.compiledTemplate(renderObject));

            if (!_.isNull(renderObject.statusExplanation)) {
                this.$('.icon-alert').tooltip({
                    title: renderObject.statusExplanation
                });
            }

            return this;
        }
    });
});