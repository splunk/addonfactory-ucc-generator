/**
 * Created by ykou on 5/28/14.
 */
define([
    'jquery',
    'underscore',
    'module',
    'views/shared/Modal',
    'contrib/text!views/clustering/master/bucketdetails/components/ConfirmDialog.html'
],
    function(
        $,
        _,
        module,
        Modal,
        Template
        ) {
        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME,
            /**
             * @param {Object} options {
             *       model: <models.>,
             *       collection: <collections.services.>
             * }
             */
            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
            },
            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    e.preventDefault();
                    this.model.trigger('confirmed', this.options.$target, this.options.indexName);
                }
            }),
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Remove Excess Buckets").t());

                var indexName = this.options.indexName ? (this.options.indexName + ' index') : 'all indexes';
                var html = this.compiledTemplate({
                    indexName: indexName
                });
                this.$(Modal.BODY_SELECTOR).append(html).show();
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">'+_('Confirm').t()+'</a>');
                return this;
            },
            template: Template
        });
    });
