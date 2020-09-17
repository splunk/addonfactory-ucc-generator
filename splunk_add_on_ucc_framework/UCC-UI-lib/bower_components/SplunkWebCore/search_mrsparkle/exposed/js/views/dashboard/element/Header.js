define(
    [
        'module',
        'jquery',
        'underscore',
        'views/dashboard/Base',
        'views/dashboard/element/Title',
        'views/dashboard/editor/TitleEditor',
        'views/dashboard/editor/ElementEditor',
        'views/dashboard/element/ProgressBar',
        'views/dashboard/element/SearchMessages'
    ],
    function(module,
             $,
             _,
             BaseDashboardView,
             TitleView,
             TitleEditor,
             ElementEditor,
             ProgressBarView,
             SearchMessages) {

        return BaseDashboardView.extend({
            moduleId: module.id,
            viewOptions: {
                register: false
            },
            className: 'panel-head',
            initialize: function(options) {
                BaseDashboardView.prototype.initialize.apply(this, arguments);
                this.deferreds = options.deferreds;
                this.reportReady = this.deferreds.reportReady || $.Deferred().resolve();
                this.listenTo(this.model.state, 'change:mode', this.onModeChange);
                this.listenTo(this.model.elementState, 'edit:title', function() {
                    if (this.children.titleEditor) {
                        this.children.titleEditor.focus();
                    }
                });
            },
            render: function() {
                // always render progress bar
                this._renderProgressBar();
                this._renderSearchMessages();
                this.onModeChange();
            },
            onModeChange: function() {
                this._resetComponents();
                var mode = this.model.state.get('mode');
                switch (mode) {
                    case 'view':
                        this._renderTitle();
                        break;
                    case 'edit':
                        // order matters, css will break if render title first
                        this.reportReady.done(function() {
                            this._renderElementEditor();
                            this._renderTitleEditor();
                        }.bind(this));
                        break;
                }
            },
            _resetComponents: function() {
                if (this.$el.children('h3').length) {
                    this.$el.children('h3').remove();
                }
                if (this.children.title) {
                    this.children.title.remove();
                    this.children.title = null;
                }
                if (this.children.titleEditor) {
                    this.stopListening(this.children.titleEditor);
                    this.children.titleEditor.remove();
                    this.children.titleEditor = null;
                }
                if (this.children.elementEditor) {
                    this.children.elementEditor.remove();
                    this.children.elementEditor = null;
                }
                this.stopListening(this.model.report);
                this.stopListening(this.model.elementReport);
            },
            _renderProgressBar: function() {
                if (this.children.progressBar) {
                    this.children.progressBar.remove();
                }
                this.children.progressBar = new ProgressBarView({
                    id: _.uniqueId(this.id + "progressbar-"),
                    managerid: this.settings.get('managerid'),
                    model: {
                        report: this.model.report
                    },
                    el: $('<div class="progress-container pull-right"></div>')
                });
                this.children.progressBar.render().$el.appendTo(this.$el);
            },
            _renderSearchMessages: function() {
                if (this.children.searchMessages) {
                    this.children.searchMessages.remove();
                }
                this.children.searchMessages = new SearchMessages({
                    managerid: this.settings.get('managerid'),
                    model: {
                        report: this.model.report
                    }
                });
                this.children.searchMessages.render().$el.appendTo(this.$el);
            },
            _renderTitle: function() {
                this.children.title = new TitleView({
                    model: this.model.elementReport,
                    attribute: 'dashboard.element.title'
                });
                this.children.title.render().appendTo(this.$el);
            },
            _renderTitleEditor: function() {
                this.children.titleEditor = new TitleEditor({
                    model: this.model.elementReport,
                    attribute: 'dashboard.element.title',
                    placeholder: _('No title').t()
                });
                var h3 = $('<h3 />').appendTo(this.$el);
                this.children.titleEditor.render().$el.appendTo(h3);
                this.listenTo(this.children.titleEditor, 'change:title', function() {
                    this.model.controller.trigger('edit:element', {elementId: this.model.elementReport.get('dashboard.element.id')});
                });
            },
            _renderElementEditor: function() {
                this.children.elementEditor = new ElementEditor({
                    model: this.model,
                    collection: this.collection,
                    settings: this.settings
                });
                this.children.elementEditor.render().$el.appendTo(this.$el);
            }
        });
    }
);
