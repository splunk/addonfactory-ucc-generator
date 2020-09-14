define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/datapreview/eventsummary/Master',
    'views/shared/add_data/input_forms/SourceSelectorDialog',
    'contrib/text!views/datapreview/Header.html',
    'util/string_utils'
], function(
    $,
    _,
    module,
    Base,
    EventSummary,
    SourceSelectorDialog,
    headerTemplate,
    stringUtils
){
    return Base.extend({
        moduleId: module.id,
        template: headerTemplate,
        events: {
            'click .change-source' : 'showSourceSelectorDialog',
            'click .btnEventSummary': function(e) {
                this.children.eventSummaryView.show(this.$('.btnEventSummary'));
                e.preventDefault();
            }
        },
        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);

            var self = this;
            this.model.sourceModel.on('change:ui.name', function(){
                self.setSourceLabel();
            });

            this.children.eventSummaryView = new EventSummary({
                model: this.model,
                collection: this.collection
            });
            this.children.eventSummaryView.render().appendTo($('body'));
        },
        render: function(){
            this.$el.html(this.compiledTemplate({
                sourceLabel: this.getSourceLabelText(),
                canChangeSource: this.options.canChangeSource,
                descriptionText: this.model.previewPrimer.get('descriptionText')
            }));
            return this;
        },
        setSourceLabel: function(){
            this.$('.source-label').text(this.getSourceLabelText());
        },
        getSourceLabelText: function(){
            var label = this.model.sourceModel.get('input') || this.model.previewPrimer.get('name') || '';
            return stringUtils.truncateString(label, 50, 15, 35);
        },
        showSourceSelectorDialog: function(){
            if(!this.children.sourceSelectorDialog){
                this.children.sourceSelectorDialog = new SourceSelectorDialog({
                    model: this.model,
                    collection: this.collection,
                    deferreds: this.options.deferreds,
                    browserType: 'files'
                });
                $('body').append(this.children.sourceSelectorDialog.render().el);
            }
            this.children.sourceSelectorDialog.show();
        }
    });
});
