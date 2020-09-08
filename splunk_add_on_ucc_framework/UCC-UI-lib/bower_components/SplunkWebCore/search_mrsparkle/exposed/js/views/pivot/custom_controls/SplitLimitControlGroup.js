define([
            'underscore',
            'module',
            'views/shared/controls/ControlGroup',
            'views/shared/controls/Control'
        ],
        function(
            _,
            module,
            ControlGroup,
            Control
        ) {

    return ControlGroup.extend({

        moduleId: module.id,

        initialize: function(options) {
            var showGroupOthersControl = options.elementType === 'column' && !(options.dataType in { 'boolean': true, timestamp: true });
            this.options.label = options.label || _('Limit').t();
            this.options.helpClass = 'pivot-inspector-help-text';
            this.options.help = ' ';
            this.options.controlClass = showGroupOthersControl ? 'controls-fill' : '';
            this.options.controls = [
                {
                    type: 'Text',
                    options: {
                        model: this.model,
                        modelAttribute: options.elementType === 'row' ? 'rowLimitAmount' : 'colLimitAmount',
                        inputClassName: showGroupOthersControl ? 'input-small' : 'input-medium'
                    }
                }
            ];
            if(showGroupOthersControl) {
                this.options.controls[0].options.className = Control.prototype.className + ' input-append';
                this.options.controls.push({
                    type: 'SyntheticSelect',
                    options: {
                        className: Control.prototype.className + ' input-append',
                        model: this.model,
                        modelAttribute: 'showOtherCol',
                        toggleClassName: 'btn',
                        menuWidth: 'narrow',
                        items: [
                            {
                                label: _('Group Others').t(),
                                value: 'true'
                            },
                            {
                                label: _('Hide Others').t(),
                                value: 'false'
                            }
                        ],
                        popdownOptions: { detachDialog: true }
                    }
                });
            }
            ControlGroup.prototype.initialize.call(this, this.options);
        },

        disable: function(message) {
            this.$('.pivot-inspector-help-text').text(message).css('display', 'block');
            ControlGroup.prototype.disable.apply(this, arguments);
        },

        enable: function() {
            this.$('.pivot-inspector-help-text').text('').css('display', 'none');
            ControlGroup.prototype.enable.apply(this, arguments);
        }

    });

});