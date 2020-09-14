define([
    'underscore',
    'jquery',
    'module', 
    'views/shared/Modal',
    'views/shared/controls/ControlGroup', 
    'models/Base', 
    'models/search/Dashboard',
    'views/shared/FlashMessages', 
    'views/dashboards/table/controls/ConvertSuccess', 
    'views/shared/delegates/PairedTextControls',
    'views/shared/controls/TextControl',
    'util/splunkd_utils',
    'uri/route'
    ],
    
    function(
        _,
        $,
        module, 
        Modal, 
        ControlGroup, 
        BaseModel, 
        DashboardModel, 
        FlashMessagesView, 
        ConvertSuccessView, 
        PairedTextControls,
        TextControl,
        splunkDUtils, 
        route
    ) 
{

    var ConvertMode = {
        NEW: 0,
        REPLACE: 1
    };

    return Modal.extend({
        moduleId: module.id,
        
        initialize: function () {
            var that = this;

            Modal.prototype.initialize.apply(this, arguments);

            this.model.perms = new BaseModel({
                perms: 'private'
            });

            this.model.convertMode = new BaseModel({
                mode: ConvertMode.NEW
            });

            this.children.flashMessages = new FlashMessagesView({
                model: {
                    dashboard: this.model.dashboard,
                    dashboardMeta: this.model.dashboard.meta
                }
            });

            this.model.dashboard.meta.set({
                label: this.model.dashboard.meta.get('label') + _(' HTML').t()
            });

            this.children.titleTextControl = new TextControl({
                modelAttribute: 'label',
                model: this.model.dashboard.meta,
                placeholder: _('optional').t(),
                save: false
            });

            this.children.filenameTextControl = new TextControl({
                modelAttribute: 'name',
                model: this.model.dashboard.entry.content,
                save: false
            });

            this.children.filenameTextControl.setValue(
                splunkDUtils.nameFromString(this.model.dashboard.meta.get('label'))
            );

            this.pairedTextControls = new PairedTextControls({
                sourceDelegate: this.children.titleTextControl,
                destDelegate: this.children.filenameTextControl,
                transformFunction: splunkDUtils.nameFromString
            });

            this.children.mode = new ControlGroup({
                controlType: 'SyntheticRadio',
                controlClass: 'controls-halfblock',
                controlOptions: {
                    className: "btn-group btn-group-2",
                    modelAttribute: 'mode',
                    model: this.model.convertMode,
                    items: [
                        { label: _("Create New").t(), value: ConvertMode.NEW },
                        { label: _("Replace Current").t(), value: ConvertMode.REPLACE }
                    ],
                    save: false
                },
                label: _("Dashboard").t(),
                help: _("Recommended").t()

            });

            this.children.title = new ControlGroup({
                controls: this.children.titleTextControl,
                label: _("Title").t()
            });

            this.children.filename = new ControlGroup({
                controls: this.children.filenameTextControl,
                label: _("ID").t(),
                help: _("Can only contain letters, numbers and underscores.").t(),
                tooltip: _("The ID is used as the filename on disk. Cannot be changed later.").t()
            });

            this.children.description = new ControlGroup({
                controlType: 'Textarea',
                controlOptions: {
                    modelAttribute: 'description',
                    model: this.model.dashboard.meta,
                    placeholder: _("optional").t(),
                    save: false
                },
                label: _("Description").t()
            });


            this.children.permissions = new ControlGroup({
                controlType: 'SyntheticRadio',
                controlClass: 'controls-halfblock',
                controlOptions: {
                    className: "btn-group btn-group-2",
                    modelAttribute: 'perms',
                    model: this.model.perms,
                    items: [
                        { label: _("Private").t(), value: 'private' },
                        { label: _("Shared in App").t(), value: 'shared' }
                    ],
                    save: false
                },
                label: _("Permissions").t()
            });

            this.model.convertMode.on('change:mode', function() {
                that.children.flashMessages.flashMsgCollection.reset();

                if (that.model.convertMode.get('mode') === ConvertMode.NEW) {
                    that.children.title.show();
                    that.children.filename.show();
                    that.children.description.show();
                    that.children.permissions.show();
                } else { // === ConvertMode.REPLACE
                     that.children.flashMessages.flashMsgCollection.add({
                        type: 'warning',
                        html: _("This change cannot be undone.").t()
                    });
                    that.children.title.hide();
                    that.children.filename.hide();
                    that.children.description.hide();
                    that.children.permissions.hide();
                }
            });

        },
        events: $.extend({}, Modal.prototype.events, {
            'click a.modal-btn-primary': function(e) {
                e.preventDefault();
                this.submit();
            }
        }),
        submit: function() {
            var that = this;
            var dashboard = that.model.dashboard;
            var currentDashboard = that.model.currentDashboard;
            var app = that.model.application;
            var user = that.model.user;
            var sourceLink = route.page(app.get("root"), app.get("locale"), currentDashboard.entry.acl.get("app"), currentDashboard.entry.get('name')) + '/converttohtml';
            var updateCollection = that.collection && that.collection.dashboards;


            if (this.model.convertMode.get('mode') === ConvertMode.NEW) {
                dashboard.meta.validate();
                if (dashboard.meta.isValid()) { 
                    var meta = dashboard.meta.toJSON();
                    dashboard.entry.content.set('eai:data', currentDashboard.entry.content.get('eai:data'));
                    dashboard.entry.content.set('eai:type', 'views'); // necessary to make dashboard.meta.apply work
                    dashboard.meta.set(meta);
                    dashboard.meta.apply();

                    $.post(
                        sourceLink,
                        {
                            xmlString: dashboard.entry.content.get('eai:data'), 
                            newViewID: dashboard.entry.content.get('name')
                        }
                    ).done(function(htmlSource) {
                        dashboard.entry.content.set('eai:type', 'html');
                        dashboard.entry.content.set('eai:data', htmlSource);

                        dashboard.save({}, {
                            data: app.getPermissions(that.model.perms.get('perms'))
                        }).done(function() { 
                            if (updateCollection) { 
                                that.collection.dashboards.add(that.model.dashboard); 
                            }

                            _.defer(function() {
                                var successDialog = new ConvertSuccessView({
                                    model: {
                                        dashboard: dashboard,
                                        application: app,
                                        user: user
                                    },
                                    collection: that.collection 
                                });
                                successDialog.render().show();

                            });

                            that.hide();
                            that.remove();
                        });
                    });
                }
            } else { // === ConvertMode.REPLACE
                var $xml = currentDashboard.getReadOnly$XML();
                var noDashboardLabel = !$xml.find('dashboard>label').length;

                if (noDashboardLabel) {
                    // SPL-129954: when replacing a dashboard with a converted HTML 
                    // dashboard, add a label to the dashboard if one does not exist. 
                    // This will ensure all HTML dashboards have a header title.
                    currentDashboard.meta.apply();
                }
                
                $.post(
                    sourceLink,
                    {
                        xmlString: currentDashboard.entry.content.get('eai:data')
                    }
                ).done(function(htmlSource) {
                    currentDashboard.entry.content.set('eai:type', 'html');
                    currentDashboard.entry.content.set('eai:data', htmlSource);

                    currentDashboard.save().done(function() {

                        if (updateCollection) {
                            currentDashboard.trigger('updateCollection');
                        }

                        _.defer(function() {
                            var successDialog = new ConvertSuccessView({
                                model: {
                                    dashboard: currentDashboard,
                                    application: app
                                },
                                collection: that.collection,
                                refreshOnDismiss: !updateCollection
                            });
                            successDialog.render().show();

                        });

                        that.hide();
                        that.remove();
                    });
                });
            }
        },
        render: function () {
            var helpLink = route.docHelp(
                this.model.application.get("root"),
                this.model.application.get("locale"),
                'learnmore.html.dashboard'
            ); 

            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Convert Dashboard to HTML").t());
            this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessages.render().el);
            this.$(Modal.BODY_SELECTOR).append('<p>' + _("HTML dashboards cannot be edited using Splunk's visual editors.").t() +
                 '<br />' + _('Integrated PDF generation is not available for HTML dashboards.').t() + '<br />' + 
                 '<a href=' + helpLink + ' target="_blank">' +_("Learn More").t() + ' <i class="icon-external"></i></a></p>');
            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_JUSTIFIED);

            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.mode.render().el);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.title.render().el);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.filename.render().el);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.description.render().el);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.permissions.render().el);

            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">' + _("Convert Dashboard").t() + '</a>');
            return this;
        }
    });

});
