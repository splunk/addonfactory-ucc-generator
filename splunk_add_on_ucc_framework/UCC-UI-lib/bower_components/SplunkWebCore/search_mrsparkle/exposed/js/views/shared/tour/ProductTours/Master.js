/**
 * @extends {views.shared.ModalLocalClassNames}
 * @description Creates a ModalView for ProductTours on the Splunk launcher homepage.
 * Can be accessed in Splunk Lite from the Litebar > Help > Product Tours.
 * Basically a wrapper for the Contents.js file located in the same directory.
 * Sets title of the modal with this.options.title.
 *
 * @param {Object} options
 * @param {Boolean} options.canAddData - user permission to add data, will allow the 'Add Data Tour'.
 * @param {Model} options.model
 * @param {Application} options.model.application
 * @param {AppLocal} options.model.appLocal
 * @param {ServerInfo} options.model.serverInfo
 * @param {Collection} options.collection - OPTIONAL
 */
define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/ModalLocalClassNames',
        './Contents',
        './Master.pcssm'
    ],
    function(
        $,
        _,
        module,
        ModalView,
        ContentsView,
        css
    ) {
        return ModalView.extend({
            moduleId: module.id,
            css: _.extend({}, ModalView.prototype.css, css),
            initialize: function() {
                this.options.bodyView = new ContentsView({
                    canAddData: this.options.canAddData,
                    collection: this.options.collection || {},
                    model: {
                        application: this.options.model.application,
                        appLocal: this.options.model.appLocal,
                        serverInfo: this.options.model.serverInfo
                    }
                });
                this.options.onHiddenRemove = true;
                this.options.title = _('Select a Tour').t();

                // renders ImageTour once 'product-tour' heard from bodyView
                this.listenTo(this.options.bodyView, 'product-tour', function() {
                    this.hide();
                    this.trigger('product-tour');
                });

                ModalView.prototype.initialize.apply(this, arguments);
            }
        });
    }
);
