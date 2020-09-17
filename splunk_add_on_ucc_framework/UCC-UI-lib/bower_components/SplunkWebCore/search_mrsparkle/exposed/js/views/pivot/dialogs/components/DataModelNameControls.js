define([
            'underscore',
            'module',
            'views/Base',
            'views/shared/controls/ControlGroup',
            'views/shared/controls/TextControl',
            'views/shared/delegates/PairedTextControls',
            'util/datamodel/form_utils'
        ],
        function(
            _,
            module,
            BaseView,
            ControlGroup,
            TextControl,
            PairedTextControls,
            dataModelFormUtils
        ) {

    return BaseView.extend({

        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.children.modelDisplayNameControl = new TextControl({
                model: this.model.createDataModel,
                modelAttribute: 'displayName'
            });

            this.children.modelDisplayNameGroup = new ControlGroup({
                label: _('Model Title').t(),
                controlType: 'Text',
                controlClass: 'controls-block',
                controls: this.children.modelDisplayNameControl
            });

            this.children.modelNameControl = new TextControl({
                model: this.model.createDataModel,
                modelAttribute: 'modelName'
            });

            this.children.modelNameGroup = new ControlGroup({
                label: _('Model ID').t(),
                controlType: 'Text',
                controlClass: 'controls-block',
                controls: this.children.modelNameControl,
                tooltip: _('The ID is used as the filename on disk. Cannot be changed later.').t(),
                help: _('Can only contain letters, numbers and underscores.').t()
            });

            this.children.pairedControlsDelegate = new PairedTextControls({
                sourceDelegate: this.children.modelDisplayNameControl,
                destDelegate: this.children.modelNameControl,
                transformFunction: dataModelFormUtils.normalizeForID
            });
        },

        render: function() {
            this.children.modelDisplayNameGroup.render().appendTo(this.el);
            this.children.modelNameGroup.render().appendTo(this.el);
            return this;
        },

        disable: function() {
            this.children.modelDisplayNameControl.disable();
            this.children.modelNameControl.disable();
        }

    });

});