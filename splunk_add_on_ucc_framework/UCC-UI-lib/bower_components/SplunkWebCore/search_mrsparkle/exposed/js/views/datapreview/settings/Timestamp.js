define(
    [
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'contrib/text!views/datapreview/settings/Timestamp.html',
        'views/shared/controls/ControlGroup',
        'uri/route',
        'strftime' //no import
    ],
    function(
        _,
        Backbone,
        module,
        BaseView,
        timestampTemplate,
        ControlGroup,
        route
    ){
        return BaseView.extend({
            className: 'form form-horizontal timestamp',
            moduleId: module.id,
            template: timestampTemplate,
            events: {
                'change .timezoneSelect': 'onChangeTimezone'
            },
            initialize: function() {
                this.label = _('Presets').t();
                BaseView.prototype.initialize.apply(this, arguments);
                var self = this;

                this.children.timestampMode = new ControlGroup({
                    label: _("Extraction").t(),
                    controlType: 'SyntheticRadio',
                    className: 'control-group timestamp-mode',
                    controlOptions: {
                        modelAttribute: 'ui.timestamp.mode',
                        model: this.model.sourcetypeModel,
                        items: [
                            { label: _("Auto").t(), value: 'auto'},
                            { label: _("Current time").t(), value: 'current'},
                            { label: _("Advanced...").t(), value: 'advanced'}
                        ],
                        save: false
                    }
                });
                this.model.sourcetypeModel.on('change:ui.timestamp.mode', function(){
                    self.onSelectMode(self.model.sourcetypeModel.get('ui.timestamp.mode'));
                });

                var timeformatHelpLink = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'timeformat.preview'
                );

                var helpLinkString = _('A string in strptime() format that helps Splunk recognize timestamps. ').t() +
                    '<a class="external" target="_blank" href="' + timeformatHelpLink + '">' + _('Learn More').t() + '</a>';

                this.children.timestampFormat = new ControlGroup({
                    label: _("Timestamp format").t(),
                    controlType: 'Text',
                    help: helpLinkString,
                    controlOptions: {
                        modelAttribute: 'ui.timestamp.format',
                        model: this.model.sourcetypeModel,
                        save: false
                    }
                });

                this.children.timestampPrefix = new ControlGroup({
                    label: _("Timestamp prefix").t(),
                    controlType: 'Text',
                    help: _('Timestamp is always prefaced by a regex pattern eg: \\d+abc123\\d[2,4]').t(),
                    controlOptions: {
                        modelAttribute: 'ui.timestamp.prefix',
                        model: this.model.sourcetypeModel,
                        save: false
                    }
                });

                this.children.timestampLookahead = new ControlGroup({
                    label: _("Lookahead").t(),
                    controlType: 'Text',
                    help: _('Timestamp never extends more than this number of characters into the event, or past the Regex if specified above.').t(),
                    controlOptions: {
                        modelAttribute: 'ui.timestamp.lookahead',
                        model: this.model.sourcetypeModel,
                        save: false
                    }
                });

                this.children.timestampFields = new ControlGroup({
                    label: _("Timestamp fields").t(),
                    controlType: 'Text',
                    help: _('Specify all the fields which constitute the timestamp. ex: field1,field2,...,fieldn').t(),
                    controlOptions: {
                        modelAttribute: 'ui.timestamp.fields',
                        model: this.model.sourcetypeModel,
                        save: false
                    }
                });

                this.model.sourcetypeModel.on('change:ui.timestamp.timezone', function(sourcetypeModel, value, options){
                    if(options && options.setby === self.moduleId){
                        return;
                    }
                    self.setTimezoneInput.call(self);
                });

                this.model.sourcetypeModel.on('sync', function(){
                    self.setTimezoneInput();
                });

                if(this.model.sourcetypeModel && this.model.sourcetypeModel.get('ui.timestamp.mode')){
                    this.onSelectMode(this.model.sourcetypeModel.get('ui.timestamp.mode'));
                }else{
                    this.onSelectMode('auto');
                }


            },
            render: function() {
                _.each(this.children, function(child){
                    child.detach();
                });

                this.$el.html(this.compiledTemplate({_:_}));
                var form = this.$el.find('.form');

                _.each(this.children, function(child){
                    form.append(child.render().el);
                });

                var tzInput = this.$('.control-timezone');
                this.$('.timestamp-mode').after( tzInput );

                this.setTimezoneInput();

                var timestampMode = this.model.sourcetypeModel.get('ui.timestamp.mode');
                if(timestampMode === 'advanced'){
                    tzInput.show();
                }else{
                    tzInput.hide();
                }

                return this;
            },
            setTimezoneInput: function(value){
                value = value || this.model.sourcetypeModel.get('ui.timestamp.timezone');
                if(typeof value === 'string'){
                    this.$('.timezoneSelect').val(value);
                }
            },
            onChangeTimezone: function(){
                var val = this.$('.timezoneSelect').val();
                this.model.sourcetypeModel.set({'ui.timestamp.timezone': val}, {'setby': this.moduleId});
            },
            onSelectMode: function(mode){
                if(!mode){mode = 'auto';}

                var tzInput = this.$('.control-timezone');
                switch(mode){
                    case 'auto':
                        this.children.timestampFormat.$el.hide();
                        this.children.timestampPrefix.$el.hide();
                        this.children.timestampLookahead.$el.hide();
                        this.children.timestampFields.$el.hide();
                        tzInput.hide();

                    break;
                    case 'current':
                        this.children.timestampFormat.$el.hide();
                        this.children.timestampPrefix.$el.hide();
                        this.children.timestampLookahead.$el.hide();
                        this.children.timestampFields.$el.hide();
                        tzInput.hide();

                    break;
                    case 'advanced':
                        this.children.timestampFormat.$el.show();
                        this.children.timestampPrefix.$el.show();
                        this.children.timestampLookahead.$el.show();
                        this.children.timestampFields.$el.show();
                        tzInput.show();

                    break;
                    default:
                        this.children.timestampFormat.$el.show();
                        this.children.timestampPrefix.$el.show();
                        this.children.timestampLookahead.$el.show();
                        this.children.timestampFields.$el.show();
                        tzInput.show();
                    break;
                }

                if(this.model.sourcetypeModel.shouldUiExposeTimestampFieldSetting()){
                    this.children.timestampPrefix.$el.hide();
                    this.children.timestampLookahead.$el.hide();
                }else{
                    this.children.timestampFields.$el.hide();
                }

            }
        });
    }
);
