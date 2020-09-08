define([
    'jquery',
    'underscore',
    'module',
    'models/shared/SessionStore',
    'views/Base',
    'splunk.util',
    'contrib/text!views/shared/litebar/BannerContent.html',
    './BannerContent.pcss'
],
function(
    $,
    _,
    module,
    SessionStore,
    BaseView,
    splunkUtil,
    bannerContentTemplate,
    css
){
    return BaseView.extend({
        moduleId: module.id,
        template: bannerContentTemplate,
        className: 'banner-content',
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            if (this.collection && this.collection.messages) {
                this.listenTo(this.collection.messages, 'licenseWillExpire', this.renderContent);
            }
        },
        events: {
            'click button.close': function(e) {
                var sessionStore = SessionStore.getInstance();
                sessionStore.set({'licenseWillExpireMessageVisible': false});
                sessionStore.save();
                this.$el.hide();
                e.preventDefault();
            }
        },
        extractDate: function(message) {
            
            var generic = _("Your license will soon expire.").t(),
                licenseWillExpireMessage = "Your license will soon expire on";

            if (!message) {
                return generic;
            }

            //remove license will expire portion of message
            var index = message.search(licenseWillExpireMessage);
            if (index != -1) {
                message = message.slice(index + licenseWillExpireMessage.length).trim();
            } else {
                return generic;
            }

            //remove $CONTACT_SPLUNK_SALES_TEXT$
            var regex = /.\s\$\S*\$$/i;
            index = message.search(regex);
            if (index != -1) {
                message = message.slice(0, index).trim();
            } else {
                return generic;
            }

            //remove time zone string after year, eg. 'PDT', 'China Standard Time'
            regex = /20\d\d/i;
            index = message.search(regex);
            if (index != -1) {
                message = message.slice(0, index + 4).trim();
                var expirationDate = new Date(message);
                if (!expirationDate || (expirationDate == 'Invalid Date')) {
                    return generic;
                }
                var daysLeft = Math.floor((expirationDate.getTime() - Date.now())/1000/60/60/24);
                if (!isNaN(daysLeft) && daysLeft >= 0) {
                    message = splunkUtil.sprintf(_("Your license will expire in %s day(s).").t(), daysLeft.toString());
                } else {
                    return generic;
                }
            } else {
                return generic;
            }

            return message;
        },
        renderContent: function(message) {
            this.$el.show();
            this.$el.find('.banner-content-message').html(this.extractDate(message));
        },
        render: function() {
            var html = this.compiledTemplate({});
            this.$el.html(html);
            return this;
        }
    });
});