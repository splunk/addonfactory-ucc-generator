define(
    [
        'module',
        'jquery',
        'underscore',
        'views/dashboard/Base',
        'views/dashboard/editor/AddInputMenu',
        'views/dashboard/editor/addcontent/Master'
    ],
    function(module,
             $,
             _,
             BaseDashboardView,
             AddInputMenu,
             AddContent) {

        return BaseDashboardView.extend({
            moduleId: module.id,
            viewOptions: {
                register: false
            },
            className: 'dashboard-toolbar',
            initialize: function(options) {
                this.deferreds = options.deferreds;
                BaseDashboardView.prototype.initialize.apply(this, arguments);
                this.listenTo(this.model.state, 'change:mode change:dirty', this._updateState);
            },
            events: {
                'click a.add-panel': function(e) {
                    e.preventDefault();
                    this._showAddContent();
                },
                'click a.add-form': function(e) {
                    e.preventDefault();
                    var $target = $(e.currentTarget);
                    if ($target.hasClass('disabled')) {
                        return;
                    }
                    $target.addClass('active');
                    this._showAddInputMenu($target).on('hide', function() {
                        $target.removeClass('active');
                    }, this);
                },
                'click button.edit-ui': function(e) {
                    e.preventDefault();
                    this.model.controller.trigger('mode:edit');
                },
                'click button.edit-source': function(e) {
                    e.preventDefault();
                    this.model.controller.trigger('mode:editxml');
                },
                'click a.edit-cancel': function(e) {
                    e.preventDefault();
                    this.model.controller.trigger('action:edit-cancel');
                },
                'click a.edit-save-as': function(e) {
                    e.preventDefault();
                    this.model.controller.trigger('action:save-as');
                },
                'click a.edit-done': function(e) {
                    e.preventDefault();
                    var $target = $(e.currentTarget);
                    if ($target.hasClass('disabled')) {
                        return;
                    }
                    this.model.controller.trigger('action:save');
                }
            },
            render: function() {
                this.$el.html(this.compiledTemplate());
                this._updateState(this.model.state);
                return this;
            },
            _showAddContent: function() {
                this.children.addContent = new AddContent({
                    model: this.model,
                    collection: this.collection,
                    deferreds: this.deferreds
                });
                this.children.addContent.render();
            },
            _showAddInputMenu: function($target) {
                if (this.children.addInputMenu) {
                    this.children.addInputMenu.remove();
                    this.children.addInputMenu = null;
                }
                this.children.addInputMenu = new AddInputMenu({
                    model: this.model,
                    collection: this.collection,
                    deferreds: this.deferreds
                });
                $('body').append(this.children.addInputMenu.render().$el.hide());
                this.children.addInputMenu.show($target);
                return this.children.addInputMenu;
            },
            _updateState: function(state) {
                var $editUi = this.$el.find('.edit-ui');
                var $editSource = this.$el.find('.edit-source');
                var mode = state.get('mode');
                if (mode == 'edit') {
                    $editUi.addClass('active');
                    $editSource.removeClass('active');
                } else if (mode == 'editxml') {
                    $editUi.removeClass('active');
                    $editSource.addClass('active');
                }

                this.$('.btn-add-content').css({visibility: mode == 'edit' ? '' : 'hidden'});
                this.$('.edit-done')[state.get('dirty') ? 'removeClass' : 'addClass']('disabled');

                this.deferreds.scheduledView.then(function() {
                    var isScheduled = this.model.scheduledView.entry.content.get('is_scheduled');
                    if (isScheduled) {
                        this.$('.add-form').addClass('disabled').tooltip({
                            animation: false,
                            placement: 'bottom',
                            title: _("You must unschedule this dashboard to add form fields. To do this, use the \"Schedule PDF Delivery\" link in the Export menu.").t()
                        });
                    } else {
                        this.$('.add-form').removeClass('disabled').tooltip('destroy');
                    }
                }.bind(this));
            },
            template: '\
                 <span class="dashboard-edit-controls">\
                    <h2 class="toolbar-label">\
                        <%- _("Edit Dashboard").t() %>\
                    </h2>\
                    <div class="btn-group edit-mode-toggle">\
                        <div class="btn-group btn-group-radio shared-controls-syntheticradiocontrol">\
                            <button class="btn edit-ui"><%- _("UI").t() %></button>\
                            <button class="btn edit-source"><%- _("Source").t() %></button>\
                        </div>\
                    </div>\
                    <div class="btn-group btn-add-content" add-content>\
                        <a class="btn add-panel" href="#"><i class="icon-plus"></i> <%- _("Add Panel").t() %></a>\
                        <a class="btn add-form" href="#"><i class="icon-plus"></i> <%- _("Add Input").t() %> <span class="caret"></span></a>\
                    </div>\
                    <a class="btn btn-primary edit-done pull-right" href="#"><%- _("Save").t() %></a>\
                    <a class="btn default edit-save-as pull-right" href="#"><%- _("Save as...").t() %></a>\
                    <a class="btn default edit-cancel pull-right" href="#"><%- _("Cancel").t() %></a>\
                </span>\
            '
        });
    }
);
