define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseView,
        ControlGroup
    ){
        return BaseView.extend({
            moduleId: module.id,
            className: 'form form-horizontal eventBreaks',
            initialize: function() {
                this.label = _('Presets').t();
                BaseView.prototype.initialize.apply(this, arguments);
                var model = this.model.sourcetypeModel;

                this.children.eventBreakMode = new ControlGroup({
                    label: _("Break Type").t(),
                    controlType: 'SyntheticRadio',
                    className: 'control-group',
                    controlOptions: {
                        modelAttribute: 'ui.eventbreak.mode',
                        model: model,
                        items: [
                            { label: _("Auto").t(), value: 'auto', tooltip: _('Event breaks are auto detected based on timestamp location.').t() },
                            { label: _("Every Line").t(), value: 'everyline', tooltip: _('Every line is one event.').t() },
                            { label: _("Regex...").t(), value: 'regex', tooltip: _('Use pattern to split events.').t() }
                        ],
                        save: false
                    }
                });

                this.children.regexPattern = new ControlGroup({
                    label: _("Pattern").t(),
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'ui.eventbreak.regex',
                        model: model,
                        save: false
                    }
                });

                this.setRegexDisplay();
                this.activate();
            },
            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }

                this.model.sourcetypeModel.on('change:ui.eventbreak.mode', function(){
                    this.setRegexDisplay();
                }.bind(this));

                return BaseView.prototype.activate.apply(this, arguments);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return BaseView.prototype.deactivate.apply(this, arguments);
                }
                BaseView.prototype.deactivate.apply(this, arguments);

                this.model.sourcetypeModel.off(null, null, this);

                return this;
            },
            setRegexDisplay: function(){
                if(this.model.sourcetypeModel.get('ui.eventbreak.mode') === 'regex'){
                    this.model.sourcetypeModel.set('ui.eventbreak.regexmode', 'before');
                    this.children.regexPattern.show();
                }else{
                    this.model.sourcetypeModel.unset('ui.eventbreak.regexmode');
                    this.children.regexPattern.hide();
                }
            },
            render: function() {
                this.$el.append(this.children.eventBreakMode.render().el);
                var indent = $('<div class="form-indent-section"></div>');
                indent.append(this.children.regexPattern.render().el);
                this.$el.append(indent);
                return this;
            }
        });
    }
);
