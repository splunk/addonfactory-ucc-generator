define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'util/htmlcleaner',
    'uri/route',
    'util/general_utils',
    'util/form_databind',
    'webcomponents/forminputs/SplunkInputControlsRegistry',
    'util/console'
], function($,
            _,
            Backbone,
            module,
            BaseView,
            HtmlCleaner,
            route,
            GeneralUtils,
            Databind,
            InputControlsRegistry,
            console) {

    /**
     * Abstract base view for HTML-based form dialogs in our mod-* extension points (mod viz, mod alerts)
     */
    return BaseView.extend({
        moduleId: module.id,
        /**
         * @param options {
         *      model {
         *          application: the application model
         *          target: the model bound to the form data - it's inital state is used to update the form inputs and 
         *              changes to the form input will update the model
         *      }
         *      
         *      html {string} the user-provided HTML code to render. It's run through the HTML cleaner before it's 
         *          actually inserted into the DOM.
         *      
         *      attributePrefix {string} prefix for attributes of the model which are allowed to be bound to form inputs
         *          in the DOM. Form inputs and model attributes without this prefix are ignored.
         *      
         *      entityReference {string} a descriptive label of what the dialog is referring to - only used in warning
         *          messages printed to the browser console. No need for i18n translations. 
         * }
         */
        initialize: function(options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.attributePrefix = options.attributePrefix || this.attributePrefix;
            this.normalizedHtml = this.normalizeContentHtml(options.html);
        },

        getEntityReference: function() {
            return this.options.entityReference || 'unknown entity';
        },

        events: {
            // Update our model on the following DOM Events:
            'change': 'readFormValues',
            'blur': 'readFormValues',
            'keyup': 'readFormValues',
            // Prevent form submission within user-provided content
            'submit form': function(e) {
                e.preventDefault();
            }
        },
        getForm: function() {
            return this.$('form:first');
        },
        writeFormValues: function() {
            // Model -> DOM
            var prefix = this.attributePrefix;
            var formUpdate = {};

            _(this.model.target.toJSON()).each(function(value, name) {
                if (name.indexOf(prefix) === 0) {
                    formUpdate[name] = value;
                }
            });
            Databind.applyFormValues(this.getForm(), formUpdate);
        },
        readFormValues: function() {
            // DOM -> Model
            var modelUpdate = {};
            var prefix = this.attributePrefix;
            _(Databind.readFormValues(this.getForm())).each(function(value, name) {
                // Filter all form input values not starting with the prefix for the alert action
                if (name.indexOf(prefix) === 0) {
                    modelUpdate[name] = value;
                }
            });
            this.model.target.set(modelUpdate);
        },
        normalizeContentHtml: function(htmlCode) {
            var raw = _(htmlCode || '').t();

            // Replace {{SPLUNKWEB_URL_PREFIX}} with actual URL prefix
            var splunkwebBaseUrl = route.encodeRoot(this.model.application.get('root'), this.model.application.get('locale'));
            var html = raw.replace(/\{\{SPLUNKWEB_URL_PREFIX}}/g, splunkwebBaseUrl);

            // Cleanup HTML
            return HtmlCleaner.clean(html);
        },
        renderContentHtml: function(html) {
            this.$el.html(html);
        },
        checkDomStructure: function() {
            var formCount = this.$('form').length;
            if (formCount === 0) {
                console.warn('Custom HTML content for %s does not include a form element', this.getEntityReference());
            } else if (formCount > 1) {
                console.warn('Custom HTML content for %s includes multiple form elements', this.getEntityReference());
            }
            // Warn if we find multi-value form inputs
            if (this.$('select[multiple]').length > 0) {
                console.warn('Custom HTML content for %s contains unsupported multi-value input', this.getEntityReference());
            }
            // Check if we have more than 1 checkbox input with the same name
            var groupedCheckboxes = _(this.$('input[type=checkbox]')).groupBy(function(input) { return $(input).attr('name'); });
            if (_(groupedCheckboxes).any(function(group) { return group.length > 1; })) {
                console.warn('Custom HTML content for %s contains unsupported multi-value input', this.getEntityReference());
            }
        },
        remove: function() {
            this.readFormValues();
            BaseView.prototype.remove.apply(this, arguments);
        },
        render: function() {
            this.renderContentHtml(this.normalizedHtml);
            this.checkDomStructure();
            this.writeFormValues();
            this.readFormValues();
            return this;
        }
    });

});