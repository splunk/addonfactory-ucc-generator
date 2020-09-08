import $ from 'jquery';
import _ from 'underscore';
import Modal from 'views/shared/Modal';
import splunkUtils from 'splunk.util';

const CONTINUE = splunkUtils.sprintf(_('Continue').t());
const BUTTON_CONTINUE = `<a href="#" class="btn btn-primary modal-btn-continue
pull-right" data-dismiss="modal">${CONTINUE}</a>`;

const CONFIRMATION_MSG_1 = _('Are you sure you want to install').t();
const CONFIRMATION_MSG_2_TEMPLATE = _('(version %s). Doing so may cause ' +
'Splunk Cloud to become unavailable for some time.').t();

export default Modal.extend({
    moduleId: module.id,

    initialize(options) {
        _.defaults(options, {
            onHiddenRemove: true,
            backdrop: 'static',
        });
        Modal.prototype.initialize.call(this, options);

        this.appName = this.model.appRemote.get('title');
        this.appVersion = this.model.appRemote.get('release').title;
    },

    events: $.extend({}, Modal.prototype.events, {
        'click .btn-primary'(e) {
            e.preventDefault();

            this.model.confirmation.trigger('installApp');
        },
    }),

    render() {
        const CONFIRMATION_MSG_2 = splunkUtils.sprintf(
            CONFIRMATION_MSG_2_TEMPLATE, this.appVersion);

        this.$el.html(Modal.TEMPLATE);
        this.$(Modal.HEADER_TITLE_SELECTOR).text(_('App Installation - Confirm').t());
        this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
            CONFIRMATION_MSG_1,
            CONFIRMATION_MSG_2,
            appName: this.appName,
        }));
        this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
        this.$(Modal.FOOTER_SELECTOR).append(BUTTON_CONTINUE);
    },

    template: '<p><%- CONFIRMATION_MSG_1 %> <strong><%- appName %></strong> ' +
    '<%- CONFIRMATION_MSG_2 %></p>',
});
