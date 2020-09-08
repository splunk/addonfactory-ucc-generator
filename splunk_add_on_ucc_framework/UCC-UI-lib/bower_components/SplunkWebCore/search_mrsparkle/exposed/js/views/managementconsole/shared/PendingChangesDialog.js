/**
 * Created by lrong on 4/1/16.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/managementconsole/DmcBase',
        'models/managementconsole/Change',
        'views/shared/Modal',
        'views/managementconsole/deploy/table/Master',
        'helpers/managementconsole/url',
        './PendingChangesDialog.pcss'

    ],
    function(
        $,
        _,
        Backbone,
        module,
        DmcBaseModel,
        ChangeModel,
        Modal,
        ChangesTableView,
        urlHelper,
        css
    ) {
        var HELP_TEXT = {
            'stanza-context': _("You can view all pending changes for this Stanza below").t(),
            'app-context': _("You can view all pending changes for this App below, including all stanza changes in this App context").t(),
            'server-class-context': _("You can view all pending changes for this Server Class below, including all stanza changes in this Server Class context").t(),
            'node-context': _("You can view all pending stanza changes unique to this node below").t(),
            'input-context': _("You can view all pending changes for this Input below.").t(),
            'output-context': _("You can view all pending changes for this Output Group below.").t()
        };

        return Modal.extend({
            moduleId: module.id,
            className: [Modal.CLASS_NAME, 'modal-wide'].join(' '),

            initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);

                this.options = this.options || {};
                this.mode = this.options.mode;

                this.model = this.model || {};
                this.model.state = new Backbone.Model({
                    isPendingExpanded: true
                });

                this.children.pendingTable = new ChangesTableView({
                    hideFilters: true,
                    hideColumns: this.mode === 'stanza-context',
                    simplifiedMoreInfo: {
                        hideBundle: this.mode !== 'output-context',
                        hideConfType: this.mode === 'stanza-context' || this.mode === 'output-context' || this.mode === 'input-context',
                        hideVersion: true
                    },
                    model: {
                        state: this.model.state
                    },
                    collection: {
                        changes: this.collection.pendingChanges
                    }
                });
            },

            render: function() {
                var bundleType = this.collection.pendingChanges.fetchData.get('bundleType');
                var bundleId = this.collection.pendingChanges.fetchData.get('bundleId');
                var bundleDisplayName = DmcBaseModel.getBundleContextLabel(bundleId, bundleType);

                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).text(_('Pending Changes').t());
                this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                    mode: this.mode,
                    helpText: HELP_TEXT[this.mode],
                    entityName: this.collection.pendingChanges.fetchData.get('name'),
                    outputName: this.collection.pendingChanges.fetchData.get('outputName'),
                    inputName: this.collection.pendingChanges.fetchData.get('inputName'),
                    bundleDisplayName: bundleDisplayName,
                    configurationType: this.collection.pendingChanges.fetchData.get('configurationType'),
                    appVersion: this.collection.pendingChanges.fetchData.get('appVersion'),
                    deployPageUrl: urlHelper.pageUrl('deploy')
                }));

                this.children.pendingTable.render().appendTo(this.$('.pending-table-placeholder'));

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DONE);

                return this;
            },

            template: '\
                <div class="changes-info">\
                    <% if (mode === "stanza-context") {%>\
                        <dl class="list-dotted pull-left">\
                            <dt><%- _("Change Type").t() %></dt>\
                            <dd><%- _("Stanza").t() %></dd>\
                            <dt><%- _("Stanza Name").t() %></dt>\
                            <dd><%- entityName %></dd>\
                        </dl>\
                        <dl class="list-dotted pull-left extra-padding-left">\
                            <dt><%- _("Context").t() %></dt>\
                            <dd><%- bundleDisplayName %></dd>\
                            <dt><%- _("Configuration Type").t() %></dt>\
                            <dd><%- configurationType %></dd>\
                        </dl>\
                    <% } else if (mode === "app-context") { %>\
                        <dl class="list-dotted pull-left">\
                            <dt><%- _("Context").t() %></dt>\
                            <dd><%- bundleDisplayName %></dd>\
                            <dt><%- _("Version").t() %></dt>\
                            <dd><%- appVersion %></dd>\
                        </dl>\
                    <% } else if (mode === "output-context") { %>\
                        <dl class="list-dotted pull-left">\
                            <dt><%- _("Change Type").t() %></dt>\
                            <dd><%- _("Output Group").t() %></dd>\
                            <dt><%- _("Output Group Name").t() %></dt>\
                            <dd><%- outputName %></dd>\
                        </dl>\
                        <dl class="list-dotted pull-left extra-padding-left">\
                            <dt><%- _("Configuration Type").t() %></dt>\
                            <dd><%- configurationType %></dd>\
                        </dl>\
                    <% } else if (mode === "input-context") { %>\
                        <dl class="list-dotted pull-left">\
                            <dt><%- _("Change Type").t() %></dt>\
                            <dd><%- _("Input").t() %></dd>\
                            <dt><%- _("Input Name").t() %></dt>\
                            <dd><%- inputName %></dd>\
                        </dl>\
                        <dl class="list-dotted pull-left extra-padding-left">\
                            <dt><%- _("Context").t() %></dt>\
                            <dd><%- bundleDisplayName %></dd>\
                            <dt><%- _("Configuration Type").t() %></dt>\
                            <dd><%- configurationType %></dd>\
                        </dl>\
                    <% } else { %>\
                        <dl class="list-dotted pull-left">\
                            <dt><%- _("Context").t() %></dt>\
                            <dd><%- bundleDisplayName %></dd>\
                        </dl>\
                    <% } %>\
                </div>\
                <div class="help-text">\
                    <p>\
                        <%- helpText + ". " +  _("If you want to view and deploy all pending changes in the deployment,").t() + " " %>\
                        <a class="external" href="<%- deployPageUrl %>" target="_blank">\
                            <%- _("click here to visit the Deploy Page").t() + "." %>\
                        </a>\
                    </p>\
                </div>\
                <div class="pending-table-placeholder"></div>\
			'
        });
    }
);