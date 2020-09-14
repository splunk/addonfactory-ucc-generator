define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        ControlGroup
    ){
        return BaseView.extend({
            moduleId: module.id,
            className: 'livetail-alarms',
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.screenFlashCheckbox = new ControlGroup({
                    controlType:'SyntheticCheckbox',
                    className: 'flash',
                    label: _('Flash screen').t(),
                    controlOptions: {
                        model: this.model.keyword.entry.content,
                        modelAttribute: 'flash'
                    }
                });

                this.children.soundCheckbox = new ControlGroup({
                    controlType:'SyntheticCheckbox',
                    className: 'play-sound',
                    controlOptions: {
                        model: this.model.keyword.entry.content,
                        modelAttribute: 'playsound'
                    }
                });

                this.children.soundSelector = new ControlGroup({
                    controlType:'SyntheticSelect',
                    className: 'sound',
                    label: _('Play sound').t(),
                    controlOptions: {
                        items: [
                            {
                                label: _('Ding').t(),
                                value: 'ding'
                            },
                            {
                                label: _('Airhorn').t(),
                                value: 'airhorn'
                            },
                            {
                                label: _('Alarm').t(),
                                value: 'alarm'
                            }
                        ],
                        model: this.model.keyword.entry.content,
                        modelAttribute: 'sound',
                        toggleClassName: 'btn',
                        menuWidth: 'narrow'
                    }
                });

                this.children.thresholdControl = new ControlGroup({
                    controlType:'Text',
                    className: 'threshold-input',
                    controlOptions: {
                        model: this.model.keyword.entry.content,
                        modelAttribute: 'threshold',
                        updateOnKeyUp: true,
                        trimTrailingSpace: true
                    }
                });
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _
                }));
                this.children.soundCheckbox.render().prependTo(this.$('.sound-container'));
                this.children.soundSelector.render().appendTo(this.$('.sound-container'));
                this.children.screenFlashCheckbox.render().prependTo(this.$('.screen-flash-container'));
                this.children.thresholdControl.render().appendTo(this.$('.threshold-container'));

                return this;
            },

            template: '\
                <div class="threshold-text">\
                    <%- _("When more than").t() %> <div class="threshold-container"></div> <%- _("results is reached").t() %>:\
                </div>\
                <div class="screen-flash-container"></div>\
                <div class="sound-container"></div>\
            '
        });
    }
);