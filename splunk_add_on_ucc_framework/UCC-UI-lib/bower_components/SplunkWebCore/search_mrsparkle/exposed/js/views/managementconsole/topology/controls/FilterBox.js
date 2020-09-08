/**
 * Created by lrong on 8/24/15.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/managementconsole/topology/Instance',
        'models/managementconsole/Group',
        'views/Base',
        'views/shared/controls/MultiInputControl',
        'views/shared/controls/SyntheticSelectControl',
        'views/shared/controls/ControlGroup',
        'helpers/managementconsole/url',
        'bootstrap.collapse' //NO IMPORT
    ],
    function(
        $,
        _,
        Backbone,
        module,
        InstanceModel,
        GroupModel,
        BaseView,
        MultiInputControl,
        SyntheticSelectControl,
        ControlGroup,
        urlHelper
    ) {

        // Static (like) config parameters to configure the filter box
        var FILTER_TYPES = {
            METADATA: 'metadata',
            SERVER_ROLES: 'serverRoles',
            SERVER_CLASSES: 'serverClasses'
        };

        var METADATA_FILTERS = {
            HOST_NAME: {field: 'hostname', label: _('Host Name').t(), placeholder: _('Enter Host Name').t(), controlClass: MultiInputControl},
            DNS: {field: 'dns', label: _('DNS Name').t(), placeholder: _('Enter DNS Name').t(), controlClass: MultiInputControl},
            CLIENT_NAME: {field: 'clientName', label: _('Client Name').t(), placeholder: _('Enter Client Name').t(), controlClass: MultiInputControl},
            IP: {field: 'ip', label: _('IP Address').t(), placeholder: _('Enter IP Address').t(), controlClass: MultiInputControl},
            SPLUNK_PLATFORM: {field: 'splunkPlatform', label: _('Machine Type').t(), placeholder: _('Enter Machine Type').t(), controlClass: MultiInputControl},
            SPLUNK_VERSION: {field: 'splunkVersion', label: _('Splunk Version').t(), placeholder: _('Enter Splunk Version').t(), controlClass: MultiInputControl},
            DEPLOY_STATUS: {field: 'upToDate', label: _('Deploy Status').t(), controlClass: SyntheticSelectControl, items: [
                { value: 'all', label: _('All').t() },
                { value: 'up', label: _('Up-to-date').t() },
                { value: 'out', label: _('Out-of-date').t() }
            ]}
        };

        return BaseView.extend(
            {
                moduleId: module.id,

                initialize: function(options) {
                    BaseView.prototype.initialize.call(this, arguments);

                    // default config
                    var defaults = {
                        filters: [
                            FILTER_TYPES.SERVER_ROLES,
                            FILTER_TYPES.METADATA,
                            FILTER_TYPES.SERVER_CLASSES],
                        excludeMetadataFields: [],
                        serverRoles: [
                            InstanceModel.valDMC(),
                            InstanceModel.valIDX(),
                            InstanceModel.valSH(),
                            InstanceModel.valForwarder()
                        ]
                    };
                    _.defaults(this.options, defaults);

                    // create items for the server roles section
                    var items = [];
                    _.each(this.options.serverRoles, function(role) {
                        if (_.isString(role)) {
                            items.push( {
                                label: InstanceModel.getLabelFromSplunkRole(role),
                                value: role
                            });
                        } else {
                            items.push(role);
                        }

                    });
                    // Full Capability | Hidden in Forwarder Management Only
                    if (_.contains(this.options.filters, FILTER_TYPES.SERVER_ROLES)) {
                        this.children.splunkRoleFilter = new ControlGroup({
                            controlType: 'CheckboxGroup',
                            controlOptions: {
                                model: this.model.filter,
                                modelAttribute: 'topology',
                                items: items
                            }
                        });
                    }

                    if (_.contains(this.options.filters, FILTER_TYPES.SERVER_CLASSES)) {
                        this.children.serverClassFilter = this._getServerClassFilterControl();
                        this.listenTo(this.collection.serverClasses, 'sync', this.debouncedRender);
                    }

                    this.compiledMetaDataTemplate = _.template(this.metaDataTemplate);

                    // create filter fields
                    this._metadatFields = _.difference(_.values(METADATA_FILTERS), this.options.excludeMetadataFields);
                    _.each(this._metadatFields, function(item) {
                        switch (item.controlClass) {
                            case MultiInputControl:
                                this.children[item.field + 'Filter'] = new MultiInputControl({
                                    model: this.model.filter,
                                    modelAttribute: item.field,
                                    placeholder: item.placeholder
                                });
                                break;
                            case SyntheticSelectControl:
                                this.children[item.field + 'Filter'] = new SyntheticSelectControl({
                                    model: this.model.filter,
                                    modelAttribute: item.field,
                                    items: item.items,
                                    menuWidth: 'normal',
                                    className: 'control',
                                    toggleClassName: 'btn',
                                    popdownOptions: {
                                        detachDialog: true
                                    }
                                });
                                break;
                            default:
                                break;
                        }
                    }, this);

                    if (this.model.classicurl) {
                        this.listenTo(this.model.classicurl, 'change', this._updateReturnUrl);
                    }
                },

                events: {
                    'hidden .accordion': '_toggleIcon',
                    'shown .accordion': '_toggleIcon',
                    'click .clear-filter-link': '_resetFilter',
                    'click .hide-filters-btn': '_hideFilters'
                },

                // This method updates the return URL for all the "gear" link to the configuration page
                _updateReturnUrl: function() {
                    // If Full Access, Update the Server Role Filter links as well
                    if (_.contains(this.options.filters, FILTER_TYPES.SERVER_ROLES)) {
                        this.collection.builtinGroups.each(this._updateConfigureLink, this);
                    }

                    this.collection.serverClasses.each(this._updateConfigureLink, this);
                },

                _toggleIcon: function(e) {
                    $(e.target)
                        .prev('.accordion-heading')
                        .find('i.icon-accordion-toggle')
                        .toggleClass('icon-triangle-down-small icon-triangle-right-small');
                },

                _resetFilter: function(e) {
                    e.preventDefault();
                    this.model.filter.resetAttrs(this.model.user.isForwarderOnly());
                },

                _hideFilters: function(e) {
                    e.preventDefault();
                    this.model.state.set('hideFilters', true);
                },

                _generateServerClassItems: function() {
                    return this.collection.serverClasses.map(function(serverClass) {
                        return {value: serverClass.entry.get('name')};
                    });
                },

                _getServerClassFilterControl: function() {
                    return new ControlGroup({
                        controlType: 'CheckboxGroup',
                        controlOptions: {
                            model: this.model.filter,
                            modelAttribute: 'serverClass',
                            items: this._generateServerClassItems()
                        }
                    });
                },

                _updateConfigureLink: function(entity) {
                    this.$('a[data-group="' + _.escape(entity.entry.get('name')) + '"]')
                        .attr('href', entity.getConfigureUrl({
                            return_to: window.location.href,
                            return_to_page: 'topology_page'
                        }));
                },

                render: function() {
                    this.$el.html(this.compiledTemplate({
                        user: this.model.user,
                        filters: this.options.filters,
                        filterTypes: FILTER_TYPES,
                        serverClassPageUrl: urlHelper.pageUrl('custom_groups', {
                            createDialogOpen: 1
                        }),
                        showServerClasses: _.contains(this.options.filters, FILTER_TYPES.SERVER_CLASSES) &&
                            this.collection.serverClasses.canRead(),
                        canCreateServerClasses: _.contains(this.options.filters, FILTER_TYPES.SERVER_CLASSES) &&
                            this.collection.serverClasses.canCreate()
                    }));
                    // Full Capability | Hidden in Forwarder Management Only
                    if (_.contains(this.options.filters, FILTER_TYPES.SERVER_ROLES)) {
                        if (this.children.splunkRoleFilter) {
                            this.children.splunkRoleFilter.detach();
                        }

                        this.children.splunkRoleFilter.render().appendTo(this.$('.splunk-role-filter-placeholder'));

                        if (this.collection.builtinGroups) {
                            this.collection.builtinGroups.each(this._attachActiveConfigureLink, this);
                        }
                    }

                    // Hide or show No Server Class text
                    if (this.collection.serverClasses && this.collection.serverClasses.length === 0) {
                        this.$('.dmc-no-results').show();
                    } else {
                        this.$('.dmc-no-results').hide();
                    }

                    if (_.contains(this.options.filters, FILTER_TYPES.SERVER_CLASSES)) {
                        // Adding the gear icon next to each server class, which links to the configuration page of that server class
                        if (this.children.serverClassFilter) {
                            this.children.serverClassFilter.detach();
                        }
                        this.children.serverClassFilter = this._getServerClassFilterControl();
                        this.children.serverClassFilter.render().appendTo(this.$('.server-class-filter-placeholder'));
                        this.collection.serverClasses.each(this._attachActiveConfigureLink, this);
                    }

                    _.each(this._metadatFields, function(item) {

                        var filter = this.children[item.field + 'Filter'];
                        if (filter) {
                            filter.detach();
                        }

                        /**
                         * We have a slightly different way of displaying a multiInputControl ( a label on top
                         * and then the field below). Instead of overriding the template completely , we can wrap
                         * the existing template with a label on top. To do this we construct a new template and
                         * update the compiledTemplate on the field with the new wrapped compiledTemplate
                         */
                        var $metaDataFilter = $(this.compiledMetaDataTemplate({label: item.label}));
                        $metaDataFilter.find('.filter-control').append(filter.render().el);

                        this.$('.metadata-filter-placeholder').append($metaDataFilter);
                    }, this);
                    return this;
                },

                _attachActiveConfigureLink: function(entity) {
                    var groupName = entity.entry.get('name'),
                        elName = entity.isBuiltin() ? InstanceModel.configureGroupToTopologyGroup(groupName) : groupName,
                        configureUrl = entity.getConfigureUrl({ return_to: window.location.href, return_to_page: 'topology_page' });
                    
                    if (configureUrl === null) {
                        this._attachDisabledConfigureLink(entity);
                    } else {
                        this._lookupControlEl(elName).prepend('<a href="' + configureUrl + '" class="configure-group-link" data-group="' + _.escape(groupName) + '"><i class="icon-gear"></i></a>');
                    }
                },

                _attachDisabledConfigureLink: function(entity) {
                    var name = entity.entry.get('name');

                    this._lookupControlEl(name).prepend('<span class="configure-group-link disabled-action"><i class="icon-gear"></i></span>');
                },

                // A Control creates elements with data-name, we can look them up this way
                _lookupControlEl: function(name) {
                    return this.$('div[data-name="' + _.escape(name) + '"]');
                },

                template: '\
                    <div class="clear-all-section">\
                        <a href="#" class="hide-filters-btn btn-pill"><i class="icon-chevron-left icon-no-underline"></i><span><%- _("Hide Filters").t() %></span></a>\
                        <a href="#" class="clear-filter-link btn-pill pull-right"><%- _("Clear All Filters").t() %></a>\
                    </div>\
                    <div class="accordion">\
                        <% if (_.contains(filters, filterTypes.SERVER_ROLES)) { %>\
                            <div class="accordion-group">\
                                <div class="accordion-heading">\
                                    <a class="accordion-toggle" data-toggle="collapse" data-target="#splunk-role"><i class="icon-accordion-toggle icon-triangle-down-small"></i> <span class="accordion-toggle-text"><%- _("Server Role").t() %></span></a>\
                                </div>\
                                <div id="splunk-role" class="accordion-body collapse in">\
                                    <div class="splunk-role-filter-placeholder filter-placeholder"></div>\
                                </div>\
                            </div>\
                        <% } %>\
                        <% if (_.contains(filters, filterTypes.METADATA)) { %>\
                        <div class="accordion-group">\
                            <div class="accordion-heading">\
                                <a class="accordion-toggle" data-toggle="collapse" data-target="#metadata"><i class="icon-accordion-toggle icon-triangle-down-small"></i> <span class="accordion-toggle-text"><%- _("Metadata").t() %></span></a>\
                            </div>\
                            <div id="metadata" class="accordion-body collapse in">\
                                <div class="metadata-filter-placeholder filter-placeholder">\
                                </div>\
                            </div>\
                        </div>\
                        <% } %>\
                        <% if (showServerClasses) { %>\
                        <div class="accordion-group">\
                            <div class="accordion-heading">\
                                <a class="accordion-toggle" data-toggle="collapse" data-target="#server-class"><i class="icon-accordion-toggle icon-triangle-down-small"></i> <span class="accordion-toggle-text"><%- _("Server Class").t() %></span></a>\
                            </div>\
                            <div id="server-class" class="accordion-body collapse in">\
                                <div class="server-class-filter-placeholder filter-placeholder"></div>\
                                <div class="dmc-no-results">\
                                    <p>\
                                        <%- _("No server classes in the deployment").t() + ". " %><br>\
                                        <% if (canCreateServerClasses) { %> \
                                        <a class="external" href="<%- serverClassPageUrl %>" target="_blank"><%- _("Click here to create server classes").t() + "." %></a>\
                                        <% } %> \
                                    </p>\
                                </div>\
                            </div>\
                        </div>\
                        <% } %>\
                    </div>\
                ',

                metaDataTemplate :'\
                    <div>\
                        <p><%- label %></p>\
                        <div class="filter-control"></div>\
                    </div>'
            },
            {
                FILTER_TYPES: FILTER_TYPES,
                METADATA_FILTERS: METADATA_FILTERS
            }
        );
    }
);
