define(function (require, exports, module) {
    var BaseView = require('views/Base');
    var VisualizationRegistry = require('helpers/VisualizationRegistry');

    return BaseView.extend({
        moduleId: module.id,
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model.highlightSelectedModel.on('change:currentSelectedView', this.checkSelectedItem, this);
        },
        render: function () {
            this.$el.html(this.compiledTemplate({model: this.model.inline}));
            return this;
        },
        template: '' +
            '<li class="inline-item panel-content">' +
                '<a href="#">' +
                    '<div class="icons"><i class="icon-<%= model.get("icon") %>"></i></div>' +
                    '<%= model.get("label") %>' +
                '</a>' +
            '</li>',
        events: {
            'click a': 'select'
        },
        select: function(evt) {
            evt.preventDefault();
            var vizId = this.model.inline.get('value');
            var settings = VisualizationRegistry.getReportSettingsForId(vizId);
            var vizType = 'statistics', sub;
            if(settings['display.general.type']) {
                vizType = settings['display.general.type'];
                sub = ['display', vizType, 'type'].join('.');
                if(settings[sub]) {
                    vizType = [vizType, settings[sub]].join(':');
                }
            }
            this.model.panel.set('savedSearchVisualization', vizType);
            this.model.panel.set(settings);
            this.model.panel.set('vizTypeLabel', this.model.inline.get('label'));
            this.trigger('previewPanel', this.model);
            this.model.highlightSelectedModel.set('currentSelectedView', this.cid);
        },
        checkSelectedItem: function(changedModel) {
            if(changedModel.get('currentSelectedView') === this.cid) {
                this.$el.find('.panel-content').addClass('selected');
            } else {
                this.$el.find('.panel-content').removeClass('selected');
            }
        }
    });
});