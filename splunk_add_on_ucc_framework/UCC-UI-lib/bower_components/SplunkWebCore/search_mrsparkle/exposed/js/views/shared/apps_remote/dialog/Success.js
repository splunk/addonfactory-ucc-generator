define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/shared/Modal',
    'uri/route',
    'splunk.util'
],
    function(
        $,
        _,
        module,
        BaseView,
        Modal,
        route,
        splunkUtils
        ) {
        return BaseView.extend({
            moduleId: module.id,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
            },

            events: {
                'click .goapp': function(e) {
                    e.preventDefault();
                    var app = this.model.appRemote.get('appid');
                    var url = route.prebuiltAppLink(this.model.application.get('root'), this.model.application.get('locale'), app, '');
                    document.location.href = url;
                }
            },

            /**
             * This method determines whether this view should provide the 'Open App' option.
             * This definition can be overridden in its subclasses.
             * @returns {boolean}
             */
            canOpenApps: function() {
                return true;
            },

            renderSuccessOptions: function() {
                if ( this.options.enableAppsListingRedirect ) {
                    this.$(Modal.BODY_FORM_SELECTOR).append('<a href="#" class="btn btn-secondary successbtn appslisting">' + _('View Apps').t() + '</a>');
                }

                if (this.canOpenApps() && this.model.user.canUseApps()) {
                    this.$(Modal.BODY_FORM_SELECTOR).append('<a href="#" class="btn btn-secondary successbtn goapp">' + _('Open the App').t() + '</a>');
                }

                this.$(Modal.BODY_FORM_SELECTOR).append('<a href="/" class="btn btn-secondary successbtn gohome">' + _('Go Home').t() + '</a>');
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Complete").t());
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                var customBody = this.options.customBody || splunkUtils.sprintf('%s ' + _("was successfully installed.").t(), this.model.appRemote.get('title'));
                var template = this.compiledTemplate({
                    msg: customBody
                });
                this.$(Modal.BODY_FORM_SELECTOR).append(template);

                // if a custom template is passed do not load the default buttons
                if(!this.options.template) {
                    this.renderSuccessOptions();
                }

                // if custom buttons are passed, use those instead
                if(this.options.footerTemplate) {
                    this.$(Modal.FOOTER_SELECTOR).html(_(this.options.footerTemplate).template({}));
                } else {
                    this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DONE);
                }

                return this;
            },

            template: '<p><%- msg %></p>'
        });
    });
