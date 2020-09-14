define([
    'jquery',
    'underscore',
    'module',
    'backbone',
    'views/shared/Modal',
    'models/Base',
    'models/search/Dashboard',
    'util/splunkd_utils',
    'util/pdf_utils',
    './InfoDelivery.pcss',
    'splunk.util',
    'models/services/shcluster/Config',
    'views/shared/controls/SyntheticCheckboxControl'
],

    function (
        $,
        _,
        module,
        Backbone,
        Modal,
        BaseModel,
        DashboardModel,
        splunkDUtils,
        PDFUtils,
        css,
        splunk_util,
        ShClusterModel,
        SyntheticCheckbox
    )
{

    return Modal.extend({
        moduleId: module.id,
        className: 'modal fade modal-info-delivery modal-wide',
        initialize: function () {
            Modal.prototype.initialize.apply(this, arguments);

            // saving important variables in memory
            // checkbox -> value of the do not show this again checkbox
            // update -> used to check if the checkbox value is different then what is saved in the conf file
            this.model.inmem = new BaseModel({
                checkbox: false,
                update: true
            });

            this.model.ShClusterConfig = new ShClusterModel();

            this.deferreds = {};
            this.deferreds.ShClusterConfigReady = $.Deferred();
            if (this.model.user.isAdmin() && !this.model.user.serverInfo.isLite()) {
                    //We don't want to allow installation if SHC is enabled, that's why we're fetching this
                    this.model.ShClusterConfig.fetch().done(function () {
                        this.deferreds.ShClusterConfigReady.resolve();
                    }.bind(this));
            } else {
                this.deferreds.ShClusterConfigReady.resolve();
            }

            this.children.showAgain = new SyntheticCheckbox({
                modelAttribute: 'checkbox',
                model: this.model.inmem,
                save: false,
                label: _('Do not show this again').t()
            });

            // Waits for the value of the checkbox to change then sets a new value to update
            // update is then compared against what is saved in the conf file
            this.model.inmem.on('change:checkbox', function () {
                this.model.inmem.set('update', !splunk_util.normalizeBoolean(this.model.inmem.get('checkbox')));
            }, this);
        },
        events: $.extend({}, Modal.prototype.events, {
            "click .modal-btn-primary": function(e){
                e.preventDefault();
                if(this.model.user.isAdmin() && !this.model.ShClusterConfig.isEnabled()) {
                    // can only install if an admin and shc is off
                    this.trigger('info-dev-install');
                }
            }
        }),
        render: function () {
            this.deferreds.ShClusterConfigReady.then(function () {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Available for Download: Splunk Dashboard Export Add-on").t());

                this.$(Modal.BODY_SELECTOR).append('<p>' + _("Export dashboards in a PNG format that matches " +
                        "what you see in the browser. Share data insights without requiring a Splunk platform login. Email " +
                        "dashboards as inline images with no attachments necessary.").t() + '</p>');

                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.assetsUrl = splunk_util.make_url('/static/img/infodelivery');
                this.$(Modal.BODY_FORM_SELECTOR).html(_(this.imageTemplate).template({assetsUrl: this.assetsUrl}));

                // passed in when the modal is first created, will display the do not show again button if applicable
                if (this.model.displayShowAgain) {
                    this.$(Modal.FOOTER_SELECTOR).append(this.children.showAgain.render().el);
                    this.children.showAgain.$el.addClass('checkbox-info-delivery'); // info delivery specific checkbox css
                }

                this.$(Modal.BODY_SELECTOR).append('<p>' + _("For more information, view the listing on Splunkbase: ").t() +
                    '<a class="info-dev-splunkbase" href="https://splunkbase.splunk.com/app/3201/" target="_blank">' + _("Splunk Dashboard Export Add-on ").t() + '<i class="icon-external"></i></a>' + '</p>');

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CLOSE);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary" data-toggle="tooltip">' +
                    _("Install Add-on").t() + '</a>');

                // if the current user is not an admin, disable the install button and prompt to contact an admin
                if (!this.model.user.isAdmin()) {
                    this.$('.modal-btn-primary').addClass('disabled').tooltip({
                        animation: false,
                        title: _("Contact an admin to install this add-on.").t(),
                        container: 'body'
                    });
                } else if (this.model.ShClusterConfig.isEnabled()) {
                     this.$('.modal-btn-primary').addClass('disabled').tooltip({
                        animation: false,
                        title: _("Add-on must be installed via the deployer with Search Head Clustering enabled.").t(),
                        container: 'body'
                    });
                }
            }.bind(this));

            return this;
        },
        imageTemplate: '\
        <div class="info-delivery-img-gallery">\
            <div class="img-container" data-view="/static/img/infodelivery/Email-dashboards-as-inline-images">\
                <p><%- _("Email dashboards as inline images").t() %></p>\
                <img src="<%- assetsUrl %>/Email-dashboards-as-inline-images@2x.png">\
            </div>\
            <div class="img-container" data-view="/static/img/infodelivery/PNG-chart-exports">\
                <p><%- _("PNG downloads").t() %></p>\
                <img src="<%- assetsUrl %>/PNG-chart-exports@2x.png">\
            </div>\
            <span class="stretch"></span>\
        </div>\
        '
    });

});