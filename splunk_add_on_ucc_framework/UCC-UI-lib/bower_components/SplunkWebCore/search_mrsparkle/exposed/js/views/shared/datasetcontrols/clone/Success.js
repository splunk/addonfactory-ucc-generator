define([
    'underscore',
    'module',
    'views/Base',
    'views/shared/Modal',
    'views/shared/FlashMessages',
    'uri/route',
    'splunk.util'
    ],
    function(
        _,
        module,
        Base,
        Modal,
        FlashMessages,
        route,
        splunkUtil
    ) {
    return Base.extend({
        moduleId: module.id,
        /**
        * @param {Object} options {
        *    model: {
        *        dataset: <models.PolymorphicDataset>,
        *        application: <models.Application>,
        *        inmem: <models.PolymorphicDataset>,
        *        user: <models.service.admin.user>
        *    }
        * }
        */
        initialize: function(options) {
            Base.prototype.initialize.apply(this, arguments);
            this.children.flashMessage = new FlashMessages({ model: this.model.inmem });
        },
        
        events: {},
        
        render : function() {
            var type = this.model.dataset.getType(),
                viewText = _('View').t(),
                routeToPivot = route.pivot(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    {
                        data: {
                            dataset: this.model.inmem.entry.get('name'),
                            type: this.model.inmem.getFromType()
                        }
                    }
                ),
                datasetLink = route.dataset(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    this.model.application.get("app"),
                    { data: this.model.inmem.getRoutingData() }
                ),
                canTable = this.model.inmem.isTable() &&
                    this.model.inmem.canTable() &&
                    this.model.user.canAccessSplunkDatasetExtensions();
            
            if (canTable) {
                viewText = _('Edit').t();
                datasetLink = route.table(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    {
                        data: {
                            t: this.model.inmem.id
                        }
                    }
                );
            }
            
            this.$el.html(Modal.TEMPLATE);

            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Dataset Has Been Cloned").t());
            this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                _: _,
                model: this.model.inmem
            }));
            
            if (canTable) {
                this.$('span.save-dataset-success-message').text(_('You may now edit your dataset, or visualize your dataset in Pivot.').t());
            } else {
                this.$('span.save-dataset-success-message').text(_('You may now view your dataset, or visualize your dataset in Pivot.').t());
            }

            this.$(Modal.FOOTER_SELECTOR).append('<a href="' + datasetLink + '" class="btn btn-primary modal-btn-primary">' + viewText + '</a>');
            this.$(Modal.FOOTER_SELECTOR).append('<a href="' + routeToPivot + '" class="btn pull-left">' + _('Pivot').t() + '</a>');
            
            return this;
        },
        template: '\
            <p>\
                <span class="save-dataset-success-message"></span>\
            </p>\
        '
    });
});
