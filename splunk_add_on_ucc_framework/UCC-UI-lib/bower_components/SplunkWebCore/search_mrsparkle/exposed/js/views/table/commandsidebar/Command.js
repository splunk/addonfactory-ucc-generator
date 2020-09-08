define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/table/modals/FieldRemovalDialog',
        'splunk.util'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        FieldRemovalDialog,
        splunkUtil
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'li',
            className: 'command',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            events: {
                'click .btn-command:not(".disabled, .active")': function(e) {
                    this.handleCommandSelected();
                    e.preventDefault();
                },
                'click .btn-command.disabled': function(e) {
                    e.preventDefault();
                },
                'click .btn-command.active': function(e) {
                    e.preventDefault();
                },
                'click .btn-remove': function(e) {
                    e.preventDefault();
                    this.handleRemove();
                }
            },
            
            handleRemove: function() {
                var callback = function(options) {
                        this.model.command.trigger('commandRemoved', this.model.command, options);
                    }.bind(this),
                    challengeFields,
                    newFieldGuids;

                // If the command is complete, get any new fields being created
                if (this.model.command.isComplete()) {
                    newFieldGuids = this.model.command.getAddedColumnGuids();
                    
                    if (newFieldGuids && newFieldGuids.length) {
                        // Check to see if any of the newly created fields are being used in a later command
                        challengeFields = this.model.table.commands.validateSubsequentCommands(newFieldGuids, this.getIndex());
                        
                        if (challengeFields && challengeFields.length) {
                            this.children.fieldRemovalDialog && this.children.fieldRemovalDialog.remove();
                            this.children.fieldRemovalDialog = new FieldRemovalDialog({
                                fields: _.invoke(challengeFields, 'get', 'name'),
                                isCommandRemoval: true
                            });
                            this.children.fieldRemovalDialog.render().appendTo($('body')).show();
                            this.listenTo(this.children.fieldRemovalDialog, 'accepted', function() {
                                callback({
                                    newFieldGuids: newFieldGuids
                                });
                            });

                            return;
                        }
                    }

                    callback();
                } else {
                    callback();
                }
            },

            makeError: function() {
                this.$commandButton && this.$commandButton.addClass('error');
            },

            makeActive: function() {
                this.$commandButton && this.$commandButton.addClass('active');
            },

            getDisplayText: function() {
                if (splunkUtil.normalizeBoolean(this.model.table.entry.content.get('display.prefs.showSPL'))) {
                    return this.model.command.getDisplaySPL({ skipValidation: true });
                }
                
                return this.model.command.getDisplayName();
            },

            handleCommandSelected: function() {
                this.model.table.entry.content.set({
                    'dataset.display.currentCommand': this.getIndex(),
                    'dataset.display.showEditor': '1'
                });
            },

            getIndex: function() {
                return this.model.command.collection ?
                    this.model.command.collection.indexOf(this.model.command) :
                    this.model.table.getCurrentCommandIdx();
            },

            render: function() {
                if (this.options.shouldDisable) {
                    this.$el.html(_.template(this.disabledCommandTemplate));
                } else {
                    this.$el.html(_.template(this.normalCommandTemplate));
                }
                this.$commandButton = this.$('.btn-command');

                this.$commandButton.append(_.template(this.commandContentTemplate, {
                    _: _,
                    displayText: this.getDisplayText(),
                    showSPL: splunkUtil.normalizeBoolean(this.model.table.entry.content.get('display.prefs.showSPL')),
                    isComplete: this.model.command.isComplete()
                }));

                this.$el.append(_.template(this.removeTemplate, {
                    isBase: this.model.command.isBaseCommand()
                }));
                
                if (this.model.table.getCurrentCommandIdx() === this.getIndex()) {
                    this.makeActive();
                } else if (!this.model.command.isComplete() || this.model.command.validate()) {
                    this.makeError();
                }

                return this;
            },

            disabledCommandTemplate: '\
                <div class="btn-command disabled">\
                </div>\
            ',

            normalCommandTemplate: '\
                <a href="#" class="btn-command">\
                </a>\
            ',

            commandContentTemplate: '\
                <%- displayText %>\
                <% if (showSPL && !isComplete) { %>\
                    <i class="incomplete-spl"><%- _("incomplete").t() %></i>\
                <% } %>\
            ',

            removeTemplate: '\
                <% if (!isBase) { %>\
                    <a href="#" class="btn-remove">\
                        <i class="icon-x"></i>\
                    </a>\
                <% } %>\
            '
        });
    }
);
