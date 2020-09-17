/*
 * This views renders the main body of the visualization editor dialog.  It provides the tab
 * navigation controls (when needed) and uses a form child view for the input controls.
 */

define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'util/htmlcleaner',
        'views/shared/FlashMessages',
        'views/shared/vizcontrols/components/Form',
        'views/shared/vizcontrols/components/CustomForm',
        'splunk.util'
    ],
    function(
        _,
        $,
        module,
        Base,
        HtmlCleaner,
        FlashMessages,
        Form,
        CustomForm,
        splunkUtils
    ){
        return Base.extend({
            
            moduleId: module.id,
            
            events: {
                'click a[data-toggle]': function(e) {
                    e.preventDefault();
                    var $target = $(e.currentTarget),
                        type = $target.data().type;

                    _(this.children).each(function(child) {
                        if (child !== this.children.flashMessages) {
                            child.$el.hide();
                        }
                    },this);
                    this.children[type].$el.show();
                    this.$el.find('.nav > li').removeClass('active');
                    $target.parent().addClass('active');
                }
            },

            /**
             * @constructor
             * @param options {
             *     model: {
             *         visualization: <models.shared.Visualization>,
             *         application: <models.shared.Application>
             *     }
             *     formatterDescription: the schema or html defining the formatter controls to render
             *         see https://confluence.splunk.com/display/PROD/Internal+Mod+Viz+ERD#InternalModVizERD-VisualizationEditorSchema
             * }
             */
            
            initialize: function(options) {
                Base.prototype.initialize.apply(this, arguments);
                this.children.flashMessages = new FlashMessages({ model: this.model.visualization });

                this.sectionDescriptions = this.options.formatterDescription;
                
                // Description is a schema object, add a Form for each
                if (_.isObject(this.sectionDescriptions)) {
                    this.sectionDescriptions = _(this.sectionDescriptions).map(function(schemaItem) {
                        return _.extend({ id: _.uniqueId(schemaItem.title.toLowerCase()) }, schemaItem);
                    });
                    _(this.sectionDescriptions).each(function(schemaItem) {
                        this.children[schemaItem.id] = new Form({
                            model: {
                                visualization: this.model.visualization
                            },
                            formElements: schemaItem.formElements,
                            className: 'form form-horizontal',
                            attributes: {
                                'data-form-id': schemaItem.id
                            }
                        });
                    }, this);
                }
                // Description is html, break it into sections and add a CustomForm for each
                else {
                    // replace {{VIZ_NAMESPACE}} with the visualizations namespace
                    var vizNamespace = CustomForm.prototype.attributePrefix + this.model.visualization.get('display.visualizations.custom.type');
                    this.sectionDescriptions = this.sectionDescriptions.replace(/\{\{VIZ_NAMESPACE}}/g, vizNamespace);

                    this.sectionDescriptions = HtmlCleaner.clean(this.sectionDescriptions);
                    
                    this.sectionDescriptions = _.map($(this.sectionDescriptions).filter('.splunk-formatter-section'), function(section, i){
                        var label = $(section).attr('section-label');
                        if (!label) {
                            label = splunkUtils.sprintf(_('Section %(sectionNumber)s').t(), { sectionNumber: i + 1 });
                        }
                        return {
                            id: label.toLowerCase(),
                            title: label,
                            html: $(section).prop('outerHTML')
                        };
                    });

                    _(this.sectionDescriptions).each(function(section){
                        this.children[section.id] = new CustomForm({
                            model: {
                                target: this.model.visualization,
                                application: this.model.application
                            },
                            html: section.html,
                            sectionId: section.id
                        });
                    }, this);
                }
            },
            
            render: function() {
                var $contentContainer;
                // If there is only one "tab" of controls, then hide the tabs altogether
                // and just show a simple dialog with the form inputs.
                if (this.sectionDescriptions.length > 1) {
                    this.$el.addClass('tabbable').removeClass('non-tabbable');
                    this.$el.html(_(this.tabbableTemplate).template({
                        formElementsConfig: this.sectionDescriptions
                    }));
                    $contentContainer = this.$('.tab-content');
                } else {
                    this.$el.addClass('non-tabbable').removeClass('tabbable');
                    this.$el.html(_(this.nonTabbableTemplate).template({}));
                    $contentContainer = this.$('.non-tabbable-content');
                }

                this.children.flashMessages.render().prependTo($contentContainer);
                _(this.sectionDescriptions).each(function(formElementConfig) {
                    var child = this.children[formElementConfig.id];
                    $contentContainer.append(child.render().el);
                    child.$el.hide();
                }, this);
                this.children[this.sectionDescriptions[0].id].$el.show();
                return this;
            },

            tabbableTemplate: '\
                <ul class="nav nav-tabs-left">\
                    <% _(formElementsConfig).each(function(formElementConfig, i) { %>\
                        <li class="<%= i === 0 ? "active" : "" %>"</li>\
                            <a href="#" data-toggle="tab" data-type="<%- formElementConfig.id %>">\
                                <%- formElementConfig.title %>\
                            </a>\
                        </li>\
                    <% }) %>\
                </ul>\
                <div class="tab-content"></div>\
            ',

            nonTabbableTemplate: '\
                <div class="non-tabbable-content"></div>\
            '
        });
    }
);
