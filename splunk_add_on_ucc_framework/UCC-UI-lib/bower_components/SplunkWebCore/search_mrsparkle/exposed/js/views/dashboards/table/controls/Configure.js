define([
    'jquery',
    'underscore',
    'module',
    'backbone',
    'views/shared/Modal',
    'views/shared/controls/SyntheticCheckboxControl',
    'models/Base',
    'models/search/Dashboard',
    'util/splunkd_utils',
    'util/pdf_utils',
    './InfoDelivery.pcss',
    'splunk.util'
],

    function (
        $,
        _,
        module,
        Backbone,
        Modal,
        SyntheticCheckbox,
        BaseModel,
        DashboardModel,
        splunkDUtils,
        PDFUtils,
        css,
        splunk_util
    )
{

    return Modal.extend({
        moduleId: module.id,
        className: 'modal fade modal-info-delivery modal-configure',
        initialize: function () {
            Modal.prototype.initialize.apply(this, arguments);

            // saving important variables in memory
            // checkbox -> value of the do not show this again checkbox
            // update -> used to check if the checkbox value is different then what is saved in the conf file
            this.model.inmem = new BaseModel({
                checkbox: false,
                update: true
            });

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
            'click .modal-btn-primary': function(e){
                e.preventDefault();
                if(this.model.user.isAdmin()) {
                    // can only configure if admin
                    splunk_util.redirect_to('/app/info-delivery/setup?return_to=' + window.location.href);
                }
            }
        }),
        render: function () {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Splunk Dashboard Export Add-on has not been configured").t());

            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

            this.$(Modal.FOOTER_SELECTOR).append(this.children.showAgain.render().el);
            this.children.showAgain.$el.addClass('checkbox-info-delivery'); // info-delivery specific checkbox ccs

            this.$(Modal.BODY_SELECTOR).append('<p class="danger">' +  _("Splunk Dashboard Export Add-on must be configured before it can be used.").t() + '</p>');

            this.$(Modal.BODY_SELECTOR).append('<p>' +  _(" For more information, review the ").t() +
                '<a class="info-dev-documentation" href="http://docs.splunk.com/Documentation/Splunk/6.5.0/Viz/DashboardExportApp" target="_blank">' + _("documentation ").t() + '<i class="icon-external"></i> .</a></p>');

            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn cancel modal-btn-cancel" data-dismiss="modal">' + _('Export Without Using the Add-on').t() + '</a>');
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary" data-toggle="tooltip">' + _("Configure Add-on").t() + '</a>');

            // if the current user is not an admin, disable the install button and prompt to contact an admin
            if(!this.model.user.isAdmin()) {
                this.$('.modal-btn-primary').addClass('disabled').tooltip({
                    animation: false,
                    title: _("Contact an admin to configure this add-on.").t(),
                    container: 'body'
                });
            }
            return this;
        }
    });

});