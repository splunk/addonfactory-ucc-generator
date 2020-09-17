define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/table/commandsidebar/Command',
        'views/shared/controls/SyntheticRadioControl',
        './Master.pcss',
        'uri/route',
        'splunk.util'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        CommandView,
        SyntheticRadioControl,
        css,
        route,
        splunkUtil
    ) {
        return BaseView.extend({
            moduleId: module.id,

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this._scrollTop = 0;

                this.children.splRadio = new SyntheticRadioControl({
                    model: this.model.table.entry.content,
                    modelAttribute: 'display.prefs.showSPL',
                    items: [
                        {
                            label: _('Commands').t(),
                            value: '0'
                        },
                        {
                            label: _('SPL').t(),
                            value: '1'
                        }
                    ]
                });
            },

            startListening: function() {
                this.listenTo(this.model.table.commands, 'commandRemoved', this.handleCommandRemoved);
                this.listenTo(this.model.table.entry.content, 'change:display.prefs.showSPL', this.renderCommands);
            },

            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }

                this.render();

                this.setRouteForSearch();

                return BaseView.prototype.activate.apply(this, arguments);
            },

            onAddedToDocument: function(options) {
                this.adjustScroll();

                BaseView.prototype.onAddedToDocument.apply(this, arguments);
            },

            onRemovedFromDocument: function() {
                this.$('ul.nav-commands').off('scroll');

                BaseView.prototype.onRemovedFromDocument.apply(this, arguments);
            },

            handleCommandRemoved: function(removedCmdModel, options) {
                this.model.table.commands.remove(removedCmdModel, options);
            },

            removeActiveHighlight: function() {
                this.$('li.command').children('a.btn-command').removeClass('active');
            },

            getCommandsList: function() {
                var shouldDisable = false;

                return this.model.table.commands.map(function(cmd) {
                    var newCommand = this.createNewCommand(cmd, shouldDisable);

                    if ((!cmd.isValid() || !cmd.isComplete()) && !shouldDisable) {
                        shouldDisable = true;
                    }

                    return newCommand;
                }.bind(this));
            },

            createNewCommand: function(model, shouldDisable) {
                return new CommandView({
                    model: {
                        command: model,
                        table: this.model.table,
                        application: this.model.application,
                        state: this.model.state
                    },
                    shouldDisable: shouldDisable
                });
            },

            renderCommands: function() {
                // Remove existing commands
                _(this.children.commands).each(function(cmd) {
                    cmd.deactivate({deep: true}).remove();
                }, this);

                // Get the new commands
                this.children.commands = this.getCommandsList();

                // Render them
                _(this.children.commands).each(function(cmd, idx) {
                    cmd.render().appendTo(this.$('.nav-commands'));
                }, this);

                this.updateOpenInSearchDisplayState();
            },
            
            adjustScroll: function() {
                var margin = 15, // bit of buffer for context
                    $listWrapper = this.$('ul.nav-commands'),
                    listWrapperHeight,
                    currentCommand,
                    commandTopPosition,
                    commandHeight,
                    differenceOutOfView;

                // Needs to be added to the document first
                if (!this.children.commands || !this.children.commands.length || !this.$el.closest('body').length) {
                    return;
                }

                $listWrapper.scrollTop(this._scrollTop);

                currentCommand = this.children.commands[this.model.table.getCurrentCommandIdx() || 0];
                listWrapperHeight = $listWrapper.height();
                commandTopPosition = currentCommand.$el.position().top;
                commandHeight = Math.min(currentCommand.$el.height(), listWrapperHeight - margin);
                differenceOutOfView = commandTopPosition + commandHeight - listWrapperHeight + margin;

                // If the current command is out of view, then we scroll to it.
                if (differenceOutOfView > 0) {
                    $listWrapper.scrollTop(this._scrollTop + differenceOutOfView);
                }
            },

            setRouteForSearch: function() {
                var currentCommand = this.model.table.getCurrentCommandModel(),
                    currentColumns = currentCommand ? currentCommand.columns.pluck('name') : [],
                    searchHref = route.search(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        {
                            data: {
                                q: this.model.table.getFullSearch(),
                                'display.events.fields': JSON.stringify(_(currentColumns).reject(function(fieldName) {
                                    // Strip out underscore fields
                                    return fieldName.charAt(0) === '_';
                                }))
                            }
                        }
                    );

                this.$('a.search-link').attr('href', searchHref);
            },

            updateOpenInSearchDisplayState: function() {
                if (this.model.table.entry.content.get('display.prefs.showSPL') === '1') {
                    this.$('.search-link').css('display', '');
                } else {
                    this.$('.search-link').css('display', 'none');
                }
            },

            render: function() {
                if (!this.$el.html()) {
                    this.$el.html(this.compiledTemplate({
                        _: _
                    }));
                    this.children.splRadio.render().insertBefore(this.$('.nav-commands'));

                    this.$('ul.nav-commands').on('scroll', function(event) {
                        this._scrollTop = event.currentTarget.scrollTop;
                    }.bind(this));

                    $(_.template(this.searchLink, {
                        _: _
                    })).insertAfter(this.$('.nav-commands'));
                }

                this.renderCommands();
                this.adjustScroll();
                this.updateOpenInSearchDisplayState();

                return this;
            },

            template: '\
                <ul class="nav nav-commands"></ul>\
                ',
            searchLink: '\
                <a class="search-link" title="<%- _(\'Open in Search\').t() %>" href="#" style="display: none;">\
                    <span><%- _("Open in Search").t() %></span>\
                </a>'
        });
    }
);
