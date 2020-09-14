define([
            'underscore',
            'module',
            './ErrorPayload',
            'views/Base',
            'views/shared/FlashMessages',
            'uri/route',
            'util/splunkd_utils',
            'splunk.util'
        ],
        function(
            _,
            module,
            ErrorPayload,
            BaseView,
            FlashMessages,
            route,
            splunkdUtils,
            splunkUtils
        ) {

    return BaseView.extend({

        moduleId: module.id,
        className: 'load-failure-messages',

        initialize: function() {
            this.children.flashMessages = new FlashMessages();
            this.errorPayload = this.options.errorPayload;
            this.urlRouter = route.getContextualPageRouter(this.model.application);
            var messages = this._parseErrorMessages(this.errorPayload.type, this.errorPayload.metadata);
            messages = _.isArray(messages) ? messages : [messages];
            _(messages).each(function(message) {
                this.children.flashMessages.flashMsgHelper.addGeneralMessage(_.uniqueId('pivot-load-error'), message);
            }, this);
            this.links = this._createLinks(this.errorPayload.type, this.errorPayload.metadata);
            this.links = _.isArray(this.links) ? this.links : [this.links];
        },

        render: function() {
            this.children.flashMessages.render().appendTo(this.el);
            this.$el.append(this.compiledTemplate({ links: this.links }));
            return this;
        },

        template: '\
            <div class="links-holder">\
                <% _(links).each(function(link) { %>\
                    <a href="<%- link.href %>"><%- link.text %></a>\
                <% }) %>\
            </div>\
        ',

        _parseErrorMessages: function(errorType, errorMetadata) {
            if (errorType === ErrorPayload.TYPES.STRING) {
                return { type: splunkdUtils.ERROR, html: _.escape(errorMetadata.messageText) };
            }
            if (errorType === ErrorPayload.TYPES.RAW) {
                return _(errorMetadata.messages).chain()
                    .filter(function(message) {
                        return (message.type === splunkdUtils.ERROR || message.type === splunkdUtils.FATAL);
                    })
                    .map(function(message) {
                        return { type: message.type, html: _.escape(message.text) };
                    }).value();
            }
            if (errorType === ErrorPayload.TYPES.DATA_MODEL) {
                return {
                    type: splunkdUtils.ERROR,
                    html: splunkUtils.sprintf(
                        _('Your pivot cannot complete because the following supporting data model does not exist or is not shared globally to all apps: %s.').t(),
                        _.escape(errorMetadata.dataModel.id)
                    )
                };
            }
            if (errorType === ErrorPayload.TYPES.SEED_SID) {
                return {
                    type: splunkdUtils.ERROR,
                    html: splunkUtils.sprintf(
                        _('Your pivot cannot complete because a dataset could not be generated from the search job with id: %s.').t(),
                        _.escape(errorMetadata.seedSid)
                    )
                };
            }
            if (errorType === ErrorPayload.TYPES.OBJECT) {
                return {
                    type: splunkdUtils.ERROR,
                    html: splunkUtils.sprintf(
                        _('Your pivot cannot complete because the %s dataset does not exist in the data model.').t(),
                        _.escape(errorMetadata.objectName)
                    )
                };
            }
            if (errorType === ErrorPayload.TYPES.REPORT) {
                return {
                    type: splunkdUtils.ERROR,
                    html: splunkUtils.sprintf(
                        _('Your pivot cannot complete because the %s report either does not exist or does not have the correct permissions.').t(),
                        _.escape(errorMetadata.report.id)
                    )
                };
            }
            if (errorType === ErrorPayload.TYPES.PIVOT_SEARCH) {
                return {
                    type: splunkdUtils.ERROR,
                    html: _('Your pivot cannot complete because the search string could not be parsed into a valid pivot configuration.').t()
                };
            }
            if (errorType === ErrorPayload.TYPES.DATASET) {
                return {
                    type: splunkdUtils.ERROR,
                    html: splunkUtils.sprintf(
                        _('Your pivot cannot complete because the following dataset does not exist or is not shared globally to all apps: %s.').t(),
                        _.escape(splunkUtils.searchUnescape(errorMetadata.datasetName))
                    )
                };
            }
        },

        _createLinks: function(errorType, errorMetadata) {
            if (errorType === ErrorPayload.TYPES.DATA_MODEL) {
                return [
                    { text: _('Select New Dataset').t(), href: this.urlRouter.datasets() },
                    { text: _('Manage Data Models').t(), href: this.urlRouter.data_model_manager() }
                ];
            }
            if (errorType === ErrorPayload.TYPES.SEED_SID) {
                return {
                    text: _('Return to Search').t(),
                    href: this.urlRouter.search({ data: { sid: errorMetadata.seedSid } })
                };
            }
            if (errorType === ErrorPayload.TYPES.OBJECT) {
                var dataModelId = errorMetadata.dataModel.id;
                return [
                    { text: _('View Data Model').t(), href: this.urlRouter.pivot({ data: { model: dataModelId } }) },
                    { text: _('Select New Dataset').t(), href: this.urlRouter.datasets() },
                    { text: _('Edit Datasets').t(), href: this.urlRouter.data_model_editor({ data: { model: dataModelId } }) }
                ];
            }
            if (errorType === ErrorPayload.TYPES.REPORT) {
                return { text: _('Manage Reports').t(), href: this.urlRouter.reports() };
            }
            if (errorType === ErrorPayload.TYPES.PIVOT_SEARCH) {
                var reportContent = errorMetadata.report.entry.content,
                    latestTime = reportContent.get('dispatch.latest_time'),
                    searchParams = {
                        q: reportContent.get('search'),
                        earliest: reportContent.get('dispatch.earliest_time') || 0
                    };

                if(latestTime) {
                    searchParams.latest = latestTime;
                }
                var links = [
                    { text: _('Open In Search').t(), href: this.urlRouter.search({ data: searchParams }) }
                ];
                if (errorMetadata.dataModelId) {
                    links.push({
                        text: _('View Data Model').t(),
                        href: this.urlRouter.pivot({ data: { model: errorMetadata.dataModelId } })
                    });
                }
                links.push({ text: _('Select New Dataset').t(), href: this.urlRouter.datasets() });
                return links;
            }
            if (errorType === ErrorPayload.TYPES.DATASET) {
                return { text: _('Select New Dataset').t(), href: this.urlRouter.datasets() };
            }
            return [];
        }

    });

});