define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/PopTart',
        'views/shared/controls/ControlGroup',
        'splunk.util'
    ],
    function(
        _,
        $,
        module,
        PopTartView,
        ControlGroup,
        splunkUtil
        ){
        return PopTartView.extend({
            moduleId: module.id,
            initialize: function(){
                PopTartView.prototype.initialize.apply(this, arguments);

                var userPrefModelAttrs = this.model.userPref.entry.content;

                // Setting defaults if user prefs is empty
                if (_.isUndefined(userPrefModelAttrs.get('display.prefs.livetail.font'))) {
                    userPrefModelAttrs.set('display.prefs.livetail.font', '12');
                }

                if (_.isUndefined(userPrefModelAttrs.get('display.prefs.livetail.wrap'))) {
                    this.model.userPref.entry.content.set('display.prefs.livetail.wrap', '1');
                }

                this.children.wrapResults = new ControlGroup({
                    controlType:'SyntheticCheckbox',
                    className: 'settings-checkbox',
                    label: _("Wrap results").t(),
                    controlOptions: {
                        model: userPrefModelAttrs,
                        modelAttribute: 'display.prefs.livetail.wrap'
                    }
                });

                this.children.fontPicker = new ControlGroup({
                    controlType:'SyntheticSelect',
                    className: 'settings-default',
                    controlClass: 'controls-block',
                    label: _("Font size").t(),
                    controlOptions: {
                        items: [
                            {value: '8'},
                            {value: '10'},
                            {value: '12'},
                            {value: '14'},
                            {value: '16'},
                            {value: '18'},
                            {value: '20'},
                            {value: '22'},
                            {value: '24'}
                        ],
                        model: userPrefModelAttrs,
                        modelAttribute: 'display.prefs.livetail.font',
                        toggleClassName: 'btn',
                        menuWidth: 'narrow'
                    }
                });

                this.children.linesPicker = new ControlGroup({
                    controlType:'SyntheticSelect',
                    className: 'settings-default',
                    controlClass: 'controls-block',
                    label: _("Show").t(),
                    controlOptions: {
                        items: [
                            {value: '500', label: _('Latest 500 events').t()},
                            {value: '1000', label: _('Latest 1000 events').t()},
                            {value: '2000', label: _('Latest 2000 events').t()},
                            {value: '3000', label: _('Latest 3000 events').t()}
                        ],
                        model: userPrefModelAttrs,
                        modelAttribute: 'display.prefs.livetail.lines',
                        toggleClassName: 'btn',
                        menuWidth: 'narrow'
                    }
                });
            },

            events: {
                'change .livetail-themes input[name=theme]': function(e) {
                    var theme = $(e.currentTarget).val();
                    this.setPref('theme', theme);
                }
            },

            startListening: function() {
                PopTartView.prototype.startListening.apply(this, arguments);

                this.listenTo(this.model.userPref.entry.content, 'change:display.prefs.livetail.wrap', function(prefs) {
                    this.trigger('updateWrap', splunkUtil.normalizeBoolean(prefs.get('display.prefs.livetail.wrap')));
                });
                this.listenTo(this.model.userPref.entry.content, 'change:display.prefs.livetail.font', function(prefs) {
                    this.trigger('updateFont', prefs.get('display.prefs.livetail.font'));
                });
                this.listenTo(this.model.userPref.entry.content, 'change:display.prefs.livetail.lines', function(prefs) {
                    this.trigger('updateLines', prefs.get('display.prefs.livetail.lines'));
                });
                this.listenTo(this.model.userPref.entry.content, 'change:display.prefs.livetail.theme', function(prefs) {
                    this.trigger('updateTheme', prefs.get('display.prefs.livetail.theme'));
                });
            },

            savePrefs: function() {
                this.model.userPref.save();
            },

            setPref: function(pref, value) {
                this.model.userPref.entry.content.set('display.prefs.livetail.' + pref, value);
            },

            render: function() {
                var html = this.compiledTemplate({
                        _: _
                    });

                this.$el.html(PopTartView.prototype.template_menu);
                this.$el.append(html);

                this.children.linesPicker.render().appendTo(this.$('.line-count'));
                this.children.fontPicker.render().appendTo(this.$('.font-size'));
                this.children.wrapResults.render().appendTo(this.$('.wrap-results'));

                var theme = this.model.userPref.entry.content.get('display.prefs.livetail.theme') || 'classic';
                this.$('.livetail-themes input[name=theme]').closest('#' + theme).attr('checked', true);

                return this;
            },

            template: '\
                <div class="settings-body">\
                    <div class="settings-section line-count"></div>\
                    <div class="settings-section font-size"></div>\
                    <div class="settings-section wrap-results"></div>\
                    <div class="settings-section">\
                        <div class="section-label"><%- _("Theme").t() %></div>\
                        <div class="livetail-themes">\
                            <input type="radio" name="theme" id="classic" value="classic" /><label for="classic" class="classic-theme"><%- _("Classic").t() %></label><br/>\
                            <input type="radio" name="theme" id="green" value="green" /><label for="green"  class="green-theme"><%- _("Green").t() %></label><br/>\
                            <input type="radio" name="theme" id="basic" value="basic" /><label for="basic"  class="basic-theme"><%- _("Basic").t() %></label>\
                        </div>\
                    </div>\
                </div>\
            '
        });
    }
);