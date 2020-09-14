define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/Modal',
    'contrib/text!views/clustering/config/NodeType.html'
],
    function(
        $,
        _,
        Backbone,
        module,
        BaseView,
        Modal,
        ConfigTemplate
        ) {
        return BaseView.extend({
            /**
             * @param {Object} options {
             *       model: <models.>,
             *       collection: <collections.services.>
             * }
             */
            moduleId: module.id,
            template: ConfigTemplate,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
            },
            events: {
                'click .btn-primary': function(e) {
                    var mode = $('input[name=node-type]:checked', '#node_type').val();
                    this.model.wizard.set('mode', mode);
                    this.model.wizard.trigger('next');
                    e.preventDefault();
                },
                'click a.cancel': function(e) {
                    this.model.wizard.trigger('cancel');
                    e.preventDefault();
                }
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                var title = this.model.clusterConfig.entry.content.get('mode') == 'disabled' ? _("Enable Clustering").t():_("Edit Node Type").t();
                this.$(Modal.HEADER_TITLE_SELECTOR).html(title);
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                var html = this.compiledTemplate();
                this.$('.form-horizontal').append($(html));

                this.$('.start').show();

                // SPL-76386: 508 Clustering: In dialog box focus by default should be on the "Next" button
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_NEXT);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);

                return this;
            }
        });
    });
