define([
    'underscore',
    'jquery',
    'views/Base',
    'module',
    'splunk.i18n'
    ],
    function(
        _,
        $,
        BaseView,
        module,
        i18n
    ) {
        return BaseView.extend({
            moduleId: module.id,
            render: function() {
                var isLite = this.model.serverInfo.isLite(),
                    creationTime = i18n.format_datetime(this.model.license.entry.content.get('creation_time')),
                    expirationTime = i18n.format_datetime(this.model.license.entry.content.get('expiration_time')),
                    features = this.model.license.entry.content.get('features'),
                    licenseHash = this.model.license.entry.content.get('license_hash'),
                    licenseName = this.model.license.entry.content.get('label'),
                    maximumViolations = this.model.license.entry.content.get('max_violations'),
                    quota = this.model.license.entry.content.get('quota'),
                    sourceTypes = this.model.license.entry.content.get('sourcetypes'),
                    stackName = this.model.license.entry.content.get('stack_id'),
                    status = this.model.license.entry.content.get('status'),
                    type = this.model.license.entry.content.get('type'),
                    windowPeriod = this.model.license.entry.content.get('window_period');

                this.el.innerHTML = this.compiledTemplate({
                    _: _,
                    isLite: isLite,
                    creationTime: creationTime,
                    expirationTime: expirationTime,
                    features: features,
                    licenseHash: licenseHash,
                    licenseName: licenseName,
                    maximumViolations: maximumViolations,
                    quota: quota,
                    sourceTypes: sourceTypes,
                    stackName: stackName,
                    status: status,
                    type: type,
                    windowPeriod: windowPeriod
                });
                
                return this;
            },

            template: '\
            <dl class="list-dotted">\
                <dt class="creation-time-dt"><%- _("Creation Time").t() %></dt>\
                    <dd class="creation-time-dd"><%= creationTime %></dd>\
                <dt class="expiration-time-dt"><%- _("Expiration Time").t() %></dt>\
                    <dd class="expiration-time-dd"><%= expirationTime %></dd>\
                <% if (features.length != 0) { %>\
                    <dt class="features-dt"><%- _("Features").t() %></dt>\
                        <% for (var i = 0; i < features.length; i++) { %>\
                            <dd class="features-dd"><%=features[i]%></dd>\
                        <% } %>\
                <% } %>\
                <dt class="hash-dt"><%- _("Hash").t() %></dt>\
                    <dd class="hash-dd"><%= licenseHash %></dd>\
                <dt class="license-name-dt"><%- _("Label").t() %></dt>\
                    <dd class="license-name-dd"><%= licenseName %></dd>\
                <dt class="maximum-violations-dt"><%- _("Maximum Violations").t() %></dt>\
                    <dd class="maximum-violations-dd"><%= maximumViolations %></dd>\
                <dt class="quota-bytes-dt"><%- _("Quota in Bytes").t() %></dt>\
                    <dd class="quota-bytes-dd"><%= quota %></dd>\
                <% if (sourceTypes.length != 0) { %>\
                    <dt class="sourcetypes-dt"><%- _("Source Types").t() %></dt>\
                    <% for (var i = 0; i < sourcetypes.length; i++) { %>\
                        <dd class="sourcetypes-dd"><%=sourcetypes[i]%></dd>\
                    <% } %>\
                <% } %>\
                <dt class="stack-name-dt"><%- _("Stack Name").t() %></dt>\
                    <dd class="stack-name-dd"><%= stackName %></dd>\
                <dt class="status-dt"><%- _("Status").t() %></dt>\
                    <dd class="status-dd"><%= status %></dd>\
                <dt class="type-dt"><%- _("Type").t() %></dt>\
                    <dd class="type-dd"><%= type %></dd>\
                <dt class="window-period-dt"><%- _("Window Period").t() %></dt>\
                    <dd class="window-period-dd"><%= windowPeriod %></dd>\
            </dl>\
        '
        });
    }
);
