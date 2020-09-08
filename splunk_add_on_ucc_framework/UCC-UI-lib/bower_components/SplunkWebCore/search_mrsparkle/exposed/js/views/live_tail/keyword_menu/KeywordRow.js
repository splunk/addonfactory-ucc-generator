define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/controls/ColorPickerControl',
        'views/shared/delegates/Accordion',
        'views/live_tail/keyword_menu/Alarms',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        ColorPicker,
        Accordion,
        AlarmsView,
        ControlGroup,
        FlashMessages
        ){

        var KEYWORD_COLOR_OPTIONS = [
            '#1e93c6', '#3863a0', '#a2cc3e',
            '#d6563c', '#f2b827', '#ed8440',
            '#cc5068', '#6a5c9e', '#11a88b'
        ];

        return BaseView.extend({
            moduleId: module.id,
            className: 'livetail-keyword-row collapsible-group',
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.accordion = new Accordion({
                    el: this.el,
                    group: ".collapsible-group",
                    toggle: ".collapsible-toggle",
                    body: ".collapsible-body",
                    icon: ".icon-collapsible-toggle",
                    inactiveIconClass: "icon-chevron-right",
                    activeIconClass: "icon-chevron-down",
                    collapsible: true
                });

                this.children.colorPicker = new ColorPicker({
                    model: this.model.keyword.entry.content,
                    modelAttribute: 'color',
                    paletteColors: KEYWORD_COLOR_OPTIONS,
                    clickSwatchApply: true
                });

                this.children.enabled = new ControlGroup({
                    controlType:'SyntheticCheckbox',
                    className: 'enabled-checkbox',
                    controlOptions: {
                        model: this.model.keyword.entry.content,
                        modelAttribute: 'enabled'
                    }
                });

                this.children.flashMessages = new FlashMessages();
                this.errorID = this.model.keyword.getName() + 'input_error';
                this.children.alarmsView = new AlarmsView({
                    model: {
                        keyword: this.model.keyword
                    }
                });
                this.activate({deep: true});
            },

            events: {
            'keyup .keyword-input': function() {
                    var inputValue = this.$('.keyword-input').val().trim();
                    this.clearError();
                    this.trigger('updateKeyword', this, this.model.keyword, inputValue);
                },
                'click .remove-keyword': function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.trigger('removeKeyword');
                }
            },

            showError: function(errorMsg) {
                this.children.flashMessages.flashMsgHelper.addGeneralMessage(this.errorID, {
                    type: 'error',
                    html: errorMsg || 'Error'
                });
            },

            clearError: function() {
                this.children.flashMessages.flashMsgHelper.removeGeneralMessage(this.errorID);
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _,
                    keyword: this.model.keyword.getKeyword()
                }));

                this.children.enabled.render().insertBefore(this.$('.keyword-input-container'));
                this.children.colorPicker.render().insertAfter(this.$('.keyword-input-container'));

                this.children.alarmsView.render().appendTo(this.$('.collapsible-body'));
                this.$('.keyword-error').html(this.children.flashMessages.render().el);
                return this;
            },

            template: '\
                <div class="livetail-keyword-container">\
                    <div class="keyword-input-container">\
                        <input type="text" class="keyword-input" value="<%- keyword %>" placeholder="<%- _("String to highlight").t() %>">\
                        <div class="keyword-error"></div>\
                    </div>\
                    <a class="remove-keyword"><i class="icon icon-x-circle"></i></a>\
                    <div class="livetail-alarms-container collapsible-heading">\
                        <a class="collapsible-toggle" href="#">\
                            <i class="icon-collapsible-toggle icon-chevron-right"></i>\
                        </a>\
                        <div class="collapsible-body" style="display: none"></div>\
                    </div>\
                </div>\
            '
        });
    }
);