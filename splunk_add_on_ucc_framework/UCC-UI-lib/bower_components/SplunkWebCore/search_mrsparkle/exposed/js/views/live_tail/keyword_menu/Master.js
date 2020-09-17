define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/live_tail/keyword_menu/KeywordRow',
        'models/livetail/Keyword',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'splunk.util'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        KeywordRow,
        KeywordModel,
        ControlGroup,
        FlashMessages,
        splunkUtil
        ){
        return BaseView.extend({
            moduleId: module.id,
            className: 'livetail-keyword-highlighting',
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.flashMessages = new FlashMessages();
                this.activate({deep: true});
            },

            events: {
                'click .close': function(e) {
                    e.preventDefault();
                    this.closeKeywords();
                },
                'click .open-settings': function(e) {
                    e.preventDefault();
                    this.trigger('openSettings');
                },
                'click .add-keyword': function(e) {
                    e.preventDefault();
                    this.addNewRow();
                },
                'click .save': function(e) {
                    e.preventDefault();
                    if (!$(e.currentTarget).hasClass('disabled')) {
                        this.saveKeywords();
                    }
                },
                'keydown .keywords-list': function(e) {
                    if (e.keyCode === 13) {
                        e.preventDefault();
                        return false;
                    }
                },
                'click .save-and-close-keywords': function(e) {
                    e.preventDefault();
                    this.closeKeywords();
                },
                'click .toggle-keyword-bar': function(e) {
                    e.preventDefault();
                    this.trigger('toggleKeywordBar');
                }
            },

            closeKeywords: function() {
                this.$el.removeClass('open');
            },

            openKeywords: function() {
                this.$el.addClass('open');
                this.$('.keywords-list .keyword-input').first().focus();
            },

            saveKeywords: function() {
                this.clearErrors();
                this.collection.keywords.each(function(keyword) {
                    this.saveKeyword(keyword);
                }, this);
            },

            saveKeyword: function(keywordModel) {
                if (keywordModel.entry.content.hasChanged()) {
                    var data = {};
                    if (keywordModel.isNew()) {
                        data = {
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner')
                        };
                    }
                    keywordModel.save({}, {
                        data: data,
                        success: function() {
                            this.$('.save').addClass('disabled');
                         }.bind(this),
                         error: function() {
                            var errorMsg = splunkUtil.sprintf('%s %s', _('Error saving keyword:').t(), keywordModel.getKeyword());
                            this.showError(keywordModel.getKeyword() + '_error', errorMsg);
                         }.bind(this)
                    });
                }
            },

            addNewRow: function() {
                // Add empty row if keyword collection is empty
                var newKeywordModel = new KeywordModel(),
                    data = {
                        keyphrase: '',
                        color: '0x1e93c6',
                        flash: 0,
                        playsound: 0,
                        sound: 'ding',
                        threshold: 0,
                        enabled: 1
                    };
                newKeywordModel.entry.content.set('name', newKeywordModel.cid);
                newKeywordModel.entry.content.set(data);
                this.collection.keywords.add(newKeywordModel);
                this.addRow(newKeywordModel);
                this.collection.keywords.trigger('update');
            },

            addRow: function(keywordModel) {
                var keywordRow = this.children['keyword_' + keywordModel.cid] = new KeywordRow({
                    model: {
                        keyword: keywordModel
                    }
                });
                this.addListeners(keywordRow);
                keywordRow.render().appendTo(this.$('.keywords-list'));
                this.saveKeyword(keywordModel);
            },

            removeRow: function(keywordRow) {
                var keywordModel = keywordRow.model.keyword,
                    rows = $('.livetail-keyword-row').length;

                if (this.collection.keywords.contains(keywordModel)) {
                    this.collection.keywords.remove(keywordModel);
                    this.collection.keywords.trigger('update');
                }

                keywordRow.remove();
                keywordModel.destroy();

                if (rows < 2) {
                    this.addNewRow();
                }
            },

            updateKeyword: function(keywordRow, keywordModel, inputValue) {
                if (inputValue !== keywordModel.getKeyword()) {
                    var duplicateKeyword = this._keywordDuplicate(inputValue);
                    if (duplicateKeyword) {
                        keywordRow.showError(_('Keyword already exists.').t());
                        return false;
                    }
                    keywordModel.entry.content.set({
                        keyphrase: _.escape(inputValue)
                    });
                    keywordModel.set('count', 0);
                }
            },

            updateSave: function() {
                if (this.$('.save').hasClass('disabled')) {
                    this.$('.save').removeClass('disabled');
                }
            },

            _keywordDuplicate: function(inputValue) {
                var dupe = this.collection.keywords.find(function(model) {
                        return (model.getKeyword() === inputValue);
                    });
                return dupe;
            },

            addListeners: function(keywordRow) {
                this.listenTo(keywordRow, 'removeKeyword', function() {
                    this.removeRow(keywordRow);
                });

                this.listenTo(keywordRow, 'updateKeyword', function(keywordRow, keywordModel, inputValue) {
                    this.updateKeyword(keywordRow, keywordModel, inputValue);
                });

                this.listenTo(keywordRow.model.keyword.entry.content, 'change', function() {
                    this.updateSave();
                });
            },

            renderList: function() {
                if (this.collection.keywords.length > 0) {
                    this.collection.keywords.each(function(keyword) {
                        this.addRow(keyword);
                    }, this);
                } else {
                    this.addNewRow();
                }
            },

            showError: function(errorID, errorMsg) {
                this.children.flashMessages.flashMsgHelper.addGeneralMessage(errorID, {
                    type: 'error',
                    html: errorMsg || 'Error'
                });
            },

            clearError: function(errorID) {
                this.children.flashMessages.flashMsgHelper.removeGeneralMessage(errorID);
            },

            clearErrors: function() {
                _.each(this.children.flashMessages.flashMsgHelper.generalMessages, function(error, errorKey) {
                    this.clearError(errorKey);
                }.bind(this));
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _
                }));
                this.renderList();
                this.$('.keywords-errors').html(this.children.flashMessages.render().el);
                return this;
            },

            template: '\
                <div class="sidebar-header">\
                    <%- _("Highlighting").t() %> <a class="close"></a>\
                </div>\
                <div class="sidebar-body">\
                    <form><div class="keywords-list"></div></form>\
                    <input type="button" class="btn add-keyword" value="+ <%- _("Add new").t() %>" />\
                    <br><br>\
                    <input type="button" class="btn btn-primary save disabled" value="<%- _("Save").t() %>" />\
                    <div class="keywords-errors"></div>\
                </div>\
            '
        });
    }
);