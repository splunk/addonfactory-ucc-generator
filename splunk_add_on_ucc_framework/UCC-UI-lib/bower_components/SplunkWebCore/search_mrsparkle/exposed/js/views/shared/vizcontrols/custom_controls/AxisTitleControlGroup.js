/**
 * @author sfishel
 *
 * A custom sub-class of ControlGroup for pivot config forms label inputs.
 *
 * Renders a text input control for the label with the model's default label as placeholder text.
 */

define([
            'underscore',
            'module',
            'models/Base',
            'views/shared/controls/ControlGroup',
            'views/shared/controls/Control'
        ],
        function(
            _,
            module,
            BaseModel,
            ControlGroup,
            Control
        ) {

    return ControlGroup.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param options {Object} {
         *     model {Model} the model to operate on
         *     axisType {axisTitleX | axisTitleY | axisTitleY2} the charting attribute namespace
         * }
         */

        initialize: function() {
            this.axisTitleVisibilityAttr = 'display.visualizations.charting.' + this.options.axisType + '.visibility';
            this.axisTitleTextAttr = 'display.visualizations.charting.' + this.options.axisType + '.text';

            // we are simulating the experience of being able to set three possible title states: default, custom, or none
            // these do not map directly to visualization attributes, so we use an in-memory model to mediate
            this.titleStateModel = new BaseModel();
            this.setInitialTitleState();

            // store an in-memory copy of the most recent axis title text, since we might have to clear it to get the 'default' behavior
            this.axisTitleText = this.model.get(this.axisTitleTextAttr);

            this.options.label = _('Title').t();
            this.options.controlClass = 'controls-block';
            this.options.controls = [
                {
                    type: 'SyntheticSelect',
                    options: {
                        className: Control.prototype.className + ' input-prepend',
                        model: this.titleStateModel,
                        modelAttribute: 'state',
                        toggleClassName: 'btn',
                        menuWidth: 'narrow',
                        items: [
                            { value: 'default', label: _('Default').t() },
                            { value: 'custom', label: _('Custom').t() },
                            { value: 'none', label: _('None').t() }
                        ]
                    }
                },
                {
                    type: 'Text',
                    options: {
                        className: Control.prototype.className + ' input-prepend',
                        model: this.model,
                        modelAttribute: this.axisTitleTextAttr,
                        inputClassName: this.options.inputClassName
                    }
                }
            ];
            ControlGroup.prototype.initialize.call(this, this.options);
            // set up references to each control
            this.showHideControl = this.childList[0];
            this.labelControl = this.childList[1];

            this.titleStateModel.on('change:state', this.handleTitleState, this);
            this.model.on('change:' + this.axisTitleTextAttr, function() {
                // ignore this change event if the title state is in default mode
                // since the title text will have been artificially set to ''
                if(this.titleStateModel.get('state') !== 'default') {
                    this.axisTitleText = this.model.get(this.axisTitleTextAttr);
                }
            }, this);
        },

        setInitialTitleState: function() {
            if(this.model.get(this.axisTitleVisibilityAttr) === 'collapsed') {
                this.titleStateModel.set({ state: 'none' });
            }
            else if(this.model.get(this.axisTitleTextAttr)) {
                this.titleStateModel.set({ state: 'custom' });
            }
            else {
                this.titleStateModel.set({ state: 'default' });
            }
        },

        render: function() {
            ControlGroup.prototype.render.apply(this, arguments);
            this.handleTitleState();
            return this;
        },

        handleTitleState: function() {
            var state = this.titleStateModel.get('state'),
                setObject = {};

            if(state === 'none') {
                setObject[this.axisTitleVisibilityAttr] = 'collapsed';
                this.hideTitleTextInput();
            }
            else if(state === 'custom') {
                setObject[this.axisTitleVisibilityAttr] = 'visible';
                setObject[this.axisTitleTextAttr] = this.axisTitleText;
                this.showTitleTextInput();
            }
            else {
                // state == 'default'
                setObject[this.axisTitleVisibilityAttr] = 'visible';
                setObject[this.axisTitleTextAttr] = '';
                this.hideTitleTextInput();
            }
            this.model.set(setObject);
        },

        showTitleTextInput: function() {
            this.labelControl.insertAfter(this.showHideControl.$el);
            this.showHideControl.$el.addClass('input-prepend');
        },

        hideTitleTextInput: function() {
            this.labelControl.detach();
            this.showHideControl.$el.removeClass('input-prepend');
        }

    },
    {
        X_AXIS: 'axisTitleX',
        Y_AXIS: 'axisTitleY',
        Y_AXIS_2: 'axisTitleY2'
    });

});
